# Iconography — OW Finance Lite Desktop

## The rule

> The Quasar project is documented as configured with `material-icons` (the classic Material Icons filled font), **not Material Symbols**. Any icon name that depends on the Symbols set or on the `o_*` outlined prefix is *documented as* unsafe and would render as a missing-glyph box in production.

Use the safe set below. If you need an icon outside the set, escalate — don't invent.

> ⚠️ **Verification pending — the shipped code contradicts this rule.** `src/components/liquid/LiteHeaderDesktop.vue`, `LiteBottomNavDesktop.vue`, and `LiteFloatingBottomNav.vue` all render inactive nav tabs with `'o_' + icon` (`o_home`, `o_receipt_long`, `o_savings`, `o_settings`). Either the Quasar project *is* configured for outlined icons (and this rule is stale) or those tabs are rendering missing-glyph boxes today. **Do not treat the `o_*` ban as settled until the Quasar `iconSet`/font config is verified.** See `ui_kits/lite-desktop/README.md` → Open question Q2.

## Safe set

These names are verified against `material-icons` (filled) and used throughout the Lite Desktop UI kit:

| Token | Glyph | Use |
|---|---|---|
| `home` | 🏠 | Home route, primary nav |
| `receipt_long` | 🧾 | Transactions route, primary nav |
| `savings` | 🐷 | Jars route, primary nav |
| `settings` | ⚙ | Config route, primary nav |
| `notifications` | 🔔 | Header bell |
| `person` | 👤 | Avatar fallback / profile |
| `menu` | ☰ | Expanded menu trigger |
| `add` | + | Quick add CTA (the one primary action) |
| `visibility` / `visibility_off` | 👁 | Balance visibility toggle |
| `chevron_right` | › | List affordance |
| `arrow_outward` | ↗ | Outgoing transfer / external |
| `arrow_downward` | ↓ | Incoming transfer |
| `arrow_upward` | ↑ | Outgoing transfer (alt to `arrow_outward`) |
| `more_horiz` | ⋯ | Overflow on rows |
| `close` | ✕ | Dismiss menu / sheet |
| `check` | ✓ | Confirmed state |
| `search` | 🔍 | Filter on transactions |

## In use in the shipped code, pending blessing

These names appear in real `src/components/liquid/**` and the JSX kit but were **not** in the original safe-set. Most exist in classic Material Icons (filled); they need a quick confirm, then either promotion to the safe set or replacement:

| Icon | Where | Note |
|---|---|---|
| `psychology` | header assistant button, QuickActionSheet AI button | "Asesor IA" affordance. Exists in classic Material Icons. |
| `pie_chart`, `insights` | liquid panels | analysis surfaces. |
| `account_balance_wallet` | liquid panel | exists in classic Material Icons. |
| `donut_small`, `auto_awesome`, `credit_card` | kit `LiteNavPill` (Análisis / Sueños / Deudas) | secondary destinations. |
| `light_mode`, `dark_mode` | kit `LiteHeader` theme toggle | theme switch. |

## Banned in this system

- **Any `o_*` prefixed name** (`o_home`, `o_receipt_long`, `o_savings`, `o_settings`, etc). These require the Outlined Material Symbols set which the Quasar project is *documented as* not configured for. **NOTE:** the shipped nav components currently use these (see the verification warning above). Until the Quasar icon config is checked, treat this as a **conflict to resolve**, not a clean ban.
- **Emoji as system icons.** Nav, buttons, chips, status — none of these accept emoji. Currency *symbols* (`$`, `€`, `S/`) are typography, not icons, and are fine.
- **Material Symbols-only glyphs** (`account_balance_wallet` is fine because it exists in classic Material Icons too; check before adopting anything new).

## Sizes

- **24px** — default for nav, header, list rows
- **20px** — dense rows (transactions ledger)
- **32px** — hero affordances (the `add` CTA inside the floating nav pill)
- **16px** — inline with body text (rare)

## Color

Icons inherit `currentColor` and take their color from the parent text role:
- Default nav: `--fg-2`
- Active nav: `--brand-primary`
- Destructive: `--expense`
- Positive: `--income`

Never hardcode an icon color.

## Loading

The Quasar host already loads `material-icons`. In the UI kit demo (`ui_kits/lite-desktop/index.html`), the same font is loaded from Google Fonts CDN:

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

Usage:

```html
<span class="material-icons">home</span>
```

## What about logos and illustrations?

- **Logo:** see `assets/logos/`. The placeholder marks here are simple geometric stand-ins until the real OW Finance logo is delivered. **Substitution flagged — please attach the brand mark.**
- **Empty state illustrations:** none exist in the system yet. Empty states in the UI kit use a calm text-only treatment (`No transactions yet.` / `Add your first jar.`) intentionally.
- **No decorative SVG.** Don't draw illustrative SVGs to fill space.
