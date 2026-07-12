#!/usr/bin/env node
/* ─── sync-manifest.mjs ──────────────────────────────────────────────────
 * Mantiene rediseno/SYNC_MANIFEST.json: hash sha256 + tamaño de CADA archivo
 * del espejo. Es la línea base contra la que design-diff.mjs detecta qué
 * cambió en el proyecto de Claude Design sin depender de la memoria de nadie.
 *
 * Uso:
 *   node rediseno/tools/sync-manifest.mjs           → recalcula y escribe
 *   node rediseno/tools/sync-manifest.mjs --check   → valida que esté al día (gate CI)
 *
 * El manifest es determinista (sin timestamps) para que --check sea estable.
 * Se excluyen el propio manifest, el reporte y el staging de pulls.
 * ──────────────────────────────────────────────────────────────────────── */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const REDISENO = path.resolve(__dirname, '..');
const OUT = path.join(REDISENO, 'SYNC_MANIFEST.json');
const CHECK_MODE = process.argv.includes('--check');

const EXCLUDE = new Set(['SYNC_MANIFEST.json', 'SYNC_REPORT.md']);
const EXCLUDE_DIRS = new Set(['.sync-staging']);

function walk(dir, base = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      out.push(...walk(path.join(dir, entry.name), rel));
    } else if (entry.isFile()) {
      if (EXCLUDE.has(rel)) continue;
      out.push(rel);
    }
  }
  return out;
}

function buildManifest() {
  const files = {};
  for (const rel of walk(REDISENO)) {
    const buf = fs.readFileSync(path.join(REDISENO, rel));
    files[rel] = { sha256: crypto.createHash('sha256').update(buf).digest('hex'), bytes: buf.length };
  }
  return { files };
}

const manifest = buildManifest();
const rendered = JSON.stringify(manifest, null, 2) + '\n';

if (CHECK_MODE) {
  if (!fs.existsSync(OUT)) {
    console.error('ERROR --check: rediseno/SYNC_MANIFEST.json no existe — correr el script sin --check y commitear.');
    process.exit(1);
  }
  // Normalizar CRLF: un checkout con autocrlf no debe hacer fallar el gate.
  const current = fs.readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n');
  if (current !== rendered.replace(/\r\n/g, '\n')) {
    const prev = JSON.parse(current).files ?? {};
    const next = manifest.files;
    for (const p of Object.keys(next)) {
      if (!prev[p]) console.error(`  + ${p} (nuevo, sin registrar en manifest)`);
      else if (prev[p].sha256 !== next[p].sha256) console.error(`  ~ ${p} (contenido cambió)`);
    }
    for (const p of Object.keys(prev)) if (!next[p]) console.error(`  - ${p} (registrado en manifest pero ya no existe)`);
    console.error('ERROR --check: SYNC_MANIFEST.json está stale — correr `node rediseno/tools/sync-manifest.mjs` y commitear.');
    process.exit(1);
  }
  console.log(`OK --check: manifest al día (${Object.keys(manifest.files).length} archivos).`);
  process.exit(0);
}

fs.writeFileSync(OUT, rendered);
console.log(`OK escrito rediseno/SYNC_MANIFEST.json (${Object.keys(manifest.files).length} archivos).`);
