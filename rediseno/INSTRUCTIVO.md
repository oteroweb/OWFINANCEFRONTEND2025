# Instructivo — Kit de Rediseño OWFinance
**Cómo ver, navegar y modificar el diseño antes de implementar en Vue**

---

## 1. Estructura del kit

```
rediseno/
│
├── INSTRUCTIVO.md                  ← este archivo
├── PLAN_TRANSACCIONES_REDISENO.md  ← plan de implementación (OWF-153..158)
│
├── colors_and_type.css             ← tokens de color y tipografía (fuente de verdad)
├── brand-scheme.css                ← paleta de marca
├── tx-catalog.js                   ← catálogo canónico de cántaros + categorías
├── _ds_bundle.js                   ← bundle del design system completo
├── _ds_manifest.json               ← índice de componentes del DS
│
├── ui_kits/
│   ├── lite-desktop/               ← kit desktop (Lite + Pro)
│   │   ├── index.html              ★ PUNTO DE ENTRADA DESKTOP
│   │   ├── data/                   ← datos de demostración
│   │   ├── atoms/                  ← botones, chips, primitivos
│   │   ├── molecules/              ← controles de form, chip groups
│   │   ├── organisms/              ★ componentes principales
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── TransactionDetailModal.jsx
│   │   │   ├── SmartTransactionModal.jsx
│   │   │   └── ... (20+ componentes)
│   │   ├── shells/                 ← LiteShell.jsx, ProShell.jsx
│   │   └── templates/              ← una ruta por archivo (HomeRoute, etc.)
│   │
│   └── mobile/
│       ├── index.html              ★ PUNTO DE ENTRADA MOBILE
│       ├── components/             ★ componentes mobile
│       │   ├── TransactionFormSheet.jsx
│       │   ├── TransactionDetailSheet.jsx
│       │   └── ... (18 componentes)
│       └── screens/                ← pantallas completas (10 screens)
│
└── redesign/
    ├── Auditoría de Transacciones.html  ← doc de auditoría completo
    └── audit/                           ← capturas de referencia visual
        ├── harness.html                 ★ harness desktop de transacciones
        ├── harness-mobile.html          ★ harness mobile de transacciones
        └── ev-*.png                     ← 13 capturas de evidencia
```

---

## 2. Cómo VER el kit (en el navegador)

Todos los archivos son HTML estáticos. **No necesitan servidor** — solo abre en el browser.

### Vista completa desktop
```
rediseno/ui_kits/lite-desktop/index.html
```
- Toolbar pegado arriba: cambiar Lite ↔ Pro, Dark ↔ Light, idioma.
- Navega entre las rutas del menú lateral.
- Haz clic en transacciones para ver el modal de detalle.
- Botones flotantes para abrir TransactionForm y SmartTransactionModal.

### Vista completa mobile
```
rediseno/ui_kits/mobile/index.html
```
- Phone frame simulado.
- Selector de pantalla arriba: Home Lite / Home Pro / Transacciones / Cántaros / etc.
- Toggle Lite ↔ Pro cambia el modo.

### Harness específico de transacciones (más útil para OWF-153..158)
```
rediseno/redesign/audit/harness.html         ← desktop
rediseno/redesign/audit/harness-mobile.html  ← mobile
```
- Muestra SOLO los componentes de transacción, uno al lado del otro.
- Más rápido para revisar cambios puntuales sin navegar todo el kit.

### Capturas estáticas de referencia
```
rediseno/redesign/audit/
  ev-lite-expense.png     → form gasto simple Lite
  ev-expense-top.png      → categoría seleccionada → cántaro anclado visible
  ev-detail-view.png      → modal detalle: modo vista
  ev-detail-edit.png      → modal detalle: modo edición
  ev-transfer.png         → transferencia entre cuentas
  ev-split.png            → pago compuesto (split)
  ev-factura.png          → monto por artículos
  ev-comision.png         → comisión agregada
  ev-ajuste.png           → ajuste de cántaro
  ev-m-expense.png        → form mobile gasto
  ev-m-detail.png         → detail sheet mobile
  ev-m-anchored.png       → cántaro anclado en mobile
  01-quickmodal.png       → quick modal alta rápida
```

---

## 3. Dónde vive cada componente que vamos a implementar

| Qué implementar | Archivo rediseño de referencia |
|---|---|
| Catálogo jars/categorías | `rediseno/tx-catalog.js` |
| Chip cántaro anclado (desktop) | `organisms/TransactionForm.jsx` → `AnchoredJar` |
| Chip cántaro anclado (mobile) | `components/TransactionFormSheet.jsx` → `MFAnchoredJar` |
| Form alta transacción desktop | `organisms/TransactionForm.jsx` |
| Modal detalle/edición desktop | `organisms/TransactionDetailModal.jsx` |
| SmartModal (QuickAdd global) | `organisms/SmartTransactionModal.jsx` |
| Form alta mobile | `components/TransactionFormSheet.jsx` |
| Detail sheet mobile | `components/TransactionDetailSheet.jsx` |
| Vista transacciones desktop | `templates/TransactionsRoute.jsx` |
| Vista transacciones mobile | `screens/TransactionsScreen.jsx` |

---

## 4. Cómo MODIFICAR el kit

### A. Cambiar datos de demo
Los datos que ves en el kit son ficticios y se editan en:
```
ui_kits/lite-desktop/data/finance-data.jsx   ← cuentas, transacciones, jars desktop
ui_kits/lite-desktop/data/i18n.jsx           ← traducciones de strings
ui_kits/mobile/data.jsx                      ← datos demo mobile
rediseno/tx-catalog.js                       ← categorías y jars canónicos
```
Edita el archivo, guarda, y recarga el browser — no hay build.

### B. Cambiar un componente
Los `.jsx` son React puro sin transpilación (cargados vía `<script type="text/babel">`).
Edita el `.jsx` directamente con cualquier editor. Recarga el browser.

Ejemplo — editar el form de transacción desktop:
```
ui_kits/lite-desktop/organisms/TransactionForm.jsx
```

### C. Cambiar colores y tokens
```
rediseno/colors_and_type.css
```
Son CSS custom properties (`--brand-primary`, `--surface-1`, etc.). Todos los componentes
las consumen. Cambiar aquí afecta todo el kit de una vez.

### D. Agregar un componente nuevo al kit
1. Crear `organisms/MiComponente.jsx` con `/* global React */` al tope.
2. Agregarlo como `<script type="text/babel" src="organisms/MiComponente.jsx"></script>` en `index.html`.
3. Instanciarlo en la ruta que corresponda en `templates/`.

---

## 5. Flujo de trabajo recomendado (diseño → Vue)

```
1. Abrir harness.html o index.html en el browser
2. Revisar el comportamiento deseado visualmente
3. Leer el .jsx de referencia para entender la lógica
4. Abrir el .vue equivalente en src/components/
5. Trasladar la lógica al Vue manteniendo el API del backend
6. Verificar en el dev server (npm run dev)
```

### Mapeo rediseño → Vue

| Archivo rediseño | Componente Vue actual | Acción |
|---|---|---|
| `tx-catalog.js` | — | Crear `src/utils/txCatalog.ts` |
| `AnchoredJar` (en TransactionForm.jsx) | — | Crear `src/components/AnchoredJarChip.vue` |
| `TransactionForm.jsx` | `src/components/SmartTransactionModal.vue` | Modificar |
| `TransactionDetailModal.jsx` | `src/components/TransactionEditDialog.vue` | Expandir |
| `TransactionFormSheet.jsx` | `src/components/TransactionForm.vue` | Expandir |
| `TransactionsRoute.jsx` | `src/pages/user/transactions/LiteTransactionsView.vue` | Ajustar |

---

## 6. Principios que NO se negocian

Extraídos del rediseño — aplicar igual en Vue:

1. **El cántaro entra anclado a la categoría.** No hay selector de cántaro. El usuario elige categoría → el cántaro aparece derivado con ícono de candado.

2. **Categoría → jar_id es automático.** La función `jarForCategory(categoryId)` (en `tx-catalog.js`) resuelve el jar. En Vue: `txCatalog.jarForCategory(form.category_id)` antes del submit.

3. **Ingresos no aportan a cántaro.** Las categorías de ingreso (kind='income') tienen `jarId: null`. El chip muestra "Sin cántaro" en ese caso.

4. **El kit Lite no tiene comisiones ni split ni items.** Esas son features exclusivas del modo Pro.

---

## 7. Quick reference — archivos más usados

| Tarea | Abrir este archivo |
|---|---|
| Ver demo completa desktop | `ui_kits/lite-desktop/index.html` |
| Ver demo completa mobile | `ui_kits/mobile/index.html` |
| Ver solo tx (referencia rápida) | `redesign/audit/harness.html` |
| Revisar lógica form tx desktop | `ui_kits/lite-desktop/organisms/TransactionForm.jsx` |
| Revisar lógica detail modal | `ui_kits/lite-desktop/organisms/TransactionDetailModal.jsx` |
| Revisar form mobile Pro | `ui_kits/mobile/components/TransactionFormSheet.jsx` |
| Catálogo categorías + jars | `tx-catalog.js` |
| Tokens de color | `colors_and_type.css` |
| Auditoría de transacciones | `redesign/Auditoría de Transacciones.html` |
| Plan de implementación Vue | `PLAN_TRANSACCIONES_REDISENO.md` |
