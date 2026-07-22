# Documento Central del Rediseño — OWFinance 2026

<!-- Generado: 2026-07-20. Este es el PUNTO DE ENTRADA único para el rediseño completo del producto. -->
<!-- Léelo antes de abrir cualquier otro documento. Dice qué existe, qué falta, y en qué orden proceder. -->

## Cómo usar este documento

1. Lee la sección 1 (arquitectura) una sola vez — aplica a **todo** el sistema, no la repitas por módulo.
2. Lee la sección 2 (reglas no negociables) — son el contrato real que ya rige el flujo diseño↔Vue en este proyecto, no una propuesta nueva.
3. Ve a la sección 3 (tablero de estado) para saber, módulo por módulo, si ya existe un prompt de rediseño dedicado, qué estado tiene en `views-registry.json`, y qué decisiones siguen abiertas.
4. Para un módulo con prompt dedicado: ábrelo y trabaja directo.
5. Para un módulo sin prompt dedicado: sigue el proceso de la sección 4 para generarlo antes de diseñar (no diseñes "a ojo" contra el código — los dos prompts ya existentes muestran el nivel de detalle esperado).
6. Cualquier divergencia diseño↔Vue que encuentres se registra en `DECISIONS.md` — no se resuelve en silencio ni se decide sin adjudicación (ver sección 2.3).

---

## 1. Arquitectura del producto (aplica a TODO el rediseño, leer una sola vez)

- **OWFinance tiene dos modos, no dos planes**: Lite (calmado, mobile-first, un CTA a la vez, jerarquía dinero-primero) y Pro (denso, multi-panel, estilo "terminal Bloomberg"). Existe también un tercer modo **Legacy** (código heredado, todavía vivo en Transacciones y Análisis) cuyo destino es una decisión de producto pendiente — ver sección 5.
- **Mismo producto, mismo sistema de diseño**: Lite y Pro comparten marca, color, tipografía y voz. Difieren en **densidad y postura de layout**, nunca en identidad visual.
- **No hay rutas separadas por modo.** Un único árbol de rutas `/user/*`; cada página raíz decide render según `layout_mode` del usuario (`'pro' | 'lite' | 'legacy'`), una preferencia editable en Configuración, **no un plan de pago** — no hay feature-gating por suscripción en el código real hoy.
- **Regla de implementación (ya establecida, no negociable)**: Lite y Pro son **archivos Vue separados** (`LiteXxxView.vue` / `ProXxxView.vue` o bifurcación completa de template), nunca una prop `mode` mezclando ambos en un solo componente denso. Ver `BEHAVIOR.md` §3. (Nota: `SmartTransactionModal.vue` hoy viola parcialmente esta regla con branching interno `isProMode` — es deuda técnica a resolver en el rediseño de Transacciones, no un patrón a imitar en módulos nuevos.)
- **4 rutas primarias** (bottom nav / nav pill — nunca más que estas): `/user/home`, `/user/transactions`, `/user/jars`, `/user/config`.
- **2 rutas secundarias** (alcanzables desde Home + Quick Add, no en la barra de tabs): `/user/debts`, `/user/dreams`.
- El resto de rutas (`/user/expense-analysis`, `/user/financial-profile`, `/user/profile`, `/user/notifications`, `/user/asesor`, `/user/accounts`, `/user/categories`, `/user/taxes`) son de segundo nivel, alcanzadas por navegación interna, no por tab bar.

---

## 2. Reglas no negociables — ya viven en `rediseno/`, no las reinventes

Estos 4 documentos **ya existen y ya rigen** el flujo de este proyecto. Cárgalos junto con el prompt del módulo que estés trabajando:

### 2.1 `DESIGN_CONTRACT.md` — contrato de datos
Todo componente nuevo consume los fixtures globales (`window.SAMPLE_TX`, `SAMPLE_ACCOUNTS`, `SAMPLE_JARS`, `SAMPLE_CATEGORIES`, `SAMPLE_TAGS`, `SAMPLE_PROVIDERS`) con los shapes reales de las interfaces TS del frontend Vue. **Prohibido inventar nombres de campo** (`jarColor`, `acctId`, `label`, `meta` no existen — usar `color`, `account_id`, etc., en snake_case donde el backend lo use así). Cualquier JSX que no cumpla el contrato se rechaza en el port a Vue.

### 2.2 `BEHAVIOR.md` — mecánicas de negocio canónicas
Fija el **comportamiento**, no la presentación (eso lo decide el diseño). Ejemplos de mecánicas inquebrantables ya documentadas: el cántaro nunca es un selector independiente (siempre se deriva de la categoría vía `jarForCategory()`, se muestra como chip anclado read-only con candado); categorías de ingreso nunca aportan a cántaro; Lite no tiene comisiones/split/ítems/gasto-compartido (exclusivos Pro); en transferencias, incluso en Pro, solo aplica Comisión. Un componente que contradiga una mecánica de esta lista se rechaza en el port — si el diseño quiere cambiar una mecánica, se propone primero como asiento en `DECISIONS.md`, no se implementa directo.

### 2.3 `DECISIONS.md` — ledger de divergencias diseño↔Vue (proceso obligatorio)
Cuando el diseño y el Vue real hacen algo distinto para la misma feature, está **prohibido resolverlo en silencio**. Toda divergencia exige un asiento explícito con una de estas 4 disposiciones: `design-gana` (Vue se corrige) · `vue-gana` (diseño se corrige) · `fusionar` (comportamiento nuevo, se actualizan ambos lados) · `intencionalmente-distintos` (conviven a propósito, documentado por qué). Mientras una divergencia no tenga asiento acá, su vista queda `divergent-pending-decision` en `views-registry.json` y **no se porta**. Máximo 3 features UI-only sin cablear simultáneas en producción (guarda explícita ya establecida).

**Decisiones ya adjudicadas que afectan el rediseño hoy**:
- **D-001** (2026-07-12, `fusionar`): Gasto compartido — reparto equitativo por defecto + editable a mano por fila; editar una fila re-reparte el resto entre las no tocadas. Afecta el rediseño de Transacciones.
- **D-002** (2026-07-12, `intencionalmente-distintos`, temporal): Adjunto de foto/soporte — patrón UI-first sin backend es válido a propósito, wiring diferido a OWF-283. Afecta el rediseño de Transacciones.

### 2.4 `ICONOGRAPHY.md` + `colors_and_type.css`
Set seguro de iconos Quasar `material-icons` (evitar `o_*` outlined y glifos exclusivos de Material Symbols). Tokens de color/tipografía: Light es canónico, `[data-theme="dark"]` lo espeja — nunca hardcodear hex, siempre variable.

### 2.5 `views-registry.json` — estado de sincronización por vista
Antes de asumir que algo "no existe" o "hay que decidir", revisa si ya tiene entrada acá. Estados posibles: `accepted-ported` (ya vive en Vue tal cual el diseño), `superseded-by-vue` (el Vue evolucionó más allá del diseño, el diseño quedó obsoleto), `divergent-adjudicated` (hay decisión en DECISIONS.md, falta implementar), `unreviewed` (nadie comparó todavía), `design-only` (no es una vista, son primitivas/archivo).

---

## 3. Tablero de estado por módulo

| # | Módulo | Rutas | Prompt dedicado | Estado en `views-registry.json` | Decisiones abiertas |
|---|---|---|---|---|---|
| 1 | **Cántaros** | `/user/jars` | ✅ [`PROMPT_REDISENO_CANTAROS.md`](PROMPT_REDISENO_CANTAROS.md) | `jars-view`: `unreviewed` | Ninguna bloqueante conocida |
| 2 | **Transacciones** | `/user/transactions` + formulario global | ✅ [`PROMPT_REDISENO_TRANSACCIONES.md`](PROMPT_REDISENO_TRANSACCIONES.md) | `transactions-view`: `accepted-ported`; `transaction-form-desktop/mobile`: `accepted-ported`; `transaction-detail-desktop`: `accepted-ported`; `transaction-detail-mobile`: `unreviewed`; `tx-catalog`, `anchored-jar-chip`: `accepted-ported`; `smart-quick-modal`: `superseded-by-vue`; `shared-expense`: `divergent-adjudicated` (D-001); `attachment-field`: `divergent-adjudicated` (D-002) | ¿Sigue vivo el modo Legacy? (bloquea alcance, ver §5) |
| 3 | **Home** | `/user/home` | ✅ [`PROMPT_REDISENO_HOME.md`](PROMPT_REDISENO_HOME.md) | `home-lite`, `home-pro`: `unreviewed` — comparar contra el prompt antes de asumir que el JSX refleja el Vue real | Ninguna bloqueante; 6 componentes `components/home/*` son huérfanos (no confundir con producción, ver prompt §"Hallazgo estructural crítico") |
| 4 | **Cuentas / Categorías / Impuestos** | `/user/accounts` (Pro-only), `/user/categories`, `/user/taxes` | ✅ [`PROMPT_REDISENO_CUENTAS_CATEGORIAS_IMPUESTOS.md`](PROMPT_REDISENO_CUENTAS_CATEGORIAS_IMPUESTOS.md) | Sin entrada en el registry — **primer módulo sin plantilla de ruta propia en Claude Design**, solo organismos sueltos (`AccountFilter.jsx`, `AccountsPanel.jsx`, `AddAccountModal.jsx`, `CategorySelector.jsx`) | Diálogo de Categorías duplicado (`index.vue` vs `CategoryDialog.vue`) y "Recalcular saldo" con 2 comportamientos distintos (real vs. simulado) — ambas a resolver antes/durante el diseño, ver prompt §9 |
| 5 | **Deudas / Sueños / Perfil** | `/user/debts`, `/user/dreams`, `/user/financial-profile`, `/user/profile` | ✅ [`PROMPT_REDISENO_DEUDAS_SUENOS_PERFIL.md`](PROMPT_REDISENO_DEUDAS_SUENOS_PERFIL.md) | Sin entrada en el registry todavía (ni siquiera `unreviewed` — nunca se comparó formalmente); sí existen `DebtsRoute.jsx`/`DreamsRoute.jsx`/`FinancialProfileRoute.jsx`/`ProfileRoute.jsx` de referencia | **Pregunta abierta para producto**: estas 4 vistas se renderizan **idénticas** en Pro/Lite hoy — confirmar si es intencional (vistas secundarias) o brecha, antes de diseñar (ver prompt §6) |
| 6 | **Análisis de Gastos** | `/user/expense-analysis` | ✅ [`PROMPT_REDISENO_ANALISIS.md`](PROMPT_REDISENO_ANALISIS.md) | Sin entrada en el registry todavía | `ProAnalisisRoute` y `AnalisisRoute` confirmadas ambas vivas (no hay legacy a retirar entre las dos); modo Legacy transversal sigue con destino pendiente (§5). **Corrección de alcance**: "Tasas de Cambio" no vive en esta vista — ver §5 del prompt dedicado, la edición real está en Home Pro y Config |
| 7 | **Asesor IA / Config / Notificaciones / Onboarding** | `/user/asesor`, `/user/config`, `/user/notifications`, onboarding | ✅ [`PROMPT_REDISENO_ASESOR_CONFIG_NOTIFICACIONES_ONBOARDING.md`](PROMPT_REDISENO_ASESOR_CONFIG_NOTIFICACIONES_ONBOARDING.md) | Solo `onboarding`: `unreviewed`; Asesor/Config/Notificaciones sin entrada. Onboarding tiene la carpeta de diseño más extensa del proyecto (`onboarding/`, con `gamification.jsx` incluido) | "Marcar notificación como leída" no persiste al backend (ninguna de las 2 implementaciones); revisar si hay gamificación más profunda ya diseñada que el Vue actual no aprovecha (prompt §6) |
| 8 | **Admin** | `/admin/*` (18+ vistas) | ✅ [`PROMPT_REDISENO_ADMIN.md`](PROMPT_REDISENO_ADMIN.md) | Sin entrada en el registry; solo `OW Finance - Admin.html` genérico como referencia — menor cobertura de diseño previo de los 9 módulos | 15 de 18 son CRUD genérico sobre `CrudPage.vue` — rediseñar ese componente una vez impacta a los 15; decidir si se agrega confirmación de eliminado al motor (coordinar con módulo 4) |
| 9 | **Auth / Público (marketing)** | `/login`, `/register`, landing, features, pricing, matrix | ✅ [`PROMPT_REDISENO_AUTH_PUBLICO.md`](PROMPT_REDISENO_AUTH_PUBLICO.md) | `landing`: `unreviewed`; resto sin entrada | `FeaturesPage.vue` y `MatrixPage.vue` no coinciden en qué es "simplificado" vs "disponible" en Lite — resolver antes de diseñar (prompt §4). Además: `PricingPage.vue` describe feature-gating por plan que **no existe técnicamente** en el código (prompt §3) — confirmar con producto |

---

## 4. Proceso para generar el prompt de un módulo sin cobertura todavía

Sigue el mismo nivel de detalle que `PROMPT_REDISENO_CANTAROS.md` y `PROMPT_REDISENO_TRANSACCIONES.md` — ambos son la vara de medir. Cada uno cubre, como mínimo:

1. **Objetivo** — qué vista/flujo es, qué problema de negocio resuelve.
2. **Elementos visuales y de layout por modo** (Pro / Lite / Legacy si aplica) — cada card, KPI, tabla, botón, estado — no resumir de más.
3. **Tabla de diferencias Pro vs Lite** renglón por renglón.
4. **Validaciones y reglas de negocio** a preservar (fórmulas exactas si las hay).
5. **Estados vacíos, loaders, mensajes**.
6. **Sección "Qué NO replicar"**: componentes huérfanos, features solo-UI, flujos triplicados/duplicados — **antes de escribir esta sección, revisa `DECISIONS.md` y `views-registry.json`** por si la divergencia que ibas a marcar como "pendiente" ya tiene adjudicación (ver el error que se corrigió en la sección 2.3 de este documento — no lo repitas).
7. **Changelog de cambios recientes** si hubo commits posteriores a la auditoría base (revisar `git log` del submódulo frontend sobre los archivos del módulo).

Fuente de insumo para cada módulo: la sección correspondiente de `.owf/FEATURE_MASTER_LIST.md` (documento hermano en el repo central, con la auditoría de código fuente completa de los 9 módulos) — úsala como research base, no repitas la lectura de código desde cero si el master list ya lo cubre.

---

## 5. Decisiones abiertas que bloquean o afectan alcance (transversales)

- **Destino del modo Legacy**: sigue vivo en Transacciones y Análisis. Antes de rediseñar esas dos vistas hay que decidir si Legacy se retira, se congela, o se rediseña también. No está en `DECISIONS.md` — es una decisión de producto nueva, no técnica.
- **TTS capa 2 (1/2)** (`useSpeechSynthesis.ts`, OWF-319, 2026-07-19): el propio commit lo marca incompleto. Antes de diseñar cualquier feedback visual asociado a audio en el flujo de Voz, confirmar en `.owf/TASKS.md` el alcance de la "capa 2/2" pendiente.
- **Notificaciones no persisten como leídas**: afecta el módulo 7. Es una decisión de ingeniería más que de diseño, pero determina si el rediseño necesita un estado "leída" confiable o debe asumir que siempre se resetea.

---

## 6. Índice completo de documentos

**En este repo (`central`)**:
- [`.owf/FEATURE_MASTER_LIST.md`](../../.owf/FEATURE_MASTER_LIST.md) — auditoría exhaustiva de las 9 áreas del sistema (Home, Transacciones, Cántaros, Cuentas/Categorías/Impuestos, Deudas/Sueños/Perfil, Análisis, Asesor IA/Config/Notificaciones/Onboarding, Admin, Auth/Público) + deuda técnica transversal + inventario de archivos. Es el research base de todo este esfuerzo.
- `.owf/EPIC_VIEWS.md` — tracking pass/fail por vista (Playwright / revisión IA / visto bueno del usuario), complementario al master list.

**En `rediseno/` (este directorio)**:
- `PROMPT_REDISENO_CENTRAL.md` — este documento.
- `PROMPT_REDISENO_CANTAROS.md` — prompt dedicado, listo para usar.
- `PROMPT_REDISENO_TRANSACCIONES.md` — prompt dedicado, listo para usar.
- `DESIGN_CONTRACT.md`, `BEHAVIOR.md`, `DECISIONS.md`, `ICONOGRAPHY.md` — contrato y reglas no negociables (sección 2 arriba).
- `views-registry.json` — estado de sincronización por vista.
- `README.md` — contexto de producto y sistema de diseño (Lite vs Pro, rutas canónicas, tokens).
- `SKILL.md` — cómo se sincroniza este espejo con el proyecto de Claude Design (`/rediseno-sync`).
- `ui_kits/lite-desktop/` — recreación interactiva React/JSX del shell Lite Desktop, referencia estructural (no es código de producción).

---

## 7. Orden recomendado de ataque

**Los 9 módulos ya tienen prompt dedicado** (ver tabla de la sección 3). Orden sugerido de ejecución real (no solo de generación de research):

1. Cántaros, Transacciones, Análisis, Home — vistas primarias, mayor visibilidad de usuario.
2. Cuentas/Categorías/Impuestos, Deudas/Sueños/Perfil — vistas secundarias de dominio de datos.
3. Asesor IA/Config/Notificaciones/Onboarding — flujos transversales, referencian visualmente los módulos anteriores.
4. Admin, Auth/Público — menor prioridad, impacto de usuario final más bajo; Admin se resuelve en bloque rediseñando `CrudPage.vue` una vez.
