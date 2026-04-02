# SEO-Friendly Artistic/Descriptive Text — Research

**Researched:** 2026-04-01
**Domain:** Next.js wiki site + Fandom wiki — game content SEO
**Confidence:** HIGH (all findings from direct codebase inspection)

## Summary

The FOMO Fighters wiki has **145 renderable pages** across the Next.js site (1 home + 5 hub pages + 139 detail pages). Hub pages have decent artistic intro text via the `getLore()` system, but detail pages are severely underserved: buildings, heroes, and skills have short one-liner `LoreQuote`s (often just the raw game `desc` field), and troops have **zero** artistic text. No page has per-page SEO metadata (`<title>`, `<meta description>`). The Fandom wiki mirrors this gap — each entity gets a single template sentence like `'''Castle''' is a Economic building in FomoFighters.`

**Primary recommendation:** Create a centralized JSON file (e.g. `data/seo-text.json`) containing per-entity artistic descriptions and SEO meta strings (in both EN and RU), then wire these into the Next.js detail pages' `LoreQuote` + `generateMetadata`, and into the Fandom sync script's wikitext generators.

---

## 1. Page Inventory

### 1.1 All Next.js Page Files (11 routes)

| # | Route | File | Type |
|---|-------|------|------|
| 1 | `/` | `app/page.tsx` | Root redirect → `/en` |
| 2 | `/[lang]` | `app/[lang]/page.tsx` | Home page |
| 3 | `/[lang]/buildings` | `app/[lang]/buildings/page.tsx` | Hub (list) |
| 4 | `/[lang]/buildings/[key]` | `app/[lang]/buildings/[key]/page.tsx` | Detail |
| 5 | `/[lang]/troops` | `app/[lang]/troops/page.tsx` | Hub (list) |
| 6 | `/[lang]/troops/[building]/[tier]` | `app/[lang]/troops/[building]/[tier]/page.tsx` | Detail |
| 7 | `/[lang]/skills` | `app/[lang]/skills/page.tsx` | Hub (list) |
| 8 | `/[lang]/skills/[key]` | `app/[lang]/skills/[key]/page.tsx` | Detail |
| 9 | `/[lang]/heroes` | `app/[lang]/heroes/page.tsx` | Hub (list) |
| 10 | `/[lang]/heroes/[key]` | `app/[lang]/heroes/[key]/page.tsx` | Detail |
| 11 | `/[lang]/quests` | `app/[lang]/quests/page.tsx` | Hub (single-page, no detail pages) |

### 1.2 Entity Counts (from JSON data files)

| Entity | Source File | Total Count | Detail Pages |
|--------|-----------|-------------|--------------|
| Buildings | `data/source/lists_buildings.json` | 22 | 22 (by `key`) |
| Heroes | `data/source/lists_leads.json` | 25 | 25 (by `key`) |
| Skills | `data/source/lists_skills.json` | 67 | 67 (by `key`) |
| Troops | `data/source/lists_troops.json` | 75 individuals (3 races × 25 types) | 25 (grouped by `building`+`tier`) |

**Total detail pages: 139** (22 + 25 + 67 + 25)
**Total renderable pages: 145** (1 home + 5 hubs + 139 detail)

### 1.3 Troop Groups (25 detail pages)

5 buildings × 5 tiers = 25 groups, each with 3 races (cat, dog, frog):

| Building | Tiers | Groups |
|----------|-------|--------|
| archery_range | 1-5 | Slinger, Whipmaster, Bowman, Crossbowman, Sharpshooter |
| barracks | 1-5 | Clubman, Maceman, Shieldman, Swordsman, Paladin |
| stable | 1-5 | Rider, Lancer, Dragoon, Knight, Cavalier |
| siege_workshop | 1-5 | Ballista, Catapult, Battering Ram, Cannon, Firecrusher |
| scout_camp | 1-5 | Scout, Pathfinder, Tracker, Ranger, Sentinel |

---

## 2. Existing Artistic/SEO Text Audit

### 2.1 Hub Pages — Status: GOOD (have artistic text)

All 4 main hub pages use `getLore(category, lang)` from `lib/lore.ts` (line 68-73) which returns `{title, subtitle, intro}`. The intro is a 2-3 sentence evocative paragraph.

| Hub | Uses getLore? | Lore Entry Exists? | Lines |
|-----|--------------|-------------------|-------|
| Buildings | Yes (line 12) | Yes — `lib/lore.ts` lines 10-22 | 3-sentence intro |
| Troops | Yes (line 21) | Yes — `lib/lore.ts` lines 24-36 | 3-sentence intro |
| Skills | Yes (line 11) | Yes — `lib/lore.ts` lines 38-50 | 3-sentence intro |
| Heroes | Yes (line 13) | Yes — `lib/lore.ts` lines 52-64 | 3-sentence intro |
| Quests | No (inline text) | N/A | Inline stats paragraph (line 167-169) |

**Gap:** Quests hub does not use `getLore()` and has no artistic paragraph, just a stats-oriented line. The other 4 hubs are well-covered.

### 2.2 Detail Pages — Status: MIXED

#### Buildings Detail (`app/[lang]/buildings/[key]/page.tsx`)
- **Uses LoreQuote:** Yes (lines 72-73)
- **Source of text:** `building.desc` from JSON if present; otherwise a generic fallback (lines 41-44)
- **Data coverage:** 21/22 buildings have `desc` in JSON. Only `castle` has empty `desc`.
- **Quality of `desc`:** Very short game-data strings, e.g. `"Produces and stores food"`. Not SEO-optimized or evocative.
- **Also has:** Manual doc system via `getManualDoc()` (line 21) but only `castle` has a manual doc in `content/en/buildings/castle.md`.

#### Heroes Detail (`app/[lang]/heroes/[key]/page.tsx`)
- **Uses LoreQuote:** Yes (line 83)
- **Source of text:** `hero.desc` from JSON (all 25 have it) or a generic fallback (lines 37-41)
- **Data coverage:** 25/25 heroes have `desc` in JSON.
- **Quality of `desc`:** Short mythological-flavored phrases from game data, e.g. `"Champion of wisdom and strategic war; protector of cities"`. Better than buildings but still very short (< 15 words).

#### Skills Detail (`app/[lang]/skills/[key]/page.tsx`)
- **Uses LoreQuote:** Yes (line 82)
- **Source of text:** `skill.desc` from JSON if present; otherwise a generic fallback (lines 45-49)
- **Data coverage:** Only **19 out of 67** skills have `desc` in JSON. 48 skills use the generic template.
- **Skills WITH desc (19):** open_quarry_1, open_farm_3, open_lumber_mill_2, open_quarry_2, open_lumber_mill_3, open_quarry_3, open_stable, open_siege_workshop, unlock_archery_2, unlock_barracks_2, unlock_stable_2, unlock_siege_2, unlock_scout_2, unlock_archery_3, unlock_barracks_3, unlock_stable_3, unlock_siege_3, unlock_scout_3 + all T4/T5 unlocks
- **Skills WITHOUT desc (48):** Most stat-boosting skills (food_1, wood_1, atk_1, def_1, etc.)

#### Troops Detail (`app/[lang]/troops/[building]/[tier]/page.tsx`)
- **Uses LoreQuote:** **NO**
- **Has any artistic text:** **NO** — No descriptive paragraph anywhere. Only stat tables and race comparison.
- **Data coverage:** Troop JSON entries have no `desc` field at all.

### 2.3 Summary Matrix

| Page Type | Count | LoreQuote? | Data desc? | Unique SEO text? | Meta title/desc? |
|-----------|-------|-----------|-----------|-----------------|-----------------|
| Home | 1 | No | N/A | Inline welcome | Global only |
| Buildings hub | 1 | No (uses banner) | N/A | Yes (lore.ts) | None |
| Troops hub | 1 | No (uses banner) | N/A | Yes (lore.ts) | None |
| Skills hub | 1 | No (uses banner) | N/A | Yes (lore.ts) | None |
| Heroes hub | 1 | No (uses banner) | N/A | Yes (lore.ts) | None |
| Quests hub | 1 | No | N/A | Stats only | None |
| Building detail | 22 | Yes | 21/22 have short desc | Generic fallback | None |
| Hero detail | 25 | Yes | 25/25 have short desc | Generic fallback | None |
| Skill detail | 67 | Yes | 19/67 have short desc | Generic fallback | None |
| Troop detail | 25 | **No** | 0/25 (no desc field) | **Nothing** | None |

---

## 3. Component & Pattern Analysis

### 3.1 LoreQuote Component

**File:** `components/wiki/lore-quote.tsx` (10 lines)

```tsx
export default function LoreQuote({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
      <blockquote className="text-sm italic leading-relaxed text-zinc-600">
        <span className="text-2xl leading-none text-amber-400">&ldquo;</span>
        {text}
        <span className="text-2xl leading-none text-amber-400">&rdquo;</span>
      </blockquote>
    </div>
  );
}
```

- Simple, stateless component
- Takes a single `text` string prop
- Renders as a styled blockquote with decorative quotation marks
- Used on: building detail (line 72-73), hero detail (line 83), skill detail (line 82)
- **NOT used on:** troop detail, any hub page, quests page

### 3.2 Lore System (`lib/lore.ts`)

**File:** `lib/lore.ts` (73 lines)

- Hardcoded `LORE` map with entries for: `buildings`, `troops`, `skills`, `heroes`
- Each entry has `{title, subtitle, intro}` in EN and RU
- Used ONLY by hub pages, not by detail pages
- The `intro` text is 2-3 sentences of evocative, game-themed prose
- **No entry for `quests`** — the quests hub uses inline text instead

### 3.3 Manual Doc System (`lib/manual.ts`)

**File:** `lib/manual.ts` (25 lines)

- Loads markdown from `content/{lang}/{entity}/{key}.md`
- Parsed with `gray-matter` (frontmatter) + `marked` (HTML)
- Currently only `content/en/buildings/castle.md` and `content/ru/buildings/castle.md` exist
- Referenced in: buildings detail (line 21), skills detail (line 21)
- Rendered as HTML in a `prose` div below the LoreQuote

### 3.4 Existing Generic Fallback Templates

When no `desc` exists in the JSON, the detail pages generate text inline:

**Buildings** (lines 41-44):
```
EN: "The {title} is a vital structure in your empire. Upgrade it to unlock new capabilities..."
RU: "{title} — одно из ключевых зданий вашей империи. Развивайте его..."
```

**Heroes** (lines 37-41):
```
EN: "{title} is a legendary hero capable of turning the tide of battle."
RU: "{title} — легендарный герой, способный изменить ход сражения."
```

**Skills** (lines 45-49):
```
EN: "{title} is a skill that opens new horizons for your empire. Research it to gain a strategic advantage..."
RU: "{title} — навык, открывающий новые горизонты для вашей империи..."
```

**Troops:** No fallback exists — no artistic text at all.

---

## 4. SEO / Meta Tag Setup

### 4.1 Current State

**Only global metadata exists** in `app/layout.tsx` (lines 15-19):
```tsx
export const metadata: Metadata = {
  title: "FomoFighters Wiki — Buildings, Troops & Skills",
  description: "The official FomoFighters game wiki. Browse buildings, troops, skills, progression tables and strategy guides.",
};
```

- **No `generateMetadata` function** on any page
- **No per-page title or description**
- Every page renders the same `<title>` and `<meta name="description">` — terrible for SEO
- The `[lang]/layout.tsx` does not set any metadata

### 4.2 What's Needed

Each page should have unique:
- `<title>` — e.g. `"Castle — Buildings | FomoFighters Wiki"`
- `<meta name="description">` — e.g. `"The Castle is the core building in FomoFighters. Upgrade it to unlock new structures and accelerate your empire's growth. Full level-by-level progression table."`

---

## 5. Fandom Wiki Sync Script Analysis

### 5.1 Overview

**File:** `scripts/sync-fandom.mjs` (856 lines)

The script generates MediaWiki wikitext for all entities and pushes them to `fomofighters.fandom.com` via the MediaWiki API.

### 5.2 How Text is Currently Generated per Entity

| Entity | Function | Lines | Current Intro Text |
|--------|----------|-------|-------------------|
| Building | `buildingWikitext()` | 437-452 | `'''Castle''' is a Economic building in FomoFighters.` + italic `desc` |
| Hero | `heroWikitext()` | 532-548 | `'''Athena''' is a Common hero in FomoFighters.` + italic `desc` |
| Skill | `skillWikitext()` | 504-529 | `'''Quarrying''' is a Economic skill in FomoFighters.` + italic `desc` |
| Troop | `troopGroupWikitext()` | 454-478 | `'''Slinger''' is a Tier 1 troop trained in the Archery Range.` |
| Buildings hub | inline | 745-761 | `'''Buildings''' are the structures that form your city...` (1 sentence) |
| Troops hub | `troopsHubWikitext()` | 481-502 | `'''Troops''' are the military units of FomoFighters.` (1 sentence) |
| Skills hub | inline | 778-795 | `'''Skills''' (Technologies) are researched in the Academy.` (1 sentence) |
| Heroes hub | inline | 799-814 | `'''Heroes''' are legendary commanders.` (1 sentence) |
| Quests hub | `questsHubWikitext()` | 624-631 | `'''Quests''' reward resources, gems, and items.` (1 sentence) |
| Main page | `mainPageWikitext()` | 550-622 | Banner + Getting Started cards |

### 5.3 Where to Inject SEO Text in Fandom

Each wikitext generator function has a clear injection point right after the infobox and before the data tables:

- **Buildings** (line 440): After `wt += \`'''${b.title}''' is a...\n\`;` → add paragraph
- **Heroes** (line 536): After `wt += \`'''${h.title}''' is a...\n\`;` → add paragraph
- **Skills** (line 506): After `wt += \`'''${s.title}''' is a...\n\`;` → add paragraph
- **Troops** (line 458): After `wt += \`'''${sample.title}''' is a...\n\`;` → add paragraph
- **Hub pages**: After the intro sentence → add descriptive paragraph

---

## 6. Recommended Text Structure

### 6.1 Data File: `data/seo-text.json`

Store all descriptive text in a single JSON keyed by entity type + key:

```json
{
  "buildings": {
    "castle": {
      "en": {
        "loreQuote": "The Castle stands at the heart of your kingdom, a towering symbol of your ambition...",
        "seoDescription": "Castle building guide for FomoFighters. Full upgrade costs, requirements, and level-by-level progression table.",
        "seoTitle": "Castle"
      },
      "ru": {
        "loreQuote": "Замок возвышается в центре вашего королевства...",
        "seoDescription": "Гайд по Замку в FomoFighters...",
        "seoTitle": "Замок"
      }
    }
  },
  "heroes": { ... },
  "skills": { ... },
  "troops": { ... },
  "hubs": {
    "buildings": { "en": { "seoDescription": "..." }, "ru": { ... } },
    "troops": { ... },
    ...
  }
}
```

### 6.2 Text Types by Page Category

#### Hub Pages (5 pages)
- **Already have:** 2-3 sentence artistic intro (from `lib/lore.ts`)
- **Need to add:** Per-page `generateMetadata` with unique title + description
- **Lore text:** Keep existing `getLore()` system, it's good enough
- **SEO meta:** Add `seoTitle` and `seoDescription` to the lore entries or to `seo-text.json`

#### Building Detail Pages (22 pages)
- **LoreQuote text:** 2-3 sentences. Should mention what the building does, why it matters strategically, and hint at its role in progression. Replace the short game `desc`.
- **SEO description:** 1-2 sentences focusing on "FomoFighters [Building] — upgrade costs, requirements, bonuses..."
- **SEO title:** `"{Building Name} — Buildings | FomoFighters Wiki"`

#### Hero Detail Pages (25 pages)
- **LoreQuote text:** 2-3 sentences. Should weave in the hero's mythological background, their in-game role (attack/defense/economy), and aspect.
- **SEO description:** `"{Hero Name} hero guide — tier, bonuses, costs, and strategy tips for FomoFighters"`
- **SEO title:** `"{Hero Name} — Heroes | FomoFighters Wiki"`

#### Skill Detail Pages (67 pages)
- **LoreQuote text:** 2-3 sentences. Should explain what the skill unlocks or boosts, and where it fits in the tech tree progression.
- **SEO description:** `"{Skill Name} research guide — costs, time, and bonuses for FomoFighters"`
- **SEO title:** `"{Skill Name} — Skills | FomoFighters Wiki"`

#### Troop Detail Pages (25 pages)
- **LoreQuote text:** 2-3 sentences. Should describe the troop type's battlefield role, strengths, and which building trains them. Mention the 3 races (cat/dog/frog variants).
- **SEO description:** `"{Troop Name} (Tier X) — stats, training costs, and race comparison for FomoFighters"`
- **SEO title:** `"{Troop Name} (T{X}) — Troops | FomoFighters Wiki"`

### 6.3 Text for Fandom

The same `seo-text.json` can be consumed by `sync-fandom.mjs`. For each entity's wikitext:
- Replace the generic 1-liner intro with a 2-3 sentence descriptive paragraph
- The `loreQuote` text works as italic flavor text in wikitext too (`''...''`)
- Hub pages get the same descriptive paragraph as their Next.js counterpart

---

## 7. Implementation Approach

### 7.1 Total Text to Write

| Entity Type | Count | Text per entity | Total pieces |
|-------------|-------|----------------|--------------|
| Buildings | 22 | loreQuote (EN+RU) + seoDesc (EN+RU) | 88 strings |
| Heroes | 25 | loreQuote (EN+RU) + seoDesc (EN+RU) | 100 strings |
| Skills | 67 | loreQuote (EN+RU) + seoDesc (EN+RU) | 268 strings |
| Troops | 25 | loreQuote (EN+RU) + seoDesc (EN+RU) | 100 strings |
| Hubs | 5 | seoDesc (EN+RU) | 10 strings |
| Home | 1 | seoDesc (EN+RU) | 2 strings |
| **Total** | **145** | | **568 strings** |

### 7.2 Code Changes Required

1. **Create `data/seo-text.json`** — The central data file with all text
2. **Create `lib/seo-text.ts`** — Loader function to read and return text by entity type/key/lang
3. **Add `generateMetadata` to all page files** — 10 page files need this:
   - `app/[lang]/page.tsx`
   - `app/[lang]/buildings/page.tsx`
   - `app/[lang]/buildings/[key]/page.tsx`
   - `app/[lang]/troops/page.tsx`
   - `app/[lang]/troops/[building]/[tier]/page.tsx`
   - `app/[lang]/skills/page.tsx`
   - `app/[lang]/skills/[key]/page.tsx`
   - `app/[lang]/heroes/page.tsx`
   - `app/[lang]/heroes/[key]/page.tsx`
   - `app/[lang]/quests/page.tsx`
4. **Update LoreQuote usage in detail pages** — Replace inline generic fallbacks with text from `seo-text.json`
5. **Add LoreQuote to troops detail page** — Currently missing entirely
6. **Update `scripts/sync-fandom.mjs`** — Load `seo-text.json` and inject paragraphs into wikitext generators

### 7.3 Files to Modify

| File | Change |
|------|--------|
| `app/[lang]/buildings/[key]/page.tsx` | Replace generic loreText with seo-text lookup; add `generateMetadata` |
| `app/[lang]/heroes/[key]/page.tsx` | Replace generic loreText with seo-text lookup; add `generateMetadata` |
| `app/[lang]/skills/[key]/page.tsx` | Replace generic loreText with seo-text lookup; add `generateMetadata` |
| `app/[lang]/troops/[building]/[tier]/page.tsx` | Add LoreQuote import + usage; add `generateMetadata` |
| `app/[lang]/buildings/page.tsx` | Add `generateMetadata` |
| `app/[lang]/troops/page.tsx` | Add `generateMetadata` |
| `app/[lang]/skills/page.tsx` | Add `generateMetadata` |
| `app/[lang]/heroes/page.tsx` | Add `generateMetadata` |
| `app/[lang]/quests/page.tsx` | Add `generateMetadata` |
| `app/[lang]/page.tsx` | Add `generateMetadata` |
| `scripts/sync-fandom.mjs` | Load seo-text.json; update all wikitext generator functions |

### 7.4 New Files to Create

| File | Purpose |
|------|---------|
| `data/seo-text.json` | Central repository of all artistic + SEO text |
| `lib/seo-text.ts` | TypeScript loader/accessor for seo-text.json |

---

## 8. Existing Patterns to Preserve

- The `LoreQuote` component should be reused as-is (no changes needed to the component itself)
- The `getLore()` system for hub pages can remain — just add `seoDescription` to those entries
- The `getManualDoc()` system for markdown content can remain for extended articles (currently only castle has one)
- The Fandom wikitext format (infobox → intro → tables → categories) should be preserved, just with richer intro text

## 9. Building Descriptions from Data

For reference, here are the current `desc` fields from the JSON (what LoreQuote currently shows):

### Buildings with desc (21/22):
- farm_1: short game desc (resource production)
- lumber_mill_1: short game desc (resource production)
- quarry_1: short game desc (resource production)
- barracks: short game desc (troop training)
- archery_range, stable, siege_workshop, scout_camp: short game descs
- academy, storage, stash, market, tavern, hospital, fairground: short game descs
- castle: **EMPTY** (only entity with manual doc instead)

### Heroes with desc (25/25):
All 25 heroes have mythological/character descriptions, e.g.:
- Athena: "Champion of wisdom and strategic war; protector of cities"
- Genghis Khan: brief description
- These are flavor text from the game, not SEO-optimized

### Skills with desc (19/67):
Only "unlock" and "open" type skills have descriptions. The 48 stat-boost skills (food_1, atk_1, etc.) have no descriptions.

### Troops:
No descriptions in data at all.

---

## 10. Open Questions

1. **Text generation approach:** Should all 568 strings be hand-written, or can they be AI-generated in bulk with human review? Given the volume (especially 67 skills × 2 languages), AI-assisted generation is strongly recommended.

2. **Russian translations:** Should the RU text be original artistic Russian or translated from English? The existing `lib/lore.ts` shows independent EN/RU text (not direct translations), which is the higher-quality approach.

3. **Quests page:** Should quests get the same treatment? Currently quests don't have detail pages (only a single hub), so the scope is just 1 page (hub meta + intro text).

4. **Manual docs expansion:** Should the `content/{lang}/{entity}/{key}.md` system be expanded to more entities, or is the JSON-based approach sufficient? The manual doc system is more flexible (supports headings, lists, rich formatting) but requires many more files.
