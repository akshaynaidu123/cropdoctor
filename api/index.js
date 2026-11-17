import { createApp } from "../server/app.js";
import { loadConfig } from "../server/config.js";

// Read server runtime variables only; Multer owns the raw multipart stream.
const app = createApp({ config: loadConfig({ ...process.env, VERCEL: "1" }) });

// Vercel supplies the HTTP server. Local .listen() stays in server/index.js.
export default app;
