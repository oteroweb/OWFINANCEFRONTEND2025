# OW Finance 2026 — Mobile UI Kit

The **mobile app** reference: a single React + Babel demo (`index.html`) that renders an iPhone frame and runs the full OW Finance app as a click-through prototype. Same brand, tokens and voice as Lite Desktop — this is the **phone posture** of the same product.

> Open `index.html`. Two global toggles sit in the demo header:
> - **Modo** — `Lite` ↔ `Pro` (density / how much each screen shows)
> - **Tema** — `Dark` ↔ `Light`
>
> Every chrome interaction works (navigation, bottom sheets, filters, AI chat). Values are static seed data from `data.jsx`.

---

## 1. Lite vs Pro (the app ships both)

The mobile app is **one app with two modes**, mirroring the desktop philosophy. The mode is a user-level setting; here it's the `mode` prop threaded from the demo toggle into `MobileShell`.

| | **Lite** | **Pro** |
|---|---|---|
| Posture | Calm, money-first, progressive disclosure | Dense, more simultaneous data |
| Accent | Navy `--brand-primary` | Cyan `--info` |
| Balance card | Single hero amount + 1 delta | Gradient card + Ingresos/Gastos/Neto strip + KPI row |
| Home extras | — | Spending-by-category mini chart |
| Debts on Home | Summary card only | Summary card **+ most-urgent debt card** |
| Dreams on Home | Summary card only | Summary card **+ featured dream card** |
| Quick Add sheet | 3 actions (Gasto · Ingreso · Transferir) | 6 actions (+ Voz · Escanear · Auto IA) |
| **Transactions filtering** | MonthBar · type chips · SmartFilter (categoría/día/monto) · search — **single implicit wallet** | **+ AccountFilter** (grouped multi-select, segments USD/VES/Con deuda) **+ ExchangeRates** sheet · multi-currency combined totals |
| Transactions | Standard rows | `dense` rows + category chips |

Switching mode never changes color, type or voice — only **density and how much is shown**. Both modes share every screen and component below.

---

## 2. Screen-by-screen — what each contains

| # | Screen | File | Contains | Reached from |
|---|---|---|---|---|
| 1 | **Home (Lite)** | `screens/HomeScreenLite.jsx` | Greeting header · hero **BalanceCard** · **JarsRow** (4) · **Deudas** summary · **Sueños** summary · Recent transactions (4) | Bottom nav · default route |
| 2 | **Home (Pro)** | `screens/HomeScreenPro.jsx` | Gradient balance + KPI strip · spending chart · JarsRow · **Deudas** summary + urgent card · **Sueños** summary + featured card · movements (5, dense) | Bottom nav · default route |
| 3 | **Transacciones** | `screens/TransactionsScreen.jsx` | **Mode-aware.** Date-interval **MonthBar** · search · quick type chips · **SmartFilter** sheet (categoría/día/monto) · active-filter chips · results/net line. **Pro adds** the **AccountFilter** (smart grouped multi-select) + **ExchangeRates** sheet + multi-currency context | Bottom nav · "Ver todo" on Home recents |
| 4 | **Jars (Cántaros)** | `screens/JarsScreen.jsx` | Navy summary card (total · activos · atención) · 2-col **JarGrid** | Bottom nav · "Ver todos" on Home JarsRow |
| 5 | **Deudas** ⭐ | `screens/DebtsScreen.jsx` | Red summary (total pendiente · próx. cuotas 30d · estado) · grouped **DebtsList** (Planes Cashea / Otras) · Pagar cuota / Nuevo plan | "Ver todo" Deudas on Home · Quick Add → *Pago deuda* |
| 6 | **Sueños** ⭐ | `screens/DreamsScreen.jsx` | Violet summary (acumulado · meta · % camino) · **DreamsList** of dream cards · Aportar / Nuevo sueño | "Ver todo" Sueños on Home · Quick Add → *Aporte sueño* |
| 7 | **Configuración** | `screens/SettingsScreen.jsx` | Grouped settings (Cuenta · Visualización · Notificaciones) with toggles + cerrar sesión | Bottom nav (Settings tab) |
| 8 | **Asesor IA** | `screens/AIAdvisorScreen.jsx` | Full-screen AI chat · seeded conversation · quick-reply chips · live `window.claude.complete` input | Quick Add → *Hablar con Asesor IA* / *Auto IA* |

⭐ = added in this revision (Deudas & Sueños), bringing the mobile app to parity with the Lite-Desktop routes.

---

## 3. Interconnection — navigation map

`MobileShell.jsx` owns routing (`route` state), the masked-balance flag, and the two bottom sheets. There is **no router library** in the demo — it's a state switch you'd replace with React Navigation in RN.

```
                       ┌───────────────────────────────┐
                       │          MobileShell          │
                       │  (route · balVisible · sheets)│
                       └───────────────────────────────┘
                                     │
   BOTTOM NAV (always visible, 4 tabs + center +)
   ┌─────────┬─────────────┬────[ + ]────┬─────────┬───────────┐
   │  Home   │ Transacciones │  (center)  │  Jars   │ Settings  │
   └────┬────┴──────┬──────┴──────┬──────┴────┬────┴─────┬─────┘
        │           │             │           │          │
        ▼           ▼             ▼           ▼          ▼
   HomeScreen   Transactions  QuickActionSheet  Jars   Settings
   (Lite/Pro)                      │
        │                          ├─ Gasto/Ingreso/Transferir ─▶ SmartTransactionSheet
        │  "Ver todo"              ├─ Voz / Escanear / Auto IA ──▶ SmartTransactionSheet
        ├──────────────▶ Transacciones                          (text · voice · photo → Claude)
        ├──────────────▶ Jars      ├─ Pago deuda ───────────────▶ Deudas
        ├──────────────▶ Deudas ◀──┤                              screen
        ├──────────────▶ Sueños ◀──┴─ Aporte sueño ─────────────▶ Sueños
        │                          └─ Hablar con Asesor IA ─────▶ Asesor IA (full screen)
        └─ notifications / visibility toggles (in HomeHeader)
```

Key rules:
- **4 bottom-nav destinations** stay fixed (Home · Transacciones · Jars · Settings) — Lite's "4 destinations, no more" rule. Deudas & Sueños are **not** crammed into the tab bar.
- **Deudas & Sueños are reached two ways:** the tappable summary cards on Home (`Ver todo` or tapping the card), and the **Quick Add sheet** shortcuts *Pago deuda* / *Aporte sueño*.
- The **center `+`** opens `QuickActionSheet`; selecting a money action opens `SmartTransactionSheet` (text/voice/photo → Claude parse). The sheet and bottom nav are hidden on the **Asesor IA** full-screen route.
- Every inner screen (Transacciones, Jars, Deudas, Sueños, Settings, IA) has a **back arrow → Home**.

---

## 4. File map

```
ui_kits/mobile/
  index.html              ← demo shell: phone frame, Modo/Tema toggles, component map, script loader
  tokens.js               ← JS mirror of the CSS tokens (copy into theme.ts / StyleSheet)
  data.jsx                ← seed data: MOBILE_TX · MOBILE_JARS · MOBILE_DEBTS · MOBILE_DREAMS · AI_SEED
  Shell.jsx               ← MobileShell — routing, balance visibility, sheet state, mode threading

  components/
    Atoms.jsx             ← Avatar · AIAvatar · Chip · PillButton · IconButton · Toggle · Money · Divider
    Navigation.jsx        ← StatusBar · MobileHeader · BottomNav · HomeHeader
    BalanceCard.jsx       ← hero balance (Lite + Pro variants)
    JarComponents.jsx     ← JarCard · JarsRow · JarGrid
    DebtComponents.jsx    ⭐ DebtCard · DebtSummaryCard · DebtsList (+ provider/status meta)
    DreamComponents.jsx   ⭐ DreamCard · DreamSummaryCard · DreamsList (+ dream tones)
    TransactionComponents.jsx ← TransactionRow · DayHeader · TransactionList · SectionTitle
    BottomSheet.jsx       ⭐ MobileBottomSheet — reusable slide-up sheet
    MonthNavigatorMobile.jsx ⭐ MonthBar + month/year picker sheet (date-interval nav)
    TransactionFilters.jsx ⭐ AccountFilter · ExchangeRates · SmartFilter (Pro multi-currency)
    QuickActionSheet.jsx  ← center "+" sheet (actions grid + Deudas/Sueños shortcuts + AI CTA)
    SmartTransactionSheet.jsx ← text/voice/photo entry → Claude parser
    ChatComponents.jsx    ← ChatBubble · RichText · ChatInput · QuickReplyChip

  screens/
    HomeScreenLite.jsx · HomeScreenPro.jsx
    TransactionsScreen.jsx · JarsScreen.jsx
    DebtsScreen.jsx ⭐ · DreamsScreen.jsx ⭐
    SettingsScreen.jsx · AIAdvisorScreen.jsx
```

---

## 5. Data shapes (Deudas & Sueños)

`MOBILE_DEBTS` — same shape as desktop `SAMPLE_DEBTS`, so backend mapping is identical:

```
{ id, name, provider:'cashea'|'card'|'loan'|'personal',
  merchant, balance, original, paid, total,
  nextDueDate, nextDueAmount, rate,
  status:'on-track'|'due-soon'|'late'|'paid' }
```

`MOBILE_DREAMS` — long-term aspirational goals (richer/more emotional than jars):

```
{ id, name, subtitle, icon, amount, goal, progress,
  eta, monthly, contributors, tone:'dream-primary'|'dream-secondary' }
```

Both render through dedicated components and surface on Home as tappable summary cards. Replace the seed arrays with `GET /debts` and `GET /dreams`.

---

## 5b. Transactions filtering experience

The Transactions screen is the most feature-dense surface and is **mode-aware** (the `mode` prop is threaded from `MobileShell`). It ports the desktop transaction tools to mobile bottom-sheets:

| Widget | File | Mode | What it does |
|---|---|---|---|
| **MonthBar** | `MonthNavigatorMobile.jsx` | both | `‹ Marzo 2026 ›` stepper + `Hoy`; tap the center pill → month/year **picker sheet**. Navigating to an empty month shows a "Sin movimientos · Volver a Marzo" state. |
| **Quick type chips** | (in screen) | both | Todos / Ingresos / Gastos / Jars — always-visible fast filter. |
| **SmartFilter** | `TransactionFilters.jsx` | both | Bottom sheet: Tipo · Categoría · Día · Monto (with presets). Badge counts active category/day/amount filters. |
| **AccountFilter** | `TransactionFilters.jsx` | **Pro** | Grouped multi-select sheet (Mis cuentas / Venezolanas / Tarjetas y deudas) with smart segments **Todas · Solo USD · Solo VES · Con deuda**, search, native + ≈USD balances, and a combined-USD footer. |
| **ExchangeRates** | `TransactionFilters.jsx` | **Pro** | `Tasas` pill (shows live `Bs N`) → editable sheet. 1 USD = N per currency (VES/EUR/COP/CLP); drives the combined-USD conversion. |

State lives in `TransactionsScreen` (`month`, `accts`, `rates`, `filter`, `query`) and combines into one `filtered` list. Active filters render as removable chips; the context line shows **N movimientos · neto**, plus (Pro) **1 USD = Bs N** and the combined balance of selected accounts.

**Why Lite stays simple:** Lite is a single implicit wallet, so it hides AccountFilter and ExchangeRates and shows `Billetera única` — keeping the calm, money-first posture. Pro unlocks the full multi-account, multi-currency surface.

---

## 6. React Native mapping (quick reference)

| Web here | RN target |
|---|---|
| `MobileShell` route switch | `NavigationContainer` + bottom-tabs + stack (for IA push) |
| `BottomNav` | custom `tabBar` with raised center button |
| `QuickActionSheet` / `SmartTransactionSheet` | `@gorhom/bottom-sheet` modals |
| `MobileBottomSheet` / MonthBar picker / filter sheets | `@gorhom/bottom-sheet` `BottomSheetModal` |
| `AccountFilter` grouped list | `SectionList` + checkboxes (folders) |
| `ExchangeRates` inputs | controlled `TextInput` (numeric) → user rate store |
| `DebtsList` grouped | `SectionList` (Cashea / Otras sections) |
| `DreamsList` | `FlatList` |
| progress bars | `Animated` / reanimated width |
| `window.claude.complete` | your LLM endpoint |

Tokens come from `../../colors_and_type.css` (and `tokens.js` for the RN side) — no inline hex inside components except the dream violet/rose and debt-provider accents, which are domain palettes documented in their component files.
