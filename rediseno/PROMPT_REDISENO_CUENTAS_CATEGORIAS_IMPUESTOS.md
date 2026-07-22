# Prompt de Rediseño — Cuentas, Categorías e Impuestos

<!-- Generado: 2026-07-20. Fuente: auditoría de código fuente (accounts/index.vue+dictionary.ts, AccountDialog.vue, AccountViewerDialog.vue, AccountsSidebarWidget.vue, AccountsTree.vue, AccountFilterWidget.vue, categories/index.vue, CategoryDialog.vue, CategoriesTree.vue, taxes/index.vue+dictionary.ts, CrudPage.vue) + `.owf/FEATURE_MASTER_LIST.md` sección 4 + verificación de git log (sin cambios desde la auditoría base — último commit relevante es anterior a 2026-07). -->
<!-- Uso: pegar este documento completo como contexto al iniciar el rediseño de `/user/accounts`, `/user/categories` y `/user/taxes`. Mismo nivel de detalle que PROMPT_REDISENO_CANTAROS.md. -->

## Objetivo

Rediseñar 3 módulos relacionados: **Cuentas** (Pro-only), **Categorías** (compartida Pro/Lite) e **Impuestos** (compartida). Se agrupan en un solo documento porque comparten motor técnico (`CrudPage.vue` genérico) y porque Cuentas/Categorías comparten un patrón visual (árbol con drag&drop). **Nota de alcance crítica**: en Lite, Cuentas **no existe como concepto de UI** — no es una versión simplificada, es una ausencia total, deliberada ("billetera implícita"). No diseñar una "versión Lite de Cuentas" a menos que sea una decisión de producto nueva.

---

## 1. Cuentas (`/user/accounts`) — **Pro-only**, en Lite el router redirige a `/user/config`

### 1.1 Mecanismo de exclusión en Lite (confirmado en código, no solo copy de marketing)
- `router/index.ts`: al navegar a `/user/accounts`, si `layout_mode === 'lite'`, redirige a `/user/config` **antes de renderizar nada**.
- `config/index.vue`: el ítem de navegación "Cuentas vinculadas" se **filtra explícitamente** del menú en Lite (comentario en código: *"Lite: single generic account — no account management needed"*).
- `useTransactionForm.ts`: en Lite, si el formulario de transacción no tiene cuenta seleccionada, se **auto-asigna la cuenta `is_default=true`** (o la primera de la lista) sin intervención del usuario — comentario: *"Lite: auto-assign default account (is_default=true / Billetera) as implicit wallet"*.
- Marketing (`LandingPage.vue`, `MatrixPage.vue`) confirma el concepto con copy explícito: *"Billetera implícita: el dinero, sin cuentas que pensar"*.
- **Conclusión para el rediseño**: en Lite no hay creación/edición/eliminación de cuentas, no hay árbol, no hay transferencias visibles entre cuentas, no hay tipos de cuenta seleccionables. Todo el dinero vive en una única cuenta "Billetera" creada en el onboarding.

### 1.2 Página `accounts/index.vue` — wrapper de `CrudPage`
Es solo `<CrudPage :dictionary="dictionary" />` (ver `dictionary.ts`, sección 6 para el motor genérico compartido con Impuestos).
- **Filtros**: select "Moneda" (`currency_id`, opciones de `/currencies`), select "Tipo" (`account_type_id`, opciones de `/account_type`).
- **Columnas**: ID, Nombre, Moneda, Tipo, Inicial, Activo (Sí/No), Acciones (Editar/Eliminar).
- **Formulario**: Nombre, Inicial (numérico), Moneda (select), Tipo de Cuenta (select), Activo (checkbox).
- Botón "Nueva Cuenta", búsqueda global (debounce 300ms), exportar CSV, botón "quitar filtros".

### 1.3 `AccountsSidebarWidget.vue` — widget "Mis cuentas" (sidebar/dashboard, agrupado por carpetas)
- Colapsable con badge "seleccionadas/total". Toolbar: checkbox seleccionar todo/nada, "Seleccionar todas", "Quitar filtro".
- Item "Ver todas mis cuentas" (limpia agrupación).
- Secciones = carpetas: header clickeable selecciona todas las cuentas de la carpeta; total de saldo con **conversión a USD** cuando hay tasa disponible, agrupando por moneda (monedas no convertibles se muestran aparte concatenadas con "+"). Color rojo claro si negativo, verde-agua si positivo.
- Cada cuenta: icono, nombre + saldo formateado con símbolo/código, checkbox de selección (dispara evento global `ow:accounts:selected` + store), menú "⋮":
  - **Ajustar saldo**: dialog con "Nuevo saldo" + checkbox "Generar transacción de ajuste" (default `true`) → `POST /accounts/:id/adjust-balance` seguido de `POST /accounts/:id/recalculate-account`.
  - **Recalcular saldo**: `POST /accounts/:id/recalculate-account` con loading global `$q.loading.show`.
- Carga: intenta `/accounts/tree` (consolidado); si no hay datos, fallback a `/accounts/folders` + `/accounts` combinando jerarquía manualmente.
- Escucha `ow:transactions:changed` para auto-recargar.

### 1.4 `AccountsTree.vue` — gestión completa con drag&drop (crear/editar/eliminar cuentas y carpetas)
- Botones: "Nueva carpeta" (dialog con Nombre), "Nueva cuenta" (emite al padre), "Eliminar carpeta" (solo si hay carpeta no-raíz seleccionada).
- Árbol (`q-tree`, expandido por defecto): nodo especial `root`="Sin asignar" (cuentas sin carpeta, siempre primero, no eliminable/no arrastrable).
- Por nodo — cuentas: icono, label, saldo (compactado k/M) coloreado por signo. Carpetas: icono `folder`, conteo, total recursivo con conversión USD.
- Acciones al hover (cuentas): toggle incluir/excluir del balance global (icono `account_balance`/`money_off`), Editar, Eliminar. (Carpetas): Renombrar.
- Indicador persistente no-hover: icono `money_off` gris si la cuenta está excluida del balance global.
- **Drag & drop completo**: mover dentro de carpeta (tercio medio), reordenar antes/después (tercio superior/inferior), reglas anti-loop (no mover carpeta dentro de sí misma/descendiente), "Sin asignar" no admite carpetas ni insertar-antes. Imagen de arrastre custom (chip azul flotante). Drop fuera de cualquier nodo → cuentas a "Sin asignar", carpetas a top-level.
- Selección: click en cuenta selecciona solo esa; click en carpeta selecciona todas las anidadas; doble-click emite `view-account`.

### 1.5 `AccountFilterWidget.vue` — pill + panel flotante de filtro (pieza más nueva del rediseño previo, usada en dashboard/transacciones)
- Pill: icono billetera, label dinámico ("Todas las cuentas"/nombre/"N cuentas"), badge de conteo.
- Panel: header "Filtrar por cuenta" + "Limpiar" · **segmentos rápidos**: Todas / Solo USD / Solo VES / Con deuda (detectada por saldo negativo o nombre de tipo conteniendo crédito/credit/deuda/préstamo/loan) · buscador · lista agrupada por carpeta con checkbox de grupo parcial/todo y total en USD.
- Por cuenta: checkbox, badge de color con icono por tipo (bank/cash/card/cashea), nombre, subtítulo (moneda + últimos 4 dígitos si existen, tag "ajustado" si hay override local), saldo nativo + equivalente USD o "Recalculando…" con spinner.
- Menú kebab: "Ajustar saldo" (inline, guardar/cancelar), "Recalcular saldo" (⚠️ en este componente específico está **simulado con timeout local ~950ms**, no golpea el API directamente — parece una versión de UI/prototipo más nueva que la de `AccountsSidebarWidget`, que sí llama al endpoint real).
- Footer: conteo + total combinado USD + "Listo". Vacío: "No se encontraron cuentas". Cierra con click-outside/Escape.

### 1.6 `AccountDialog.vue` / `AccountViewerDialog.vue` — componentes standalone (NO usados por el `CrudPage` genérico de §1.2)
- `AccountDialog`: título dinámico Editar/Nueva, campos Nombre/Monto Inicial/Moneda/Tipo (con defaults Ahorro/Corriente/Inversión si no se inyectan por props). Precarga en modo edit, resetea en create/close.
- `AccountViewerDialog`: vista de detalle solo lectura — Descripción, Saldo actual (verde), Moneda por defecto, Fecha de apertura, Imagen (`q-img` o "-"), "Contabilizar en balance" (Sí/No). Acciones: Eliminar (con confirmación), Editar, Cerrar. Todos los campos con fallback "-".

---

## 2. Categorías (`/user/categories`) — compartida Pro/Lite

### 2.1 Página `categories/index.vue`
- Encabezado "Mis Categorías" + descripción.
- Envuelve `<CategoriesTree>` con un **diálogo propio simplificado** (⚠️ no usa `CategoryDialog.vue`, ver §2.3 — inconsistencia a resolver): solo Nombre, Fecha, toggle Activo.
- Crear: recibe `parent_id` del árbol → `POST /user/categories` → añade nodo al árbol.
- Editar: `GET /user/categories/:id` para traer datos completos antes de abrir el diálogo (fallback a mínimos si falla).
- `onSubmit`: valida `name` no vacío → `PATCH`/`POST` según corresponda (`parent_id==='root'` se convierte a `null`).
- Mover nodo: `PATCH /user/categories/:id/move`.
- Eliminar: confirmación explícita (*"¿Eliminar la categoría "X"? Esta acción no se puede deshacer."*) → `DELETE /user/categories/:id`.
- Notificaciones para todos los flujos.

### 2.2 `CategoriesTree.vue` — el árbol reutilizable (también se usa en Config, ver `PROMPT_REDISENO_HOME.md`/master list §7 para el contexto de Config)
- Botones (ocultos en `readonly`): Nueva categoría, Nueva carpeta, Eliminar categoría (si hay selección), Mover a raíz.
- Filtro: buscador por nombre + toggles Carpetas/Categorías + "Quitar filtros". Chips de filtros activos removibles.
- Soporta multi-columna (reparte nodos top-level en N columnas round-robin).
- **Badge "Cántaro"** por categoría con tooltip, si tiene jar asociado (`categoryJarMap`).
- Icono `folder` para carpetas, icono custom (`node.icon`) o `sell` por defecto para categorías.
- **Drag & drop**: mover dentro de carpeta/categoría/root — si el destino es una categoría, se **convierte automáticamente en carpeta** al recibir hijos; si el origen queda sin hijos y no es root, revierte a `category`. Bloquea mover dentro de sí mismo/descendiente, destino inválido. Nodo "Mover a raíz" aparece durante el drag.
- Selección: click selecciona (incluso en readonly); doble-click (si no readonly) emite `edit-category`.
- Vacío: "No hay categorías para mostrar".

### 2.3 `CategoryDialog.vue` — versión más completa, usada desde OTRO flujo (⚠️ inconsistencia con §2.1)
- Título + badge "Carpeta"/"Categoría".
- Nombre.
- **Tipo de transacción** (solo si no es carpeta): Gasto / Ingreso / Ambas (default "Ambas").
- Toggle "Incluir en balance" (deshabilitado si es carpeta).
- **Selector de icono**: avatar + botón "Catálogo" → diálogo con buscador y grid de ~30 iconos Material predefinidos (sell, attach_money, savings, shopping_cart, restaurant, home, school, flight, pets, medical_services, currency_bitcoin, etc.).
- Fecha, toggle Activo.
- **El `index.vue` de usuario (§2.1) NO usa este diálogo** — tiene el suyo propio, más simple (solo nombre/fecha/activo, sin tipo de transacción ni selector de icono). El rediseño debe decidir cuál es el diálogo canónico — recomendación: `CategoryDialog.vue` es el más completo, debería ser el único.

---

## 3. Impuestos (`/user/taxes`) — compartida, CRUD genérico simple

- **Filtro**: input de texto "Nombre".
- **Columnas**: ID, Nombre, Porcentaje, Fecha, Activo, Acciones.
- **Formulario**: Nombre, Porcentaje, Fecha, Activo (checkbox, default `true` en crear/`false` en editar — el `CrudPage` sobreescribe con el valor real de la fila al cargar, así que no es un bug práctico).
- ⚠️ **Sin confirmación antes de eliminar** — a diferencia de Categorías, que sí la tiene. `CrudPage.remove()` elimina directo con solo notificación post-hoc.
- No hay vinculación explícita de impuestos a categorías/cuentas visible en el frontend — es un catálogo plano.

---

## 4. Tabla de diferencias Pro vs Lite

| Aspecto | Pro | Lite |
|---|---|---|
| Cuentas | Módulo completo (§1) | **No existe** — billetera implícita, auto-asignada |
| Categorías | Igual, compartida | Igual, compartida — sin diferencias de código |
| Impuestos | Igual, compartida | Igual, compartida — sin diferencias de código |
| Selección de cuenta en formulario de transacción | Manual, con búsqueda | Auto-asignada (`is_default=true`), sin UI de selección |

---

## 5. `CrudPage.vue` — motor genérico compartido (Cuentas + Impuestos + 15 CRUDs de Admin)

Rediseñar este componente una sola vez impacta automáticamente a Cuentas, Impuestos y a 15 de los 18 CRUDs del panel Admin (ver `.owf/FEATURE_MASTER_LIST.md` §8).

- Tabla server-side (paginación: page/rowsPerPage/sortBy/descending/rowsNumber), orden por defecto por columna `date` o `id`.
- Manejo robusto de distintas formas de envelope de respuesta (`data`, `data.data`, `items`, `results`, `rows`, `records`, `transactions`, anidados).
- Diálogo único crear/editar reutilizando `forms_save`/`forms_update` del `dictionary`.
- Validación mínima genérica antes de guardar: si el dictionary incluye `name`/`amount`/`date`/`time` como vmodel y viene vacío, notifica "Faltan campos: ...".
- Columnas especiales soportadas: booleanas, `time` (12h AM/PM), `date` (localizado), `account.name` (fallback a nombres desde `payment_transactions`), many-to-many con badges "Owner", `tags` con chips coloreados.
- Sincroniza filtros/búsqueda con la URL (query params).
- Si el dictionary es de "transactions", escucha/emite `ow:transactions:changed`.
- Selects de filtro/formulario con búsqueda + debounce, opciones ordenadas alfabéticamente.
- **Elimina sin confirmación previa** (solo notificación post-hoc) — esto es lo que hace que Impuestos no confirme, y probablemente afecta también a varios CRUDs de Admin. Decisión de rediseño: ¿agregar confirmación al motor genérico (afecta a todos) o dejarlo así?

---

## 6. Validaciones y reglas a preservar

- Cuentas: ningún validación de formato de moneda/número más allá de los tipos de input HTML.
- Categorías: `name` no vacío (validado en `index.vue` antes de enviar).
- Drag&drop (Cuentas y Categorías): reglas anti-loop compartidas (no mover un nodo dentro de sí mismo o su descendiente), con notificación warning si se intenta.
- Impuestos: sin validaciones explícitas más allá de las genéricas de `CrudPage`.

---

## 7. Estados vacíos, loaders, mensajes

- `AccountsSidebarWidget`: `q-skeleton` mientras carga (si no colapsado).
- `AccountFilterWidget`: "No se encontrado cuentas" si el filtro no matchea; "Recalculando…" con spinner por cuenta durante la simulación.
- `CategoriesTree`: "No hay categorías para mostrar".
- Confirmaciones: solo Categorías tiene diálogo de confirmación antes de eliminar (`$q.dialog` Confirmar/Cancelar); Cuentas (CrudPage) y Taxes eliminan sin confirmación previa.
- Notificaciones consistentes vía `$q.notify`, tipos positive/negative/warning/info, en español.

---

## 8. Referencias de diseño ya existentes en `rediseno/`

- **No hay plantillas de ruta completa** para Cuentas ni Categorías ni Impuestos en `ui_kits/lite-desktop/templates/` (a diferencia de Home, Jars, Transacciones, Análisis, que sí las tienen) — solo existen como **organismos** dentro de otras rutas: `ui_kits/lite-desktop/organisms/AccountFilter.jsx`, `AccountsPanel.jsx`, `AddAccountModal.jsx`, `CategorySelector.jsx`.
- **Conclusión**: este es el primer módulo de los 4 ya cubiertos que **no tiene una plantilla de referencia visual propia en Claude Design** — el rediseño parte más de cero que en Cántaros/Transacciones/Análisis/Home, donde ya había JSX de referencia (aunque `unreviewed`). No hay entrada en `views-registry.json` para ninguno de los 3 sub-módulos de este documento.

---

## 9. Qué NO replicar / aclaraciones

- **No diseñar una versión Lite de Cuentas** salvo que sea una decisión de producto nueva y explícita — hoy es ausencia total, no una versión recortada (§1.1).
- **Diálogo de Categorías duplicado** (§2.1 vs §2.3): el rediseño debe unificar en uno solo — recomendación: `CategoryDialog.vue` (más completo) como único, delegando el `index.vue` de usuario a él.
- **"Recalcular saldo" simulado en `AccountFilterWidget.vue`** (timeout local, no golpea el API) vs. la versión real en `AccountsSidebarWidget.vue` (sí llama al backend) — no asumir que ambas hacen lo mismo; el rediseño debe decidir cuál comportamiento es el canónico y unificarlo.
- **Falta de confirmación al eliminar** en Cuentas/Impuestos (vía `CrudPage` genérico) — es consistente con el resto de CRUDs de Admin, pero inconsistente con Categorías. Decidir si se resuelve a nivel del motor genérico.
- No hay vinculación de impuestos a categorías o cuentas en el frontend actual — si el rediseño la introduce, es funcionalidad nueva.

---

## 10. Cómo proceder

1. Cuentas y Categorías comparten patrón visual (árbol + drag&drop) — conviene diseñar sus componentes de árbol con un lenguaje visual consistente entre sí.
2. Decidir primero la unificación del diálogo de Categorías (§9) y el comportamiento de "Recalcular saldo" (§9) — son decisiones de producto/ingeniería que cambian el alcance del diseño, no solo la estética.
3. Si se rediseña `CrudPage.vue`, coordinar con el rediseño de Admin (`.owf/FEATURE_MASTER_LIST.md` §8) ya que el impacto es compartido.
4. Usar `.owf/FEATURE_MASTER_LIST.md` sección 4 como referencia cruzada si aparecen dudas de alcance.
