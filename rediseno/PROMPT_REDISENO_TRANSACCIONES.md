# Prompt de Rediseño — Transacciones (Movimientos)

<!-- Generado: 2026-07-20. Fuente: auditoría de código fuente (transactions/index.vue, LiteTransactionsView.vue, SmartTransactionModal.vue, TxDetailModal.vue, TransactionFormDialog.vue, TransactionBulkImportDialog.vue, CategorySelector.vue, ai/*.vue) + `.owf/FEATURE_MASTER_LIST.md` sección 2, ya actualizada con los commits OWF-320/OWF-319 del 2026-07-19. -->
<!-- Uso: pegar este documento completo como contexto al iniciar el rediseño de la vista Transacciones. Cubre Pro, Lite, Legacy, y el formulario de creación/edición (el componente más complejo del sistema). No omitir ninguna sección. -->

## Objetivo

Rediseñar el módulo **Transacciones** (`/user/transactions` + el formulario global de creación/edición) manteniendo el 100% de las funcionalidades reales listadas abajo. A diferencia de Cántaros, este módulo tiene **deuda técnica seria**: 3 modos de lista distintos, 3 implementaciones distintas de "ver/editar transacción" que no coinciden en alcance, y al menos 1 feature que la UI promete pero el backend nunca recibe. La sección 6 ("Qué no replicar") es lectura obligatoria antes de picar código — el rediseño es la oportunidad de **consolidar**, no de clonar la triplicación.

---

## 1. Vista de lista — Pro (`transactions/index.vue`)

### 1.1 Header
`PeriodNavigator` (granularidades día/semana/quincena/mes/trimestre/semestre/año/todo/custom) + título de página.

### 1.2 Fila de control superior
`AccountFilterWidget` (pill "Todas las cuentas"/nombre/"N cuentas" con panel flotante: segmentos rápidos Todas/Solo USD/Solo VES/Con deuda, buscador, lista agrupada por carpeta con checkbox parcial/total, menú ⋮ por cuenta con Ajustar/Recalcular saldo inline) · buscador inline · contador de movimientos + neto · botón exportar CSV · botón eliminar selección.

### 1.3 Tres "pools" de filtro (grid, siempre visibles, no colapsables)
1. **Filtros activos**: chip de mes (locked), tipo (ingreso/gasto), categorías, cántaros, búsqueda, monto — todos removibles individualmente; footer con toggle tipo (Todas/Ingresos/Gastos), presets de monto (`<$50`, `$50–200`, `>$200`), botón "Limpiar".
2. **Categorías**: agrupadas por cántaro (con % y color del cántaro), fallback a lista plana si el catálogo no cargó. Click = filtro multi-select. Doble-click sobre el chip de categoría de una fila del feed = filtro rápido directo.
3. **Cántaros**: chips con color y conteo de transacciones. Click = filtro multi-select.

### 1.4 Feed agrupado por fecha (columna principal)
Cada grupo: fecha (`HOY`/`AYER`/día) + total del día. Cada fila: icono coloreado por tipo (ingreso/gasto/**transferencia** — Pro es el único modo que distingue un tercer tipo `transfer` con icono `swap_horiz` propio), nombre + hora, chip de cántaro, chip de categoría (oculto en mobile ≤640px), monto con signo/color, acciones editar/eliminar visibles en hover.

**Modo multi-selección**: click normal abre editar (con debounce 220ms para distinguir de doble-click); doble-click activa selección múltiple; barra inferior con conteo + suma + "Seleccionar todas"/"Listo" + acciones en lote.

### 1.5 AccountsPanel lateral (colapsable, estado persistido en `localStorage`)
Tabs **Cuentas** (patrimonio neto en USD, lista con avatar coloreado, saldo nativo + equivalente USD, menú ⋮ Ajustar/Recalcular saldo — individual o en lote con checkboxes) / **Deudas** (total adeudado, lista con próximo pago, link a "Registrar deuda").

### 1.6 Modal de detalle propio ("OWF-138", dentro de `index.vue` — NO es `TxDetailModal.vue`)
- **Vista**: monto con signo/color, nombre, fecha, cuenta, categoría/proveedor, tipo, cántaro anclado (`AnchoredJarChip`). Footer: Editar / Duplicar / Eliminar.
- **Editar/Duplicar**: tipo, nombre, monto, fecha (datetime-local), cuenta (con búsqueda), categoría (`CategorySelector`), proveedor (con búsqueda), toggle "Incluir en balance de cuentas". ⚠️ **No soporta transferencia, comisión, split, ítems ni compartido** — solo campos básicos.
- **Eliminar**: confirmación con warning + monto/nombre + botón "Eliminar definitivamente".
- Deep-link `?editTx=<id>` (viene del click en "Movimientos recientes" del Home) abre este modal automáticamente al montar.

### 1.7 Ajustar/Recalcular saldo (top bar, solo si hay exactamente 1 cuenta seleccionada)
Dialog: "Saldo de apertura" + input "Nuevo saldo" + checkbox "Generar transacción de ajuste". "Recalcular" llama directo sin confirmación.

### 1.8 Balance corrido (`running_balance`)
Solo se calcula/muestra si hay 1 cuenta seleccionada y el orden es por fecha — fila ancla "Saldo anterior"/"Saldo actual" arriba y abajo del feed.

### 1.9 Conversión de moneda visible
Fórmula inline cuando la cuenta no es USD: `USD: 3.568,99 VES / 40.50 = 88.12 USD`.

---

## 2. Vista de lista — Legacy (tercer layout, dentro del mismo `index.vue`)

Layout de 2 columnas: `AccountsSidebarWidget` (sidebar) + panel principal con hero card (movimientos visibles/ingresos/gastos/balance neto), card de filtros con `q-expansion-item` "Filtros avanzados y columnas" (Proveedor/Cuenta/Tipo/Categoría/Desde/Hasta + selector de columnas visibles), `q-table` server-side con paginación, exportar CSV, eliminar selección. Columnas disponibles: ID, Nombre, Proveedor, Cuenta, Tipo, Cantidad, Monto, Impuesto, Fecha, Activo, Acciones + columna sintética `category_summary` + `running_balance` condicional.

> Decisión de producto pendiente antes de rediseñar: ¿el modo Legacy sigue vivo para algún segmento de usuarios, o se retira? Si se retira, esta sección completa no aplica al rediseño.

---

## 3. Vista de lista — Lite (`LiteTransactionsView.vue`, componente separado)

### 3.1 Filtro inteligente (una sola tarjeta)
Buscador + botón "Filtros" (badge con conteo) → panel (desktop: dropdown; mobile: bottom-sheet): Tipo (Todas/Ingresos/Gastos), Cántaro, Categoría, Día (derivado de fechas presentes), Monto (mín/máx + presets). Chips de filtros activos removibles + "Limpiar (n)".

### 3.2 Barra de resultados
Conteo + neto.

### 3.3 Estados de lista
- **Vacío (usuario nuevo)**: CTA "+ Primer movimiento".
- **Sin resultados de filtro** (con datos existentes): mensaje distinto al anterior.

### 3.4 Fila de transacción
Icono ingreso/gasto (⚠️ clasificación simple solo por signo — **no distingue transferencia como tercer tipo**, a diferencia de Pro), nombre, categoría + fecha relativa, hasta 3 chips de etiquetas (+n si hay más), chip de cántaro, monto (oculto con `••••••` si `ui.hideValues`).

### 3.5 Detalle — bottom sheet (solo lectura)
Hero (icono/monto/nombre), filas Tipo/Categoría/Cántaro (`AnchoredJarChip`)/Fecha/Etiquetas. Confirmación de borrado inline. Acciones: Eliminar, **Duplicar** (POST directo a `/transactions` simplificado, deriva cántaro de categoría, un solo payment), Cerrar, **Editar** (abre `SmartTransactionModal` prellenado — no un mini-form propio, a diferencia del modo Pro/Legacy).

---

## 4. Formulario maestro — `SmartTransactionModal.vue` (usar como ÚNICA referencia de creación/edición en el rediseño)

Este es el componente más rico del sistema y el que debería quedar como fuente de verdad única tras el rediseño (ver sección 6).

### 4.0 Matriz de elementos por modo — LEER ANTES DE DISEÑAR (actualizado 2026-07-22, OWF-336)

⚠️ **Corrección de modelo importante**: Lite y Pro **NO son cuentas ni usuarios distintos** — es el mismo usuario, los mismos datos. La diferencia es el **modelo de cuentas expuesto**:
- **Lite** = una "billetera" genérica **implícita**, una por moneda que el usuario use (auto-creada al registrarse, `accounts.is_default=true`). El usuario nunca elige entre cuentas — no tiene sentido, solo hay una por moneda.
- **Pro** = el modelo real de cuentas múltiples con nombre propio (banco, efectivo, tarjeta, etc.), cada una con todas las características — incluida la capacidad de transferir entre ellas.

Si un usuario usó Pro alguna vez y creó cuentas reales, y después vuelve a Lite, esas cuentas **siguen existiendo en el backend** (no se borran) pero **no deben verse ni poder elegirse** en Lite — confirmado y corregido en OWF-336 (antes de esa fecha, el formulario mostraba todas las cuentas reales en ambos modos, bug real).

Por eso, el formulario de creación/edición **no es "un formulario con algunos campos condicionales"** — hay elementos que estructuralmente solo existen en un modo. Tabla completa de qué tiene cada uno (✅ tiene / ❌ no tiene / 🔒 existe pero fijo/sin elegir):

| Elemento | Lite | Pro | Nota |
|---|---|---|---|
| Tipo: Gasto / Ingreso | ✅ | ✅ | Igual en ambos |
| Tipo: Ajuste | ✅ | ✅ | Igual en ambos (oculto al editar, ver 4.2) |
| Tipo: **Transferir** | ❌ | ✅ | No tiene sentido con una sola cuenta por moneda — excluido del selector de tipo en Lite (OWF-336) |
| Selector de cuenta | 🔒 | ✅ | Lite: el campo existe pero solo ofrece la billetera de esa moneda (1 opción, sin buscador real). Pro: selector completo multi-cuenta con búsqueda, color, saldo |
| Cuenta de origen define la moneda | ✅ | ✅ | Igual en ambos — nunca se elige moneda a mano, la define la cuenta |
| 4 toggles Pro (Pago múltiple / Detalle-factura / Gasto compartido / Comisión) | ❌ | ✅ | Ver 4.4, exclusivos de Pro |
| Etiquetas | 3 fijas (`impulso`/`planificado`/`recurrente`) | Todas las del usuario | Ver 4.3 |
| Métodos de entrada (Escribir/Voz/Foto/Auto IA/Carga masiva) | ✅ | ✅ | Sin diferencia por modo — ver 4.9, sí hay slot-filling/TTS/comando directo en ambos |
| Atajos rápidos (Pago de deuda / Aporte a sueño / Aporte a jar / Asesor IA) | ✅ | ✅ | Sin diferencia por modo — el gate real es viewport desktop, no Lite/Pro (confirmado con interacción real en ambos modos) |
| Tasas duales (paralelo/oficial BCV) si la cuenta no es USD | — | — | No re-verificado en esta pasada, no asumir sin confirmar antes de diseñar |

**Regla para el rediseño**: cuando un elemento de esta tabla sea ❌ o 🔒 para Lite, el diseño debe reflejar directamente esa ausencia/restricción — no diseñar un único formulario "con todo visible" y asumir que Vue lo oculta después. La elección de qué elementos van en cada modo ya está resuelta arriba; lo que falta es que el diseño (JSX) la respete tan explícitamente como el código Vue ya la respeta desde OWF-336.

### 4.1 Métodos de entrada (tabs, ocultos en modo edición)
Escribir · Voz · Foto · Auto IA · Carga masiva (dialog aparte, ver sección 5). Sin diferencia Lite/Pro (ver matriz 4.0).

### 4.2 Tipos de movimiento
Gasto · Ingreso · Ajuste (todos en ambos modos) · **Transferir (solo Pro, ver matriz 4.0 — OWF-336)**. Ajuste oculto en edición — usa endpoint dedicado `POST /accounts/{id}/adjust-balance`, no es una transacción editable por PUT.

### 4.3 Campos por tipo
- **Ajuste**: cuenta a ajustar (dot color + saldo), saldo objetivo, banner "se creará un ajuste de +/-X", motivo (requerido).
- **Transferencia** (solo Pro): monto hero + pills de moneda (si hay >1 moneda), cuenta origen/destino (side-by-side, con búsqueda, destino excluye la ya elegida), panel de cruce de moneda si origen≠destino (tasa manual + preview "Envías X / Llega Y"), fecha (atajos Hoy/Ayer/Otra), concepto opcional al final. ⚠️ Hay 3 bugs reales reportados sobre este panel el mismo día (OWF-331/332/333: cuenta no viene preelegida, saldo no se refresca en UI tras guardar, falta columna de detalle en el listado, falta soportar el cálculo en ambos sentidos origen↔destino, falta toggle de tasa paralela) — no tomar el comportamiento actual de Transferencia como spec limpia, confirmar contra esos tickets antes de diseñar esta pantalla específica.
- **Gasto/Ingreso**: cuenta de origen (define la moneda — ya no se elige a mano; en Lite el selector solo ofrece la billetera de esa moneda, ver matriz 4.0), monto hero (se oculta si "Ítems" está activo, reemplazado por banner de total), **tasas duales** (paralelo actual + oficial BCV) si la cuenta no es USD, concepto, categoría (`CategorySelector`, filtrado por kind) + cántaro anclado (solo lectura, derivado), proveedor/comercio (con creación inline "+ Nuevo proveedor"), fecha.
- **Etiquetas**: chips con color semántico + hint contextual + creación inline (paleta de 8 + random + color libre). **Pro**: todas las etiquetas. **Lite**: solo 3 fijas por slug (`impulso`, `planificado`, `recurrente`).

### 4.4 Features exclusivas de Pro (4 toggles tipo tarjeta, ocultas en Lite/Legacy)
1. **Pago múltiple (split)**: N filas cuenta+monto+tasa, suma vs. monto total con validación de coincidencia (tolerancia 0.01).
2. **Detalle/factura (items)**: N líneas artículo+cantidad+precio+IVA%+categoría propia; reemplaza el campo Monto principal por un banner de total.
3. **Gasto compartido (shared)** — ✅ **Actualizado 2026-07-21 — D-001 COMPLETO, persistencia + reparto equitativo, ambos en prod.** Si otra copia de este documento dice que el reparto automático "sigue pendiente", está desactualizada.
   - **Persistencia real** (OWF-326, 2026-07-21): tabla dedicada `shared_transaction_categories` (transaction_id, category_id, amount, jar_id), `TransactionController::store()` valida que la suma de categorías coincida EXACTO con el monto (422 si no), `save()` manda el payload real. Verificado end-to-end contra prod.
   - **Reparto equitativo automático** (OWF-327, 2026-07-21 — última acción pendiente de `DECISIONS.md` **D-001**, disposición `fusionar`, mecánica en `BEHAVIOR.md` §4): cada fila de `sharedCats` tiene un flag `touched`. Al activar el panel o agregar una fila, el monto total se reparte en partes iguales entre las filas **no tocadas** (la última fila absorbe el redondeo de centavos). Si el usuario edita una fila a mano, esa fila queda `touched` y el resto (`monto - suma de filas tocadas`) se re-reparte solo entre las filas que siguen sin tocar. Verificado con 3 escenarios en dev local: activar con $100 → $50/$50; editar fila 1 a $20 → fila 2 pasa sola a $80; agregar 3ª categoría → las 2 no tocadas ($80) se parten en $40/$40. **El rediseño (JSX) sigue sin el lado "editable a mano"** — el diseño de referencia (`TransactionForm.jsx`) reparte automático pero no expone edición por fila; esa es la única pieza de D-001 que sigue del lado del diseño, no del código Vue.
   - **Fuera de alcance** (documentado, no tocar sin decisión aparte): editar una transacción existente con `shared_categories` ya guardadas no hidrata el panel (mismo gap ya conocido de Items/comisión, ver OWF-321).
4. **Cobrar comisión**: Pago móvil (0.30% **con piso Bs 2**, fix del 2026-07-19/OWF-320 — antes no tenía piso y daba comisiones irrealmente bajas en montos pequeños) / Porcentaje / Monto fijo. Sí se aplica al guardar (se suma al monto; en Transferencia se descuenta solo del lado origen sin inflar lo que llega al destino).

### 4.5 Toggle transversal
"Afecta el saldo" (fuera del grupo de 4, siempre visible salvo en Ajuste) — hint: "Desactiva para movimientos informativos".

### 4.6 Adjunto/foto de soporte
⚠️ Solo UI: se previsualiza localmente (`URL.createObjectURL`) pero nunca se sube al backend. **Esto es intencional, no un bug** — `rediseno/DECISIONS.md` D-002 (2026-07-12, disposición `intencionalmente-distintos`, temporal) adjudicó explícitamente el patrón "UI-first sin backend" para este campo, con el wiring real diferido a OWF-283. El rediseño debe mantener el mismo patrón visual ("archivo + preview + quitar") sea cual sea el storage final — no bloquear el diseño esperando a que OWF-283 se resuelva.

### 4.7 Revisión antes de guardar
`TfReviewCard`: preview en lenguaje natural ("Vas a registrar..."), lista de errores de validación, accent de color por tipo, símbolo de moneda real de la cuenta, nombre del cántaro.

### 4.8 Validaciones
- Ajuste: cuenta + saldo objetivo + motivo requeridos.
- Transferencia: origen/destino distintos y requeridos, monto > 0, tasa requerida si hay cruce de moneda.
- Gasto/Ingreso: concepto requerido, monto > 0 (usa total de ítems si aplica), cuenta requerida, suma de split debe coincidir con el monto.

### 4.9 Tabs de IA (dentro del mismo modal)

⚠️ **Actualizado 2026-07-21 (OWF-310 cerrada formalmente) — el flujo de Voz que sigue es el ESTADO FINAL, las 3 capas de OWF-319 quedaron 100% verificadas de punta a punta en producción real. No queda ningún "parcial" pendiente.** Si otra copia de este documento dice "1/2" o "incompleto" sobre la TTS, está desactualizada — reemplazar por lo de abajo.

- **Voz — flujo completo, en orden**:
  1. **Grabación**: `useAudioRecorder.ts` (`MediaRecorder`, no `SpeechRecognition` nativo — Brave lo bloquea por privacidad, Edge no trae credenciales, Safari/iOS nunca lo implementó; ver OWF-311). `stop()` devuelve una Promise que espera a que el audio termine de codificarse a base64 antes de continuar (evita condiciones de carrera).
  2. **Transcripción server-side**: el audio (base64 + mime) va al backend, que lo manda a **Groq Whisper** (`whisper-large-v3-turbo`, modelo dedicado de transcripción, siempre Groq sin importar la cadena de fallback del resto de IA) vía `AiProviderFactory::transcribeAudio()`. La transcripción se muestra en la UI ("esto entendí") antes de seguir.
  3. **Extracción**: el texto transcrito reutiliza el MISMO pipeline que Auto IA — system prompt con la lista de cuentas del usuario, fuzzy-match de proveedor (ej. "Vanesco"→"Banesco", Levenshtein ≥0.6), equivalente BCV determinístico calculado en PHP (no se le pide a la IA que haga la conversión).
  4. **Slot-filling de cuenta faltante** (OWF-319 capa 1): si el usuario es Pro con 2+ cuentas y no la mencionó (ni por nombre ni por moneda), la respuesta trae `missing_fields:["account_id"]` y la UI muestra chips con las cuentas para elegir — resolverlo llama `POST .../answer`, que asigna la cuenta en PHP puro **sin gastar ninguna llamada de IA** (`processing_ms:0`). Con 1 sola cuenta, nunca pregunta — auto-asigna siempre.
  5. **Confirmación por voz (TTS)** (OWF-319 capa 2): en paralelo a los chips del punto 4, `useSpeechSynthesis.ts` (wrapper de `window.speechSynthesis`, soporte amplio incluyendo iOS Safari, **no-op silencioso** si el navegador no soporta TTS — nunca bloquea el flujo) lee en voz alta *"¿Con qué cuenta fue?"*.
  6. **Comando "crea directo"** (OWF-319 capa 3): si el usuario dice una frase de confirmación explícita al final ("...crea directo", "guárdalo directo", "regístralo directo", "confirma directo" — detectado sin importar tildes/mayúsculas) **Y** ya no falta ningún campo (`missing_fields` vacío), la respuesta trae `direct_create:true` y la transacción se guarda **de inmediato, sin abrir la pantalla de revisión ni pedir ningún clic de confirmación**. Si falta la cuenta, el comando se ignora y sigue pidiéndola igual (el atajo nunca salta el slot-filling).
  7. Si no hay comando directo (o falta un campo): pantalla de revisión normal (`TfReviewCard`, "Vas a registrar...") para confirmar con "Editar y guardar", igual que Foto/Auto IA.
- **Foto**: drag&drop o file picker (imagen o PDF), OCR vía IA (Gemini 2.5 Flash con `thinkingBudget:0` para no truncar la respuesta — ver OWF-131), mismo patrón de resultado/confirmación/slot-filling/TTS que Voz (comparten `missing_fields`/`direct_create` si aplica, aunque "crea directo" por voz obviamente no aplica a este tab).
- **Auto IA**: textarea libre, botón "Analizar con IA", mismo patrón de resultado/slot-filling que Voz y Foto.
- Las tres comparten `applyAiResult()`/`prefillFormFromAiResult()`: mapean tipo/monto/moneda/descripción/fecha/categoría/proveedor/**cuenta** (el `account_id` resuelto por cualquiera de los 3 caminos —chip, mención del modelo, o única cuenta— se copia al formulario; un bug de una línea lo dejaba fuera hasta el 2026-07-20).
- **Proveedor primario de IA**: **Groq** (`llama-3.3-70b-versatile` para extracción/asesor, `whisper-large-v3-turbo` para transcripción de voz) — no OpenCode Go, que quedó como 1er fallback tras comparar precio/confiabilidad (OWF-312). El rediseño no necesita mostrar el proveedor al usuario, pero si hay algún indicador de "IA pensando/procesando", Groq responde típicamente en <1s para extracción de texto.
- **Fix histórico (2026-07-19, OWF-319)**: el guardado de una transacción proveniente de un resultado de IA fallaba con *"date field must be a valid date"* en ciertos casos — ya corregido en el formateo de fecha antes de enviar el payload; no debería reaparecer en el rediseño si se reimplementa el mismo formateo.

### 4.10 Guardado (`save()`)
Ajuste → endpoint dedicado (no crea transacción). Transferencia → 2 payments con conversión si aplica. Gasto/Ingreso → payments simple o split, ítems de factura si aplica, `jar_id` derivado de la categoría, tasas paralelo/oficial persistidas como referencia futura. Edición reutiliza `PUT` real (no el `PATCH` legado que no coincidía con la ruta backend). Refresca perfil del usuario al abrir el modal (evita saldos desactualizados).

---

## 5. Carga masiva — `TransactionBulkImportDialog.vue`

### 5.1 Tres modos de entrada
1. **Tabla manual**: filas Fecha/Concepto/Tipo/Monto/Tasa (si aplica)/Categoría.
2. **Excel** (.xlsx/.xls): sube archivo, detecta columnas, preview hasta 100 filas.
3. **Texto**: pega con delimitador configurable (incluye TAB).

### 5.2 Flujo
Cuenta única obligatoria (aplica a todas las filas) → advertencia si requiere tasa → "Siguiente: Ajustes":
- Mapeo de columnas (9 campos, soporta concatenar múltiples columnas por campo, con leyenda de colores).
- Reglas opcionales de mapeo de valores de tipo (texto → income/expense/transfer).
- **Vista previa editable**: tabla hasta 50 filas, columnas redimensionables, edición fila por fila, eliminar fila.
- Tasa por defecto con advertencia roja si es exactamente 1.0 ("probablemente incorrecta").
- Asignación de categorías no encontradas (mapeo 1:1 + reglas por palabra clave + reglas "columna TIPO → categoría").
- Toggle "Notificar al finalizar" (Notification API nativa).
- **Vista Previa (dry run)** e **Importar Ahora** — mismo endpoint con `dry_run: true/false`.
- Resultado: total/creadas/fallidas + lista de errores por fila.

---

## 6. Qué NO replicar (deuda técnica confirmada — decidir explícitamente, no clonar por inercia)

### 6.1 Triplicación de "ver detalle de transacción" — elegir UNA
Hoy conviven 3 implementaciones con distinto alcance de campos:
- `TxDetailModal.vue` — usado solo desde Home.
- Modal "OWF-138" inline en `transactions/index.vue` — usado en Pro/Legacy.
- Bottom-sheet en `LiteTransactionsView.vue` — usado en Lite.
**Recomendación**: el rediseño debe definir un único componente de detalle parametrizable por `layout-mode`, no 3 componentes distintos.

### 6.2 Triplicación de "editar transacción" — elegir UNA
- Mini-editor OWF-138 (sin transferencia/comisión/split/ítems).
- `TransactionFormDialog.vue` (legacy: sin IA/split/ítems/shared/comisión, campo "Archivo" es texto libre, no upload real).
- `SmartTransactionModal.vue` (el completo — **esta es la referencia recomendada**, todos los demás "Editar" deberían delegar aquí).

### 6.3 Componentes huérfanos (no usados en producción — no confundir con estado actual)
- `components/transactions/TransactionPalette.vue` — prototipo MVP incompleto, payload sin `account_id`/`payments[]`.
- `components/TransactionForm.vue` — scaffold genérico de 3 campos, no conectado a ningún flujo real.
- `components/ai/AutoIaDialog.vue`, `OcrTransactionDialog.vue`, `VoiceTransactionDialog.vue` — reemplazados por los tabs integrados en `SmartTransactionModal`, pero **tienen detalles de UX que sí vale la pena rescatar**: contador de caracteres visible (0/2000), advertencia explícita de "baja confianza" (<70%), límite de grabación visible con temporizador — el modal integrado actual no siempre expone esto tan claramente.

### 6.4 Features solo-UI (no asumir que persisten)
- Gasto compartido (`sharedCats`) — ver 4.3.3 (actualizado 2026-07-21). Decisión de producto **ya adjudicada Y ya implementada en Vue** (D-001, `fusionar`/híbrido, OWF-326+327) — solo falta el lado del diseño (JSX sin edición manual por fila).
- Adjuntar foto/comprobante — ver 4.6. También adjudicada (D-002, `intencionalmente-distintos` temporal): patrón UI-first válido, wiring de backend diferido a OWF-283 a propósito (no es un bug, es la decisión).

### 6.5 Inconsistencias a resolver en el rediseño, no perpetuar
- Clasificación de "transferencia": Pro la distingue como tercer tipo (icono propio); Lite la colapsa en "expense" — decidir un único criterio.
- `isProMode`/`isLiteLayout` en `SmartTransactionModal` trata "legacy" como "lite" — un usuario en modo legacy pierde silenciosamente las 4 features Pro sin ningún aviso.
- `TxDetailModal.vue` conserva CSS muerto de un modo de edición inline que ya no existe en el template — limpiar al reimplementar.

---

## 7. Estados vacíos, loaders, validaciones — resumen transversal

- Vacío nuevo usuario (Lite): "+ Primer movimiento".
- Sin resultados de filtro (Lite): mensaje distinto al de "sin datos".
- Confirmación antes de eliminar (todas las vistas): dialog con warning + monto/nombre.
- Confirmación antes de eliminar selección en lote (Pro): conteo + suma.
- Notificaciones toast consistentes (`$q.notify`) para creado/editado/eliminado/error, en español.
- Recalcular/Ajustar saldo: sin confirmación previa en "Recalcular" (llamada directa), sí la hay en "Ajustar" (dialog con campos).

---

## 8. Cambios recientes a incorporar (2026-07-19/20 — ya en producción, no repetir como "hallazgo nuevo" en próximas auditorías)

| Commit | Qué cambió | Dónde aplica en este documento |
|---|---|---|
| `afbb8bd` (OWF-320) | Comisión "Pago móvil" con piso Bs 2 | §4.4.4 |
| `470d9fc` (OWF-319) | Fix guardado IA — fecha inválida | §4.9 |
| `87b912c` (OWF-319 capa 2, parcial 1/2) | TTS nativo (`useSpeechSynthesis.ts`) lee en voz alta la pregunta de cuenta faltante en el flujo de Voz | §4.9, marcado como incompleto |

---

## 9. Cómo proceder

1. **Antes de diseñar**: "Gasto compartido" ya tiene decisión (D-001, §4.3.3) — diseñar directamente el comportamiento híbrido, sin reabrir la decisión. Lo único que sigue abierto de verdad es el modo Legacy (§2): decidir si sigue vivo para algún segmento de usuarios o se retira, porque cambia el alcance de lo que hay que dibujar.
2. **Diseñar la lista** en 2 variantes reales (Pro, Lite) — no 3, salvo que se confirme que Legacy sigue vivo.
3. **Diseñar el formulario de creación/edición una sola vez**, parametrizado por `layout-mode` (Pro muestra las 4 features avanzadas + todas las etiquetas; Lite muestra el set reducido) — no 3 formularios distintos.
4. **Diseñar el detalle de transacción una sola vez**, mismo criterio de parametrización.
5. Carga masiva (§5) se mantiene como flujo aparte, ya está bien delimitado y no tiene deuda técnica reportada.
6. Usar `.owf/FEATURE_MASTER_LIST.md` (secciones 2 y 10) como referencia cruzada si aparecen dudas de alcance durante el diseño.
