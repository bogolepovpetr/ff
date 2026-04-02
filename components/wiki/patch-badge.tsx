import { RefreshCw } from "lucide-react";

type Props = {
  gameVersion: string;
  dataUpdated: string;
  lang: string;
};

export default function PatchBadge({ gameVersion, dataUpdated, lang }: Props) {
  const dateStr = new Date(`${dataUpdated}T12:00:00Z`).toLocaleDateString(
    lang === "ru" ? "ru-RU" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    },
  );

  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
      <RefreshCw className="h-3 w-3" />
      <span>
        {lang === "ru" ? "Актуально для" : "Up to date for"}{" "}
        <span className="font-semibold">v{gameVersion}</span>
        {" — "}
        {lang === "ru" ? "обновлено" : "updated"} {dateStr}
      </span>
    </div>
  );
}
