#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  SYNC_FROM_MONO,
  SKIP_WIKI_ONLY,
  monoFileName,
  defaultMonoSchemaDir,
} from "./lib/sync-manifest.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WIKI_SOURCE = path.resolve(__dirname, "../data/source");
const MONO_SCHEMA = process.env.MONOREPO_SCHEMA ?? defaultMonoSchemaDir();

export function getMonorepoCommit(schemaDir = MONO_SCHEMA) {
  const monoRoot = path.resolve(schemaDir, "../../../..");
  try {
    return execSync("git rev-parse HEAD", {
      cwd: monoRoot,
      encoding: "utf8",
    }).trim();
  } catch {
    return null;
  }
}

export function syncFromMonorepo({ schemaDir = MONO_SCHEMA, targetDir = WIKI_SOURCE } = {}) {
  if (!fs.existsSync(schemaDir)) {
    throw new Error(`Monorepo schema not found: ${schemaDir}`);
  }

  const copied = [];
  for (const wf of SYNC_FROM_MONO) {
    if (SKIP_WIKI_ONLY.has(wf)) continue;
    const src = path.join(schemaDir, monoFileName(wf));
    if (!fs.existsSync(src)) {
      console.warn(`skip (no mono): ${wf}`);
      continue;
    }
    fs.copyFileSync(src, path.join(targetDir, wf));
    copied.push(wf);
  }
  return copied;
}

function main() {
  const copied = syncFromMonorepo();
  for (const f of copied) console.log(`copied: ${f}`);
  const commit = getMonorepoCommit();
  if (commit) console.log(`monorepo: ${commit.slice(0, 12)}`);
  console.log(`\nDone: ${copied.length} files`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
