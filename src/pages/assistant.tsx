import { ChatBot } from "@/components/ChatBot";
import { MessageCircle } from "lucide-react";

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl btn-hero">
          <MessageCircle className="h-6 w-6" />
        </div>

        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Farmer Assistant
          </h1>

          <p className="text-sm text-muted-foreground">
            Your 24/7 agronomy expert — ask anything about farming.
          </p>
        </div>
      </header>

      <ChatBot />
    </div>
  );
}