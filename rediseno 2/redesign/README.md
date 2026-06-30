# Redesign · Transacciones Pro (staging)

Carpeta de **staging** para iterar la nueva vista de *Transacciones* en modo Pro,
separada del UI Kit en producción (`ui_kits/lite-desktop/`) para comparar diferencias.
Cuando me pases la nueva plantilla, actualizo estos archivos y se ve el diff aquí.

**Abrir:** `Transacciones Pro.html`

## Modelo de interacción nuevo

1. **Fila superior · tres pools armónicos**
   - **Filtros activos** — el *mes* va fijo (bloqueado) + tipo (Todas/Ingresos/Gastos)
     + las categorías y cántaros que elijas. Botón *Limpiar*.
   - **Categorías** — todas las categorías con su conteo. Clic = filtrar (toggle).
   - **Cántaros** — todos los cántaros con su color. Clic = filtrar (toggle).
   - Los tres pools están sincronizados: filtrar desde un pool aparece como chip
     en *Filtros activos*, siempre junto al mes activo.

2. **Hover sobre una transacción** → aparece el **checkbox de selección** a la izquierda.

3. **Doble clic sobre una transacción** → entra en **modo seleccionar varios**.
   Clic en más filas las marca y la **barra inferior suma** sus montos en vivo
   (con *Todas* para seleccionar lo visible y *Listo* para salir).

4. **Doble clic sobre la categoría** de una fila → la fija como **filtro**,
   junto al filtro de mes ya activo (toast de confirmación).

## Archivos

- `Transacciones Pro.html` — shell + carga de scripts.
- `data.jsx` — transacciones demo (id estable por fila para la selección).
- `TxPoolsHeader.jsx` — los tres pools de la fila superior.
- `TxLedger.jsx` — ledger con checkbox al hover, modo selección y doble clic.
- `app.jsx` — estado, barra de suma y toasts.

## Pendiente / por confirmar con la nueva plantilla

- Si quieres que clic-simple en un pool sea *previsualizar* y doble-clic *fijar*
  (ahora clic-simple ya fija, por ser más descubrible).
- Reglas de combinación entre categorías (hoy es OR) y cántaros.
- Acciones sobre la selección además de sumar (exportar, recategorizar, etiquetar…).
