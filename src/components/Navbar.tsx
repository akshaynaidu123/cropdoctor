import { Link, useRouterState } from "@tanstack/react-router";
import { Sprout, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";

export function Navbar() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const links = [
    { to: "/", label: t.dashboard },
    { to: "/detection", label: t.detection },
    { to: "/assistant", label: t.assistant },
    { to: "/weather", label: t.weather },
    { to: "/about", label: t.about },
  ] as const;

  return (
    <header className="sticky top-0 z-40 glass-card border-b border-border/60 rounded-none backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-hero">
            <Sprout className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold">{t.appName}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">AI · Agri · 2026</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-card"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 px-4 pb-4 pt-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent/40"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
