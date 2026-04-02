"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Swords, Globe } from "lucide-react";

const NAV_ITEMS = [
  { key: "buildings", en: "Buildings", ru: "Здания" },
  { key: "troops", en: "Troops", ru: "Войска" },
  { key: "skills", en: "Skills", ru: "Навыки" },
  { key: "heroes", en: "Heroes", ru: "Герои" },
  { key: "war", en: "WAR", ru: "WAR" },
  { key: "clans", en: "Clans", ru: "Кланы" },
  { key: "referral", en: "Referral", ru: "Рефералы" },
  { key: "quests", en: "Quests", ru: "Задания" },
];

export default function WikiHeader({ lang }: { lang: string }) {
  const pathname = usePathname();
  const targetLang = lang === "ru" ? "en" : "ru";

  const swapUrl = (() => {
    const parts = pathname.split("/");
    if (parts.length >= 2) parts[1] = targetLang;
    return parts.join("/") || `/${targetLang}`;
  })();

  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        {/* Top row */}
        <div className="flex items-center justify-between py-3">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-2.5 text-xl font-bold text-primary transition-colors hover:text-primary/85"
          >
            <Swords className="h-6 w-6" />
            <span>FomoFighters Wiki</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={swapUrl}
              className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              <Globe className="h-3.5 w-3.5" />
              {targetLang === "ru" ? "Русский" : "English"}
            </Link>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex gap-0.5" role="tablist">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(`/${lang}/${item.key}`);
            return (
              <Link
                key={item.key}
                href={`/${lang}/${item.key}`}
                role="tab"
                aria-selected={active}
                className={`rounded-t-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-background text-foreground shadow-[0_-1px_0_0_var(--border)]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {lang === "ru" ? item.ru : item.en}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
