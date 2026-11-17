import { GoogleGenAI } from "@google/genai";
import { loadConfig } from "../server/config.js";

const config = loadConfig();
if (!config.apiKey) {
  console.error("Set GEMINI_API_KEY in the backend .env file first.");
  process.exitCode = 1;
} else {
  const ai = new GoogleGenAI({
    apiKey: config.apiKey,
    vertexai: false,
    httpOptions: { timeout: 15_000, retryOptions: { attempts: 1 } },
  });
  try {
    const pager = await ai.models.list({ config: { pageSize: 100 } });
    const models = [];
    for await (const model of pager) {
      if (model.supportedActions?.includes("generateContent"))
        models.push(model.name.replace(/^models\//, ""));
    }
    console.log(
      JSON.stringify(
        {
          configuredModel: config.model,
          configuredModelAvailable: models.includes(config.model),
          generateContentModels: models,
        },
        null,
        2,
      ),
    );
    console.log(
      "Model listing confirms access, not free-tier quota. Check image/JSON support and current free-tier eligibility in Google AI Studio.",
    );
  } catch (error) {
    console.error(
      error?.status === 429
        ? "Gemini model listing is rate limited. Retry later."
        : "Could not list Gemini models. Check GEMINI_API_KEY and API access. No credential or raw provider response was logged.",
    );
    process.exitCode = 1;
  }
}
