/* ─── Desktop Quick Action Modal ────────────────────────────────────────
 * Lite + Pro modal for adding a movement.
 *
 *   Step 1 — pick type   (Gasto / Ingreso / Transferir) — segmented
 *   Step 2 — pick method (Escribir / Voz / Foto / Auto IA) — tiles
 *
 * Emits onSelectAction("<type>:<method>"), e.g. "expense:voice".
 * The shell parses and forwards to SmartTransactionModal.
 *
 * Props: open, onClose, onOpenAI, onSelectAction, mode('lite'|'pro')
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

const DQM_TYPES = [
  { id: 'expense',  label: 'Gasto',      icon: 'arrow_outward',  color: 'var(--expense)' },
  { id: 'income',   label: 'Ingreso',    icon: 'arrow_downward', color: 'var(--income)'  },
  { id: 'transfer', label: 'Transferir', icon: 'swap_horiz',     color: '#8B5CF6'        },
];

const DQM_PLANS = [
  {
    id: 'debt',
    label: 'Pago de deuda',
    sub: 'Cuota Cashea, tarjeta, préstamo o personal.',
    icon: 'credit_card',
    accent: '#EF4444',
    tint: 'rgba(239,68,68,0.10)',
    badge: 'Cashea',
  },
  {
    id: 'dream',
    label: 'Aporte a sueño',
    sub: 'Sumá al ahorro de una meta de largo plazo.',
    icon: 'auto_awesome',
    accent: '#8B5CF6',
    tint: 'rgba(139,92,246,0.10)',
  },
  {
    id: 'jar',
    label: 'Aporte a jar',
    sub: 'Movimiento hacia un jar de corto plazo.',
    icon: 'savings',
    accent: 'var(--brand-primary)',
    tint: 'var(--brand-primary-soft)',
  },
];

const DQM_METHODS = [
  {
    id: 'text',
    label: 'Escribir',
    sub:  'Completá monto, comercio y categoría paso a paso.',
    icon: 'edit_note',
    accent: 'var(--brand-primary)',
    tint:   'var(--brand-primary-soft)',
  },
  {
    id: 'voice',
    label: 'Nota de voz',
    sub:  'Dictá la transacción — la IA la transcribe y categoriza.',
    icon: 'mic',
    accent: '#0EA5E9',
    tint:   'rgba(14,165,233,0.10)',
    badge:  'Transcripción IA',
  },
  {
    id: 'photo',
    label: 'Foto de factura',
    sub:  'Sacá la foto y se extraen todos los datos del recibo.',
    icon: 'receipt_long',
    accent: '#F59E0B',
    tint:   'rgba(245,158,11,0.10)',
    chips:  ['Monto', 'Comercio', 'Items', 'Fecha', 'IVA'],
  },
  {
    id: 'autoai',
    label: 'Auto IA',
    sub:  'Pegá un mensaje o describí en lenguaje natural.',
    icon: 'auto_awesome',
    accent: '#8B5CF6',
    tint:   'rgba(139,92,246,0.10)',
    badge:  'Beta',
  },
];

function DesktopQuickModal({ open, onClose, onOpenAI, onSelectAction, mode = 'lite' }) {
  const [type, setType] = React.useState('expense');
  const isMobile = useViewportMobile();

  React.useEffect(() => {
    if (!open) return;
    setType('expense'); // reset on each open
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const choose = (methodId) => {
    onClose();
    const mapped = methodId === 'autoai' ? 'text' : methodId;
    onSelectAction && onSelectAction(`${type}:${mapped}`);
  };

  const choosePlan = (planId) => {
    onClose();
    onSelectAction && onSelectAction(`${planId}:text`);
  };

  const activeType = DQM_TYPES.find(t => t.id === type);

  return (
    <div
      onClick={onClose}
      style={{
        position: isMobile ? 'absolute' : 'fixed', inset: 0, zIndex: 'var(--z-modal)',
        background: 'rgba(10,14,28,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : 16, boxSizing: 'border-box',
        animation: 'dqmFade 200ms var(--ease-out)',
      }}
    >
      <style>{`
        @keyframes dqmFade { from{opacity:0} to{opacity:1} }
        @keyframes dqmRise { from{opacity:0;transform:scale(0.97) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes dqmSheet { from{transform:translateY(100%)} to{transform:translateY(0)} }
      `}</style>

      <div
        role="dialog" aria-label="Agregar movimiento"
        onClick={e => e.stopPropagation()}
        style={isMobile ? {
          position: 'absolute', left: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: 'none', boxSizing: 'border-box',
          maxHeight: '90%', overflow: 'auto',
          background: 'var(--surface-1)',
          borderRadius: '22px 22px 0 0',
          padding: '10px 18px calc(20px + env(safe-area-inset-bottom))',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.28)',
          animation: 'dqmFade 200ms var(--ease-out)',
        } : {
          width: 'min(620px, 100%)',
          maxHeight: '92vh', overflow: 'auto',
          background: 'var(--surface-1)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-popover)',
          animation: 'dqmRise 240ms var(--ease-out)',
        }}
      >
        {/* Grab handle (mobile sheet) */}
        {isMobile && (
          <div style={{ width: 38, height: 4, borderRadius: 999, background: 'var(--border-strong, var(--border-hairline))', margin: '0 auto 14px', flexShrink: 0 }} />
        )}
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <div className="t-eyebrow">{t('Acción rápida')}</div>
            <div className="t-h2" style={{ marginTop: 4 }}>{t('¿Qué quieres registrar?')}</div>
          </div>
          <IconButton icon="close" ariaLabel="Cerrar" onClick={onClose} />
        </div>

        {/* ── Step 1 · Type ───────────────────────────────────── */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
              {t('Tipo de movimiento')}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>
              {t('Paso 1 de 2')}
            </span>
          </div>

          <div style={{
            display: 'flex', gap: 4,
            background: 'var(--surface-2)',
            borderRadius: 'var(--radius-pill)',
            padding: 4,
          }}>
            {DQM_TYPES.map(t => {
              const active = type === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  style={{
                    flex: 1, border: 0, cursor: 'pointer',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: active ? 'var(--surface-1)' : 'transparent',
                    color: active ? t.color : 'var(--fg-2)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxShadow: active ? 'var(--shadow-card)' : 'none',
                    transition: 'all 160ms var(--ease-out)',
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 16 }}>{t.icon}</span>
                  {window.t(t.label)}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Step 2 · Input method ───────────────────────────── */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
              {t('¿Cómo lo querés ingresar?')}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>
              {t('Paso 2 de 2')}
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}>
            {DQM_METHODS.map(m => (
              <DQMMethodTile
                key={m.id}
                method={m}
                typeColor={activeType.color}
                onPress={() => choose(m.id)}
              />
            ))}
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: 'var(--border-hairline)', margin: '0 0 18px' }} />

        {/* ── Special plans · Deudas / Sueños / Jars ────────── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
              {t('O registrá un movimiento especial')}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 10 }}>
            {DQM_PLANS.map(p => (
              <button
                key={p.id}
                onClick={() => choosePlan(p.id)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = p.accent; e.currentTarget.style.background = p.tint; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-hairline)'; e.currentTarget.style.background = 'var(--surface-1)'; }}
                style={{
                  textAlign: 'left', cursor: 'pointer',
                  border: '1px solid var(--border-hairline)',
                  background: 'var(--surface-1)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '12px 12px 14px',
                  display: 'flex', flexDirection: 'column', gap: 6,
                  transition: 'all 160ms var(--ease-out)',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                    background: p.tint,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span className="material-icons" style={{ fontSize: 16, color: p.accent }}>{p.icon}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--fg-1)' }}>{t(p.label)}</span>
                  {p.badge && (
                    <span style={{
                      marginLeft: 'auto',
                      fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700,
                      padding: '2px 6px', borderRadius: 'var(--radius-pill)',
                      background: p.tint, color: p.accent,
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}>
                      {t(p.badge)}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)', lineHeight: 1.4 }}>
                  {t(p.sub)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: 'var(--border-hairline)', margin: '0 0 18px' }} />

        {/* AI Advisor CTA */}
        <button
          onClick={() => { onClose(); onOpenAI && onOpenAI(); }}
          style={{
            width: '100%', border: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '14px',
            borderRadius: 'var(--radius-pill)',
            background: 'linear-gradient(90deg, #7C3AED 0%, #2563EB 60%, #0EA5E9 100%)',
            color: '#fff',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
            boxShadow: '0 6px 24px rgba(124,58,237,0.30)',
            transition: 'opacity 160ms',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <span className="material-icons" style={{ fontSize: 20 }}>psychology</span>
          {t('¿Tenés una duda? Hablá con el Asesor IA')}
        </button>
      </div>
    </div>
  );
}

/* ─── Method tile ──────────────────────────────────────────────────── */
function DQMMethodTile({ method: m, typeColor, onPress }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onPress}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: 'left',
        border: '1px solid',
        borderColor: hover ? m.accent : 'var(--border-hairline)',
        cursor: 'pointer',
        background: hover ? m.tint : 'var(--surface-1)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 14px 16px',
        display: 'flex', flexDirection: 'column', gap: 8,
        transition: 'all 160ms var(--ease-out)',
        position: 'relative',
        minHeight: 116,
      }}
    >
      {/* Top row: icon + label + badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-md)',
          background: m.tint,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span className="material-icons" style={{ fontSize: 20, color: m.accent }}>{m.icon}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>
            {t(m.label)}
          </span>
          {m.badge && (
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
              padding: '3px 7px',
              borderRadius: 'var(--radius-pill)',
              background: m.tint, color: m.accent,
              textTransform: 'uppercase',
            }}>
              {t(m.badge)}
            </span>
          )}
        </div>
      </div>

      {/* Subline */}
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.45 }}>
        {t(m.sub)}
      </span>

      {/* Detail chips (photo only) */}
      {m.chips && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 'auto', paddingTop: 4 }}>
          {m.chips.map(c => (
            <span key={c} style={{
              fontFamily: 'var(--font-body)',
              fontSize: 10.5, fontWeight: 600,
              padding: '3px 7px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--surface-2)',
              color: 'var(--fg-2)',
              border: '1px solid var(--border-hairline)',
            }}>
              {t(c)}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

Object.assign(window, { DesktopQuickModal });
