/* ─── OW Finance Mobile — Chat Components ────────────────────────────────
 * Used by AIAdvisorScreen.
 *
 * RN MAPPING:
 *   ChatBubble     → <View> + <Text>. Style isUser vs isAI differently.
 *   RichText       → Compose <Text> with nested colored <Text> spans.
 *   TypingBubble   → Three dots animated with Animated.loop + sequence.
 *   QuickReplyChip → <TouchableOpacity> pill with <Text>.
 *   ChatInput      → <TextInput> + mic + send TouchableOpacity.
 *                    Use KeyboardAvoidingView behavior="padding".
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useRef: useChatRef, useEffect: useChatEffect, useState: useChatState } = React;

/* ── RichText ────────────────────────────────────────────────────────────
 * Renders a message parts array: [{ text, plain?, color? }].
 * RN: nested <Text> spans — identical approach works in RN. */
function RichText({ parts = [], style = {} }) {
  return (
    <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.5, whiteSpace: 'pre-wrap', ...style }}>
      {parts.map((p, i) =>
        p.color
          ? <span key={i} style={{ color: p.color, fontWeight: 600 }}>{p.text}</span>
          : <span key={i}>{p.text}</span>
      )}
    </span>
  );
}

/* ── ChatBubble ──────────────────────────────────────────────────────────
 * Props:
 *   message(object)  — { id, role, parts, ctas, time }
 *   onCta(fn)        — called with cta text when a CTA button is pressed */
function ChatBubble({ message, onCta }) {
  const isUser = message.role === 'user';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      gap: 8, padding: '0 16px',
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexDirection: isUser ? 'row-reverse' : 'row' }}>
        {!isUser && <AIAvatar size={28} />}
        <div style={{
          maxWidth: '78%',
          background: isUser ? 'var(--surface-2)' : 'var(--surface-1)',
          borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
          padding: '12px 14px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <RichText parts={message.parts || [{ text: message.text || '', plain: true }]} style={{ color: 'var(--fg-1)' }} />
        </div>
      </div>

      {/* CTA buttons below AI message */}
      {!isUser && message.ctas && message.ctas.length > 0 && (
        <div style={{
          marginLeft: 38,
          display: 'flex', gap: 8, flexWrap: 'wrap',
        }}>
          {message.ctas.map((cta, i) => (
            <button
              key={i}
              onClick={() => onCta && onCta(cta)}
              style={{
                border: 0, cursor: 'pointer',
                padding: '9px 18px',
                borderRadius: 'var(--radius-pill)',
                background: i === 0 ? 'var(--info)' : 'var(--surface-2)',
                color: i === 0 ? '#fff' : 'var(--fg-1)',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
              }}
            >{cta}</button>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--fg-3)',
        marginLeft: isUser ? 0 : 38,
        marginRight: isUser ? 0 : 0,
      }}>{message.time}</span>
    </div>
  );
}

/* ── TypingBubble ────────────────────────────────────────────────────────
 * Three animated dots indicating the AI is "thinking".
 * RN: Use Animated.loop with a staggered opacity animation per dot. */
function TypingBubble() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '0 16px' }}>
      <AIAvatar size={28} />
      <div style={{
        background: 'var(--surface-1)', borderRadius: '4px 18px 18px 18px',
        padding: '12px 18px', display: 'flex', gap: 5, alignItems: 'center',
        boxShadow: 'var(--shadow-card)',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: 4,
            background: 'var(--fg-3)',
            animation: `dotPulse 1.2s ${i * 0.2}s ease-in-out infinite`,
          }} />
        ))}
      </div>
      <style>{`@keyframes dotPulse { 0%,80%,100%{opacity:0.3;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
}

/* ── QuickReplyChip ─────────────────────────────────────────────────────
 * Tappable suggestion pill above the input area. */
function QuickReplyChip({ label, onPress }) {
  return (
    <button onClick={() => onPress(label)} style={{
      flexShrink: 0, border: '1px solid var(--border-hairline)',
      cursor: 'pointer', padding: '8px 14px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-1)',
      color: 'var(--fg-1)',
      fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 13,
      boxShadow: 'var(--shadow-card)',
    }}>{label}</button>
  );
}

/* ── ChatInput ───────────────────────────────────────────────────────────
 * Composed input bar: mic · text field · send button.
 * RN: <View row> + <TouchableOpacity mic> + <TextInput> + <TouchableOpacity send>
 *     Wrap in <KeyboardAvoidingView behavior="padding">. */
function ChatInput({ value, onChange, onSend, loading }) {
  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey && !loading) { e.preventDefault(); onSend(); } };
  return (
    <div style={{
      padding: '10px 16px 20px',
      display: 'flex', flexDirection: 'column', gap: 10,
      borderTop: '1px solid var(--border-hairline)',
      background: 'var(--bg-canvas)',
    }}>
      {/* Quick replies scroll */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
        {QUICK_REPLIES.map(q => <QuickReplyChip key={q} label={q} onPress={onChange} />)}
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button style={{
          border: 0, background: 'transparent', cursor: 'pointer',
          color: 'var(--fg-2)', padding: 4, flexShrink: 0,
        }}>
          <span className="material-icons" style={{ fontSize: 24 }}>mic</span>
        </button>

        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: 'var(--surface-1)',
          borderRadius: 'var(--radius-pill)',
          padding: '0 16px',
          border: '1px solid var(--border-hairline)',
        }}>
          <input
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escribe un mensaje..."
            disabled={loading}
            style={{
              flex: 1, border: 0, background: 'transparent',
              fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--fg-1)',
              outline: 'none', padding: '11px 0',
            }}
          />
        </div>

        <button
          onClick={onSend}
          disabled={loading || !value.trim()}
          style={{
            width: 44, height: 44, borderRadius: 22, border: 0, cursor: 'pointer',
            background: loading || !value.trim() ? 'var(--surface-2)' : 'var(--info)',
            color: loading || !value.trim() ? 'var(--fg-3)' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 180ms',
            flexShrink: 0,
          }}
        >
          <span className="material-icons" style={{ fontSize: 20 }}>{loading ? 'hourglass_empty' : 'send'}</span>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { RichText, ChatBubble, TypingBubble, QuickReplyChip, ChatInput });
