import { Leaf, Activity, Pill, ShieldCheck, Search, type LucideIcon } from "lucide-react";
import type { DiseaseResult } from "@/services/cropService";
import { useLanguage } from "@/context/LanguageContext";

const STATUS_LABELS = {
  healthy: "No obvious disease visible",
  diseased: "Possible disease or stress",
  uncertain: "Unable to assess reliably",
  unsupported: "Image not supported",
};

export function ResultCard({ result }: { result: DiseaseResult }) {
  const { t } = useLanguage();
  const severityColor =
    result.severity === "severe"
      ? "bg-red-100 text-red-700"
      : result.severity === "moderate"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-muted text-foreground";
  const empty =
    result.status === "healthy"
      ? "No visible abnormalities reported."
      : "Not established from this image.";
  return (
    <article
      className="rounded-3xl border bg-white dark:bg-zinc-900 shadow-lg p-6 space-y-6 break-words"
      aria-label="Crop assessment report"
    >
      <header>
        <div className="text-xs text-muted-foreground mb-2">Crop name</div>
        <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold mb-3">
          <Leaf size={14} />
          {result.cropName || "Unknown crop"}
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-1">
          {STATUS_LABELS[result.status]}
        </p>
        <h2 className="text-2xl font-bold">{result.diseaseName || STATUS_LABELS[result.status]}</h2>
        <dl className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Confidence level</dt>
            <dd className="capitalize font-semibold mt-1">
              {result.confidenceLevel} (qualitative)
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Visible damage severity</dt>
            <dd
              className={`inline-flex rounded-full px-3 py-1 mt-1 text-xs font-semibold capitalize ${severityColor}`}
            >
              {result.severity}
            </dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground mt-3">
          Confidence expresses model uncertainty; it is not a calibrated probability.
        </p>
      </header>
      <section>
        <h3 className="font-semibold text-sm mb-2">Assessment description</h3>
        <p className="text-sm leading-relaxed">{result.description}</p>
      </section>
      <Section
        icon={Activity}
        title="Visible symptoms / observations"
        items={result.symptoms}
        empty={empty}
      />
      <Section
        icon={Search}
        title="Possible causes"
        items={result.possibleCauses}
        empty={result.status === "healthy" ? "No disease cause suggested." : empty}
      />
      <Section
        icon={Pill}
        title={
          result.status === "healthy" ? "Suggested care" : `Suggested ${t.treatment.toLowerCase()}`
        }
        items={result.treatment}
        empty="No treatment suggested from this image."
      />
      <Section
        icon={ShieldCheck}
        title={t.prevention}
        items={result.prevention}
        empty="No preventive measures established from this image."
      />
      <section className="rounded-xl bg-primary/5 p-4">
        <h3 className="font-semibold text-sm mb-2">Final recommendation</h3>
        <p className="text-sm">{result.recommendation}</p>
      </section>
      <p className="text-xs rounded-xl bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100 p-3">
        {result.disclaimer}
      </p>
    </article>
  );
}

function Section({
  icon: Icon,
  title,
  items,
  empty,
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 shrink-0 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
          <Icon size={16} />
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex gap-3 text-sm leading-relaxed">
              <span className="mt-2 h-2 w-2 rounded-full bg-green-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </section>
  );
}
