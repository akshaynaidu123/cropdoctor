import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UploadCard } from "@/components/UploadCard";
import { ResultCard } from "@/components/ResultCard";
import { Loader } from "@/components/Loader";
import {
  analyzeLeafImage,
  type DiseaseResult,
} from "@/services/cropService";
import { ScanLine } from "lucide-react";

export const Route = createFileRoute("/detection")({
  component: DetectionPage,
});

function DetectionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);

  async function analyze(file: File) {
    setLoading(true);

    try {
      const response = await analyzeLeafImage(file);
      setResult(response);
    } catch (error) {
      console.error("Analysis Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ScanLine className="h-7 w-7" />
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            Disease Detection
          </h1>

          <p className="text-muted-foreground">
            Upload a crop leaf image and get AI-powered disease diagnosis.
          </p>
        </div>
      </header>

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

              <h3 className="text-lg font-semibold">
                No diagnosis yet
              </h3>

              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Upload a clear crop leaf image to begin analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}