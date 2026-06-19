/* ─── Smart Transaction Sheet — Mobile ──────────────────────────────────
 * Bottom sheet for transaction entry with text · voice · photo.
 * Claude parses the input into a structured transaction preview.
 * Props: open, onClose, initialType, initialTab
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useSTSState, useEffect: useSTSEffect } = React;

const STS_SYSTEM = `You are a financial transaction parser for OW Finance 2026.
Parse the user's description. Return ONLY valid JSON:
{
  "type": "expense"|"income"|"transfer",
  "amount": <positive number>,
  "currency": "USD"|"EUR"|"VES"|"COP"|"CLP",
  "merchant": "<name>",
  "category": "Vivienda"|"Supermercado"|"Transporte"|"Salud"|"Entretenimiento"|"Educación"|"Ingresos"|"Jar"|"Deuda"|"Otro",
  "account": "<account name or Cuenta principal>",
  "confidence": "high"|"medium"|"low",
  "suggestion": "<1 sentence in Spanish>"
}`;

const STS_TYPE_CFG = {
  expense:  { label: 'Gasto',      color: 'var(--expense)',  icon: 'arrow_outward',  placeholder: 'Ej: Gasté $45 en Whole Foods, cuenta BofA' },
  income:   { label: 'Ingreso',    color: 'var(--income)',   icon: 'arrow_downward', placeholder: 'Ej: Recibí $1,200 de cliente, factura 043' },
  transfer: { label: 'Transferir', color: '#8B5CF6',         icon: 'swap_horiz',     placeholder: 'Ej: Moví $200 al jar de vacaciones' },
};

const STS_VOICE_MOCKS = {
  expense:  'Gasté $45 en Whole Foods, BofA corriente, supermercado',
  income:   'Recibí $1,200 de pago freelance, cuenta ahorros',
  transfer: 'Moví $200 al jar de vacaciones desde BofA',
};

function SmartTransactionSheet({ open, onClose, initialType = 'expense', initialTab = 'text' }) {
  const [type,      setType]      = useSTSState(initialType);
  const [tab,       setTab]       = useSTSState(initialTab);
  const [text,      setText]      = useSTSState('');
  const [loading,   setLoading]   = useSTSState(false);
  const [result,    setResult]    = useSTSState(null);
  const [error,     setError]     = useSTSState(null);
  const [recording, setRecording] = useSTSState(false);

  useSTSEffect(() => {
    if (open) { setType(initialType); setTab(initialTab); setText(''); setResult(null); setError(null); setRecording(false); }
  }, [open, initialType, initialTab]);

  if (!open) return null;
  const cfg = STS_TYPE_CFG[type];

  const analyze = async () => {
    if (!text.trim() || loading) return;
    setLoading(true); setError(null);
    try {
      const raw = await window.claude.complete({ system: STS_SYSTEM, messages: [{ role: 'user', content: text }] });
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('no json');
      setResult(JSON.parse(match[0]));
    } catch { setError('No pude interpretar. Sé más específico con monto y descripción.'); }
    setLoading(false);
  };

  const startRecording = () => {
    setRecording(true);
    setTimeout(() => { setText(STS_VOICE_MOCKS[type]); setRecording(false); setTab('text'); }, 2800);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 90 }}>
      <style>{`@keyframes stsUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}} @keyframes stsBg{from{opacity:0}to{opacity:1}} @keyframes stsPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}`}</style>

      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,18,0.70)', animation: 'stsBg 200ms' }} />

      {/* Sheet */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--surface-1)', borderRadius: '24px 24px 0 0', padding: '10px 0 24px', animation: 'stsUp 280ms var(--ease-out)', maxHeight: '90%', overflowY: 'auto', scrollbarWidth: 'none' }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)', margin: '6px auto 18px' }} />

        <div style={{ padding: '0 20px' }}>
          {/* Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-1)' }}>Nuevo movimiento</span>
            <button onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', padding: 4 }}>
              <span className="material-icons" style={{ fontSize: 22 }}>close</span>
            </button>
          </div>

          {/* Type pills */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)', padding: 4 }}>
            {Object.entries(STS_TYPE_CFG).map(([k, v]) => {
              const active = type === k;
              return (
                <button key={k} onClick={() => { setType(k); setResult(null); setError(null); }} style={{ flex: 1, border: 0, cursor: 'pointer', padding: '8px 4px', borderRadius: 'var(--radius-pill)', background: active ? 'var(--surface-1)' : 'transparent', color: active ? v.color : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontWeight: active ? 700 : 500, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, boxShadow: active ? 'var(--shadow-card)' : 'none', transition: 'all 160ms' }}>
                  <span className="material-icons" style={{ fontSize: 15 }}>{v.icon}</span>{v.label}
                </button>
              );
            })}
          </div>

          {/* Input method tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[['text','edit','Texto'], ['voice','mic','Voz'], ['photo','photo_camera','Foto']].map(([t, icon, label]) => {
              const active = tab === t;
              return (
                <button key={t} onClick={() => { setTab(t); setResult(null); setError(null); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: 0, cursor: 'pointer', borderRadius: 'var(--radius-pill)', background: active ? 'var(--brand-primary-soft)' : 'var(--surface-2)', color: active ? 'var(--brand-primary-fg-soft)' : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: active ? 600 : 500, transition: 'all 160ms' }}>
                  <span className="material-icons" style={{ fontSize: 14 }}>{icon}</span>{label}
                </button>
              );
            })}
          </div>

          {/* Text tab */}
          {tab === 'text' && (
            <textarea value={text} onChange={e => { setText(e.target.value); setResult(null); setError(null); }} placeholder={cfg.placeholder} disabled={loading} rows={3}
              style={{ width: '100%', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '12px 14px', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-1)', background: 'var(--surface-2)', resize: 'none', outline: 'none', lineHeight: 1.5, boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-hairline)'}
            />
          )}

          {/* Voice tab */}
          {tab === 'voice' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '24px 16px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}>
              {recording ? (
                <>
                  <div style={{ width: 64, height: 64, borderRadius: 32, background: 'rgba(239,68,68,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'stsPulse 1s infinite' }}>
                    <span className="material-icons" style={{ fontSize: 32, color: 'var(--expense)' }}>mic</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--expense)' }}>Escuchando...</span>
                </>
              ) : (
                <>
                  <button onClick={startRecording} style={{ width: 64, height: 64, borderRadius: 32, background: 'var(--brand-primary)', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(30,58,138,.35)' }}>
                    <span className="material-icons" style={{ fontSize: 32, color: '#fff' }}>mic</span>
                  </button>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--fg-1)' }}>Toca para dictar</span>
                </>
              )}
            </div>
          )}

          {/* Photo tab */}
          {tab === 'photo' && (
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, border: '2px dashed var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '28px 16px', cursor: 'pointer', background: 'var(--surface-2)' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) { setText(`Recibo adjunto: ${e.target.files[0].name}`); setTab('text'); } }} />
              <span className="material-icons" style={{ fontSize: 40, color: 'var(--fg-3)' }}>receipt_long</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--fg-1)' }}>Sube un comprobante</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)', textAlign: 'center' }}>La IA extrae monto y comercio</span>
            </label>
          )}

          {/* Error */}
          {error && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--expense-soft)', color: 'var(--expense-fg)', fontFamily: 'var(--font-body)', fontSize: 13 }}>{error}</div>}

          {/* Result */}
          {result && (
            <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 'var(--radius-lg)', background: result.type === 'income' ? 'var(--income-soft)' : result.type === 'expense' ? 'var(--expense-soft)' : 'var(--brand-primary-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className="material-icons" style={{ fontSize: 20, color: result.type === 'income' ? 'var(--income)' : result.type === 'expense' ? 'var(--expense)' : '#8B5CF6' }}>{result.type === 'income' ? 'arrow_downward' : result.type === 'expense' ? 'arrow_outward' : 'swap_horiz'}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 20, color: 'var(--fg-1)', fontVariantNumeric: 'tabular-nums' }}>{result.currency} {(+result.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{result.merchant} · {result.category}</div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-1)', fontStyle: 'italic' }}>"{result.suggestion}"</div>
            </div>
          )}

          {/* CTA */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {result && <button onClick={() => { setResult(null); setTab('text'); }} style={{ flex: 1, border: '1px solid var(--border-hairline)', background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)', padding: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--fg-1)' }}>Editar</button>}
            <button onClick={result ? onClose : analyze} disabled={!result && (!text.trim() || loading)} style={{ flex: result ? 1 : 'auto', width: result ? 'auto' : '100%', border: 0, borderRadius: 'var(--radius-pill)', padding: '13px 20px', cursor: 'pointer', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: !result && (!text.trim() || loading) ? 0.5 : 1 }}>
              <span className="material-icons" style={{ fontSize: 18 }}>{result ? 'check' : 'auto_awesome'}</span>
              {result ? 'Confirmar' : loading ? 'Analizando...' : 'Analizar con IA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const STS_ACTION_MAP = {
  expense: { type: 'expense', tab: 'text' }, income: { type: 'income', tab: 'text' },
  transfer: { type: 'transfer', tab: 'text' }, voice: { type: 'expense', tab: 'voice' },
  scan: { type: 'expense', tab: 'photo' }, autoai: { type: 'expense', tab: 'text' },
};

Object.assign(window, { SmartTransactionSheet, STS_ACTION_MAP });
