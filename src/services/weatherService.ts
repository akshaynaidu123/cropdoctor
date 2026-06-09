export type WeatherSnapshot = {
  location: string;
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  windKph: number;
  rainChance: number;
  condition: string;
  icon: "sun" | "cloud" | "rain" | "storm";
  forecast: { day: string; high: number; low: number; rain: number; icon: "sun" | "cloud" | "rain" | "storm" }[];
  tips: string[];
};

export async function getWeather(location = "Guntur, AP"): Promise<WeatherSnapshot> {
  await new Promise((r) => setTimeout(r, 600));
  return {
    location,
    temperatureC: 31,
    feelsLikeC: 34,
    humidity: 68,
    windKph: 12,
    rainChance: 40,
    condition: "Partly cloudy with scattered showers",
    icon: "cloud",
    forecast: [
      { day: "Mon", high: 32, low: 24, rain: 20, icon: "sun" },
      { day: "Tue", high: 30, low: 23, rain: 60, icon: "rain" },
      { day: "Wed", high: 29, low: 22, rain: 80, icon: "storm" },
      { day: "Thu", high: 31, low: 23, rain: 30, icon: "cloud" },
      { day: "Fri", high: 33, low: 25, rain: 10, icon: "sun" },
      { day: "Sat", high: 34, low: 26, rain: 5, icon: "sun" },
      { day: "Sun", high: 32, low: 24, rain: 35, icon: "cloud" },
    ],
    tips: [
      "Delay spraying pesticides — rain expected on Wed.",
      "Ideal window for transplanting paddy: Thu–Fri morning.",
      "High humidity favors fungal blight, scout tomato fields.",
      "Irrigate cotton lightly; soil moisture should hold 3 days.",
    ],
  };
}
