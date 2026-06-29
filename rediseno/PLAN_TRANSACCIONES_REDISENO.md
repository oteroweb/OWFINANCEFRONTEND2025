# Plan de Implementación — Rediseño de Transacciones
**Fuente:** zip rediseno 2026-06-29  
**Tareas:** OWF-153 a OWF-158

---

## Principio central (NO negociable)

> **El cántaro NUNCA se elige a mano. Entra anclado a la categoría.**

Cada categoría declara su `jarId`. Al seleccionar una categoría, el cántaro aparece como chip de solo lectura con ícono candado. El usuario nunca ve un selector de cántaro.

---

## Qué trae el zip

| Archivo rediseño | Cambio | Afecta |
|---|---|---|
| `tx-catalog.js` | NUEVO — catálogo canónico `OWF_JARS` + `OWF_CATEGORIES` + `owfJarForCategory()` | Toda la app |
| `TransactionDetailModal.jsx` | `TxdAnchoredJar` + save() deriva jar desde categoría + acción **Duplicar** | Desktop Lite+Pro |
| `TransactionForm.jsx` | `AnchoredJar` reemplaza selector manual de cántaro + 8 caminos Pro | Desktop Lite+Pro |
| `TransactionFormSheet.jsx` | `MFAnchoredJar` + comisiones (fija/%) + pago móvil BCV + split + items/factura | Mobile Pro |
| `redesign/audit/` | 13 capturas visuales + 2 harness HTML de referencia | — |
| `redesign/Auditoría de Transacciones.html` | Documento de auditoría completo (30KB) | — |
| `_ds_bundle.js` | +619 líneas — componentes DS actualizados | Todo el kit |

### Imágenes de referencia en `redesign/audit/`
- `01-quickmodal.png` — Quick modal de alta rápida
- `ev-lite-expense.png` — Gasto simple Lite
- `ev-expense-top.png` — Form gasto con categoría seleccionada (cántaro anclado visible)
- `ev-detail-view.png` — Modal detalle: modo vista
- `ev-detail-edit.png` — Modal detalle: modo edición
- `ev-transfer.png` — Transferencia entre cuentas
- `ev-split.png` — Pago compuesto (varias cuentas)
- `ev-factura.png` — Monto por artículos (items)
- `ev-comision.png` — Comisión agregada
- `ev-ajuste.png` — Ajuste de cántaro
- `ev-m-expense.png` — Form mobile gasto
- `ev-m-detail.png` — Detail sheet mobile
- `ev-m-anchored.png` — Cántaro anclado en mobile

---

## Archivos Vue a modificar

| Componente actual | Rol | Cambio necesario |
|---|---|---|
| `src/components/SmartTransactionModal.vue` (827 líneas) | Modal global de alta | Derivar jar desde category_id; remover selector manual de jar |
| `src/components/TransactionForm.vue` (60 líneas) | Form embebido | Migrar a lógica de cántaro anclado |
| `src/components/TransactionCreateDialog.vue` | Dialog crear | Usar AnchoredJar |
| `src/components/TransactionEditDialog.vue` | Dialog editar | Usar AnchoredJar + acción Duplicar |
| `src/components/TransactionFormDialog.vue` | Dialog wrapper | Revisar si persiste selector manual |
| `src/pages/user/transactions/LiteTransactionsView.vue` | Vista transacciones | Integrar Transaction Detail Modal v2 |
| `src/stores/transactions.ts` (o similar) | Store | Asegurar que POST/PATCH envía `jar_id` derivado de `category_id` |

---

## Tareas — OWF-153 a OWF-158

### OWF-153 · Catálogo canónico de categorías→cántaro `[P1]`
**Qué:** Migrar `tx-catalog.js` al ecosistema Vue/TypeScript.
- Crear `src/utils/txCatalog.ts` con `OWF_JARS`, `OWF_CATEGORIES`, `jarForCategory(categoryId)`, `categoryOptions(kind?)`.
- Verificar que el endpoint `GET /api/v1/categories` devuelve `jar_id` por categoría; si no, agregar la columna/seed en el backend.
- El store de transacciones debe usar `jarForCategory(form.category_id)` para derivar `jar_id` antes de enviar al API.

**Archivos backend:** `OWFINANCEBackend2025/app/Models/Category.php`, migración si falta `jar_id`.  
**Archivos frontend:** nuevo `src/utils/txCatalog.ts`.

---

### OWF-154 · Componente `AnchoredJarChip.vue` `[P1]`
**Qué:** Componente Vue reutilizable que muestra el cántaro derivado de una categoría (solo lectura).
- Props: `categoryId: number | null`
- Estados: sin categoría → placeholder dashed; categoría sin jar → "Sin cántaro"; con jar → chip coloreado con icono + `%` + ícono candado.
- Basarse en `TxdAnchoredJar` del rediseño desktop y `MFAnchoredJar` del mobile.
- Un único componente funciona en desktop y mobile (responsive).

**Referencia:** `ev-expense-top.png`, `ev-m-anchored.png`.

---

### OWF-155 · SmartTransactionModal + TransactionForm: cántaro anclado `[P1]`
**Qué:** En todos los formularios de alta/edición de transacciones:
1. Remover el selector manual de cántaro (`q-select` o similar con opciones de jar).
2. Agregar `<AnchoredJarChip :category-id="form.category_id" />` debajo del selector de categoría.
3. Al hacer submit, derivar `jar_id` vía `jarForCategory(form.category_id)` en vez de leerlo del form.
4. SmartTransactionModal: el campo `category_id` ya existe (línea 256); solo hay que wiring el chip y el submit.

**Archivos:** `SmartTransactionModal.vue`, `TransactionForm.vue`, `TransactionCreateDialog.vue`, `TransactionFormDialog.vue`.  
**Referencia:** `ev-lite-expense.png`, `ev-expense-top.png`.

---

### OWF-156 · Transaction Detail Modal v2: View/Edit/Delete + Duplicar `[P2]`
**Qué:** Mejorar el modal de detalle de transacción (actualmente básico según OWF-138):
1. **Modo Vista** — filas: monto hero, tipo, categoría, cántaro anclado (chip), cuenta, fecha.
2. **Modo Edición inline** — mismos campos editables; al guardar, re-deriva jar desde categoría.
3. **Eliminar** — confirm inline (no dialog separado).
4. **Duplicar** — nueva acción que clona la tx y abre el duplicado en modo edición.

Puede ser en `TransactionEditDialog.vue` expandido, o un nuevo `TransactionDetailSheet.vue`.  
**Referencia:** `ev-detail-view.png`, `ev-detail-edit.png`.

---

### OWF-157 · Mobile: TransactionFormSheet Pro — comisiones, split, items `[P2]`
**Qué:** Bottom sheet para modo Pro mobile con 3 características avanzadas:
1. **Comisión** — toggle; tipos: fija ($), porcentaje (%), pago móvil (BCV 0.30% mín Bs 2). Muestra total = monto + comisión.
2. **Pago compuesto (split)** — toggle; distribuye el gasto entre N cuentas con montos editables.
3. **Monto por artículos (factura)** — toggle; lista de ítems con cantidad × precio; el total sube al monto principal.

Solo aplica a `layout_mode === 'pro'` en mobile. Lite no ve estas opciones.  
**Referencia:** `ev-comision.png`, `ev-split.png`, `ev-factura.png`, `ev-m-expense.png`.

---

### OWF-158 · Commitear rediseno/ + sincronizar _ds_bundle `[P3]`
**Qué:** Trabajo de housekeeping:
1. Commitear los cambios en `rediseno/` (9 archivos modificados + 3 nuevos).
2. Verificar si hay tokens nuevos en `_ds_bundle.js` que no estén en `src/css/` — si los hay, portarlos.
3. Actualizar `rediseno.zip` con el nuevo contenido (o eliminar el zip del repo y usar .gitignore).

---

## Orden de ejecución recomendado

```
OWF-153 (catálogo TS)
    ↓
OWF-154 (AnchoredJarChip)
    ↓
OWF-155 (forms: SmartTxModal + TransactionForm)
    ↓
OWF-156 (detail modal)   OWF-157 (mobile sheet Pro)
    ↓
OWF-158 (commit + DS sync)
```

OWF-156 y OWF-157 pueden hacerse en paralelo después de OWF-155.

---

## Notas de integración API

- `POST /api/v1/transactions` ya recibe `jar_id` — verificar que acepta el derivado de `category_id`.
- Si `Category` no tiene columna `jar_id` en prod MySQL: agregar migración + seed con la tabla de `tx-catalog.js`.
- Los `jar_id` del catálogo usan strings `j1..j5`; los del backend usan enteros. Mapear en `txCatalog.ts` con el lookup por nombre del cántaro.
