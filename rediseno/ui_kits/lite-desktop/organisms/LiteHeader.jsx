/* global React */
const { useState: useHdr } = React;

function LiteHeader({ user, currency, balanceVisible, onToggleVisibility, onOpenMenu, onOpenNotifications, onAvatarClick, notificationCount = 2 }) {
  const theme = useAppTheme();
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, padding: '18px 32px 14px',
      maxWidth: 'var(--container-max)', margin: '0 auto', width: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <button
          onClick={onAvatarClick}
          aria-label="Open profile menu"
          style={{
            width: 42, height: 42, border: 0, padding: 0, cursor: 'pointer',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--brand-primary)',
            color: 'var(--fg-on-brand)',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >{user.initial}</button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, lineHeight: 1.25 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 500, color: 'var(--fg-2)', whiteSpace: 'nowrap' }}>{t(user.greeting)}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--fg-1)', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{user.name}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CurrencyChip code={currency} />
        <span style={{ width: 1, height: 22, background: 'var(--border-hairline)', margin: '0 2px', flexShrink: 0 }} />
        <IconButton
          icon={balanceVisible ? 'visibility' : 'visibility_off'}
          ariaLabel={balanceVisible ? 'Hide balance' : 'Show balance'}
          onClick={onToggleVisibility}
        />
        <IconButton
          icon={theme === 'dark' ? 'light_mode' : 'dark_mode'}
          ariaLabel={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          onClick={() => window.toggleAppTheme && window.toggleAppTheme()}
        />
        <div style={{ position: 'relative' }}>
          <IconButton icon="notifications" ariaLabel="Notifications" onClick={onOpenNotifications} />
          {notificationCount > 0 && (
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, borderRadius: 999,
              background: 'var(--expense)',
              boxShadow: '0 0 0 2px var(--surface-1)',
            }} />
          )}
        </div>
        <IconButton icon="menu" ariaLabel="Open menu" onClick={onOpenMenu} />
      </div>
    </header>
  );
}

Object.assign(window, { LiteHeader });
