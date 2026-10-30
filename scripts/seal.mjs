#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  SEAL — encrypt a private room so it can be published safely.
//
//    npm run seal vault          private/vault.md        → vault/sealed.json
//    npm run seal observatory    private/observatory.md  → observatory/sealed.json
//
//  Asks for the passphrase (hidden), or reads SEAL_PASSWORD from the env.
//  private/ is git-ignored: keep a backup of it somewhere safe (it is the only
//  plaintext copy). Losing the passphrase = losing access to the sealed file.
// ─────────────────────────────────────────────────────────────────────────────
import { webcrypto as crypto } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOMS = ['vault', 'observatory'];
const ITER = 600_000;
const room = process.argv[2];

if (!ROOMS.includes(room)) {
  console.error(`Usage: npm run seal <${ROOMS.join('|')}>`);
  process.exit(1);
}

function ask(q) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => rl.output.write(s.includes(q) ? s : '');
    rl.question(q, (a) => {
      rl.close();
      process.stdout.write('\n');
      resolve(a);
    });
  });
}

const src = path.join(ROOT, 'private', `${room}.md`);
const out = path.join(ROOT, room, 'sealed.json');
const text = await fs.readFile(src, 'utf8').catch(() => {
  console.error(`Missing ${path.relative(ROOT, src)} — create it first (see private/README.md or docs/CONTENT_SCHEMA.md).`);
  process.exit(1);
});

let pass = process.env.SEAL_PASSWORD;
if (!pass) {
  pass = await ask('Passphrase: ');
  const again = await ask('Again: ');
  if (pass !== again) {
    console.error('Passphrases did not match.');
    process.exit(1);
  }
}
if (pass.length < 12) console.warn('⚠  Short passphrase. Anyone can download the sealed file and guess offline — use 5+ random words.');

const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const mat = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, mat, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));

// round-trip check before writing
const back = new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct));
if (back !== text) throw new Error('Round-trip check failed');

const b64 = (u) => Buffer.from(u).toString('base64');
await fs.mkdir(path.dirname(out), { recursive: true });
await fs.writeFile(out, JSON.stringify({ v: 1, alg: 'AES-256-GCM', kdf: 'PBKDF2-SHA256', iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct), sealed: new Date().toISOString().slice(0, 10) }) + '\n');
console.log(`✓ Sealed ${path.relative(ROOT, src)} → ${path.relative(ROOT, out)} (${text.length} chars)`);
