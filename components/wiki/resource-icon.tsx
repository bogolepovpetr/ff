"use client";

export type ResourceKey = "food" | "wood" | "stone" | "gem";

const SVG_ICON: Partial<Record<ResourceKey, string>> = {
  food: "/img/icon/food.svg",
  wood: "/img/icon/wood.png",
  stone: "/img/icon/stone.svg",
  gem: "/img/icon/gem.png",
};

export function ResourceIcon({
  res,
  className = "h-4 w-4",
}: {
  res: ResourceKey;
  className?: string;
}) {
  const src = SVG_ICON[res];
  if (src) {
    return <img src={src} alt={res} className={className} />;
  }
  return null;
}

