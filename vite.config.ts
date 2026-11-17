import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "API_PROXY_TARGET");
  const proxy = { "/api": env.API_PROXY_TARGET || "http://127.0.0.1:5000" };
  return {
    server: { port: 5173, strictPort: true, proxy },
    preview: { proxy },
    plugins: [react(), tailwindcss(), tsconfigPaths()],
  };
});
