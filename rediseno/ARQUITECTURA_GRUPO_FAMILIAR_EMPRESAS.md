# Arquitectura — Grupo Familiar y Contabilidad Empresarial

> Documento de arquitectura · **pre-implementación**. Generado a partir de la conversación de diseño del 2026-08-08.
> Estado: diseño, sin implementar. Entrega prevista: 4 fases (SDD).
> Este archivo es la **fuente** del módulo 10 de `TASKS.md` y de la Fase 1 ya escrita en
> `PROMPT_REDISENO_GRUPO_FAMILIAR_CUENTAS_COMPARTIDAS.md`. Texto conservado tal como se entregó.

Esquema completo para (1) compartir cuentas entre usuarios dentro de un grupo familiar con permisos granulares, y (2) segmentar la contabilidad personal de una o más contabilidades empresariales — nómina y gastos fijos incluidos — reutilizando el motor de transacciones que ya existe.

---

## 00 · Decisiones confirmadas

Base de todo lo que sigue — quedan registradas acá para que el resto del documento sea trazable a una respuesta concreta tuya.

| Tema | Resolución | Detalle |
|---|---|---|
| Grupo familiar vs. empresa | **Conceptos separados** | Cada persona tiene su economía personal (con o sin grupo familiar) y, aparte, su(s) empresa(s) con contabilidad propia. El grupo familiar es sobre compartir cuentas personales; la empresa es un espacio de acceso totalmente distinto. |
| Alcance contable | **Libros separados + alcance ERP** | Contabilidades independientes (personal + una por empresa) reutilizando el motor actual de transacciones, más nómina real y gastos fijos — sin exigir partida doble formal desde el día uno. |
| "Empleos" | **Nómina / RRHH real** | No es solo una etiqueta de "fuente de ingreso" — es gestión real de empleados, sueldos y pagos dentro de una empresa. |
| Forma de entrega | **Diseño completo ahora** | Este documento cubre el esquema entero. La implementación real se secuencia después en 4 fases (ver Roadmap) para no reescribir el modelo de datos a mitad de camino. |

---

## 01 · Grupo familiar y cuentas compartidas

Traducción de la descripción original a un modelo de datos concreto.

Lo que se describió — "un tag que le indica a mi pareja que somos grupo familiar", "puedo verle el saldo", "me da manejo o solo lectura de una cuenta puntual" — no se resuelve con texto libre en un título o descripción. Un tag de texto no se puede validar, no se puede revocar de forma segura, y no distingue niveles de acceso. La misma idea, con datos reales:

- **Grupo familiar es una entidad propia** (`family_groups`): vos la creás, invitás gente por correo, ellos aceptan. Sin esto, no existe la posibilidad de compartir ninguna cuenta — es el candado pedido ("solo si está agregado al grupo familiar").
- Una vez que dos personas son miembros activos del mismo grupo, el dueño de una cuenta puede **compartirla individualmente con un nivel de permiso específico** — no es todo o nada, y no afecta el resto de sus cuentas.
- La cuenta compartida aparece del lado del invitado con una **etiqueta visual clara** ("Compartida por Mariangela · Solo lectura") — eso es el "tag" descrito, resuelto como UI real en vez de texto parseado.

### Niveles de permiso

| Nivel | Alcance | Ejemplo |
|---|---|---|
| `owner` | Dueño real de la cuenta. Único nivel que permite compartirla con alguien más o eliminarla. | Vos, sobre tus propias cuentas. |
| `manage` | Puede registrar y editar transacciones sobre la cuenta como si fuera propia. No puede compartirla ni borrarla. | "Cuenta Banesco Mariangela", gestión conjunta. |
| `view_full` | Ve saldo y el detalle completo de movimientos, sin poder tocar nada. | Transparencia total, sin riesgo de edición. |
| `view_balance` | Ve únicamente el saldo actual — ni el detalle de movimientos ni el historial. | Lo pedido como "solo mostrarme el balance". |

**Deuda entre miembros del grupo.** El módulo de Deudas ya existe (tabla `debts`), pero hoy una deuda es siempre contra un tercero externo (provider/merchant en texto libre). Se extiende con un campo opcional `counterparty_user_id`: cuando la deuda es con otro usuario del grupo familiar, queda vinculada de verdad — ambos la ven, y saldarla puede generar la transacción correspondiente en las dos cuentas en vez de quedar como una nota suelta.

---

## 02 · Empresas y contabilidades separadas

La decisión de diseño más importante del documento: cómo evitar construir un segundo sistema desde cero.

La alternativa fácil de describir pero cara de construir sería un módulo de "contabilidad empresarial" completamente aparte, con sus propias tablas de transacciones, categorías y reportes. Eso duplica el motor que ya funciona hoy (cántaros, multi-moneda, reportes, IA) y habría que mantenerlo dos veces.

En cambio: **una empresa es un contenedor** (`businesses`), y las tablas que ya existen — `accounts`, `categories`, `transactions` — ganan una columna opcional `business_id`. Vacía, es la contabilidad personal de siempre, sin ningún cambio. Con un valor, esa cuenta/categoría/transacción pertenece a la contabilidad de esa empresa. Mismo motor, mismo código de reportes, mismos cántaros si se quieren usar también a nivel empresa — la única diferencia es el filtro.

El acceso a una empresa funciona igual que a una cuenta compartida — un pivot `business_users` con rol (`owner` / `accountant` / `viewer`), **independiente del grupo familiar**. Tu novia puede darte acceso de `viewer` a su empresa sin que eso implique nada sobre sus cuentas personales, y viceversa.

En la interfaz, esto se ve como un **selector de contexto** — igual al que ya existe para Lite/Pro — con las opciones Personal, [Empresa A], [Empresa B]. Elegís uno y toda la app (Inicio, Transacciones, Cántaros, Reportes) se filtra a esa contabilidad.

### Tablas

**`businesses`** (nueva) — `id` pk · `owner_user_id` fk→users · `name` string · `tax_id` string, null · `currency_id` fk→currencies · `active` boolean

**`business_users`** (nueva) — `business_id` fk→businesses · `user_id` fk→users · `role` owner|accountant|viewer · `invited_by` fk→users

**`accounts`** (extendida) — `business_id` fk, null = personal. Único campo nuevo. El resto de la tabla no cambia.

**`categories`** (extendida) — `business_id` fk, null = personal. Permite categorías propias por empresa (ej: "Nómina", "Alquiler de oficina").

**`transactions`** (extendida) — `business_id` fk, null = personal. Se deriva del `account_id` al crear la transacción — no lo elige el usuario a mano.

**`account_user`** (extendida) — `permission` enum (ver arriba) · `shared_by_user_id` fk→users. Ya existe (`is_owner`, `folder_id`) — se reusa en vez de crear una tabla de shares aparte.

---

## 03 · Nómina / RRHH

Gestión real de empleados por empresa, con generación automática del gasto.

El cálculo de deducciones (seguro social, impuesto sobre la renta, aportes) varía por país y cambia con la ley — no se va a hardcodear. Arranca simple: `payslips` guarda el bruto, un desglose de deducciones como JSON configurable, y el neto. Cuando se defina en qué país(es) se va a usar de verdad, se agregan las reglas de cálculo automático como un servicio aparte — sin tocar el esquema.

**`employees`** (nueva) — `business_id` fk→businesses · `name` string · `position` string · `salary_amount` decimal · `salary_currency_id` fk→currencies · `payment_frequency` monthly|biweekly · `status` active|terminated · `linked_user_id` fk, null (si el empleado también usa la app, conecta su registro con su cuenta real).

**`payroll_runs`** (nueva) — `business_id` fk→businesses · `period_start` date · `period_end` date · `status` draft|approved|paid

**`payslips`** (nueva) — `payroll_run_id` fk · `employee_id` fk · `gross_amount` decimal · `deductions` json · `net_amount` decimal · `transaction_id` fk, null hasta pagar. Al marcar "pagado" se crea la transacción de gasto real en la contabilidad de la empresa.

---

## 04 · Gastos fijos recurrentes

Un solo mecanismo para ambos mundos — el condominio de la casa y la nómina de la empresa son, técnicamente, el mismo tipo de evento: algo que se repite y hay que registrar.

**`recurring_expenses`** (nueva) — `user_id` fk, null si es de empresa · `business_id` fk, null si es personal · `name` string · `amount` decimal · `account_id` cuenta de pago por defecto · `category_id` fk→categories · `frequency` weekly|monthly|annual · `next_run_date` date · `auto_create` boolean.

Exactamente uno de `user_id`/`business_id` va lleno. `auto_create=false` solo recuerda; `true` genera la transacción sola.

---

## 05 · Relaciones (resumen del diagrama ER)

Las tablas en **negrita** son nuevas; el resto ya existe hoy.

- `USERS` — miembro de → **`FAMILY_GROUP_MEMBERS`** ← agrupa — **`FAMILY_GROUPS`**
- `USERS` — registra → `DEBTS` (con `counterparty_user_id` opcional hacia otro `USERS`)
- `USERS` — posee / accede → `ACCOUNT_USER` (`permission`: owner·manage·view_full·view_balance, `shared_by_user_id` FK) ← compartida vía — `ACCOUNTS`
- `USERS` — dueño de → **`BUSINESSES`** — da acceso → **`BUSINESS_USERS`** ← accede a — `USERS`
- **`BUSINESSES`** — `business_id` → `CATEGORIES`, `ACCOUNTS`
- **`BUSINESSES`** — corre → **`PAYROLL_RUNS`** — genera → **`PAYSLIPS`** ← recibe — **`EMPLOYEES`** ← emplea — **`BUSINESSES`**
- **`PAYSLIPS`** — al pagar → `TRANSACTIONS`
- `ACCOUNTS` — vía `payment_transactions` → `TRANSACTIONS`
- **`RECURRING_EXPENSES`** — auto-genera → `TRANSACTIONS`; su origen es personal (`user_id`) o empresarial (`business_id`)

---

## 06 · Roadmap por fases

El esquema se diseña completo hoy; se construye en este orden para que cada entrega sea usable por sí sola y nada quede a medio migrar.

**Fase 1 — Grupo familiar y cuentas compartidas.** Crear/invitar grupo familiar, compartir una cuenta puntual con un nivel de permiso, ver cuentas compartidas conmigo. Es la base de confianza — sin esto no hay nada más que compartir.
`family_groups` · `family_group_members` · `account_user.permission` · UI: compartir cuenta

**Fase 2 — Empresas y contabilidad segmentada.** Crear una empresa, invitar acceso, selector de contexto Personal/Empresa en toda la app. Cuentas, categorías y transacciones ya filtran por `business_id` — reportes y cántaros funcionan igual que hoy, solo que escopados.
`businesses` · `business_users` · `accounts.business_id` · selector de contexto

**Fase 3 — Gastos fijos recurrentes.** Configurar un gasto que se repite (condominio, alquiler) en cualquiera de los dos contextos, con generación automática o recordatorio.
`recurring_expenses` · job de generación · notificaciones

**Fase 4 — Nómina / RRHH.** Alta de empleados, corridas de nómina, pago que genera el gasto real en la contabilidad de la empresa. Cálculo de deducciones se define según país objetivo, no antes.
`employees` · `payroll_runs` · `payslips`

---

## 07 · Preguntas abiertas antes de arrancar Fase 1

No bloquean este documento, pero sí cambian detalles de implementación — mejor cerrarlas antes del primer commit.

1. **¿Un usuario puede pertenecer a más de un grupo familiar?** Ej: tu grupo con tu pareja, y por separado un grupo con tus padres. Afecta si `family_group_members` es 1-a-muchos o muchos-a-muchos del lado del usuario.
2. **El permiso `manage` sobre una cuenta ajena, ¿mueve saldo real o queda registrado como "en nombre de"?** Es decir, si vos operás la cuenta Banesco de Mariangela, ¿la transacción queda a tu nombre con una marca de "operado por" para trazabilidad, o es indistinguible de que ella la haya hecho?
3. **¿Cántaros por empresa, o los cántaros siguen siendo solo un concepto personal?** Si una empresa también presupuesta por cántaros, se extiende igual que `accounts`/`categories`. Si no, se documenta como fuera de alcance explícitamente.
4. **¿En qué país(es) corre la nómina real primero?** Determina qué reglas de deducción se construyen en la Fase 4 (o si arranca 100% manual sin cálculo automático).
