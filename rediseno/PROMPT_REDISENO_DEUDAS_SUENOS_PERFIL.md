# Prompt de Rediseño — Deudas, Sueños y Perfil

<!-- Generado: 2026-07-21. Fuente: auditoría de código fuente (debts/index.vue, DebtCard.vue, dreams/index.vue, financial-profile/index.vue, profile/index.vue, ChangePasswordCard.vue) + `.owf/FEATURE_MASTER_LIST.md` sección 5 + verificación de git log (sin cambios desde la auditoría base). -->
<!-- Uso: pegar este documento completo como contexto al iniciar el rediseño de `/user/debts`, `/user/dreams`, `/user/financial-profile` y `/user/profile`. Mismo nivel de detalle que PROMPT_REDISENO_CANTAROS.md. -->

## Objetivo

Rediseñar 4 vistas que hoy se agrupan en un solo documento porque comparten una característica estructural poco común en el sistema: **ninguna tiene diferencias de código entre Pro y Lite**. Se renderizan idénticas en ambos modos. Esto simplifica el alcance visual (una sola variante por vista, no dos), pero es una decisión que vale la pena confirmar con producto antes de diseñar — ver sección 6.

---

## 1. Deudas (`/user/debts`)

### 1.1 Hero / resumen (card gradiente rojo)
- "Total pendiente · USD" = suma de saldos (`meta.total_balance`), enmascarable con `$ ••••••` si `ui.hideValues`.
- Stat "Próx. cuotas · 30d" = `meta.total_monthly`.
- Stat "Estado" = texto dinámico: `"N atrasada(s)"` en rojo si `meta.late_count > 0`, o `"Todo al día"` en verde.
- Metadata disponible pero no mostrada en UI: `meta.cashea_count`, `meta.count`.

### 1.2 Agrupación de la lista
Dos secciones: **"Planes Cashea"** (con chip "0% interés") y **"Otras deudas"**.

### 1.3 `DebtCard.vue` — tarjeta individual
- Badge "Cashea" (esquina) si `provider === 'cashea'`.
- Icono de proveedor con color: Cashea (`shopping_bag`, naranja), Tarjeta (`credit_card`, rojo), Préstamo (`account_balance`, morado), Personal (`handshake`, celeste).
- Nombre, subtítulo (comercio o label del proveedor + tasa/interés si existe).
- **Saldo pendiente** (oculto con `hideValues`).
- **Chip de estado** (4 valores): Al día (verde), Próximo (amarillo/warning), Atrasado (rojo), Pagado (verde).
- **Barra de progreso** (0-100%, clamped, coloreada según estado).
- Pie: "Cuota X/Y" si hay `total_installments`, si no "{progress}% pagado".
- Si hay `next_due_date`: "Próxima: $ {next_due_amount} · {fecha}".
- Acciones al hover: Pagar cuota, Editar, Eliminar (rojo al hover).
- **Sin lógica de proyección** — el `progress` viene ya calculado del backend, no hay cálculo de "fecha estimada de pago total" en el frontend.

### 1.4 Acciones de página
- "Nuevo plan" (header + fila de acciones + empty state).
- "Pagar cuota" (genérico, toma la primera deuda de la lista por defecto si no hay preselección) y "Pagar" por card (preselecciona esa deuda).
- Editar / Eliminar (por card, confirmación explícita: *"¿Eliminar "{name}"? Esta acción no se puede deshacer."*).
- Quick action por query param: `?quickAction=pay` abre automáticamente el diálogo de pago al montar.

### 1.5 Formulario de alta/edición
Nombre del plan* · Tipo/proveedor (select: Préstamo, Tarjeta de crédito, Cashea, Deuda personal) · Comercio/Entidad (texto libre) · Monto original* (≥0) · Saldo pendiente (≥0; si se omite, usa `original_amount` como fallback) · Total de cuotas (opcional) · Cuotas pagadas (default 0) · Próxima cuota $ (default 0 si se omite) · Fecha de pago · Tasa/interés (texto libre) · Estado (select: Al día/Próximo vencimiento/Atrasado/Pagado) · Notas (opcional). Botón deshabilitado si falta nombre o monto original; error inline en banda roja si falla el guardado.

### 1.6 Diálogo "Pagar cuota"
Nombre + saldo de la deuda seleccionada · campo "Monto a pagar" (obligatorio, ≥0.01, placeholder sugiere `next_due_amount`) · botón deshabilitado sin monto válido · `POST /debts/{id}/pay`.

### 1.7 Estados vacíos / loaders / notificaciones
- Loader: spinner centrado.
- Vacío: icono `credit_score`, "Sin deudas registradas", subtítulo, botón "Agregar primera deuda".
- Notificaciones: "Deuda actualizada", "Deuda agregada", "Pago registrado", "Deuda eliminada" (positivas); "Error al eliminar" (negativa); errores de guardar/pagar muestran mensaje del backend si existe.
- **Carga silenciosa**: si `GET /debts` falla, no muestra error — el listado simplemente queda vacío (sin feedback al usuario de que algo falló vs. que no hay datos).

---

## 2. Sueños (`/user/dreams`)

### 2.1 Hero
"Total acumulado · USD" (oculto con `hideValues`) · subtexto "{N} sueños activos" + si existe meta combinada: "meta combinada $X" + si existe progreso global: "{X}% del camino" (morado).

### 2.2 Grid de sueños activos
Cada card: icono/emoji custom o `auto_awesome` default, color de fondo custom o morado default · nombre + descripción (opcional, truncada) · **% de progreso** en la esquina, coloreado con el color del sueño · monto ahorrado/meta ("X / Y") · barra de progreso (clamp 100%) · botones "Aportar" y "Editar" · menú contextual (⋮).

### 2.3 Sección "Completados (N)" — separada
Cards con opacidad reducida (0.72), icono check verde, mensaje "¡Completado! ${monto}", barra al 100% en verde. Sin botones de aportar/editar visibles (solo menú ⋮).

### 2.4 Acciones
"Nuevo sueño" (hero + empty state, abre bottom-sheet) · "Aportar" (por card o desde ⋮) · "Editar" (por card o desde ⋮, precargado) · "Marcar como completado" (⋮, solo si `!is_completed`) · "Reabrir sueño" (⋮, solo si `is_completed`) · "Eliminar" (⋮, confirmación explícita). Quick action `?quickAction=contribute` → notificación informativa "Seleccioná un sueño para hacer tu aporte" (no auto-abre ningún diálogo específico).

### 2.5 Formulario de alta/edición
Nombre* (maxlength 100) · Emoji (texto libre, maxlength 4) · Color (8 swatches predefinidos, click de nuevo sobre el activo lo deselecciona) · Descripción (opcional, maxlength 200) · Meta $* (`target_amount`, ≥1) · Ahorrado $ (`saved_amount`, ≥0). Botón deshabilitado si falta nombre o meta.

### 2.6 Diálogo "Aportar"
Barra de progreso actual + "X ahorrado / Meta Y" · campo "Monto a aportar $" (≥0.01) · botón deshabilitado sin monto. Al completar: si `is_completed` pasa a `true`, notificación festiva "🎉 ¡Sueño "{name}" completado!" (4s); si no, "Aporte registrado — {progress}% completado".

### 2.7 Menú contextual (bottom sheet)
Editar sueño · Aportar · Marcar como completado / Reabrir (condicional) · Eliminar (rojo, separado visualmente).

### 2.8 Estados vacíos / loaders / notificaciones
Loader: spinner 32px. Vacío: icono `auto_awesome` gris, "Aún no tienes sueños" + "Crear primer sueño". Notificaciones para cada acción (actualizado/creado/error, completado/aporte/error, eliminado/error). **Sin proyección de fecha estimada de meta** — igual que Deudas, solo progreso % actual.

---

## 3. Perfil Financiero (`/user/financial-profile`)

### 3.1 Header
Subtítulo: "El asesor IA usa esta información para personalizar sus consejos." · indicador "Actualizado hace {N día(s)}"/"hoy" · botón volver a `/user/config`.

### 3.2 Card "Quién soy" (chips single-select, toggle on/off)
Ocupación (Empleado/Freelancer/Emprendedor/Estudiante/Jubilado/Otro) · Rango de ingresos mensuales (<$500, $500-1.5k, $1.5k-4k, >$4.000) · Situación de vivienda (Solo/a, Pareja, Familia, Compartido).

### 3.3 Card "Situación financiera" (chips)
Deudas actuales (Sin deudas/Tarjeta/Préstamo/Hipoteca/Varias) · Fondo de emergencia (Sin fondo/<3m/3-6m/>6m) · Relación con el dinero (Quiero mejorar/Organizado/Me cuesta ahorrar/Vivo al día).

### 3.4 Card "Metas y sueños"
Meta principal ahora (chips: Salir de deudas/Fondo emergencia/Meta de ahorro/Invertir/Llegar a fin de mes) · Sueño a largo plazo (textarea, contador X/500, color de advertencia >450) · "¿Cómo quieres sentirte con tu dinero?" (chips: Tranquilo/Libre/Seguro/En control/Próspero).

### 3.5 Card "Mis cántaros" (jars) — la pieza más compleja de esta vista
- Selector de plantilla (carrusel de `jarTemplates`): nombre, mini-barra segmentada proporcional a % con colores, badges "Recomendada" (verde) / "★ Popular" (ámbar), descripción "para quién".
- Selección de plantilla con datos existentes → **diálogo de confirmación**: "¿Reemplazar tus cántaros?" con preview de la nueva plantilla + nota: *"Tus cántaros con transacciones se conservan; los porcentajes se reajustan a la nueva plantilla."*
- **Tabla editable de cántaros**: contador "{N} cántaros" + suma de % (roja si >100%, verde si ==100%) · por fila: swatch de color, input nombre, input % (0-100), botón eliminar · textarea de propósito por cántaro · botón "Agregar cántaro" (color gris default) · mensaje de error si suma >100%.

### 3.6 Acciones
Toggle de chips (single-select, deselecciona con segundo click) · seleccionar plantilla (con confirmación condicional) · agregar/eliminar cántaro · **Guardar perfil** (deshabilitado si suma de cántaros >100%) → 2 llamadas en paralelo: `PUT /user/financial-profile` (todos los campos + `onboarding_profile_completed:true`) y `POST /jars/bulk-sync` (solo si hay cántaros). Cancelar → `/user/config`.

### 3.7 Estados / validaciones / notificaciones
Loader mientras carga (perfil + plantillas + jars en paralelo vía `Promise.allSettled` — cada fuente puede fallar independientemente). Si falla el perfil: "No se pudo cargar el perfil financiero" (pero templates/jars se intentan igual). Si suma >100% al guardar: warning que bloquea el guardado. Notificación positiva + redirección a `/user/config` al éxito. Loader independiente para plantillas.

---

## 4. Perfil (`/user/profile`)

### 4.1 Card identidad
- Avatar: círculo con inicial del nombre (o "U") · botón cámara **⚠️ no funcional** — notifica "Subida de foto próximamente" (placeholder).
- Nombre completo (o "—") · Email + **badge "Verificado"** (si `email_verified_at` existe).
- **Barra de completitud de perfil** ("Completado X%"): sobre 8 campos (`name, email, phone, occupation, city, country, birthdate, monthly_income`) — % = campos rellenos / 8. Verde si 100%, azul (brand) si menor.

### 4.2 Card "Datos personales"
Nombre completo · Ocupación (texto libre) · Fecha de nacimiento (date) · Ingreso mensual (numérico, prefijo $, ≥0).

### 4.3 Card "Contacto"
Correo electrónico (email) · Teléfono (texto, placeholder "+58 412 000 0000").

### 4.4 Card "Ubicación"
País (select: Venezuela 🇻🇪, Colombia 🇨🇴, México 🇲🇽, Argentina 🇦🇷, Estados Unidos 🇺🇸, España 🇪🇸) · Ciudad (texto libre).

### 4.5 Card "Seguridad"
Incrusta `ChangePasswordCard.vue` (ver sección 5).

### 4.6 Navegación
Botón "Ir a mi perfil financiero" → `/user/financial-profile`.

### 4.7 Acciones
"Guardar cambios" → `PUT /user/profile` (name, email, phone, occupation, city, country, monthly_income, birthdate — null si vacío); actualiza `auth.user.name` localmente. "Cancelar" → `/user/config`. Carga inicial `GET /user/profile` (falla → "No se pudo cargar el perfil").

### 4.8 Sin validaciones de formato explícitas
Ni regex de email, ni longitud de teléfono en frontend — solo los tipos de input HTML (`type="email"`, `type="date"`, `type="number"`).

---

## 5. `ChangePasswordCard.vue` (embebido en Perfil)

- Campos: Nueva contraseña (toggle visibilidad, autocomplete `new-password`, hint "Mínimo 8 caracteres") · Confirmar contraseña (validación de coincidencia en vivo).
- **Indicador de fortaleza** (visible solo con texto ingresado): barra de 4 segmentos, score 0-4 (longitud≥8, mayúscula, número, carácter especial). Labels: Muy débil (rojo)/Débil (naranja)/Aceptable (amarillo)/Fuerte (verde).
- Validaciones antes de enviar: vacío → no hace nada; <8 caracteres → warning bloqueante; no coinciden → warning bloqueante.
- Envío: `PUT /user/profile` con `{password: newPwd}`. Éxito: limpia campos, notifica. Error: mensaje del backend o genérico.
- Texto ayuda: "Deja estos campos vacíos si no deseas cambiar tu contraseña" (confirma que el mismo endpoint tolera omitirlo sin efecto).

---

## 6. Sobre la ausencia de diferencias Pro/Lite (confirmar con producto antes de diseñar)

Ninguna de las 6 pantallas/componentes de este documento lee `layout_mode` ni bifurca su render, campos, acciones o validaciones según el modo — **todo el contenido de las secciones 1-5 aplica igual en Pro y en Lite**. Esto es distinto a los 5 módulos ya cubiertos (Home, Transacciones, Cántaros, Análisis, Cuentas/Categorías/Impuestos), todos con diferenciación real.

**Pregunta para producto, no solo para diseño**: ¿esto es intencional (estas 4 vistas son "secundarias", alcanzadas por navegación, no necesitan la misma densidad diferenciada que las vistas primarias) o es una brecha de implementación pendiente? Si el rediseño introduce diferenciación Pro/Lite aquí, es **funcionalidad nueva**, no una migración — impacta el alcance y el tiempo de diseño.

---

## 7. Referencias de diseño ya existentes en `rediseno/`

- `ui_kits/lite-desktop/templates/DebtsRoute.jsx`, `DreamsRoute.jsx`, `FinancialProfileRoute.jsx`, `ProfileRoute.jsx` — plantillas de referencia visual desktop, una por cada una de las 4 vistas de este documento.
- `ui_kits/mobile/screens/DebtsScreen.jsx`, `DreamsScreen.jsx`, `FinancialProfileScreen.jsx`, `ProfileScreen.jsx` — referencia mobile.
- `views-registry.json`: **ninguna de estas 4 vistas tiene entrada** en el registro — nadie ha comparado formalmente el JSX contra el Vue real descrito en este documento. A diferencia de Home (que sí tiene entradas `unreviewed`), aquí ni siquiera se llegó a registrar la comparación. Antes de asumir que el JSX refleja el comportamiento actual, compararlo contra las secciones 1-5 de este prompt.
- Dato notable: como estas 4 vistas no distinguen Pro/Lite en el Vue real (sección 6), pero **sí existen plantillas desktop separadas** en el kit de diseño (`*Route.jsx` bajo `lite-desktop/`) — vale la pena revisar si esas plantillas de referencia ya asumían diferenciación Pro/Lite que nunca se implementó, o si son genéricamente compatibles con ambos modos.

---

## 8. Validaciones y estados vacíos — resumen transversal

- Confirmación explícita antes de eliminar: Deudas ✅, Sueños ✅. (Cuentas/Impuestos NO tienen esta confirmación — ver `PROMPT_REDISENO_CUENTAS_CATEGORIAS_IMPUESTOS.md` §9, es una inconsistencia ya documentada en otro módulo, no específica de este).
- Ninguna de las 4 vistas calcula proyecciones de fecha (ni "cuándo se paga la deuda" ni "cuándo se alcanza la meta del sueño") — si el rediseño las agrega, es funcionalidad nueva.
- Deudas: falla silenciosa en la carga inicial (sin feedback de error al usuario) — inconsistente con Sueños y Perfil, que sí notifican error de carga.

---

## 9. Cómo proceder

1. Confirmar con producto la pregunta de la sección 6 antes de diseñar — determina si son 4 pantallas o 8 (4 vistas × 2 modos).
2. Diseñar Perfil Financiero al final de las 4 — es la más compleja (chips + selector de plantilla + tabla editable de cántaros) y depende conceptualmente de Cántaros (ya cubierto).
3. Contrastar contra las 4 plantillas `*Route.jsx`/`*Screen.jsx` (sin entrada en el registry) — si hay divergencias, registrarlas en `DECISIONS.md` siguiendo `PROMPT_REDISENO_CENTRAL.md` §2.3.
4. Usar `.owf/FEATURE_MASTER_LIST.md` sección 5 como referencia cruzada si aparecen dudas de alcance.
