"use client";

import { skillImage } from "@/lib/images";

export default function SkillArt({
  lang,
  skillKey,
  skillTitle,
  fallbackIconKey,
}: {
  lang: string;
  skillKey: string;
  skillTitle: string;
  fallbackIconKey?: string;
}) {
  const fallbackSvg = fallbackIconKey
    ? `/img/icon/${fallbackIconKey}.svg`
    : "/img/icon/book_timer.svg";

  return (
    <div className="flex h-56 w-56 items-center justify-center rounded-lg bg-zinc-50 ring-1 ring-zinc-100">
      <img
        src={skillImage(skillKey)}
        alt={skillTitle}
        className="h-56 w-56 rounded-lg object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const el = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (el) el.style.display = "block";
        }}
      />
      <img
        src={fallbackSvg}
        alt={lang === "ru" ? "Иконка навыка" : "Skill icon"}
        className="hidden h-24 w-24 opacity-90"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}
