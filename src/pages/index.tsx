import { Link } from "react-router-dom";
import {
  ScanLine,
  MessageCircle,
  CloudSun,
  TrendingUp,
  Leaf,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />

        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold mb-4">
            <Sparkles className="h-3 w-3" />
            AI · Computer Vision · Agronomy
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold leading-[1.1]">
            {t.heroTitle}
          </h1>

          <p className="mt-4 text-base sm:text-lg opacity-90 max-w-xl">{t.heroSub}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/detection"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-primary px-5 py-3 text-sm font-bold hover:-translate-y-0.5 transition-transform shadow-lg"
            >
              <ScanLine className="h-4 w-4" />
              {t.diagnoseNow}
            </Link>

            <Link
              to="/assistant"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur text-white border border-white/30 px-5 py-3 text-sm font-bold hover:bg-white/25 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              {t.askAssistant}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ScanLine} label="Image input" value="Photo" trend="Upload / camera" />
        <StatCard
          icon={TrendingUp}
          label="Visual confidence"
          value="Qualitative"
          trend="No accuracy claim"
        />
        <StatCard
          icon={Users}
          label="Crop assessment"
          value="Multi-crop"
          trend="When identifiable"
        />
        <StatCard icon={Leaf} label="Image formats" value="JPG / PNG" trend="WebP too" />
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="font-display text-xl font-bold mb-4">{t.quickActions}</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            to="/detection"
            icon={ScanLine}
            title="Diagnose a leaf"
            desc="Upload a photo for a preliminary visual assessment and cautious care guidance."
            color="from-primary/15 to-primary/5"
          />

          <QuickAction
            to="/assistant"
            icon={MessageCircle}
            title="Ask the assistant"
            desc="Chat with our agronomy expert about any crop concern."
            color="from-accent/30 to-accent/5"
          />

          <QuickAction
            to="/weather"
            icon={CloudSun}
            title="Check the weather"
            desc="7-day forecast with hyper-local farming recommendations."
            color="from-success/20 to-success/5"
          />
        </div>
      </section>

      {/* Features */}
      <section className="glass-card rounded-3xl p-7">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
          <h2 className="font-display text-xl font-bold">{t.features}</h2>

          <span className="text-xs text-muted-foreground">Built for modern farms</span>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <Feature
            icon={Leaf}
            title="Disease Detection"
            desc="Google Gemini vision examines your uploaded crop photo and reports visible evidence and uncertainty."
          />

          <Feature
            icon={ShieldCheck}
            title="Suggested Care"
            desc="Preliminary care guidance with agricultural specialist confirmation before chemical use."
          />

          <Feature
            icon={Users}
            title="Farmer-first UX"
            desc="Available in English and Telugu, mobile-first, works on slow networks."
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: typeof Leaf;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
          {trend}
        </span>
      </div>

      <div className="mt-3 font-display text-2xl font-bold">{value}</div>

      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  desc,
  color,
}: {
  to: string;
  icon: typeof Leaf;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <Link
      to={to}
      className={`group glass-card rounded-2xl p-5 hover:-translate-y-1 transition-transform bg-gradient-to-br ${color}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background/80 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>

      <div className="font-display font-semibold">{title}</div>

      <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</div>
    </Link>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: typeof Leaf; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-muted/30 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-hero mb-3">
        <Icon className="h-5 w-5" />
      </div>

      <div className="font-display font-semibold">{title}</div>

      <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</div>
    </div>
  );
}
