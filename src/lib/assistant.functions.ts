import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const Input = z.object({
  question: z.string().min(1).max(2000),
  language: z.enum(["en", "te"]).default("en"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      }),
    )
    .max(20)
    .default([]),
});

export const askFarmerAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const systemEn = `You are "Crop Doctor AI", an expert agronomist assistant for Indian farmers (especially Andhra Pradesh & Telangana).
- Give practical, specific, actionable advice on crops, pests, diseases, soil, irrigation, fertilizers, weather, and markets.
- Prefer organic / IPM solutions first, then chemical options with exact dosages (g/L or kg/acre).
- Mention local context (kharif/rabi seasons, common regional crops like paddy, cotton, chilli, tomato, groundnut).
- Keep answers concise (under 180 words), use short bullet points when helpful.
- If unsure, say so and suggest contacting the local Krishi Vigyan Kendra.`;

    const systemTe = `మీరు "క్రాప్ డాక్టర్ AI" — భారతీయ రైతుల (ముఖ్యంగా ఆంధ్రప్రదేశ్ & తెలంగాణ) కోసం నిపుణుడైన వ్యవసాయ సహాయకుడు.
- పంటలు, చీడపీడలు, వ్యాధులు, నేల, నీటిపారుదల, ఎరువులు, వాతావరణం, మార్కెట్‌ల గురించి ఆచరణాత్మక, నిర్దిష్ట సలహాలు ఇవ్వండి.
- మొదట సేంద్రియ / IPM పరిష్కారాలు, తర్వాత రసాయన మందులు ఖచ్చితమైన మోతాదులతో (గ్రా/లీ లేదా కిలో/ఎకరం) సూచించండి.
- స్థానిక సందర్భం (ఖరీఫ్/రబీ సీజన్లు, వరి, పత్తి, మిర్చి, టమోటా, వేరుశనగ వంటి ప్రాంతీయ పంటలు) ప్రస్తావించండి.
- సమాధానాలు 180 పదాలలోపు, చిన్న బుల్లెట్ పాయింట్లతో సంక్షిప్తంగా ఉంచండి.
- సమాధానం పూర్తిగా **తెలుగులో** మాత్రమే ఇవ్వండి.
- ఖచ్చితంగా తెలియకపోతే, స్థానిక కృషి విజ్ఞాన కేంద్రాన్ని సంప్రదించమని సూచించండి.`;

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system: data.language === "te" ? systemTe : systemEn,
        messages: [
          ...data.history.map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content: data.question },
        ],
      });
      return { reply: text.trim() };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/429/.test(msg)) {
        return {
          reply:
            data.language === "te"
              ? "ప్రస్తుతం చాలా అభ్యర్థనలు వస్తున్నాయి. దయచేసి కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి."
              : "Too many requests right now. Please try again in a moment.",
        };
      }
      if (/402/.test(msg)) {
        return {
          reply:
            data.language === "te"
              ? "AI క్రెడిట్‌లు అయిపోయాయి. దయచేసి Lovable వర్క్‌స్పేస్‌లో క్రెడిట్‌లు జోడించండి."
              : "AI credits exhausted. Please add credits in your Lovable workspace.",
        };
      }
      throw err;
    }
  });
