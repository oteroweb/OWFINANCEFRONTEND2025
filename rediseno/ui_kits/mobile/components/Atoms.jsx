/* ─── OW Finance Mobile — Atoms ──────────────────────────────────────────
 * Atomic building blocks used across all screens.
 *
 * RN MAPPING:
 *   <div style={flex}> → <View>
 *   <span>/<p>         → <Text>
 *   <button>           → <TouchableOpacity> wrapping <Text>
 *   inline styles      → StyleSheet.create() — all values are RN-compatible
 *   CSS vars           → import { OWColors, OWRadii } from './tokens'
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useAtomState } = React;

/* ── Avatar ─────────────────────────────────────────────────────────────
 * Props: initial(string), size(number), bg(cssColor), src(url|null)
 * RN: <View><Text> or <Image> */
function Avatar({ initial = 'J', size = 40, bg = 'var(--brand-primary)', src = null }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: src ? 'transparent' : bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0,
    }}>
      {src
        ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.42, color: '#fff' }}>{initial}</span>
      }
    </div>
  );
}

/* ── AIAvatar ────────────────────────────────────────────────────────────
 * Gradient purple sparkle circle — for the AI advisor. */
function AIAvatar({ size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2, flexShrink: 0,
      background: 'linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span className="material-icons" style={{ fontSize: size * 0.5, color: '#fff' }}>auto_awesome</span>
    </div>
  );
}

/* ── StatusDot ───────────────────────────────────────────────────────────
 * Small presence indicator. active=true → green, false → gray. */
function StatusDot({ active = true, size = 8 }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: size / 2,
      background: active ? 'var(--income)' : 'var(--fg-3)',
    }} />
  );
}

/* ── Chip ────────────────────────────────────────────────────────────────
 * Small pill label.
 * RN: <View style={{ borderRadius: 999 }}><Text> */
function MobileChip({ children, variant = 'default', size = 'sm' }) {
  const pad = size === 'sm' ? '4px 10px' : '7px 14px';
  const fs  = size === 'sm' ? 11 : 13;
  const palettes = {
    default:  { bg: 'var(--surface-2)',      color: 'var(--fg-1)' },
    brand:    { bg: 'var(--brand-primary-soft)', color: 'var(--brand-primary-fg-soft)' },
    income:   { bg: 'var(--income-soft)',    color: 'var(--income-fg)' },
    expense:  { bg: 'var(--expense-soft)',   color: 'var(--expense-fg)' },
    warning:  { bg: 'var(--warning-soft)',   color: 'var(--warning-fg)' },
    info:     { bg: 'var(--info-soft)',      color: 'var(--info-fg)' },
    ai:       { bg: 'rgba(139,92,246,0.15)', color: '#C4B5FD' },
  };
  const p = palettes[variant] || palettes.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: fs,
      padding: pad, borderRadius: 'var(--radius-pill)',
      background: p.bg, color: p.color,
    }}>{children}</span>
  );
}

/* ── PillButtonMobile ───────────────────────────────────────────────────
 * RN: <TouchableOpacity><Text> with Animated.spring for press feedback. */
function PillButtonMobile({ children, icon, variant = 'primary', fullWidth = false, onPress, size = 'md' }) {
  const [pressed, setPressed] = useAtomState(false);
  const pad = size === 'sm' ? '9px 16px' : '13px 22px';
  const fs  = size === 'sm' ? 13 : 15;
  const palettes = {
    primary:   { bg: 'var(--brand-primary)',    color: '#fff',          hov: 'var(--brand-primary-hover)' },
    secondary: { bg: 'var(--surface-1)',         color: 'var(--fg-1)',   hov: 'var(--surface-2)', shadow: 'var(--shadow-card)' },
    ghost:     { bg: 'transparent',              color: 'var(--fg-1)',   hov: 'var(--surface-2)' },
    danger:    { bg: 'var(--expense-soft)',       color: 'var(--expense-fg)', hov: 'var(--expense-soft)' },
    aiGrad:    { bg: 'linear-gradient(90deg, #7C3AED 0%, #0EA5E9 100%)', color: '#fff', hov: '' },
    proAccent: { bg: 'var(--info)',               color: '#fff',          hov: '#0284C7' },
  };
  const p = palettes[variant] || palettes.primary;
  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={onPress}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: fs,
        border: 0, borderRadius: 'var(--radius-pill)', cursor: 'pointer',
        padding: pad, width: fullWidth ? '100%' : 'auto',
        background: p.bg, color: p.color,
        boxShadow: p.shadow || 'none',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 80ms, background 160ms',
      }}
    >
      {icon && <span className="material-icons" style={{ fontSize: fs + 3 }}>{icon}</span>}
      {children}
    </button>
  );
}

/* ── IconButtonMobile ───────────────────────────────────────────────────
 * Circular icon button. badge(number) shows a red badge count.
 * RN: <TouchableOpacity> with absolute-positioned badge <View>. */
function IconButtonMobile({ icon, onPress, badge = 0, size = 40, bg = 'var(--surface-1)', color = 'var(--fg-1)' }) {
  return (
    <button onClick={onPress} style={{
      width: size, height: size, border: 0, cursor: 'pointer',
      borderRadius: size / 2, background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: 'var(--shadow-card)', position: 'relative', flexShrink: 0,
    }}>
      <span className="material-icons" style={{ fontSize: 20 }}>{icon}</span>
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: 6, right: 6,
          width: 8, height: 8, borderRadius: 4,
          background: 'var(--expense)',
          boxShadow: '0 0 0 2px var(--bg-canvas)',
        }} />
      )}
    </button>
  );
}

/* ── Toggle ─────────────────────────────────────────────────────────────
 * RN: Use Switch component or custom Animated implementation. */
function MobileToggle({ on, onChange }) {
  return (
    <div onClick={onChange} style={{
      width: 46, height: 26, borderRadius: 13,
      background: on ? 'var(--brand-primary)' : 'var(--surface-3)',
      position: 'relative', cursor: 'pointer', flexShrink: 0,
      transition: 'background 180ms',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 20, height: 20, borderRadius: 10,
        background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        transition: 'left 180ms var(--ease-out)',
      }} />
    </div>
  );
}

/* ── Divider ─────────────────────────────────────────────────────────────
 * RN: <View style={{ height: 1, backgroundColor: borderHairline }}> */
function Divider({ mx = 20 }) {
  return <div style={{ height: 1, background: 'var(--border-hairline)', margin: `0 ${mx}px` }} />;
}

/* ── Money (mobile) ─────────────────────────────────────────────────────
 * Renders masked amount. RN: <Text style={{ fontVariant: ['tabular-nums'] }}> */
function MoneyMobile({ value, className = 't-amount-md', sign = false, hidden = false, color }) {
  const isNeg = value < 0;
  const abs   = Math.abs(value);
  const fmt   = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const prefix = sign ? (isNeg ? '− ' : '+ ') : (isNeg ? '− ' : '');
  return (
    <span className={className} style={{ color: color || 'inherit', fontVariantNumeric: 'tabular-nums' }}>
      {hidden ? '$ ••••••' : `${prefix}$ ${fmt}`}
    </span>
  );
}

Object.assign(window, { Avatar, AIAvatar, StatusDot, MobileChip, PillButtonMobile, IconButtonMobile, MobileToggle, Divider, MoneyMobile });
