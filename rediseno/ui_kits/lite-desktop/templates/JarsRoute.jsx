/* global React */
/* JarsRoute (Lite) — ensambla JarsLiteConfigPage (organisms/JarsLiteConfig.jsx),
 * implementando PROMPT_REDISENO_CANTAROS.md §2 completo: card resumen,
 * selector de periodo, lista con drag reorder + toggle activo inline,
 * modales de detalle/editar/nuevo. Reemplaza el placeholder mínimo (hero +
 * grid, sin acciones reales) que vivía acá antes.
 *
 * Antes de esto, tanto LiteShell.jsx como ProShell.jsx enrutaban 'jars' a
 * este mismo componente — violación de DESIGN_CONTRACT.md §5. Ya se
 * corrigió: Pro usa `ProJarsRoute` (organisms/JarsProConfig.jsx +
 * JarsProEditor.jsx), este archivo queda solo para Lite.
 *
 * `onQuickAdd` es opcional (LiteShell ya lo pasa a HomeRoute con el mismo
 * nombre) — si no se recibe, los botones Agregar/Retirar/Registrar ingreso
 * del detalle y del estado vacío simplemente no hacen nada. */
function JarsRoute({ hidden, onQuickAdd }) {
  return <JarsLiteConfigPage hidden={hidden} onQuickAdd={onQuickAdd} />;
}

Object.assign(window, { JarsRoute });
