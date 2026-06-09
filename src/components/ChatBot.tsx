import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { askAssistant, type ChatMessage } from "@/services/api";
import { useLanguage } from "@/context/LanguageContext";

const SUGGESTIONS: Record<"en" | "te", string[]> = {
  en: [
    "Why are my tomato leaves turning yellow?",
    "Best time to sow paddy in Andhra Pradesh?",
    "Organic remedy for aphids on chilli?",
    "How to improve soil pH?",
  ],
  te: [
    "టమోటా ఆకులు పసుపు రంగులోకి ఎందుకు మారుతున్నాయి?",
    "ఆంధ్రప్రదేశ్‌లో వరి విత్తనాలు వేయడానికి ఉత్తమ సమయం?",
    "మిర్చిపై పేనుబంకకు సేంద్రియ నివారణ?",
    "నేల pH ను ఎలా మెరుగుపరచాలి?",
  ],
};

const INTRO: Record<"en" | "te", string> = {
  en: "Namaste! I'm your farming assistant. Ask me about crops, pests, soil, or weather — in English or Telugu.",
  te: "నమస్తే! నేను మీ వ్యవసాయ సహాయకుడిని. పంటలు, చీడపీడలు, నేల లేదా వాతావరణం గురించి తెలుగు లేదా ఇంగ్లీష్‌లో అడగండి.",
};

export function ChatBot() {
  const { t, lang } = useLanguage();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      content: INTRO[lang],
    },
  ]);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  useEffect(() => {
    setMessages((m) =>
      m.length === 1 && m[0].id === "init"
        ? [
            {
              id: "init",
              role: "assistant",
              content: INTRO[lang],
            },
          ]
        : m
    );
  }, [lang]);

  async function send(text: string) {
    const q = text.trim();

    if (!q || busy) return;

    setInput("");

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: q,
    };

    setMessages((m) => [...m, userMsg]);

    setBusy(true);

    try {
      const reply = await askAssistant(q);

      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            lang === "te"
              ? "క్షమించండి, సమాధానం పొందలేకపోయాను. దయచేసి మళ్లీ ప్రయత్నించండి."
              : "Sorry, I couldn't get a response. Please try again.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-card rounded-3xl flex flex-col h-[70vh] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-hero">
          <Sparkles className="h-5 w-5" />
        </div>

        <div>
          <div className="font-display font-semibold">
            Farmer Assistant
          </div>

          <div className="text-xs text-muted-foreground">
            Online · agriculture expert
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${
              m.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                m.role === "user"
                  ? "bg-accent text-accent-foreground"
                  : "btn-hero"
              }`}
            >
              {m.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted text-foreground rounded-tl-sm"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content}
                  </ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full btn-hero">
              <Sparkles className="h-4 w-4" />
            </div>

            <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.15s]" />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {SUGGESTIONS[lang].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-accent/40 hover:bg-accent text-accent-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-border/60 p-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chatPlaceholder}
          className="flex-1 rounded-xl bg-muted/60 border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <button
          type="submit"
          disabled={!input.trim() || busy}
          className="inline-flex items-center gap-1.5 rounded-xl btn-hero px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {t.send}
        </button>
      </form>
    </div>
  );
}