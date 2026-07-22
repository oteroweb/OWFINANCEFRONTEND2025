# Prompt de Rediseño — Panel de Administración

<!-- Generado: 2026-07-21. Fuente: auditoría de código fuente (18 vistas de src/pages/admin/, CrudPage.vue) + `.owf/FEATURE_MASTER_LIST.md` sección 8 + verificación de git log (sin cambios desde la auditoría base). -->
<!-- Uso: pegar este documento completo como contexto al iniciar el rediseño de `/admin/*`. Menor prioridad que los 7 módulos ya cubiertos (Cántaros, Transacciones, Análisis, Home, Cuentas/Categorías/Impuestos, Deudas/Sueños/Perfil, Asesor IA/Config/Notificaciones/Onboarding) — impacto de usuario final más bajo. -->

## Objetivo

Rediseñar el panel `/admin/*` (18+ vistas). **La estrategia de rediseño más eficiente aquí es distinta a la de los módulos de usuario**: 15 de las 18 vistas son CRUD genérico sobre el mismo motor (`CrudPage.vue` + `dictionary.ts` por entidad) — rediseñar `CrudPage.vue` una sola vez impacta automáticamente a las 15. Solo 4 vistas son verdaderamente custom y necesitan diseño individual: `users` (index + detail), `admin_dashboard`, `ai_monitor`, `system`.

---

## 1. Motor genérico — `CrudPage.vue` (rediseñar esto primero, una sola vez)

Mismo componente ya documentado en `PROMPT_REDISENO_CUENTAS_CATEGORIAS_IMPUESTOS.md` §5 (Cuentas/Impuestos de usuario lo comparten). Repetido aquí por completitud:

- Tabla server-side (paginación page/rowsPerPage/sortBy/descending/rowsNumber), orden por defecto por columna `date` o `id`.
- Manejo robusto de distintas formas de envelope de respuesta.
- Diálogo único crear/editar reutilizando `forms_save`/`forms_update` del dictionary.
- Validación mínima genérica (name/amount/date/time no vacíos).
- Columnas especiales: booleanas, `time` (12h AM/PM), `date` (localizado), `account.name` con fallback, many-to-many con badges "Owner", `tags` con chips coloreados.
- Sincroniza filtros/búsqueda con la URL.
- **Elimina sin confirmación previa** (solo notificación post-hoc) — mismo patrón en las 15 vistas genéricas. Decisión de rediseño a tomar una sola vez: ¿agregar confirmación al motor (afecta a las 15 de golpe)?
- Búsqueda con debounce, exportar CSV, selects con opciones ordenadas alfabéticamente.

---

## 2. Las 15 vistas CRUD genéricas (mismo motor, distinto `dictionary.ts` por entidad)

| CRUD | Entidad | Columnas / campos principales |
|---|---|---|
| currencies | Monedas | name, symbol, code, align (izq/der), active |
| clients | Clientes | name, email, active, deleted_at; filtro nombre/email |
| account_type | Tipos de cuenta | name, icon, description, active |
| taxes | Impuestos (vista admin, distinta de la de usuario) | name, percent, date, active |
| item_categories | Categorías de ítem | name, parent_id (jerárquico), date, active |
| items | Ítems (catálogo) | name, last_price, tax_id (FK), custom_name, item_category_id, date, active |
| jars | Cántaros (vista admin) | name, percent, type, date, active |
| categories | Categorías (vista admin) | name, parent_id jerárquico, date, active |
| rates | Tasas de cambio (vista admin) | name, value, date, active, created_at/updated_at |
| providers | Proveedores/comercios (el más completo en campos) | name, description, address, city, state, postal_code, country, phone, email, website, logo, user_id (FK), active |
| transaction_types | Tipos de transacción | name, slug, active |
| roles | Roles de usuario | name, slug (sin `active`) |
| transactions | Transacciones (vista admin) | provider_id, user_id, account_id, transaction_type_id, date_from/to, tag_ids; columnas provider/user/account/tipo/amount/amount_tax/tags/date/active; multiselect de tags, campo url_file |
| accounts | Cuentas (existe en disco, no estaba en el inventario original de 18 pero sigue el mismo patrón) | igual patrón genérico |

**Nota de diseño**: todas comparten estructura visual (tabla + filtros + diálogo crear/editar) — el rediseño puede tratarlas como **una sola plantilla parametrizable** (título de entidad, columnas, campos de formulario) en vez de 15 diseños separados.

---

## 3. `system` — dashboard de estado (custom, solo lectura)
Chips de entorno/deploy · tarjetas de conteo de registros por tabla · lista de últimas sesiones (nombre, email, last_login). Fuente: `GET /admin/system`.

---

## 4. `admin_dashboard` — dashboard principal (custom)
6 tarjetas KPI: usuarios totales, usuarios activos, transacciones totales, transacciones del mes, cuentas, cántaros. Fuente: `GET /admin/dashboard`.

---

## 5. `ai_monitor` — monitor de proveedores de IA (custom, el más rico de los 4)
- Tarjetas de estado por proveedor (opencode-go, groq, openrouter, gemini, xai, openai, anthropic): indicador activo/con-key, modelo usado, posición en cadena de fallback.
- Selector de período (7/30/90 días).
- KPIs: llamadas, tokens in/out, costo estimado.
- Desglose "por funcionalidad": voice, ocr, auto_ia, advisor.
- Tabla de últimas llamadas: fecha, user, feature, provider, modelo, tokens, costo.
- Fuentes: `GET /admin/ai/providers`, `GET /admin/ai/stats`.
- **Contexto relevante**: este panel es la única superficie donde el usuario admin ve qué proveedor de IA respondió cada llamada — útil para diagnosticar los issues documentados en `PROMPT_REDISENO_ASESOR_CONFIG_NOTIFICACIONES_ONBOARDING.md` §1.7 (fallback entre proveedores, JSON de error residual).

---

## 6. `users` — gestión de usuarios (custom, 2 archivos)

### 6.1 `users/index.vue`
4 KPIs (total usuarios, activos hoy, registrados este mes, total registros) · buscador + filtros (rol, activo) · tabla con avatar+nombre+email, badge de rol, **toggle de activo inline**, fecha de registro · acciones: ver detalle, **impersonar**, eliminar. Paginación server-side.

### 6.2 `users/detail.vue` — 6 tabs
**Perfil** (nombre, email, rol, modo Lite/Pro — editable) · **Cuentas** (lista con balance) · **Cántaros** (lista) · **Transacciones** (recientes, con signo +/-) · **Seguridad** (sesiones activas, cambiar contraseña, revocar sesiones, enviar reset por email) · **Ajustes** (settings custom del usuario en JSON crudo).

Incluye impersonación de usuario desde ambas vistas (`ImpersonationBanner.vue`, ya documentado en `PROMPT_REDISENO_HOME.md` §5.7, se activa desde acá).

---

## 7. Estados vacíos, loaders, validaciones — resumen transversal

- Mismos patrones que Cuentas/Impuestos de usuario (mismo motor `CrudPage.vue`): sin confirmación antes de eliminar, notificaciones `$q.notify` consistentes.
- `ai_monitor` y `admin_dashboard`: sin estado vacío documentado explícitamente — asumir loaders estándar mientras cargan las 2 fuentes de datos cada uno.

---

## 8. Qué NO replicar / aclaraciones

- **No diseñar 15 pantallas distintas** para los CRUD genéricos — es ineficiente y no refleja cómo está construido el sistema. Diseñar 1 plantilla parametrizable.
- El tab "Ajustes" de `users/detail.vue` muestra JSON crudo de settings — si el rediseño quiere una UI más amigable ahí, es una mejora nueva, no una migración 1:1.
- Impersonación es una acción sensible (accede a la cuenta de otro usuario) — el rediseño debe mantener visibilidad clara de que se está impersonando (banner ya existe, ver `PROMPT_REDISENO_HOME.md` §5.7), no ocultarla por limpieza visual.

---

## 9. Referencias de diseño ya existentes en `rediseno/`

- `OW Finance - Admin.html` — único documento de referencia visual para todo el panel admin, genérico, sin desglose por entidad ni JSX dedicado para ninguna de las 18 vistas.
- **Sin entrada en `views-registry.json`** para ningún sub-módulo de Admin.
- **Conclusión**: Admin es el módulo con **menor cobertura de diseño previo** de los 9 — el rediseño parte casi de cero, con un solo HTML genérico como referencia de intención, no de detalle.

---

## 10. Cómo proceder

1. Rediseñar `CrudPage.vue` como plantilla parametrizable única (impacta 15 vistas de golpe).
2. Diseñar los 4 custom por separado: `admin_dashboard`, `ai_monitor` (el más rico), `system`, `users` (index + detail, 6 tabs).
3. Decidir si se agrega confirmación de eliminación al motor genérico (afecta también a Cuentas/Impuestos de usuario — coordinar con `PROMPT_REDISENO_CUENTAS_CATEGORIAS_IMPUESTOS.md` §9).
4. Usar `.owf/FEATURE_MASTER_LIST.md` sección 8 como referencia cruzada si aparecen dudas de alcance.
