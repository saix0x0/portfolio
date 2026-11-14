#!/usr/bin/env node
// `npm run stage` — copies what the public site needs into _site/, the folder
// both hosts publish (GitHub Pages via .github/workflows/pages.yml, Vercel via
// vercel.json). One list, so the two never differ. No dependencies.
//
// Left out: the repo's own tooling and notes, and, for now (owner's call), the
// hotel game (site.game) and the two encrypted rooms (site.rooms). Their
// files stay in the repo; delete their lines below to publish them again.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_site');
const SKIP = new Set([
  '.git', '.github', '.claude', '.vercel', '.scratch', 'node_modules', '_site', 'private', 'notes', 'graphify-out', 'scripts', 'docs',
  'package.json', 'vercel.json', '.gitignore', '.env.example', '.nojekyll', '.DS_Store',
  // not published for now
  'hotel', 'assets/js/world', 'assets/css/world.css', 'content/notes.js',
  'vault', 'observatory', 'assets/js/pages/vault.js', 'assets/js/pages/observatory.js', 'assets/js/core/vault.js',
]);

let n = 0;
async function copy(dir) {
  for (const e of await fs.readdir(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, e.name);
    if (SKIP.has(rel) || SKIP.has(e.name) || e.name.endsWith('.md')) continue;
    if (e.isDirectory()) await copy(rel);
    else {
      await fs.mkdir(path.join(OUT, dir), { recursive: true });
      await fs.copyFile(path.join(ROOT, rel), path.join(OUT, rel));
      n++;
    }
  }
}
await fs.rm(OUT, { recursive: true, force: true });
await copy('');
await fs.writeFile(path.join(OUT, '.nojekyll'), '');
console.log(`✓ staged ${n} files in _site/`);
