/* ─── Atoms · Primitives ────────────────────────────────────────────────
 * Pure visual primitives — no domain knowledge.
 *   Money · Eyebrow · Card · Avatar
 * (SectionHeader lives in molecules/ since it composes a heading + action.)
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

/* ---------- useViewportMobile — true when the demo frame is in mobile mode ----------
 * The toolbar toggles `body.viewport-mobile`. Components observe that class so
 * they can render a genuinely different layout on phones (not just CSS reflow). */
function useViewportMobile() {
  const [mobile, setMobile] = React.useState(
    typeof document !== 'undefined' && document.body.classList.contains('viewport-mobile')
  );
  React.useEffect(() => {
    const read = () => setMobile(document.body.classList.contains('viewport-mobile'));
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return mobile;
}

/* ---------- useAppTheme — current theme ('light'|'dark'), reactive ---------- */
function useAppTheme() {
  const read = () => (typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-theme') || 'light') : 'light');
  const [theme, setTheme] = React.useState(read);
  React.useEffect(() => {
    const obs = new MutationObserver(() => setTheme(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    setTheme(read());
    return () => obs.disconnect();
  }, []);
  return theme;
}

/* ---------- Money — masks digits when visibility is off ---------- */
function Money({ value, currency = '$', className = 't-amount-md', sign = false, hidden = false, color }) {
  const isNeg = value < 0;
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const display = hidden ? '••••••' : formatted;
  const prefix = sign ? (isNeg ? '− ' : '+ ') : (isNeg ? '− ' : '');
  return (
    <span className={className} style={{ color: color || 'inherit' }}>
      {prefix}{currency} {display}
    </span>
  );
}

/* ---------- Eyebrow ---------- */
function Eyebrow({ children }) {
  return <div className="t-eyebrow">{children}</div>;
}

/* ---------- Card ---------- */
function Card({ children, hero = false, padding = 24, style = {} }) {
  return (
    <div style={{
      background: 'var(--surface-1)',
      borderRadius: hero ? 'var(--radius-xl)' : 'var(--radius-lg)',
      padding: hero ? 32 : padding,
      boxShadow: hero ? 'var(--shadow-float)' : 'var(--shadow-card)',
      ...style,
    }}>{children}</div>
  );
}

/* ---------- Avatar (initial) ---------- */
function Avatar({ initial, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 'var(--radius-pill)',
      background: 'var(--brand-primary)', color: 'var(--fg-on-brand)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: size * 0.42,
    }}>{initial}</div>
  );
}

Object.assign(window, { Money, Eyebrow, Card, Avatar, useViewportMobile, useAppTheme });
