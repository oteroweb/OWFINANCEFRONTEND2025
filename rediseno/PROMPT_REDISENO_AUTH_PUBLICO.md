# Prompt de Rediseño — Autenticación y Sitio Público (Marketing)

<!-- Generado: 2026-07-21. Fuente: auditoría de código fuente (LoginPage.vue, LoginMobileView.vue, RegisterPage.vue, ForgotPasswordPage.vue, ResetPasswordPage.vue, LandingPage.vue, LandingHeroMobile.vue, FeaturesPage.vue, PricingPage.vue, MatrixPage.vue) + `.owf/FEATURE_MASTER_LIST.md` sección 9 + verificación de git log (sin cambios desde la auditoría base). -->
<!-- Uso: pegar este documento completo como contexto al iniciar el rediseño de `/login`, `/register`, `/forgot-password`, `/reset-password`, `/`, `/funciones`, `/planes`, `/matriz`. Menor prioridad que los 7 módulos de usuario ya cubiertos. -->

## Objetivo

Rediseñar 2 grupos: **Autenticación** (login/registro/recuperación) y **Sitio público de marketing** (landing, features, pricing, matriz de comparación). Ambos comparten `PublicLayout.vue`/`MainLayout.vue`, pero conceptualmente son distintos — Auth es funcional, Marketing es persuasivo. El hallazgo más importante de este documento es una **inconsistencia real de contenido entre 2 páginas de marketing** (sección 4) que conviene resolver antes de diseñar, no después.

---

## 1. Autenticación

### 1.1 `LoginPage.vue` (desktop, con fallback a `LoginMobileView.vue` en mobile)
- Split screen: panel izquierdo de marca (mockup de balance + cántaros), panel derecho con formulario.
- Tabs Iniciar sesión / Crear cuenta (mismo componente — el campo `name` se oculta en modo login).
- Campos: nombre (solo registro), correo, contraseña (toggle mostrar/ocultar), **medidor de fuerza de contraseña** (4 segmentos, solo en registro — mismo patrón que `ChangePasswordCard.vue`, ver `PROMPT_REDISENO_DEUDAS_SUENOS_PERFIL.md` §5), checkbox "Recuérdame" (solo login), link "¿Olvidaste tu contraseña?".
- Botón submit dinámico ("Entrar" / "Crear cuenta").
- **Botones sociales decorativos (Google, Apple) — sin funcionalidad real** (`@click.prevent`), no confundir con integración real de OAuth.
- Toggle de tema claro/oscuro.
- Sección de descarga de APK Android (link externo).
- Envío: registro → `POST /auth/register` → `/user`; login → `auth.login()` del store → `/admin` o `/user` según rol; guarda credenciales para biometría si el dispositivo lo soporta.

### 1.2 `LoginMobileView.vue`
Misma lógica de login/registro, sin panel de marca, con **botón de login biométrico** (Face ID/Touch ID/huella vía `capacitor-native-biometric`) si el dispositivo lo soporta.

### 1.3 `RegisterPage.vue`
**No es una página real** — solo hace redirect inmediato a `/login?tab=register`. Toda la lógica de registro vive en `LoginPage`/`LoginMobileView` (sección 1.1/1.2). Si el rediseño trata esto como una página independiente, va a diseñar algo que nunca se renderiza.

### 1.4 `ForgotPasswordPage.vue`
Split screen con marca. Un solo campo (email) + botón "Enviar enlace de recuperación". Estado de éxito post-envío ("Revisa tu correo"). `POST /auth/forgot-password`.

### 1.5 `ResetPasswordPage.vue`
Split screen. Email (prellenado y deshabilitado si viene por query param), nueva contraseña (con medidor de fuerza), confirmar contraseña. Toma `token`/`email` de query params (flujo estándar Laravel). Banner de error global. Estado de éxito ("¡Listo!"). `POST /auth/reset-password`.

---

## 2. Sitio Público (Marketing)

### 2.1 `LandingPage.vue` (+ `LandingHeroMobile.vue` en mobile)
Secciones en orden: Hero ("Tu dinero, en claro", CTA "Empieza gratis"/"Ver funciones", mockup) · Trust strip (5 formas de registrar, 3 monedas, 2 modos, ∞ cántaros) · Cántaros (reparto automático %, plantilla 55/10/10/10/10, metas, transferencias) · Sueños (metas con progreso visual) · Transacciones IA (5 formas de registrar + botón "Agregar" destacado) · Análisis (donut + insight en lenguaje natural) · Modos Lite & Pro (comparación 2 columnas) · Features grid (multimoneda real, claro/oscuro, modo privacidad, ítems por línea, transferencias, portabilidad Lite↔Pro) · CTA final (banda azul marino).

`LandingHeroMobile.vue` es una pantalla de bienvenida mobile-only tipo "entry gate" — logo, título, 3 bullets, 2 CTAs (Crear cuenta / Iniciar sesión). **No repite el resto del landing** — es una pieza distinta, no un resumen responsive de la misma página.

### 2.2 `FeaturesPage.vue` — catálogo completo de features de marketing
Nav de anclas: Cántaros, Sueños, Transacciones, Análisis, Cuentas & monedas, Lite vs Pro.
- **Cántaros**: reparto %/monto fijo, plantilla 55/10/10/10/10, meta de ahorro, transferencias entre cántaros; (Pro: ajustes manuales, apalancamiento, histórico por ciclos).
- **Sueños**: una meta por sueño, progreso combinado, marcar prioridades.
- **Transacciones**: Escribe, Dicta por voz, Foto del recibo (OCR), Automático, Carga masiva, Ítems & impuestos (Pro: split por ítem, IGTF 3%, reparto por cántaro).
- **Análisis**: distribución por cántaro, presupuesto vs. real con sobre-gastos resaltados, navegación por mes/trimestre/año.
- **Cuentas y monedas** (etiquetado "Pro"): multi-cuenta, multimoneda, transferencias cross-currency, cuentas compartidas (con permisos), impuestos (IGTF 3%, Pago Móvil), pago múltiple/split.
- **Comparativa Lite vs Pro** (tabla): ver tabla completa en sección 4 de este documento.

### 2.3 `PricingPage.vue`
Toggle mensual/anual (-20% anual). 3 planes: **Gratis** ($0, cántaros/sueños, registro texto/voz/foto, análisis básico, 1 moneda) · **Plus** ($6/mes o $5 anual, "Recomendado" — + multi-moneda, multi-cuenta, carga masiva, ítems por línea, análisis avanzado, transferencias cross-currency) · **Familiar** ($12/mes o $10 anual, hasta 5 personas — + cuentas compartidas, apalancamiento, histórico por ciclos, soporte prioritario). Nota aclaratoria explícita: *"Lite y Pro son modos, no planes"* — todos los planes incluyen ambos. FAQ (6 preguntas). CTA final.

### 2.4 `MatrixPage.vue` — matriz técnica más detallada
2 tarjetas de filosofía (Lite: simplicidad/velocidad/mobile-first/"billetera implícita" vs Pro: control total/trazabilidad/desktop denso/multi-cuenta+multimoneda). Leyenda: Disponible/Simplificado/No disponible. Tabla por secciones (Cántaros, Transacciones, Cuentas & Monedas, Análisis). Nota: Lite y Pro comparten la misma base de datos; cambiar de modo no altera datos.

---

## 3. Confirmación de feature-gating real (importante para Pricing)

⚠️ **`PricingPage.vue` describe features Plus/Familiar (multi-moneda, multi-cuenta, cuentas compartidas, apalancamiento) como si estuvieran gateadas por plan de pago** — pero, tal como se documentó en `PROMPT_REDISENO_HOME.md` §2.11 y en `.owf/FEATURE_MASTER_LIST.md` §0/§10, **no existe lógica de feature-gating por plan en el código real hoy**: `layout_mode` (Pro/Lite) es una preferencia libre de usuario, sin chequeo de suscripción. Esto significa que `PricingPage.vue` describe un modelo de negocio que el frontend **todavía no aplica técnicamente** — cualquier usuario puede activar Pro y usar todas sus features sin pasar por un paywall real. **Esto no es un problema de diseño, es un hallazgo de producto/ingeniería**: si el rediseño de Pricing se toma literalmente, hay que confirmar con producto si el paywall se va a implementar, o si Pricing sigue siendo aspiracional por ahora.

---

## 4. Inconsistencia confirmada entre `FeaturesPage.vue` y `MatrixPage.vue` (resolver antes de diseñar, no durante)

Ambas páginas listan qué es "Disponible"/"Simplificado"/"No disponible" en Lite vs Pro para las mismas features, pero **no siempre coinciden**:

| Feature | `FeaturesPage.vue` | `MatrixPage.vue` |
|---|---|---|
| Transferir entre cántaros | "Parcial en Lite, completo en Pro" | Marcada como disponible completo en ambos (tabla de Cántaros) |
| Carga masiva | Mencionada sin marcar explícitamente como "simplificada" en Lite | Marcada explícitamente "Simplificado" en Lite |

Esta tabla es un resumen — antes de diseñar la sección de comparación Lite/Pro, releer ambas páginas fuente (`FeaturesPage.vue` sección "Lite vs Pro", `MatrixPage.vue` tabla completa) línea por línea y decidir **un único mensaje canónico**, verificado contra el comportamiento real documentado en los 7 prompts de módulos de usuario ya generados (especialmente `PROMPT_REDISENO_CANTAROS.md` y `PROMPT_REDISENO_TRANSACCIONES.md`, que sí tienen el detalle técnico exacto de qué es Pro-only).

---

## 5. Qué NO replicar / aclaraciones

- **`RegisterPage.vue` no es una página real** (§1.3) — no diseñarla como si lo fuera.
- **Botones sociales de login (Google/Apple) son decorativos**, sin OAuth real conectado — si el rediseño los mantiene visualmente, dejar claro que es aspiracional, no funcional.
- **Pricing describe feature-gating que no existe técnicamente** (§3) — confirmar con producto antes de comprometer el diseño a un modelo de paywall que el backend no aplica hoy.
- **No fusionar `FeaturesPage.vue` y `MatrixPage.vue`** sin antes resolver sus inconsistencias (§4) — diseñar sobre contenido contradictorio produce una página bonita pero incorrecta.

---

## 6. Referencias de diseño ya existentes en `rediseno/`

- `OW Finance - Landing.html`, `OW Finance - Login.html`, `OW Finance - Funciones.html`, `OW Finance - Planes.html` — documentos HTML de referencia visual para landing, login, features y pricing respectivamente.
- **Sin JSX interactivo dedicado** para estas páginas en `ui_kits/` (a diferencia de las vistas de usuario) — son solo HTML de referencia estática.
- `views-registry.json`: solo **`landing`** tiene entrada, en estado `unreviewed`. Login, register, forgot/reset password, features, pricing y matrix **no tienen ninguna entrada**.
- `OW Finance - Roadmap y pendientes.html`, `OW Finance - Pendientes.html` — documentos de contexto adicional sobre planes futuros del marketing, útiles como research pero no como spec de esta iteración.

---

## 7. Cómo proceder

1. Resolver la inconsistencia de la sección 4 (releer ambas páginas fuente) antes de diseñar la comparación Lite/Pro — es contenido, no estética.
2. Confirmar con producto el alcance real de feature-gating (sección 3) antes de comprometer el diseño de Pricing a un modelo de paywall.
3. Auth: diseñar login/registro como una sola pantalla con tabs (reflejando la realidad del código, sección 1.1) — no como 2 páginas separadas.
4. Usar `.owf/FEATURE_MASTER_LIST.md` sección 9 como referencia cruzada si aparecen dudas de alcance.
