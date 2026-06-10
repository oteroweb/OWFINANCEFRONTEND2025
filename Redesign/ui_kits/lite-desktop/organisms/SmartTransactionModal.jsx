/* ─── Smart Transaction Modal — shell ───────────────────────────────────
 * Wraps the structured TransactionForm with 4 AI input methods:
 *   Escribir (manual form) · Nota de voz · Foto/factura (OCR) · Auto IA (texto)
 * PRO adds a 5th: Carga masiva (bulk dry-run).
 * Voice/Foto/Auto IA produce a prefill that drops into the manual form.
 *
 * Props: open · onClose · initialType · initialTab · mode('lite'|'pro')
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useSTMState, useEffect: useSTMEffect } = React;

const STM_SYSTEM = `You are a financial transaction parser for OW Finance 2026.
Parse the user's description and return ONLY a valid JSON object:
{ "type":"expense"|"income"|"transfer", "amount":<number>, "currency":"USD"|"EUR"|"VES",
  "merchant":"<name>", "category":"<category>", "confidence":"high"|"medium"|"low" }
Return ONLY the JSON.`;

const STM_VOICE_MOCK = { type: 'expense', amount: 45.20, currency: 'USD', merchant: 'Whole Foods Market', category: 'Supermercado', confidence: 'high' };
const STM_PHOTO_MOCK = { type: 'expense', amount: 116.00, currency: 'USD', merchant: 'Farmatodo', category: 'Salud', confidence: 'medium', items: 3 };

/* Methods */
const STM_METHODS = [
  { id: 'write',  icon: 'edit_note',     label: 'Escribir' },
  { id: 'voice',  icon: 'mic',           label: 'Voz' },
  { id: 'photo',  icon: 'receipt_long',  label: 'Foto' },
  { id: 'autoai', icon: 'auto_awesome',  label: 'Auto IA' },
];

function SmartTransactionModal({ open, onClose, initialType = 'expense', initialTab = 'write', mode = 'pro', rates }) {
  const isLite = mode === 'lite';
  const isMobile = useViewportMobile();
  const normTab = initialTab === 'text' ? 'write' : initialTab;
  const [tab,       setTab]       = useSTMState(normTab);
  const [prefill,   setPrefill]   = useSTMState(null);
  const [aiSource,  setAiSource]  = useSTMState(null);
  const [recording, setRecording] = useSTMState(false);
  const [text,      setText]      = useSTMState('');
  const [loading,   setLoading]   = useSTMState(false);
  const [error,     setError]     = useSTMState(null);

  useSTMEffect(() => {
    if (open) { setTab(initialTab === 'text' ? 'write' : initialTab); setPrefill(null); setAiSource(null); setRecording(false); setText(''); setError(null); }
  }, [open, initialTab]);

  useSTMEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [open, onClose]);

  if (!open) return null;

  // Both LITE and PRO expose the same 5 input methods.
  const methods = [...STM_METHODS, { id: 'bulk', icon: 'upload_file', label: 'Carga masiva' }];

  const toForm = (data, source) => { setPrefill(data); setAiSource(source); setTab('write'); };

  const startVoice = () => { setRecording(true); setTimeout(() => { setRecording(false); toForm(STM_VOICE_MOCK, 'voz'); }, 2600); };

  const analyze = async () => {
    if (!text.trim() || loading) return;
    setLoading(true); setError(null);
    try {
      const raw = await window.claude.complete({ system: STM_SYSTEM, messages: [{ role: 'user', content: text }] });
      const m = raw.match(/\{[\s\S]*\}/); if (!m) throw new Error('x');
      toForm(JSON.parse(m[0]), 'texto');
    } catch { setError(t('No pude interpretar el texto. Sé más específico con monto y concepto.')); }
    setLoading(false);
  };

  const width = isLite ? 560 : 720;

  return (
    <div onClick={onClose} style={{
      position: isMobile ? 'absolute' : 'fixed', inset: 0, zIndex: 'var(--z-modal)',
      background: 'rgba(10,14,28,0.60)', backdropFilter: 'blur(4px)', display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'flex-start', justifyContent: 'center',
      padding: isMobile ? 0 : '4vh 16px', overflowY: isMobile ? 'hidden' : 'auto',
      animation: 'stmFade 200ms',
    }}>
      <style>{`
        @keyframes stmFade { from{opacity:0} to{opacity:1} }
        @keyframes stmRise { from{opacity:0;transform:scale(0.97) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes stmSheet { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes stmPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.14);opacity:0.8} }
        .stm-card{ width:100%; max-width:var(--stm-w); }
      `}</style>

      <div onClick={e => e.stopPropagation()} className="stm-card" style={isMobile ? {
        position: 'absolute', left: 0, right: 0, bottom: 0,
        '--stm-w': 'none', boxSizing: 'border-box',
        background: 'var(--surface-1)', borderRadius: '22px 22px 0 0',
        padding: '10px 18px calc(20px + env(safe-area-inset-bottom))',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.28)', animation: 'stmFade 200ms',
        maxHeight: '92%', overflowY: 'auto',
      } : {
        '--stm-w': width + 'px', background: 'var(--surface-1)', borderRadius: 'var(--radius-xl)',
        padding: 26, boxShadow: 'var(--shadow-popover)', animation: 'stmRise 240ms var(--ease-out)', marginBottom: '4vh',
      }}>

        {/* Grab handle (mobile sheet) */}
        {isMobile && (
          <div style={{ width: 38, height: 4, borderRadius: 999, background: 'var(--border-hairline)', margin: '0 auto 14px' }} />
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div className="t-eyebrow">{t('Nuevo movimiento')}{isLite ? ' · Lite' : ' · Pro'}</div>
            <div className="t-h2" style={{ marginTop: 4 }}>{tab === 'bulk' ? t('Carga masiva') : t('¿Qué pasó con tu dinero?')}</div>
          </div>
          <IconButton icon="close" ariaLabel="Cerrar" onClick={onClose} />
        </div>

        {/* Method tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
          {methods.map(m => {
            const active = tab === m.id;
            return (
              <button key={m.id} type="button" onClick={() => { setTab(m.id); setError(null); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: 0, cursor: 'pointer', borderRadius: 'var(--radius-pill)', background: active ? 'var(--brand-primary)' : 'var(--surface-2)', color: active ? '#fff' : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: active ? 700 : 500, transition: 'all 150ms' }}>
                <span className="material-icons" style={{ fontSize: 16 }}>{m.icon}</span>{t(m.label)}
              </button>
            );
          })}
        </div>

        {/* AI prefill banner */}
        {tab === 'write' && aiSource && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 13px', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(90deg, rgba(124,58,237,.10), rgba(14,165,233,.10))', marginBottom: 14 }}>
            <span className="material-icons" style={{ fontSize: 18, color: '#8B5CF6' }}>auto_awesome</span>
            <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-1)' }}>{t('Pre-rellenado por IA desde')} <strong>{t(aiSource)}</strong> · {t('revisa y confirma')}</span>
            <button type="button" onClick={() => { setPrefill(null); setAiSource(null); }} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex' }}><span className="material-icons" style={{ fontSize: 16 }}>close</span></button>
          </div>
        )}

        {/* ── WRITE (form) ── */}
        {tab === 'write' && (
          <TransactionForm key={aiSource || 'fresh'} mode={mode} type={prefill?.type || initialType} prefill={prefill} rates={rates} onClose={onClose} onSubmit={() => onClose()} />
        )}

        {/* ── VOICE ── */}
        {tab === 'voice' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '36px 20px', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)' }}>
            {recording ? (
              <>
                <div style={{ width: 76, height: 76, borderRadius: 38, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'stmPulse 1s infinite' }}>
                  <span className="material-icons" style={{ fontSize: 38, color: 'var(--expense)' }}>mic</span>
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--expense)' }}>{t('Escuchando…')}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)' }}>"Gasté 45 dólares en Whole Foods con BofA"</span>
              </>
            ) : (
              <>
                <button type="button" onClick={startVoice} style={{ width: 76, height: 76, borderRadius: 38, background: 'var(--brand-primary)', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 22px rgba(30,58,138,.35)' }}>
                  <span className="material-icons" style={{ fontSize: 38, color: '#fff' }}>mic</span>
                </button>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>{t('Toca para dictar')}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', textAlign: 'center' }}>{t('Di monto, comercio y cuenta. La IA transcribe y arma el movimiento.')}</span>
              </>
            )}
          </div>
        )}

        {/* ── PHOTO ── */}
        {tab === 'photo' && (
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, border: '2px dashed var(--border-hairline)', borderRadius: 'var(--radius-lg)', padding: '40px 20px', cursor: 'pointer', background: 'var(--surface-2)', transition: 'border-color 160ms' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-hairline)'}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) toForm(STM_PHOTO_MOCK, 'foto de factura'); }} />
            <span className="material-icons" style={{ fontSize: 46, color: 'var(--fg-3)' }}>receipt_long</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>{t('Sube o arrastra una factura')}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)', textAlign: 'center' }}>{t('OCR extrae monto, comercio, fecha e ítems')}</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
              {['Monto', 'Comercio', 'Ítems', 'IVA', 'Fecha'].map(c => (
                <span key={c} style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-1)', color: 'var(--fg-2)', border: '1px solid var(--border-hairline)' }}>{t(c)}</span>
              ))}
            </div>
          </label>
        )}

        {/* ── AUTO IA (texto libre) ── */}
        {tab === 'autoai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea value={text} onChange={e => { setText(e.target.value); setError(null); }} rows={4} placeholder={t("Pega o describe: 'Pagué $730 en VES a 40.5, mercado del mes con Mercantil, categoría supermercado'")}
              style={{ width: '100%', boxSizing: 'border-box', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--fg-1)', background: 'var(--surface-2)', resize: 'none', outline: 'none', lineHeight: 1.55 }}
              onFocus={window.fcFocus} onBlur={window.fcBlur} />
            {error && <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--expense-soft)', color: 'var(--expense-fg)', fontFamily: 'var(--font-body)', fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <PillButton variant="ghost" onClick={onClose}>{t('Cancelar')}</PillButton>
              <button type="button" onClick={analyze} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, cursor: 'pointer', padding: '12px 22px', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(90deg,#7C3AED,#2563EB)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, opacity: loading ? 0.7 : 1 }}>
                <span className="material-icons" style={{ fontSize: 18 }}>auto_awesome</span>{loading ? t('Analizando…') : t('Analizar con IA')}
              </button>
            </div>
          </div>
        )}

        {/* ── BULK (Pro) ── */}
        {tab === 'bulk' && <BulkImportPanel onClose={onClose} />}
      </div>
    </div>
  );
}

// Map action IDs → modal config (used by DesktopQuickModal via shells)
const STM_ACTION_MAP = {
  expense:  { type: 'expense',  tab: 'write' },
  income:   { type: 'income',   tab: 'write' },
  transfer: { type: 'transfer', tab: 'write' },
  debt:     { type: 'expense',  tab: 'write' },
  dream:    { type: 'transfer', tab: 'write' },
  jar:      { type: 'transfer', tab: 'write' },
  voice:    { type: 'expense',  tab: 'voice' },
  scan:     { type: 'expense',  tab: 'photo' },
  autoai:   { type: 'expense',  tab: 'autoai' },
};

Object.assign(window, { SmartTransactionModal, STM_ACTION_MAP });
