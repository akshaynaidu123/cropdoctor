import { Leaf, Activity, Pill, ShieldCheck } from "lucide-react";
import type { DiseaseResult } from "@/services/cropService";
import { useLanguage } from "@/context/LanguageContext";

export function ResultCard({
  result,
}: {
  result: DiseaseResult;
}) {
  const { t } = useLanguage();

  const severityColor =
    result.severity === "High"
      ? "bg-red-100 text-red-700"
      : result.severity === "Moderate"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

  return (
    <div className="rounded-3xl border bg-white dark:bg-zinc-900 shadow-lg p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold mb-3">
            <Leaf size={14} />
            {result.crop}
          </div>

          <h2 className="text-2xl font-bold">
            {result.disease}
          </h2>

          <div
            className={`inline-flex items-center rounded-full px-3 py-1 mt-3 text-xs font-semibold ${severityColor}`}
          >
            {result.severity} Severity
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500">
            {t.confidence}
          </div>

          <div className="text-3xl font-bold text-green-600">
            {Math.round(result.confidence * 100)}%
          </div>

          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{
                width: `${result.confidence * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <Section
        icon={Activity}
        title={t.symptoms}
        items={result.symptoms}
      />

      <Section
        icon={Pill}
        title={t.treatment}
        items={result.treatment}
      />

      <Section
        icon={ShieldCheck}
        title={t.prevention}
        items={result.prevention}
      />
    </div>
  );
}

type SectionProps = {
  icon: React.ElementType;
  title: string;
  items: string[];
};

function Section({
  icon: Icon,
  title,
  items,
}: SectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
          <Icon size={16} />
        </div>

        <h3 className="font-semibold text-sm uppercase tracking-wide">
          {title}
        </h3>
      </div>

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex gap-3 text-sm"
          >
            <span className="mt-2 h-2 w-2 rounded-full bg-green-500 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}