import { Router } from "express";
import multer from "multer";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES, AnalysisSchema } from "../../shared/cropAnalysis.js";
import { prepareImage } from "../services/imageService.js";
import { HttpError } from "../errors.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 0, parts: 1, headerPairs: 50 },
  fileFilter(_req, file, done) {
    const supported = IMAGE_MIME_TYPES.includes(file.mimetype);
    done(
      supported
        ? null
        : new HttpError(415, "INVALID_IMAGE_TYPE", "Choose a JPG, PNG, or WebP image."),
      supported,
    );
  },
}).single("image");

export function createAnalyzeRouter({ config, analyzeImage }) {
  const router = Router();
  let active = 0;
  router.post("/analyze-crop", (req, res, next) => {
    if (!config.apiKey)
      return next(
        new HttpError(
          503,
          "AI_NOT_CONFIGURED",
          config.isVercel
            ? "Set GEMINI_API_KEY in this Vercel project's server-side environment variables and redeploy."
            : "Set GEMINI_API_KEY in the backend .env file and restart npm run dev.",
        ),
      );
    if (!req.is("multipart/form-data"))
      return next(
        new HttpError(
          415,
          "MULTIPART_REQUIRED",
          "Send multipart/form-data with one image file in the image field.",
        ),
      );
    if (active >= 2)
      return next(
        new HttpError(
          429,
          "API_BUSY",
          "Two images are already being analyzed. Wait for an analysis to finish and retry.",
        ),
      );
    active++;
    let released = false;
    const release = () => {
      if (!released) {
        active--;
        released = true;
      }
    };
    res.once("finish", release);
    upload(req, res, (error) => {
      if (error) {
        release();
        return next(
          error instanceof multer.MulterError || error instanceof HttpError
            ? error
            : new HttpError(
                400,
                "INVALID_UPLOAD",
                "The image upload is incomplete or malformed. Please retry.",
              ),
        );
      }
      const controller = new AbortController();
      const cancel = () => {
        if (!res.writableEnded) controller.abort();
      };
      res.once("close", cancel);
      (async () => {
        const image = await prepareImage(req.file);
        if (controller.signal.aborted) return;
        const report = await analyzeImage(image, { signal: controller.signal });
        const parsed = AnalysisSchema.safeParse(report);
        if (!parsed.success)
          throw new HttpError(
            502,
            "INVALID_AI_RESPONSE",
            "The AI returned an invalid report. Please retry.",
          );
        if (!res.destroyed) res.json(parsed.data);
      })()
        .catch(next)
        .finally(() => {
          res.off("close", cancel);
          release();
        });
    });
    req.once("aborted", release);
  });
  router.all("/analyze-crop", (_req, res) => {
    res.set("Allow", "POST, OPTIONS").status(405).json({
      error: "Use POST with one multipart image file in the image field.",
      code: "METHOD_NOT_ALLOWED",
    });
  });
  return router;
}
