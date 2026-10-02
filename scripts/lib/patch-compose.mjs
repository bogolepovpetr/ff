import { buildChangeDigest, fallbackPlayerChanges } from "./patch-digest.mjs";
import { rewritePatchWithAi } from "./patch-ai.mjs";

export async function composePatchChanges(beforeByFile, afterByFile, files, { versionJson, noAi } = {}) {
  const digest = buildChangeDigest(beforeByFile, afterByFile, files);
  if (digest.sections.length === 0) return { changes: [], digest, source: "none" };

  const hasAi = !noAi && (process.env.PATCH_AI_KEY ?? process.env.OPENAI_API_KEY);

  if (hasAi) {
    try {
      const changes = await rewritePatchWithAi(digest, { versionJson });
      return { changes, digest, source: "ai" };
    } catch (err) {
      console.warn(`AI patch rewrite failed: ${err.message}`);
      console.warn("Falling back to rule-based player notes.");
    }
  } else if (!noAi) {
    console.warn("Set OPENAI_API_KEY (or PATCH_AI_KEY) for player-facing patch notes.");
  }

  return { changes: fallbackPlayerChanges(digest), digest, source: "fallback" };
}

export function patchNotesText(changes) {
  return changes.map((c) => c.en).join("; ");
}
