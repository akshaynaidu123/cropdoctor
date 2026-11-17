import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

export function loadConfig(env = process.env) {
  if (env === process.env)
    dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)), quiet: true });
  const rawKey = env.GEMINI_API_KEY?.trim();
  const apiKey = rawKey && !/^(your_|replace_|<)/i.test(rawKey) ? rawKey : "";
  const port = Number(env.PORT || env.API_PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT must be an integer between 1 and 65535.");
  const origins = (env.FRONTEND_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  for (const origin of origins) {
    const url = new URL(origin);
    if (!["http:", "https:"].includes(url.protocol) || url.origin !== origin)
      throw new Error(
        "FRONTEND_ORIGIN must contain exact HTTP(S) origins without paths or wildcards.",
      );
  }
  return {
    apiKey,
    model: (env.GEMINI_MODEL || "gemini-3.5-flash-lite").replace(/^models\//, ""),
    host: env.HOST || "127.0.0.1",
    port,
    origins,
  };
}
