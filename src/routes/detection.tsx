import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UploadCard } from "@/components/UploadCard";
import { ResultCard } from "@/components/ResultCard";
import { Loader } from "@/components/Loader";
import { analyzeLeafImage, type DiseaseResult } from "@/services/cropService";
import { ScanLine } from "lucide-react";

export const Route = createFileRoute("/detection")({
  head: () => ({
    meta: [
      { title: "Disease Detection — Crop Doctor AI" },
      { name: "description", content: "Upload a leaf image to identify crop diseases and get treatment recommendations." },
    ],
  }),
  component: DetectionPage,
});

function DetectionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);

  async function analyze(file: File) {
    setLoading(true);
    setResult(null);
    const res = await analyzeLeafImage(file);
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl btn-hero">
          <ScanLine className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Disease Detection</h1>
          <p className="text-sm text-muted-foreground">Upload a leaf photo to identify diseases in seconds.</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        <UploadCard onAnalyze={analyze} loading={loading} />
        <div>
          {loading && (
            <div className="glass-card rounded-3xl">
              <Loader label="Analyzing leaf with vision model…" />
            </div>
          )}
          {!loading && result && <ResultCard result={result} />}
          {!loading && !result && (
            <div className="glass-card rounded-3xl p-10 text-center h-full flex flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <ScanLine className="h-8 w-8" />
              </div>
              <h3 className="font-display text-lg font-semibold">No diagnosis yet</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Upload a clear photo of an affected leaf. Try to fill the frame and use natural light for best accuracy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
