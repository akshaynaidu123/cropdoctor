import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WeatherCard } from "@/components/WeatherCard";
import { Loader } from "@/components/Loader";
import { getWeather, type WeatherSnapshot } from "@/services/weatherService";
import { CloudSun } from "lucide-react";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Weather Advisor — Crop Doctor AI" },
      { name: "description", content: "Hyper-local weather forecast with tailored farming recommendations." },
    ],
  }),
  component: WeatherPage,
});

function WeatherPage() {
  const [data, setData] = useState<WeatherSnapshot | null>(null);

  useEffect(() => {
    getWeather().then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl btn-hero">
          <CloudSun className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Weather Advisor</h1>
          <p className="text-sm text-muted-foreground">7-day forecast with farming recommendations for your region.</p>
        </div>
      </header>

      {data ? <WeatherCard data={data} /> : (
        <div className="glass-card rounded-3xl"><Loader label="Fetching local weather…" /></div>
      )}
    </div>
  );
}
