import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { Upload, ImageIcon, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  onAnalyze: (file: File) => void;
  loading?: boolean;
};

export function UploadCard({ onAnalyze, loading }: Props) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  function handleFile(f: File | undefined | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function clear() {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-semibold">{t.uploadTitle}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t.uploadHint}</p>
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => !preview && inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all overflow-hidden ${
          drag ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:bg-muted/50"
        } ${preview ? "p-0" : "p-10"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0])}
        />

        {preview ? (
          <div className="relative">
            <img src={preview} alt="leaf preview" className="w-full h-72 object-cover" />
            <button
              onClick={(e) => { e.stopPropagation(); clear(); }}
              className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur border border-border hover:bg-background"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              <Upload className="h-6 w-6" />
            </div>
            <div className="font-medium text-sm">Drop your leaf image here</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <ImageIcon className="h-3 w-3" />
              or click to browse from your device
            </div>
          </div>
        )}
      </div>

      <button
        disabled={!file || loading}
        onClick={() => file && onAnalyze(file)}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl btn-hero px-5 py-3 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:[&:not(:disabled)]:-translate-y-0.5 transition-transform"
      >
        {loading ? t.analyzing : t.analyze}
      </button>
    </div>
  );
}
