import { Leaf, Activity, Pill, ShieldCheck } from "lucide-react";
import type { DiseaseResult } from "@/services/cropService";
import { useLanguage } from "@/context/LanguageContext";

export function ResultCard({ result }: { result: DiseaseResult }) {
  const { t } = useLanguage();
  const sevColor =
    result.severity === "High"
      ? "bg-destructive/10 text-destructive"
      : result.severity === "Moderate"
      ? "bg-warning/15 text-[oklch(0.45_0.15_75)]"
      : "bg-success/15 text-[oklch(0.4_0.15_150)]";

  return (
    <div className="glass-card rounded-3xl p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary mb-2">
            <Leaf className="h-3 w-3" /> {result.crop}
          </div>
          <h3 className="font-display text-2xl font-bold leading-tight">{result.disease}</h3>
          <div className={`inline-flex items-center rounded-full px-2.5 py-1 mt-2 text-xs font-semibold ${sevColor}`}>
            {result.severity} severity
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{t.confidence}</div>
          <div className="font-display text-3xl font-bold gradient-text">
            {Math.round(result.confidence * 100)}%
          </div>
          <div className="mt-1 w-32 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full btn-hero rounded-full transition-all"
              style={{ width: `${result.confidence * 100}%` }}
            />
          </div>
        </div>
      </div>

      <Section icon={Activity} title={t.symptoms} items={result.symptoms} accent="text-destructive bg-destructive/10" />
      <Section icon={Pill} title={t.treatment} items={result.treatment} accent="text-primary bg-primary/10" />
      <Section icon={ShieldCheck} title={t.prevention} items={result.prevention} accent="text-[oklch(0.45_0.15_75)] bg-warning/15" />
    </div>
  );
}

function Section({
  icon: Icon, title, items, accent,
}: {
  icon: typeof Activity;
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
        <h4 className="font-display text-sm font-bold uppercase tracking-wider">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3 text-sm text-foreground/90 leading-relaxed">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
