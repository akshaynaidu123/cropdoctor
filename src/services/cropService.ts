import { z } from "zod";
import { AnalysisSchema, IMAGE_SIZE_ERROR } from "../../shared/cropAnalysis.js";
import { validateImage } from "./imageValidation";

export type DiseaseResult = z.infer<typeof AnalysisSchema>;

export async function analyzeLeafImage(file: File, signal?: AbortSignal): Promise<DiseaseResult> {
  validateImage(file);
  const body = new FormData();
  body.append("image", file);
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel, { once: true });
  if (signal?.aborted) controller.abort();
  const timeout = window.setTimeout(cancel, 75_000);
  try {
    const response = await fetch("/api/analyze-crop", {
      method: "POST",
      body,
      signal: controller.signal,
    });
    if (!response.headers.get("content-type")?.includes("application/json")) {
      if (response.status === 413) throw new Error(IMAGE_SIZE_ERROR);
      throw new Error(
        import.meta.env.DEV
          ? "The crop API is not connected to this page. Run npm run dev to start both servers and open the printed CropDoctor URL."
          : "The crop API is not deployed correctly. Check the Vercel API Function and /api rewrites, then redeploy.",
      );
    }
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const error =
        data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error
          : "The crop API could not complete this request. Please retry or check the API deployment logs.";
      throw new Error(error);
    }
    const parsed = AnalysisSchema.safeParse(data);
    if (!parsed.success) throw new Error("The API returned an invalid report. Retry the analysis.");
    return parsed.data;
  } catch (error) {
    if (signal?.aborted) throw new DOMException("Analysis cancelled", "AbortError");
    if (controller.signal.aborted) throw new Error("Analysis timed out. Please retry.");
    if (error instanceof TypeError)
      throw new Error(
        import.meta.env.DEV
          ? "Cannot connect to the crop API. Run npm run dev to start both servers, then open the printed CropDoctor URL."
          : "Cannot connect to the crop API. Check your connection and retry. If this persists, check the Vercel Function logs.",
      );
    throw error;
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
  }
}
