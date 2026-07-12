# CONTRATO DE GENERACIÓN — Claude Design → OWFinance

> Adjuntar este archivo (+ `data/sample-data.contract.js`) en CADA pedido de componente
> nuevo a Claude Design. El JSX que no cumpla este contrato se rechaza en el port a Vue.

## 1. Datos — nunca inventar nombres de campo

Todo componente nuevo consume los fixtures globales `window.SAMPLE_TX`, `window.SAMPLE_ACCOUNTS`,
`window.SAMPLE_JARS`, `window.SAMPLE_CATEGORIES`, `window.SAMPLE_TAGS`, `window.SAMPLE_PROVIDERS`
definidos en `data/sample-data.contract.js`. Sus shapes son las interfaces TS REALES del frontend
Vue — usar exactamente esos nombres de campo (snake_case donde aplica: `account_id`, `jar_id`,
`category_id`). Prohibido inventar campos (`jarColor`, `acctId`, `label`, `meta` NO existen).

<!-- CONTRACT-FIELDS:BEGIN (generado por tools/generate-fixtures.mjs — no editar a mano) -->

### `window.SAMPLE_TX` — interfaz `Transaction` (`src/stores/transactions.ts`)

| Campo | Tipo real | Requerido |
|---|---|---|
| `id` | `number` | **sí** |
| `name` | `string` | **sí** |
| `amount` | `number` | **sí** |
| `amount_tax` | `number` | **sí** |
| `description` | `string` | **sí** |
| `date` | `string` | **sí** |
| `active` | `boolean` | **sí** |
| `provider_id` | `number` | **sí** |
| `rate_id` | `number` | **sí** |
| `url_file` | `string \| null` | opcional |
| `transaction_type_id` | `string \| null` | opcional |
| `user_id` | `number \| null` | opcional |
| `account_id` | `number \| null` | opcional |
| `category_id` | `number \| null` | opcional |
| `jar_id` | `number \| null` | opcional |
| `user` | `{ id: number; name: string } \| null` | opcional |
| `account` | `{ id: number; name: string } \| null` | opcional |
| `provider` | `{ id: number; name: string } \| null` | opcional |
| `rate` | `{ id: number; name: string; value: string } \| null` | opcional |
| `transaction_type` | `{ id: number; name: string } \| null` | opcional |
| `category` | `{ id: number; name: string; icon?: string \| null; jar_slug?: string \| null } \| null` | opcional |
| `jar` | `{ id: number; name: string; color?: string \| null; icon?: string \| null } \| null` | opcional |
| `tags` | `Tag[]` | opcional |
| `created_at` | `string` | opcional |
| `updated_at` | `string` | opcional |
| `payment_transactions` | `PaymentTransaction[]` | opcional |

### `window.SAMPLE_ACCOUNTS` — interfaz `AccountOption` (`src/composables/useTransactionForm.ts`)

| Campo | Tipo real | Requerido |
|---|---|---|
| `id` | `number` | **sí** |
| `name` | `string` | **sí** |
| `isDefault` | `boolean` | opcional |
| `balance` | `number` | opcional |
| `currencySymbol` | `string` | opcional |
| `currencyCode` | `string` | opcional |
| `currencyId` | `number \| null` | opcional |

### `window.SAMPLE_JARS` — interfaz `JarRef` (`src/utils/txCatalog.ts`)

| Campo | Tipo real | Requerido |
|---|---|---|
| `id` | `number` | **sí** |
| `name` | `string` | **sí** |
| `color` | `string` | opcional |
| `icon` | `string` | opcional |
| `percent` | `number` | opcional |

### `window.SAMPLE_CATEGORIES` — interfaz `CatalogCategory` (`src/utils/txCatalog.ts`)

| Campo | Tipo real | Requerido |
|---|---|---|
| `id` | `number` | **sí** |
| `name` | `string` | **sí** |
| `icon` | `string \| null` | **sí** |
| `jar_slug` | `string \| null` | **sí** |
| `assigned_jar_id` | `number \| null` | **sí** |
| `active` | `number \| boolean` | **sí** |
| `user_id` | `number \| null` | **sí** |
| `type` | `string \| null` | **sí** |
| `parent_id` | `number \| null` | **sí** |

### `window.SAMPLE_TAGS` — interfaz `Tag` (`src/stores/tags.ts`)

| Campo | Tipo real | Requerido |
|---|---|---|
| `id` | `number` | **sí** |
| `slug` | `string` | **sí** |
| `name` | `string` | **sí** |
| `description` | `string` | opcional |
| `color` | `string` | **sí** |
| `icon` | `string` | **sí** |
| `type` | `'system' \| 'user'` | **sí** |

### `window.SAMPLE_PROVIDERS` — interfaz `ProviderOption` (`src/composables/useTransactionForm.ts`)

| Campo | Tipo real | Requerido |
|---|---|---|
| `id` | `number` | **sí** |
| `name` | `string` | **sí** |
| `address` | `string` | opcional |

<!-- CONTRACT-FIELDS:END -->

## 2. Callbacks — contrato fijo (4 nombres, nada más)

| Callback | Cuándo |
|---|---|
| `onSave(payload)` | submit del formulario — `payload` con las shapes de la sección 1 |
| `onDelete(id)` | eliminar una entidad |
| `onClose()` | cerrar modal/sheet/panel |
| `onSelectAction(actionId)` | el usuario elige una acción de un menú/lista |

Nunca inventar nombres nuevos (`onSubmitTx`, `onDismiss`, etc.). Si el componente necesita
algo fuera de estos cuatro → usar `onChange(field, value)` y documentarlo en un comentario
de cabecera del JSX.

## 3. Estado — un solo useState por formulario

El estado de un formulario va en UN `useState` con objeto (`const [form, setForm] = useState({...})`),
NO un useState por campo. Así el port a Vue es un único `ref({...})`.

## 4. Iconos

Siempre `<span className="material-icons">nombre_del_icono</span>` — mapea 1:1 a `q-icon`.
Nada de SVG inline ni librerías de iconos.

## 5. Lite vs Pro — archivos separados

Componentes SEPARADOS: `XxxLite.jsx` y `XxxPro.jsx`. NO una prop `mode` con `if/return`
duplicado dentro del mismo archivo — el código Vue real los separa.
Recordar: Lite NO tiene comisiones, split ni items (solo Pro).

## 6. Mobile

Si el componente tiene variante bottom-sheet mobile → archivo separado con sufijo
(`XxxSheet.jsx`) y comentario de cabecera `// MOBILE-ONLY — port opcional`.

## 7. Regla cántaro (no negociable)

El jar NUNCA es un selector independiente. Siempre se deriva de la categoría
(`jarForCategory`): en los fixtures, `jar_id` de cada tx = `assigned_jar_id` de su categoría;
categorías de ingreso → `jar_id: null` → chip "Sin cántaro". En UI se muestra como chip
anclado read-only (icono de candado), jamás editable.

## 8. Sin custom hooks

No crear custom hooks nuevos (`useViewport`, `useTxState`, …). Responsive = media queries
CSS puras. Estado = `useState` plano (sección 3).

---

**Mantenimiento**: este archivo y `data/sample-data.contract.js` se regeneran/validan con
`node rediseno/tools/generate-fixtures.mjs` (gate: `--check`, corre en CI —
`.github/workflows/design-contract.yml`). Si las interfaces TS del frontend cambian,
correr el script (falla si los seeds quedaron stale) y volver a subir AMBOS archivos al
proyecto `rediseno` de Claude Design (canal DesignSync MCP, ciclo `/rediseno-sync`).

**Este contrato fija las shapes.** El comportamiento de negocio canónico está en
`BEHAVIOR.md`; las divergencias adjudicadas, en `DECISIONS.md`; el estado de cada vista
(portada / pendiente / divergente), en `views-registry.json`; el protocolo de
sincronización con el espejo git, en `_sync/SYNC_PROTOCOL.md`.
