import Link from "next/link";
import {
  Building2,
  Swords,
  FlaskConical,
  Users,
  ScrollText,
  Newspaper,
  Trophy,
  Coins,
} from "lucide-react";
import { getGameVersion } from "@/lib/version";
import PatchBadge from "@/components/wiki/patch-badge";

const CATEGORIES = [
  {
    key: "buildings",
    icon: Building2,
    en: "Buildings",
    ru: "Здания",
    descEn: "Construct and upgrade your city structures",
    descRu: "Стройте и улучшайте сооружения вашего города",
    color: "border-blue-300 bg-blue-50 hover:bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    key: "troops",
    icon: Swords,
    en: "Troops",
    ru: "Войска",
    descEn: "Train and command your armies",
    descRu: "Обучайте и командуйте армиями",
    color: "border-red-300 bg-red-50 hover:bg-red-100",
    iconColor: "text-red-600",
  },
  {
    key: "skills",
    icon: FlaskConical,
    en: "Skills",
    ru: "Навыки",
    descEn: "Research technologies in the Academy",
    descRu: "Исследуйте технологии в Академии",
    color: "border-violet-300 bg-violet-50 hover:bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    key: "heroes",
    icon: Users,
    en: "Heroes",
    ru: "Герои",
    descEn: "Legendary commanders to lead your forces",
    descRu: "Легендарные командиры во главе ваших войск",
    color: "border-amber-300 bg-amber-50 hover:bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    key: "war",
    icon: Coins,
    en: "WAR",
    ru: "WAR",
    descEn: "Seasonal goal: earn $WAR, buyback, and USDT",
    descRu: "Цель сезона: $WAR, buyback и USDT",
    color: "border-emerald-300 bg-emerald-50 hover:bg-emerald-100",
    iconColor: "text-emerald-700",
  },
  {
    key: "quests",
    icon: ScrollText,
    en: "Daily Quests",
    ru: "Ежедневные задания",
    descEn: "Complete objectives for daily rewards",
    descRu: "Выполняйте задания для получения наград",
    color: "border-emerald-300 bg-emerald-50 hover:bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    key: "clans",
    icon: Users,
    en: "Clans",
    ru: "Кланы",
    descEn: "Levels, ranks, rewards, and clan war rules",
    descRu: "Уровни, ранги, награды и правила клановой войны",
    color: "border-zinc-300 bg-zinc-50 hover:bg-zinc-100",
    iconColor: "text-zinc-700",
  },
  {
    key: "referral",
    icon: Trophy,
    en: "Referral",
    ru: "Рефералы",
    descEn: "Invite friends, earn gems, and get rev share",
    descRu: "Приглашайте друзей, получайте гемы и rev share",
    color: "border-sky-300 bg-sky-50 hover:bg-sky-100",
    iconColor: "text-sky-700",
  },
];

const QUICK_LINKS = [
  { href: "/troops/barracks/1", en: "Barracks Troops", ru: "Войска казармы", icon: "🗡️" },
  { href: "/troops/archery_range/1", en: "Archers", ru: "Стрельцы", icon: "🏹" },
  { href: "/troops/stable/1", en: "Cavalry", ru: "Кавалерия", icon: "🐎" },
  { href: "/troops/siege_workshop/1", en: "Siege Units", ru: "Осадные орудия", icon: "💥" },
  { href: "/skills", en: "Skill Tree", ru: "Древо навыков", icon: "🔬" },
  { href: "/heroes", en: "All Heroes", ru: "Все герои", icon: "⚔️" },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ver = getGameVersion();

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-emerald-50/90 via-amber-50/80 to-orange-50/70 shadow-sm">
        <div className="flex flex-col items-center gap-6 px-8 py-12 text-center md:flex-row md:text-left">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              FOMOFighters Wiki
            </h1>
            <p className="mt-2 text-lg text-primary">
              {lang === "ru"
                ? "Полное руководство по игре FOMOFighters"
                : "The comprehensive guide to FOMOFighters"}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {lang === "ru"
                ? "Добро пожаловать в вики FOMOFighters! Здесь вы найдёте полную информацию о зданиях, войсках, навыках и героях. Данные обновляются автоматически при каждом обновлении игрового баланса."
                : "Welcome to the FOMOFighters Wiki! Find complete information on buildings, troops, skills, and heroes. Data updates automatically with every game balance patch."}
            </p>
          </div>
          <div className="hidden shrink-0 md:block">
            <img
              src="/img/_frog/buildings/castle.png"
              alt="FOMOFighters"
              className="h-32 w-32 rounded-2xl object-cover shadow-lg ring-2 ring-primary/20"
            />
          </div>
        </div>
      </section>

      <PatchBadge gameVersion={ver.gameVersion} dataUpdated={ver.dataUpdated} lang={lang} />

      {/* Navigation grid */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-800">
          {lang === "ru" ? "Разделы вики" : "Wiki Sections"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.key}
                href={`/${lang}/${cat.key}`}
                className={`group flex items-start gap-4 rounded-xl border-2 p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${cat.color}`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${cat.iconColor}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">
                    {lang === "ru" ? cat.ru : cat.en}
                  </h3>
                  <p className="mt-0.5 text-sm text-zinc-600">
                    {lang === "ru" ? cat.descRu : cat.descEn}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-800">
          {lang === "ru" ? "Быстрые ссылки" : "Quick Links"}
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((lnk) => (
            <Link
              key={lnk.href}
              href={`/${lang}${lnk.href}`}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm transition-colors hover:border-amber-300 hover:bg-amber-50"
            >
              <span className="text-lg">{lnk.icon}</span>
              <span className="font-medium text-zinc-700">
                {lang === "ru" ? lnk.ru : lnk.en}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Getting started guide */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
          <Trophy className="h-5 w-5 text-amber-500" />
          {lang === "ru" ? "С чего начать" : "Getting Started"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <GuideCard
            step={1}
            title={lang === "ru" ? "Постройте базу" : "Build Your Base"}
            desc={
              lang === "ru"
                ? "Улучшайте Замок и ресурсные здания, чтобы открыть новые механики и ускорить прогресс."
                : "Upgrade your Castle and resource buildings to unlock mechanics and speed up progression."
            }
            href={`/${lang}/buildings`}
            linkText={lang === "ru" ? "Здания →" : "Buildings →"}
          />
          <GuideCard
            step={2}
            title={lang === "ru" ? "Соберите армию" : "Build an Army"}
            desc={
              lang === "ru"
                ? "Обучайте войска и отправляйте их в активности — PvE и клановые войны завязаны на силе армии."
                : "Train troops and use them in activities—PvE and clan wars are driven by army power."
            }
            href={`/${lang}/troops`}
            linkText={lang === "ru" ? "Войска →" : "Troops →"}
          />
          <GuideCard
            step={3}
            title={lang === "ru" ? "Прокачайте навыки" : "Upgrade Skills"}
            desc={
              lang === "ru"
                ? "Академия открывает новые тиры и даёт бонусы экономике/бою — это один из главных мультипликаторов."
                : "The Academy unlocks tiers and grants economy/combat bonuses—one of the biggest multipliers."
            }
            href={`/${lang}/skills`}
            linkText={lang === "ru" ? "Навыки →" : "Skills →"}
          />
          <GuideCard
            step={4}
            title={lang === "ru" ? "Присоединитесь к клану" : "Join a Clan"}
            desc={
              lang === "ru"
                ? "Клан даёт уровни, ранги и награды, а также открывает клановую войну с $WAR."
                : "Clans add levels, ranks, rewards, and unlock clan wars with $WAR."
            }
            href={`/${lang}/clans`}
            linkText={lang === "ru" ? "Кланы →" : "Clans →"}
          />
          <GuideCard
            step={5}
            title={lang === "ru" ? "Пригласите друзей" : "Invite friends"}
            desc={
              lang === "ru"
                ? "Реферальная система даёт награды за приглашения и rev share — один из лучших источников гемов."
                : "Referrals give you rewards for invites and rev share—one of the best gem sources."
            }
            href={`/${lang}/referral`}
            linkText={lang === "ru" ? "Рефералы →" : "Referral →"}
          />
          <GuideCard
            step={6}
            title={lang === "ru" ? "Зарабатывайте WAR points" : "Earn WAR points"}
            desc={
              lang === "ru"
                ? "Основная цель сезона — накапливать $WAR через клановые войны и участвовать в buyback."
                : "The main seasonal goal is to accumulate $WAR through clan wars and take part in the buyback."
            }
            href={`/${lang}/war`}
            linkText={lang === "ru" ? "WAR →" : "WAR →"}
          />
        </div>
      </section>

      {/* Latest patch */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-800">
          <Newspaper className="h-5 w-5 text-zinc-500" />
          {lang === "ru" ? "Последнее обновление" : "Latest Patch"}
        </h2>
        <div className="rounded-lg bg-zinc-50 p-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              v{ver.gameVersion}
            </span>
            <span className="text-xs text-zinc-400">{ver.dataUpdated}</span>
          </div>
          <p className="mt-2 text-sm text-zinc-600">{ver.patchNotes}</p>
        </div>
      </section>
    </div>
  );
}

function GuideCard({
  step,
  title,
  desc,
  href,
  linkText,
}: {
  step: number;
  title: string;
  desc: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-zinc-100 p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
        {step}
      </div>
      <div>
        <h3 className="font-semibold text-zinc-800">{title}</h3>
        <p className="mt-1 text-sm text-zinc-500">{desc}</p>
        <Link href={href} className="mt-2 inline-block text-sm font-medium text-amber-700 hover:text-amber-600">
          {linkText}
        </Link>
      </div>
    </div>
  );
}
