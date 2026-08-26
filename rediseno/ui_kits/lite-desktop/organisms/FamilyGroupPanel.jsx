/* ─── Organism · FamilyGroupPanel (Pro + Lite · vive en Configuración) ────
 * Pantalla 1 de la Fase 1: crear/gestionar el grupo familiar.
 * Estados: sin grupo · con grupo · invitando · invitación pendiente · salir.
 *
 * Contrato de callbacks:
 *   onSave({ action:'create-group', name })       → crear el grupo
 *   onSave({ action:'invite', email })            → invitar por correo
 *   onSave({ action:'accept-invite', groupId })   → yo (invitado) acepto
 *   onSave({ action:'decline-invite', groupId })  → yo (invitado) rechazo
 *   onDelete(groupId)                             → salir del grupo
 *   onSelectAction('resend:3' | 'cancel:3')       → acciones del admin sobre una invitación pendiente ajena
 *   onChange(field, value)                        → 'draftName' | 'draftEmail'
 *
 * Regla de negocio visible en la UI: sin grupo familiar no hay forma de
 * compartir una cuenta. Por eso el estado vacío no ofrece compartir nada.
 *
 * Estado "invitación pendiente" tiene DOS perspectivas distintas en la misma
 * fila: si la fila pendiente sos vos (m.is_you), ves Aceptar/Rechazar — es tu
 * propia invitación. Si es de otro miembro, ves Reenviar/Cancelar — sos vos
 * gestionando la invitación que ENVIASTE. Nunca las dos a la vez.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, Avatar, PillButton, IconButton */

function FamilyGroupPanel({ group = null, sharedInCount = 0, sharedOutCount = 0, onSave, onDelete, onSelectAction }) {
  /* FG_FORCE_VIEW ('invite'|'leave'|'create') existe solo para revisar estados
   * desde el mapa de rutas del documento. En producción el estado es del usuario. */
  const [ui, setUi] = React.useState({ view: (typeof window !== 'undefined' && window.FG_FORCE_VIEW) || 'list', name: 'Familia Otero', email: '', menu: null });
  const set = (patch) => setUi(u => ({ ...u, ...patch }));

  const label = { fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' };
  const input = {
    width: '100%', border: '1px solid var(--border-hairline)', borderRadius: 12,
    background: 'var(--surface-2)', color: 'var(--fg-1)', padding: '12px 14px',
    fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none',
  };

  const Head = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
      <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary-soft)', color: 'var(--brand-primary-fg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="material-icons" style={{ fontSize: 22 }}>group</span>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: 'var(--fg-1)' }}>Grupo familiar</div>
        <div style={{ ...label, marginTop: 2 }}>{children}</div>
      </div>
    </div>
  );

  /* ── Sin grupo ───────────────────────────────────────────────────────── */
  if (!group) {
    return (
      <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 28, maxWidth: 620 }}>
        <Head>Compartir cuentas con quien vive tu economía.</Head>
        <div style={{ border: '1px dashed var(--border-hairline)', borderRadius: 'var(--radius-lg)', padding: '34px 28px', textAlign: 'center' }}>
          <span className="material-icons" style={{ fontSize: 34, color: 'var(--fg-3)' }}>group_add</span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--fg-1)', marginTop: 12 }}>Todavía no tenés un grupo familiar</div>
          <p style={{ ...label, maxWidth: 380, margin: '8px auto 20px', lineHeight: 1.55, textWrap: 'pretty' }}>
            Creás el grupo, invitás a alguien por correo y esa persona acepta. Solo después de eso podés compartirle una cuenta, con el nivel de acceso que elijas.
          </p>
          {ui.view === 'create' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 340, margin: '0 auto', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={label}>Nombre del grupo</span>
                <input style={input} value={ui.name} onChange={e => set({ name: e.target.value })} placeholder="Familia Otero" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <PillButton onClick={() => onSave && onSave({ action: 'create-group', name: ui.name })}>Crear grupo</PillButton>
                <PillButton variant="ghost" onClick={() => set({ view: 'list' })}>Cancelar</PillButton>
              </div>
            </div>
          ) : (
            <PillButton icon="add" onClick={() => set({ view: 'create' })}>Crear grupo familiar</PillButton>
          )}
        </div>
      </div>
    );
  }

  /* ── Con grupo ───────────────────────────────────────────────────────── */
  const members = group.members || [];
  const active = members.filter(m => m.status === 'active').length;

  return (
    <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 28, maxWidth: 620 }}>
      <Head>{group.name} · {active} {active === 1 ? 'miembro' : 'miembros'}</Head>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {members.map((m, i) => {
          const pending = m.status === 'invited';
          return (
            <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)' }}>
              <Avatar initial={m.name.charAt(0)} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14.5, color: pending ? 'var(--fg-2)' : 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--radius-pill)',
                    background: pending ? 'var(--warning-soft)' : (m.is_you ? 'var(--brand-primary-soft)' : 'var(--surface-2)'),
                    color: pending ? 'var(--warning-fg)' : (m.is_you ? 'var(--brand-primary-fg-soft)' : 'var(--fg-2)'),
                  }}>{pending ? 'Invitación enviada' : (m.is_you ? 'Vos' : 'Miembro')}</span>
                </div>
                <div style={{ ...label, fontSize: 12.5, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</div>
              </div>
              {pending && m.is_you && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <PillButton size="sm" onClick={() => onSave && onSave({ action: 'accept-invite', groupId: group.id })}>Aceptar</PillButton>
                  <PillButton size="sm" variant="ghost" onClick={() => onSave && onSave({ action: 'decline-invite', groupId: group.id })}>Rechazar</PillButton>
                </div>
              )}
              {pending && !m.is_you && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <PillButton size="sm" variant="ghost" onClick={() => onSelectAction && onSelectAction('resend:' + m.user_id)}>Reenviar</PillButton>
                  <PillButton size="sm" variant="ghost" onClick={() => onSelectAction && onSelectAction('cancel:' + m.user_id)}>Cancelar</PillButton>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {ui.view === 'invite' && (
        <div style={{ marginTop: 18, padding: 18, borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={label}>Correo de la persona</span>
            <input style={{ ...input, background: 'var(--surface-1)' }} type="email" value={ui.email} onChange={e => set({ email: e.target.value })} placeholder="nombre@ejemplo.com" />
          </div>
          <p style={{ ...label, fontSize: 12.5, lineHeight: 1.5 }}>Recibe una invitación por correo. Hasta que la acepte no puede ver nada tuyo.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <PillButton size="sm" onClick={() => { onSave && onSave({ action: 'invite', email: ui.email }); set({ view: 'list', email: '' }); }}>Enviar invitación</PillButton>
            <PillButton size="sm" variant="ghost" onClick={() => set({ view: 'list' })}>Cancelar</PillButton>
          </div>
        </div>
      )}

      {ui.view === 'leave' && (
        <div style={{ marginTop: 18, padding: 18, borderRadius: 'var(--radius-lg)', background: 'var(--expense-soft)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--expense-fg)' }}>Salir de {group.name}</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.55, color: 'var(--expense-fg)', textWrap: 'pretty' }}>
            Dejás de ver {sharedInCount} {sharedInCount === 1 ? 'cuenta compartida con vos' : 'cuentas compartidas con vos'}, y {sharedOutCount === 1 ? 'la cuenta que compartiste deja' : `las ${sharedOutCount} cuentas que compartiste dejan`} de verse del otro lado. Tus movimientos y tus cuentas no se borran.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <PillButton size="sm" variant="danger" onClick={() => onDelete && onDelete(group.id)}>Salir del grupo</PillButton>
            <PillButton size="sm" variant="ghost" onClick={() => set({ view: 'list' })}>Quedarme</PillButton>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border-hairline)' }}>
        <PillButton icon="person_add" onClick={() => set({ view: ui.view === 'invite' ? 'list' : 'invite' })}>Invitar a alguien</PillButton>
        <div style={{ flex: 1 }} />
        <PillButton variant="ghost" onClick={() => set({ view: ui.view === 'leave' ? 'list' : 'leave' })}>Salir del grupo</PillButton>
      </div>
    </div>
  );
}

Object.assign(window, { FamilyGroupPanel });
