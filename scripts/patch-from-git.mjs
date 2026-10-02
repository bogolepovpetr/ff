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
import { getMonorepoCommit } from "./sync-from-monorepo.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE_DIR = path.join(ROOT, "data", "source");
const VERSION_PATH = path.join(ROOT, "data", "version.json");

const dryRun = process.argv.includes("--dry-run");
const noAi = process.argv.includes("--no-ai");
const gitRef = process.argv.find((a) => a.startsWith("--ref="))?.slice(6) ?? "HEAD";

function gitDiffNames(ref) {
  try {
    const out = execSync(`git diff --name-only ${ref} -- data/source`, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return new Set(
      out
        .trim()
        .split(/\r?\n/)
        .filter(Boolean)
        .map((p) => path.basename(p)),
    );
  } catch {
    return new Set(SYNC_FROM_MONO);
  }
}

function gitShowFile(ref, relPath) {
  try {
    return execSync(`git show ${ref}:${relPath}`, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

function readDisk(file) {
  try {
    return fs.readFileSync(path.join(SOURCE_DIR, file), "utf8");
  } catch {
    return null;
  }
}

function loadVersion() {
  return JSON.parse(fs.readFileSync(VERSION_PATH, "utf8"));
}

function writeVersion(data) {
  fs.writeFileSync(VERSION_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function main() {
  const changed = gitDiffNames(gitRef);
  const files = SYNC_FROM_MONO.filter((f) => changed.has(f));
  if (files.length === 0) {
    console.log(`No diff in data/source vs git ${gitRef}`);
    return;
  }

  const before = {};
  const after = {};
  for (const file of files) {
    before[file] = gitShowFile(gitRef, `data/source/${file}`);
    after[file] = readDisk(file);
  }

  const prevVersion = loadVersion();
  const { changes, source } = await composePatchChanges(before, after, files, {
    versionJson: prevVersion,
    noAi,
  });

  if (changes.length === 0) {
    console.log("Files changed on disk but no patch bullets composed.");
    return;
  }

  const nextVersion = bumpPatchVersion(prevVersion.gameVersion);
  const date = todayIsoDate();
  const monoCommit = getMonorepoCommit();

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
    sourceMonorepoCommit: monoCommit ?? prevVersion.sourceMonorepoCommit,
    patches: [patch],
  });

  console.log(`Patch v${nextVersion} via ${source} (${changes.length} bullets, ${files.length} files)`);
  for (const c of changes) console.log(`  • ${c.en}`);

  if (dryRun) {
    console.log("\n[dry-run] version.json not written");
    return;
  }

  writeVersion(next);
  console.log(`\nUpdated ${path.relative(ROOT, VERSION_PATH)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
