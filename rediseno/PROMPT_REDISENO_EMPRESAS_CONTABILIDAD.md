# Prompt de Rediseño — Empresas y Contabilidad Segmentada (Fase 2)

<!-- Generado: 2026-08-27. Fuente: rediseno/ARQUITECTURA_GRUPO_FAMILIAR_EMPRESAS.md §02 (sesión de
     diseño 2026-08-08). Fase 2 de 4 del roadmap "Grupo Familiar y Contabilidad Empresarial" —
     Fase 1 (grupo familiar + cuentas compartidas) ya está diseñada, portada a Vue, deployada en
     prod y validada con smoke test real (OWF-369, ver .owf/TASKS.md). -->
<!-- Uso: pegar este documento completo como contexto en Claude Design. Las Fases 3 (gastos fijos
     recurrentes) y 4 (nómina/RRHH) se piden por separado, cada una cuando ésta esté confirmada. -->

## Objetivo

Diseñar el flujo completo para que un usuario pueda:
1. Crear una o más **empresas** propias, cada una con su contabilidad completamente separada de la personal.
2. Dar **acceso a otras personas** a una empresa (rol `owner` / `accountant` / `viewer`) — independiente del grupo familiar de la Fase 1.
3. **Cambiar de contexto** — Personal, Empresa A, Empresa B — y que toda la app (Inicio, Transacciones, Cántaros, Análisis) se filtre a esa contabilidad, sin abrir una app aparte.

**Decisión de arquitectura ya tomada, no rediseñar el motor**: una empresa NO es un sistema contable nuevo. Reutiliza exactamente las mismas pantallas de Transacciones, Cántaros, Categorías y Análisis que ya existen para lo personal — la única diferencia es el filtro de contexto. Por eso esta fase diseña únicamente las pantallas de **gestión de la empresa** y el **selector de contexto**, no una segunda copia de la app.

## Alcance de esta fase (no diseñar todavía)

Fuera de alcance en este pedido — llegan en fases posteriores, no las inventes ahora:
- Gastos fijos recurrentes (Fase 3).
- Nómina, empleados, corridas de pago (Fase 4).
- Reportes o cántaros exclusivos de empresa — usan las mismas pantallas ya diseñadas, filtradas por contexto; no hace falta tocarlas en esta fase.

## Pantallas a diseñar

### 1. Gestión de empresas (nueva, vive en Configuración — misma zona que Grupo Familiar de la Fase 1)
- Estado vacío: "Todavía no tenés una empresa" + CTA "Crear empresa".
- Formulario de alta: nombre, RIF/tax ID (opcional), moneda de la contabilidad.
- Estado con una o más empresas: lista de tarjetas — nombre, moneda, tu rol en ella (`Dueño` si sos el `owner_user_id`, o el rol que te dieron), botón para entrar a gestionarla.
- Detalle de una empresa (al entrar): nombre editable, lista de personas con acceso (avatar, nombre, correo, badge de rol), botón "Dar acceso" (invitar por correo con selector de rol `accountant`/`viewer` — `owner` no se asigna, es quien la creó), botón "Eliminar empresa" (con confirmación fuerte — explicar que las cuentas/transacciones de esa empresa dejan de ser accesibles, no que se borran).
- Invitación pendiente de aceptar: mismo patrón visual que grupo familiar (badge "Invitación enviada", con Reenviar/Cancelar para quien invitó, y **Aceptar/Rechazar para quien la recibe** — ver nota de consistencia abajo).

**Nota de consistencia obligatoria**: la Fase 1 se lanzó con un bug real — el JSX de `FamilyGroupPanel` solo mostraba Reenviar/Cancelar (perspectiva de quien invita) y nunca Aceptar/Rechazar (perspectiva de quien es invitado), así que nadie podía aceptar una invitación real hasta que se corrigió en Vue. Para esta pantalla de empresa, diseñar las DOS perspectivas desde el arranque: si la fila de invitación pendiente sos vos, mostrás Aceptar/Rechazar; si es de otra persona que vos invitaste, mostrás Reenviar/Cancelar. Nunca las dos juntas en la misma fila.

### 2. Selector de contexto (nuevo, en el header/sidebar de la app — visible en todo momento)
- Mismo patrón visual que el selector Lite/Pro que ya existe en Configuración (`Modo de la app`), pero para elegir entre Personal y cada empresa a la que el usuario tiene acceso.
- Estado sin empresas: no se muestra el selector — la app sigue mostrando solo Personal como hoy, sin agregar ruido a alguien que nunca creó una empresa.
- Estado con 1+ empresas: selector visible con las opciones "Personal" + una por empresa, mostrando el nombre y un ícono/color distintivo por contexto.
- El contexto elegido debe quedar claro en toda la navegación (ej. una etiqueta persistente cerca del logo o el saludo de Inicio: "Viendo: Empresa Otero SRL"), para que nunca sea ambiguo en qué contabilidad estás parado.

### 3. Vista de "Mis empresas" dentro de cada tarjeta (resumen rápido, opcional pero recomendado)
- En la tarjeta de cada empresa en la pantalla 1, mostrar un resumen mínimo (saldo total de sus cuentas, o cantidad de cuentas) — mismo patrón visual que usa `SharedAccountsSection.jsx` de la Fase 1 para mostrar saldo por cuenta, no inventar un componente de resumen nuevo.

## Restricciones de diseño

- Tokens de color: `var(--brand-primary)`, `var(--brand-primary-soft)`, `var(--surface-1)`, `var(--surface-2)`, `var(--fg-1)`, `var(--fg-2)`, `var(--fg-3)`, `var(--border-hairline)`, `var(--radius-pill)`. Para los 3 roles de acceso (`owner`/`accountant`/`viewer`), mismo criterio que los niveles de permiso de cuentas compartidas: variación de intensidad de un mismo hue, no una paleta nueva por rol.
- Tipografía: `var(--font-body)`, `var(--font-display)`.
- Iconos: `<span className="material-icons">` únicamente. Sugeridos: `business`/`storefront` (empresa), `person_add` (dar acceso), `swap_horiz` (selector de contexto), `admin_panel_settings` (rol accountant), `visibility` (rol viewer).

## Contexto técnico

- **CONTRATO ADJUNTO (obligatorio)**: `DESIGN_CONTRACT.md` + `data/sample-data.contract.js` — ya cargados en este proyecto. Consumir `window.SAMPLE_*` con esas shapes reales para todo lo que ya existe (usuario, moneda). Nunca inventar nombres de campo fuera de eso.
- **Reusar el vocabulario de permisos de la Fase 1** donde aplique: `window.OWF_PERMISSIONS` y los helpers `owfPermission()`/`owfPermTint()` de `ui_kits/lite-desktop/data/family-data.jsx` ya existen — para los roles de empresa (`owner`/`accountant`/`viewer`) seguí el mismo patrón (array de objetos `{id, label, badge, icon, weight, desc}` + helper de tinte), en un archivo nuevo `ui_kits/lite-desktop/data/business-data.jsx` para no mezclar los dos vocabularios.
- **Fixtures nuevos que vas a necesitar** (no existen todavía en `sample-data.contract.js` — proponelos vos mismo con esta forma exacta, snake_case, para que el port a Vue no tenga que renombrar nada):
  ```js
  window.SAMPLE_BUSINESSES = [
    {
      id: 1,
      name: "Otero Consultoría SRL",
      tax_id: "J-12345678-9",
      currency_code: "USD",
      owner_user_id: 1,
      your_role: "owner", // "owner" | "accountant" | "viewer" — tu rol en ESTA empresa
      accounts_count: 3,
      total_balance: 4820.5,
      currency_symbol: "$",
      members: [
        { user_id: 1, name: "José Otero", email: "jose@ejemplo.com", role: "owner", is_you: true, status: "active" },
        { user_id: 4, name: "Contadora Ana", email: "ana@ejemplo.com", role: "accountant", is_you: false, status: "active" },
        { user_id: 5, name: "Invitado Pendiente", email: "pendiente@ejemplo.com", role: "viewer", is_you: false, status: "invited" },
      ],
    },
  ];

  window.BUSINESS_ROLES = [
    { id: "owner",      label: "Dueño",      badge: "Dueño",      icon: "verified_user",         weight: 100, desc: "Control total: cuentas, acceso y eliminar la empresa." },
    { id: "accountant", label: "Contador",   badge: "Contador",   icon: "admin_panel_settings",  weight: 65,  desc: "Registra y edita movimientos, no puede dar ni quitar acceso." },
    { id: "viewer",     label: "Solo ver",   badge: "Solo ver",   icon: "visibility",             weight: 30,  desc: "Ve cuentas y movimientos, sin poder editar." },
  ];
  ```
- Callbacks: usar los 4 del contrato (`onSave`, `onDelete`, `onClose`, `onSelectAction`) para submit/eliminar/cerrar/elegir acción de lista. Para aceptar/rechazar una invitación de empresa (misma lógica que se corrigió en la Fase 1), usar `onSave({ action: 'accept-invite', businessId })` / `onSave({ action: 'decline-invite', businessId })`. Para cambiar de contexto activo, `onSelectAction('switch-context:personal')` / `onSelectAction('switch-context:business:1')`.
- Estado de formulario: un solo `useState` objeto por pantalla (regla del contrato, sección 3).
- Esto es una pantalla Pro (empresas como concepto de gestión avanzada). El selector de contexto sí debe funcionar en Lite también si el usuario tiene una empresa — pero la pantalla de gestión detallada (dar acceso, editar) es Pro-only. Si hace falta una versión simplificada del selector para Lite, diseñarla como parte del header Lite existente, no como pantalla nueva.
- Sí diseñar variante mobile de las pantallas 1 y 2 (bottom-sheet donde aplique) — sufijo `Sheet.jsx` con comentario `// MOBILE-ONLY`.

## Componentes base más cercanos (para mantener consistencia visual, no para modificar directamente)

- `organisms/FamilyGroupPanel.jsx` — patrón visual y de interacción más cercano: gestión de un grupo con miembros, invitación por correo, estados pendiente/activo. La pantalla de gestión de empresa es una variación de este mismo patrón con roles en vez de niveles de acceso a cuenta.
- `ui_kits/lite-desktop/organisms/ConfigRoute.jsx` (o el archivo que resuelva el selector `Modo de la app` Lite/Pro) — referencia directa para el selector de contexto Personal/Empresa.
- `ui_kits/lite-desktop/data/family-data.jsx` — patrón de vocabulario compartido (`OWF_PERMISSIONS` + helpers) a replicar para `BUSINESS_ROLES`.

## Devuelve

1. `organisms/BusinessPanel.jsx` — pantalla 1 (lista de empresas + detalle de gestión de una).
2. `organisms/ContextSwitcher.jsx` — pantalla 2 (selector Personal/Empresa, para header o sidebar).
3. `data/business-data.jsx` — fixtures + vocabulario de roles (`SAMPLE_BUSINESSES`, `BUSINESS_ROLES`, helpers).
4. Variantes mobile de las pantallas 1 y 2 (`*Sheet.jsx`).

Todo listo para agregar en `OWFinanceFrontend2025/rediseno/ui_kits/lite-desktop/organisms/` y `.../data/` (desktop) y `.../mobile/components/` (mobile).
