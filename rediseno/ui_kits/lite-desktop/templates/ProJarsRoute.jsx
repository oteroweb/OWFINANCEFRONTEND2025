/* global React */
/* ProJarsRoute — ensambla JarsProConfigPage (organisms/JarsProConfig.jsx +
 * organisms/JarsProEditor.jsx). Antes de este archivo, ProShell.jsx enrutaba
 * 'jars' al mismo JarsRoute.jsx que usa LiteShell.jsx — violando
 * DESIGN_CONTRACT.md §5 (Lite y Pro deben ser archivos separados, nunca un
 * componente compartido con lógica de modo). JarsProConfigPage ya existía
 * completo (KPI bar, resumen del mes, tabla, configuración global, editor de
 * fila con drag&drop de categorías, modal de ajuste, registrar uso) pero
 * nunca estaba conectado a ningún shell ni cargado en index.html — quedaba
 * huérfano. Este archivo solo lo conecta, sin inventar UI nueva. */
function ProJarsRoute({ hidden }) {
  return <JarsProConfigPage hidden={hidden} />;
}

Object.assign(window, { ProJarsRoute });
