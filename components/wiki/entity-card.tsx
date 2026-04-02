import Link from "next/link";
import ImagePlaceholder from "./image-placeholder";

export default function EntityCard({
  href,
  title,
  subtitle,
  meta,
}: {
  href: string;
  title: string;
  subtitle?: string;
  meta?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 transition-all hover:border-amber-300 hover:shadow-md"
    >
      <ImagePlaceholder size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-zinc-800 group-hover:text-amber-700 transition-colors">
          {title}
        </p>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-zinc-500">{subtitle}</p>
        )}
        {meta && (
          <p className="mt-0.5 text-xs text-zinc-400">{meta}</p>
        )}
      </div>
    </Link>
  );
}
