import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import net from "node:net";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

test(
  "one dev command starts both servers, skips an occupied frontend port, and connects the actual origin",
  { timeout: 30_000 },
  async (t) => {
    const otherApp = http.createServer((_req, res) => res.end("another project"));
    otherApp.listen(0, "127.0.0.1");
    await once(otherApp, "listening");
    t.after(() => new Promise((resolve) => otherApp.close(resolve)));
    const occupiedPort = otherApp.address().port;
    const reservation = net.createServer().listen(0, "127.0.0.1");
    await once(reservation, "listening");
    const apiPort = reservation.address().port;
    await new Promise((resolve) => reservation.close(resolve));

    const child = spawn(
      process.execPath,
      ["scripts/dev.js", "--host", "127.0.0.1", "--port", String(occupiedPort)],
      {
        cwd: fileURLToPath(new URL("../../", import.meta.url)),
        env: {
          ...process.env,
          GEMINI_API_KEY: "your_api_key_here",
          HOST: "127.0.0.1",
          PORT: String(apiPort),
          API_PROXY_TARGET: "http://127.0.0.1:9",
          FRONTEND_ORIGIN: "http://localhost:5173",
        },
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      },
    );
    t.after(async () => {
      if (child.exitCode !== null || child.signalCode !== null) return;
      const closed = once(child, "exit");
      child.kill("SIGTERM");
      await closed;
    });
    let output = "";
    const frontendPort = await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Combined development startup timed out.")),
        20_000,
      );
      child.on("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      child.on("exit", () => {
        clearTimeout(timeout);
        reject(new Error(`Development server exited before readiness: ${output}`));
      });
      child.stderr.on("data", (chunk) => {
        output += chunk.toString();
      });
      child.stdout.on("data", (chunk) => {
        output += chunk.toString();
        const match = output.match(/Open CropDoctor: http:\/\/127\.0\.0\.1:(\d+)\/detection/);
        if (match) {
          clearTimeout(timeout);
          resolve(Number(match[1]));
        }
      });
    });
    assert.notEqual(frontendPort, occupiedPort);
    const origin = `http://127.0.0.1:${frontendPort}`;
    const entry = await fetch(`http://127.0.0.1:${apiPort}/`, { redirect: "manual" });
    assert.equal(entry.status, 302);
    assert.equal(entry.headers.get("location"), `${origin}/detection`);
    const health = await fetch(`${origin}/api/health`);
    assert.deepEqual(await health.json(), { ok: true, configured: false });
    const form = new FormData();
    form.append("image", new Blob(["test"], { type: "image/png" }), "test.png");
    const result = await fetch(`${origin}/api/analyze-crop`, {
      method: "POST",
      headers: { Origin: origin },
      body: form,
    });
    assert.equal(result.status, 503);
    assert.equal((await result.json()).code, "AI_NOT_CONFIGURED");
    assert.equal(await (await fetch(`http://127.0.0.1:${occupiedPort}`)).text(), "another project");
  },
);
