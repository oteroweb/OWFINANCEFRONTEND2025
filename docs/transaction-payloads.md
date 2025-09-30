# Transaction payloads (frontend → backend)

This document summarizes the payloads the component sends for each scenario. All examples omit unrelated framework fields.

Common fields
- name: string
- amount: number
  - Income: positive
  - Expense: negative
  - Transfer: positive
- amount_tax: always 0 (tax handled per-line or per-payment if any)
- date: 'YYYY-MM-DD HH:mm:ss'
- provider_id: number|null
- transaction_type_id: string|null (backend id)
- url_file: string|null
- rate: number|null
  - Non-transfer: when shown, converts from User currency → Account currency
  - Transfer: converts from Origin account currency → Destination account currency

Optional blocks
- category_id?: number|null (categoría de la transacción)
- items?: Array<{ name: string; amount: number; item_category_id?: number|null }>
  - Advanced invoice: line amounts include IVA for non-exempt lines; item_category_id es por línea.
  - Simple (no invoice): single item with amount = abs(amount) and optional item_category_id.
- payments?: Array<{ account_id: number; amount: number; rate: number|null; tax_id: number|null; note: string|null }>
  - Only when “Pago avanzado” is enabled (Ingreso/Egreso). Omits top-level account_id and rate.
  - amount is in the payment account’s currency.
  - rate converts from that account currency → User base currency (required when currencies differ).
  - tax_id is optional per payment.

## Ingreso/Egreso — simple (una cuenta)
Same currency
{
  "name": "Venta",
  "amount": 1500,
  "amount_tax": 0,
  "date": "2025-02-01 10:30:00",
  "provider_id": 12,
  "transaction_type_id": "<income|expense id>",
  "url_file": null,
  "rate": null,
  "account_id": 3,
  "category_id": 8,
  "items": [
    { "name": "Venta", "amount": 1500, "item_category_id": 8 }
  ]
}

Cross-currency (User USD → Account VES)
{
  "name": "Pago",
  "amount": -20,
  "amount_tax": 0,
  "date": "2025-02-01 11:00:00",
  "provider_id": null,
  "transaction_type_id": "<expense id>",
  "url_file": "https://...",
  "rate": 36.5, // User→Cuenta
  "account_id": 7,
  "items": [
    { "name": "Pago", "amount": 20, "item_category_id": null }
  ]
}

## Ingreso/Egreso — detalle (factura)
- Each non-exempt line includes IVA (16% if detected) inside its amount.
{
  "name": "Factura 001",
  "amount": 116.0, // must equal sum(items.amount)
  "amount_tax": 0,
  "date": "2025-02-02 09:00:00",
  "provider_id": 4,
  "transaction_type_id": "<income id>",
  "url_file": null,
  "rate": null,
  "account_id": 3,
  "category_id": null,
  "items": [
    { "name": "Producto A", "amount": 58.0, "item_category_id": 2 },
    { "name": "Producto B", "amount": 58.0, "item_category_id": 5 }
  ]
}

## Ingreso/Egreso — pago avanzado (múltiples cuentas)
- Omit top-level account_id and rate; use payments[].
- Sum of each payment’s total (after tax, converted to User currency via rate when needed) must equal abs(amount).
{
  "name": "Cobro mixto",
  "amount": 100,
  "amount_tax": 0,
  "date": "2025-02-03 14:15:00",
  "provider_id": null,
  "transaction_type_id": "<income id>",
  "url_file": null,
  "rate": null,
  "category_id": 8,
  "items": [ { "name": "Cobro", "amount": 100, "item_category_id": 8 } ],
  "payments": [
    { "account_id": 3, "amount": 50, "rate": null, "tax_id": null, "note": null },
    { "account_id": 7, "amount": 10, "rate": 36.5, "tax_id": 11, "note": "IGTF" }
  ]
}

Notes
- payments[i].amount is in that account’s currency.
- payments[i].rate is required when the payment account currency != User currency.
- payments[i].tax_id is optional and applied per payment row on the frontend total calculation.

## Transferencia
- Requires account_from_id and account_to_id.
- If currencies differ, rate converts Origin→Destino.
{
  "name": "Traspaso",
  "amount": 200, // positive
  "amount_tax": 0,
  "date": "2025-02-04 12:00:00",
  "provider_id": null,
  "transaction_type_id": "<transfer id>",
  "url_file": null,
  "rate": 0.028, // Origen→Destino if cross-currency, else null
  "account_from_id": 3,
  "account_to_id": 9
}
