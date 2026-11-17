import { pathToFileURL } from "node:url";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

export function startServer(config = loadConfig()) {
  const server = createApp({ config }).listen(config.port, config.host, () => {
    console.log(`CropDoctor API ready at http://${config.host}:${config.port}`);
    if (!config.apiKey)
      console.warn("AI unavailable: set GEMINI_API_KEY in .env and restart the API.");
  });
  server.requestTimeout = 120_000;
  server.headersTimeout = 15_000;
  server.on("error", (error) => {
    console.error(
      error.code === "EADDRINUSE"
        ? `Port ${config.port} is already in use. Stop the other API or change PORT and API_PROXY_TARGET.`
        : "The API server could not start. Check HOST and PORT.",
    );
    process.exitCode = 1;
  });
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) startServer();
