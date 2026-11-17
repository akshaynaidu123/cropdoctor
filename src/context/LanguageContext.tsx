import { createContext, useContext, useState, type ReactNode } from "react";

type Lang = "en" | "te";

const translations = {
  en: {
    appName: "Crop Doctor AI",
    tagline: "AI-powered crop disease diagnosis & farming guidance",
    dashboard: "Dashboard",
    detection: "Disease Detection",
    assistant: "Farmer Assistant",
    weather: "Weather Advisor",
    about: "About",
    heroTitle: "Healthier crops, smarter farms.",
    heroSub:
      "Upload a leaf photo, ask farming questions, and get hyper-local weather guidance — all in one place.",
    diagnoseNow: "Diagnose a crop",
    askAssistant: "Ask the assistant",
    statsScans: "Scans this month",
    statsAccuracy: "Diagnosis accuracy",
    statsFarmers: "Farmers helped",
    statsDiseases: "Diseases covered",
    quickActions: "Quick actions",
    features: "What's inside",
    uploadTitle: "Upload a leaf image",
    uploadHint: "Drag & drop or click to browse. JPG, PNG, WebP up to 10 MB.",
    analyze: "Analyze image",
    analyzing: "Analyzing leaf…",
    symptoms: "Symptoms",
    treatment: "Treatment",
    prevention: "Prevention",
    confidence: "Confidence",
    chatPlaceholder: "Ask anything about your crops…",
    send: "Send",
    today: "Today",
    forecast: "7-day forecast",
    farmingTips: "Farming recommendations",
  },
  te: {
    appName: "క్రాప్ డాక్టర్ AI",
    tagline: "AI ఆధారిత పంట వ్యాధి నిర్ధారణ & వ్యవసాయ మార్గదర్శనం",
    dashboard: "డాష్‌బోర్డ్",
    detection: "వ్యాధి గుర్తింపు",
    assistant: "రైతు సహాయకుడు",
    weather: "వాతావరణ సలహాదారు",
    about: "గురించి",
    heroTitle: "ఆరోగ్యకరమైన పంటలు, తెలివైన వ్యవసాయం.",
    heroSub: "ఆకు ఫోటో అప్‌లోడ్ చేయండి, ప్రశ్నలు అడగండి, స్థానిక వాతావరణ సలహా పొందండి.",
    diagnoseNow: "పంటను నిర్ధారించండి",
    askAssistant: "సహాయకుడిని అడగండి",
    statsScans: "ఈ నెల స్కాన్‌లు",
    statsAccuracy: "నిర్ధారణ ఖచ్చితత్వం",
    statsFarmers: "సహాయపడిన రైతులు",
    statsDiseases: "వ్యాధుల కవరేజ్",
    quickActions: "త్వరిత చర్యలు",
    features: "ఏమి ఉంది",
    uploadTitle: "ఆకు చిత్రాన్ని అప్‌లోడ్ చేయండి",
    uploadHint: "డ్రాగ్ & డ్రాప్ లేదా క్లిక్ చేయండి. JPG, PNG, WebP 10MB వరకు.",
    analyze: "విశ్లేషించండి",
    analyzing: "విశ్లేషిస్తోంది…",
    symptoms: "లక్షణాలు",
    treatment: "చికిత్స",
    prevention: "నివారణ",
    confidence: "నమ్మకం",
    chatPlaceholder: "మీ పంటల గురించి అడగండి…",
    send: "పంపండి",
    today: "ఈరోజు",
    forecast: "7-రోజుల అంచనా",
    farmingTips: "వ్యవసాయ సిఫార్సులు",
  },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (typeof translations)["en"];
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
