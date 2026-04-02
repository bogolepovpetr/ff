import { getSkillTreeData } from "@/lib/data";
import { getLore } from "@/lib/lore";
import SkillTree from "@/components/wiki/skill-tree";

export default async function SkillsIndex({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const lore = getLore("skills", lang);
  const trees = getSkillTreeData();

  const categoryLabels = [
    { key: "Economic", label: lang === "ru" ? "Экономический" : "Economic" },
    { key: "Military", label: lang === "ru" ? "Боевые действия" : "Military" },
  ].filter((c) => trees[c.key]);

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-violet-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">{lore.title}</h1>
        <p className="mt-1 text-sm font-medium text-amber-700">
          {lore.subtitle}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
          {lore.intro}
        </p>
      </div>

      {/* Skill tree */}
      <SkillTree trees={trees} lang={lang} categoryLabels={categoryLabels} />
    </div>
  );
}
