---
name: ow-finance-design
description: Use this skill to generate well-branded interfaces and assets for OW Finance 2026 — either for production Quasar/Vue work or for throwaway prototypes, slide decks, and mocks. Contains the canonical Lite Desktop foundations: color tokens (light + dark), type scale, spacing, iconography rules (Quasar `material-icons` safe set), and a React/JSX UI kit for the four Lite Desktop routes.
user-invocable: true
---

# OW Finance 2026 — design skill

Read **README.md** first. It explains the product context (Lite vs Pro), the canonical 4-route Lite Desktop shell, the reconciled brand-primary decision (navy `#1E3A8A`, **not** cyan), and the content & visual fundamentals.

Then inspect:

- `colors_and_type.css` — all design tokens. Light is canonical; `[data-theme="dark"]` mirrors. Import or copy variable values; never hardcode hex.
- `ICONOGRAPHY.md` — Quasar `material-icons` safe-set. **Avoid `o_*` outlined names and Material Symbols-only glyphs.**
- `ui_kits/lite-desktop/` — interactive React/JSX recreation of the Lite Desktop shell. `index.html` is a live demo with light/dark toggle and four navigable routes (`/user/home`, `/user/transactions`, `/user/jars`, `/user/config`). Read individual `.jsx` files for component reference.
- `preview/` — small documentation cards (also surfaced in the Design System tab).
- `assets/logos/` — placeholder OW Finance wordmark + mark SVGs. **Flag to the user** that real brand assets should replace these.

## When invoked

If the user asks for a **visual artifact** (slide, mock, throwaway prototype, screen design):
- Copy `colors_and_type.css`, the relevant `assets/`, and any needed UI kit components into a new HTML file.
- Match the calm-financial voice (sentence case, no emoji, money-first hierarchy).
- Use the safe icon set only.
- Default to Light mode unless the user asks otherwise.

If the user is working on **production Quasar/Vue code**:
- Treat `colors_and_type.css` tokens as the source of truth. Map to CSS variables or equivalent Tailwind utility values.
- Reference the JSX components as *structural* references — they are click-thru prototypes, not production code. Pixel structure, density, and spacing are accurate.
- Implement icons with `<q-icon name="..."/>` using only safe names.
- Honor the Lite UX commandments: no persistent sidebar, one CTA at a time, money-first hierarchy, calm whitespace.

If the user invokes this skill with **no other guidance**:
- Ask what they want to build or design.
- Ask 3–5 clarifying questions (route, light/dark, what data, audience).
- Then act as an expert designer who outputs HTML artifacts or production-ready snippets.

## Don'ts

- Don't introduce cyan as the primary CTA color in Lite contexts — it's the supporting info accent only.
- Don't create a Pro-style persistent sidebar inside any Lite layout.
- Don't use 1px hard dark borders as dominant framing.
- Don't add native emoji as iconography.
- Don't invent new color or type tokens without flagging the addition to the user.
