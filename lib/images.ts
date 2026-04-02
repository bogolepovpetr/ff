/**
 * Resolves entity keys to static image paths under /img/.
 *
 * Image layout (public/img/):
 *   buildings:  _frog/buildings/{base}.png  (strips _N suffix for resource dupes)
 *   troops:     troops/{troopKey}.png       (key = e.g. cat_barracks_10)
 *   skills:     skills/{key}.jpg
 *   leads:      leads/{key}.png
 *   icons:      icon/{name}.svg
 */

function stripResourceSuffix(key: string): string {
  return key.replace(/_\d+$/, "");
}

export function buildingImage(key: string): string {
  return `/img/_frog/buildings/${stripResourceSuffix(key)}.png`;
}

export function troopImage(troopKey: string): string {
  return `/img/troops/${troopKey}.png`;
}

export function skillImage(key: string): string {
  return `/img/skills/${key}.jpg`;
}

export function heroImage(key: string): string {
  return `/img/leads/${key}.png`;
}

export function iconSvg(name: string): string {
  return `/img/icon/${name}.svg`;
}

export function raceBuildings(race: string, key: string): string {
  return `/img/_${race}/buildings/${stripResourceSuffix(key)}.png`;
}
