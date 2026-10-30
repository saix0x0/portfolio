#!/usr/bin/env node
// Zero-dependency static dev server. `npm run dev` → http://localhost:4173
// Mirrors GitHub Pages: folders serve index.html, unknown paths serve 404.html.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 4173;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};

async function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  let file = path.join(ROOT, clean);
  if (!file.startsWith(ROOT) || file.includes(`${path.sep}private${path.sep}`)) return null;
  try {
    const stat = await fs.stat(file);
    if (stat.isDirectory()) file = path.join(file, 'index.html');
    await fs.access(file);
    return file;
  } catch {
    return null;
  }
}

http
  .createServer(async (req, res) => {
    // Folder URLs without a trailing slash break relative links — redirect like Pages does.
    const urlPath = req.url.split('?')[0];
    if (!path.extname(urlPath) && !urlPath.endsWith('/')) {
      try {
        if ((await fs.stat(path.join(ROOT, decodeURIComponent(urlPath)))).isDirectory()) {
          res.writeHead(301, { Location: urlPath + '/' });
          return res.end();
        }
      } catch {}
    }
    let file = await resolve(req.url);
    let status = 200;
    if (!file) {
      file = path.join(ROOT, '404.html');
      status = 404;
    }
    try {
      const body = await fs.readFile(file);
      res.writeHead(status, {
        'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(body);
    } catch {
      res.writeHead(500);
      res.end('Server error');
    }
  })
  .listen(PORT, () => console.log(`\n  ☀  Portfolio running at http://localhost:${PORT}\n`));
