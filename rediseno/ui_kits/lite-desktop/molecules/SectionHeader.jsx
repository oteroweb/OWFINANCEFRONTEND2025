/* ─── Molecule · SectionHeader ──────────────────────────────────────────
 * A section heading (h2) plus an optional trailing action node.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
      <h2 className="t-h2" style={{ margin: 0 }}>{title}</h2>
      {action}
    </div>
  );
}

Object.assign(window, { SectionHeader });
