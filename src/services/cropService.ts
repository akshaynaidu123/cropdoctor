export interface DiseaseResult {
  disease: string;
  confidence: number;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
}

export async function analyzeLeafImage(
  file: File
): Promise<DiseaseResult> {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    disease: "Tomato Early Blight",
    confidence: 94,
    symptoms: [
      "Brown circular spots",
      "Yellowing leaves",
    ],
    treatment: [
      "Apply Mancozeb fungicide",
      "Remove infected leaves",
    ],
    prevention: [
      "Avoid overhead irrigation",
      "Maintain crop spacing",
    ],
  };
}