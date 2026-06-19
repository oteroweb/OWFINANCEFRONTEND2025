# Iconography — OW Finance Lite Desktop

## The rule

> The Quasar project is configured with `material-icons` (the classic Material Icons filled font), **not Material Symbols**. Any icon name that depends on the Symbols set or on the `o_*` outlined prefix is unsafe and will render as a missing-glyph box in production.

Use the safe set below. If you need an icon outside the set, escalate — don't invent.

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

## Banned in this system

- **Any `o_*` prefixed name** (`o_home`, `o_receipt_long`, `o_savings`, `o_settings`, etc). These require the Outlined Material Symbols set which the Quasar project is not configured for.
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
