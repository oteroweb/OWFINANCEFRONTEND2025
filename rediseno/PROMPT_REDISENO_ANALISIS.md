# Prompt de Rediseño — Análisis de Gastos + Tasas de Cambio

<!-- Generado: 2026-07-20. Fuente: auditoría de código fuente (expense-analysis/index.vue, ExpenseDistributionChart.vue, ExchangeRatesTable.vue, ExchangeRatesWidget.vue, MonthlyIncomePanel.vue, simple-css-chart.vue) + verificación cruzada de imports reales en todo src/ + `.owf/FEATURE_MASTER_LIST.md` sección 6. -->
<!-- Uso: pegar este documento completo como contexto al iniciar el rediseño de `/user/expense-analysis`. Mismo nivel de detalle que PROMPT_REDISENO_CANTAROS.md. -->

## Objetivo

Rediseñar la vista **Análisis de Gastos** (`/user/expense-analysis`) manteniendo el 100% de las funcionalidades reales listadas abajo. Es el módulo de reportes: distribución de gasto por cántaro/categoría/cuenta/tipo, comparación asignado-vs-gastado, e insights en lenguaje natural. **Corrección importante de alcance antes de empezar**: a diferencia de lo que sugiere agrupar "Análisis + Tasas de Cambio" en un solo módulo, **la edición de tasas de cambio NO vive dentro de esta vista** — es un hallazgo confirmado por verificación cruzada de imports (ver sección 5). Esta vista solo **consume** tasas para convertir montos a la moneda base del usuario; no las muestra ni las edita.

---

## 1. Confirmación de las 2 specs mencionadas en el código

Ambas siguen vivas en producción — no hay una legacy a retirar entre las dos:

- **`ProAnalisisRoute`** ("Navegador financiero") — comentario literal en `expense-analysis/index.vue`: `<!-- Pro heading (spec ProAnalisisRoute: "Navegador financiero") -->`. Renderiza cuando `activeLayoutMode === 'pro'`.
- **`AnalisisRoute`** ("En qué se fue") — comentario literal: `<!-- Lite eyebrow (spec AnalisisRoute: 'En qué se fue' uppercase label above hero) -->`. Renderiza cuando `activeLayoutMode === 'lite'`.
- Existe una **tercera variante real en producción, `legacy`** (`activeLayoutMode === 'legacy'`, mismo mecanismo de 3 modos que en Transacciones) que reutiliza el layout de 2 columnas de Lite pero con textos "expandidos" y todos los grupos abiertos por defecto. **Esta sí es la que hay que decidir si se retira** — mismo dilema abierto que en `PROMPT_REDISENO_TRANSACCIONES.md` §2/§5 (no es específico de Análisis, es la decisión transversal del modo Legacy).

---

## 2. Vista Pro (`ProAnalisisRoute`) — layout de 3 columnas

### 2.1 Header
Título "Navegador financiero" + eyebrow "Analítica de gastos" + `PeriodNavigator` (vía `periodStore` externo, no un selector propio de esta página).

### 2.2 Rail izquierdo — Filtros (panel sticky, siempre visible, sin colapsar)
- **Agrupación principal** (`groupMode`, select): Cántaro, Categoría, Cuenta, Tipo.
- **Buscar** (input con lupa, clearable): busca en concepto, categoría o cuenta.
- **Filtrar por cántaro / categoría / cuenta / tipo** (select clearable c/u, opción "Todos").
- Sin chips de "filtros activos" (a diferencia de Lite) — solo botón "Limpiar filtros".

### 2.3 Columna central
- **Distribución por cántaro** (donut, `ExpenseDistributionChart.vue`, vía ECharts): subtítulo "Gastos · {{ periodStore.label }}". Datos = `assignedExpected` por cántaro (**lo asignado/esperado, no el gasto real** — ojo, es una distinción sutil que hay que preservar). Leyenda scrolleable clickeable: click filtra por ese cántaro (`selectedJarId`).
- **Top cántaros (lista con barras)**: top 6, clickeable para filtrar (toggle on/off), barra proporcional al máximo.
- **Jar strip** (tarjetas horizontales con barra de progreso): visible si hay datos, nombre + monto gastado + barra relativa al máximo, clickeable.
- **Insight de sobregasto** (tarjeta roja, solo si algún cántaro excede su presupuesto): *"{cántaro} superó su presupuesto: {gastado} / {asignado} ({pct}%)"*.

### 2.4 Columna derecha
- **Asignado vs gastado (barras horizontales)**: por cántaro, `pct` (cap visual 200%), marca `overspent` en rojo si gastado > asignado.
- **Métricas (4 tarjetas)**: Transacciones visibles, Gastos, Ingresos, Balance.

### 2.5 Detalle agrupado (debajo, jerárquico: cántaro → categoría → transacciones)
- Header de grupo muestra **Gastos + Ingresos + Balance**.
- Se abren automáticamente los **2 primeros** grupos; dentro, solo el primer subgrupo.
- Fila de transacción: icono, nombre + fecha, monto — **sin** la línea de "tasa original" (esa solo aparece en Lite/Legacy, ver 3.5).
- Click en fila → `ui.openEditTransactionDialog(id)`.

### 2.6 Hero narrativo
*"En **{periodStore.label}** registraste **{n} movimiento(s)**. Gastaste {monto} e ingresaste {monto}."* — sin comparación mes-a-mes (a diferencia de Lite).

---

## 3. Vista Lite (`AnalisisRoute`) — layout de 2 columnas (colapsa a 1 en mobile)

### 3.1 Header
Eyebrow "En qué se fue" (sin H1 grande como en Pro).

### 3.2 Filtros
Mismos filtros que Pro pero dentro de un `q-expansion-item` colapsable, **con chips de "filtros activos" removibles individualmente + contador "{n} activos"** (Pro no tiene esto). Botón "Limpiar filtros".

### 3.3 Card "¿En qué se fue?" — donut CSS puro
**No usa ECharts** — es un `conic-gradient` CSS directo, componente distinto al `ExpenseDistributionChart.vue` de Pro. Subtítulo: "Tu gasto del mes, por cántaro." Mismos datos (top 8 cántaros por gasto, % del total, color propio).

### 3.4 Sección "Tu presupuesto" — budget pulse
Círculo `conic-gradient` de progreso, exclusivo de Lite: `budgetPulsePct = budgetTotalSpent / budgetTotalAssigned * 100`. Texto: *"Cómo vas contra lo que asignaste este mes."* + *"Vas al {pct}% de lo asignado ({gastado} de {asignado})."*

### 3.5 Jar strip
Igual que en Pro (mismo componente compartido).

### 3.6 Insight violeta (`AnInsight`, exclusivo Lite)
Card violeta, solo si hay ≥1 segmento en el donut: *"El **{n}%** de tu gasto fue en **{cántaro1}** y **{cántaro2}**..."*

### 3.7 Métricas (3 tarjetas, no 4)
Transacciones visibles, Balance, Filtros activos — **sin** Gastos/Ingresos separados (Pro sí los separa).

### 3.8 Hero narrativo
*"Tienes **{n} movimientos**. Gastaste {monto}"* + chip de variación MoM (*"{n}% menos/más que el mes anterior"*, verde/rojo); si no hay dato del mes previo, cae a "Balance positivo"/"Balance negativo".

### 3.9 Detalle agrupado
Header de grupo muestra **solo Balance** (Pro muestra Gastos+Ingresos+Balance). Se abre automáticamente **solo el primer** grupo. Fila de transacción: **sí incluye la línea de "tasa original"** (`originalLabel`/`rateLabel`, ej. "tasa 45.20" o "tasas 45.20 / 46.10" si hubo pagos con tasas distintas — extraído de `payment_transactions`).

---

## 4. Vista Legacy — reutiliza el layout de Lite con diferencias

- Header de grupo: **Gastos+Ingresos+Balance** (como Pro, no como Lite).
- Todos los grupos y subgrupos **se abren automáticamente** (a diferencia de Lite que solo abre el primero, y de Pro que abre los 2 primeros).
- Sí muestra la línea de "tasa original" por transacción (comparte bloque con Lite).
- Sin budget pulse ni insight violeta (esos son exclusivos de Lite real).

---

## 5. Tasas de Cambio — corrección de alcance (leer antes de diseñar nada de esto en esta vista)

**Hallazgo confirmado por grep de imports reales en todo `src/`**: ni `ExchangeRatesTable.vue` ni `ExchangeRatesWidget.vue` se usan dentro de `expense-analysis/index.vue`. Su alcance real es:

- **`ExchangeRatesTable.vue`** — usado en **`ProHomeView.vue`** (Home Pro, widget embebido) y en **`config/index.vue`** (tab Finanzas de Configuración, Pro). Tabla editable: columnas "Oficial (BCV)" (`official_rate`) y "Tasa actual" (`current_rate`), 5 monedas hardcodeadas (EUR, VES, COP, CLP, PEN — USD implícito como base "1 $ ="). Ambas columnas editables (`@change` → `store.onEdit(code, column, value)`, valida `val > 0`). Badge de delta % entre oficial y actual. **Sin historial temporal** — solo snapshot instantáneo.
- **`ExchangeRatesWidget.vue`** — ⚠️ **componente huérfano**: el archivo existe (input único "1 USD =" por moneda, PUT directo on-blur a `/user_currencies/{id}`, error silencioso) pero **no está importado/renderizado en ningún lugar de la app**. Las únicas 2 menciones a "ExchangeRatesWidget" en todo `src/` son comentarios y nombres de variables internas de `transactions/index.vue` (una UI de edición de tasas construida ad-hoc ahí, que **no usa el archivo real** del componente) — no confundir esa UI inline con el componente `.vue` huérfano.
- **Conclusión para el rediseño**: si el objetivo es rediseñar "dónde el usuario ve/edita tasas de cambio", los lugares reales son **Home Pro** y **Config (tab Finanzas, Pro)** — no esta vista. Si el producto quiere que Análisis también muestre/edite tasas, es una **funcionalidad nueva**, no una migración. Recomendación: si se rediseña este módulo junto con tasas, tratar "Tasas de Cambio" como su propia pieza reutilizable (un solo componente canónico) e insertarla donde el producto decida — no reconstruir el componente huérfano `ExchangeRatesWidget.vue` tal cual, ni duplicar la UI inline de `transactions/index.vue`.

---

## 6. Tabla de diferencias Pro vs Lite vs Legacy (renglón por renglón)

| Aspecto | Pro | Lite | Legacy |
|---|---|---|---|
| Encabezado | "Navegador financiero" + eyebrow | Eyebrow "En qué se fue", sin H1 | Bloque de Lite |
| Layout | 3 columnas (rail 280px + centro + 340px) | 2 columnas (colapsa a 1) | 2 columnas, 340px |
| Donut | ECharts, dentro de panel central, leyenda clickeable filtra | CSS puro (`conic-gradient`), card independiente, sin filtro por click | Comparte bloque con Lite |
| Budget pulse (%) | No | Sí | No |
| Insight violeta (AnInsight) | No | Sí | No |
| Top cántaros / Asignado vs gastado / Insight de sobregasto | Sí (exclusivo Pro) | No | No |
| Filtros | Panel sticky siempre visible, sin chips | `q-expansion-item` colapsable + chips removibles + contador | Panel sticky ancho |
| Agrupar por "cántaro" en el selector | Disponible | Oculto del selector | Disponible |
| Métricas | 4 tarjetas (Trans., Gastos, Ingresos, Balance) | 3 tarjetas (Trans., Balance, Filtros activos) | Como Lite (4) |
| Header de cada grupo del detalle | Gastos+Ingresos+Balance | Solo Balance | Gastos+Ingresos+Balance |
| Línea "tasa original" por transacción | No se muestra | Sí | Sí (comparte bloque con Lite) |
| Grupos abiertos por defecto | 2 primeros | Solo el primero | Todos |
| Hero narrativo | Sin comparación MoM | Con delta % vs mes anterior | Comparte con Lite |

---

## 7. Fórmulas y cálculos exactos (no inventar otros al rediseñar)

- **Donut (ambos modos)**: valor por cántaro = `assignedExpected` (lo asignado/esperado del periodo), **no** el gasto real ejecutado.
- **Budget pulse (Lite)**: `budgetPulsePct = budgetTotalSpent / budgetTotalAssigned * 100`.
- **Asignado vs gastado — overspent (Pro)**: `pct = gastado / asignado * 100` (cap visual 200% en la barra), `overspent = gastado > asignado`.
- **Delta MoM (hero Lite)**: variación % de gasto del mes actual vs. mes anterior (`loadPrevMonthGastos()`, solo se ejecuta si `isLiteLayout`).
- **Filas excluidas del cálculo**: `safeRows` en `ExpenseDistributionChart.vue` excluye cántaros con `assignedExpected===0 && spent===0 && balance===0` (no ensucian el gráfico con ceros).
- **Conversión de moneda**: `useUserRates()` → `convertUsdToBase(amountUsd)` usando `currentRates` (tasa paralela del usuario), no la tasa oficial BCV, para mostrar montos en la moneda base configurada (`baseCurrencyCode`, default `'USD'`).

---

## 8. Filtros — comportamiento común a los 3 modos

- `groupMode`: jar (oculto en Lite) / category / account / type.
- `search`: busca en concepto, categoría o cuenta.
- Selects clearable de cántaro/categoría/cuenta/tipo, opción "Todos".
- Deep-link `route.query.jar` preselecciona cántaro al entrar desde otra vista.
- El periodo **no** es un selector propio de esta página — depende de `periodStore` externo; `watch(() => periodStore.signature, ...)` recarga los datos al cambiar.

---

## 9. Estados vacíos, loaders, mensajes

- **Loader**: `q-spinner` primary 40px mientras `loading`.
- **Vacío (idéntico en los 3 modos)**: ícono `insights` gris + "No hay movimientos para mostrar" / "Ajusta filtros o cambia el periodo actual."
- **Ocultar valores** (`ui.hideValues`, store global): oculta montos como `••••••`/`••••`/`••` en absolutamente todos los lugares con dinero de esta vista.
- Acciones disponibles siempre: "Nueva transacción" (`ui.openSmartModal('write','expense')`), "Recargar" (ícono refresh, `loadData()`).

---

## 10. Qué NO replicar / aclaraciones antes de diseñar

- **No fusionar "Tasas de Cambio" dentro de esta vista sin decidirlo como feature nueva** — ver sección 5, es el hallazgo más importante de este documento.
- **`components/ExchangeRatesWidget.vue` es huérfano** — no reconstruirlo como si fuera parte del flujo actual; si se rediseña la edición de tasas, hacerlo sobre `ExchangeRatesTable.vue` (el que sí está vivo, en Home Pro y Config).
- **`components/ui/simple-css-chart.vue`** — micro-componente de barras CSS genérico, **no específico de este módulo** (no confundirlo con el donut de Lite, que es un `conic-gradient` inline distinto). Tiene un bug menor: el tooltip formatea montos hardcodeado a `en-US`/`USD` sin importar la moneda real del usuario — no replicar ese hardcode.
- **`components/MonthlyIncomePanel.vue`** (usado en Cántaros, no en esta vista, pero comparte convención de ingreso esperado/real con Análisis) tiene `console.log` de debug olvidados en el código — si se reutiliza lógica de ahí, limpiarlos.
- **Decisión transversal pendiente**: destino del modo Legacy (§1) — no es específica de Análisis, es la misma que en Transacciones.
- El donut usa `assignedExpected`, no gasto real — es fácil equivocarse al rediseñar y graficar el gasto ejecutado por error; preservar la métrica original salvo que el producto pida cambiarla explícitamente.

---

## 11. Cómo proceder

1. Confirmar con producto si el rediseño de tasas de cambio se hace junto con Análisis (como funcionalidad nueva) o se deja fuera de alcance (manteniéndolas donde están hoy: Home Pro + Config).
2. Diseñar las 2 variantes reales (Pro, Lite) — Legacy solo si se confirma que sigue vivo (misma decisión pendiente que en Transacciones).
3. El donut, el budget pulse, y el insight violeta son piezas visuales distintas por modo — no intentar unificarlas en un solo componente parametrizado a menos que el rediseño decida cambiar la mecánica (eso requeriría un asiento nuevo en `DECISIONS.md`, ver `PROMPT_REDISENO_CENTRAL.md` §2.3).
4. Usar `.owf/FEATURE_MASTER_LIST.md` sección 6 como referencia cruzada si surgen dudas de alcance.
