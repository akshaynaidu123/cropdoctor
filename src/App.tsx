import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/index";
import DetectionPage from "./pages/detection";
import AssistantPage from "./pages/assistant";
import WeatherPage from "./pages/weather";
import AboutPage from "./pages/about";

import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { LanguageProvider } from "./context/LanguageContext";

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="mx-auto flex w-full max-w-7xl flex-1 px-0 sm:px-4">
          <Sidebar />

          <main className="flex-1 px-4 sm:px-6 py-6 lg:py-8 min-w-0">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/detection" element={<DetectionPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </main>
        </div>

        <footer className="border-t border-border/60 mt-12">
          <div className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-muted-foreground">
            © 2026 Crop Doctor AI · Built with care for farmers everywhere 🌱
          </div>
        </footer>
      </div>
    </LanguageProvider>
  );
}

export default App;