/* GENERATED — do not edit, run `node rediseno/tools/generate-fixtures.mjs`
 *
 * Fixtures con las SHAPES REALES de las interfaces TS del frontend.
 * Todo componente nuevo de Claude Design consume estos window.SAMPLE_*.
 * (ver rediseno/DESIGN_CONTRACT.md)
 *
 * Interfaces fuente:
 *   window.SAMPLE_TX         ← Transaction      (src/stores/transactions.ts)
 *   window.SAMPLE_ACCOUNTS   ← AccountOption    (src/composables/useTransactionForm.ts)
 *   window.SAMPLE_JARS       ← JarRef           (src/utils/txCatalog.ts)
 *   window.SAMPLE_CATEGORIES ← CatalogCategory  (src/utils/txCatalog.ts)
 *   window.SAMPLE_TAGS       ← Tag              (src/stores/tags.ts)
 *   window.SAMPLE_PROVIDERS  ← ProviderOption   (src/composables/useTransactionForm.ts)
 *
 * Reglas de dominio reflejadas en los datos:
 *   - el jar de una tx SIEMPRE es el assigned_jar_id de su categoría (jarForCategory)
 *   - categorías de ingreso → assigned_jar_id null → tx.jar_id null
 *   - monedas reales del producto: USD / EUR / VES
 */
/* Transaction (src/stores/transactions.ts)
 *   id: number
 *   name: string
 *   amount: number
 *   amount_tax: number
 *   description: string
 *   date: string
 *   active: boolean
 *   provider_id: number
 *   rate_id: number
 *   url_file?: string | null
 *   transaction_type_id?: string | null
 *   user_id?: number | null
 *   account_id?: number | null
 *   category_id?: number | null
 *   jar_id?: number | null
 *   user?: { id: number; name: string } | null
 *   account?: { id: number; name: string } | null
 *   provider?: { id: number; name: string } | null
 *   rate?: { id: number; name: string; value: string } | null
 *   transaction_type?: { id: number; name: string } | null
 *   category?: { id: number; name: string; icon?: string | null; jar_slug?: string | null } | null
 *   jar?: { id: number; name: string; color?: string | null; icon?: string | null } | null
 *   tags?: Tag[]
 *   created_at?: string
 *   updated_at?: string
 *   payment_transactions?: PaymentTransaction[]
 */
window.SAMPLE_TX = [
  {"id":101,"name":"Sueldo · ACME Corp","amount":3200,"amount_tax":0,"description":"Nómina de julio","date":"2026-07-01","active":true,"provider_id":5,"rate_id":1,"transaction_type_id":"1","user_id":7,"account_id":1,"category_id":20,"jar_id":null,"account":{"id":1,"name":"BofA · Corriente"},"category":{"id":20,"name":"Salario","icon":"payments","jar_slug":null},"jar":null,"tags":[]},
  {"id":102,"name":"Alquiler · julio","amount":-1450,"amount_tax":0,"description":"Alquiler mensual del apartamento","date":"2026-07-01","active":true,"provider_id":6,"rate_id":1,"transaction_type_id":"2","user_id":7,"account_id":1,"category_id":1,"jar_id":1,"account":{"id":1,"name":"BofA · Corriente"},"category":{"id":1,"name":"Vivienda","icon":"home","jar_slug":"necesidades"},"jar":{"id":1,"name":"Necesidades básicas","color":"#1E3A8A","icon":"home"},"tags":[{"id":4,"slug":"planificado","name":"Planificado","icon":"event_available","color":"#10B981","type":"system"},{"id":5,"slug":"recurrente","name":"Recurrente","icon":"autorenew","color":"#3B82F6","type":"system"}]},
  {"id":103,"name":"Freelance · factura 042","amount":720,"amount_tax":0,"description":"Diseño de landing para cliente","date":"2026-07-02","active":true,"provider_id":5,"rate_id":1,"transaction_type_id":"1","user_id":7,"account_id":2,"category_id":21,"jar_id":null,"account":{"id":2,"name":"BofA · Ahorros"},"category":{"id":21,"name":"Freelance","icon":"work","jar_slug":null},"jar":null,"tags":[{"id":7,"slug":"trabajo","name":"Trabajo","icon":"work","color":"#0EA5E9","type":"user"}]},
  {"id":104,"name":"Farmatodo · mensual","amount":-4640,"amount_tax":0,"description":"Medicinas y farmacia (Bs.)","date":"2026-07-03","active":true,"provider_id":4,"rate_id":2,"transaction_type_id":"2","user_id":7,"account_id":4,"category_id":4,"jar_id":1,"account":{"id":4,"name":"Mercantil"},"category":{"id":4,"name":"Salud","icon":"favorite","jar_slug":"necesidades"},"jar":{"id":1,"name":"Necesidades básicas","color":"#1E3A8A","icon":"home"},"tags":[{"id":2,"slug":"pago_movil","name":"Pago móvil","icon":"smartphone","color":"#0EA5E9","type":"system"}]},
  {"id":105,"name":"La Esquina · cena","amount":-48,"amount_tax":7.68,"description":"Cena con amigos","date":"2026-07-04","active":true,"provider_id":7,"rate_id":1,"transaction_type_id":"2","user_id":7,"account_id":3,"category_id":6,"jar_id":2,"account":{"id":3,"name":"Efectivo USD"},"category":{"id":6,"name":"Restaurantes","icon":"restaurant","jar_slug":"diversion"},"jar":{"id":2,"name":"Diversión","color":"#F59E0B","icon":"celebration"},"tags":[{"id":3,"slug":"impulso","name":"Impulso","icon":"bolt","color":"#EF4444","type":"system"}]},
  {"id":106,"name":"Netflix","amount":-15.99,"amount_tax":0,"description":"Suscripción mensual (EUR)","date":"2026-07-05","active":true,"provider_id":3,"rate_id":3,"transaction_type_id":"2","user_id":7,"account_id":6,"category_id":7,"jar_id":2,"account":{"id":6,"name":"Revolut EUR"},"category":{"id":7,"name":"Entretenimiento","icon":"sports_esports","jar_slug":"diversion"},"jar":{"id":2,"name":"Diversión","color":"#F59E0B","icon":"celebration"},"tags":[{"id":5,"slug":"recurrente","name":"Recurrente","icon":"autorenew","color":"#3B82F6","type":"system"}]},
  {"id":107,"name":"Whole Foods Market","amount":-84.12,"amount_tax":11.6,"description":"Mercado semanal","date":"2026-07-06","active":true,"provider_id":1,"rate_id":1,"transaction_type_id":"2","user_id":7,"account_id":1,"category_id":2,"jar_id":1,"account":{"id":1,"name":"BofA · Corriente"},"category":{"id":2,"name":"Supermercado","icon":"shopping_cart","jar_slug":"necesidades"},"jar":{"id":1,"name":"Necesidades básicas","color":"#1E3A8A","icon":"home"},"tags":[{"id":4,"slug":"planificado","name":"Planificado","icon":"event_available","color":"#10B981","type":"system"}]},
  {"id":108,"name":"Uber · al aeropuerto","amount":-32.6,"amount_tax":0,"description":"Traslado al aeropuerto","date":"2026-07-07","active":true,"provider_id":2,"rate_id":1,"transaction_type_id":"2","user_id":7,"account_id":3,"category_id":3,"jar_id":1,"account":{"id":3,"name":"Efectivo USD"},"category":{"id":3,"name":"Transporte","icon":"directions_car","jar_slug":"necesidades"},"jar":{"id":1,"name":"Necesidades básicas","color":"#1E3A8A","icon":"home"},"tags":[{"id":8,"slug":"viaje","name":"Viaje","icon":"flight","color":"#14B8A6","type":"user"}]}
];

/* AccountOption (src/composables/useTransactionForm.ts)
 *   id: number
 *   name: string
 *   isDefault?: boolean
 *   balance?: number
 *   currencySymbol?: string
 *   currencyCode?: string
 *   currencyId?: number | null
 */
window.SAMPLE_ACCOUNTS = [
  {"id":1,"name":"BofA · Corriente","isDefault":true,"balance":3420.5,"currencySymbol":"$","currencyCode":"USD","currencyId":1},
  {"id":2,"name":"BofA · Ahorros","isDefault":false,"balance":12480,"currencySymbol":"$","currencyCode":"USD","currencyId":1},
  {"id":3,"name":"Efectivo USD","isDefault":false,"balance":340,"currencySymbol":"$","currencyCode":"USD","currencyId":1},
  {"id":4,"name":"Mercantil","isDefault":false,"balance":48500,"currencySymbol":"Bs.","currencyCode":"VES","currencyId":2},
  {"id":5,"name":"Banco de Venezuela","isDefault":false,"balance":21300,"currencySymbol":"Bs.","currencyCode":"VES","currencyId":2},
  {"id":6,"name":"Revolut EUR","isDefault":false,"balance":950.75,"currencySymbol":"€","currencyCode":"EUR","currencyId":3}
];

/* JarRef (src/utils/txCatalog.ts)
 *   id: number
 *   name: string
 *   color?: string
 *   icon?: string
 *   percent?: number
 */
window.SAMPLE_JARS = [
  {"id":1,"name":"Necesidades básicas","color":"#1E3A8A","icon":"home","percent":55},
  {"id":2,"name":"Diversión","color":"#F59E0B","icon":"celebration","percent":10},
  {"id":3,"name":"Ahorro","color":"#10B981","icon":"savings","percent":10},
  {"id":4,"name":"Educación","color":"#0EA5E9","icon":"school","percent":10},
  {"id":5,"name":"Reservas","color":"#8B5CF6","icon":"shield","percent":10}
];

/* CatalogCategory (src/utils/txCatalog.ts)
 *   id: number
 *   name: string
 *   icon: string | null
 *   jar_slug: string | null
 *   assigned_jar_id: number | null
 *   active: number | boolean
 *   user_id: number | null
 *   type: string | null
 *   parent_id: number | null
 */
window.SAMPLE_CATEGORIES = [
  {"id":1,"name":"Vivienda","icon":"home","jar_slug":"necesidades","assigned_jar_id":1,"active":1,"user_id":null,"type":"expense","parent_id":null},
  {"id":2,"name":"Supermercado","icon":"shopping_cart","jar_slug":"necesidades","assigned_jar_id":1,"active":1,"user_id":null,"type":"expense","parent_id":null},
  {"id":3,"name":"Transporte","icon":"directions_car","jar_slug":"necesidades","assigned_jar_id":1,"active":1,"user_id":null,"type":"expense","parent_id":null},
  {"id":4,"name":"Salud","icon":"favorite","jar_slug":"necesidades","assigned_jar_id":1,"active":1,"user_id":null,"type":"expense","parent_id":null},
  {"id":6,"name":"Restaurantes","icon":"restaurant","jar_slug":"diversion","assigned_jar_id":2,"active":1,"user_id":null,"type":"expense","parent_id":null},
  {"id":7,"name":"Entretenimiento","icon":"sports_esports","jar_slug":"diversion","assigned_jar_id":2,"active":1,"user_id":null,"type":"expense","parent_id":null},
  {"id":10,"name":"Educación","icon":"school","jar_slug":"educacion","assigned_jar_id":4,"active":1,"user_id":null,"type":"expense","parent_id":null},
  {"id":11,"name":"Inversión","icon":"trending_up","jar_slug":"ahorro","assigned_jar_id":3,"active":1,"user_id":null,"type":"expense","parent_id":null},
  {"id":12,"name":"Otros","icon":"category","jar_slug":"reservas","assigned_jar_id":5,"active":1,"user_id":null,"type":"expense","parent_id":null},
  {"id":20,"name":"Salario","icon":"payments","jar_slug":null,"assigned_jar_id":null,"active":1,"user_id":null,"type":"income","parent_id":null},
  {"id":21,"name":"Freelance","icon":"work","jar_slug":null,"assigned_jar_id":null,"active":1,"user_id":null,"type":"income","parent_id":null}
];

/* Tag (src/stores/tags.ts)
 *   id: number
 *   slug: string
 *   name: string
 *   description?: string
 *   color: string
 *   icon: string
 *   type: 'system' | 'user'
 */
window.SAMPLE_TAGS = [
  {"id":1,"slug":"comision","name":"Comisión","icon":"toll","color":"#F59E0B","type":"system","description":"Cargo o comisión bancaria asociada al movimiento"},
  {"id":2,"slug":"pago_movil","name":"Pago móvil","icon":"smartphone","color":"#0EA5E9","type":"system","description":"Operación realizada por Pago Móvil P2P"},
  {"id":3,"slug":"impulso","name":"Impulso","icon":"bolt","color":"#EF4444","type":"system","description":"Compra impulsiva, fuera del plan"},
  {"id":4,"slug":"planificado","name":"Planificado","icon":"event_available","color":"#10B981","type":"system","description":"Gasto previsto dentro de tu presupuesto"},
  {"id":5,"slug":"recurrente","name":"Recurrente","icon":"autorenew","color":"#3B82F6","type":"system","description":"Se repite cada período (suscripción, servicio)"},
  {"id":6,"slug":"transferencia_interna","name":"Interna","icon":"sync_alt","color":"#8B5CF6","type":"system","description":"Movimiento entre tus propias cuentas"},
  {"id":7,"slug":"trabajo","name":"Trabajo","icon":"work","color":"#0EA5E9","type":"user","description":"Gasto reembolsable de trabajo"},
  {"id":8,"slug":"viaje","name":"Viaje","icon":"flight","color":"#14B8A6","type":"user","description":"Relacionado con un viaje"}
];

/* ProviderOption (src/composables/useTransactionForm.ts)
 *   id: number
 *   name: string
 *   address?: string
 */
window.SAMPLE_PROVIDERS = [
  {"id":1,"name":"Whole Foods Market"},
  {"id":2,"name":"Uber"},
  {"id":3,"name":"Netflix"},
  {"id":4,"name":"Farmatodo","address":"C.C. Sambil, Caracas"},
  {"id":5,"name":"ACME Corp"},
  {"id":6,"name":"Inmobiliaria Ávila","address":"Av. Francisco de Miranda, Caracas"},
  {"id":7,"name":"Restaurante La Esquina"}
];
