const DEFAULT_MODEL = "gpt-4o-mini";

function styleExamples(versionJson) {
  const patches = versionJson?.patches ?? [];
  const picked = patches.filter((p) => ["1.1.0", "1.2.0"].includes(p.version));
  return picked.flatMap((p) =>
    (p.changes ?? []).slice(0, 3).map((c) => ({ en: c.en, ru: c.ru })),
  );
}

function digestForPrompt(digest) {
  return digest.sections.map((s) => ({
    area: s.areaEn,
    added: s.added.filter((x) => !x.startsWith("[internal:")),
    addedInternalCount: s.added.filter((x) => x.startsWith("[internal:")).length,
    removed: s.removed.filter((x) => !x.startsWith("[internal:")),
    removedInternalCount: s.removed.filter((x) => x.startsWith("[internal:")).length,
    modified: s.modified,
  }));
}

export async function rewritePatchWithAi(digest, { versionJson } = {}) {
  const apiKey = process.env.PATCH_AI_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("PATCH_AI_KEY or OPENAI_API_KEY is not set");
  }

  const base = (process.env.PATCH_AI_BASE ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.PATCH_AI_MODEL ?? DEFAULT_MODEL;
  const examples = styleExamples(versionJson);

  const system = `You write player-facing patch notes for a mobile strategy game wiki.
Rules:
- Short bullet points, like a game update announcement.
- NEVER use internal ids, snake_case keys, file names, JSON field names, or developer jargon.
- NEVER mention "entries", "data", "JSON", "lists_*".
- Use player-visible names (hero/building/shop item titles) when provided.
- For bulk quest/troop/skill tweaks, summarize as balance changes (e.g. "Daily quests refreshed", "Main quest rewards rebalanced").
- Each bullet must have natural English (en) and Russian (ru).
- 4–10 bullets max. Merge related items.
- You may use emoji sparingly (💎 ⚔️) like in game announcements.
Return ONLY valid JSON: {"changes":[{"en":"...","ru":"..."}]}`;

  const userParts = [
    "Style examples from previous good patches:",
    JSON.stringify(examples, null, 2),
    "",
    "Internal change digest (for your eyes only — do not copy ids verbatim):",
    JSON.stringify(digestForPrompt(digest), null, 2),
  ];

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: userParts.join("\n") },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI patch rewrite failed (${res.status}): ${err.slice(0, 400)}`);
  }

  const body = await res.json();
  const text = body.choices?.[0]?.message?.content;
  if (!text) throw new Error("AI returned empty response");

  const parsed = JSON.parse(text);
  const changes = parsed.changes ?? parsed.patch ?? parsed.items;
  if (!Array.isArray(changes) || changes.length === 0) {
    throw new Error("AI JSON missing changes array");
  }

  return changes
    .filter((c) => c?.en && c?.ru)
    .map((c) => ({ en: String(c.en).trim(), ru: String(c.ru).trim() }));
}
