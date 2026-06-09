import { Link, useLocation } from "react-router-dom";
import { Sprout, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";

export function Navbar() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const pathname = location.pathname;

  const links = [
    { to: "/", label: t.dashboard },
    { to: "/detection", label: t.detection },
    { to: "/assistant", label: t.assistant },
    { to: "/weather", label: t.weather },
    { to: "/about", label: t.about },
  ];

  return (
    <header className="sticky top-0 z-40 glass-card border-b border-border/60 rounded-none backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-hero">
            <Sprout className="h-5 w-5" />
          </div>

          <div className="leading-tight">
            <div className="font-display text-base font-bold">
              {t.appName}
            </div>

            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              AI · Agri · 2026
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <LanguageToggle />

          <button
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-card"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="md:hidden border-t border-border/60 px-4 pb-4 pt-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent/40"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}