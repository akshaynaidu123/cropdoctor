import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { once } from "node:events";
import { parseArgs } from "node:util";
import { loadConfig } from "../server/config.js";
import { createApp } from "../server/app.js";
import { AnalysisSchema } from "../shared/cropAnalysis.js";

const { values } = parseArgs({
  options: {
    healthy: { type: "string" },
    diseased: { type: "string" },
    different: { type: "string" },
  },
});
const config = loadConfig();
if (!config.apiKey) {
  console.error("Live AI testing could not run: set GEMINI_API_KEY in the backend .env file.");
  process.exitCode = 1;
} else if (!values.healthy || !values.diseased || !values.different) {
  console.error(
    'Supply three real crop photos: npm run test:live -- --healthy "path.jpg" --diseased "path.jpg" --different "another-crop.jpg"',
  );
  process.exitCode = 1;
} else {
  // Exercise the real HTTP endpoint, image decoder, SDK, and model. No mocks.
  const server = createApp({ config }).listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const reports = [];
  try {
    for (const [label, path] of Object.entries(values)) {
      const types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
      };
      const type = types[extname(path).toLowerCase()];
      if (!type) throw new Error("Use JPG, JPEG, PNG, or WebP photos.");
      const form = new FormData();
      // Do not send the dataset label or original filename to the model.
      form.append("image", new Blob([await readFile(path)], { type }), `crop${extname(path)}`);
      const response = await fetch(`${base}/api/analyze-crop`, {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(75_000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(`${response.status} ${result.code}: ${result.error}`);
      const report = AnalysisSchema.parse(result);
      reports.push({ label, report });
      console.log(
        JSON.stringify({
          test: label,
          status: report.status,
          cropName: report.cropName,
          diseaseName: report.diseaseName,
          confidenceLevel: report.confidenceLevel,
          symptoms: report.symptoms,
        }),
      );
      if (label === "healthy" && !["healthy", "uncertain"].includes(report.status))
        throw new Error(
          "Healthy-photo assessment needs manual review; it was not healthy or uncertain.",
        );
      if (label === "diseased" && !["diseased", "uncertain"].includes(report.status))
        throw new Error(
          "Diseased-photo assessment needs manual review; it was not diseased or uncertain.",
        );
    }
    const named = reports.map(({ report }) => report.cropName?.toLowerCase()).filter(Boolean);
    if (new Set(named).size < 2)
      console.warn(
        "Crop diversity was not demonstrated. Review the photos and uncertainty; do not claim multi-crop recognition passed.",
      );
    else
      console.log(
        "Live image requests completed and returned different crop identifications. This is a smoke test, not a disease-accuracy evaluation.",
      );
  } catch (error) {
    // Only locally constructed errors contain printable messages. No raw SDK errors are logged.
    console.error(
      error?.name === "ZodError"
        ? "The live report failed schema validation."
        : error instanceof Error
          ? error.message
          : "Live test failed.",
    );
    process.exitCode = 1;
  } finally {
    await new Promise((resolve) => {
      server.close(resolve);
      server.closeAllConnections();
    });
  }
}
