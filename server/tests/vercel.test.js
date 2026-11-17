import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import sharp from "sharp";
import { loadConfig } from "../config.js";
import { healthyReport } from "./fixtures.js";
import { MAX_IMAGE_BYTES } from "../../shared/cropAnalysis.js";

async function importFunction(t, values, id) {
  const names = [
    "GEMINI_API_KEY",
    "GEMINI_MODEL",
    "VERCEL_URL",
    "VERCEL_BRANCH_URL",
    "VERCEL_PROJECT_PRODUCTION_URL",
    "FRONTEND_ORIGIN",
  ];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  for (const name of names) {
    if (values[name] === undefined) delete process.env[name];
    else process.env[name] = values[name];
  }
  const entry = await import(`../../api/index.js?test=${id}`);
  for (const name of names) {
    if (previous[name] === undefined) delete process.env[name];
    else process.env[name] = previous[name];
  }
  const server = http.createServer(entry.default).listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  return { base: `http://127.0.0.1:${server.address().port}`, entry };
}

test("Vercel entry serves health without a local .env key and explains missing production configuration", async (t) => {
  const { base, entry } = await importFunction(t, {}, "missing-key");
  assert.equal(entry.default.get("trust proxy"), 1);
  const response = await fetch(`${base}/api/health`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /application\/json/);
  assert.deepEqual(await response.json(), { ok: true, configured: false });
  const wrongMethod = await fetch(`${base}/api/analyze-crop`);
  assert.equal(wrongMethod.status, 405);
  assert.match(wrongMethod.headers.get("allow"), /POST/);
  const form = new FormData();
  form.append("image", new Blob(["test"], { type: "image/png" }), "leaf.png");
  const failed = await fetch(`${base}/api/analyze-crop`, { method: "POST", body: form });
  assert.equal(failed.status, 503);
  const error = await failed.json();
  assert.equal(error.code, "AI_NOT_CONFIGURED");
  assert.match(error.error, /Vercel/);
});

test("Vercel entry accepts real multipart image bytes, permits exact deployment origins, and reuses Gemini validation", async (t) => {
  const originalFetch = globalThis.fetch;
  let googleRequest;
  // Isolated transport stub: production entry and HTTP upload stay real.
  globalThis.fetch = async (url, init) => {
    if (String(url).startsWith("https://generativelanguage.googleapis.com/")) {
      googleRequest = JSON.parse(init.body);
      return new Response(
        JSON.stringify({
          candidates: [
            {
              finishReason: "STOP",
              content: {
                parts: [{ text: JSON.stringify(healthyReport) }],
                role: "model",
              },
            },
          ],
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }
    return originalFetch(url, init);
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });
  const { base } = await importFunction(
    t,
    {
      GEMINI_API_KEY: "test-only-not-a-real-key",
      GEMINI_MODEL: "gemini-3.5-flash-lite",
      VERCEL_URL: "cropdoctor-preview.vercel.app",
      VERCEL_PROJECT_PRODUCTION_URL: "cropdoctor-nu.vercel.app",
    },
    "configured",
  );
  const png = await sharp({ create: { width: 32, height: 32, channels: 3, background: "green" } })
    .png()
    .toBuffer();
  const form = new FormData();
  form.append("image", new Blob([png], { type: "image/png" }), "leaf.png");
  const response = await originalFetch(`${base}/api/analyze-crop`, {
    method: "POST",
    headers: { Origin: "https://cropdoctor-nu.vercel.app" },
    body: form,
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), healthyReport);
  assert.equal(
    response.headers.get("access-control-allow-origin"),
    "https://cropdoctor-nu.vercel.app",
  );
  assert.equal(googleRequest.contents[0].parts[1].inlineData.mimeType, "image/jpeg");
  const preview = await originalFetch(`${base}/api/health`, {
    headers: { Origin: "https://cropdoctor-preview.vercel.app" },
  });
  assert.equal(preview.status, 200);
  const untrusted = await originalFetch(`${base}/api/health`, {
    headers: { Origin: "https://untrusted.vercel.app" },
  });
  assert.equal(untrusted.status, 403);
  const missing = await originalFetch(`${base}/api/unknown`);
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).code, "NOT_FOUND");
  const alias = await new Promise((resolve, reject) => {
    const request = http.get(
      `${base}/api/health`,
      {
        headers: {
          Host: "custom-cropdoctor.example",
          "X-Forwarded-Proto": "https",
          Origin: "https://custom-cropdoctor.example",
        },
      },
      (response) => {
        response.resume();
        response.once("end", () => resolve(response));
      },
    );
    request.once("error", reject);
  });
  assert.equal(alias.statusCode, 200);
  assert.equal(alias.headers["access-control-allow-origin"], "https://custom-cropdoctor.example");
});

test("Vercel deployment domains stay exact and uploads leave room under the platform cap", () => {
  const config = loadConfig({
    VERCEL: "1",
    VERCEL_URL: "preview.vercel.app",
    VERCEL_BRANCH_URL: "branch.vercel.app",
    VERCEL_PROJECT_PRODUCTION_URL: "cropdoctor-nu.vercel.app",
  });
  assert.equal(config.isVercel, true);
  for (const name of ["preview.vercel.app", "branch.vercel.app", "cropdoctor-nu.vercel.app"])
    assert.ok(config.origins.includes(`https://${name}`));
  assert.ok(MAX_IMAGE_BYTES + 256 * 1024 < 4_500_000);
  assert.throws(
    () => loadConfig({ VERCEL: "1", VERCEL_URL: "untrusted.example/path" }),
    /FRONTEND_ORIGIN/,
  );
});
