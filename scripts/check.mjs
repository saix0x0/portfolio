#!/usr/bin/env node
// `npm run check` — fast, zero-dependency integrity checks. Run before every commit.
//  1. private plaintext is git-ignored and does not leak into any public file
//  2. every local href/src in HTML and every JS import resolves to a real file
//  3. content data is well-formed (unique ids, known categories, http links)
import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const ok = [];
const rel = (p) => path.relative(ROOT, p);

async function walk(dir, out = []) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'private', '.claude', '_site', 'notes', 'graphify-out'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    e.isDirectory() ? await walk(p, out) : out.push(p);
  }
  return out;
}
const exists = (p) => fs.access(p).then(() => true, () => false);
const files = await walk(ROOT);

// 1. privacy
try {
  const tracked = execSync('git ls-files private', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  tracked ? errors.push(`private/ files are tracked by git: ${tracked}`) : ok.push('private/ is not tracked by git');
} catch { ok.push('(not a git repo yet — skipped git tracking check)'); }
const privDir = path.join(ROOT, 'private');
if (await exists(privDir)) {
  const secrets = [];
  for (const f of await fs.readdir(privDir)) {
    const txt = await fs.readFile(path.join(privDir, f), 'utf8');
    txt.split('\n').map((l) => l.trim()).filter((l) => l.length > 24).forEach((l) => secrets.push([f, l]));
    if (f.startsWith('PASSPHRASES')) txt.split('\n').forEach((l) => { const m = l.match(/:\s*(\S{12,})$/); if (m) secrets.push([f, m[1]]); });
  }
  let leaks = 0;
  for (const file of files) {
    if (!/\.(html|js|json|css|md|txt|mjs)$/.test(file)) continue;
    const body = await fs.readFile(file, 'utf8');
    for (const [src, line] of secrets) if (body.includes(line)) { leaks++; errors.push(`Private text from private/${src} appears in ${rel(file)}`); }
  }
  if (!leaks) ok.push(`no private text found in ${files.length} public files`);
}

// 2. links & imports
let refs = 0;
for (const file of files) {
  const body = await fs.readFile(file, 'utf8').catch(() => '');
  const dir = path.dirname(file);
  const found = [];
  if (file.endsWith('.html')) for (const m of body.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g)) found.push(m[1]);
  if (/\.(m?js)$/.test(file) && !file.includes('scripts')) for (const m of body.matchAll(/(?:import|from)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g)) found.push(m[1]);
  for (const u of found) {
    if (/^(https?:|mailto:|data:|\$\{|javascript:|\/)/.test(u) || u === '') continue;
    let target = path.resolve(dir, u);
    if (u.endsWith('/')) target = path.join(target, 'index.html');
    refs++;
    if (!(await exists(target))) errors.push(`${rel(file)} → ${u} (missing)`);
  }
}
ok.push(`${refs} local links/imports checked`);

// 3. content
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const { projects, CATEGORIES } = await imp('content/projects.js');
const { books } = await imp('content/books.js');
const { experiments } = await imp('lab/experiments/index.js');
const ids = new Set();
for (const p of projects) {
  if (!p.id || ids.has(p.id)) errors.push(`project id missing/duplicate: ${p.id}`);
  ids.add(p.id);
  if (!CATEGORIES[p.category]) errors.push(`project ${p.id}: unknown category "${p.category}"`);
  for (const [k, u] of Object.entries(p.links || {})) if (u && !/^https?:\/\//.test(u)) errors.push(`project ${p.id}: ${k} link must start with http(s)`);
}
for (const b of books) if (b.free && !/^https?:\/\//.test(b.free)) errors.push(`book ${b.title}: bad free link`);
for (const x of experiments) if (!(await exists(path.join(ROOT, 'lab/experiments', x.module)))) errors.push(`experiment ${x.id}: missing module ${x.module}`);
const placeholders = projects.filter((p) => p.placeholder).length;
ok.push(`${projects.length} projects (${placeholders} placeholders), ${books.length} books, ${experiments.length} experiments`);

ok.forEach((m) => console.log('✓', m));
if (errors.length) {
  errors.forEach((m) => console.error('✗', m));
  process.exit(1);
}
console.log('\nAll checks passed.');
