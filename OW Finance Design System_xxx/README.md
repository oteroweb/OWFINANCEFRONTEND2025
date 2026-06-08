# OW Finance 2026 — Design System

A premium personal finance product. This design system documents the **canonical Lite Desktop** experience (Light + Dark) plus the shared visual foundations that Lite and Pro both consume.

> Lite and Pro are the **same product, same brand, same design system.** They differ in **density and layout posture** — never in color, type, or voice.

---

## 1. Product context

OW Finance has two layout modes:

- **Lite** — calm, low-density, money-first. For users who want to glance at balance, see jars, log an action, and leave. Progressive disclosure is the default.
- **Pro** — denser, multi-pane, more simultaneous controls. For power users who want a Bloomberg-style command surface.

Current state (verified against the frontend, branch `dev`): `DynamicRoleLayout.vue` selects the layout by `auth.settings.layout_mode`. For `lite` it now branches on viewport — `$q.platform.is.desktop || $q.screen.gt.sm` → **`LiteDesktopLayout.vue`** (which already exists), otherwise `LiteMobileLayout.vue`. The desktop Lite shell is therefore **implemented, not missing**; this system is its living reference and the place where structural drift between kit and code is reconciled.

> **Reality note (kit vs. code).** The JSX kit in `ui_kits/lite-desktop/` has grown past the original 4-route Lite scope: it now models 7 destinations (Home, Movimientos, Análisis, Cántaros, Sueños, Deudas, Ajustes) plus AI advisor and smart-transaction modals. The shipped `LiteDesktopLayout.vue` is leaner (header-embedded 4-tab nav + bottom status pill + `QuickActionSheet`). Where the two differ, see the per-component reconciliation table in `ui_kits/lite-desktop/README.md`.

### Canonical Lite routes (shipped 4-tab nav)
The header nav in `LiteHeaderDesktop.vue` exposes exactly four primary destinations:
- `/user/home`
- `/user/transactions`
- `/user/jars`
- `/user/config`

The JSX kit additionally prototypes `/user/expense-analysis`, `/user/dreams`, and `/user/debts` as secondary destinations (reachable from Home previews and the expanded menu, not the primary nav).

### Lite Desktop UX commandments
- **No persistent Pro-style sidebar.** Lite uses a floating horizontal **nav pill** or a slim contextual rail. Never a dense admin chrome.
- **No admin shell, no mobile-stretched layout.** Desktop is its own posture.
- **One obvious primary action at a time.** Quick Add is the CTA.
- **Money first.** Hero balance, available, jars, and recent movements dominate the visual hierarchy.
- **Calm whitespace.** Reduced simultaneous controls vs Pro.
- **No hard 1px dark borders** as dominant framing. Use soft elevation and large radii.

---

## 2. Sources of truth (this system was built from)

This system was originally built from the canonical briefs (below) and has since been **reconciled against the live frontend codebase** (branch `dev`):

- `docs/ui-ux/08-frozen-canonical-design-system-brief.md`
- `docs/ui-ux/09-freeze-stitch-flujo-core-matrix.md`
- `docs/ui-ux/10-layout-refactor-legacy-pro-lite-mini-spec.md`
- `docs/ui-ux/MASTER_UI_SOURCES.md`
- Stitch project `5968657237763273187`
- **Real Vue components (verified to exist in the frontend):**
  - `src/layouts/DynamicRoleLayout.vue` — mode/viewport router
  - `src/layouts/LiteDesktopLayout.vue` — the shipped Lite Desktop shell
  - `src/layouts/LiteMobileLayout.vue` — Lite mobile shell
  - `src/components/liquid/LiteHeaderDesktop.vue` — desktop header (logo + 4-tab nav + actions)
  - `src/components/liquid/LiteBottomNavDesktop.vue`, `LiteFloatingBottomNav.vue` — bottom navs (currently used by the mobile/floating paths, **not** by `LiteDesktopLayout`)
  - `src/components/liquid/ExpandedNavigationMenuLight.vue` — expanded contextual menu
  - `src/components/liquid/QuickActionSheet.vue` — the one-CTA quick-add sheet
  - `src/components/liquid/DesktopEstadoOptimoPanel.vue` — bottom "estado óptimo" panel
  - `src/components/liquid/Liquid*.vue` — shared card/chip/item atoms

> ⚠️ **There is no `src/components/lite/` directory.** Earlier drafts of this README referenced `src/components/lite/LiteHeaderDesktop.vue` etc.; the real components live in `src/components/liquid/`. All references have been corrected.

### ⚠️ Reconciled conflict between briefs

The two source briefs disagree on **brand primary**:

| Source | Primary | Cyan role |
|---|---|---|
| Lite Desktop brief (08–10) | `#1E3A8A` deep navy | `#0EA5E9` is *supporting info accent only* |
| Liquid Glass Unified (master) | `#0EA5E9` cyan | (no navy referenced) |

**Resolution for this system:** Lite Desktop is the active deliverable and its brief is canonical. We use **deep navy `#1E3A8A` as `--brand-primary`** and cyan as a secondary info accent. The "avoid cyan-first CTA hierarchy" rule from the Lite brief governs.

If the wider product later confirms cyan-primary, swap `--brand-primary` once in `colors_and_type.css`; nothing else needs to change.

The two briefs also disagree on type:

| Source | Display | Body |
|---|---|---|
| Lite Desktop brief | Satoshi | DM Sans (fallback) |
| Liquid Glass Unified | Manrope (Bold) | Inter |

**Resolution:** Satoshi / DM Sans is canonical here. Manrope and Inter are loaded as compatible fallbacks so legacy Quasar views render without surprise.

---

## 3. Content fundamentals

### Voice
- **Calm and matter-of-fact.** This is money — never breezy, never alarmist. Short sentences. No hype.
- **Second person, conversational.** "Your balance" / "You spent" / "Set aside". Never "the user".
- **Spanish + English neutral.** Copy may ship in either. Use neutral, professional Spanish (no regional slang). Mirror the same tone in English. Examples below show English; Spanish equivalents use the same calm register.
- **Numbers do the talking.** Headlines are amounts, not adjectives. Let `$ 12,480.50` be the headline; copy supports it.

### Casing
- **Sentence case for everything** in product chrome: navigation labels, buttons, section headers. ("Recent transactions", not "Recent Transactions".)
- **All-caps only for tiny meta labels** (KPI eyebrows, currency codes): `AVAILABLE`, `USD`, `THIS MONTH`. Track +60 letter-spacing.

### Tone examples
| Don't | Do |
|---|---|
| "🎉 Awesome job saving!" | "On track for your March goal." |
| "Oops, transaction failed!" | "Transfer didn't go through. Try again." |
| "Welcome back, superstar!" | "Hi, José." |
| "Click here to view all" | "View all" |

### Emoji & decorative chars
- **No native emoji as system iconography.** Ever.
- Material Icons (the safe baseline subset only — see ICONOGRAPHY) carries all glyph weight.
- Currency symbols (`$`, `€`, `S/`) are part of typography, not decoration — set them tabular.

### Money formatting
- Always with thousand separators and two decimals: `$ 12,480.50`.
- Currency code as a short uppercase chip beside large amounts: `USD`.
- Negative values: leading `−` (true minus, U+2212), `--expense` color. Never parentheses.
- Hidden state when visibility is off: replace digits with `••••••` of the same width.

---

## 4. Visual foundations

### Color
- **Light is the canonical baseline.** Dark mirrors the same structure, never inverts hierarchy.
- **Navy `#1E3A8A` is the brand-primary.** It owns active nav state, the one CTA, and the focused chip.
- **Cyan `#0EA5E9` is a supporting info accent** — info badges, link-styled secondaries, sparkline strokes. Never the primary CTA.
- **Semantic colors are functional**, not decorative: success `#10B981` (income, on-track), danger `#EF4444` (expense, over budget), warning `#F59E0B` (idle money, attention needed).
- **Surfaces:** Light = white cards on `#F8FAFC`. Dark = `#131B2E` cards on `#0F172A` base.

See `colors_and_type.css` for the full token list.

### Type
- **Display:** Satoshi (Variable). Used for amounts, section headers, hero numbers. Tracked tight at large sizes (-1% to -2%).
- **Body:** DM Sans. 400 / 500 / 600. Used for everything ≤ 18px.
- **Money** is its own type role — always Satoshi 600/700, **tabular numerals** (`font-variant-numeric: tabular-nums`).
- Manrope and Inter are loaded as legacy fallbacks.

### Spacing
8px base grid. Tokens: `--space-1` (4) through `--space-12` (96). Lite Desktop tends to use the higher end (`--space-6` / `--space-8`) between cards to keep the calm.

### Radii
Generous. Card = 20px. Hero card = 28px. Buttons = 999px (pill). Chips = 999px. Inputs = 12px. **No square corners** anywhere in chrome.

### Borders
- **No 1px hard borders** as dominant framing.
- Where separation is needed, use elevation (shadow) or surface contrast (`--surface-1` vs `--surface-2`), not strokes.
- The one exception: a 1px hairline at `--border-hairline` (very low alpha) is allowed inside dense lists like the transactions ledger — it must be barely-there.

### Elevation / shadow
- Light mode: `0 4px 24px rgba(15, 23, 42, 0.06)` for cards. `0 8px 32px rgba(15, 23, 42, 0.10)` for hero / floating nav. **No drop shadow visible on white-on-white** — only on cards floating above the `#F8FAFC` canvas.
- Dark mode: shadows are barely visible; rely on **surface contrast** (S1/S2/S3 stack) plus an optional inner-ring `inset 0 1px 0 rgba(255,255,255,0.04)` to lift a card off its background.
- **No glassmorphism in Lite Desktop chrome.** (The wider Liquid Glass system uses blur on mobile hero modals; the Lite Desktop shell stays flat and trust-first.)

### Backgrounds
- **Plain solid surfaces only.** No background images, gradients, or patterns in product chrome.
- Marketing surfaces (outside this system's scope) may carry brand imagery; product surfaces do not.

### Imagery
- **Avatar circles** are the only routine image surface in chrome. Initials fallback (navy circle, white letter) when no photo.
- **Empty state illustrations** are allowed (placeholders here — see `assets/placeholders/`).
- No stock photography, no abstract gradients, no AI imagery.

### Animation
- **Subtle, fast, deliberate.** 150–220ms is the working range.
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)` (a slightly-bouncy ease-out) for entrances, `ease-in-out` for state changes.
- **No bouncy springs, no parallax, no decorative motion.** Money UI should feel like a Swiss watch.
- Number changes use a quick crossfade (120ms), never a slot-machine rolling counter.

### Hover states
- **Buttons:** primary darkens 6%, secondary surfaces shift `--surface-1 → --surface-2`.
- **Nav items:** background fades to `--surface-2` at ~150ms.
- **Cards:** elevation increases (shadow stronger), no scale, no rotation.
- **Links:** underline-by-default off; on hover, `text-decoration: underline` with `text-underline-offset: 3px`.

### Press / active states
- Buttons compress slightly (`transform: scale(0.98)`), 80ms in.
- Nav items darken background one more step (`--surface-2 → --surface-3`).

### Focus
- Always visible. 2px outline in `--brand-primary` with 2px offset. Never remove it; never replace with a glow.

### Transparency / blur
- Allowed only on **the expanded contextual menu** (popover overlay), with a 12px backdrop blur and ~92% opacity. Nowhere else in Lite Desktop chrome.

### Layout rules
- Lite Desktop content max-width: **1200px** (`--container-max`).
- Header is **non-sticky in v1** (Lite calm posture) but the nav pill **floats fixed** at the bottom center.
- Page padding: 32px horizontal at desktop, scaling down to 24px below 1024px (Lite Desktop is desktop-only; below 1024px the user gets the mobile shell).

### Cards
- Background: `--surface-1` (white in light, `#131B2E` in dark).
- Radius: 20px (most), 28px (hero).
- Padding: 24px (default), 32px (hero).
- Shadow per above. No border.

---

## 5. Iconography

See [`ICONOGRAPHY.md`](./ICONOGRAPHY.md) for the safe-set policy. Short version:

- **Material Icons (filled)** via the Quasar default `material-icons` font is the only system icon source.
- **Safe names only:** `home`, `receipt_long`, `savings`, `settings`, `notifications`, `person`, `menu`, `add`, `visibility`, `visibility_off`, `chevron_right`, `arrow_outward`, `arrow_downward`, `more_horiz`, `close`, `check`, `search`.
- **Banned in this system:** `o_*` outlined-variant prefixes (depend on an icon set Quasar isn't configured for), any Material Symbols-only glyphs, emoji.
- 24px is the default size. 20px in dense rows. 32px in hero affordances.

---

## 6. Index

```
README.md                    ← you are here
ICONOGRAPHY.md               ← icon policy & safe names
SKILL.md                     ← agent-skill manifest
colors_and_type.css          ← all tokens, light + dark, type roles
fonts/                       ← Satoshi (Fontshare), DM Sans, Manrope, Inter
assets/
  logos/                     ← OW Finance logos (placeholders + svg marks)
  placeholders/              ← avatar / empty-state placeholders
preview/                     ← Design System tab cards (registered assets)
ui_kits/
  lite-desktop/
    README.md                ← kit map + jsx↔vue reconciliation table
    index.html               ← interactive multi-route Lite Desktop demo (Light + Dark toggle)
    atoms/
      Buttons.jsx            ← PillButton, IconButton
      Chips.jsx              ← CurrencyChip, StatusChip
      Primitives.jsx
    molecules/
      FormControls.jsx
      SectionHeader.jsx
    organisms/
      LiteHeader.jsx
      LiteNavPill.jsx        ← floating nav pill (kit-only; see reconciliation note)
      ExpandedMenu.jsx
      HeroBalance.jsx
      JarsPreview.jsx
      RecentTransactions.jsx
      DreamsPreview.jsx  DebtsPreview.jsx
      DesktopQuickModal.jsx  SmartTransactionModal.jsx  AIAdvisorPanel.jsx
      NotificationsPanel.jsx  AccountsPanel.jsx  ExchangeRatesWidget.jsx  …
    shells/
      LiteShell.jsx          ← page frame: header + content + floating nav pill + modals
      ProShell.jsx
    templates/               ← one file per route
      HomeRoute.jsx  TransactionsRoute.jsx  JarsRoute.jsx  ConfigRoute.jsx
      AnalisisRoute.jsx  DreamsRoute.jsx  DebtsRoute.jsx  (+ Pro*Route.jsx)
    data/                    ← sample data + i18n for the demo
```

> The kit is organized **atoms / molecules / organisms / shells / templates** (not the flat layout earlier drafts of this index implied). Route components live in `templates/`, not a `routes/` folder.

---

## 7. Iterate with us

This system is intentionally tight and opinionated to keep Lite **Lite**. If you find:
- a spec gap (a component the brief didn't name),
- a token that needs to differ between Lite and Pro,
- or a place the navy/cyan resolution feels wrong,

flag it and we'll adjust. The codebase is now reconciled into this system; the next high-value step is closing the **open structural questions** logged in `ui_kits/lite-desktop/README.md` (floating nav pill vs. header nav + status pill, and the `o_*` outlined-icon usage in the shipped Vue components vs. the ICONOGRAPHY safe-set).
