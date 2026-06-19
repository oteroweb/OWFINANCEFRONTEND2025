/* ─── OW Finance Mobile — Navigation Components ─────────────────────────
 *
 * Components: StatusBar · MobileHeader · BottomNav
 *
 * RN MAPPING:
 *   StatusBar   → react-native StatusBar (or Expo's StatusBar)
 *   MobileHeader→ custom header inside Stack.Screen headerShown:false
 *   BottomNav   → @react-navigation/bottom-tabs with custom tabBar
 *
 * The center action button in BottomNav opens the QuickActionSheet;
 * in RN render it as a raised absolute-positioned TouchableOpacity.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

/* ── StatusBar ──────────────────────────────────────────────────────────
 * Simulated device status bar. In RN: use <StatusBar barStyle="light-content" />
 * and handle safe area via SafeAreaView. */
function MobileStatusBar({ theme = 'dark' }) {
  const light = theme === 'light';
  const fg = light ? 'var(--fg-1)' : '#E2E8F0';
  const d = new Date();
  const time = d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  return (
    <div style={{
      height: 44, padding: '0 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12,
      color: fg, flexShrink: 0,
    }}>
      <span>{time}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="material-icons" style={{ fontSize: 14, color: fg }}>signal_cellular_4_bar</span>
        <span className="material-icons" style={{ fontSize: 14, color: fg }}>wifi</span>
        <span className="material-icons" style={{ fontSize: 16, color: fg }}>battery_full</span>
      </div>
    </div>
  );
}

/* ── MobileHeader ───────────────────────────────────────────────────────
 * Flexible header for inner screens.
 * Props:
 *   title(string)         — main title
 *   subtitle(string?)     — small subtitle under title
 *   onBack(fn?)           — if provided, shows back arrow
 *   rightActions(array)   — [{ icon, onPress, badge }]
 *   variant               — 'default' | 'large' | 'ai'
 *   centerTitle(bool)     — centers title (used for modals)
 *
 * RN: Create as a custom component inside your Navigator's header slot. */
function MobileHeader({ title, subtitle, onBack, rightActions = [], variant = 'default', centerTitle = false }) {
  const isAI = variant === 'ai';
  return (
    <div style={{
      padding: '10px 20px 12px',
      display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
    }}>
      {/* Back arrow */}
      {onBack && (
        <button onClick={onBack} style={{
          border: 0, background: 'transparent', cursor: 'pointer',
          color: 'var(--fg-1)', padding: 4, flexShrink: 0,
          display: 'flex', alignItems: 'center',
        }}>
          <span className="material-icons" style={{ fontSize: 24 }}>arrow_back</span>
        </button>
      )}

      {/* AI avatar (for the AI chat header) */}
      {isAI && (
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <AIAvatar size={38} />
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 10, height: 10, borderRadius: 5,
            background: 'var(--income)', border: '2px solid var(--bg-canvas)',
          }} />
        </div>
      )}

      {/* Title block */}
      <div style={{ flex: 1, textAlign: centerTitle ? 'center' : 'left' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: isAI ? 15 : 17,
          color: 'var(--fg-1)', lineHeight: 1.2,
        }}>{title}</div>
        {subtitle && (
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: isAI ? 600 : 400,
            color: isAI ? 'var(--income-fg)' : 'var(--fg-2)',
            display: 'flex', alignItems: 'center', gap: 5, marginTop: 1,
          }}>
            {isAI && <StatusDot active={true} size={7} />}
            {subtitle}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {rightActions.map((a, i) => (
          <button key={i} onClick={a.onPress} style={{
            border: 0, background: 'transparent', cursor: 'pointer',
            color: 'var(--fg-2)', padding: 4,
            display: 'flex', alignItems: 'center', position: 'relative',
          }}>
            <span className="material-icons" style={{ fontSize: 22 }}>{a.icon}</span>
            {a.badge > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                width: 7, height: 7, borderRadius: 4,
                background: 'var(--expense)',
              }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── BottomNav ──────────────────────────────────────────────────────────
 * 4 tabs + center raised action button.
 * Props:
 *   active(string)        — current route id
 *   onChange(fn)          — route change handler
 *   onAction(fn)          — center + button handler (opens QuickActionSheet)
 *   actionOpen(bool)      — true → center shows X icon
 *   mode                  — 'lite' | 'pro' (changes accent color)
 *
 * RN: Implement as a custom tabBar with a raised center button.
 *     Use react-navigation's tabBarStyle to hide native tab bar,
 *     then render this as a screen footer via absolute positioning. */
function BottomNav({ active, onChange, onAction, actionOpen, mode = 'lite' }) {
  const accent = mode === 'pro' ? 'var(--info)' : 'var(--brand-primary)';
  const LEFT  = [
    { id: 'home',         icon: 'home',         label: 'HOME' },
    { id: 'transactions', icon: 'receipt_long',  label: 'TRANS' },
  ];
  const RIGHT = [
    { id: 'jars',         icon: 'savings',       label: 'JARS' },
    { id: 'config',       icon: 'settings',      label: 'SETTINGS' },
  ];

  return (
    <div style={{
      height: 82, flexShrink: 0,
      background: 'var(--surface-1)',
      borderTop: '1px solid var(--border-hairline)',
      display: 'flex', alignItems: 'flex-start', paddingTop: 8,
      position: 'relative',
    }}>
      {/* Home indicator bar */}
      <div style={{
        position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
        width: 120, height: 4, borderRadius: 2,
        background: 'var(--fg-3)', opacity: 0.4,
      }} />

      {LEFT.map(item => <NavTabItem key={item.id} item={item} active={active === item.id} onClick={() => onChange(item.id)} accent={accent} />)}

      {/* Centre action button */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button onClick={onAction} style={{
          width: 56, height: 56, border: 0, cursor: 'pointer',
          borderRadius: 28, background: accent, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${mode === 'pro' ? 'rgba(14,165,233,0.35)' : 'rgba(30,58,138,0.35)'}`,
          transform: actionOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform 240ms var(--ease-out), background 180ms',
          marginTop: -20,
        }}>
          <span className="material-icons" style={{ fontSize: 28 }}>{actionOpen ? 'close' : 'add'}</span>
        </button>
      </div>

      {RIGHT.map(item => <NavTabItem key={item.id} item={item} active={active === item.id} onClick={() => onChange(item.id)} accent={accent} />)}
    </div>
  );
}

function NavTabItem({ item, active, onClick, accent }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, border: 0, background: 'transparent', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      paddingTop: 4,
    }}>
      <span className="material-icons" style={{ fontSize: 24, color: active ? accent : 'var(--fg-3)' }}>
        {item.icon}
      </span>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 600,
        letterSpacing: '0.08em',
        color: active ? accent : 'var(--fg-3)',
        textTransform: 'uppercase',
      }}>{item.label}</span>
    </button>
  );
}

/* ── HomeHeader ─────────────────────────────────────────────────────────
 * Greeting + avatar + icon actions for the Home screen.
 * Separate from MobileHeader because Home is not a stack screen. */
function HomeHeader({ name = 'José', balanceVisible, onToggle, onNotifications, mode }) {
  const greeting = new Date().getHours() < 12 ? 'Buenos días,' : new Date().getHours() < 19 ? 'Buenas tardes,' : 'Buenas noches,';
  return (
    <div style={{ padding: '0 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{greeting}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--fg-1)' }}>{name}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <IconButtonMobile icon={balanceVisible ? 'visibility' : 'visibility_off'} onPress={onToggle} size={38} />
        <IconButtonMobile icon="notifications" onPress={onNotifications} badge={2} size={38} />
      </div>
    </div>
  );
}

Object.assign(window, { MobileStatusBar, MobileHeader, BottomNav, HomeHeader });
