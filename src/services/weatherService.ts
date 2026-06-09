export interface ForecastDay {
  day: string;
  high: number;
  low: number;
  rain: number;
  icon: "sun" | "cloud" | "rain" | "storm";
}

export interface WeatherSnapshot {
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
}

export async function getWeather(): Promise<WeatherSnapshot> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    location: "Vijayawada",
    temperatureC: 32,
    feelsLikeC: 35,
    humidity: 68,
    windKph: 14,
    rainChance: 20,
    condition: "Partly Cloudy",
    icon: "cloud",

    forecast: [
      { day: "Mon", high: 32, low: 25, rain: 20, icon: "cloud" },
      { day: "Tue", high: 33, low: 25, rain: 10, icon: "sun" },
      { day: "Wed", high: 31, low: 24, rain: 40, icon: "rain" },
      { day: "Thu", high: 30, low: 24, rain: 60, icon: "storm" },
      { day: "Fri", high: 32, low: 25, rain: 20, icon: "cloud" },
      { day: "Sat", high: 34, low: 26, rain: 5, icon: "sun" },
      { day: "Sun", high: 33, low: 25, rain: 15, icon: "cloud" },
    ],

    tips: [
      "Irrigate early morning.",
      "Monitor for fungal infections.",
      "Avoid excess nitrogen fertilizer.",
    ],
  };
}