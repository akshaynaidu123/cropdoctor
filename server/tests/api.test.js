import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import sharp from "sharp";
import { createApp } from "../app.js";
import { loadConfig } from "../config.js";
import { HttpError } from "../errors.js";
import { MAX_IMAGE_BYTES } from "../../shared/cropAnalysis.js";
import { healthyReport, diseasedReport, uncertainReport, unsupportedReport } from "./fixtures.js";

const testConfig = () => loadConfig({ GEMINI_API_KEY: "test-only-not-a-real-key" });
async function serve(t, overrides = {}) {
  const server = createApp({
    config: testConfig(),
    analyzeImage: async () => healthyReport,
    ...overrides,
  }).listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  return `http://127.0.0.1:${server.address().port}`;
}
async function imageBuffer(format = "png") {
  return sharp({ create: { width: 32, height: 32, channels: 3, background: "green" } })
    .toFormat(format)
    .toBuffer();
}
function upload(buffer, type = "image/png", name = "crop.png", field = "image") {
  const form = new FormData();
  form.append(field, new Blob([buffer], { type }), name);
  return { method: "POST", body: form };
}

test("healthy, diseased, different-crop, uncertain and unsupported reports are passed through from the injected AI only", async (t) => {
  for (const report of [healthyReport, diseasedReport, uncertainReport, unsupportedReport]) {
    await t.test(report.status, async (t) => {
      let calls = 0;
      const base = await serve(t, {
        analyzeImage: async (image) => {
          calls++;
          assert.equal(image.mimeType, "image/jpeg");
          assert.equal((await sharp(image.buffer).metadata()).format, "jpeg");
          return report;
        },
      });
      const response = await fetch(
        `${base}/api/analyze-crop`,
        upload(await imageBuffer(), "image/png", "Tomato-Early-Blight.jpg"),
      );
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), report);
      assert.equal(calls, 1);
      assert.equal(response.headers.get("cache-control"), "no-store");
    });
  }
});

test("JPEG, PNG, and WebP files are accepted after decoding", async (t) => {
  const base = await serve(t);
  for (const [format, type] of [
    ["jpeg", "image/jpeg"],
    ["png", "image/png"],
    ["webp", "image/webp"],
  ]) {
    const response = await fetch(
      `${base}/api/analyze-crop`,
      upload(await imageBuffer(format), type),
    );
    assert.equal(response.status, 200, await response.text());
  }
});

test("missing, empty, disguised, MIME-mismatched, corrupt, GIF, oversize, and extra uploads are rejected before AI", async (t) => {
  let calls = 0;
  const base = await serve(t, {
    analyzeImage: async () => {
      calls++;
      return healthyReport;
    },
  });
  const png = await imageBuffer();
  const cases = [
    [new FormData(), 400],
    [upload(Buffer.alloc(0)).body, 400],
    [upload(Buffer.from("not an image"), "image/png").body, 415],
    [upload(png, "image/jpeg").body, 415],
    [upload(png.subarray(0, 24)).body, 422],
    [upload(Buffer.from("GIF89a"), "image/gif").body, 415],
    [upload(Buffer.alloc(MAX_IMAGE_BYTES + 1)).body, 413],
    [upload(png, "image/png", "crop.png", "wrongField").body, 400],
  ];
  for (const [body, expected] of cases) {
    const response = await fetch(`${base}/api/analyze-crop`, { method: "POST", body });
    assert.equal(response.status, expected, await response.text());
  }
  assert.equal(calls, 0);
});

test("malformed multipart requests get a useful 400 error", async (t) => {
  const base = await serve(t);
  const response = await fetch(`${base}/api/analyze-crop`, {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data; boundary=missing" },
    body: "broken",
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, "INVALID_UPLOAD");
});

test("missing or placeholder API key returns 503, health reveals no credentials", async (t) => {
  for (const key of ["", "your_api_key_here"]) {
    const base = await serve(t, { config: loadConfig({ GEMINI_API_KEY: key }) });
    const response = await fetch(`${base}/api/analyze-crop`, upload(await imageBuffer()));
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /GEMINI_API_KEY/);
    assert.deepEqual(await (await fetch(`${base}/api/health`)).json(), {
      ok: true,
      configured: false,
    });
  }
});

test("rate limits, timeouts, and API failures never become success reports", async (t) => {
  for (const status of [429, 502, 504]) {
    const base = await serve(t, {
      analyzeImage: async () => {
        throw new HttpError(status, "TEST_FAILURE", "Temporary failure. Retry later.");
      },
    });
    const response = await fetch(`${base}/api/analyze-crop`, upload(await imageBuffer()));
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), {
      code: "TEST_FAILURE",
      error: "Temporary failure. Retry later.",
    });
  }
});

test("invalid or semantically inconsistent model data is rejected", async (t) => {
  for (const report of [
    {},
    { ...healthyReport, confidence: 94 },
    { ...healthyReport, diseaseName: "Invented disease" },
    { ...uncertainReport, severity: "moderate" },
  ]) {
    const base = await serve(t, { analyzeImage: async () => report });
    const response = await fetch(`${base}/api/analyze-crop`, upload(await imageBuffer()));
    assert.equal(response.status, 502);
    assert.equal((await response.json()).code, "INVALID_AI_RESPONSE");
  }
});

test("CORS permits only configured origins and supports preflight", async (t) => {
  const base = await serve(t);
  const allowed = await fetch(`${base}/api/analyze-crop`, {
    method: "OPTIONS",
    headers: {
      Origin: "http://localhost:5173",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });
  assert.equal(allowed.status, 204);
  assert.equal(allowed.headers.get("access-control-allow-origin"), "http://localhost:5173");
  const rejected = await fetch(`${base}/api/health`, {
    headers: { Origin: "https://untrusted.example" },
  });
  assert.equal(rejected.status, 403);
  assert.equal(rejected.headers.get("access-control-allow-origin"), null);
});

test("local request limit is enforced", async (t) => {
  const base = await serve(t);
  for (let index = 0; index < 10; index++) {
    const response = await fetch(`${base}/api/analyze-crop`, { method: "POST" });
    assert.equal(response.status, 415);
    await response.text();
  }
  const response = await fetch(`${base}/api/analyze-crop`, { method: "POST" });
  assert.equal(response.status, 429);
  assert.equal((await response.json()).code, "REQUEST_LIMIT");
});

test("configuration rejects unsafe origins and invalid ports", () => {
  assert.throws(() => loadConfig({ PORT: "abc" }), /PORT/);
  assert.throws(() => loadConfig({ FRONTEND_ORIGIN: "*" }));
  assert.throws(
    () => loadConfig({ FRONTEND_ORIGIN: "https://example.com/path" }),
    /FRONTEND_ORIGIN/,
  );
});
