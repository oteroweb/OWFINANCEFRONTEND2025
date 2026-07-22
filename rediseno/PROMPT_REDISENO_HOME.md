# Prompt de Rediseño — Home (Inicio)

<!-- Generado: 2026-07-20. Fuente: auditoría de código fuente (HomeView.vue, ProHomeView.vue, LiteHomeView.vue, AppShell.vue, componentes de navegación compartidos) + `.owf/FEATURE_MASTER_LIST.md` sección 1 + verificación de git log (última modificación relevante: afbb8bd, OWF-320, 2026-07-19). -->
<!-- Uso: pegar este documento completo como contexto al iniciar el rediseño de `/user/home` y del shell de navegación (`AppShell.vue`, compartido con el resto de la app). Mismo nivel de detalle que PROMPT_REDISENO_CANTAROS.md. -->

## Objetivo

Rediseñar la vista **Home** (`/user/home`) manteniendo el 100% de las funcionalidades reales listadas abajo. Es la vista de entrada de la app — la de mayor visibilidad y frecuencia de uso — y comparte layout (`AppShell.vue`) con el resto del sistema, así que su rediseño toca también sidebar/topbar/bottom-nav/menús globales.

**⚠️ Hallazgo estructural crítico — leer antes de tocar código**: `ProHomeView.vue` y `LiteHomeView.vue` son **monolíticos** (template y estilos 100% inline, 1608 y 1300 líneas respectivamente). **NO** importan los componentes `components/home/HomeHeroCard.vue`, `HomeJarsSection.vue`, `HomeTransactionsSection.vue` ni los 3 `HomePeriodSelector*.vue` — esos 6 archivos existen en el repo pero **no están en producción** (solo se usan en `home_components_showcase.vue`, una página de desarrollo). Del mismo modo, `AppShell.vue` **no usa** `ProSidebar.vue` ni `ProTopbar.vue` (tiene su propio sidebar/topbar inline), y `components/lite/LiteHeader.vue`/`LiteNavPill.vue`/`ExpandedMenu.vue` están huérfanos (reemplazados por `components/liquid/*`). Si vas a usar código existente como referencia visual, básate en `ProHomeView.vue`, `LiteHomeView.vue`, `AppShell.vue` y `components/liquid/*` — los demás documentan una intención de diseño alternativa nunca desplegada, útil solo como inspiración, no como estado actual.

---

## 1. Mecanismo del toggle Pro/Lite (aplica a Home y a todo el shell)

`HomeView.vue` (16 líneas) es un simple switch: `isPro = (auth.settings?.layout_mode ?? auth.user?.layout_mode) === 'pro'` → renderiza `<ProHomeView v-if="isPro">` o `<LiteHomeView v-else>`. `AppShell.vue` usa el mismo patrón para decidir sidebar/topbar Pro vs. header/bottom-nav Lite. No hay rutas separadas — un único router con layout condicional (ver `PROMPT_REDISENO_CENTRAL.md` §1 para la regla completa a nivel de sistema).

---

## 2. Vista Pro (`ProHomeView.vue`)

### 2.1 Saludo y acciones superiores
"Hola, {primer nombre}" + botón notificaciones → `/user/notifications`.

### 2.2 Balance hero (solo mobile, `.mobile-balance-card`, oculto en desktop vía CSS)
- Label "Disponible · {currencyCode}" + badge **"PRO"**.
- Monto: `balanceSummary.total_global_balance` (fuente: `GET /accounts/summary/global-balance`).
- 3 stats: Ingresos (`+monthlyIncome`), Gastos (`−monthlyExpense`), Neto (income−expense) — todos ocultables con el toggle global de privacidad (`ui.hideValues`).

### 2.3 KPI strip (grid 4 columnas desktop, 2 en mobile/tablet, 2 forzado también en ≤640px)
1. **Disponible** — `balanceSummary.total_global_balance`, delta MoM (variación % del neto mes actual vs. mes anterior).
2. **Ingresos · mes** — suma de transacciones tipo ingreso del mes, delta = % variación vs. mes anterior.
3. **Gastos · mes** — `-monthlyExpense`, delta con **color invertido** (bajar el gasto = verde).
4. **Tasa de ahorro** — `((ingreso-gasto)/ingreso)*100` clamp 0-100, texto en vez de monto, **"Meta: 40%" fija y hardcodeada** — es el único badge de meta fija de todo el sistema, color verde si ≥40%, rojo si menor.
- Cada card: icono con color/soft-color, delta como pill de color condicional.

### 2.4 Timestamp "Actualizado {hora}"
Hora local seteada tras cargar el resumen del mes.

### 2.5 Fila media (2 columnas desktop, 1 en mobile)
- **Gastos por categoría**: top 5 categorías del mes (agrupadas por `transaction_type.name`), barra proporcional al máximo (mínimo 5% de ancho), botón "Ver análisis" → `/user/expense-analysis`.
- **Cántaros**: lista de jars con barra de progreso + % + balance (cálculo por request a `/jars/{id}/balance`), botón "Ver todos" → `/user/jars`.

### 2.6 Movimientos recientes (dense list, hasta 6, **excluye transferencias**)
- Clasificación robusta (`classifyTx`): usa `transaction_type_id===4` o texto "transfer"/"traspaso" para detectar transferencias; "income"/"ingreso" vs "expense"/"gasto"; fallback por signo.
- Icono según tipo, nombre, fecha relativa (Hoy/Ayer/Hace N días/fecha corta), tag de categoría (oculto en mobile ≤640px), monto con signo/color.
- Click en fila → `TxDetailModal` (edición inline, `layout-mode="pro"`).
- Botón "Ver todos" → `/user/transactions`.

### 2.7 Widget de tasas de cambio
`ExchangeRatesTable` embebido tal cual (tabla editable BCV oficial vs. tasa actual — ver `PROMPT_REDISENO_ANALISIS.md` §5 para el detalle completo del componente, ya que este es uno de los 2 únicos lugares reales donde vive en producción).

### 2.8 Sueños (preview, hasta 3, ordenados por progreso ascendente)
Loading skeleton, estado vacío ("Sin sueños registrados"), cards con nombre, % progreso (badge morado), barra gradiente violeta→rosa, montos actual/objetivo. Botón "Ver todos" → `/user/dreams`.

### 2.9 Strip "Asesor Financiero IA"
Icono con gradiente violeta→cyan, texto fijo `aiHint` = *"Tu tasa de ahorro es saludable. Revisa los movimientos recientes para optimizar."* — **hardcodeado, no dinámico pese al nombre**. Click → `/user/asesor`.

### 2.10 Panel de Cuentas (exclusivo Pro, feature gateada — no existe en Lite)
- Toggle flotante (`ap-toggle`, icono `account_balance_wallet`, fixed top-right) — **oculto en mobile ≤768px** (sin spec mobile aún, gap documentado OWF-173-GAP2).
- Panel deslizante lateral (280px desktop, overlay fullscreen en mobile ≤1024px con backdrop), 2 tabs internos:
  - **Cuentas**: "Patrimonio neto" (suma de balances de `/accounts`), lista con badge de 3 letras, nombre, tipo, balance, moneda. **(OWF-320, 2026-07-19)**: cada cuenta en moneda distinta a USD ahora muestra su **equivalente en USD** (`≈ $X USD`, texto secundario debajo del monto+código), calculado con la tasa paralela del usuario (`useUserRates`, misma fuente que el selector de `SmartTransactionModal`); se oculta con `hideValues`, no aparece si la cuenta ya es USD o no hay tasa registrada. Botón "Ver / agregar cuentas" → `/user/accounts`.
  - **Deudas**: "Deuda total" (suma de `/debts`), lista con icono tarjeta, nombre, estado (Atrasada/rojo, Por vencer/amarillo, Al día/verde), balance; estado vacío "Sin deudas registradas".

### 2.11 Breakpoints notables
- 1024px: KPI grid a 2 columnas, fila media a 1 columna, accounts panel se vuelve overlay fixed con backdrop.
- 768px: aparece `.mobile-balance-card`, toggle de accounts panel se oculta.
- 640px: KPI grid forzado a 2 columnas compactas, tx-dense oculta el tag de categoría.
- 480px: accounts panel pasa a 100vw.

---

## 3. Vista Lite (`LiteHomeView.vue`)

### 3.1 Saludo y acciones
"Hola, {primer nombre}" + botón ocultar/mostrar saldos (**propio de Lite** — en Pro este control vive en el topbar desktop o en `LiteHeaderDesktop` en mobile, no en el body de la página) + botón notificaciones.

### 3.2 Hero de balance (card única, siempre visible — no solo mobile como en Pro)
- Label "Disponible · {currencySymbol}" (símbolo derivado: VES→"Bs", EUR→"€", COP/otro→"$" — no siempre el código ISO).
- Monto grande.
- **Delta MoM como pill inline junto al monto** (más prominente que en Pro, donde el delta solo vive dentro del KPI "Disponible"), con icono de flecha y color condicional.
- "Al {fecha corta de hoy}".
- Botón "Agregar" (pill con +) — emite `quick-add` (delega a `AppShell`/`QuickActionSheet`).
- Timestamp "Actualizado · {hora}".
- 3 KPIs inline: Ingresos · este mes, Gastos · este mes (rojo), Neto · este mes (verde/rojo).
- Botón "Configurar ingreso mensual" (icono settings) → dialog simple, `PUT /user`.

### 3.3 Sección "Ingreso esperado" (exclusiva Lite, no existe en Pro)
- Card con label "Mensual · {symbol}" y monto (`authStore.user.monthly_income`).
- Si es 0: mensaje "Configura tu ingreso para ver proyecciones en cántaros".
- Edición inline (lápiz → input, check/close) → `PUT /user/profile`. ⚠️ **Dato duplicado**: el mismo campo se edita también desde el dialog "Configurar ingreso mensual" de §3.2, pero por un endpoint distinto (`PUT /user`) — mismo dato, dos caminos.

### 3.4 Cántaros (preview, hasta 4 activos)
Loading skeleton, vacío ("No tienes cántaros activos" + botón "Crear cántaro"). **Doble layout**: grid desktop, row horizontal-scroll en mobile (chips). Muestra dot de color, nombre, balance, barra de progreso — **sin % numérico** (a diferencia de Pro, que sí lo muestra). Botón "Ver todos" → `/user/jars`.

### 3.5 Sueños (preview, hasta 3)
Mismo patrón visual que Pro, mismas clases CSS. Orden: **Sueños antes que Deudas** en el feed (decisión de spec explícita en el código). Botón "Crear sueño" en el estado vacío — Pro no tiene este CTA.

### 3.6 Deudas (preview, hasta 3) — **en el feed principal**, a diferencia de Pro que solo las muestra dentro del Accounts Panel lateral
Icono coloreado por proveedor (paleta propia: `--cashea`, `--card`, `--loan`, `--personal`), nombre, proveedor, balance (rojo), badge de estado — **4 estados** (Al día/Por vencer/Atrasada/Pagada) vs. los 3 que distingue Pro. Botón "Agregar deuda" en vacío.

### 3.7 Movimientos recientes — **no excluye transferencias**
Límite dinámico: 4 filas en mobile, 5 en desktop (spec explícita en comentario). Clasificación **más simple que Pro**: solo por signo del monto, sin la detección robusta de `classifyTx`. Click → `TxDetailModal` (`layout-mode="lite"`). Botón "Ver todos" → `/user/transactions`.

### 3.8 Efecto lateral notable
Al cargar cántaros, Lite publica `ui.setJarStatus({totalAllocated, totalAvailable, availabilityPercent, usedPercent, jarCount})` al store global de UI — dato consumible por otros componentes. **Pro no hace esto.**

---

## 4. Tabla de diferencias Pro vs Lite (renglón por renglón)

| Aspecto | Pro | Lite |
|---|---|---|
| Balance hero | Solo mobile; en desktop vive disuelto en el KPI strip | Card hero siempre visible, delta MoM prominente junto al monto |
| Ocultar/mostrar saldos | Vive en topbar (desktop) / `LiteHeaderDesktop` (mobile) | Botón propio en la cabecera de esta vista |
| KPIs | 4 en grid (Disponible, Ingresos, Gastos, Tasa de ahorro con meta 40%) | 3 inline dentro del hero (Ingresos, Gastos, Neto) — sin tasa de ahorro |
| Ingreso esperado | No existe sección dedicada | Sección propia con edición inline + alerta si no configurado |
| Cántaros | % numérico + barra, card compacta de lista | Solo barra visual, sin % |
| Sueños | Mismo componente, sin CTA en vacío | Con CTA "Crear sueño" en vacío |
| Deudas | Solo dentro del Accounts Panel lateral | Sección propia en el feed principal, entre Sueños y Recientes |
| Cuentas / patrimonio neto | Panel lateral deslizable, **exclusivo Pro** (feature gateada) | No existe |
| Gastos por categoría | Sección propia con barras | No existe |
| Transacciones recientes | Hasta 6, excluye transferencias, tag de categoría visible | Hasta 4/5 (según viewport), incluye transferencias, clasificación más simple |
| Exchange Rates widget | Sí | No |
| Asesor IA | Strip destacado con hint fijo | No aparece en el home (solo accesible por nav) |
| Badge "PRO" | Sí, en el balance hero mobile | No |
| Sidebar/topbar | Sidebar fijo desktop + topbar con más acciones (admin, accounts panel toggle) | Header simple + bottom nav flotante |

**Sobre feature-gating**: no hay lógica de permisos/planes de pago en el código — `layout_mode` es una preferencia libre de usuario, no un plan pagado. El único badge "PRO" es puramente visual/label; el único chequeo de rol real es `auth.role === 'admin'` para el botón de panel de administración en el topbar.

---

## 5. Navegación compartida (`AppShell.vue` + componentes `liquid/*`)

### 5.1 Sidebar Pro — 9 items (`NAV_ITEMS`)
Inicio (`/user/home`) · Transacciones (`/user/transactions`) · Análisis (`/user/expense-analysis`) · Cántaros (`/user/jars`) · Perfil financiero (`/user/financial-profile`) · Sueños (`/user/dreams`) · Deudas (`/user/debts`) · Asesor IA (`/user/asesor`) · Configuración (`/user/config`). `currentTab` se resalta por coincidencia de substring en la ruta activa. Estado `navOpen` persistido en `localStorage['owf-nav-open']`.

### 5.2 Topbar Pro (desktop)
Toggle sidebar · título dinámico de página · botón "Agregar" (abre `SmartTransactionModal` directo en desktop, `QuickActionSheet` en mobile) · ocultar/mostrar saldos · modo oscuro/claro · notificaciones · panel admin (solo si `auth.role==='admin'`) · toggle panel de cuentas (evento `owf:accounts-panel-toggle`) · avatar (abre menú expandido).

### 5.3 Bottom nav
- **Lite** (`LiteFloatingBottomNav`, pill flotante): Home / Movs / Análisis / Cántaros / Sueños / Deudas / Ajustes + FAB central "+".
- **Pro-mobile** (`BottomNavMobile`, accent cyan): default **solo** Home / Transacciones / Cántaros / Sueños / Configuración — **no incluye Análisis ni Deudas** por defecto, a diferencia del pill de Lite. Único componente de nav con soporte i18n explícito.

### 5.4 `LiteHeaderDesktop.vue` (usado en Lite siempre + Pro mobile)
Avatar-botón (iniciales) → menú expandido · saludo dinámico por hora ("Buenos días/tardes/noches,") · chip de moneda · ocultar/mostrar saldos · modo oscuro/claro · notificaciones (badge punto rojo si hay pendientes) · hamburguesa → menú.

### 5.5 `ExpandedNavigationMenuLight.vue` (menú de cuenta, overlay compartido Pro+Lite)
Grupo Cuenta: Perfil, Perfil financiero, Cuentas, "Exportar datos" (**placeholder, ruta null, no implementado**). Grupo Asistente: Asesor IA. Grupo Preferencias: Configuración, "Privacidad" (**placeholder**). Cerrar sesión (destructivo, rojo). Cierra con click-outside o Escape.

### 5.6 `QuickActionSheet.vue` (bottom sheet de acción rápida, solo mobile)
Grid de 7 acciones: Gasto / Ingreso / Transferir / Voz / Escanear / Auto IA / Personalizado (**placeholder**, "Esta opción personalizada estará disponible muy pronto"). Botón grande "Hablar con Asesor IA" → `/user/asesor`. Overlay de navegación inferior con 4 tabs alrededor de un botón "X" central circular.

### 5.7 `ImpersonationBanner.vue` + `VersionBadge.vue`
Banner rojo fijo top si `auth.impersonating` (nombre + botón "Volver al Admin"). Badge de versión (`v{package.json}`) fijo top-right, no interactivo.

---

## 6. Fórmulas y cálculos exactos (no inventar otros al rediseñar)

- **Delta MoM (KPIs Pro / hero Lite)**: variación % del valor (neto, ingreso o gasto) del mes actual vs. el mismo cálculo del mes anterior.
- **Tasa de ahorro (Pro, único KPI con meta fija)**: `((ingreso-gasto)/ingreso)*100`, clamp 0-100, meta de referencia **40% hardcodeada**.
- **Clasificación de transacción — Pro (`classifyTx`)**: `transaction_type_id===4` o texto "transfer"/"traspaso" → transferencia (excluida del feed); si no, "income"/"ingreso" vs "expense"/"gasto" por texto; fallback por signo del monto.
- **Clasificación de transacción — Lite**: **solo por signo del monto** — no distingue transferencias, no las excluye del feed (inconsistencia conocida con Pro, no corregir "de oficio" sin decisión de producto — ver `PROMPT_REDISENO_TRANSACCIONES.md` §6.5, es el mismo hallazgo).
- **Progreso de cántaro (Home)**: `(assigned-balance)/assigned*100`, vía request a `/jars/{id}/balance` por cada jar mostrado.
- **Equivalente USD de cuenta (Panel de Cuentas Pro, OWF-320)**: `balance / rate` donde `rate` es la tasa paralela guardada por el usuario para esa moneda (`useUserRates`); `null` si la cuenta ya es USD o no hay tasa registrada.

---

## 7. Estados vacíos, loaders, mensajes

- Sueños: skeleton de carga, vacío "Sin sueños registrados" (Pro) / con CTA "Crear sueño" (Lite).
- Cántaros (Lite): skeleton, vacío "No tienes cántaros activos" + botón "Crear cántaro".
- Deudas (Lite): vacío "Sin deudas registradas" (mismo texto que en el panel Pro) + botón "Agregar deuda".
- Notificaciones: badge punto rojo en `LiteHeaderDesktop` si `notificationCount > 0`.
- Ocultar valores (`ui.hideValues`): reemplaza montos por `••••••`/`••%` en absolutamente todos los lugares con dinero de esta vista, en ambos modos.

---

## 8. Referencias de diseño ya existentes en `rediseno/` (para comparar fidelidad, no para copiar ciegamente)

- `ui_kits/lite-desktop/templates/HomeRoute.jsx` (Lite) y `ProHomeRoute.jsx` (Pro) — plantillas de referencia visual desktop.
- `ui_kits/mobile/screens/HomeScreenLite.jsx` y `HomeScreenPro.jsx` — referencia mobile.
- `views-registry.json`: `home-lite` y `home-pro` están en estado **`unreviewed`** — nadie ha comparado todavía estas plantillas contra el Vue real descrito en este documento. Antes de asumir que el JSX existente refleja el comportamiento actual, compáralo contra las secciones 2 y 3 de este prompt — es probable que haya divergido (mismo patrón que ya se encontró y adjudicó en Transacciones, D-001/D-002 — ver `DECISIONS.md`).
- Los 6 componentes huérfanos de `components/home/*` (sección "Hallazgo estructural crítico" arriba) documentan una intención de diseño con mecánicas distintas a las reales — ej. `HomeJarsSection.vue` calcula una "Disponibilidad: {monto} · {%}" que no existe en `ProHomeView.vue`/`LiteHomeView.vue` reales, y usa anillos de progreso SVG circulares en vez de barras lineales. Puede ser una dirección válida a explorar, pero **no es el estado actual** — no lo confundas con la vista en producción.

---

## 9. Qué NO replicar / aclaraciones

- No asumas que `components/home/*`, `ProSidebar.vue`, `ProTopbar.vue`, `components/lite/LiteHeader.vue`/`LiteNavPill.vue`/`ExpandedMenu.vue` reflejan producción — son huérfanos (sección "Hallazgo estructural crítico").
- El hint del strip "Asesor Financiero IA" en Pro es **texto fijo hardcodeado**, no una recomendación real generada — si el rediseño quiere que sea dinámico, es una feature nueva, no una migración.
- El dato "ingreso mensual esperado" en Lite se edita por 2 caminos distintos (`PUT /user` desde el dialog del hero, `PUT /user/profile` desde la sección dedicada) — decidir si el rediseño unifica esto en un solo lugar/endpoint.
- No repliques la inconsistencia de clasificación de transferencias entre Pro y Lite salvo que el rediseño la resuelva explícitamente (afecta también a Transacciones, ver `PROMPT_REDISENO_TRANSACCIONES.md`).
- El panel de cuentas Pro está oculto en mobile ≤768px por falta de spec (gap conocido, OWF-173-GAP2) — si el rediseño define una versión mobile, esto deja de ser un gap y pasa a ser la spec.

---

## 10. Cómo proceder

1. Diseñar las 2 variantes reales (Pro, Lite) del Home — no hay modo Legacy en esta vista.
2. Diseñar junto con el shell de navegación (`AppShell.vue` + `liquid/*`) ya que Home es la vista donde más se percibe — sidebar Pro, bottom nav Lite/Pro-mobile, menú expandido, quick action sheet.
3. Contrastar contra `HomeRoute.jsx`/`ProHomeRoute.jsx` (`unreviewed` en el registry) — si hay divergencias, registrarlas en `DECISIONS.md` siguiendo el proceso de `PROMPT_REDISENO_CENTRAL.md` §2.3, no resolverlas en silencio.
4. Usar `.owf/FEATURE_MASTER_LIST.md` sección 1 como referencia cruzada si aparecen dudas de alcance.
