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

- **Fecha**: 2026-07-23 · **Estado**: ADJUDICADO (confirmado 2026-07-23) · **Disposición**: `design-gana` (opción 1 — portar el drag-and-drop)
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
- **Decisión** (Jose, 2026-07-23): opción 1 — portar el patrón drag-and-drop inline a
  Vue. Convive con `Configuración → Categorías` (no se elimina esa página; no se pidió).
- **Implementado 2026-07-23** (OWF-343): 3ra pestaña "Categorías" agregada al panel de
  cuentas de `src/pages/user/transactions/index.vue` (junto a Cuentas/Deudas) —
  buscador, categorías agrupadas por cántaro, chips draggable, drop sobre el header de
  un grupo de cántaro para reasignar, "Agregar categoría" (quick-add, solo nombre).
  **Simplificaciones deliberadas frente al mock**: (1) sin editor inline de
  color/descripción por categoría — el modelo `Category` real no tiene esos campos
  (solo `name`/`icon`/`parent_id`/`transaction_type_id`/etc., confirmado en
  `app/Models/Entities/Category.php`); el color de cada chip se hereda del cántaro
  asignado, no es propio de la categoría. (2) el drop target es el header del grupo de
  cántaro DENTRO de esta misma pestaña (no "sobre un cántaro en la pantalla Cántaros"
  como describe el mock) — la pantalla Cántaros vive en otra ruta con su propio estado
  pesado (`POST /jars/bulk-sync`, requiere porcentajes/config completa), no hay forma
  de dropear entre rutas distintas en una SPA; este patrón logra el mismo resultado
  funcional (reasignar categoría→cántaro) sin depender de esa página.
  **Backend nuevo**: `PATCH /categories/{id}/jar` (`CategoryController::assignJar`) —
  sync liviano del pivot `jar_category` para UNA categoría (a diferencia de
  `/jars/bulk-sync`, no toca el resto de cántaros ni sus porcentajes), scoped al
  usuario dueño de la categoría y del cántaro. 2 tests feature nuevos, suite completa
  verde (excepto 2 fallos preexistentes/ajenos ya documentados, no relacionados).

---

## D-014 — AccountShareDialog: soporte multi-grupo (una fila por persona, no por membresía)

- **Fecha**: 2026-09-17 · **Estado**: PENDIENTE (diseño pulleado, sin portar a Vue todavía) · **Disposición**: `design-gana` (pendiente de implementar)
- **Contexto**: pull de `redisenocongrupo.zip` (export completo del proyecto Claude Design, recibido del usuario). `AccountShareDialog.jsx` cambió su firma de `group` (uno) a `groups` (array, retrocompatible) — un usuario puede pertenecer a más de un grupo familiar (pareja + padres, por ejemplo), y la misma persona puede aparecer en dos grupos distintos. Decisión de fondo del diseño: **una fila por PERSONA, no por membresía** — listar dos veces a alguien (una por grupo) daría dos selectores de permiso para la misma pregunta ("¿qué ve esta persona de esta cuenta?"). El permiso es de la persona sobre la cuenta; el grupo es solo el canal por el que se conectaron, y eso se indica con una etiqueta "en {grupo}" junto al nombre cuando hay más de un grupo.
- **Estado del backend**: `OWF-369` ya implementó `family_groups`/`family_group_members` con soporte multi-grupo por diseño (confirmado en `.owf/TASKS.md`) — el modelo de datos probablemente ya soporta esto sin cambios. Falta confirmar que el frontend actual (`FamilyGroupPanel.vue`/`AccountShareDialog` port) consolida por persona en vez de por membresía cuando un usuario está en 2+ grupos — no verificado en esta sesión.
- **Acciones pendientes**:
  - [ ] Confirmar en backend real si un usuario de prueba puede pertenecer a 2 grupos simultáneos hoy (`family_group_members`) sin error.
  - [ ] Portar la lógica de consolidación por persona (`people` array, `via` de grupos) al componente Vue real que implementa el diálogo de compartir cuenta.
  - [ ] Smoke test con un usuario en 2 grupos compartiendo la misma cuenta con una persona presente en ambos.

## Nota de sesión 2026-09-17 — pull masivo desde `redisenocongrupo.zip`

El usuario adjuntó un export completo del proyecto Claude Design (9.6MB, todo `ui_kits/`+docs+HTML) fuera del flujo normal de DesignSync (esta sesión no tiene auth de diseño activa). Se extrajo con `ditto` (macOS `unzip` fallaba con nombres de archivo acentuados — mensaje engañoso "write error (disk full?)", no era falta de espacio) y se compararon archivo por archivo contra el espejo local. Pulleado a `rediseno/`:

- **Fase 2 (Empresas)** — 4 componentes nuevos, sin implementar todavía: `BusinessOnboardingFlow.jsx`, `BusinessEmptyState.jsx`, `BusinessAccessPanel.jsx`, `CreateBusinessModal.jsx`. Ver `OWF-370` en `.owf/TASKS.md`.
- **`ContextBar.jsx`** (nuevo) — selector único de contexto Personal/Empresa para Fase 2, elegido entre 3 candidatos (`candidatos/contexto-{a,b,c}-*.html`, el usuario eligió la variante B). Nota del propio registro de vistas: implica que `layout_mode` deja de ser preferencia pura del usuario y pasa a depender del contexto activo — **contradice `PROMPT_REDISENO_CENTRAL.md` tal como está hoy, hay que confirmar con el usuario antes de portar.**
- **`SecurityDialogs.jsx`** (nuevo) — diálogos de crear/cambiar/eliminar PIN, ligado a `config-security` en el registro de vistas. No verificado si ya existe una contraparte funcional en Vue (Configuración → Seguridad ya tiene PIN real, ver `.owf/TASKS.md` — puede ser divergencia de UI, no de funcionalidad).
- **`InternalDebtCard.jsx`** (nuevo) — deuda entre miembros del grupo familiar (confirmar/disputar/saldar), extiende `debts` con `counterparty_user_id`. Campos `confirmation`/`registered_by_user_id` son de diseño, no están en `ARQUITECTURA_GRUPO_FAMILIAR_EMPRESAS.md` — sin backend, sin empezar.
- **`AccountShareDialog.jsx`** actualizado — ver D-014 arriba.
- `views-registry.json` sincronizado con el remoto (agrega las entradas de arriba, antes solo existían en Claude Design).

**No implementado en esta sesión** (fuera de alcance dado el volumen — el pedido era "dejar el diseño listo", no portar todo de una sentada). Los 4 puntos de arriba (`ContextBar`, `SecurityDialogs`, `InternalDebtCard`, `AccountShareDialog` multi-grupo) son trabajo nuevo descubierto, no estaban en el board — hay que decidir con el usuario si entran en el alcance de OWF-370 (Fase 2 Empresas) o si son tareas separadas.

<!-- Plantilla para asientos nuevos:

## D-00X — <concepto>

- **Fecha**: YYYY-MM-DD · **Estado**: PENDIENTE|ADJUDICADO · **Disposición**: <valor>
- **Divergencia**: <qué hace el diseño vs qué hace el Vue, con paths>
- **Decisión** (<quién>, <fecha>): <comportamiento canónico>
- **Acciones pendientes**: <checklist con archivos de ambos lados>
-->
