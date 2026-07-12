#!/usr/bin/env node
/* ─── design-diff.mjs ────────────────────────────────────────────────────
 * Compara el proyecto remoto de Claude Design contra el espejo rediseno/
 * y produce SYNC_REPORT.md: altas, bajas, modificados y — lo importante —
 * qué cambios tocan vistas que YA están portadas a Vue (esas exigen una
 * adjudicación explícita en DECISIONS.md, nunca un port silencioso).
 *
 * Entradas (las produce el agente vía MCP DesignSync):
 *   --listing <file>   JSON array con los paths remotos (salida de list_files)
 *   --staging <dir>    opcional: dir con archivos remotos ya descargados
 *                      (mismos paths relativos) para detectar modificados por hash
 *   --out <file>       default: rediseno/SYNC_REPORT.md
 *
 * Uso típico dentro del ciclo (ver .claude/skills/rediseno-sync/SKILL.md):
 *   node rediseno/tools/design-diff.mjs --listing /tmp/listing.json \
 *        --staging rediseno/.sync-staging
 * ──────────────────────────────────────────────────────────────────────── */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const REDISENO = path.resolve(__dirname, '..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'sync-config.json'), 'utf8'));

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const listingPath = arg('--listing');
const stagingDir = arg('--staging');
const outPath = arg('--out', path.join(REDISENO, 'SYNC_REPORT.md'));

if (!listingPath) {
  console.error('ERROR: falta --listing <file> (JSON array de paths remotos, salida de DesignSync list_files).');
  process.exit(1);
}

const matchesPrefix = (p, prefixes) => prefixes.some((pre) => (pre.endsWith('/') ? p.startsWith(pre) : p === pre));

/* Remoto: list_files devuelve también los directorios — filtrar a archivos.
 * Heurística: un path que es prefijo de otro path es un directorio. */
const rawListing = JSON.parse(fs.readFileSync(listingPath, 'utf8'));
if (!Array.isArray(rawListing)) { console.error('ERROR: --listing debe ser un JSON array de strings.'); process.exit(1); }
const listingSet = new Set(rawListing);
const remoteFiles = rawListing.filter((p) => !rawListing.some((q) => q !== p && q.startsWith(p + '/')));
const remoteSet = new Set(remoteFiles);

/* Local: espejo actual (mismas exclusiones que sync-manifest). */
function walk(dir, base = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (entry.name === '.sync-staging') continue;
      out.push(...walk(path.join(dir, entry.name), rel));
    } else if (entry.isFile() && rel !== 'SYNC_MANIFEST.json' && rel !== 'SYNC_REPORT.md') out.push(rel);
  }
  return out;
}
const localFiles = walk(REDISENO);
const localSet = new Set(localFiles);

const altas = remoteFiles.filter((p) => !localSet.has(p) && !matchesPrefix(p, CONFIG.remoteOnly));
const bajas = localFiles.filter((p) => !remoteSet.has(p) && !listingSet.has(p) && !matchesPrefix(p, CONFIG.repoOnly));

/* Modificados: solo detectables si hay staging con contenido remoto descargado. */
const modificados = [];
const sinCambio = [];
if (stagingDir && fs.existsSync(stagingDir)) {
  const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  const walkStaging = (dir, base = '') => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const rel = base ? `${base}/${e.name}` : e.name;
    return e.isDirectory() ? walkStaging(path.join(dir, e.name), rel) : [rel];
  });
  for (const rel of walkStaging(stagingDir)) {
    const localAbs = path.join(REDISENO, rel);
    if (!fs.existsSync(localAbs)) continue; // alta, ya listada
    (sha(path.join(stagingDir, rel)) === sha(localAbs) ? sinCambio : modificados).push(rel);
  }
}

/* Cruce con el registro de vistas: cambios sobre vistas ya portadas exigen adjudicación. */
let registry = [];
const registryPath = path.join(REDISENO, 'views-registry.json');
if (fs.existsSync(registryPath)) registry = JSON.parse(fs.readFileSync(registryPath, 'utf8')).views ?? [];

function registryHits(p) {
  return registry.filter((v) => (v.designPaths ?? []).some((dp) => p === dp || p.startsWith(dp.replace(/\/$/, '') + '/')));
}

function annotate(paths) {
  return paths.map((p) => {
    const hits = registryHits(p);
    const flagged = hits.filter((h) => ['accepted-ported', 'superseded-by-vue', 'divergent-pending-decision'].includes(h.status));
    return { path: p, hits, requiresDecision: flagged.length > 0 };
  });
}

const annAltas = annotate(altas);
const annMods = annotate(modificados);
const decisionRequired = [...annAltas, ...annMods].filter((a) => a.requiresDecision);

/* ─── Render del reporte ───────────────────────────────────────────────── */
const now = new Date().toISOString();
const lines = [];
lines.push(`# SYNC_REPORT — espejo rediseno/ vs proyecto Claude Design`);
lines.push('');
lines.push(`Generado: ${now} · remoto: ${remoteFiles.length} archivos · espejo: ${localFiles.length} archivos`);
lines.push('');

function section(title, items, render) {
  lines.push(`## ${title} (${items.length})`);
  lines.push('');
  if (!items.length) lines.push('_ninguno_');
  else for (const it of items) lines.push(render(it));
  lines.push('');
}

section('⚠ Requieren adjudicación en DECISIONS.md antes de portar', decisionRequired, (a) => {
  const views = a.hits.map((h) => `\`${h.id}\` (${h.status}${h.vuePaths?.length ? ` → ${h.vuePaths.join(', ')}` : ''})`).join(', ');
  return `- \`${a.path}\` — toca ${views}`;
});
section('Altas (existen en el diseño, faltan en el espejo)', annAltas, (a) => `- \`${a.path}\`${a.requiresDecision ? ' ⚠' : ''}`);
section('Bajas (existen en el espejo, ya no están en el diseño)', bajas, (p) => `- \`${p}\``);
if (stagingDir) {
  section('Modificados (hash distinto — contenido descargado en staging)', annMods, (a) => `- \`${a.path}\`${a.requiresDecision ? ' ⚠' : ''}`);
  section('Verificados sin cambio', sinCambio, (p) => `- \`${p}\``);
} else {
  lines.push('## Modificados');
  lines.push('');
  lines.push('_no evaluado: sin `--staging`. Para detectar contenido cambiado, descargar los archivos');
  lines.push('sospechosos (según `_sync/CHANGELOG.jsonl` remoto) a `rediseno/.sync-staging/` y re-correr._');
  lines.push('');
}

fs.writeFileSync(outPath, lines.join('\n'));
console.log(lines.join('\n'));
console.log(`\nOK reporte escrito en ${path.relative(process.cwd(), outPath)}`);
if (decisionRequired.length) {
  console.error(`\n⚠ ${decisionRequired.length} cambio(s) tocan vistas ya portadas/adjudicadas — registrar disposición en rediseno/DECISIONS.md antes de portar.`);
  process.exitCode = 2;
}
