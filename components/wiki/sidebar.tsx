import { ExternalLink } from "lucide-react";

const SOCIALS = [
  {
    name: "Telegram",
    desc: "Official channel",
    href: "https://t.me/fomofighters",
    bg: "bg-[#0088cc]",
    hover: "hover:bg-[#006699]",
  },
  {
    name: "Twitter / X",
    desc: "Follow @FomoFighters",
    href: "https://twitter.com/fomofighters",
    bg: "bg-zinc-900",
    hover: "hover:bg-zinc-800",
  },
  {
    name: "YouTube",
    desc: "Guides & gameplay",
    href: "https://youtube.com/@fomofighters",
    bg: "bg-[#FF0000]",
    hover: "hover:bg-[#CC0000]",
  },
  {
    name: "Google Play",
    desc: "Download the game",
    href: "https://play.google.com/store/apps/details?id=com.fomofighters",
    bg: "bg-emerald-600",
    hover: "hover:bg-emerald-700",
  },
];

export default function WikiSidebar() {
  return (
    <aside className="space-y-3">
      {SOCIALS.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`group block rounded-lg ${s.bg} ${s.hover} p-4 text-white transition-colors`}
        >
          <div className="flex items-center justify-between">
            <span className="text-base font-bold">{s.name}</span>
            <ExternalLink className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="mt-1 text-sm text-white/80">{s.desc}</p>
        </a>
      ))}

      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-zinc-800">Page Tools</h3>
        <ul className="mt-2 space-y-1 text-sm text-zinc-500">
          <li>
            <a href="#" className="hover:text-zinc-700 hover:underline">
              What links here
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-zinc-700 hover:underline">
              Related changes
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-zinc-700 hover:underline">
              Special pages
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}
