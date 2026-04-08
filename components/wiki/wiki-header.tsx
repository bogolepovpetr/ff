"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Swords, ChevronDown } from "lucide-react";

const NAV_ITEMS = [
  { key: "races", en: "Races", ru: "Расы" },
  { key: "buildings", en: "Buildings", ru: "Здания" },
  { key: "troops", en: "Troops", ru: "Войска" },
  { key: "battle-sim", en: "Battle sim", ru: "Симулятор боя" },
  { key: "skills", en: "Skills", ru: "Навыки" },
  { key: "heroes", en: "Heroes", ru: "Герои" },
  { key: "war", en: "WAR", ru: "WAR" },
  { key: "clans", en: "Clans", ru: "Кланы" },
  { key: "referral", en: "Referral", ru: "Рефералы" },
  { key: "quests", en: "Quests", ru: "Задания" },
];

const LANGS = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

function LangDropdown({ lang, pathname }: { lang: string; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  function buildUrl(target: string) {
    const parts = pathname.split("/");
    if (parts.length >= 2) parts[1] = target;
    return parts.join("/") || `/${target}`;
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 sm:px-3 sm:text-sm"
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span>{current.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-40 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {LANGS.map((l) => (
            <Link
              key={l.code}
              href={buildUrl(l.code)}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                l.code === lang
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span className="text-base leading-none">{l.flag}</span>
              <span>{l.label}</span>
              {l.code === lang && (
                <svg className="ml-auto h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WikiHeader({ lang }: { lang: string }) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
  }, [checkScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const active = el.querySelector("[data-active='true']") as HTMLElement | null;
    if (active) {
      active.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }, [pathname]);

  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        {/* Top row */}
        <div className="flex items-center justify-between py-3">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-2 text-lg font-bold text-primary transition-colors hover:text-primary/85 sm:gap-2.5 sm:text-xl"
          >
            <Swords className="h-5 w-5 sm:h-6 sm:w-6" />
            <span>FOMO Fighters Wiki</span>
          </Link>

          <LangDropdown lang={lang} pathname={pathname} />
        </div>

        {/* Scrollable tabs */}
        <div className="relative">
          {canScrollLeft && (
            <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-6 bg-gradient-to-r from-card to-transparent" />
          )}
          {canScrollRight && (
            <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-6 bg-gradient-to-l from-card to-transparent" />
          )}

          <div
            ref={scrollRef}
            className="-mx-4 flex gap-0.5 overflow-x-auto px-4 scrollbar-none"
            role="tablist"
          >
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(`/${lang}/${item.key}`);
              return (
                <Link
                  key={item.key}
                  href={`/${lang}/${item.key}`}
                  role="tab"
                  aria-selected={active}
                  data-active={active}
                  className={`shrink-0 rounded-t-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors sm:px-5 ${
                    active
                      ? "bg-background text-foreground shadow-[0_-1px_0_0_var(--border)]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {lang === "ru" ? item.ru : item.en}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
