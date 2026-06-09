import { useState } from "react";
import { UploadCard } from "@/components/UploadCard";
import { ResultCard } from "@/components/ResultCard";
import { Loader } from "@/components/Loader";
import { ScanLine } from "lucide-react";

type DiseaseResult = {
  crop: string;
  disease: string;
  confidence: number;
  severity: "Low" | "Moderate" | "High";
  symptoms: string[];
  treatment: string[];
  prevention: string[];
};

// Mock Disease Detection Service
async function analyzeLeafImage(
  _file: File
): Promise<DiseaseResult> {
  await new Promise((resolve) =>
    setTimeout(resolve, 1800)
  );

  return {
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
  };
}

export default function DetectionPage() {
  const [loading, setLoading] = useState(false);

  const [result, setResult] =
    useState<DiseaseResult | null>(null);

  async function analyze(file: File) {
    setLoading(true);

    try {
      const response = await analyzeLeafImage(file);

      console.log(
        "Detection Result:",
        response
      );

      setResult(response);
    } catch (error) {
      console.error(
        "Analysis Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ScanLine className="h-7 w-7" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold">
            Disease Detection
          </h1>

          <p className="text-muted-foreground">
            Upload a crop leaf image and get
            AI-powered disease diagnosis.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        <UploadCard
          onAnalyze={analyze}
          loading={loading}
        />

        <div>
          {loading ? (
            <div className="glass-card rounded-3xl p-10">
              <Loader label="Analyzing crop image..." />
            </div>
          ) : result ? (
            <ResultCard result={result} />
          ) : (
            <div className="glass-card rounded-3xl p-10 text-center h-full flex flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <ScanLine className="h-8 w-8" />
              </div>

              <h3 className="font-display text-lg font-semibold">
                No diagnosis yet
              </h3>

              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Upload a clear crop leaf image to begin
                analysis. Make sure the affected leaf
                fills most of the frame and is captured
                in good lighting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}