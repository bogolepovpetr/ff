import fs from "node:fs";
import path from "node:path";

export type PatchChange = { en: string; ru: string };
export type Patch = { version: string; date: string; changes: PatchChange[] };

export type GameVersion = {
  gameVersion: string;
  dataUpdated: string;
  patchNotes: string;
  patches?: Patch[];
};

let cached: GameVersion | null = null;

export function getGameVersion(): GameVersion {
  if (cached) return cached;
  const raw = fs.readFileSync(
    path.join(process.cwd(), "data", "version.json"),
    "utf8",
  );
  cached = JSON.parse(raw) as GameVersion;
  return cached;
}
