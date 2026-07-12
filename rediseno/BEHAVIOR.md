# BEHAVIOR — mecánicas de negocio canónicas (fuente: frontend Vue + DECISIONS.md)

> Este archivo se sube al proyecto de Claude Design junto con `DESIGN_CONTRACT.md`.
> El contrato fija las **shapes de datos**; este archivo fija el **comportamiento**.
> Regla de oro del flujo: el diseño es dueño de la presentación y la interacción;
> **Vue + backend son dueños de los datos y la mecánica de negocio**. Un componente
> nuevo que contradiga una mecánica de esta lista se rechaza en el port — si el diseño
> quiere cambiar una mecánica, se propone primero como asiento en `DECISIONS.md`.

## 1. Cántaro ← categoría (inquebrantable)

El cántaro (jar) **nunca** es un selector independiente. Se deriva SIEMPRE de la
categoría vía `jarForCategory(categoryId)`. En UI: chip anclado read-only con candado.
Fuente: `src/utils/txCatalog.ts` · contrato §7.

## 2. Ingresos no aportan a cántaro

Categorías de ingreso → `assigned_jar_id: null` → la tx muestra chip "Sin cántaro".

## 3. Lite vs Pro

Lite NO tiene comisiones, split multi-cuenta, items de factura ni gasto compartido —
son exclusivos de Pro. En transferencias, incluso en Pro, solo aplica Comisión
(split/items/shared quedan deshabilitados — OWF-246). Lite y Pro son archivos
separados, nunca una prop `mode` (contrato §5).

## 4. Gasto compartido — mecánica canónica HÍBRIDA (D-001)

Al agregar categorías, el monto total se reparte **equitativamente por defecto**;
cada fila queda **editable a mano** y editar una fila re-reparte el resto entre las
filas no tocadas. La suma siempre debe cuadrar con el total de la transacción.
Estado: adjudicado 2026-07-12; diseño y Vue convergen a esto (ver DECISIONS.md D-001).
Ni el "equitativo puro" del diseño viejo ni el "manual puro" del Vue actual son canónicos.

## 5. Split multi-cuenta (Pro)

Reemplaza la cuenta simple por múltiples pagos `{account_id, amount, rate}`. La suma
de pagos debe cuadrar con el monto total; cuentas en moneda ≠ USD piden tasa.
Fuente: `SmartTransactionModal.vue` (OWF-242).

## 6. Adjunto de foto/soporte

UI-only hasta que exista el endpoint de subida (OWF-283): archivo + preview + quitar.
No diseñar flujos que asuman persistencia del adjunto (galerías, historial de
comprobantes) hasta cerrar OWF-283. Regla general del patrón UI-first: DECISIONS.md D-002.

## 7. Monedas

Las monedas reales del producto son USD / EUR / VES. No introducir selectores de
moneda por transacción — la moneda viene de la cuenta.
