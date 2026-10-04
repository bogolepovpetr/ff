#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { SYNC_FROM_MONO } from "./lib/sync-manifest.mjs";
import { composePatchChanges, patchNotesText } from "./lib/patch-compose.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE_DIR = path.join(ROOT, "data", "source");
const VERSION_PATH = path.join(ROOT, "data", "version.json");

const dryRun = process.argv.includes("--dry-run");
const noAi = process.argv.includes("--no-ai");
const versionArg = process.argv.find((a) => a.startsWith("--version="))?.slice(10);
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

async function main() {
  const ver = JSON.parse(fs.readFileSync(VERSION_PATH, "utf8"));
  const targetVersion = versionArg ?? ver.gameVersion;
  const patchIdx = (ver.patches ?? []).findIndex((p) => p.version === targetVersion);
  if (patchIdx < 0) {
    console.error(`Patch ${targetVersion} not found in version.json`);
    process.exit(1);
  }

  const changed = gitDiffNames(gitRef);
  const files = SYNC_FROM_MONO.filter((f) => changed.has(f));
  const useFiles = files.length > 0 ? files : SYNC_FROM_MONO;

  const before = {};
  const after = {};
  for (const file of useFiles) {
    before[file] = gitShowFile(gitRef, `data/source/${file}`);
    after[file] = readDisk(file);
  }

  const { changes, source } = await composePatchChanges(before, after, useFiles, {
    versionJson: ver,
    noAi,
  });

  if (changes.length === 0) {
    console.log("Nothing to rewrite.");
    return;
  }

  const patches = [...(ver.patches ?? [])];
  patches[patchIdx] = { ...patches[patchIdx], changes };

  const next = {
    ...ver,
    patchNotes: patchNotesText(changes),
    patches,
  };
  if (targetVersion === ver.gameVersion) {
    next.patchNotes = patchNotesText(changes);
  }

  console.log(`Rewrote patch v${targetVersion} via ${source} (${changes.length} bullets)`);
  for (const c of changes) console.log(`  • ${c.en}`);

  if (dryRun) {
    console.log("\n[dry-run] version.json not written");
    return;
  }

  fs.writeFileSync(VERSION_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(`\nUpdated ${path.relative(ROOT, VERSION_PATH)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
