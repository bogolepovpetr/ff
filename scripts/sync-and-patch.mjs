#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { SYNC_FROM_MONO } from "./lib/sync-manifest.mjs";
import {
  bumpPatchVersion,
  todayIsoDate,
  applyPatchToVersion,
} from "./lib/patch-notes.mjs";
import { composePatchChanges, patchNotesText } from "./lib/patch-compose.mjs";
import { syncFromMonorepo, getMonorepoCommit } from "./sync-from-monorepo.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE_DIR = path.join(ROOT, "data", "source");
const VERSION_PATH = path.join(ROOT, "data", "version.json");

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");
const noAi = process.argv.includes("--no-ai");

function readFileOrNull(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function snapshotSource() {
  const snap = {};
  for (const file of SYNC_FROM_MONO) {
    snap[file] = readFileOrNull(path.join(SOURCE_DIR, file));
  }
  return snap;
}

function loadVersion() {
  return JSON.parse(fs.readFileSync(VERSION_PATH, "utf8"));
}

function writeVersion(data) {
  fs.writeFileSync(VERSION_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function main() {
  const before = snapshotSource();
  const prevVersion = loadVersion();
  const prevCommit = prevVersion.sourceMonorepoCommit ?? null;

  const copied = syncFromMonorepo();
  const monoCommit = getMonorepoCommit();
  const after = snapshotSource();

  const { changes, source } = await composePatchChanges(before, after, SYNC_FROM_MONO, {
    versionJson: prevVersion,
    noAi,
  });
  const dataChanged = changes.length > 0 || buildHasDiff(before, after);
  const commitChanged = monoCommit && monoCommit !== prevCommit;

  if (!dataChanged && !commitChanged && !force) {
    console.log("No game data changes detected.");
    if (monoCommit) console.log(`monorepo: ${monoCommit.slice(0, 12)} (unchanged)`);
    return;
  }

  if (!dataChanged && commitChanged && !force) {
    console.log("Monorepo moved but synced JSON is identical — skipping patch bump.");
    console.log(`monorepo: ${monoCommit.slice(0, 12)}`);
    if (!dryRun) {
      writeVersion({ ...prevVersion, sourceMonorepoCommit: monoCommit });
    }
    return;
  }

  if (changes.length === 0) {
    console.log("Data changed but no patch bullets composed.");
    return;
  }

  const nextVersion = bumpPatchVersion(prevVersion.gameVersion);
  const date = todayIsoDate();
  const patch = {
    version: nextVersion,
    date,
    changes,
    ...(monoCommit ? { monorepoCommit: monoCommit.slice(0, 12) } : {}),
  };

  const next = applyPatchToVersion(prevVersion, {
    gameVersion: nextVersion,
    dataUpdated: date,
    patchNotes: patchNotesText(changes),
    sourceMonorepoCommit: monoCommit ?? prevCommit ?? undefined,
    patches: [patch],
  });

  console.log(`Patch v${nextVersion} (${changes.length} bullets via ${source}, ${copied.length} files synced)`);
  if (monoCommit) console.log(`monorepo: ${monoCommit.slice(0, 12)}`);
  for (const c of changes) console.log(`  • ${c.en}`);

  if (dryRun) {
    console.log("\n[dry-run] version.json not written");
    return;
  }

  writeVersion(next);
  console.log(`\nUpdated ${path.relative(ROOT, VERSION_PATH)}`);
}

function buildHasDiff(before, after) {
  for (const file of SYNC_FROM_MONO) {
    if (before[file] !== after[file]) return true;
  }
  return false;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
