/* ─── MOBILE-ONLY — port opcional ─────────────────────────────────────────
 * FamilyGroupSheet — variante bottom-sheet de FamilyGroupPanel (pantalla 1).
 * Mismos estados y mismas palabras que el desktop, otra presentación.
 * Callbacks idénticos: onSave({action,...}) · onDelete(groupId) · onSelectAction · onClose
 * onSave admite action: 'create-group' | 'invite' | 'accept-invite' | 'decline-invite'.
 * En una fila pendiente, m.is_you decide Aceptar/Rechazar (tu invitación) vs
 * Reenviar/Cancelar (invitación que vos enviaste a otro miembro).
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, MobileBottomSheet, Avatar, PillButtonMobile, MobileChip, Divider */

function FamilyGroupSheet({ open = true, group = null, sharedInCount = 0, sharedOutCount = 0, onSave, onDelete, onSelectAction, onClose }) {
  const [ui, setUi] = React.useState({ view: (typeof window !== 'undefined' && window.FG_FORCE_VIEW) || 'list', name: 'Familia Otero', email: '' });
  const set = (patch) => setUi(u => ({ ...u, ...patch }));
  const label = { fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' };
  const input = { width: '100%', border: '1px solid var(--border-hairline)', borderRadius: 12, background: 'var(--surface-2)', color: 'var(--fg-1)', padding: '13px 14px', fontFamily: 'var(--font-body)', fontSize: 15, outline: 'none' };

  return (
    <MobileBottomSheet open={open} onClose={onClose} title="Grupo familiar">
      <div style={{ padding: '4px 20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!group ? (
          <React.Fragment>
            <div style={{ textAlign: 'center', padding: '18px 6px 6px' }}>
              <span className="material-icons" style={{ fontSize: 34, color: 'var(--fg-3)' }}>group_add</span>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-1)', marginTop: 10 }}>Todavía no tenés un grupo familiar</div>
              <p style={{ ...label, lineHeight: 1.55, marginTop: 8, textWrap: 'pretty' }}>
                Creás el grupo, invitás por correo y la otra persona acepta. Solo después podés compartirle una cuenta.
              </p>
            </div>
            {ui.view === 'create' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={label}>Nombre del grupo</span>
                <input style={input} value={ui.name} onChange={e => set({ name: e.target.value })} placeholder="Familia Otero" />
                <PillButtonMobile fullWidth onPress={() => onSave && onSave({ action: 'create-group', name: ui.name })}>Crear grupo</PillButtonMobile>
                <PillButtonMobile fullWidth variant="ghost" onPress={() => set({ view: 'list' })}>Cancelar</PillButtonMobile>
              </div>
            ) : (
              <PillButtonMobile fullWidth icon="add" onPress={() => set({ view: 'create' })}>Crear grupo familiar</PillButtonMobile>
            )}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div style={{ ...label, marginTop: -4 }}>{group.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {group.members.map((m, i) => {
                const pending = m.status === 'invited';
                return (
                  <div key={m.user_id}>
                    {i > 0 && <Divider mx={0} />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', minHeight: 56 }}>
                      <Avatar initial={m.name.charAt(0)} size={40} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, color: pending ? 'var(--fg-2)' : 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                        <div style={{ ...label, fontSize: 12.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</div>
                      </div>
                      <MobileChip variant={pending ? 'warning' : (m.is_you ? 'brand' : 'default')}>{pending ? 'Invitado' : (m.is_you ? 'Vos' : 'Miembro')}</MobileChip>
                    </div>
                    {pending && m.is_you && (
                      <div style={{ display: 'flex', gap: 8, paddingBottom: 12 }}>
                        <PillButtonMobile size="sm" onPress={() => onSave && onSave({ action: 'accept-invite', groupId: group.id })}>Aceptar</PillButtonMobile>
                        <PillButtonMobile size="sm" variant="ghost" onPress={() => onSave && onSave({ action: 'decline-invite', groupId: group.id })}>Rechazar</PillButtonMobile>
                      </div>
                    )}
                    {pending && !m.is_you && (
                      <div style={{ display: 'flex', gap: 8, paddingBottom: 12 }}>
                        <PillButtonMobile size="sm" variant="secondary" onPress={() => onSelectAction && onSelectAction('resend:' + m.user_id)}>Reenviar</PillButtonMobile>
                        <PillButtonMobile size="sm" variant="ghost" onPress={() => onSelectAction && onSelectAction('cancel:' + m.user_id)}>Cancelar</PillButtonMobile>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {ui.view === 'invite' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)' }}>
                <span style={label}>Correo de la persona</span>
                <input style={{ ...input, background: 'var(--surface-1)' }} type="email" value={ui.email} onChange={e => set({ email: e.target.value })} placeholder="nombre@ejemplo.com" />
                <p style={{ ...label, fontSize: 12.5, lineHeight: 1.5 }}>Hasta que acepte, no puede ver nada tuyo.</p>
                <PillButtonMobile fullWidth onPress={() => { onSave && onSave({ action: 'invite', email: ui.email }); set({ view: 'list', email: '' }); }}>Enviar invitación</PillButtonMobile>
              </div>
            )}

            {ui.view === 'leave' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderRadius: 'var(--radius-lg)', background: 'var(--expense-soft)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--expense-fg)' }}>Salir de {group.name}</div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.55, color: 'var(--expense-fg)', textWrap: 'pretty' }}>
                  Dejás de ver {sharedInCount} {sharedInCount === 1 ? 'cuenta compartida con vos' : 'cuentas compartidas con vos'}, y {sharedOutCount === 1 ? 'la cuenta que compartiste deja' : `las ${sharedOutCount} cuentas que compartiste dejan`} de verse del otro lado. Nada se borra.
                </p>
                <PillButtonMobile fullWidth variant="danger" onPress={() => onDelete && onDelete(group.id)}>Salir del grupo</PillButtonMobile>
                <PillButtonMobile fullWidth variant="ghost" onPress={() => set({ view: 'list' })}>Quedarme</PillButtonMobile>
              </div>
            )}

            {ui.view === 'list' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <PillButtonMobile fullWidth icon="person_add" onPress={() => set({ view: 'invite' })}>Invitar a alguien</PillButtonMobile>
                <PillButtonMobile fullWidth variant="ghost" onPress={() => set({ view: 'leave' })}>Salir del grupo</PillButtonMobile>
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    </MobileBottomSheet>
  );
}

Object.assign(window, { FamilyGroupSheet });
