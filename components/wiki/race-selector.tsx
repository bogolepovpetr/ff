"use client";

const RACE_META: Record<string, {
  img: string;
  accent: string;
  activeAccent: string;
  textColor: string;
}> = {
  cat: {
    img: "/img/avatars/cat_f_prem_huntress.png",
    accent: "border-rose-300 bg-rose-50",
    activeAccent: "border-rose-400 bg-rose-100 ring-2 ring-rose-300",
    textColor: "text-rose-800",
  },
  dog: {
    img: "/img/avatars/original/dog_prem_aviator.png",
    accent: "border-sky-300 bg-sky-50",
    activeAccent: "border-sky-400 bg-sky-100 ring-2 ring-sky-300",
    textColor: "text-sky-800",
  },
  frog: {
    img: "/img/avatars/original/frog_f_prem_princess.png",
    accent: "border-emerald-300 bg-emerald-50",
    activeAccent: "border-emerald-400 bg-emerald-100 ring-2 ring-emerald-300",
    textColor: "text-emerald-800",
  },
};

type RaceData = {
  key: string;
  title: string;
  desc?: string;
};

type Props = {
  lang: string;
  races: RaceData[];
  selectedRace: string;
  onSelect: (race: string) => void;
};

export default function RaceSelector({ lang, races, selectedRace, onSelect }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {races.map((race) => {
        const meta = RACE_META[race.key];
        if (!meta) return null;
        const active = selectedRace === race.key;
        return (
          <button
            key={race.key}
            onClick={() => onSelect(race.key)}
            className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all sm:flex-col sm:items-center sm:gap-2 sm:p-4 sm:text-center ${
              active ? meta.activeAccent : `${meta.accent} hover:shadow-md`
            }`}
          >
            <img
              src={meta.img}
              alt={race.title}
              className="h-16 w-16 shrink-0 rounded-xl object-contain sm:h-24 sm:w-24"
            />
            <div className="min-w-0">
              <p className={`text-sm font-bold ${meta.textColor}`}>
                {race.title}
              </p>
              {race.desc && (
                <p className="mt-0.5 text-xs leading-snug text-zinc-500">
                  {race.desc}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export { RACE_META };
