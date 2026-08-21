/* ─── MOBILE-ONLY — port opcional ─────────────────────────────────────────
 * SharedAccountsSheet — pantalla 3 en mobile: "Mis cuentas" / "Compartidas
 * conmigo" con el badge de permiso, y el límite de `view_balance` al abrir.
 * No es un bottom-sheet: es la sección de la pantalla de Cuentas. Se llama
 * *Sheet por la convención de sufijo mobile del contrato (§6).
 * Callbacks: onSelectAction('open:<id>'|'share:<id>') · onChange('selected', id)
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, Avatar, MoneyMobile, PillButtonMobile, Divider, owfPermission, owfPermTint */

function SharedAccountsSheet({ myAccounts = [], shares = [], onSelectAction, onChange }) {
  const [ui, setUi] = React.useState({ open: null });
  const label = { fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)' };
  const eyebrow = { fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--fg-3)' };
  const card = { background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', boxShadow: 'var(--shadow-card)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 16px 28px' }}>
      <div style={card}>
        <div style={{ ...eyebrow, marginBottom: 4 }}>Mis cuentas</div>
        {myAccounts.map((a, i) => (
          <div key={a.id}>
            {i > 0 && <Divider mx={0} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', minHeight: 56 }}>
              <Avatar initial={a.name.charAt(0)} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14.5, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                <div style={{ ...label, marginTop: 2 }}>{a.currencyCode || 'USD'}</div>
              </div>
              <MoneyMobile value={a.balance || 0} className="t-amount-sm" />
              <button onClick={() => onSelectAction && onSelectAction('share:' + a.id)} aria-label="Compartir" style={{ width: 44, height: 44, border: 0, background: 'transparent', color: 'var(--fg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <span className="material-icons" style={{ fontSize: 21 }}>group_add</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={card}>
        <div style={{ ...eyebrow, marginBottom: 4 }}>Compartidas conmigo</div>
        {shares.length === 0 && <p style={{ ...label, padding: '8px 0 4px' }}>Nadie de tu grupo familiar te compartió una cuenta todavía.</p>}
        {shares.map((s, i) => {
          const perm = owfPermission(s.permission);
          const tint = owfPermTint(perm.weight, true);
          const open = ui.open === s.account_id;
          return (
            <div key={s.account_id}>
              {i > 0 && <Divider mx={0} />}
              <div onClick={() => { setUi({ open: open ? null : s.account_id }); onChange && onChange('selected', open ? null : s.account_id); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', minHeight: 60, cursor: 'pointer' }}>
                <Avatar initial={s.account_name.charAt(0)} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14.5, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.account_name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                    <Avatar initial={s.owner_name.charAt(0)} size={15} />
                    <span style={{ ...label, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Compartida por {s.owner_name}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                  <MoneyMobile value={s.balance} className="t-amount-sm" />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--radius-pill)', background: tint.background, color: tint.color, whiteSpace: 'nowrap' }}>
                    <span className="material-icons" style={{ fontSize: 12 }}>{perm.icon}</span>{perm.badge}
                  </span>
                </div>
              </div>

              {open && (
                <div style={{ paddingBottom: 14 }}>
                  {s.permission === 'view_balance' ? (
                    <div style={{ display: 'flex', gap: 10, padding: 14, borderRadius: 14, background: 'var(--surface-2)' }}>
                      <span className="material-icons" style={{ fontSize: 19, color: 'var(--fg-3)' }}>lock</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13.5, color: 'var(--fg-1)' }}>De esta cuenta ves solo el saldo</div>
                        <p style={{ ...label, lineHeight: 1.5, marginTop: 4, textWrap: 'pretty' }}>{s.owner_name} te compartió el saldo, no los movimientos. Pedile que cambie el nivel si necesitás el detalle.</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: 14, borderRadius: 14, background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 9 }}>
                      {[['Supermercado', -42.3, '18 ago'], ['Pago recibido', 180, '15 ago'], ['Farmacia', -12.9, '14 ago']].map(([n, v, d]) => (
                        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-1)' }}>{n}</span>
                          <span style={{ ...label, fontSize: 11.5 }}>{d}</span>
                          <MoneyMobile value={v} className="t-amount-sm" sign color={v < 0 ? 'var(--fg-1)' : 'var(--income-fg)'} />
                        </div>
                      ))}
                      {s.permission === 'manage'
                        ? <PillButtonMobile fullWidth size="sm" icon="add" onPress={() => onSelectAction && onSelectAction('open:' + s.account_id)}>Registrar movimiento</PillButtonMobile>
                        : <p style={{ ...label, marginTop: 2 }}>Ves todo el detalle, sin poder editar.</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { SharedAccountsSheet });
