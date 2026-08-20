# Prompt de Rediseño — Grupo Familiar y Cuentas Compartidas (Fase 1)

<!-- Generado: 2026-08-08. Fuente: documento de arquitectura "Grupo Familiar & Contabilidad Empresarial"
     (sesión de diseño 2026-08-08, ver .owf/STATE.md / OWF-369+ cuando se abra la épica). Feature
     nuevo — no existe diseño previo en rediseno/ (confirmado por grep, sin coincidencias reales). -->
<!-- Uso: pegar este documento completo como contexto en Claude Design. Es la Fase 1 de 4 de un
     roadmap más grande (grupo familiar → empresas/contabilidad → gastos fijos → nómina). Las
     fases 2-4 se piden por separado, una vez que esta esté confirmada — mismo principio de
     sincronización incremental que el resto del design system. -->

## Objetivo

Diseñar el flujo completo para que un usuario pueda:
1. Crear/gestionar un **grupo familiar** (invitar a otra persona por correo, ver miembros, salir del grupo).
2. **Compartir una cuenta puntual** con un miembro del grupo familiar, eligiendo un nivel de permiso.
3. Ver, del lado de quien recibe el acceso, las **cuentas que otros miembros le compartieron**, con el nivel de permiso claramente visible.

**Restricción de negocio no negociable**: no existe forma de compartir una cuenta con alguien que no sea miembro activo de tu grupo familiar. La UI debe reflejar esto — el flujo para compartir una cuenta arranca siempre desde "¿con quién de tu grupo familiar?", nunca con un buscador libre de usuarios de toda la app.

## Alcance de esta fase (no diseñar todavía)

Fuera de alcance en este pedido — llegan en fases posteriores, no los inventes ahora:
- Empresas / contabilidad empresarial / selector de contexto Personal-Empresa.
- Nómina, empleados, gastos fijos recurrentes.
- Deuda vinculada entre miembros del grupo (queda mencionada como "próximamente" si hace sentido en la UI, pero sin flujo propio).

## Pantallas a diseñar

### 1. Gestión del grupo familiar (nueva, vive en Configuración)
- Estado vacío: "Todavía no tenés un grupo familiar" + CTA "Crear grupo familiar".
- Estado con grupo: nombre del grupo, lista de miembros (avatar, nombre, correo, badge "Vos"/"Miembro"), botón "Invitar a alguien" (por correo), botón "Salir del grupo" (con confirmación).
- Miembro invitado y pendiente de aceptar: estado visual distinto ("Invitación enviada", con opción de reenviar/cancelar).

### 2. Compartir una cuenta (desde la pantalla de detalle/edición de una cuenta existente)
- Sección nueva "Compartir con mi grupo familiar" dentro del detalle de cuenta.
- Si el usuario NO tiene grupo familiar todavía: mensaje corto + link a la pantalla de gestión del punto 1, sin ofrecer compartir.
- Si tiene grupo: lista de miembros del grupo con un selector de nivel de permiso por cada uno — **cuatro niveles, mostrar los cuatro siempre, uno activo a la vez por persona**:
  - `owner` (no seleccionable acá — es implícito del dueño real de la cuenta, no aparece como opción para compartir)
  - `manage` — "Puede gestionar" (crea y edita movimientos)
  - `view_full` — "Puede ver todo" (saldo + movimientos, sin editar)
  - `view_balance` — "Solo ve el saldo"
  - Opción para revocar el acceso por completo (volver a "sin acceso").

### 3. Cuentas compartidas conmigo (nueva sección, en Cuentas o en el sidebar de cuentas existente)
- Lista separada de "Mis cuentas" vs "Compartidas conmigo".
- Cada cuenta compartida muestra: nombre de la cuenta, quién la compartió (avatar+nombre del dueño real), y un badge de nivel de permiso (mismo vocabulario que el punto 2: "Gestión" / "Ver todo" / "Solo saldo").
- Si el permiso es `view_balance`: la card muestra el saldo pero, al intentar entrar al detalle, no lista movimientos (mensaje corto explicando el límite, no un error).

## Restricciones de diseño

- Tokens de color: `var(--brand-primary)`, `var(--brand-primary-soft)`, `var(--surface-1)`, `var(--surface-2)`, `var(--fg-1)`, `var(--fg-2)`, `var(--fg-3)`, `var(--border-hairline)`, `var(--radius-pill)`. Para los 4 niveles de permiso, usar variación de intensidad del mismo `--brand-primary` (no inventar una paleta nueva de colores por nivel — son estados de un mismo concepto, no categorías distintas).
- Tipografía: `var(--font-body)`, `var(--font-display)`.
- Iconos: `<span className="material-icons">` únicamente. Sugeridos: `group` (grupo familiar), `person_add` (invitar), `visibility`/`visibility_off` (ver saldo/detalle), `edit` (gestionar), `lock` (solo saldo).

## Contexto técnico

- **CONTRATO ADJUNTO (obligatorio)**: `DESIGN_CONTRACT.md` + `data/sample-data.contract.js` — ya están cargados en este proyecto de Claude Design. Consumir `window.SAMPLE_*` con esas shapes reales para todo lo que ya existe (cuentas, usuario). Nunca inventar nombres de campo fuera de eso.
- **Fixtures nuevos que vas a necesitar** (no existen todavía en `sample-data.contract.js` — proponelos vos mismo con esta forma exacta, snake_case, para que el port a Vue no tenga que renombrar nada):
  ```js
  window.SAMPLE_FAMILY_GROUP = {
    id: 1,
    name: "Familia Otero",
    members: [
      { user_id: 1, name: "José Otero", email: "jose@ejemplo.com", is_you: true, status: "active" },
      { user_id: 2, name: "Mariangela", email: "mariangela@ejemplo.com", is_you: false, status: "active" },
      { user_id: 3, name: "Invitado Pendiente", email: "pendiente@ejemplo.com", is_you: false, status: "invited" },
    ],
  };

  window.SAMPLE_ACCOUNT_SHARES = [
    {
      account_id: 12,
      account_name: "Banesco Mariangela",
      owner_user_id: 2,
      owner_name: "Mariangela",
      shared_with_user_id: 1,
      permission: "manage", // "manage" | "view_full" | "view_balance"
      balance: 340.5,
      currency_symbol: "$",
    },
  ];
  ```
- Callbacks: usar los 4 del contrato (`onSave`, `onDelete`, `onClose`, `onSelectAction`) para submit/eliminar/cerrar/elegir acción de lista. Para cambiar el nivel de permiso de un miembro puntual, usar `onChange(field, value)` documentado en el header del JSX (ej: `onChange('permission:2', 'view_full')`).
- Estado de formulario: un solo `useState` objeto por pantalla (regla del contrato, sección 3).
- Esto es una pantalla Pro (cuentas como concepto solo existen en Pro — Lite tiene billetera implícita, sin gestión de cuentas). No diseñar variante Lite de "Compartir cuenta".
- Sí diseñar variante mobile de las 3 pantallas (bottom-sheet donde aplique) — sufijo `Sheet.jsx` con comentario `// MOBILE-ONLY`.

## Componentes base más cercanos (para mantener consistencia visual, no para modificar directamente)

- `organisms/AccountsCategoriesTaxes.jsx` — patrón visual de árbol/diálogo de cuentas ya existente (`AccountDialog`, `AccountsTreeView`). La pantalla de detalle de cuenta donde va la sección "Compartir" es una extensión de ese diálogo.
- `organisms/AccountsPanel.jsx` — referencia de cómo se listan cuentas hoy, para la sección nueva "Compartidas conmigo".

## Devuelve

1. `organisms/FamilyGroupPanel.jsx` — pantalla 1 (gestión de grupo).
2. `organisms/AccountShareDialog.jsx` — pantalla 2 (compartir cuenta puntual, pensada para insertarse dentro del flujo de `AccountDialog`).
3. Extensión de `organisms/AccountsPanel.jsx` (o archivo nuevo `organisms/SharedAccountsSection.jsx` si separarlo es más limpio) — pantalla 3.
4. Variantes mobile de las 3 (`*Sheet.jsx`).

Todo listo para reemplazar/agregar en `OWFinanceFrontend2025/rediseno/ui_kits/lite-desktop/organisms/` (desktop) y `.../mobile/components/` (mobile).
