# SEO & Artistic Text — Execution Plan

**Phase Goal:** Add unique SEO metadata and artistic descriptive text to all 145 pages on the Next.js wiki and Fandom wiki for FOMO Fighters.  
**Estimated Total Effort:** 3–4 hours Claude execution time  
**Total Text Strings:** 568 (EN + RU × loreQuote + seoDescription per entity)

---

## Dependency Graph

```
Task 1: Infrastructure
    ↓
Task 2: Generate Content (depends on Task 1 schema)
    ↓
Task 3: Wire Next.js  ←──┐
    │                     │ (both depend on Task 2)
Task 4: Wire Fandom   ←──┘
    ↓
Task 5: Verification (depends on Task 3 + 4)
```

**Parallelism:** Tasks 3 and 4 can run in parallel after Task 2 completes. Task 2 subtasks (2a–2e) can run in parallel with each other.

---

## Task 1: Infrastructure

**Effort:** ~15 min  
**Creates:** `data/seo-text.json`, `lib/seo-text.ts`  
**Depends on:** Nothing

### 1a. Create `data/seo-text.json`

Create the central data file with a skeleton structure matching all entity keys. The schema:

```json
{
  "buildings": {
    "<building_key>": {
      "en": { "loreQuote": "...", "seoDescription": "..." },
      "ru": { "loreQuote": "...", "seoDescription": "..." }
    }
  },
  "heroes": {
    "<hero_key>": {
      "en": { "loreQuote": "...", "seoDescription": "..." },
      "ru": { "loreQuote": "...", "seoDescription": "..." }
    }
  },
  "skills": {
    "<skill_key>": {
      "en": { "loreQuote": "...", "seoDescription": "..." },
      "ru": { "loreQuote": "...", "seoDescription": "..." }
    }
  },
  "troops": {
    "<building>_<tier>": {
      "en": { "loreQuote": "...", "seoDescription": "..." },
      "ru": { "loreQuote": "...", "seoDescription": "..." }
    }
  },
  "hubs": {
    "home":      { "en": { "seoDescription": "..." }, "ru": { "seoDescription": "..." } },
    "buildings": { "en": { "seoDescription": "..." }, "ru": { "seoDescription": "..." } },
    "troops":    { "en": { "seoDescription": "..." }, "ru": { "seoDescription": "..." } },
    "skills":    { "en": { "seoDescription": "..." }, "ru": { "seoDescription": "..." } },
    "heroes":    { "en": { "seoDescription": "..." }, "ru": { "seoDescription": "..." } },
    "quests":    { "en": { "seoDescription": "..." }, "ru": { "seoDescription": "..." } }
  }
}
```

**Key mapping for troops:** Use `<building>_<tier>` composite key (e.g. `barracks_1`, `archery_range_3`) since troop detail pages are routed by `[building]/[tier]`. This matches the URL structure and avoids ambiguity with individual troop names.

**Entity keys to include** (extract from data files during creation):
- **Buildings (22):** castle, farm_1, farm_2, farm_3, lumber_mill_1, lumber_mill_2, lumber_mill_3, quarry_1, quarry_2, quarry_3, barracks, archery_range, stable, siege_workshop, scout_camp, academy, storage, stash, market, tavern, hospital, fairground
- **Heroes (25):** All keys from `data/source/lists_leads.json`
- **Skills (67):** All keys from `data/source/lists_skills.json`
- **Troops (25):** 5 buildings × 5 tiers = barracks_1..5, archery_range_1..5, stable_1..5, siege_workshop_1..5, scout_camp_1..5

### 1b. Create `lib/seo-text.ts`

Typed loader that reads `data/seo-text.json` and provides accessor functions.

```typescript
import fs from "node:fs";
import path from "node:path";

type SeoEntry = {
  loreQuote?: string;
  seoDescription: string;
};

type SeoTextData = {
  buildings: Record<string, Record<string, SeoEntry>>;
  heroes: Record<string, Record<string, SeoEntry>>;
  skills: Record<string, Record<string, SeoEntry>>;
  troops: Record<string, Record<string, SeoEntry>>;
  hubs: Record<string, Record<string, SeoEntry>>;
};

let cached: SeoTextData | null = null;

function loadSeoText(): SeoTextData {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "data", "seo-text.json");
  cached = JSON.parse(fs.readFileSync(filePath, "utf8")) as SeoTextData;
  return cached;
}

export function getSeoText(
  category: "buildings" | "heroes" | "skills" | "troops" | "hubs",
  key: string,
  lang: string,
): SeoEntry | null {
  const data = loadSeoText();
  const entry = data[category]?.[key];
  if (!entry) return null;
  return entry[lang] ?? entry["en"] ?? null;
}
```

Pattern notes:
- Follows the same `fs.readFileSync` + `path.join(process.cwd(), ...)` pattern used by `lib/data.ts` (line 4)
- Caches result since JSON is read-only at runtime
- Falls back from RU → EN gracefully (same pattern as `lib/lore.ts` line 72)

### Verify

- `npx tsc --noEmit` passes
- `import { getSeoText } from "@/lib/seo-text"` resolves

### Done

- `data/seo-text.json` exists with correct schema and all entity keys (skeleton with placeholder values)
- `lib/seo-text.ts` exports `getSeoText()` with correct types

---

## Task 2: Generate SEO Text Content

**Effort:** ~90–120 min (split into subtasks due to volume)  
**Modifies:** `data/seo-text.json`  
**Depends on:** Task 1 (schema must exist)

This is the largest task. 568 text strings must be generated. Each subtask populates one entity category.

### Content Guidelines (apply to all subtasks)

**loreQuote** (2–3 sentences, artistic/evocative):
- Written in the voice of a game narrator addressing the player as "commander"
- Describes the entity's role, flavor, and strategic importance
- Should feel like in-game flavor text, NOT a wiki article
- EN: ~30–50 words. RU: independent artistic Russian (not a direct translation)

**seoDescription** (1–2 sentences, SEO-focused):
- Includes the entity name + "FomoFighters" for search discoverability
- Mentions key data the page contains (upgrade costs, stats, progression table, etc.)
- EN: ~20–35 words. RU: localized equivalent

### Context files to reference during generation

Each subtask should load the relevant JSON data file to extract entity names, types, tiers, desc fields, and other context needed to write meaningful text.

### 2a. Buildings (22 entities → 88 strings)

**Source data:** `data/source/lists_buildings.json`  
**Context needed per building:** `key`, `title`, `type`, `desc`, `levels.length`

Example output for `castle`:
```json
{
  "en": {
    "loreQuote": "The Castle stands at the heart of your kingdom, a towering monument to ambition and power. Every wall raised and every banner unfurled declares your intent to rule. All roads lead here, commander — for the Castle unlocks the destiny of your empire.",
    "seoDescription": "Castle building guide for FomoFighters. Full upgrade costs, requirements, unlock conditions, and level-by-level progression table."
  },
  "ru": {
    "loreQuote": "Замок возвышается в самом сердце вашего королевства — величественный памятник амбициям и власти. Каждая возведённая стена и каждое развёрнутое знамя заявляют о вашем намерении править. Все дороги ведут сюда, командир — ибо Замок определяет судьбу вашей империи.",
    "seoDescription": "Гайд по зданию Замок в FomoFighters. Полная таблица стоимости улучшений, требований и прогрессии по уровням."
  }
}
```

### 2b. Heroes (25 entities → 100 strings)

**Source data:** `data/source/lists_leads.json`  
**Context needed per hero:** `key`, `title`, `desc`, `tier`, `aspect`, `role`, `bonusPerLevel`

Use the hero's existing `desc` field (mythological flavor) as inspiration but write something longer and more evocative. Mention the hero's tier, aspect, and role in the seoDescription.

### 2c. Skills (67 entities → 268 strings)

**Source data:** `data/source/lists_skills.json`  
**Context needed per skill:** `key`, `title`, `type` (Economic/Military), `tier`, `desc`, `levels.length`, bonus keys from levels

This is the largest batch. 48 skills have no existing `desc` at all (the stat-boost skills like `food_1`, `atk_1`, etc.). For these, the loreQuote must be written from scratch based on the skill name and type.

**Recommended split:** Generate in 2-3 sub-batches if context limits are hit:
- Economic skills (~35)
- Military skills (~32)

### 2d. Troops (25 groups → 100 strings)

**Source data:** `data/source/lists_troops.json`  
**Context needed per group:** `building`, `tier`, troop `title` (most common), race variants, `atk`, `def`, `speed`

Key for each group: `<building>_<tier>` (e.g. `barracks_1`)

Mention the troop type's battlefield role, training building, tier, and the three race variants (cat, dog, frog).

### 2e. Hub Pages + Home (6 pages → 12 strings)

**No loreQuote needed** — hubs already have artistic intro from `lib/lore.ts`. Only need `seoDescription` for `<meta name="description">`.

Pages:
- `home` — General FomoFighters wiki description
- `buildings` — Buildings hub meta description
- `troops` — Troops hub meta description  
- `skills` — Skills hub meta description
- `heroes` — Heroes hub meta description
- `quests` — Quests hub meta description

### Verify

- `data/seo-text.json` is valid JSON (parseable)
- All 22 building keys present with both `en` and `ru`
- All 25 hero keys present with both `en` and `ru`
- All 67 skill keys present with both `en` and `ru`
- All 25 troop group keys present with both `en` and `ru`
- All 6 hub keys present with both `en` and `ru`
- No empty strings or placeholder values remain

### Done

- 568 unique text strings populated in `data/seo-text.json`
- Every `loreQuote` is 2–3 sentences of artistic text
- Every `seoDescription` is 1–2 sentences of SEO-oriented text
- Both EN and RU versions exist for every entry

---

## Task 3: Wire into Next.js Pages

**Effort:** ~30–40 min  
**Modifies:** 10 page files  
**Depends on:** Task 2 (seo-text.json must be populated)

### 3a. Add `generateMetadata` to all 10 page files

Each page file needs a Next.js `generateMetadata` export that reads from `seo-text.json` and returns `{ title, description }`.

**Files and specific changes:**

#### `app/[lang]/page.tsx` (Home page)
- **Line ~1:** Add `import type { Metadata } from "next"` and `import { getSeoText } from "@/lib/seo-text"`
- **Add before `export default`:** `generateMetadata` function
- **Title pattern:** `"FomoFighters Wiki — Buildings, Troops, Heroes & Skills Guide"`
- **Description:** From `getSeoText("hubs", "home", lang)`

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const seo = getSeoText("hubs", "home", lang);
  return {
    title: lang === "ru"
      ? "FomoFighters Вики — Здания, Войска, Герои и Навыки"
      : "FomoFighters Wiki — Buildings, Troops, Heroes & Skills Guide",
    description: seo?.seoDescription ?? "The comprehensive FomoFighters game wiki.",
  };
}
```

#### `app/[lang]/buildings/page.tsx` (Buildings hub)
- **Line ~1:** Add `import type { Metadata } from "next"` and `import { getSeoText } from "@/lib/seo-text"`
- **Title:** `"Buildings — FomoFighters Wiki"` / `"Здания — FomoFighters Вики"`
- **Description:** From `getSeoText("hubs", "buildings", lang)`

#### `app/[lang]/buildings/[key]/page.tsx` (Building detail)
- **Line ~1:** Add `import type { Metadata } from "next"` and `import { getSeoText } from "@/lib/seo-text"`
- **Title pattern:** `"${building.title} — Buildings | FomoFighters Wiki"`
- **Description:** From `getSeoText("buildings", key, lang)`

#### `app/[lang]/troops/page.tsx` (Troops hub)
- Same pattern. Title: `"Troops — FomoFighters Wiki"`.
- Description from `getSeoText("hubs", "troops", lang)`.

#### `app/[lang]/troops/[building]/[tier]/page.tsx` (Troop detail)
- Title: `"${troopName} (T${tier}) — Troops | FomoFighters Wiki"`
- Description from `getSeoText("troops", \`${building}_${tier}\`, lang)`.

#### `app/[lang]/skills/page.tsx` (Skills hub)
- Title: `"Skills — FomoFighters Wiki"`.
- Description from `getSeoText("hubs", "skills", lang)`.

#### `app/[lang]/skills/[key]/page.tsx` (Skill detail)
- Title: `"${skill.title} — Skills | FomoFighters Wiki"`
- Description from `getSeoText("skills", key, lang)`.

#### `app/[lang]/heroes/page.tsx` (Heroes hub)
- Title: `"Heroes — FomoFighters Wiki"`.
- Description from `getSeoText("hubs", "heroes", lang)`.

#### `app/[lang]/heroes/[key]/page.tsx` (Hero detail)
- Title: `"${hero.title} — Heroes | FomoFighters Wiki"`
- Description from `getSeoText("heroes", key, lang)`.

#### `app/[lang]/quests/page.tsx` (Quests hub)
- Title: `"Quests — FomoFighters Wiki"`.
- Description from `getSeoText("hubs", "quests", lang)`.

### 3b. Update LoreQuote on detail pages to use seo-text.json

Replace the inline generic fallback text with text from `seo-text.json`.

#### `app/[lang]/buildings/[key]/page.tsx`
- **Lines 41–44:** Replace the inline `loreText` construction with:
  ```typescript
  const seo = getSeoText("buildings", key, lang);
  const loreText = seo?.loreQuote
    ?? building.desc
    ?? (lang === "ru"
      ? `${building.title} — одно из ключевых зданий вашей империи.`
      : `The ${building.title} is a vital structure in your empire.`);
  ```
- **Lines 72–73:** Simplify to just `<LoreQuote text={loreText} />` (remove the conditional `building.desc` check since `loreText` now handles all cases via the fallback chain)

#### `app/[lang]/heroes/[key]/page.tsx`
- **Lines 37–41:** Replace with:
  ```typescript
  const seo = getSeoText("heroes", key, lang);
  const loreText = seo?.loreQuote
    ?? hero.desc
    ?? (lang === "ru"
      ? `${hero.title} — легендарный герой, способный изменить ход сражения.`
      : `${hero.title} is a legendary hero capable of turning the tide of battle.`);
  ```

#### `app/[lang]/skills/[key]/page.tsx`
- **Lines 45–49:** Replace with:
  ```typescript
  const seo = getSeoText("skills", key, lang);
  const loreText = seo?.loreQuote
    ?? skill.desc
    ?? (lang === "ru"
      ? `${skill.title} — навык, открывающий новые горизонты для вашей империи.`
      : `${skill.title} is a skill that opens new horizons for your empire.`);
  ```

### 3c. Add LoreQuote to troop detail page

The troop detail page (`app/[lang]/troops/[building]/[tier]/page.tsx`) currently has **zero** artistic text. Add LoreQuote between the breadcrumbs and the building title bar.

- **Line 1 area:** Add `import LoreQuote from "@/components/wiki/lore-quote"` and `import { getSeoText } from "@/lib/seo-text"`
- **Inside the function, after line ~46:** Add:
  ```typescript
  const seo = getSeoText("troops", `${building}_${tier}`, lang);
  const loreText = seo?.loreQuote
    ?? (lang === "ru"
      ? `${troopName} — элитные воины вашей армии.`
      : `${troopName} are elite warriors of your army.`);
  ```
- **In JSX, between breadcrumbs (line ~92) and building title bar (line ~95):** Add:
  ```tsx
  <LoreQuote text={loreText} />
  ```

### Verify

- `npm run build` passes (no TypeScript errors, no build errors)
- Visit `/en/buildings/castle` → unique `<title>` and `<meta name="description">` in HTML source
- Visit `/en/heroes/athena` → unique metadata + artistic LoreQuote text
- Visit `/en/troops/barracks/1` → has LoreQuote (previously missing)
- Visit `/ru/buildings/castle` → Russian metadata and loreQuote

### Done

- All 10 page files export `generateMetadata` with unique title + description
- Detail pages show artistic loreQuote from seo-text.json (with graceful fallback chain)
- Troop detail pages now show LoreQuote (was missing before)

---

## Task 4: Wire into Fandom Sync Script

**Effort:** ~20–30 min  
**Modifies:** `scripts/sync-fandom.mjs`  
**Depends on:** Task 2 (seo-text.json must be populated)

### 4a. Load seo-text.json at top of script

**After line 74** (where `version` is loaded), add:

```javascript
const seoText = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "seo-text.json"), "utf8"),
);
function getSeoText(category, key) {
  return seoText[category]?.[key]?.["en"] ?? null;
}
```

Note: Fandom wiki is English-only, so we only read the `en` entries.

### 4b. Inject descriptive paragraphs into wikitext generators

#### `buildingWikitext()` (line 437–452)
- **After line 441** (`if (b.desc) wt += ...`), add:
  ```javascript
  const seo = getSeoText("buildings", b.key);
  if (seo?.loreQuote) wt += `\n${seo.loreQuote}\n`;
  ```

#### `heroWikitext()` (line 532–548)
- **After line 537** (`if (h.desc) wt += ...`), add:
  ```javascript
  const seo = getSeoText("heroes", h.key);
  if (seo?.loreQuote) wt += `\n${seo.loreQuote}\n`;
  ```

#### `skillWikitext()` (line 504–529)
- **After line 507** (`if (s.desc) wt += ...`), add:
  ```javascript
  const seo = getSeoText("skills", s.key);
  if (seo?.loreQuote) wt += `\n${seo.loreQuote}\n`;
  ```

#### `troopGroupWikitext()` (line 454–479)
- **After line 458** (intro sentence), add:
  ```javascript
  const seo = getSeoText("troops", `${buildingKey}_${tier}`);
  if (seo?.loreQuote) wt += `\n${seo.loreQuote}\n`;
  ```

#### Hub pages (buildings, troops, skills, heroes, quests)
- **Buildings hub** (line 745): After the intro sentence, add descriptive paragraph from `getSeoText("hubs", "buildings")`
- **Troops hub** (`troopsHubWikitext()`, line 490): Same pattern
- **Skills hub** (line 778): Same pattern
- **Heroes hub** (line 799): Same pattern
- **Quests hub** (`questsHubWikitext()`, line 624): Same pattern
- **Main page** (`mainPageWikitext()`, line 550): Add meta description content where appropriate

### Verify

- `DRY_RUN=1 node scripts/sync-fandom.mjs` runs without errors
- Inspect a few pages' output in dry-run logs — verify artistic paragraphs appear after infoboxes
- Check that the existing template sentence still appears (the new text is additive, not replacing)

### Done

- `sync-fandom.mjs` loads `seo-text.json` at startup
- All entity wikitext generators inject a descriptive paragraph
- Hub pages inject richer intro text
- Existing wikitext structure (infobox → intro → tables → categories) is preserved

---

## Task 5: Verification

**Effort:** ~15–20 min  
**Depends on:** Tasks 3 + 4

### 5a. Build check

```bash
npm run build
```

Must complete with 0 errors. All 145 pages should be statically generated (or ISR'd) successfully.

### 5b. Spot-check Next.js pages

Check at least one page per category in both languages:

| Page | URL | Check |
|------|-----|-------|
| Home EN | `/en` | Unique `<title>`, `<meta description>` |
| Home RU | `/ru` | Russian metadata |
| Building detail | `/en/buildings/castle` | LoreQuote from seo-text.json, unique meta |
| Building detail | `/en/buildings/farm_1` | LoreQuote from seo-text.json |
| Hero detail | `/en/heroes/athena` | Artistic loreQuote, unique meta |
| Skill detail (with desc) | `/en/skills/open_stable` | seo-text loreQuote |
| Skill detail (no desc) | `/en/skills/food_1` | seo-text loreQuote (not generic fallback) |
| Troop detail | `/en/troops/barracks/1` | LoreQuote present (was missing), unique meta |
| Buildings hub | `/en/buildings` | Unique meta description |
| Quests hub | `/en/quests` | Unique meta description |

### 5c. Fandom sync dry run

```bash
DRY_RUN=1 node scripts/sync-fandom.mjs 2>&1 | head -50
```

Verify: no errors, pages generated with enriched text.

### Done

- Build passes with 0 errors
- All page types render correctly with new SEO text
- No regressions in existing functionality
- Fandom sync produces enriched wikitext

---

## Risk Areas

| Risk | Severity | Mitigation |
|------|----------|------------|
| **seo-text.json file size** — 568 strings may produce a large JSON file (~200–300 KB) | Low | Acceptable for server-side reading; file is only loaded once and cached in `lib/seo-text.ts` |
| **Content generation context limits** — 67 skills × 2 languages × 2 text types may exceed single-session context | Medium | Split into 2–3 batches (Economic skills, Military skills, everything else). Each batch is independent. |
| **Russian text quality** — AI-generated Russian may have stylistic issues | Medium | Generate Russian text independently (not as direct translations). The existing `lib/lore.ts` shows the project already uses independent EN/RU text. Human review recommended for Russian output. |
| **Troop key mismatch** — Using `building_tier` composite key requires consistency between seo-text.json and page lookup | Low | The troop detail page URL is `/[building]/[tier]`, so the key derivation is `${building}_${tier}` in both places. Document this in lib/seo-text.ts types. |
| **generateMetadata + async params** — Next.js requires careful typing of the `params` Promise pattern | Low | Follow the exact same `params: Promise<{...}>` + `await params` pattern already used in every page file. |
| **Fandom rate limiting** — More text per page means larger API payloads | Low | Existing rate-limiting retry logic in sync-fandom.mjs (line 138–141) handles this. Text additions are small. |
| **Build time increase** — 145 pages reading an extra JSON file at build time | Low | Single cached read. Negligible impact vs. the existing `lists_*.json` reads that happen on every page. |

---

## Success Criteria

- [ ] `data/seo-text.json` contains 568 non-empty text strings (139 entities × 4 + 6 hubs × 2)
- [ ] `lib/seo-text.ts` provides typed, cached access to SEO text
- [ ] All 10 Next.js page files export `generateMetadata` with unique per-page title + description
- [ ] Building, hero, and skill detail pages show artistic loreQuote from seo-text.json instead of generic fallbacks
- [ ] Troop detail pages display LoreQuote (newly added)
- [ ] `scripts/sync-fandom.mjs` loads seo-text.json and injects descriptive paragraphs into all entity wikitext
- [ ] `npm run build` passes with 0 errors
- [ ] Every page has a unique `<title>` and `<meta name="description">` (no more global-only metadata)
- [ ] Existing patterns preserved: LoreQuote component unchanged, getLore() hub system unchanged, manual doc system unchanged, Fandom wikitext structure unchanged
