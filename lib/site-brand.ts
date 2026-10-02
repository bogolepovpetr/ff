/**
 * Отображаемое имя сайта (шапка, H1, футер, часть &lt;title&gt;).
 * После смены — закоммитьте и на VPS: git pull && пересборка контейнера/приложения.
 */
export const WIKI_DISPLAY_NAME = "FOMO Fighters Wiki";

/** Короткое имя игры в подзаголовках и текстах. */
export const GAME_DISPLAY_NAME = "FOMO Fighters";

/** Вторая часть дефолтного title в браузере (после «—»). */
export const SITE_TITLE_TAGLINE = "Buildings, Troops & Skills";

export const SITE_METADATA_DESCRIPTION =
  "The official FOMO Fighters game wiki. Browse buildings, troops, skills, progression tables and strategy guides.";

export function rootMetadataTitle(): string {
  return `${WIKI_DISPLAY_NAME} — ${SITE_TITLE_TAGLINE}`;
}
