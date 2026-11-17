// Isolated automated-test data. Never imported by the running application.
export const healthyReport = {
  status: "healthy",
  cropName: "Rice",
  diseaseName: null,
  confidenceLevel: "medium",
  severity: "none",
  description: "The test image shows green narrow leaves without obvious damage.",
  symptoms: [],
  possibleCauses: [],
  treatment: ["Monitor leaf health."],
  prevention: ["Inspect plants regularly."],
  recommendation: "Monitor for changes and seek local advice if symptoms develop.",
  disclaimer: "AI-generated preliminary visual assessment, not a confirmed diagnosis.",
};
export const diseasedReport = {
  ...healthyReport,
  status: "diseased",
  cropName: "Maize",
  diseaseName: "Possible leaf blight",
  severity: "moderate",
  description: "Visible discolored lesions warrant closer examination.",
  symptoms: ["Brown elongated lesions"],
  possibleCauses: ["Possible fungal infection"],
  treatment: ["Ask a local agricultural specialist to inspect the plant."],
};
export const uncertainReport = {
  ...healthyReport,
  status: "uncertain",
  cropName: null,
  confidenceLevel: "low",
  severity: "unknown",
  description: "The crop cannot be reliably identified from this view.",
  treatment: [],
  prevention: [],
  recommendation: "Take a sharper photograph of the whole plant and a leaf close-up.",
};
export const unsupportedReport = {
  ...uncertainReport,
  status: "unsupported",
  description: "No assessable crop is visible in this test image.",
  recommendation: "Upload a clear crop photograph.",
};
