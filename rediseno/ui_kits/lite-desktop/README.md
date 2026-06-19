# Lite Desktop UI Kit

The interactive reference for the missing `LiteDesktopLayout.vue` in the OW Finance frontend. Open `index.html` for the full 4-route demo with Light/Dark toggle.

## What's in here

| File | Role |
|---|---|
| `index.html` | Demo shell. Loads React + Babel, renders the active route, exposes Light/Dark + route switches. |
| `LiteShell.jsx` | Page frame. Header + content area + floating nav pill + expanded menu + quick-add sheet. |
| `LiteHeader.jsx` | Top header — greeting, avatar, currency chip, visibility toggle, notifications, menu. |
| `LiteNavPill.jsx` | The floating horizontal nav pill (4 destinations + quick-add CTA). |
| `ExpandedMenu.jsx` | Contextual popover from the menu button. Profile / preferences / help / sign out. |
| `QuickAddSheet.jsx` | Modal sheet for the one primary action. |
| `HeroBalance.jsx` | Big balance card. Used on Home. |
| `JarsPreview.jsx` | 3-up jar tile row used on Home. |
| `JarsFullGrid.jsx` | Larger jars grid used on the Jars route. |
| `RecentTransactions.jsx` | List of recent movements. Used on Home and (denser) on Transactions. |
| `routes/HomeRoute.jsx` | `/user/home` — hero + jars + recent tx |
| `routes/TransactionsRoute.jsx` | `/user/transactions` — denser ledger |
| `routes/JarsRoute.jsx` | `/user/jars` — full jar grid + summary |
| `routes/ConfigRoute.jsx` | `/user/config` — calm settings list |
| `Buttons.jsx`, `Chips.jsx`, `Bits.jsx` | Shared atoms. |

## How the demo navigates

- Click the **nav pill** (bottom-center) to switch routes.
- Click the **menu icon** in the header (or the **avatar**) to open the expanded contextual menu.
- Click the **`+` CTA** in the nav pill (or **Quick add** anywhere) to open the quick-add sheet.
- Click the **🌗 toggle** in the very top-right of the demo to flip light/dark.
- Click the **visibility icon** in the header to mask all amounts.

This is a click-thru prototype — values are static, but every chrome interaction works.

## Recent additions (perfil · onboarding · pagos compuestos)

| File | Role |
|---|---|
| `templates/ProfileRoute.jsx` | **Perfil** — personal data the user fills (identity / contact / location) with a completeness meter. Reached from Config → *Perfil*. |
| `templates/FinancialProfileRoute.jsx` | **Mi perfil financiero** — perfilado para el **asesor IA** (fuente: `docs/00-sistema/DESIGN_PROMPT_ONBOARDING.md`). 4 cards de chips de selección única: *Quién soy* (ocupación · ingreso · convivencia), *Situación financiera* (deudas · fondo emergencia · relación con el dinero), *Metas y sueños* (meta principal · sueño libre · palabra emocional) y *Mis cántaros* (selector de plantilla + tabla editable con propósito). Reached from Config → *Mi perfil financiero*. |
| `organisms/OnboardingFlow.jsx` | Wizard post-creación de cuenta: bienvenida (Lite/Pro) → quién eres → situación → metas → cántaros → listo. Pasos 1–4 con *Saltar*. Launched from Config → *Repetir configuración inicial* or `window.__owStartOnboarding()`. |
| `molecules/ChipGroup.jsx` · `organisms/JarsConfig.jsx` · `data/profile-data.jsx` | Bloques compartidos: chips de selección, selector de plantilla de cántaros + tabla editable, y los datos del perfilado (`PROFILE_FIELDS`, `JAR_TEMPLATES`, `AI_PROFILE`). |

Both desktop shells (`LiteShell`, `ProShell`) route `profile` / `finprofile` and render the onboarding overlay. `ConfigRoute` takes `onGo(route)` + `onStartOnboarding()`.

### TransactionForm corrections (legacy "pago avanzado")

- **Pago compuesto / múltiples cuentas** now exposes an editable **Tasa** column per payment row (`USD→<moneda>`), pre-filled with the user's current rate; USD rows lock the rate at `1.00`. Each row shows its **Resultado** converted to the USD base. (`TfPaymentsEditor`.)
- **El cántaro está anclado a la categoría.** The free jar picker is gone from the Pro form — the cántaro is **derived from the chosen category** (`SAMPLE_CATEGORIES[].jarId`) and shown read-only (`AnchoredJar` for the header, `TfItemJar` per invoice line). Lite keeps its jar-first quick flow.

## What this kit deliberately doesn't have

- Sidebar (Lite philosophy)
- Search bar in the header (lives inside Transactions)
- Tabs in the header (use route switching instead)
- AI / QR / voice as nav destinations (those are Pro)
- Pro-style data-dense table on Transactions

## Iterating

Add new route screens under `routes/`. Keep components atomic (one concept per file). Tokens come from `../../colors_and_type.css` — no inline hex values inside components.
