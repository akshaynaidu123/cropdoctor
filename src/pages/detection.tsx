import { useEffect, useRef, useState } from "react";
import { UploadCard } from "@/components/UploadCard";
import { ResultCard } from "@/components/ResultCard";
import { Loader } from "@/components/Loader";
import { AlertCircle, ScanLine } from "lucide-react";
import { analyzeLeafImage, type DiseaseResult } from "@/services/cropService";

export default function DetectionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const active = useRef<AbortController | null>(null);

  useEffect(() => () => active.current?.abort(), []);

  function changeFile(next: File | null) {
    active.current?.abort();
    active.current = null;
    setLoading(false);
    setFile(next);
    setResult(null);
    setError(null);
  }

  async function analyze() {
    if (!file || active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      const report = await analyzeLeafImage(file, controller.signal);
      if (!controller.signal.aborted) setResult(report);
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(cause instanceof Error ? cause.message : "Analysis failed. Please retry.");
    } finally {
      if (active.current === controller) {
        active.current = null;
        setLoading(false);
      }
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ScanLine className="h-7 w-7" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Disease Detection</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Upload or capture a crop image for an AI visual health assessment.
          </p>
        </div>
      </header>
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <UploadCard file={file} onFileChange={changeFile} onAnalyze={analyze} loading={loading} />
        <div aria-live="polite" aria-busy={loading}>
          {loading ? (
            <div className="glass-card rounded-3xl p-6 sm:p-10" role="status">
              <Loader label="Analyzing the visible crop characteristics..." />
              <p className="text-xs text-center text-muted-foreground">
                This may take up to a minute.
              </p>
            </div>
          ) : error ? (
            <div role="alert" className="glass-card rounded-3xl p-6 sm:p-10 space-y-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <h2 className="font-display text-lg font-semibold">
                Analysis could not be completed
              </h2>
              <p className="text-sm text-muted-foreground break-words">{error}</p>
              <button
                type="button"
                onClick={analyze}
                disabled={!file}
                className="rounded-xl btn-hero px-5 py-3 text-sm font-semibold disabled:opacity-50"
              >
                Retry analysis
              </button>
            </div>
          ) : result ? (
            <ResultCard result={result} />
          ) : (
            <div className="glass-card rounded-3xl p-6 sm:p-10 text-center flex flex-col items-center justify-center min-h-72">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <ScanLine className="h-8 w-8" />
              </div>
              <h2 className="font-display text-lg font-semibold">No assessment yet</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Choose a clear crop or leaf photograph, review the preview, then select Analyze
                image. Use good lighting and fill most of the frame with the plant.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
