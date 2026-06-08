/* ─── OW Finance Mobile — Quick Action Sheet ─────────────────────────────
 * This is the "+" center button bottom sheet.
 * Shows 6 actions in a 3×2 grid + AI advisor CTA.
 *
 * RN MAPPING:
 *   Use react-native-bottom-sheet or @gorhom/bottom-sheet.
 *   The overlay backdrop → <Pressable> with absolute fill + opacity anim.
 *   The sheet itself → BottomSheetModal snapping to 65% screen height.
 *   Grid items → FlatList numColumns={3} inside the sheet.
 *   Gradient button → expo-linear-gradient or react-native-linear-gradient.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

const ACTIONS = [
  { id: 'expense',  label: 'Gasto',     icon: 'arrow_outward', color: '#EF4444', bg: 'rgba(239,68,68,0.14)' },
  { id: 'income',   label: 'Ingreso',   icon: 'arrow_downward',color: '#10B981', bg: 'rgba(16,185,129,0.14)' },
  { id: 'transfer', label: 'Transferir',icon: 'swap_horiz',    color: '#8B5CF6', bg: 'rgba(139,92,246,0.14)' },
  { id: 'voice',    label: 'Voz',       icon: 'mic',           color: '#0EA5E9', bg: 'rgba(14,165,233,0.14)' },
  { id: 'scan',     label: 'Escanear',  icon: 'qr_code_scanner',color:'#F59E0B', bg: 'rgba(245,158,11,0.14)' },
  { id: 'ai',       label: 'Auto IA',   icon: 'auto_awesome',  color: '#fff',    bg: '#0EA5E9', solid: true },
];

/* ── QuickActionSheet ───────────────────────────────────────────────────
 * Props:
 *   open(bool)       — whether the sheet is visible
 *   onClose(fn)      — dismisses the sheet
 *   onOpenAI(fn)     — opens the AI advisor chat
 *   onAction(fn)     — called with action id when a grid item is tapped
 *   mode             — 'lite' | 'pro' (pro shows all 6, lite shows 3+AI)
 */
function QuickActionSheet({ open, onClose, onOpenAI, onSelectAction, mode = 'lite' }) {
  const actions = mode === 'lite'
    ? [ACTIONS[0], ACTIONS[1], ACTIONS[2]]   // Lite: Gasto · Ingreso · Transferir
    : ACTIONS;                               // Pro: full 6

  if (!open) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      {/* Backdrop — tap to close */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(5,8,18,0.72)',
          animation: 'sheetFadeIn 220ms var(--ease-out)',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'var(--surface-1)',
        borderRadius: '28px 28px 0 0',
        padding: '10px 20px 24px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.40)',
        animation: 'sheetSlideUp 280ms var(--ease-out)',
      }}>
        <style>{`
          @keyframes sheetFadeIn  { from { opacity: 0 } to { opacity: 1 } }
          @keyframes sheetSlideUp { from { transform: translateY(60px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        `}</style>

        {/* Drag handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'var(--surface-3)',
          margin: '6px auto 22px',
        }} />

        {/* Action grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${mode === 'lite' ? 3 : 3}, 1fr)`,
          gap: mode === 'lite' ? '20px 12px' : '20px 12px',
          marginBottom: 24,
        }}>
          {actions.map(a => (
            <ActionTile key={a.id} action={a} onPress={() => {
              if (a.id === 'ai') { onClose(); onOpenAI && onOpenAI(); }
              else { onClose(); onSelectAction && onSelectAction(a.id); }
            }} />
          ))}
        </div>

        {/* Pro: second row if 6 actions (already in grid above, handled) */}

        {/* AI Advisor CTA — full width gradient button */}
        <button
          onClick={() => { onClose(); onOpenAI && onOpenAI(); }}
          style={{
            width: '100%', border: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '16px',
            borderRadius: 'var(--radius-pill)',
            background: 'linear-gradient(90deg, #7C3AED 0%, #2563EB 50%, #0EA5E9 100%)',
            color: '#fff',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
            boxShadow: '0 6px 24px rgba(124,58,237,0.35)',
          }}
        >
          <span className="material-icons" style={{ fontSize: 22 }}>psychology</span>
          Hablar con Asesor IA
        </button>
      </div>
    </div>
  );
}

/* ── ActionTile ─────────────────────────────────────────────────────────
 * Individual grid item: large icon circle + label.
 * RN: <TouchableOpacity> → <View circle> + <Text> */
function ActionTile({ action: a, onPress }) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onClick={onPress}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        border: 0, background: 'transparent', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        transform: pressed ? 'scale(0.93)' : 'scale(1)',
        transition: 'transform 80ms',
      }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: 36,
        background: a.solid ? a.bg : a.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: a.solid ? `0 4px 16px ${a.bg}66` : 'none',
      }}>
        <span className="material-icons" style={{ fontSize: 30, color: a.solid ? a.color : a.color }}>
          {a.icon}
        </span>
      </div>
      <span style={{
        fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 13,
        color: 'var(--fg-1)',
      }}>{a.label}</span>
    </button>
  );
}

Object.assign(window, { QuickActionSheet, ActionTile, ACTIONS });
