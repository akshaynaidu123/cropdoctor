// Mock farmer-assistant chat with bilingual (English + Telugu) support.
export type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

// Detect Telugu script in input
function isTelugu(text: string): boolean {
  return /[\u0C00-\u0C7F]/.test(text);
}

type Reply = { en: string; te: string };

const CANNED: Reply[] = [
  {
    en: "For yellowing tomato leaves, check for nitrogen deficiency first — apply a 2% urea foliar spray and re-evaluate after 5 days.",
    te: "టమోటా ఆకులు పసుపు రంగులోకి మారితే మొదట నత్రజని లోపాన్ని పరిశీలించండి — 2% యూరియా ద్రావణాన్ని ఆకులపై పిచికారీ చేసి 5 రోజుల తర్వాత పరిశీలించండి.",
  },
  {
    en: "The best paddy sowing window in coastal Andhra is mid-June to early July, right after the first monsoon showers.",
    te: "కోస్తా ఆంధ్రలో వరి విత్తనాలు వేయడానికి ఉత్తమ సమయం జూన్ మధ్య నుండి జూలై మొదటి వారం వరకు — తొలి వర్షాల తర్వాత.",
  },
  {
    en: "Neem oil (5 ml/L) mixed with a mild detergent surfactant is the most effective organic spray against aphids on chilli.",
    te: "మిర్చిపై పేనుబంక నివారణకు వేప నూనె (లీటరుకు 5 మి.లీ) + కొద్దిగా డిటర్జెంట్ కలిపి పిచికారీ చేయడం అత్యంత ప్రభావవంతమైన సేంద్రియ పద్ధతి.",
  },
  {
    en: "Soil pH below 6 reduces phosphorus uptake. Apply about 200 kg/acre of agricultural lime before the next sowing.",
    te: "నేల pH 6 కంటే తక్కువగా ఉంటే భాస్వరం గ్రహణ తగ్గుతుంది. తదుపరి విత్తనం వేయడానికి ముందు ఎకరానికి సుమారు 200 కిలోల వ్యవసాయ సున్నం వేయండి.",
  },
  {
    en: "Drip irrigation can cut water usage by 40% in cotton while increasing yields by 15–20%.",
    te: "డ్రిప్ నీటిపారుదల పత్తిలో నీటి వినియోగాన్ని 40% తగ్గించి, దిగుబడిని 15–20% పెంచుతుంది.",
  },
];

const WEATHER: Reply = {
  en: "Check the Weather Advisor for a 7-day local forecast. This week shows scattered showers Tue–Wed.",
  te: "7-రోజుల స్థానిక వాతావరణ సూచన కోసం వాతావరణ సలహాదారుని చూడండి. ఈ వారం మంగళ–బుధవారాల్లో చెదురుమదురు జల్లులు ఉండే అవకాశం ఉంది.",
};

const MARKET: Reply = {
  en: "I can't fetch live mandi prices yet, but most Telangana markets quote cotton at ₹7,200–₹7,800/quintal this week.",
  te: "ప్రత్యక్ష మండి ధరలు ఇంకా అందుబాటులో లేవు, కానీ ఈ వారం చాలా తెలంగాణ మార్కెట్లలో పత్తి క్వింటాల్‌కు ₹7,200–₹7,800 మధ్య పలుకుతోంది.",
};

export async function askAssistant(question: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 900));
  const te = isTelugu(question);
  const pick = (r: Reply) => (te ? r.te : r.en);

  if (/weather|rain|monsoon|వాతావరణ|వర్ష|వాన|రుతుపవన/i.test(question)) return pick(WEATHER);
  if (/price|market|mandi|ధర|మార్కెట్|మండి/i.test(question)) return pick(MARKET);

  return pick(CANNED[Math.floor(Math.random() * CANNED.length)]);
}
