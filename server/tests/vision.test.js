import test from "node:test";
import assert from "node:assert/strict";
import { ApiError, GoogleGenAI } from "@google/genai";
import { createVisionService, VISION_PROMPT } from "../services/visionService.js";
import { healthyReport, diseasedReport } from "./fixtures.js";

const config = { apiKey: "test-only-not-a-real-key", model: "gemini-3.5-flash-lite" };
const image = { buffer: Buffer.from("test-image-bytes"), mimeType: "image/jpeg" };
const completed = (report) => ({
  candidates: [
    {
      finishReason: "STOP",
      content: {
        role: "model",
        parts: [{ text: JSON.stringify(report) }],
      },
    },
  ],
});

test("official Google SDK sends actual inline image bytes and structured JSON schema", async () => {
  let request;
  let requestUrl;
  const client = new GoogleGenAI({
    apiKey: config.apiKey,
    vertexai: false,
    httpOptions: {
      retryOptions: { attempts: 1 },
      fetch: async (url, init) => {
        requestUrl = String(url);
        request = JSON.parse(init.body);
        return new Response(JSON.stringify(completed(diseasedReport)), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  });
  const result = await createVisionService(config, client)(image);
  assert.deepEqual(result, diseasedReport);
  assert.match(requestUrl, /generativelanguage\.googleapis\.com/);
  assert.ok(requestUrl.includes(config.model));
  assert.equal(request.generationConfig.responseMimeType, "application/json");
  assert.equal(request.generationConfig.responseJsonSchema.type, "object");
  assert.equal(request.generationConfig.responseJsonSchema.additionalProperties, false);
  assert.ok(request.generationConfig.responseJsonSchema.required.includes("possibleCauses"));
  assert.deepEqual(request.contents[0].parts[1].inlineData, {
    mimeType: image.mimeType,
    data: image.buffer.toString("base64"),
  });
  assert.equal(request.systemInstruction.parts[0].text, VISION_PROMPT);
  assert.ok(!JSON.stringify(request).includes(config.apiKey));
  assert.ok(!requestUrl.includes(config.apiKey));
});

test("Gemini errors are mapped without exposing raw provider data", async () => {
  for (const [failure, status, code] of [
    [new ApiError({ status: 429, message: "SECRET RESOURCE_EXHAUSTED" }), 429, "AI_QUOTA_EXCEEDED"],
    [{ status: 401 }, 503, "AI_KEY_REJECTED"],
    [{ status: 403 }, 503, "AI_KEY_REJECTED"],
    [{ status: 400, message: "API_KEY_INVALID SECRET" }, 503, "AI_KEY_REJECTED"],
    [{ status: 404 }, 503, "AI_MODEL_UNAVAILABLE"],
    [{ status: 408 }, 504, "AI_TIMEOUT"],
    [{ status: 504 }, 504, "AI_TIMEOUT"],
    [{ status: 500 }, 502, "AI_UNAVAILABLE"],
    [{ name: "AbortError" }, 504, "AI_TIMEOUT"],
    [{ name: "TimeoutError" }, 504, "AI_TIMEOUT"],
    [new SyntaxError("SECRET"), 502, "INVALID_AI_RESPONSE"],
  ]) {
    const analyze = createVisionService(config, {
      models: {
        generateContent: async () => {
          throw failure;
        },
      },
    });
    await assert.rejects(
      analyze(image),
      (error) =>
        error.status === status && error.code === code && !error.message.includes("SECRET"),
    );
  }
});

test("safety blocks, incomplete output, malformed JSON, and contradictory reports never produce fallback reports", async () => {
  for (const [response, code] of [
    [{ promptFeedback: { blockReason: "SAFETY" } }, "AI_REFUSED_IMAGE"],
    [{ candidates: [{ finishReason: "SAFETY" }] }, "AI_REFUSED_IMAGE"],
    [
      { candidates: [{ finishReason: "MAX_TOKENS", content: { parts: [{ text: "{" }] } }] },
      "INCOMPLETE_AI_RESPONSE",
    ],
    [{ candidates: [] }, "INCOMPLETE_AI_RESPONSE"],
    [
      { candidates: [{ finishReason: "STOP", content: { parts: [{ text: "broken JSON" }] } }] },
      "INVALID_AI_RESPONSE",
    ],
    [completed({ ...healthyReport, diseaseName: "Invented disease" }), "INVALID_AI_RESPONSE"],
    [completed({ ...healthyReport, confidence: 94 }), "INVALID_AI_RESPONSE"],
  ]) {
    const analyze = createVisionService(config, {
      models: { generateContent: async () => response },
    });
    await assert.rejects(analyze(image), (error) => error.code === code);
  }
});

test("Gemini cancellation is forwarded and a missing key never calls the provider", async () => {
  const controller = new AbortController();
  const analyze = createVisionService(config, {
    models: {
      generateContent: async (request) => {
        assert.equal(request.config.abortSignal.aborted, true);
        throw new DOMException("Cancelled", "AbortError");
      },
    },
  });
  controller.abort();
  await assert.rejects(
    analyze(image, { signal: controller.signal }),
    (error) => error.code === "AI_TIMEOUT",
  );
  await assert.rejects(
    createVisionService({ apiKey: "", model: config.model })(image),
    (error) => error.code === "AI_NOT_CONFIGURED" && /GEMINI_API_KEY/.test(error.message),
  );
});
