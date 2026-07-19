# Prompt de Rediseño — Cántaros (Jars)

<!-- Generado: 2026-07-19. Fuente: auditoría de código fuente (jars/index.vue, LiteJarsView.vue, JarCard.vue, AdjustmentModal.vue, etc.) + captura de pantalla real de producción (/app/user/jars). -->
<!-- Uso: pegar este documento completo como contexto al iniciar el rediseño de la vista Cántaros. Cubre Pro y Lite. No omitir ninguna sección — cada una representa una funcionalidad real ya en producción. -->

## Objetivo

Rediseñar la vista **Cántaros** (`/user/jars`) de OWFinance manteniendo el 100% de las funcionalidades listadas abajo. Es un sistema de presupuesto por sobres/potes (%, o monto fijo) donde el usuario reparte su ingreso mensual y trackea gasto/disponible por cántaro. Existen **dos experiencias completamente distintas**: Pro (desktop-first, densa, completa) y Lite (mobile-first, simplificada). No fusionar sus alcances — Lite es deliberadamente más simple, no una versión recortada por accidente.

---

## 1. Vista Pro/Legacy — elementos visuales y de layout

### 1.1 Bloque superior de ingreso (siempre visible, arriba de todo)
Card destacada (fondo azul/gradiente en la versión actual) con:
- **Ingreso Esperado** — monto grande, editable (icono lápiz).
- **Ingreso Real** — monto + variación % vs esperado (ícono de tendencia).
- **Total Asignado** — monto + "% del esperado".
- **Disponible** — monto + "% restante", color verde si positivo.
- Toggle **"Usar ingreso real"** (arriba a la derecha).
- Barra de progreso horizontal debajo de los 4 datos (verde = dentro de presupuesto).
- **Banner de alerta** ancho completo, fondo rojo, ícono de aviso: *"Faltan $X.XX para alcanzar tu meta"* — solo visible si el ingreso real está por debajo del esperado.

### 1.2 Card "Resumen del mes"
- Badge "Pro" junto al título.
- Subtítulo: "Balance del mes con los indicadores clave arriba y la tabla de seguimiento debajo."
- **4 tiles de KPI** en grid 2x2 (desktop) — cada uno con label + monto grande + descripción corta debajo:
  1. Total gastado — "Consumo acumulado entre todos los cántaros activos."
  2. Total ajustes — con signo (+/−) — "Correcciones manuales aplicadas al periodo."
  3. No usado este mes — "Disponible no ejecutado en cántaros reset."
  4. Ahorro teórico total — "Incluye ahorro en cuentas: $X.XX" — color azul/morado distintivo.
- (Solo en modo legacy se inserta un 5° tile: "Ocioso acumulado" — no incluir en el rediseño Pro salvo que se decida mantener el modo legacy).

### 1.3 Tabla "Desglose mensual" (debajo del resumen)
Tabla ancha con columnas: **Cántaro** (nombre + % o "Fijo") | **Saldo anterior** (con flecha up/down + etiqueta "superávit"/"excedido", solo si el cántaro es acumulativo) | **Asignado esperado** | **Asignado real** | **Disponible mes** | **Gastado** | **Ajuste** (con lápiz inline para editar) | **Total gasto** | **Balance**. Fila de totales al pie (`Total`), con estilo diferenciado (negrita, fondo distinto).

Colores por columna: montos positivos en verde, negativos/gastos en rojo, ajustes con signo.

### 1.4 Card "Configuración global de cántaros"
Subtítulo: "Define el inicio de contabilidad y los valores por defecto sin salir del flujo principal." Badge "Balanceado" a la derecha.
Grid de campos:
- Inicio de contabilidad (global) — date picker.
- Toggle "Permitir negativos por defecto".
- Límite negativo por defecto — input numérico (deshabilitado si el toggle anterior está apagado).
- Ciclo por defecto — select (Sin reinicio / Mensual / Trimestral / Semestral / Anual).
- Día del ciclo por defecto — input numérico (1-28).
- Cántaro de apalancamiento (global) — select con opción "Ninguno".
- Cántaro de apalancamiento (mes actual, override) — select.
- Toggle "Habilitar apalancamiento automático" con hint: "Si está habilitado, los cántaros negativos se reabsorben automáticamente desde el cántaro de apalancamiento."

### 1.5 Header "Mis Cántaros" + barra de distribución
- Barra horizontal apilada: un segmento coloreado por cada cántaro activo tipo %, ancho proporcional a su %, con segmento rayado/vacío si la suma es <100%. Tooltip por segmento (nombre + %).
- Texto de alerta roja bajo el título si los % no suman 100 (y no hay un cántaro de monto fijo activo que lo compense).
- Indicador "Total: X%" (rojo si excede 100, ámbar si falta).
- Acciones: **Añadir cántaro**, **Aplicar plantilla** (abre catálogo), **Guardar Cambios** (deshabilitado hasta que el estado sea válido).

### 1.6 Tarjeta individual de cántaro (lista arrastrable — reordenar con drag handle)
**Fila de controles** (siempre visible): drag handle · input de nombre · toggle Activo/Inactivo · segmented-control Reset/Acumulativo · segmented-control %Porcentaje/$MontoFijo · selector de color (paleta + sugeridos por nombre + aleatorio) · eliminar · expandir/colapsar.

**Colapsado** (estado por defecto): solo el slider/input de % (o monto fijo).

**Expandido**, agrega:
- Slider + input de % (0-100 entero) o monto fijo (2 decimales).
- Campo "Propósito" (textarea, hint: "¿Para qué es este cántaro? El asesor IA usará este contexto.").
- **Card de balance en vivo** (ver sección 1.7) con: disponible grande, barra de "% utilizado" (puede superar 100% mostrando "excedido"), chips de carry-over/gastado/ajuste/retiros, botón "Ver desglose completo" (expande fila por fila: saldo anterior, asignado, gastado, retiros, ajuste, transferencias in/out, apalancamiento in/out, balance final), botones **Ajustar** / **Registrar uso** / **Apalancar** (si aplica) / **Resetear ajuste** (si hay ajuste activo).
- "Opciones avanzadas" (colapsable): fecha de inicio propia + toggle "usar fecha global", ciclo de reinicio propio, día del ciclo, permitir negativo propio, límite negativo, **Meta/objetivo** ($), **Apalancamiento desde** (selector de otro cántaro origen).
- **Dropzone de categorías**: chips de categorías vinculadas (removibles), drag&drop desde el panel lateral de categorías, drag&drop entre cántaros (anti-duplicado automático).

### 1.7 Panel lateral — árbol de Categorías
Árbol readonly (Ingresos/Gastos, con carpetas) del cual se arrastran categorías hacia los cántaros. Las ya asignadas se ocultan del árbol.

### 1.8 Diálogo "Aplicar plantilla" (maximizado)
Grid de cards de plantillas: nombre, descripción, chips de cántaros con su % ("Nombre — X%" o "— fijo"), chips de categorías sugeridas. Botón Aplicar con confirmación explícita ("esto elimina la configuración actual").

### 1.9 Modal de Ajuste (`AdjustmentModal`)
- Encabezado con "Disponible a gastar" y "Balance contable" actuales.
- Campo "Balance objetivo" (no un delta — el usuario piensa en el saldo final).
- **Split Usado/Restante**: dos inputs sincronizados bidireccionalmente que ajustan el balance objetivo automáticamente.
- Campo Descripción (opcional).
- Preview del ajuste calculado con signo, y bloque explicativo "vas a incrementar/reducir en $X".
- Acciones: Borrar ajustes del mes (separado a la izquierda) · Cancelar · Guardar (con confirmación extra si el ajuste reduce el balance).

### 1.10 Diálogo "Registrar uso" (retiro)
Monto a usar, Descripción, Fecha — simple, 3 campos.

---

## 2. Vista Lite — elementos visuales y de layout (mobile-first, completamente distinta)

### 2.1 Header
Eyebrow "Cántaros" · Título "Mis cántaros" · Subtítulo "Distribuye tu dinero por frascos" · Botón "+ Añadir" (top-right).

### 2.2 Card resumen (una sola, mucho más simple que Pro)
- "Total en cántaros · USD" (ocultable con `••••••`).
- Barra de distribución (segmentos por cántaro activo, sin segmento vacío).
- 3 stats en fila: Activos (conteo) · Asignado ($) · Uso global (%).

### 2.3 Selector de periodo
Chips: Mensual / Semestral / Anual. (Nota: en producción hoy no dispara recarga real — decidir si en el rediseño se conecta de verdad o se retira.)

### 2.4 Lista de cántaros (activos primero, inactivos "dimmed")
Cada fila: drag handle · icono · nombre · tag `%`/`$fijo` · tag "Acumula"/"Reset" · tag "Inactivo" si aplica · tag "Excedido"/"Lleno" según estado · monto disponible (ocultable) · **toggle activo/inactivo inline** · barra de progreso de uso + texto "X% utilizado / de $Y".

### 2.5 FAB flotante "+"

### 2.6 Bottom-sheet "Detalle"
Hero (icono + nombre + balance grande + barra) · grid 2x2 (Porcentaje / Asignado / Utilizado % / Disponible) · acciones rápidas **Agregar**/**Retirar** (abren el modal genérico de transacción, no un formulario dedicado) · footer: Eliminar / Cerrar / Editar.

### 2.7 Bottom-sheet "Editar"
Solo 2 campos: Nombre y Porcentaje, + color de una paleta fija de 8 swatches. Deliberadamente sin tipo fijo/%, sin acumulativo, sin categorías, sin apalancamiento, sin meta.

### 2.8 Bottom-sheet "Nuevo cántaro"
Nombre*, Porcentaje (default 10), Color (misma paleta de 8).

### 2.9 Estado vacío
Ícono `water_drop`, "Tus cántaros están vacíos", botones "+ Registrar ingreso" y "Crear cántaro".

---

## 3. Diferencias funcionales Pro vs Lite (tabla de referencia — no perder ningún renglón)

| Funcionalidad | Pro | Lite |
|---|---|---|
| Tipo % vs monto fijo | Editable por cántaro | Fijo, siempre %(implícito) |
| Acumulativo/Reset | Editable | Solo lectura (tag) |
| Categorías vinculadas | Drag&drop + árbol lateral | No existe |
| Apalancamiento (leverage) | Global + mensual + por-cántaro | No existe |
| Meta/objetivo | Sí | No |
| Fecha inicio / ciclo / negativo / límite | Sí (opciones avanzadas) | No |
| Ajuste manual dedicado (split usado/restante) | Sí | No — "Retirar" abre transacción genérica |
| Registrar uso dedicado | Sí (monto+descripción+fecha) | No |
| Reordenar cántaros | Persiste (drag → guardado bulk) | Solo visual, no persiste |
| Plantillas | Sí | No |
| Tabla resumen mensual | Sí | No |
| Ahorro teórico / no usado este mes | Sí | No |
| Color | Picker completo + sugeridos + aleatorio | Paleta fija de 8 |
| Ocultar valores | No implementado hoy (considerar agregarlo) | Sí |

---

## 4. Validaciones y reglas de negocio a preservar

- La suma de % de cántaros activos debe ser 100%, salvo que exista un cántaro de tipo monto-fijo activo, o exista exactamente un único cántaro % con valor 100.
- % se redondea a entero, clamp 0-100. Monto fijo clamp ≥0, 2 decimales.
- Límite negativo solo editable si "permitir negativo" está activo (global o por-cántaro).
- Nombre vacío se autocompleta como "Cántaro N" al perder foco.
- Confirmación explícita antes de: eliminar cántaro con categorías vinculadas, aplicar plantilla (reemplaza todo), reducir balance vía ajuste, borrar ajustes del mes, resetear ajuste.
- El guardado es un único `bulk-sync` de todos los cántaros a la vez (mantener este patrón evita condiciones de carrera en backend).

## 5. Estados vacíos, loaders y mensajes

- Sin cántaros (Pro): mensaje + CTA doble (crear / aplicar plantilla).
- Sin cántaros (Lite): mensaje + CTA doble (registrar ingreso / crear cántaro), ícono `water_drop`.
- Loading de balance individual: overlay con spinner sobre la card del cántaro.
- Error de balance: banner rojo dentro de la card.
- Alerta de % desbalanceado: texto rojo + outline punteado ámbar en la barra de distribución.
- Toast/notify para: guardado ok/error, cántaro eliminado, plantilla aplicada, ajuste guardado, uso registrado, apalancamiento aplicado (o sus variantes de error: no configurado, mismo cántaro, sin excedente, origen insuficiente).

## 6. Fórmulas clave (para que el rediseño no invente cálculos nuevos)

- `totalInflows = asignado + max(ajuste,0) + transfers_in + leverage_in`
- `totalOutflows = gastado + retiros + abs(min(ajuste,0)) + transfers_out + leverage_out`
- `% utilizado = outflows / inflows * 100` (Pro: **sin cap**, puede superar 100% mostrando "excedido $X"; Lite: cappeado a 100%).
- `balance = inflows - outflows`.

## 7. Qué NO replicar (deuda técnica conocida, no es funcionalidad deseada)

- `components/liquid/LiquidJarCard.vue` es solo una exploración estética desconectada de datos reales — usable como inspiración visual (esquinas 32px, barra con gradiente cian), no como referencia funcional.
- El selector de periodo Mensual/Semestral/Anual en Lite hoy no recarga datos — decidir explícitamente si se implementa de verdad en el rediseño.
- El reordenamiento en Lite no persiste — si se rediseña, decidir si debe persistir (como en Pro) o mantenerse efímero a propósito.
- El ícono de candado en `AnchoredJarChip` (categoría→cántaro, visible en otras vistas, no en Jars) es puramente informativo, no interactivo — no agregarle affordance de click si se reutiliza ese componente aquí.

---

## 9. Pendiente — columna de saldo de cuenta (anotado 2026-07-19, fuera de alcance de Cántaros)

El usuario pidió dejar registrado aquí (aunque es sobre la tabla/lista de **transacciones**, no de cántaros): falta agregar una columna adicional que muestre **el saldo de la cuenta al momento de la transacción** (saldo histórico post-movimiento, no el saldo actual). Aplica a cualquier vista de rediseño que liste transacciones con columnas (ej. tabla de transacciones Pro). No implementado todavía — solo anotado para que el rediseño lo contemple cuando toque esa vista.

## 8. Referencia visual ya validada en producción (screenshots adjuntos por el usuario)

El usuario ya compartió capturas de la vista Pro actual en `/app/user/jars` mostrando: bloque de ingreso azul con toggle "Usar ingreso real" y barra verde de progreso, banner rojo de alerta de meta, resumen del mes con 4 tiles, tabla de desglose con 10 cántaros reales (Necesidades básicas, Coche/Auto y transporte, Ocio/Diversión, Donaciones, Educación, Salud, Sociales, Hogar cómodo, Empresa, Viajes, Ahorro) y fila de totales, configuración global, y el panel expandido de un cántaro individual con slider de %, propósito, card de detalle con barra de progreso y botones Ajustar/Registrar uso, más el panel lateral de categorías con árbol Ingresos/Gastos. Usar esa composición visual como línea base de fidelidad — el rediseño debe mejorar la estética pero no perder ninguno de esos bloques.
