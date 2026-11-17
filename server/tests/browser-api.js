// Real backend for the isolated browser suite. Intentionally never loads .env or an API key.
import { createApp } from "../app.js";
import { loadConfig } from "../config.js";

createApp({
  config: loadConfig({ PORT: "5176", FRONTEND_ORIGIN: "http://127.0.0.1:5175" }),
}).listen(5176, "127.0.0.1");
