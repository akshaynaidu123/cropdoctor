import { useEffect, useRef, useState, type DragEvent } from "react";
import { Upload, ImageIcon, X, Camera } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { IMAGE_ACCEPT } from "../../shared/cropAnalysis.js";
import { validateImage } from "@/services/imageValidation";

type Props = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onAnalyze: () => void;
  loading: boolean;
};

export function UploadCard({ file, onFileChange, onAnalyze, loading }: Props) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFile(next: File | undefined) {
    if (loading || !next) return;
    onFileChange(null);
    setError(null);
    try {
      validateImage(next);
      onFileChange(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not read this image.");
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDrag(false);
    if (event.dataTransfer.files.length > 1) {
      if (!loading) {
        onFileChange(null);
        setError("Choose one image at a time.");
      }
      return;
    }
    handleFile(event.dataTransfer.files[0]);
  }

  return (
    <div className="glass-card rounded-3xl p-6">
      <h3 className="font-display text-lg font-semibold">{t.uploadTitle}</h3>
      <p className="text-xs text-muted-foreground mt-0.5 mb-4">{t.uploadHint}</p>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!loading) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`relative rounded-2xl border-2 border-dashed transition-all overflow-hidden ${drag ? "border-primary bg-primary/5" : "border-border bg-muted/30"}`}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Selected crop for analysis"
              className="w-full h-72 object-contain"
              onError={() => {
                onFileChange(null);
                setError(
                  "This image could not be previewed. Export a valid JPG, PNG, or WebP and try again.",
                );
              }}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                onFileChange(null);
                setError(null);
              }}
              className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 border border-border disabled:opacity-50"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
            className="w-full p-8 sm:p-10 flex flex-col items-center text-center hover:bg-muted/50 disabled:opacity-50"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              <Upload className="h-6 w-6" />
            </span>
            <span className="font-medium text-sm">Drop your crop image here</span>
            <span className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1.5">
              <ImageIcon className="h-3 w-3" />
              or browse from your device
            </span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        disabled={loading}
        className="hidden"
        aria-label="Choose crop image"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept={IMAGE_ACCEPT}
        capture="environment"
        disabled={loading}
        className="hidden"
        aria-label="Capture crop image"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <div className="flex flex-wrap gap-3 mt-4">
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 text-sm text-primary font-medium disabled:opacity-50"
        >
          <ImageIcon className="h-4 w-4" />
          {file ? "Choose another image" : "Choose from gallery"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => cameraRef.current?.click()}
          className="inline-flex items-center gap-2 text-sm text-primary font-medium disabled:opacity-50"
        >
          <Camera className="h-4 w-4" />
          Capture photo
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Camera capture is available on supported mobile browsers; your browser manages camera
        permission.
      </p>
      {file && (
        <p className="text-xs text-muted-foreground mt-3 break-all">
          {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={!file || !preview || loading}
        onClick={onAnalyze}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl btn-hero px-5 py-3 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-transform"
      >
        {loading ? t.analyzing : t.analyze}
      </button>
      <p className="text-xs text-muted-foreground mt-3">
        When you analyze, this image is sent to Google Gemini for a preliminary visual assessment.
      </p>
    </div>
  );
}
