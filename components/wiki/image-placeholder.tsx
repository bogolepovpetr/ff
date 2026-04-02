import { ImageIcon } from "lucide-react";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_CLASSES: Record<Size, string> = {
  xs: "h-10 w-10",
  sm: "h-14 w-14",
  md: "h-24 w-24",
  lg: "h-40 w-40",
  xl: "h-56 w-56",
};

const ICON_CLASSES: Record<Size, string> = {
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

export default function ImagePlaceholder({
  size = "md",
  className = "",
}: {
  size?: Size;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg bg-zinc-200 text-zinc-400 ${SIZE_CLASSES[size]} ${className}`}
    >
      <ImageIcon className={ICON_CLASSES[size]} />
    </div>
  );
}
