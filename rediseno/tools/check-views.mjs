#!/usr/bin/env node
/* ─── check-views.mjs ────────────────────────────────────────────────────
 * Valida rediseno/views-registry.json (gate CI):
 *   - estados dentro del enum
 *   - designPaths existen en el espejo rediseno/
 *   - vuePaths existen en el repo
 *   - toda vista divergent-* referencia un asiento D-XXX presente en DECISIONS.md
 *   - las divergent-pending-decision bloquean: son error, no warning
 * Warnings (no fallan): vistas unreviewed.
 * ──────────────────────────────────────────────────────────────────────── */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const REDISENO = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(REDISENO, '..');

const STATUSES = new Set([
  'accepted-ported', 'accepted-pending-port', 'design-only', 'superseded-by-vue',
  'divergent-pending-decision', 'divergent-adjudicated', 'unreviewed',
]);

const errors = [];
const warnings = [];

const registryPath = path.join(REDISENO, 'views-registry.json');
if (!fs.existsSync(registryPath)) { console.error('ERROR: falta rediseno/views-registry.json'); process.exit(1); }
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const views = registry.views ?? [];
if (!views.length) errors.push('el registro no tiene vistas');

const decisions = fs.existsSync(path.join(REDISENO, 'DECISIONS.md'))
  ? fs.readFileSync(path.join(REDISENO, 'DECISIONS.md'), 'utf8')
  : '';

const seen = new Set();
for (const v of views) {
  const tag = `[${v.id ?? '(sin id)'}]`;
  if (!v.id) errors.push(`${tag} falta id`);
  else if (seen.has(v.id)) errors.push(`${tag} id duplicado`);
  seen.add(v.id);

  if (!STATUSES.has(v.status)) errors.push(`${tag} status inválido "${v.status}" — válidos: ${[...STATUSES].join(', ')}`);

  for (const dp of v.designPaths ?? []) {
    if (!fs.existsSync(path.join(REDISENO, dp))) errors.push(`${tag} designPath no existe en el espejo: rediseno/${dp}`);
  }
  if (!(v.designPaths ?? []).length) errors.push(`${tag} sin designPaths`);

  for (const vp of v.vuePaths ?? []) {
    if (!fs.existsSync(path.join(REPO_ROOT, vp))) errors.push(`${tag} vuePath no existe en el repo: ${vp}`);
  }
  if (['accepted-ported', 'superseded-by-vue'].includes(v.status) && !(v.vuePaths ?? []).length) {
    errors.push(`${tag} status "${v.status}" exige al menos un vuePath`);
  }

  if (v.status?.startsWith('divergent')) {
    if (!/^D-\d{3}$/.test(v.decision ?? '')) errors.push(`${tag} status divergente exige decision "D-XXX"`);
    else if (!decisions.includes(`## ${v.decision} `) && !decisions.includes(`## ${v.decision} —`)) {
      errors.push(`${tag} decision ${v.decision} no tiene asiento en DECISIONS.md`);
    }
  }
  if (v.status === 'divergent-pending-decision') {
    errors.push(`${tag} divergencia SIN adjudicar — registrar disposición en DECISIONS.md antes de mergear (regla del ledger)`);
  }
  if (v.status === 'unreviewed') warnings.push(`${tag} pendiente de revisión (${v.concept ?? ''})`);
}

for (const w of warnings) console.warn(`WARN  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`ERROR ${e}`);
  console.error(`\nFALLÓ: ${errors.length} error(es) en views-registry.json.`);
  process.exit(1);
}
console.log(`OK views-registry: ${views.length} vistas válidas (${warnings.length} unreviewed).`);
