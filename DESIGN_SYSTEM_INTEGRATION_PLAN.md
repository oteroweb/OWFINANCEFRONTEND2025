# Plan de Integración — OW Finance Design System → Frontend Quasar

> **Alcance:** Lite + Pro (sistema completo).
> **Fuente de diseño:** `OW Finance Design System/` (tokens, fuentes Satoshi, UI kit JSX de referencia, 71 screenshots, reglas).
> **Estado de arranque:** entorno local estable — backend `:8000` + frontend `:3000`, login e2e OK (`user@demo.com` / `password`).
> **Creado:** 2026-06-08 · **Dueño:** Jose Luis Otero

---

## 0. Diagnóstico de partida (verificado en vivo)

| Hecho | Evidencia | Implicación |
|-------|-----------|-------------|
| Los layouts Vue **ya existen** (`LiteDesktopLayout`, `LiteMobileLayout`, `ProLayout`) | `src/layouts/` | El trabajo es **reskin/reconciliación**, no crear de cero. El README del DS estaba desactualizado. |
| `LiteDesktopLayout` se **renderiza roto** en desktop (nav superior solapado) | screenshot login→Lite | Target principal de la Fase 1. |
| "Elegir Pro" está **deshabilitado** en el onboarding | OnboardingModal | Pro no construido → Fase 3 (TECH-LP-03). |
| El tema actual contradice el DS | `src/css/app.scss` | Cyan `#0ea5e9` vs navy `#1E3A8A`; Outfit vs Satoshi; gradientes+glass vs flat no-border. **Conflicto a resolver en Fase 0.** |
| `tokens.css` navy existe pero **huérfano** | `src/css/tokens.css` (no importado) | Fase 0 lo consolida con `colors_and_type.css`. |
| Git rastrea duplicados por casing | `src/pages/{User,user,Admin}` | Rompe vue-tsc/CI (overlay desactivado como paliativo). Fase 5. |

### Reglas no negociables del DS (gobiernan cada fase)
- **Navy `#1E3A8A` es primary.** Cyan `#0EA5E9` solo es acento de info (nunca CTA en Lite).
- **Satoshi** (display/montos, tabular-nums) + **DM Sans** (body). Outfit se retira.
- **Sin bordes 1px** como marco dominante → elevación / contraste de superficie.
- **Sin glassmorphism en Lite Desktop** (sí permitido en hero modals mobile y popover de menú).
- **Sentence case** en chrome; all-caps solo en meta-labels (`AVAILABLE`, `USD`).
- **Iconos:** Material Icons safe-set (`ICONOGRAPHY.md`). Cero emoji como iconografía.
- Montos: `$ 12,480.50`, minus real `−`, estado oculto `••••••`.

---

## Fases (cada una verificable en browser vía preview)

### FASE 0 — Fundaciones: tokens, tipografía, reset del tema viejo
*Habilita todo lo demás. Sin esto, el reskin pelea contra el tema cyan.*

| ID | Tarea | Detalle |
|----|-------|---------|
| **DS-01** | Portar tokens completos | Llevar `colors_and_type.css` (primitivos + semánticos light/dark) a `src/css/`. Consolidar/retirar el `tokens.css` huérfano. |
| **DS-02** | Self-host fuentes | Copiar `Satoshi-Variable.woff2` + `Satoshi-Regular.woff2` a `src/css/fonts/`, declarar `@font-face`; cargar DM Sans. Retirar Outfit. |
| **DS-03** | Alinear Quasar | `quasar.variables.scss`: `$primary: #1E3A8A` (navy), `$info: #0EA5E9`, positivo/negativo/warning del DS. Afecta todos los componentes `q-*`. |
| **DS-04** | Retirar tema "glass cyan" | Neutralizar gradientes radiales, `glass-panel`, `shell-surface` border-1px de `app.scss` según reglas DS (flat, no-border en Lite desktop). Mantener clases usadas, re-mapeadas a tokens nuevos. |

**Verificación:** Login + Home Lite renderizan con navy/Satoshi/superficies planas, sin romper componentes existentes.

---

### FASE 1 — Shell Lite Desktop (cierra el gap visible)
*Arregla el nav solapado. Referencia: `ui_kits/lite-desktop/shells/LiteShell.jsx`.*

| ID | Tarea | Referencia kit |
|----|-------|----------------|
| **DS-10** | Reskin `LiteDesktopLayout.vue` | `LiteShell.jsx`: header no-sticky, **nav pill flotante** inferior, `max-width: 1200px`, padding 32px. |
| **DS-11** | Componentes de shell | `LiteHeader.jsx`, `LiteNavPill.jsx`, `ExpandedMenu.jsx` → `src/components/lite/*`. 4 destinos: Home, Transactions, Jars, Config. |
| **DS-12** | Empty states (**BUG-008**) | Vistas Lite vacías con ilustración + CTA calmada (`assets/placeholders/`). |

**Verificación:** nav sin solaparse; 4 rutas navegables; posture desktop (no mobile estirado).

---

### FASE 2 — Rutas y organismos Lite
*Referencia: `ui_kits/lite-desktop/templates/` + `organisms/`.*

| ID | Tarea | Organismos |
|----|-------|-----------|
| **DS-20** | Home Lite | `HeroBalance` (balance + visibilidad), `JarsPreview`, `RecentTransactions`. |
| **DS-21** | Transactions Lite | `TransactionsRoute` + `RecentTransactions` (hairline permitido en ledger denso). |
| **DS-22** | Jars Lite | `JarsRoute` + `JarsPreview` (cántaros). |
| **DS-23** | Config Lite | `ConfigRoute` + `FormControls`. |
| **DS-24** | Quick Add | `SmartTransactionModal` / `DesktopQuickModal` — la única CTA Lite. |
| **DS-25** | Lite **Mobile** | `ui_kits/mobile/` — paridad de tokens con desktop (no rediseño estructural). |

**Verificación:** cada ruta contra su screenshot de referencia.

---

### FASE 3 — Pro: construir + gating funcional (entrelaza TECH-LP-*)
*Referencia: `shells/ProShell.jsx`, `templates/ProHomeRoute.jsx`, `ProAnalisisRoute.jsx`.*

| ID | Tarea | Ledger |
|----|-------|--------|
| **DS-30** | Construir `ProHomeView` | **TECH-LP-03** — desbloquea "Elegir Pro". `ProHomeRoute.jsx` + `ProShell.jsx`. |
| **DS-31** | Gating funcional por `layout_mode` | **TECH-LP-01** — Lite limita funciones (no solo densidad) en transacciones y menú. |
| **DS-32** | Billetera implícita Lite | **TECH-LP-02** — auto-crear/seleccionar, `account_id` NOT NULL; migrable a Pro. |
| **DS-33** | Transición Lite↔Pro sin pérdida | **TECH-LP-04** — reversible, ocultar no borrar. |
| **DS-34** | Rutas Pro restantes | Transactions super-grid, Jars management, Settings, Análisis (densidad alta, sidebar Pro permitido). |

**Verificación:** toggle Lite↔Pro sin pérdida de datos; Pro navegable.

---

### FASE 4 — Dark mode + pulido (entrelaza TECH-004)

| ID | Tarea | Ledger |
|----|-------|--------|
| **DS-40** | Dark mode | **TECH-004** — ramp `ink` (S1–S4) del DS; contraste de superficie, no inversión. |
| **DS-41** | Iconografía safe-set | `ICONOGRAPHY.md`; eliminar emoji como iconografía. |
| **DS-42** | Microinteracciones | 150–220ms, easing `cubic-bezier(.2,.8,.2,1)`, focus 2px navy visible. |

**Verificación:** toggle light/dark en las rutas clave (preview_resize + dark).

---

### FASE 5 — Deuda técnica / higiene (habilitadores)

| ID | Tarea | Ledger |
|----|-------|--------|
| **DS-50** | Normalizar casing git `User`/`user`/`Admin` | Desbloquea vue-tsc/CI limpio → reactivar overlay del checker. Operación quirúrgica de git (doble-rename). |
| **DS-51** | Tests | **TECH-002** — Vitest (snapshot tokens), Playwright (4 rutas Lite + Pro home). |
| **DS-52** | i18n ES/EN consistente | **BUG-006** — todo copy nuevo del DS en ambos idiomas. |

---

## Mapa con el ledger existente

| Ledger | Absorbido por |
|--------|---------------|
| DESIGN-001 (rediseño kit) | **Todo este plan** (desbloqueado: kit ya local) |
| TECH-LP-01 / 02 / 03 / 04 | DS-31 / DS-32 / DS-30 / DS-33 (Fase 3) |
| TECH-004 (dark mode) | DS-40 (Fase 4) |
| BUG-008 (Lite vistas vacías) | DS-12 (Fase 1) |
| BUG-006 (i18n ES/EN) | DS-52 (Fase 5) |
| TECH-002 (tests) | DS-51 (Fase 5) |

**No tocados por este plan** (siguen en el ledger): MANUAL-001 (API key AI), MANUAL-002 (deploy staging), OPS-001 (sync DB), TECH-001 (UI asesor IA), TECH-003 (password reset), WEEK2-*, INFRA-*, BUG-001..005/007.

---

## Convenciones de ejecución
- **Una fase = un lote verificable.** Cada tarea se valida en el browser (preview) contra el screenshot del kit antes de avanzar.
- **Tokens primero, siempre.** Ningún componente hardcodea hex; consume variables CSS.
- **No romper runtime.** El typecheck overlay queda off hasta DS-50; el typecheck sigue en terminal/build.
- **Backend dev local** se arranca con `PHP_INI_SCAN_DIR=":/tmp/owfinance-php-dev"` (silencia deprecations PHP 8.5 sin tocar `config/database.php`).
