# Lite Desktop UI Kit

The interactive structural reference for OW Finance's **Lite Desktop** experience. The shipped Vue shell is `src/layouts/LiteDesktopLayout.vue` (it already exists — this kit is its living reference, not a spec for missing work). Open `index.html` for the multi-route demo with Light/Dark toggle.

## File map (actual structure)

The kit is organized atoms / molecules / organisms / shells / templates.

| Path | Role |
|---|---|
| `index.html` | Demo shell. Loads React + Babel, renders the active route, exposes Light/Dark + route switches. |
| `shells/LiteShell.jsx` | Page frame: header + content area + floating nav pill + expanded menu + quick/smart modals + AI panel + notifications. |
| `shells/ProShell.jsx` | Pro page frame (out of Lite scope; lives here for cross-reference). |
| `organisms/LiteHeader.jsx` | Top header — greeting, avatar, currency chip, visibility toggle, theme toggle, notifications, menu. |
| `organisms/LiteNavPill.jsx` | Floating horizontal nav pill (7 destinations + quick-add CTA). **Kit-only — see reconciliation below.** |
| `organisms/ExpandedMenu.jsx` | Contextual popover from the menu button. |
| `organisms/HeroBalance.jsx` | Big balance card. Used on Home. |
| `organisms/JarsPreview.jsx` | Jar tile row used on Home. |
| `organisms/RecentTransactions.jsx` | List of recent movements. Home (compact) and Transactions (denser). |
| `organisms/DreamsPreview.jsx`, `DebtsPreview.jsx` | Home previews for the secondary destinations. |
| `organisms/DesktopQuickModal.jsx`, `SmartTransactionModal.jsx`, `AIAdvisorPanel.jsx` | The quick-add flow + AI advisor. |
| `organisms/NotificationsPanel.jsx`, `AccountsPanel.jsx`, `ExchangeRatesWidget.jsx`, … | Supporting panels. |
| `atoms/Buttons.jsx` | `PillButton`, `IconButton`. |
| `atoms/Chips.jsx` | `CurrencyChip`, `StatusChip`. |
| `atoms/Primitives.jsx` | Low-level bits. |
| `molecules/FormControls.jsx`, `SectionHeader.jsx` | Shared molecules. |
| `templates/HomeRoute.jsx` | `/user/home` — hero + jars + dreams + debts + recent tx |
| `templates/TransactionsRoute.jsx` | `/user/transactions` — denser ledger |
| `templates/JarsRoute.jsx` | `/user/jars` |
| `templates/ConfigRoute.jsx` | `/user/config` |
| `templates/AnalisisRoute.jsx`, `DreamsRoute.jsx`, `DebtsRoute.jsx` | Secondary destinations |
| `templates/Pro*Route.jsx` | Pro routes (cross-reference) |
| `data/` | Sample data + i18n for the demo. |

## How the demo navigates

- Click the **nav pill** (bottom-center) to switch routes.
- Click the **menu icon** in the header (or the **avatar**) to open the expanded contextual menu.
- Click the **`+` CTA** to open the quick-add / smart-transaction flow.
- Click the **theme toggle** in the header to flip light/dark.
- Click the **visibility icon** in the header to mask all amounts.

This is a click-thru prototype — values are static, but every chrome interaction works.

---

## JSX (kit) ↔ Vue (shipped) reconciliation

Source of truth per row: **DS** when the kit encodes a deliberate Lite UX decision the code should follow; **Code** when the kit was merely drifted/stale; **Open** when the divergence is structural and needs a human decision (logged in §Open questions).

| Kit (jsx) | Shipped Vue | Divergence | Source of truth | Action |
|---|---|---|---|---|
| `shells/LiteShell.jsx` | `layouts/LiteDesktopLayout.vue` | Shell exists in both. Kit = React click-thru; Vue = Quasar `q-layout`. Vue adds a bottom **status pill** (`dte-status-pill`: jar status + menu + visibility) the kit doesn't model. | Code (layout is shipped) | Kit kept as structural reference; status pill noted as a real shell element. |
| `organisms/LiteHeader.jsx` | `components/liquid/LiteHeaderDesktop.vue` | Kit header = greeting + avatar + chips + 5 icon buttons, **no nav**. Vue header = logo + **embedded 4-tab nav** + interval selector + `+`/assistant/notifications/avatar. | **Open** | Vue puts primary nav *in the header*; kit puts it in a floating pill. See Q1. |
| `organisms/LiteNavPill.jsx` | `components/liquid/LiteFloatingBottomNav.vue` (mobile) / `LiteBottomNavDesktop.vue` (unused by desktop layout) | Kit = bottom floating pill, **7 destinations + quick-add**. Closest Vue floating nav has **4 destinations + FAB** and is on the mobile/floating path; `LiteDesktopLayout` renders **no** nav pill. | **Open** | The desktop layout's nav lives in the header, not a pill. See Q1. |
| `organisms/ExpandedMenu.jsx` | `components/liquid/ExpandedNavigationMenuLight.vue` | Kit = popover with profile/prefs/help/sign-out. Vue = `aside` card with `items[]` prop + `select` event. Shapes differ but role matches. | Code (props) | Kit treated as visual ref; real prop contract is `items`/`select`. |
| `organisms/HeroBalance.jsx` | `components/liquid/LiquidBalanceCard.vue` | Both render the hero balance. Kit takes `amount/currency/hidden/delta/asOf`; Vue is `LiquidBalanceCard`. | Code (component name) | Map HeroBalance → `LiquidBalanceCard`. |
| `organisms/JarsPreview.jsx` | `components/liquid/LiquidJarCard.vue` (tile) | Kit = 3-up preview row; Vue exposes the per-jar card `LiquidJarCard`, composed by the route. | Compatible | Map JarsPreview tile → `LiquidJarCard`. |
| `organisms/RecentTransactions.jsx` | `components/liquid/LiquidTransactionItem.vue` (row) | Kit = whole list; Vue exposes the row `LiquidTransactionItem`. | Compatible | Map row → `LiquidTransactionItem`; list assembled in route/page. |
| `atoms/Buttons.jsx` (`PillButton`,`IconButton`) | Quasar `q-btn` + custom `.dte-header__btn-*` buttons | Kit atoms are React; Vue uses native buttons + `q-btn`. Pill radius / one-CTA intent honored. | DS (intent) | Kit = token/shape reference; Vue keeps native buttons. |
| `atoms/Chips.jsx` (`CurrencyChip`,`StatusChip`) | `LiquidCategoryChip.vue` | Vue chip = category chip; currency chip is inline in header. | Compatible | Map StatusChip/CurrencyChip → `LiquidCategoryChip` + header inline. |
| `templates/HomeRoute.jsx` | Home page (route `/user/home`) | Kit Home = hero + jars + **dreams + debts** + recent tx. Real Home shows header interval selector (`showIntervalMenu`). | Code | Kit Home is richer (dreams/debts previews); keep as forward target. |
| `templates/TransactionsRoute.jsx` | `/user/transactions` page | Denser ledger in both. | Compatible | Reference only. |
| `templates/JarsRoute.jsx` | `/user/jars` page | Jar grid in both. | Compatible | Reference only. |
| `templates/ConfigRoute.jsx` | `/user/config` page | Calm settings list in both. | Compatible | Reference only. |

---

## What this kit deliberately doesn't have

- Persistent Pro-style sidebar (Lite philosophy).
- Search bar in the header (lives inside Transactions).
- AI / QR / voice as *primary nav* destinations (those are Pro / secondary).

## Open questions (need a human decision — do NOT silently change app logic)

**Q1 — Nav posture: floating pill (kit) vs. header-embedded tabs + bottom status pill (shipped).**
The DS Lite UX commandment says "no persistent sidebar; Lite uses a floating horizontal nav pill." The shipped `LiteDesktopLayout.vue` instead places the 4 primary tabs *inside* `LiteHeaderDesktop`, and the bottom floating element is a **status pill** (jar health + menu + visibility), not a nav pill. The `LiteFloatingBottomNav.vue` / `LiteBottomNavDesktop.vue` components exist but are not wired into the desktop layout. This is not a sidebar, so it doesn't violate the no-sidebar rule — but it *does* diverge from the kit's "nav lives in a floating pill" model. **Decide which is canonical** and align the loser. (Header-tabs may also brush the ui_kit guidance "no tabs in the header — use route switching.")

**Q2 — `o_*` outlined icons in shipped Vue vs. ICONOGRAPHY safe-set.**
`LiteHeaderDesktop.vue`, `LiteBottomNavDesktop.vue`, and `LiteFloatingBottomNav.vue` render inactive tabs with `'o_' + icon` (`o_home`, `o_receipt_long`, `o_savings`, `o_settings`). `ICONOGRAPHY.md` **bans `o_*`** because the Quasar project is documented as `material-icons` (filled), not Symbols/Outlined. Either (a) the project is actually configured for outlined icons and the doc is wrong, or (b) these tabs render missing-glyph boxes in production. **Verify the Quasar icon config** and fix whichever side is wrong. ICONOGRAPHY.md now flags this; it has not been "blessed."

**Q3 — Icons used in code but absent from the safe-set:** `psychology` (assistant/AI), `pie_chart`, `insights`, `account_balance_wallet`, plus kit-only `donut_small`, `auto_awesome`, `credit_card`, `light_mode`, `dark_mode`. Most exist in classic Material Icons, but they were never added to the documented safe-set. ICONOGRAPHY.md now lists them in an "in use, pending blessing" section.

## Iterating

Add new route screens under `templates/`. Keep components atomic. Tokens come from `../../colors_and_type.css` — no inline hex values inside components.
