/* ─── Organism · SharedAccountsSection (Pro-only) ──────────────────────────
 * Pantalla 3 de la Fase 1: "Mis cuentas" vs "Compartidas conmigo", y el
 * límite real de `view_balance` al intentar abrir el detalle.
 *
 * Contrato de callbacks:
 *   onSelectAction('open:<account_id>' | 'share:<account_id>')
 *   onChange('selected', account_id | null)
 *
 * Regla visible: `view_balance` muestra el saldo pero no lista movimientos.
 * Eso NO es un error — es el permiso funcionando. Se explica en una línea.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, Avatar, Money, PillButton, owfPermission, owfPermTint */

function SharedAccountsSection({ myAccounts = [], shares = [], selectedId = null, onSelectAction, onChange }) {
  const [ui, setUi] = React.useState({ open: selectedId });
  const label = { fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' };
  const card = { background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 22 };

  const Section = ({ title, count, children }) => (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span className="t-eyebrow" style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>{title}</span>
        <span style={{ fontFamily: 'var(--font-money)', fontSize: 11, color: 'var(--fg-3)' }}>{count}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  );

  const openShare = ui.open ? shares.find(s => s.account_id === ui.open) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 660 }}>
      <Section title="Mis cuentas" count={myAccounts.length}>
        {myAccounts.map((a, i) => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)' }}>
            <Avatar initial={a.name.charAt(0)} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14.5, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
              <div style={{ ...label, fontSize: 12.5, marginTop: 2 }}>{a.currencyCode || 'USD'}</div>
            </div>
            <Money value={a.balance || 0} currency={a.currencySymbol || '$'} className="t-amount-sm" />
            <button onClick={() => onSelectAction && onSelectAction('share:' + a.id)} title="Compartir con mi grupo familiar" style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', padding: 4 }}>
              <span className="material-icons" style={{ fontSize: 20 }}>group_add</span>
            </button>
          </div>
        ))}
      </Section>

      <Section title="Compartidas conmigo" count={shares.length}>
        {shares.length === 0 && (
          <p style={{ ...label, fontSize: 12.5, padding: '6px 0 2px' }}>Nadie de tu grupo familiar te compartió una cuenta todavía.</p>
        )}
        {shares.map((s, i) => {
          const perm = owfPermission(s.permission);
          const tint = owfPermTint(perm.weight, true);
          return (
            <div key={s.account_id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)' }}>
              <div onClick={() => { setUi({ open: ui.open === s.account_id ? null : s.account_id }); onChange && onChange('selected', ui.open === s.account_id ? null : s.account_id); }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', cursor: 'pointer' }}>
                <Avatar initial={s.account_name.charAt(0)} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14.5, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.account_name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <Avatar initial={s.owner_name.charAt(0)} size={16} />
                    <span style={{ ...label, fontSize: 12.5 }}>Compartida por {s.owner_name}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                  <Money value={s.balance} currency={s.currency_symbol} className="t-amount-sm" />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: tint.background, color: tint.color }}>
                    <span className="material-icons" style={{ fontSize: 13 }}>{perm.icon}</span>{perm.badge}
                  </span>
                </div>
              </div>

              {ui.open === s.account_id && (
                <div style={{ padding: '2px 0 16px' }}>
                  {s.permission === 'view_balance' ? (
                    <div style={{ display: 'flex', gap: 12, padding: 16, borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)' }}>
                      <span className="material-icons" style={{ fontSize: 20, color: 'var(--fg-3)' }}>lock</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: 'var(--fg-1)' }}>De esta cuenta ves solo el saldo</div>
                        <p style={{ ...label, fontSize: 12.5, lineHeight: 1.5, marginTop: 5, textWrap: 'pretty' }}>
                          {s.owner_name} te compartió el saldo, no los movimientos. Si necesitás ver el detalle, pedile que cambie el nivel de acceso.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: 16, borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[['Supermercado', -42.3, '18 ago'], ['Pago recibido', 180, '15 ago'], ['Farmacia', -12.9, '14 ago']].map(([n, v, d]) => (
                        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-1)' }}>{n}</span>
                          <span style={{ ...label, fontSize: 12 }}>{d}</span>
                          <Money value={v} currency={s.currency_symbol} className="t-amount-sm" sign color={v < 0 ? 'var(--fg-1)' : 'var(--income-fg)'} />
                        </div>
                      ))}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                        <p style={{ ...label, fontSize: 12.5, flex: 1 }}>
                          {s.permission === 'manage' ? 'Podés registrar y editar movimientos en esta cuenta.' : 'Ves todo el detalle, sin poder editar.'}
                        </p>
                        {s.permission === 'manage' && <PillButton size="sm" icon="add" onClick={() => onSelectAction && onSelectAction('open:' + s.account_id)}>Registrar movimiento</PillButton>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </Section>
    </div>
  );
}

Object.assign(window, { SharedAccountsSection });
