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

## What this kit deliberately doesn't have

- Sidebar (Lite philosophy)
- Search bar in the header (lives inside Transactions)
- Tabs in the header (use route switching instead)
- AI / QR / voice as nav destinations (those are Pro)
- Pro-style data-dense table on Transactions

## Iterating

Add new route screens under `routes/`. Keep components atomic (one concept per file). Tokens come from `../../colors_and_type.css` — no inline hex values inside components.
