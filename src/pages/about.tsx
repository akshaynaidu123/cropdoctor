import {
  Sprout,
  Code2,
  Cpu,
  Database,
  Globe,
  Mail,
  Github,
  Heart,
} from "lucide-react";

const TECH = [
  { name: "React + Vite", icon: Code2, desc: "Modern, fast frontend stack" },
  { name: "Tailwind CSS", icon: Globe, desc: "Utility-first responsive design" },
  { name: "React Router", icon: Cpu, desc: "Client-side routing" },
  { name: "Vision Models", icon: Sprout, desc: "Deep learning for leaf diagnosis" },
  { name: "Node.js Services", icon: Database, desc: "Mock services ready for backend swap" },
  { name: "i18n: EN + TE", icon: Globe, desc: "Built for Indian farmers" },
];

const TEAM = [
  { name: "Aarav Reddy", role: "Founder · Agronomist", initials: "AR" },
  { name: "Priya Sharma", role: "ML Engineer", initials: "PS" },
  { name: "Karthik Naidu", role: "Full-stack Developer", initials: "KN" },
  { name: "Lakshmi Devi", role: "Field Operations", initials: "LD" },
];

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <section className="glass-card rounded-3xl p-8 sm:p-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          <Heart className="h-3 w-3" />
          Our mission
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight max-w-3xl">
          Empower every farmer with{" "}
          <span className="gradient-text">AI-grade</span> crop diagnosis and
          trusted guidance.
        </h1>

        <p className="mt-4 text-muted-foreground max-w-2xl leading-relaxed">
          Crop Doctor AI brings computer-vision diagnosis, agronomy expertise,
          and hyper-local weather insights to smallholder farms. We make modern
          agritech accessible — on any device, in any language, even on a slow
          network.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold mb-4">
          Key Features
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            [
              "Instant disease detection",
              "Identify 48+ diseases across 12 crops from a single leaf photo.",
            ],
            [
              "Expert treatment plans",
              "Symptoms, treatment, and prevention validated by agri universities.",
            ],
            [
              "AI farmer assistant",
              "Conversational guidance on pests, soil, irrigation and more.",
            ],
            [
              "Hyper-local weather",
              "7-day forecast with farming-aware recommendations.",
            ],
            [
              "English & Telugu",
              "Built-in language toggle for Indian farmers.",
            ],
            [
              "Mobile-first design",
              "Glassmorphism UI that works beautifully on every screen.",
            ],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="glass-card rounded-2xl p-5"
            >
              <div className="font-display font-semibold">
                {title}
              </div>

              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold mb-4">
          Technology Stack
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TECH.map(({ name, icon: Icon, desc }) => (
            <div
              key={name}
              className="glass-card rounded-2xl p-5 flex items-start gap-4"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Icon className="h-5 w-5" />
              </div>

              <div>
                <div className="font-semibold">{name}</div>

                <div className="text-xs text-muted-foreground mt-0.5">
                  {desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold mb-4">
          The Team
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="glass-card rounded-2xl p-5 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full btn-hero font-display text-lg font-bold">
                {member.initials}
              </div>

              <div className="mt-3 font-semibold">
                {member.name}
              </div>

              <div className="text-xs text-muted-foreground">
                {member.role}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-3xl p-7">
        <h2 className="font-display text-xl font-bold">
          Get In Touch
        </h2>

        <p className="text-sm text-muted-foreground mt-1">
          We love hearing from farmers, researchers and partners.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="mailto:hello@cropdoctor.ai"
            className="inline-flex items-center gap-2 rounded-xl btn-hero px-5 py-3 text-sm font-semibold"
          >
            <Mail className="h-4 w-4" />
            hello@cropdoctor.ai
          </a>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-accent/40"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </section>
    </div>
  );
}