import {
  Cloud,
  CloudRain,
  CloudLightning,
  Sun,
  Droplets,
  Wind,
  Thermometer,
  Sprout,
} from "lucide-react";

import type { WeatherSnapshot } from "@/services/weatherService";
import { useLanguage } from "@/context/LanguageContext";

const ICONS = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  storm: CloudLightning,
};

export function WeatherCard({
  data,
}: {
  data: WeatherSnapshot;
}) {
  const { t } = useLanguage();

  const Icon =
    ICONS[data.icon as keyof typeof ICONS] ?? Cloud;

  return (
    <div className="space-y-6">
      {/* Current Weather */}
      <div
        className="relative overflow-hidden rounded-3xl p-7 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute right-10 bottom-0 opacity-30">
          <Icon className="h-40 w-40" />
        </div>

        <div className="relative">
          <div className="text-xs uppercase tracking-widest opacity-80">
            {t.today} · {data.location}
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <div className="font-display text-6xl font-bold">
              {data.temperatureC}°
            </div>

            <div className="text-sm opacity-80">
              feels {data.feelsLikeC}°
            </div>
          </div>

          <div className="mt-1 text-sm opacity-90">
            {data.condition}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 max-w-md">
            <Stat
              icon={Droplets}
              label="Humidity"
              value={`${data.humidity}%`}
            />

            <Stat
              icon={Wind}
              label="Wind"
              value={`${data.windKph} km/h`}
            />

            <Stat
              icon={CloudRain}
              label="Rain"
              value={`${data.rainChance}%`}
            />
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="glass-card rounded-3xl p-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          {t.forecast}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {data.forecast.map((d) => {
            const ForecastIcon =
              ICONS[d.icon as keyof typeof ICONS] ?? Cloud;

            return (
              <div
                key={d.day}
                className="flex flex-col items-center rounded-2xl bg-muted/40 px-2 py-3 gap-1.5"
              >
                <div className="text-[11px] font-semibold text-muted-foreground">
                  {d.day}
                </div>

                <ForecastIcon className="h-5 w-5 text-primary" />

                <div className="text-xs font-bold">
                  {d.high}°
                </div>

                <div className="text-[10px] text-muted-foreground">
                  {d.low}°
                </div>

                <div className="text-[10px] text-primary">
                  {d.rain}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Farming Tips */}
      <div className="glass-card rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sprout className="h-4 w-4 text-primary" />

          <div className="text-xs font-semibold uppercase tracking-widest">
            {t.farmingTips}
          </div>
        </div>

        <ul className="space-y-2">
          {data.tips.map((tip, index) => (
            <li
              key={index}
              className="flex gap-3 text-sm"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />

              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Thermometer;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/15 backdrop-blur px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider opacity-80">
        <Icon className="h-3 w-3" />
        {label}
      </div>

      <div className="font-bold text-sm mt-0.5">
        {value}
      </div>
    </div>
  );
}