#!/usr/bin/env node
/* ─── generate-fixtures.mjs ──────────────────────────────────────────────
 * Genera rediseno/data/sample-data.contract.js desde las interfaces TS
 * REALES del frontend + valores de muestra hand-authored (fixture-seeds.json).
 *
 * Uso:
 *   node rediseno/tools/generate-fixtures.mjs           → valida y escribe
 *   node rediseno/tools/generate-fixtures.mjs --check   → solo valida (gate CI)
 *
 * Falla (exit 1) si:
 *   - un seed tiene un campo que NO existe en la interfaz real
 *   - falta seed para un campo requerido de la interfaz
 *   - un valor no matchea el tipo primitivo declarado
 *   - se rompe la integridad referencial (account_id/category_id/etc.)
 *   - se rompe la regla de negocio jar←categoría (jar_id ≠ assigned_jar_id)
 *   - (--check) los archivos generados quedaron stale vs interfaces/seeds
 *
 * Campos opcionales sin seed → warning, se omiten del fixture.
 * ──────────────────────────────────────────────────────────────────────── */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..'); // OWFinanceFrontend2025/
const REDISENO = path.join(REPO_ROOT, 'rediseno');
const SEEDS_PATH = path.join(__dirname, 'fixture-seeds.json');
const OUT_JS = path.join(REDISENO, 'data', 'sample-data.contract.js');
const CONTRACT_MD = path.join(REDISENO, 'DESIGN_CONTRACT.md');
const MD_BEGIN = '<!-- CONTRACT-FIELDS:BEGIN (generado por tools/generate-fixtures.mjs — no editar a mano) -->';
const MD_END = '<!-- CONTRACT-FIELDS:END -->';

const require = createRequire(import.meta.url);
let ts;
try {
  ts = require(path.join(REPO_ROOT, 'node_modules', 'typescript'));
} catch {
  console.error('ERROR: no se encontró el paquete `typescript` en node_modules del frontend.');
  console.error('Correr `npm install` en OWFinanceFrontend2025 primero.');
  process.exit(1);
}

/* ─── Entidades del contrato: interfaz TS real → window.SAMPLE_* ───────── */
const ENTITIES = [
  { seedKey: 'transactions', windowVar: 'SAMPLE_TX',         iface: 'Transaction',     file: 'src/stores/transactions.ts' },
  { seedKey: 'accounts',     windowVar: 'SAMPLE_ACCOUNTS',   iface: 'AccountOption',   file: 'src/composables/useTransactionForm.ts' },
  { seedKey: 'jars',         windowVar: 'SAMPLE_JARS',       iface: 'JarRef',          file: 'src/utils/txCatalog.ts' },
  { seedKey: 'categories',   windowVar: 'SAMPLE_CATEGORIES', iface: 'CatalogCategory', file: 'src/utils/txCatalog.ts' },
  { seedKey: 'tags',         windowVar: 'SAMPLE_TAGS',       iface: 'Tag',             file: 'src/stores/tags.ts' },
  { seedKey: 'providers',    windowVar: 'SAMPLE_PROVIDERS',  iface: 'ProviderOption',  file: 'src/composables/useTransactionForm.ts' },
];

const CHECK_MODE = process.argv.includes('--check');
const errors = [];
const warnings = [];

/* ─── 1. Extraer campos de las interfaces reales (TS compiler API) ─────── */

function extractInterface(sourceFile, name) {
  let found = null;
  function visit(node) {
    if (found) return;
    if (ts.isInterfaceDeclaration(node) && node.name.text === name) { found = node.members; return; }
    if (ts.isTypeAliasDeclaration(node) && node.name.text === name && ts.isTypeLiteralNode(node.type)) {
      found = node.type.members; return;
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  if (!found) return null;
  const fields = [];
  for (const m of found) {
    if (!ts.isPropertySignature(m) || !m.name) continue;
    const fieldName = ts.isIdentifier(m.name) || ts.isStringLiteral(m.name) ? m.name.text : m.name.getText(sourceFile);
    fields.push({
      name: fieldName,
      optional: !!m.questionToken,
      typeText: m.type ? m.type.getText(sourceFile).replace(/\s+/g, ' ') : 'unknown',
    });
  }
  return fields;
}

const interfaces = {}; // seedKey → { fields, iface, file }
for (const ent of ENTITIES) {
  const abs = path.join(REPO_ROOT, ent.file);
  if (!fs.existsSync(abs)) { errors.push(`[${ent.iface}] archivo fuente no existe: ${ent.file}`); continue; }
  const src = ts.createSourceFile(abs, fs.readFileSync(abs, 'utf8'), ts.ScriptTarget.Latest, true);
  const fields = extractInterface(src, ent.iface);
  if (!fields) { errors.push(`[${ent.iface}] interfaz no encontrada en ${ent.file}`); continue; }
  interfaces[ent.seedKey] = { ...ent, fields };
}

/* ─── 2. Leer seeds ────────────────────────────────────────────────────── */

if (!fs.existsSync(SEEDS_PATH)) {
  console.error(`ERROR: falta ${path.relative(REPO_ROOT, SEEDS_PATH)}`);
  process.exit(1);
}
let seeds;
try {
  seeds = JSON.parse(fs.readFileSync(SEEDS_PATH, 'utf8'));
} catch (e) {
  console.error(`ERROR: fixture-seeds.json no es JSON válido: ${e.message}`);
  process.exit(1);
}

/* ─── 3. Validar seeds vs interfaces ───────────────────────────────────── */

// Split de union types a nivel top (respeta anidación de {} [] <> ())
function splitUnion(typeText) {
  const parts = [];
  let depth = 0, cur = '';
  for (const ch of typeText) {
    if ('{[(<'.includes(ch)) depth++;
    else if ('}])>'.includes(ch)) depth--;
    if (ch === '|' && depth === 0) { parts.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

// true = matchea, false = no matchea, null = tipo no chequeable (se acepta)
function valueMatchesType(value, typeText) {
  const parts = splitUnion(typeText);
  let anyCheckable = false;
  for (const p of parts) {
    if (p === 'null') { anyCheckable = true; if (value === null) return true; continue; }
    if (p === 'undefined') { anyCheckable = true; if (value === undefined) return true; continue; }
    if (p === 'string') { anyCheckable = true; if (typeof value === 'string') return true; continue; }
    if (p === 'number') { anyCheckable = true; if (typeof value === 'number') return true; continue; }
    if (p === 'boolean') { anyCheckable = true; if (typeof value === 'boolean') return true; continue; }
    if (/^['"].*['"]$/.test(p)) { anyCheckable = true; if (value === p.slice(1, -1)) return true; continue; }
    if (p.endsWith('[]') || p.startsWith('Array<')) { anyCheckable = true; if (Array.isArray(value)) return true; continue; }
    if (p.startsWith('{')) { anyCheckable = true; if (value !== null && typeof value === 'object' && !Array.isArray(value)) return true; continue; }
    return null; // tipo no primitivo/desconocido (import type, generics…) — no se chequea
  }
  return anyCheckable ? false : null;
}

const emitted = {}; // seedKey → array de objetos limpios a emitir

for (const ent of ENTITIES) {
  const meta = interfaces[ent.seedKey];
  if (!meta) continue;
  const rows = seeds[ent.seedKey];
  if (!Array.isArray(rows) || rows.length === 0) {
    errors.push(`[${ent.seedKey}] falta el array de seeds (o está vacío) en fixture-seeds.json`);
    continue;
  }
  const fieldMap = new Map(meta.fields.map((f) => [f.name, f]));
  const seededFields = new Set();
  const clean = [];

  rows.forEach((row, i) => {
    const out = {};
    for (const [key, value] of Object.entries(row)) {
      const field = fieldMap.get(key);
      if (!field) {
        errors.push(`[${ent.seedKey}[${i}]] campo "${key}" NO existe en la interfaz real ${meta.iface} (${meta.file}). Campos válidos: ${meta.fields.map((f) => f.name).join(', ')}`);
        continue;
      }
      const match = valueMatchesType(value, field.typeText);
      if (match === false) {
        errors.push(`[${ent.seedKey}[${i}].${key}] valor ${JSON.stringify(value)} no matchea el tipo real \`${field.typeText}\``);
        continue;
      }
      seededFields.add(key);
      out[key] = value;
    }
    for (const f of meta.fields) {
      if (!f.optional && !(f.name in row)) {
        errors.push(`[${ent.seedKey}[${i}]] falta el campo REQUERIDO "${f.name}" (tipo \`${f.typeText}\`) de ${meta.iface}`);
      }
    }
    clean.push(out);
  });

  for (const f of meta.fields) {
    if (f.optional && !seededFields.has(f.name)) {
      warnings.push(`[${ent.seedKey}] campo opcional "${f.name}" sin seed — se omite del fixture`);
    }
  }
  emitted[ent.seedKey] = clean;
}

/* ─── 4. Integridad referencial + regla cántaro←categoría ──────────────── */

function ids(key, idField = 'id') {
  return new Set((emitted[key] ?? []).map((r) => r[idField]).filter((v) => v != null));
}

if (emitted.transactions && emitted.accounts && emitted.categories && emitted.jars) {
  const accountIds = ids('accounts');
  const categoryIds = ids('categories');
  const jarIds = ids('jars');
  const providerIds = ids('providers');
  const tagIds = ids('tags');
  const catById = new Map((emitted.categories ?? []).map((c) => [c.id, c]));

  (emitted.categories ?? []).forEach((c, i) => {
    if (c.assigned_jar_id != null && !jarIds.has(c.assigned_jar_id)) {
      errors.push(`[categories[${i}] "${c.name}"] assigned_jar_id=${c.assigned_jar_id} no existe en SAMPLE_JARS`);
    }
  });

  (emitted.transactions ?? []).forEach((t, i) => {
    const tag = `transactions[${i}] "${t.name}"`;
    if (t.account_id != null && !accountIds.has(t.account_id)) errors.push(`[${tag}] account_id=${t.account_id} no existe en SAMPLE_ACCOUNTS`);
    if (t.category_id != null && !categoryIds.has(t.category_id)) errors.push(`[${tag}] category_id=${t.category_id} no existe en SAMPLE_CATEGORIES`);
    if (t.provider_id != null && providerIds.size && !providerIds.has(t.provider_id)) errors.push(`[${tag}] provider_id=${t.provider_id} no existe en SAMPLE_PROVIDERS`);
    for (const tg of t.tags ?? []) {
      if (tg?.id != null && !tagIds.has(tg.id)) errors.push(`[${tag}] tag id=${tg.id} no existe en SAMPLE_TAGS`);
    }
    // Regla de negocio: el jar SIEMPRE se deriva de la categoría (jarForCategory).
    if (t.category_id != null) {
      const cat = catById.get(t.category_id);
      const expected = cat ? (cat.assigned_jar_id ?? null) : null;
      const actual = t.jar_id ?? null;
      if (cat && expected !== actual) {
        errors.push(`[${tag}] jar_id=${JSON.stringify(actual)} viola la regla cántaro←categoría: la categoría "${cat.name}" (id ${cat.id}) tiene assigned_jar_id=${JSON.stringify(expected)}. El jar NUNCA se elige a mano.`);
      }
    }
  });
}

/* ─── 5. Render de outputs ─────────────────────────────────────────────── */

function renderArray(rows) {
  return `[\n${rows.map((r) => '  ' + JSON.stringify(r)).join(',\n')}\n]`;
}

function renderJs() {
  const header = [
    '/* GENERATED — do not edit, run `node rediseno/tools/generate-fixtures.mjs`',
    ' *',
    ' * Fixtures con las SHAPES REALES de las interfaces TS del frontend.',
    ' * Todo componente nuevo de Claude Design consume estos window.SAMPLE_*.',
    ' * (ver rediseno/DESIGN_CONTRACT.md)',
    ' *',
    ' * Interfaces fuente:',
    ...ENTITIES.filter((e) => interfaces[e.seedKey]).map(
      (e) => ` *   window.${e.windowVar.padEnd(17)} ← ${e.iface.padEnd(16)} (${e.file})`,
    ),
    ' *',
    ' * Reglas de dominio reflejadas en los datos:',
    ' *   - el jar de una tx SIEMPRE es el assigned_jar_id de su categoría (jarForCategory)',
    ' *   - categorías de ingreso → assigned_jar_id null → tx.jar_id null',
    ' *   - monedas reales del producto: USD / EUR / VES',
    ' */',
    '',
  ].join('\n');
  const body = ENTITIES.filter((e) => emitted[e.seedKey]).map((e) => {
    const meta = interfaces[e.seedKey];
    const fieldsDoc = meta.fields.map((f) => `${f.name}${f.optional ? '?' : ''}: ${f.typeText}`).join('\n *   ');
    return `/* ${e.iface} (${e.file})\n *   ${fieldsDoc}\n */\nwindow.${e.windowVar} = ${renderArray(emitted[e.seedKey])};\n`;
  }).join('\n');
  return header + body;
}

function renderMdTables() {
  const blocks = ENTITIES.filter((e) => interfaces[e.seedKey]).map((e) => {
    const meta = interfaces[e.seedKey];
    const rows = meta.fields.map(
      (f) => `| \`${f.name}\` | \`${f.typeText.replace(/\|/g, '\\|')}\` | ${f.optional ? 'opcional' : '**sí**'} |`,
    ).join('\n');
    return `### \`window.${e.windowVar}\` — interfaz \`${meta.iface}\` (\`${meta.file}\`)\n\n| Campo | Tipo real | Requerido |\n|---|---|---|\n${rows}`;
  });
  return `${MD_BEGIN}\n\n${blocks.join('\n\n')}\n\n${MD_END}`;
}

function replaceMdSection(mdContent) {
  const start = mdContent.indexOf(MD_BEGIN);
  const end = mdContent.indexOf(MD_END);
  if (start === -1 || end === -1) return null;
  return mdContent.slice(0, start) + renderMdTables() + mdContent.slice(end + MD_END.length);
}

/* ─── 6. Reporte + escritura ───────────────────────────────────────────── */

for (const w of warnings) console.warn(`WARN  ${w}`);
if (errors.length) {
  console.error('');
  for (const e of errors) console.error(`ERROR ${e}`);
  console.error(`\nFALLÓ: ${errors.length} error(es). Ni sample-data.contract.js ni DESIGN_CONTRACT.md fueron modificados.`);
  console.error('Causa típica: las interfaces TS cambiaron y los seeds quedaron stale → actualizar rediseno/tools/fixture-seeds.json.');
  process.exit(1);
}

const jsOut = renderJs();
const mdCurrent = fs.existsSync(CONTRACT_MD) ? fs.readFileSync(CONTRACT_MD, 'utf8') : null;
const mdOut = mdCurrent ? replaceMdSection(mdCurrent) : null;

if (CHECK_MODE) {
  let stale = false;
  const jsCurrent = fs.existsSync(OUT_JS) ? fs.readFileSync(OUT_JS, 'utf8') : null;
  if (jsCurrent !== jsOut) { stale = true; console.error(`ERROR --check: ${path.relative(REPO_ROOT, OUT_JS)} está stale (o no existe) — correr el script sin --check y commitear.`); }
  if (mdCurrent && mdOut && mdCurrent !== mdOut) { stale = true; console.error(`ERROR --check: la tabla de campos de ${path.relative(REPO_ROOT, CONTRACT_MD)} está stale — correr el script sin --check y commitear.`); }
  if (stale) process.exit(1);
  console.log(`OK --check: seeds válidos contra ${Object.keys(interfaces).length} interfaces reales; outputs al día. (${warnings.length} warning(s))`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(OUT_JS), { recursive: true });
fs.writeFileSync(OUT_JS, jsOut);
console.log(`OK escrito ${path.relative(REPO_ROOT, OUT_JS)} (${ENTITIES.filter((e) => emitted[e.seedKey]).map((e) => `${e.windowVar}=${emitted[e.seedKey].length}`).join(', ')})`);

if (mdCurrent) {
  if (mdOut) {
    if (mdOut !== mdCurrent) { fs.writeFileSync(CONTRACT_MD, mdOut); console.log(`OK actualizada tabla de campos en ${path.relative(REPO_ROOT, CONTRACT_MD)}`); }
    else console.log(`OK tabla de campos de DESIGN_CONTRACT.md ya estaba al día`);
  } else {
    console.warn(`WARN DESIGN_CONTRACT.md existe pero no tiene los marcadores ${MD_BEGIN.slice(0, 30)}… — tabla no actualizada`);
  }
}
console.log(`Listo. ${warnings.length} warning(s), 0 errores.`);
