export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function isTelugu(text: string): boolean {
  return /[\u0C00-\u0C7F]/.test(text);
}

type Reply = {
  en: string;
  te: string;
};

const RESPONSES: Reply[] = [
  {
    en: "For yellowing tomato leaves, check nitrogen deficiency first.",
    te: "టమోటా ఆకులు పసుపు రంగులోకి మారితే మొదట నత్రజని లోపాన్ని పరిశీలించండి.",
  },
  {
    en: "Neem oil (5 ml/L) is effective against aphids.",
    te: "పేనుబంక నివారణకు వేపనూనె ప్రభావవంతమైనది.",
  },
  {
    en: "The ideal paddy sowing period is mid-June to early July.",
    te: "వరి విత్తడానికి ఉత్తమ సమయం జూన్ మధ్య నుండి జూలై మొదటి వారం వరకు.",
  },
];

export async function askAssistant(
  question: string
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const telugu = isTelugu(question);

  const response =
    RESPONSES[Math.floor(Math.random() * RESPONSES.length)];

  return telugu ? response.te : response.en;
}
