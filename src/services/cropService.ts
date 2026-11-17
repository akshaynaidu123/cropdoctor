import { z } from "zod";
import { AnalysisSchema } from "../../shared/cropAnalysis.js";
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
      throw new Error(
        "The crop API is not connected to this page. Stop this project's old dev server and run npm run dev to start both servers, then open the CropDoctor URL printed in that terminal.",
      );
    }
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const error =
        data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error
          : "The crop API could not complete this request. Restart CropDoctor with npm run dev, then retry.";
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
        "Cannot connect to the crop API. Run npm run dev to start the frontend and backend together, then open the printed CropDoctor URL.",
      );
    throw error;
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
  }
}
