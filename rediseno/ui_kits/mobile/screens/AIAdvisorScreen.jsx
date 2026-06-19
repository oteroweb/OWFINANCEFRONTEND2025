/* ─── AI Advisor Screen ──────────────────────────────────────────────────
 * Full-screen AI financial advisor chat with real Claude responses.
 * Seeds with the conversation from the reference screenshot.
 *
 * RN MAPPING:
 *   Message list → <FlatList inverted> for auto-scroll-to-bottom.
 *   Input area   → <KeyboardAvoidingView behavior="padding">.
 *   Typing bubble→ Animated 3-dot component.
 *   CTA buttons  → TouchableOpacity pills below AI bubbles.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useAIState, useEffect: useAIEffect, useRef: useAIRef } = React;

const AI_SYSTEM = `You are the AI Financial Advisor ("Asesor Financiero IA") for OW Finance 2026.
User: José Otero, 35, freelancer, Lima, Peru.
Finances: balance $12,480.50 USD · savings rate 42% · monthly income ~$4,820 · monthly expenses ~$2,360.
Jars: Emergency $4,200 (62%) · Vacation $1,820 (91%) · Laptop $980 (49%) · Health $1,240 (100%) · Idle $540 (24%) · Gifts $180 (36%).
Credit card: $850 at 17.9% APR. Next bill: Renta $1,450 on Jun 10.

Rules:
- Always respond in Spanish
- Be brief: 2-3 sentences max
- When you suggest a concrete action, end with exactly this on its own line: [CTA: button text here]
- Tone: calm, professional, empathetic
- No emojis or markdown bold/italic
- Never mention Claude, OpenAI, or any third-party AI — you are OW Finance's native advisor`;

function AIAdvisorScreen({ onBack }) {
  const [messages, setMessages] = useAIState([...AI_SEED]);
  const [input, setInput] = useAIState('');
  const [loading, setLoading] = useAIState(false);
  const bottomRef = useAIRef(null);

  useAIEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollTop = bottomRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const t = (text || input).trim();
    if (!t || loading) return;
    setInput('');

    const userMsg = {
      id: Date.now(), role: 'user', time: new Date().toTimeString().slice(0, 5),
      parts: [{ text: t, plain: true }],
    };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    try {
      // Build conversation for Claude (flatten parts to plain text)
      const history = [...messages, userMsg].map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: (m.parts || []).map(p => p.text).join(''),
      }));

      const raw = await window.claude.complete({ messages: history, system: AI_SYSTEM });

      // Parse [CTA: ...] tags
      const ctaMatch = raw.match(/\[CTA:\s*(.+?)\]/);
      const cta = ctaMatch ? ctaMatch[1].trim() : null;
      const cleanText = raw.replace(/\[CTA:\s*.+?\]/g, '').trim();

      setMessages(m => [...m, {
        id: Date.now() + 1, role: 'ai',
        time: new Date().toTimeString().slice(0, 5),
        parts: [{ text: cleanText, plain: true }],
        ctas: cta ? [cta] : [],
      }]);
    } catch {
      setMessages(m => [...m, {
        id: Date.now() + 1, role: 'ai',
        time: new Date().toTimeString().slice(0, 5),
        parts: [{ text: 'Lo siento, no pude conectar. Intenta de nuevo.', plain: true }],
        ctas: [],
      }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <MobileHeader
        title="Asesor Financiero IA"
        subtitle="EN LÍNEA"
        onBack={onBack}
        variant="ai"
        rightActions={[{ icon: 'more_vert', onPress: () => {} }]}
      />
      <Divider mx={0} />

      {/* Message list */}
      <div
        ref={bottomRef}
        style={{
          flex: 1, overflowY: 'auto', scrollbarWidth: 'none',
          display: 'flex', flexDirection: 'column', gap: 16,
          padding: '16px 0',
        }}
      >
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} onCta={(cta) => sendMessage(cta)} />
        ))}
        {loading && <TypingBubble />}
        <div style={{ height: 8 }} />
      </div>

      {/* Input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={() => sendMessage(input)}
        loading={loading}
      />
    </div>
  );
}

Object.assign(window, { AIAdvisorScreen });
