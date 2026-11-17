import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { loadConfig } from "../server/config.js";
import { startServer } from "../server/index.js";

// Own both servers in one process, so a frontend-only launch cannot leave analysis offline.
const config = loadConfig();
const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
function option(name) {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
}
const port = Number(option("--port") || process.env.FRONTEND_PORT || 5173);
const host = option("--host") || "127.0.0.1";
let api;
let frontend;
let stopping = false;

async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  await frontend?.close();
  if (api?.listening) {
    await new Promise((resolve) => {
      api.close(resolve);
      api.closeAllConnections();
    });
  }
  process.exitCode = code;
}

process.once("SIGINT", () => void stop());
process.once("SIGTERM", () => void stop());

try {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("INVALID_PORT");
  api = startServer(config);
  await once(api, "listening");
  const apiHost = ["0.0.0.0", "::"].includes(config.host) ? "127.0.0.1" : config.host;
  const apiTarget = `http://${apiHost.includes(":") ? `[${apiHost}]` : apiHost}:${config.port}`;
  frontend = await createServer({
    root,
    configFile: fileURLToPath(new URL("../vite.config.ts", import.meta.url)),
    server: { host, port, strictPort: false, proxy: { "/api": apiTarget } },
  });
  await frontend.listen();
  const address = frontend.httpServer.address();
  // Vite can choose another port when a different project occupies the requested port.
  // Allow only this launched frontend's exact loopback origins in addition to configured ones.
  for (const hostname of ["localhost", "127.0.0.1", "[::1]"]) {
    const origin = `http://${hostname}:${address.port}`;
    if (!config.origins.includes(origin)) config.origins.push(origin);
  }
  const frontendHost = ["0.0.0.0", "::"].includes(host) ? "127.0.0.1" : host;
  const frontendUrl = `http://${frontendHost.includes(":") ? `[${frontendHost}]` : frontendHost}:${address.port}`;
  config.frontendUrl = frontendUrl;
  console.log(`\nOpen CropDoctor: ${frontendUrl}/detection`);
  console.log("Frontend and crop API are running together. Press Ctrl+C to stop both.\n");
  frontend.printUrls();
} catch (error) {
  console.error(
    error?.code === "EADDRINUSE"
      ? `The API port ${config.port} is occupied. Stop the existing CropDoctor API, or use npm run dev:frontend if it is already running.`
      : "CropDoctor could not start. Check the configured ports and dependencies, then retry npm run dev.",
  );
  await stop(1);
}
