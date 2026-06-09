import { useEffect, useState } from "react";
import { WeatherCard } from "@/components/WeatherCard";
import { Loader } from "@/components/Loader";
import { CloudSun } from "lucide-react";

type ForecastDay = {
  day: string;
  icon: "sun" | "cloud" | "rain" | "storm";
  high: number;
  low: number;
  rain: number;
};

type WeatherSnapshot = {
  location: string;
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  windKph: number;
  rainChance: number;
  condition: string;
  icon: "sun" | "cloud" | "rain" | "storm";
  forecast: ForecastDay[];
  tips: string[];
};

// Mock Weather Service
async function getWeather(): Promise<WeatherSnapshot> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return {
    location: "Vijayawada",
    temperatureC: 31,
    feelsLikeC: 34,
    humidity: 72,
    windKph: 14,
    rainChance: 40,
    condition: "Partly Cloudy",
    icon: "cloud",

    forecast: [
      {
        day: "Mon",
        icon: "sun",
        high: 33,
        low: 26,
        rain: 10,
      },
      {
        day: "Tue",
        icon: "rain",
        high: 31,
        low: 25,
        rain: 70,
      },
      {
        day: "Wed",
        icon: "rain",
        high: 30,
        low: 24,
        rain: 60,
      },
      {
        day: "Thu",
        icon: "cloud",
        high: 32,
        low: 25,
        rain: 20,
      },
      {
        day: "Fri",
        icon: "sun",
        high: 34,
        low: 26,
        rain: 5,
      },
      {
        day: "Sat",
        icon: "storm",
        high: 29,
        low: 24,
        rain: 80,
      },
      {
        day: "Sun",
        icon: "cloud",
        high: 31,
        low: 25,
        rain: 30,
      },
    ],

    tips: [
      "Delay pesticide spraying on rainy days.",
      "Ensure proper drainage in paddy fields.",
      "Irrigate early morning to reduce evaporation.",
      "Monitor crops for fungal infections after rainfall.",
    ],
  };
}

export default function WeatherPage() {
  const [data, setData] =
    useState<WeatherSnapshot | null>(null);

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
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Weather Advisor
          </h1>

          <p className="text-sm text-muted-foreground">
            7-day forecast with farming recommendations
            for your region.
          </p>
        </div>
      </header>

      {data ? (
        <WeatherCard data={data} />
      ) : (
        <div className="glass-card rounded-3xl">
          <Loader label="Fetching local weather..." />
        </div>
      )}
    </div>
  );
}