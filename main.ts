// gta6-meme-x-01 entry (Node 22, standard library only).
//
// The entry is the X post itself: a GTA 6 meme made by the agent, posted from a
// public account with make.fun named in the text (or @makefunai tagged) plus the
// entrant's play code. This program only hands the post's address to the gate:
// it reads POST.json from the bot directory, checks it names a real X status
// URL, and writes the same file into the output directory for the gate to read.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand
// in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message: string): never {
  console.error(`gta6-meme-x-01: ${message}`);
  process.exit(1);
}

const source = join(BOT_DIR, 'POST.json');
let raw: string;
try {
  raw = readFileSync(source, 'utf8');
} catch (err) {
  fail(`cannot read ${source}: ${(err as Error).message}`);
}

let entry: unknown;
try {
  entry = JSON.parse(raw);
} catch (err) {
  fail(`POST.json is not valid JSON: ${(err as Error).message}`);
}

if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
  fail('POST.json must hold a JSON object with a "url" field');
}
const url = (entry as Record<string, unknown>).url;
if (typeof url !== 'string' || url.length === 0) {
  fail('POST.json must hold a non-empty "url" string');
}
let parsed: URL;
try {
  parsed = new URL(url);
} catch {
  fail(`POST.json url is not a valid URL: ${url}`);
}
if (parsed.protocol !== 'https:' || !/^(x\.com|twitter\.com)$/.test(parsed.hostname)) {
  fail(`POST.json url must be an https://x.com status link, got: ${url}`);
}
if (!/^\/[^/]+\/status\/\d+/.test(parsed.pathname)) {
  fail(`POST.json url must point at a single post, got: ${url}`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const target = join(OUTPUT_DIR, 'POST.json');
writeFileSync(target, JSON.stringify({ url }, null, 2) + '\n', 'utf8');
console.log(`gta6-meme-x-01: post handed over: ${url}`);
