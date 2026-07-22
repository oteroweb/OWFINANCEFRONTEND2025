# Prompt de Rediseño — Asesor IA, Configuración, Notificaciones y Onboarding

<!-- Generado: 2026-07-21. Fuente: auditoría de código fuente (AsesorPage.vue, config/index.vue, notifications/index.vue, NotificationsPanel.vue, OnboardingFlow.vue, OnboardingModal.vue, useAiChat.ts) + `.owf/FEATURE_MASTER_LIST.md` sección 7 + verificación de git log (sin cambios frontend desde la auditoría base — los fixes recientes de OWF-310 fueron 100% backend: AiChatController, providers PHP, no tocan estos .vue). -->
<!-- Uso: pegar este documento completo como contexto al iniciar el rediseño de `/user/asesor`, `/user/config`, `/user/notifications` y los 2 flujos de onboarding. Mismo nivel de detalle que PROMPT_REDISENO_CANTAROS.md. -->

## Objetivo

Rediseñar 4 piezas que se agrupan porque son flujos **transversales** (tocan toda la app, no un dominio de datos específico): el chat de Asesor IA, el centro de configuración (donde vive el propio toggle Pro/Lite), notificaciones, y los 2 flujos de onboarding (que son distintos entre sí, no uno solo — ver sección 5). Recomendación de orden: diseñar esto **después** de los 6 módulos ya cubiertos, porque Config referencia visualmente casi todo lo demás (tabs de Categorías/Cuentas/Impuestos embebidos, tasas de cambio, etc.).

---

## 1. Asesor IA (`/user/asesor`)

### 1.1 Estructura de pantalla (mobile-first, full-height)
Header: botón volver · avatar circular con gradiente de marca · nombre del asesor (`aiSettings.advisor_name`, default "Asesor IA") · estado en línea ("en línea" / "escribiendo…" durante streaming) · botón refrescar (limpia conversación, deshabilitado en streaming) · botón de ajustes (`tune`, abre bottom-sheet).

### 1.2 Configuración del asesor (bottom-sheet)
- Campo "Nombre del asesor" (maxlength 60, placeholder "Asesor IA").
- Selector de **Personalidad** (3 chips): **Amigable** (`emoji_emotions`, "Cálido, directo y empático") · **Formal** (`business_center`, "Profesional y preciso, sin rodeos") · **Coach** (`fitness_center`, "Te reta y motiva a mejorar").
- Toggle "Asesor activado".
- Botón "Guardar cambios" (loading "Guardando…"). Persistencia: `GET/PUT /user/financial-profile` (`advisor_name`, `advisor_personality`, `advisor_enabled`).

### 1.3 Área de mensajes
- **Vacío**: avatar grande, "Hola, soy {advisor_name o 'tu Asesor IA'}", subtítulo, **4 sugerencias predefinidas** (chips, auto-envían al click): *"¿Cuánto gasté este mes?"* · *"¿Cómo está mi balance?"* · *"¿En qué categoría gasto más?"* · *"Dame un resumen financiero"*.
- Burbujas: usuario a la derecha (fondo brand-primary), asistente a la izquierda (avatar `smart_toy`, fondo surface-1).
- **Indicador de escritura** (typing dots animados) mientras el mensaje del asistente está vacío y `isStreaming`.
- Render de contenido: negritas (`**texto**`), saltos de línea, y **CTA embebida**: el texto puede traer `[CTA: texto]` (regex), se muestra como pill clicable debajo del mensaje — click reenvía ese texto como nuevo mensaje.
- Timestamp relativo (ahora/hace N min/hace Nh/hace Nd).
- Botón copiar mensaje (hover, `content_copy`).

### 1.4 Barra de error
Si `error` está seteado: barra roja con icono, mensaje, botón "Reintentar" (`retryLastMessage`), botón "OK" para descartar.

### 1.5 Input
Campo de texto simple, placeholder "Escribe tu pregunta…", deshabilitado en streaming, envío con Enter o botón (`send`).

### 1.6 Streaming (`useAiChat.ts`)
- `fetch` directo (no axios) contra `POST /ai/chat` con `Accept: text/event-stream` (SSE).
- Envía `{message, conversation_id?}`, mantiene `conversation_id` entre turnos.
- Tipos de evento parseados: `delta` (texto incremental) · `done` (conversation_id final) · `error` (mensaje del servidor).
- **Rate limit**: HTTP 429 → error "Límite de mensajes alcanzado. Espera unos minutos."
- Stream cortado a medias → error "Conexión interrumpida. Toca para reintentar." + elimina el mensaje vacío del asistente.
- `retry()`: quita el último mensaje de usuario y lo reenvía. `clearConversation()`: resetea todo (botón refresh del header).
- **Historial de conversaciones ya soportado en backend pero SIN UI**: el composable expone `loadConversation(id)` (`GET /ai/conversations/:id/messages`) y `getConversations()` (`GET /ai/conversations`), pero `AsesorPage.vue` no monta ningún selector de historial hoy — es una feature "lista para conectar", no implementada visualmente. Si el rediseño la agrega, es una oportunidad de diseño real, no solo estética.
- Proveedores (Gemini/OpenCode/Groq) son 100% server-side — el frontend es agnóstico, no hay selección de proveedor visible al usuario (solo aparece en `admin/ai_monitor.vue`, fuera de alcance de este documento).

### 1.7 Nota sobre estabilidad reciente del backend (no afecta el diseño, sí el testing)
⚠️ **Actualizado 2026-07-21 — OWF-310 cerrada formalmente, ya no hay pendientes conocidos.** OWF-310 (2026-07-13, backend) arregló que el chat abortaba a mitad de stream y pegaba HTML crudo de error 500; también corrigió que un error de proveedor con HTTP 200 pero cuerpo de error no activaba el fallback a groq. El síntoma cosmético que había quedado abierto (fragmento de JSON de error de `opencode-go` pegado al inicio de la respuesta antes del contenido real) **dejó de reproducirse en la práctica desde OWF-312** (2026-07-14): ese texto solo aparecía cuando `opencode-go` era el proveedor *primario* y fallaba antes de caer a `groq` — al promover Groq a primario (por precio/confiabilidad, `opencode-go` quedó como 1er fallback) ese paso previo ya no ocurre en el camino feliz. Si al probar el rediseño en vivo aparece texto raro al inicio de una respuesta, ya no es este bug conocido — investigar como hallazgo nuevo.

---

## 2. Configuración (`/user/config`) — bifurca completamente el template Pro/Lite

### 2.1 Modo Pro
**Cards**: Aplicación (modo app Lite/Pro, idioma es/en, ocultar saldos por defecto, tema, presupuesto estricto, fila "Divisa predeterminada"→`/user/accounts`, fila "Pantalla de inicio"→`/user/home`) · Seguridad (privacy lock, PIN configurar/cambiar/eliminar) · Notificaciones (resumen semanal, alertas de dinero ocioso) · Perfil financiero (fila navegable) · **Tasas de Cambio** (`<ExchangeRatesTable />` embebido — ver `PROMPT_REDISENO_ANALISIS.md` §5 para el detalle completo del componente) · Cerrar sesión.

**Tabs debajo de las cards** (exclusivas de Pro):
1. **Perfil** — avatar upload (JPG/PNG máx 2MB), nombre, correo + `<ChangePasswordCard />` embebido (ver `PROMPT_REDISENO_DEUDAS_SUENOS_PERFIL.md` §5 para el componente).
2. **Finanzas** — moneda por defecto (con búsqueda), Ingreso Mensual Esperado con banners condicionales ("Sistema Híbrido" si >0, advertencia naranja si es 0), sección "¿Cómo Funciona?" (4 pasos).
3. **Categorías** — `<CategoriesTree>` completo (ver `PROMPT_REDISENO_CUENTAS_CATEGORIAS_IMPUESTOS.md` §2 para el componente), incluye asignar/reasignar cántaro por categoría.
4. **Cuentas** — `<AccountsTree>` completo (ver mismo documento §1.4).
5. **Impuestos** — `<CrudPage>` genérico (mismo documento §3).

### 2.2 Modo Lite
Estructura de lista con secciones (no cards ni tabs):
- **Aplicación**: mismos campos que Pro pero como filas de lista.
- **Cuenta** (nav items): Perfil, Mi perfil financiero, Categorías (tab interno), Impuestos (tab interno). **⚠️ "Cuentas vinculadas" excluido explícitamente** (comentario: *"Lite: single generic account — no account management needed"* — ver `PROMPT_REDISENO_CUENTAS_CATEGORIAS_IMPUESTOS.md` §1.1). **"Repetir configuración inicial"** (reabre `OnboardingFlow` manualmente — **no existe en Pro**). **"Exportar datos"** — ⚠️ placeholder no funcional, notifica "Exportación próximamente".
- **Notificaciones**: mismos 2 toggles, como filas.
- **Seguridad**: botón "Contraseña" → **redirige a `/user/profile`** (en Pro el cambio de contraseña es inline, en Lite es otra página) · privacy lock · PIN.
- Cerrar sesión (con email del usuario como hint).
- **Sin bloque de Tasas de Cambio** — no aparece en Lite en absoluto.

### 2.3 Tabla de diferencias Pro vs Lite (Config)
| Aspecto | Pro | Lite |
|---|---|---|
| Tabs Perfil/Finanzas/Categorías/Cuentas/Impuestos | `q-tabs` visibles | Mismos paneles internos, navegación vía nav-list sin tabs |
| Tab "Cuentas" | Visible | Excluido |
| "Repetir configuración inicial" | No aparece | Sí |
| "Exportar datos" | No aparece | Sí (placeholder) |
| Cambio de contraseña | Inline (tab Perfil) | Redirige a `/user/profile` |
| Tasas de Cambio | Visible | No aparece |
| Layout | Cards `q-card`, max-width 960px | Filas de lista, max-width 800/640px |

### 2.4 Diálogos compartidos
PIN (contraseña actual + nuevo PIN 4-6 dígitos + confirmar, validación de formato/coincidencia) · crear/editar cuenta · editar categoría con selector de cántaro.

### 2.5 Persistencia y estados
Notificaciones e idioma se guardan **optimistas y silenciosos en error** (`catch {/* silent */}` — sin feedback visual si falla). Banners: "✅ Sistema Híbrido Activado" (ingreso >0) / "⚠️ Configura tu ingreso mensual" (ingreso=0) / error de PIN en rojo. Detección automática de monedas sin tasa configurada (crea con tasa 1 y notifica, timeout 7000ms). Loaders: `q-spinner` en monedas y tasas.

---

## 3. Notificaciones — página completa + panel dropdown (2 implementaciones independientes)

### 3.1 Página `/user/notifications`
Eyebrow "Centro de mensajes" + título. Loader centrado. Vacío: "Sin notificaciones recientes". Lista: icono por tono (expense=rojo, income=verde, warning=ámbar, info=azul/gris), título, cuerpo, tiempo relativo, punto azul si `unread`, fondo resaltado si no leída. Click → `markRead(id)` **local, sin PUT al servidor**. **Sin "marcar todas como leídas"** en esta página (sí existe en el panel, ver 3.2). Sin paginación ni filtros por tipo.

### 3.2 `NotificationsPanel.vue` (campana del header)
Responsive dual: popover flotante en desktop (`fixed top:68px right:28px width:380px`), bottom-sheet full-width en mobile con backdrop blur. Cierra con click-outside/Escape. Header: título + badge "{N} sin leer" + botón "Marcar todas" (solo si hay no leídas). Filas: mismo patrón de tonos que la página completa. Footer: "Ver todas las notificaciones" → cierra y navega a `/user/notifications`. **Estado independiente** de la página completa — cada uno hace su propio `GET /notifications`, no comparten store. `markAllRead()`/`readOne()` también son **mutaciones locales**, sin persistencia al backend.

### 3.3 Hallazgo transversal a preservar como conocimiento, no como spec deseable
El estado "leída" **no persiste al backend en ninguna de las 2 implementaciones** — al recargar, probablemente todas las notificaciones vuelven a aparecer como no leídas. Si el rediseño quiere una UX confiable de "leído", esto requiere trabajo de backend, no solo de frontend — decidir si se resuelve junto con el rediseño o se documenta como limitación conocida.

---

## 4. Onboarding — 2 flujos distintos e independientes (no confundir uno con otro)

### 4.1 `OnboardingModal.vue` — elegir Lite vs Pro (primero, obligatorio)
`q-dialog persistent maximized`, fondo `bg-primary`. Título "Bienvenido a OW Finance" + subtítulo. **2 tarjetas grandes lado a lado**:
- **Lite** (`speed`, fondo blanco): "Rápida, ágil y directa al grano..." → botón "Elegir Lite".
- **Pro** (`dashboard_customize`, fondo oscuro): "Potencia máxima. Vista de escritorio, análisis detallados..." → botón "Elegir Pro".
- Al elegir: `PUT /user/settings` (`layout_mode`, `has_seen_onboarding:true`) + `window.location.reload()` completo para aplicar el layout.
- Se dispara solo si `has_seen_onboarding===false` (primera vez). **No es saltable** — sin botón de cerrar.

### 4.2 `OnboardingFlow.vue` — perfil financiero + recomendación de cántaros por IA (segundo, saltable, repetible)
7 pasos (`STEPS`), `q-dialog persistent` con barras de progreso por fase (4 segmentos) + botón cerrar (skip):
1. **`intro`**: avatar animado con anillos pulsantes, 4 fases con iconos, badges "~2 minutos" / "Privado" / "Puedes saltar". CTA "Empezar mi perfil" + "Ahora no · explorar primero".
2. **`about`**: chips (Ocupación, Rango de ingresos, Vivienda) — mismos campos que `PROMPT_REDISENO_DEUDAS_SUENOS_PERFIL.md` §3.2.
3. **`situation`**: chips (Deudas actuales, Fondo de emergencia, Relación con el dinero) — mismos que §3.3 del mismo documento.
4. **`goals`**: chips (Meta principal) + textarea "Sueño a largo plazo" + chips ("Cómo quieres sentirte") — mismos que §3.4.
5. **`recommend`**: **recomendación por IA basada en heurística** (`GOAL_TO_TEMPLATE`, mapea `main_goal` → slug de plantilla con razón textual explicativa). Banner con razón + lista de plantillas (la recomendada primero, badge "IA").
6. **`jars`**: lista completa de plantillas disponibles, saltable ("Puedes omitir esto y crear tus cántaros manualmente después").
7. **`done`**: anillo de progreso SVG animado (% de completitud sobre 8 campos) + **badge gamificado**: 🌱 Semilla (<40%) / 🌿 Brote (40-74%) / 🌳 Árbol (≥75%). CTA "Ir a mi panel".

Navegación: back button, barra de progreso por fase, panel lateral desktop ≥840px ("Tu plan se forma", muestra el plan sugerido en tiempo real). **Auto-avance** (280ms) al seleccionar el último chip de un paso — no requiere botón "Continuar" en varios casos.

Al finalizar: si eligió plantilla → `POST /jar-templates/apply`; siempre → `PUT /user/financial-profile` (todos los campos + `onboarding_profile_completed:true`) + `localStorage['ow-onboarded']='1'`. Si falla, notifica error pero **cierra igual** (no bloquea al usuario). Al saltar: solo marca `onboarding_profile_completed:true` sin guardar el resto.

**Relación entre los 2 flujos**: `OnboardingModal` (elegir modo) ocurre primero para usuarios nuevos; `OnboardingFlow` (perfil + IA) es independiente, se completa después o se repite manualmente desde Config Lite (§2.2). Flags independientes: `has_seen_onboarding` (modal) vs. `onboarding_profile_completed`/`localStorage['ow-onboarded']` (flow).

---

## 5. Tabla resumen — qué de este documento tiene diferencias Pro/Lite y qué no

| Pieza | ¿Diferencia Pro/Lite? |
|---|---|
| Asesor IA (chat) | No — mismo componente, mismo alcance en ambos modos |
| Configuración | **Sí**, sustancial (§2.3) |
| Notificaciones (página + panel) | No — mismo componente en ambos modos |
| OnboardingModal | No aplica — es el que define el modo |
| OnboardingFlow | No — mismo flujo en ambos modos, pero el botón para repetirlo solo existe en Lite (§2.2) |

---

## 6. Referencias de diseño ya existentes en `rediseno/`

- `ui_kits/lite-desktop/templates/ConfigRoute.jsx` — plantilla de referencia de Config.
- `ui_kits/lite-desktop/organisms/AIAdvisorPanel.jsx`, `NotificationsPanel.jsx`, `OnboardingFlow.jsx` — organismos de referencia para Asesor, Notificaciones y Onboarding respectivamente.
- **Carpeta `onboarding/` completa** (la más extensa del proyecto de diseño para un solo tema): `Ciclo OW.html`, `Estudio Onboarding.html`, `Modal Bienvenida.html`, `Onboarding Desktop.html`, `Onboarding Mobile.html`, `auth.jsx`, `flow-data.jsx`, `flow-desktop.jsx`, `flow.jsx`, `gamification.jsx`, `onb-atoms.jsx`, `profile-panel.jsx`, `welcome-dashboard.jsx`, `welcome-modal.jsx` — sugiere que el onboarding tuvo una fase de diseño mucho más profunda que el resto del sistema, incluyendo **gamificación explícita** (`gamification.jsx`) que en el Vue real solo aparece de forma mínima (los 3 badges 🌱/🌿/🌳 del paso `done`, sección 4.2 arriba) — vale la pena revisar si hay una versión más rica de gamificación diseñada que nunca se implementó completamente.
- `views-registry.json`: solo **`onboarding`** tiene entrada, en estado `unreviewed`. Asesor IA, Config y Notificaciones **no tienen ninguna entrada** — nunca se comparó su JSX contra el Vue real.
- `ui_kits/mobile/screens/SettingsScreen.jsx` existe en el kit mobile, pero **no hay `SettingsRoute.jsx`** a nivel desktop en `lite-desktop/templates/` — el rediseño de Config en desktop parte solo de `ConfigRoute.jsx`, sin equivalente mobile-screen dedicado más que ese.

---

## 7. Qué NO replicar / aclaraciones

- **Historial de conversaciones del Asesor IA sin UI** (§1.6) — no asumir que existe un selector; si se diseña, es trabajo nuevo sobre una API ya lista.
- **"Exportar datos" en Config Lite es un placeholder** — no funcional, solo notifica "próximamente".
- **Botón de subir avatar sin función** en Config tab Perfil (comparte el mismo placeholder que en `/user/profile`, ver `PROMPT_REDISENO_DEUDAS_SUENOS_PERFIL.md` §4.1).
- **Notificaciones "leídas" no persisten al backend** (§3.3) — no diseñar asumiendo que sí, a menos que se resuelva el backend en paralelo.
- **Toggles de notificaciones/idioma en Config fallan en silencio** — sin feedback visual de error, decisión a tomar en el rediseño (¿agregar feedback o mantener el patrón "fire and forget"?).
- La carpeta `onboarding/` en Claude Design sugiere gamificación más profunda que la implementada — no asumir que los 3 badges actuales agotan la visión de diseño; revisar `gamification.jsx` antes de descartar la idea.

---

## 8. Cómo proceder

1. Diseñar Config al final de este grupo de 4 — referencia visualmente Categorías/Cuentas/Impuestos/Tasas ya cubiertos en otros documentos, así que conviene tener esos resueltos primero.
2. Onboarding: tratar `OnboardingModal` y `OnboardingFlow` como 2 diseños separados, no fusionarlos en un solo flujo — hoy no lo son.
3. Revisar la carpeta `onboarding/` completa en Claude Design antes de diseñar el paso `done`/gamificación — puede haber más profundidad ya explorada que el Vue actual no aprovecha.
4. Usar `.owf/FEATURE_MASTER_LIST.md` sección 7 como referencia cruzada si aparecen dudas de alcance.
