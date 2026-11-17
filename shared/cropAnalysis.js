import { z } from "zod";

// Leave room for multipart headers below Vercel's 4.5 MB request limit.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const IMAGE_SIZE_ERROR = "Maximum image size is 4 MB. Choose a smaller image.";
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
const text = z.string().min(1).max(1500);
const list = z.array(z.string().min(1).max(500)).max(10);

// One contract for Gemini structured output, API responses, and browser validation.
export const AnalysisOutputSchema = z.strictObject({
  status: z.enum(["healthy", "diseased", "uncertain", "unsupported"]),
  cropName: z.string().min(1).max(150).nullable(),
  diseaseName: z.string().min(1).max(200).nullable(),
  confidenceLevel: z.enum(["low", "medium", "high"]),
  severity: z.enum(["none", "mild", "moderate", "severe", "unknown"]),
  description: text,
  symptoms: list,
  possibleCauses: list,
  treatment: list,
  prevention: list,
  recommendation: text,
  disclaimer: text,
});

export const AnalysisSchema = AnalysisOutputSchema.superRefine((report, ctx) => {
  const invalid = (message) => ctx.addIssue({ code: "custom", message });
  if (
    report.status === "healthy" &&
    (report.diseaseName !== null || report.severity !== "none" || report.possibleCauses.length)
  )
    invalid("Healthy reports cannot assert a disease, cause, or damage severity.");
  if (
    report.status === "diseased" &&
    (!report.cropName ||
      !report.diseaseName ||
      !report.symptoms.length ||
      ["none", "unknown"].includes(report.severity))
  )
    invalid(
      "A possible disease requires an identifiable crop, visible evidence, and damage severity.",
    );
  if (["healthy", "diseased"].includes(report.status) && !report.cropName)
    invalid("An unknown crop must produce an uncertain assessment.");
  if (
    ["uncertain", "unsupported"].includes(report.status) &&
    (report.diseaseName !== null ||
      report.severity !== "unknown" ||
      report.confidenceLevel !== "low")
  )
    invalid("Inconclusive images require low confidence, unknown severity, and no named disease.");
  if (
    report.status === "unsupported" &&
    (report.cropName !== null ||
      report.symptoms.length ||
      report.possibleCauses.length ||
      report.treatment.length ||
      report.prevention.length)
  )
    invalid("Unsupported images cannot contain a crop diagnosis or care report.");
});
