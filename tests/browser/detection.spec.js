import { test, expect } from "@playwright/test";
import sharp from "sharp";
import {
  healthyReport,
  diseasedReport,
  uncertainReport,
  unsupportedReport,
} from "../../server/tests/fixtures.js";

async function imageFile(name = "test-crop.png") {
  return {
    name,
    mimeType: "image/png",
    buffer: await sharp({ create: { width: 40, height: 40, channels: 3, background: "green" } })
      .png()
      .toBuffer(),
  };
}
async function selectImage(page, name) {
  await page.getByLabel("Choose crop image", { exact: true }).setInputFiles(await imageFile(name));
  await expect(page.getByAltText("Selected crop for analysis")).toBeVisible();
}
async function assertNoOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
}

test("healthy and different-crop reports appear only after analysis, with reset on replacement", async ({
  page,
}) => {
  const reports = [healthyReport, diseasedReport];
  let calls = 0;
  await page.route("**/api/analyze-crop", async (route) => {
    expect(route.request().headers()["content-type"]).toContain("multipart/form-data; boundary=");
    await route.fulfill({ json: reports[calls++] });
  });
  await page.goto("/detection");
  await expect(page.getByRole("button", { name: "Analyze image", exact: true })).toBeDisabled();
  await selectImage(page);
  await expect(page.getByRole("article")).toHaveCount(0);
  await page.getByRole("button", { name: "Analyze image", exact: true }).click();
  const report = page.getByRole("article", { name: "Crop assessment report" });
  await expect(report).toContainText("Rice");
  await expect(report.getByRole("heading", { name: "No obvious disease visible" })).toBeVisible();
  await expect(report).toContainText("medium (qualitative)");
  await expect(report).not.toContainText("%");
  await assertNoOverflow(page);
  await selectImage(page, "new-image.png");
  await expect(report).toHaveCount(0);
  await page.getByRole("button", { name: "Analyze image", exact: true }).click();
  await expect(report).toContainText("Maize");
  await expect(report.getByRole("heading", { name: "Possible leaf blight" })).toBeVisible();
  await expect(report).toContainText("Brown elongated lesions");
  expect(calls).toBe(2);
  await assertNoOverflow(page);
});

test("invalid upload, missing key, and retry never show a fake report", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/analyze-crop", async (route) => {
    calls++;
    if (calls === 1)
      await route.fulfill({
        status: 503,
        json: { error: "Set GEMINI_API_KEY in the backend .env file and restart npm run dev:api." },
      });
    else await route.fulfill({ json: healthyReport });
  });
  await page.goto("/detection");
  await page
    .getByLabel("Choose crop image", { exact: true })
    .setInputFiles({ name: "file.gif", mimeType: "image/gif", buffer: Buffer.from("GIF89a") });
  await expect(page.getByRole("alert")).toContainText("Choose a JPG");
  await page.getByLabel("Choose crop image", { exact: true }).setInputFiles({
    name: "huge.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(4 * 1024 * 1024 + 1),
  });
  await expect(page.getByRole("alert")).toContainText("4 MB");
  await expect(page.getByRole("article")).toHaveCount(0);
  expect(calls).toBe(0);
  await selectImage(page);
  await page.getByRole("button", { name: "Analyze image", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("GEMINI_API_KEY");
  await expect(page.getByRole("article")).toHaveCount(0);
  await page.getByRole("button", { name: "Retry analysis" }).click();
  await expect(page.getByRole("article")).toContainText("Rice");
  await assertNoOverflow(page);
});

test("API failure and malformed output remain errors; unsupported image gets no disease", async ({
  page,
}) => {
  let calls = 0;
  await page.route("**/api/analyze-crop", async (route) => {
    calls++;
    if (calls === 1)
      await route.fulfill({
        status: 502,
        json: { error: "The AI service is unavailable. Please retry." },
      });
    else if (calls === 2) await route.fulfill({ json: { cropName: "Fake incomplete report" } });
    else await route.fulfill({ json: unsupportedReport });
  });
  await page.goto("/detection");
  await selectImage(page);
  await page.getByRole("button", { name: "Analyze image", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("unavailable");
  await expect(page.getByRole("article")).toHaveCount(0);
  await page.getByRole("button", { name: "Retry analysis" }).click();
  await expect(page.getByRole("alert")).toContainText("invalid report");
  await expect(page.getByRole("article")).toHaveCount(0);
  await page.getByRole("button", { name: "Retry analysis" }).click();
  await expect(page.getByRole("heading", { name: "Image not supported" })).toBeVisible();
  await expect(page.getByRole("article")).not.toContainText("Blight");
  await assertNoOverflow(page);
});

test("duplicate submissions are disabled and uncertain results do not force a classification", async ({
  page,
}) => {
  let calls = 0;
  let complete;
  const pending = new Promise((resolve) => {
    complete = resolve;
  });
  await page.route("**/api/analyze-crop", async (route) => {
    calls++;
    await pending;
    await route.fulfill({ json: uncertainReport });
  });
  await page.goto("/detection");
  await selectImage(page);
  await page.getByRole("button", { name: "Analyze image", exact: true }).click();
  await expect(page.getByRole("button", { name: "Analyzing leaf" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Remove image" })).toBeDisabled();
  await expect(page.getByRole("article")).toHaveCount(0);
  complete();
  await expect(page.getByRole("heading", { name: "Unable to assess reliably" })).toBeVisible();
  await expect(page.getByRole("article")).toContainText("Unknown crop");
  await expect(page.getByRole("article")).toContainText("low (qualitative)");
  expect(calls).toBe(1);
  await assertNoOverflow(page);
  await page.getByRole("button", { name: "Remove image" }).click();
  await expect(page.getByRole("article")).toHaveCount(0);
});

test("camera input shares the same preview and analysis workflow", async ({ page }) => {
  await page.route("**/api/analyze-crop", (route) => route.fulfill({ json: healthyReport }));
  await page.goto("/detection");
  const camera = page.getByLabel("Capture crop image", { exact: true });
  await expect(camera).toHaveAttribute("capture", "environment");
  await camera.setInputFiles(await imageFile("captured-photo.png"));
  await expect(page.getByAltText("Selected crop for analysis")).toBeVisible();
  await page.getByRole("button", { name: "Analyze image", exact: true }).click();
  await expect(page.getByRole("article")).toContainText("Rice");
});

test("a platform upload rejection explains the production size limit", async ({ page }) => {
  await page.route("**/api/analyze-crop", (route) =>
    route.fulfill({ status: 413, contentType: "text/plain", body: "FUNCTION_PAYLOAD_TOO_LARGE" }),
  );
  await page.goto("/detection");
  await selectImage(page);
  await page.getByRole("button", { name: "Analyze image", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("4 MB");
  await expect(page.getByRole("article")).toHaveCount(0);
});

test("offline proxy and wrong frontend responses explain how to start both servers", async ({
  page,
}) => {
  await page.route("**/api/analyze-crop", (route) =>
    route.fulfill({ status: 500, contentType: "text/plain", body: "" }),
  );
  await page.goto("/detection");
  await selectImage(page);
  await page.getByRole("button", { name: "Analyze image", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("npm run dev to start both servers");
  await expect(page.getByRole("article")).toHaveCount(0);
});

test("API quota errors remain explicit and do not produce a diagnosis", async ({ page }) => {
  await page.route("**/api/analyze-crop", (route) =>
    route.fulfill({
      status: 429,
      json: {
        code: "AI_QUOTA_EXCEEDED",
        error:
          "The Google Gemini API project has no available quota. Check API billing, credits, and project usage limits.",
      },
    }),
  );
  await page.goto("/detection");
  await selectImage(page);
  await page.getByRole("button", { name: "Analyze image", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("no available quota");
  await expect(page.getByRole("article")).toHaveCount(0);
});

test("real backend configuration error reaches the browser through the Vite proxy", async ({
  page,
}) => {
  await page.goto("/detection");
  const health = await page.request.get("/api/health");
  expect(health.ok()).toBe(true);
  expect(await health.json()).toEqual({ ok: true, configured: false });
  await selectImage(page);
  await page.getByRole("button", { name: "Analyze image", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("GEMINI_API_KEY");
  await expect(page.getByRole("article")).toHaveCount(0);
});

test("existing pages render without JavaScript errors on this viewport", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of ["/", "/detection", "/assistant", "/weather", "/about"]) {
    await page.goto(path);
    await expect(page.getByRole("main").getByRole("heading").first()).toBeVisible();
    await assertNoOverflow(page);
  }
  expect(errors).toEqual([]);
});
