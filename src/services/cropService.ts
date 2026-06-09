// Mock crop disease detection service. Swap for real API later.
export type DiseaseResult = {
  crop: string;
  disease: string;
  confidence: number;
  severity: "Low" | "Moderate" | "High";
  symptoms: string[];
  treatment: string[];
  prevention: string[];
};

const MOCK_RESULTS: DiseaseResult[] = [
  {
    crop: "Tomato",
    disease: "Early Blight (Alternaria solani)",
    confidence: 0.94,
    severity: "Moderate",
    symptoms: [
      "Concentric brown rings on lower leaves",
      "Yellow halo surrounding dark lesions",
      "Premature leaf drop reducing yield",
    ],
    treatment: [
      "Apply Mancozeb 75% WP @ 2g/L every 10 days",
      "Remove and burn infected leaves immediately",
      "Spray neem oil (5ml/L) as an organic alternative",
    ],
    prevention: [
      "Use certified disease-free seeds",
      "Maintain 60cm row spacing for airflow",
      "Rotate crops with cereals every 2 seasons",
    ],
  },
  {
    crop: "Rice",
    disease: "Bacterial Leaf Blight (Xanthomonas oryzae)",
    confidence: 0.89,
    severity: "High",
    symptoms: [
      "Water-soaked lesions on leaf tips",
      "Yellow to white stripes along veins",
      "Wilting of seedlings (kresek)",
    ],
    treatment: [
      "Spray Copper Oxychloride @ 2.5g/L",
      "Apply Streptocycline 100ppm + Copper Oxychloride",
      "Drain field for 24 hours to slow spread",
    ],
    prevention: [
      "Plant resistant varieties (IR-20, IRBB-60)",
      "Avoid excessive nitrogen fertilization",
      "Use balanced NPK with potash boost",
    ],
  },
  {
    crop: "Cotton",
    disease: "Leaf Curl Virus",
    confidence: 0.91,
    severity: "High",
    symptoms: [
      "Upward curling and thickening of leaves",
      "Vein darkening and enations on underside",
      "Stunted growth and poor boll formation",
    ],
    treatment: [
      "Spray Imidacloprid 17.8% SL @ 0.3ml/L to control whitefly",
      "Remove infected plants and destroy",
      "Apply foliar urea 2% to boost recovery",
    ],
    prevention: [
      "Sow tolerant Bt-cotton hybrids",
      "Install yellow sticky traps (10/acre)",
      "Avoid intercropping with okra or hibiscus",
    ],
  },
];

export async function analyzeLeafImage(_file: File): Promise<DiseaseResult> {
  await new Promise((r) => setTimeout(r, 1800));
  return MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
}
