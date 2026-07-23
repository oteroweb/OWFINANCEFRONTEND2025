# DECISIONS — ledger de divergencias diseño ↔ Vue

> Memoria externa de las decisiones de negocio del flujo Claude Design ↔ Vue.
> Este archivo vive en el espejo y se sube también al proyecto de Claude Design,
> para que ambos lados trabajen contra las mismas adjudicaciones.

## La regla (no negociable)

Cuando el ciclo de sincronización detecta que algo del diseño **ya existe en Vue por
otra vía** (misma feature, distinto comportamiento), está PROHIBIDO excluirlo del port
en silencio. Toda colisión exige una **disposición explícita** registrada acá, con uno
de estos cuatro valores:

| Disposición | Significado |
|---|---|
| `design-gana` | El Vue se corrige para adoptar el comportamiento del diseño |
| `vue-gana` | El diseño se corrige para reflejar lo ya implementado |
| `fusionar` | Se define un comportamiento nuevo que toma de ambos; los DOS lados se actualizan |
| `intencionalmente-distintos` | Coexisten a propósito (documentar por qué) |

Mientras una divergencia no tenga asiento acá, su vista queda con estado
`divergent-pending-decision` en `views-registry.json` y **no se porta**.

---

## D-001 — Gasto compartido: reparto equitativo vs manual

- **Fecha**: 2026-07-12 · **Estado**: ADJUDICADO · **Disposición**: `fusionar`
- **Divergencia**: el diseño (`ui_kits/lite-desktop/organisms/TransactionForm.jsx`,
  "Gasto compartido ('vaca')") reparte el monto **equitativamente** entre categorías de
  forma automática. El Vue real (`src/components/SmartTransactionModal.vue`, panel
  `shared`/`sharedCats`) usa montos **manuales por fila** validando que la suma cuadre
  con el total. Misma feature, mecánicas incompatibles, ambas conviviendo sin dueño.
- **Decisión** (Jose, 2026-07-12): comportamiento canónico **híbrido** — al agregar
  categorías el monto se reparte equitativamente por defecto (como el diseño), pero
  cada fila sigue siendo editable a mano (como el Vue). Editar una fila re-reparte el
  resto solo entre las filas no tocadas.
- **Acciones pendientes**:
  - [ ] Vue: `SmartTransactionModal.vue` — reparto equitativo por defecto al agregar
    fila / activar el panel, preservando edición manual (tarea aparte, no este PR).
  - [ ] Diseño: `TransactionForm.jsx` — permitir edición manual por fila sobre el
    reparto automático.
- **Mecánica canónica registrada en**: `BEHAVIOR.md` §4.

## D-002 — Adjunto de foto/soporte: port UI-first sin backend

- **Fecha**: 2026-07-12 · **Estado**: ADJUDICADO · **Disposición**: `intencionalmente-distintos` (temporal)
- **Contexto**: el campo de adjunto se portó fiel al diseño como UI-only
  (`URL.createObjectURL`, sin persistencia) con el wiring real diferido a **OWF-283**.
- **Decisión**: el patrón UI-first es válido **solo** bajo esta regla:
  > Se bloquea el port hasta definir backend si la decisión pendiente puede cambiar lo
  > que la UI muestra o cómo se interactúa (la mecánica determina la estructura).
  > No se bloquea si el backend solo cambia dónde se persiste o de dónde se lee.
  El adjunto pasa la regla (la UI es "archivo + preview + quitar" sea cual sea el
  storage). El gasto compartido (D-001) la falla — por eso exigió adjudicación.
- **Guardas**: toda deuda UI-only se registra acá con su tarea; máximo **3** features
  UI-only sin cablear simultáneas en producción.

## D-003 — Panel de filtros: 3 columnas permanentes vs. botón "Filtros" colapsado

- **Fecha**: 2026-07-22 · **Estado**: ADJUDICADO (confirmado 2026-07-23) · **Disposición**: `vue-gana`
- **Divergencia**: el diseño de referencia (Claude Design, captura #4 del audit
  diseño↔prod de Transacciones) colapsa los filtros en un botón "Filtros" que abre un
  panel. El Vue real (`src/pages/user/transactions/index.vue`, §1.3) muestra 3 "pools"
  de filtro siempre visibles en grid (Filtros activos / Categorías / Cántaros), no
  colapsables. Confirmado real en ambos lados (item #1 del audit), ligado a los items
  #2 (chips removibles) y #3 (chips de rango de monto) — los tres dependen de la misma
  decisión de layout.
- **Decisión** (Jose, 2026-07-23): `vue-gana` — el panel permanente de prod es más
  potente (exploración sin clics extra) y ya está probado con datos reales; el diseño
  debe adoptar el patrón de 3 columnas en vez de colapsarlo.
- **Acciones pendientes**:
  - [ ] Diseño: portar el patrón de 3 columnas permanentes (Filtros activos /
    Categorías / Cántaros) a la vista de Transacciones en Claude Design, reemplazando
    el botón "Filtros" colapsado — incluye los chips removibles (#2) y los chips de
    rango de monto (#3), ambos ligados a esta misma decisión.
  - [x] Vue: sin acción — ya implementa el comportamiento canónico.

---

## D-004 — 3ra pestaña "Categorías" en el panel de cuentas (sidebar de Transacciones)

- **Fecha**: 2026-07-23 · **Estado**: PENDIENTE · **Disposición propuesta**: por definir
- **Divergencia**: item #7 del audit diseño↔prod de Transacciones. `AccountsPanel.jsx`
  (Claude Design, confirmado con acceso real al proyecto tras resolverse el bloqueo de
  auth de DesignSync) tiene 3 pestañas en el panel lateral: `['accounts', 'debts',
  'categories']`. La pestaña "Categorías" es una feature completa: buscador, categorías
  agrupadas por cántaro (drag desde una categoría, drop sobre un cántaro en la pantalla
  Cántaros para reasignarla), editor inline por categoría (nombre/color/cántaro/
  descripción) y "Agregar categoría". El sidebar real de cuentas en Vue
  (`src/pages/user/transactions/index.vue`, panel `Cuentas`/`Deudas`) solo tiene 2
  pestañas — no existe ninguna 3ra pestaña de categorías ahí. La gestión de categorías
  SÍ existe en Vue, pero en otra ubicación: `Configuración → Categorías` (página
  separada, sin patrón de arrastrar-y-soltar sobre cántaros).
- **No es una feature faltante lisa y llana** — es una divergencia de patrón/ubicación:
  el diseño propone gestión de categorías inline (sidebar de Transacciones, con
  drag-and-drop hacia Cántaros); Vue ya resuelve lo mismo desde una página dedicada de
  Configuración. Ambos cubren el caso de uso "editar/crear categoría", con UX distinta.
- **Decisión**: pendiente. Preguntas para adjudicar:
  1. ¿Vale la pena el patrón drag-and-drop categoría→cántaro inline en Transacciones,
     o la página dedicada de Configuración ya alcanza?
  2. Si se porta, ¿reemplaza o convive con `Configuración → Categorías`?
- **Acción pendiente**: confirmar con Jose antes de portar o descartar. Mientras no
  haya decisión, esta pestaña del diseño queda `divergent-pending-decision` y no se
  porta a Vue ni se elimina del diseño.

---

<!-- Plantilla para asientos nuevos:

## D-00X — <concepto>

- **Fecha**: YYYY-MM-DD · **Estado**: PENDIENTE|ADJUDICADO · **Disposición**: <valor>
- **Divergencia**: <qué hace el diseño vs qué hace el Vue, con paths>
- **Decisión** (<quién>, <fecha>): <comportamiento canónico>
- **Acciones pendientes**: <checklist con archivos de ambos lados>
-->
