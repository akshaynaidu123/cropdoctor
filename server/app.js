import express from "express";
import cors from "cors";
import multer from "multer";
import { rateLimit } from "express-rate-limit";
import { createAnalyzeRouter } from "./routes/analyze.js";
import { createVisionService } from "./services/visionService.js";
import { HttpError } from "./errors.js";

export function createApp({ config, analyzeImage = createVisionService(config) }) {
  const app = express();
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.set({ "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    next();
  });
  app.use(
    cors({
      origin(origin, done) {
        if (!origin || config.origins.includes(origin)) return done(null, true);
        done(
          new HttpError(
            403,
            "ORIGIN_NOT_ALLOWED",
            "This frontend origin is not allowed by the API.",
          ),
        );
      },
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
      credentials: false,
    }),
  );
  app.get("/api/health", (_req, res) => res.json({ ok: true, configured: Boolean(config.apiKey) }));
  app.get("/", (_req, res) => {
    if (config.frontendUrl) return res.redirect(302, `${config.frontendUrl}/detection`);
    res.json({
      service: "CropDoctor API",
      message:
        "Run npm run dev to start the application, then open the CropDoctor URL printed in that terminal.",
    });
  });
  app.use(
    "/api/analyze-crop",
    rateLimit({
      windowMs: 60_000,
      limit: 10,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      handler: (_req, res) =>
        res
          .status(429)
          .json({ error: "Too many requests. Wait a minute and retry.", code: "REQUEST_LIMIT" }),
    }),
  );
  app.use("/api", createAnalyzeRouter({ config, analyzeImage }));
  app.use((_req, _res, next) => next(new HttpError(404, "NOT_FOUND", "API endpoint not found.")));
  app.use((error, _req, res, _next) => {
    if (res.headersSent || res.destroyed) return;
    if (error instanceof multer.MulterError) {
      const tooLarge = error.code === "LIMIT_FILE_SIZE";
      return res.status(tooLarge ? 413 : 400).json({
        code: tooLarge ? "IMAGE_TOO_LARGE" : "INVALID_UPLOAD",
        error: tooLarge
          ? "Maximum image size is 10 MB."
          : "Upload exactly one image file in the image field, with no extra fields.",
      });
    }
    if (error instanceof HttpError)
      return res.status(error.status).json({ error: error.message, code: error.code });
    // Never log raw SDK errors (which can include request data), files, or secrets.
    res.status(500).json({
      error: "The API could not process this request. Try again.",
      code: "INTERNAL_ERROR",
    });
  });
  return app;
}
