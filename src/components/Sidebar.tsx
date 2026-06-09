import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ScanLine,
  MessageCircle,
  CloudSun,
  Info,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Sidebar() {
  const { t } = useLanguage();

  const location = useLocation();
  const pathname = location.pathname;

  const items = [
    {
      to: "/",
      label: t.dashboard,
      icon: LayoutDashboard,
    },
    {
      to: "/detection",
      label: t.detection,
      icon: ScanLine,
    },
    {
      to: "/assistant",
      label: t.assistant,
      icon: MessageCircle,
    },
    {
      to: "/weather",
      label: t.weather,
      icon: CloudSun,
    },
    {
      to: "/about",
      label: t.about,
      icon: Info,
    },
  ];

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col gap-1 sticky top-[73px] self-start p-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 py-2">
        Navigation
      </div>

      {items.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;

        return (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              active
                ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
            }`}
          >
            <Icon
              className={`h-4 w-4 ${
                active ? "text-primary" : ""
              }`}
            />

            {label}
          </Link>
        );
      })}

      <div className="mt-auto glass-card rounded-2xl p-4">
        <div className="text-xs font-semibold text-foreground">
          Pro Tip
        </div>

        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Photograph leaves in natural daylight for the most
          accurate diagnosis.
        </p>
      </div>
    </aside>
  );
}