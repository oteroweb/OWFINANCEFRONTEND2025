/* ─── Desktop AI Advisor Panel ──────────────────────────────────────────
 * Right-side sliding panel with real Claude integration.
 * Props: open, onClose
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useAIPanelState, useEffect: useAIPanelEffect, useRef: useAIPanelRef } = React;

const DESKTOP_AI_SYSTEM = `You are the AI Financial Advisor ("Asesor Financiero IA") for OW Finance 2026.
User: José Otero, 35, freelancer.
Finances: balance $12,480.50 USD · savings rate 42% · monthly income ~$4,820 · monthly expenses ~$2,360.
Jars (plantilla 55/10/10/10/10): Necesidades básicas $1,815 (68% usado) · Diversión $132 (73% usado) · Ahorro $2,940 (meta 59%) · Educación $410 (42% usado) · Reservas $1,260.
Cuentas: BofA Corriente $3,420 · BofA Ahorros $12,480 · Mercantil (VES) · Visa crédito −$1,240 · Cashea (VES) −$626.
Impuestos del país: IGTF 3% en divisas, comisión Pago Móvil 0.30%.
Rules:
- Always respond in Spanish
- Be brief: 2-3 sentences max
- When you suggest a concrete action end with: [CTA: button text]
- Tone: calm, professional, empathetic
- No emojis or markdown
- Never mention Claude or third-party AI — you are OW Finance's native advisor`;

const DESKTOP_AI_SEED = [
  { id: 1, role: 'ai', time: '14:22', parts: [
    { text: '¡Hola! He revisado tus finanzas.\nTasa de ahorro: ', plain: true },
    { text: '42%', color: '#10B981' },
    { text: '. Sugiero redirigir ', plain: true },
    { text: '$50', color: '#0EA5E9' },
    { text: ' al jar de emergencia.', plain: true },
  ], ctas: ['Asignar $50', 'Detalles'] },
  { id: 2, role: 'user', time: '14:25', parts: [{ text: '¿Cómo pago mi tarjeta más rápido?', plain: true }] },
  { id: 3, role: 'ai', time: '14:26', parts: [
    { text: 'Según tu perfil freelancer: Usa ', plain: true },
    { text: 'método Avalancha', color: '#F59E0B' },
    { text: '. Minimizará los intereses más rápido.', plain: true },
  ], ctas: ['Crear plan de pago'] },
];

const DESK_QUICK_REPLIES = ['Analiza gastos', 'Consejos', 'Próximos pagos', '¿Cuánto ahorré?'];

function AIAdvisorPanel({ open, onClose }) {
  const isMobile = useViewportMobile();
  const [messages, setMessages] = useAIPanelState([...DESKTOP_AI_SEED]);
  const [input, setInput] = useAIPanelState('');
  const [loading, setLoading] = useAIPanelState(false);
  const bottomRef = useAIPanelRef(null);

  useAIPanelEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollTop = bottomRef.current.scrollHeight;
  }, [messages, loading]);

  useAIPanelEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const send = async (text) => {
    const t = (text || input).trim();
    if (!t || loading) return;
    setInput('');
    const userMsg = { id: Date.now(), role: 'user', time: new Date().toTimeString().slice(0, 5), parts: [{ text: t, plain: true }] };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: (m.parts || []).map(p => p.text).join(''),
      }));
      const raw = await window.claude.complete({ messages: history, system: DESKTOP_AI_SYSTEM });
      const ctaMatch = raw.match(/\[CTA:\s*(.+?)\]/);
      const cta = ctaMatch ? ctaMatch[1].trim() : null;
      const clean = raw.replace(/\[CTA:\s*.+?\]/g, '').trim();
      setMessages(m => [...m, { id: Date.now() + 1, role: 'ai', time: new Date().toTimeString().slice(0, 5), parts: [{ text: clean, plain: true }], ctas: cta ? [cta] : [] }]);
    } catch {
      setMessages(m => [...m, { id: Date.now() + 1, role: 'ai', time: new Date().toTimeString().slice(0, 5), parts: [{ text: 'No pude conectar. Intenta de nuevo.', plain: true }], ctas: [] }]);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @keyframes panelSlide { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes panelFade  { from{opacity:0} to{opacity:1} }
      `}</style>
      {/* Backdrop */}
      {open && <div onClick={onClose} style={{ position: isMobile ? 'absolute' : 'fixed', inset: 0, zIndex: 70, background: 'rgba(10,14,28,0.30)', animation: 'panelFade 200ms' }} />}

      {/* Panel */}
      <div style={isMobile ? {
        position: 'absolute', inset: 0, zIndex: 80,
        width: '100%', boxSizing: 'border-box',
        background: 'var(--surface-1)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.28)',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 300ms var(--ease-out)',
        borderRadius: '22px 22px 0 0', overflow: 'hidden',
      } : {
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 80,
        width: 420,
        background: 'var(--surface-1)',
        boxShadow: '-8px 0 48px rgba(0,0,0,0.20)',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 280ms var(--ease-out)',
        borderLeft: '1px solid var(--border-hairline)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border-hairline)', flexShrink: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 20, flexShrink: 0,
            background: 'linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-icons" style={{ fontSize: 20, color: '#fff' }}>auto_awesome</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>Asesor Financiero IA</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--income-fg)' }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--income)', display: 'inline-block' }} />
              EN LÍNEA
            </div>
          </div>
          <IconButton icon="close" ariaLabel="Cerrar panel" onClick={onClose} />
        </div>

        {/* Messages */}
        <div ref={bottomRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 16, scrollbarWidth: 'thin' }}>
          {messages.map(msg => <DesktopChatBubble key={msg.id} message={msg} onCta={send} />)}
          {loading && <DesktopTypingBubble />}
        </div>

        {/* Quick replies */}
        <div style={{ display: 'flex', gap: 8, padding: '10px 16px 0', overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
          {DESK_QUICK_REPLIES.map(q => (
            <button key={q} onClick={() => send(q)} style={{
              flexShrink: 0, border: '1px solid var(--border-hairline)',
              cursor: 'pointer', padding: '7px 14px', borderRadius: 'var(--radius-pill)',
              background: 'var(--surface-2)', color: 'var(--fg-1)',
              fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 12,
            }}>{q}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '10px 16px 20px', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            background: 'var(--surface-2)', borderRadius: 'var(--radius-pill)',
            padding: '0 16px', border: '1px solid var(--border-hairline)',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !loading) { e.preventDefault(); send(input); } }}
              placeholder="Escribe un mensaje..."
              disabled={loading}
              style={{ flex: 1, border: 0, background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-1)', outline: 'none', padding: '11px 0' }}
            />
          </div>
          <button onClick={() => send(input)} disabled={loading || !input.trim()} style={{
            width: 42, height: 42, borderRadius: 21, border: 0, cursor: 'pointer',
            background: loading || !input.trim() ? 'var(--surface-2)' : 'var(--info)',
            color: loading || !input.trim() ? 'var(--fg-3)' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 160ms', flexShrink: 0,
          }}>
            <span className="material-icons" style={{ fontSize: 20 }}>{loading ? 'hourglass_empty' : 'send'}</span>
          </button>
        </div>
      </div>
    </>
  );
}

function DesktopChatBubble({ message, onCta }) {
  const isUser = message.role === 'user';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 8, padding: '0 16px' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: isUser ? 'row-reverse' : 'row' }}>
        {!isUser && (
          <div style={{ width: 26, height: 26, borderRadius: 13, flexShrink: 0, background: 'linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ fontSize: 13, color: '#fff' }}>auto_awesome</span>
          </div>
        )}
        <div style={{
          maxWidth: '82%', background: isUser ? 'var(--surface-2)' : 'var(--surface-1)',
          borderRadius: isUser ? '14px 14px 3px 14px' : '3px 14px 14px 14px',
          padding: '10px 14px', boxShadow: 'var(--shadow-card)',
        }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.55, color: 'var(--fg-1)', whiteSpace: 'pre-wrap' }}>
            {(message.parts || []).map((p, i) =>
              p.color ? <span key={i} style={{ color: p.color, fontWeight: 600 }}>{p.text}</span>
                      : <span key={i}>{p.text}</span>
            )}
          </span>
        </div>
      </div>
      {!isUser && message.ctas && message.ctas.length > 0 && (
        <div style={{ marginLeft: 34, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {message.ctas.map((cta, i) => (
            <button key={i} onClick={() => onCta(cta)} style={{
              border: 0, cursor: 'pointer', padding: '8px 16px', borderRadius: 'var(--radius-pill)',
              background: i === 0 ? 'var(--info)' : 'var(--surface-2)',
              color: i === 0 ? '#fff' : 'var(--fg-1)',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
            }}>{cta}</button>
          ))}
        </div>
      )}
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--fg-3)', marginLeft: isUser ? 0 : 34 }}>{message.time}</span>
    </div>
  );
}

function DesktopTypingBubble() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '0 16px' }}>
      <div style={{ width: 26, height: 26, borderRadius: 13, background: 'linear-gradient(135deg,#7C3AED,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="material-icons" style={{ fontSize: 13, color: '#fff' }}>auto_awesome</span>
      </div>
      <div style={{ background: 'var(--surface-1)', borderRadius: '3px 14px 14px 14px', padding: '12px 16px', display: 'flex', gap: 5, boxShadow: 'var(--shadow-card)' }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--fg-3)', display: 'inline-block', animation: `dotPulse 1.2s ${i * 0.2}s ease-in-out infinite` }} />
        ))}
        <style>{`@keyframes dotPulse{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
      </div>
    </div>
  );
}

Object.assign(window, { AIAdvisorPanel });
