/* ─── MOBILE-ONLY — port opcional ─────────────────────────────────────────
 * AccountShareSheet — variante bottom-sheet de AccountShareDialog (pantalla 2).
 * En mobile los 4 niveles no caben en una fila por persona: se elige la
 * persona y el nivel se pica en un segundo paso, a fila completa (44 px+).
 * Callbacks idénticos al desktop: onChange('permission:<id>', v) · onSave · onClose
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, MobileBottomSheet, Avatar, PillButtonMobile, MobileChip, Divider, OWF_PERMISSIONS, owfPermission, owfPermTint */

function AccountShareSheet({ open = true, account, group = null, shares = [], onChange, onSave, onClose, onSelectAction }) {
  const initial = {};
  (group ? group.members : []).filter(m => !m.is_you).forEach(m => {
    const f = shares.find(s => s.user_id === m.user_id);
    initial[m.user_id] = f ? f.permission : 'none';
  });
  const [form, setForm] = React.useState({ perms: initial, editing: null });
  const label = { fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' };

  if (!group) {
    return (
      <MobileBottomSheet open={open} onClose={onClose} title="Compartir cuenta">
        <div style={{ padding: '4px 20px 28px', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', textAlign: 'center' }}>
          <span className="material-icons" style={{ fontSize: 32, color: 'var(--fg-3)' }}>group_off</span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16.5, color: 'var(--fg-1)' }}>Todavía no tenés grupo familiar</div>
          <p style={{ ...label, lineHeight: 1.55, textWrap: 'pretty' }}>Una cuenta solo se comparte con miembros de tu grupo familiar. Creá el grupo primero.</p>
          <PillButtonMobile fullWidth icon="group_add" onPress={() => onSelectAction && onSelectAction('open-family-group')}>Ir a grupo familiar</PillButtonMobile>
        </div>
      </MobileBottomSheet>
    );
  }

  const others = group.members.filter(m => !m.is_you);
  const editing = form.editing ? others.find(m => m.user_id === form.editing) : null;
  const pick = (userId, permId) => {
    setForm(f => ({ ...f, perms: { ...f.perms, [userId]: permId }, editing: null }));
    onChange && onChange('permission:' + userId, permId);
  };

  /* Paso 2 — nivel de acceso de una persona */
  if (editing) {
    const cur = form.perms[editing.user_id];
    return (
      <MobileBottomSheet open={open} onClose={() => setForm(f => ({ ...f, editing: null }))} title={editing.name.split(' ')[0]}>
        <div style={{ padding: '0 20px 28px' }}>
          <p style={{ ...label, marginBottom: 14 }}>Qué puede hacer con <strong style={{ color: 'var(--fg-1)', fontWeight: 600 }}>{account.name}</strong></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {OWF_PERMISSIONS.map(p => {
              const on = cur === p.id;
              const tint = owfPermTint(p.weight, on);
              return (
                <button key={p.id} onClick={() => pick(editing.user_id, p.id)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left', width: '100%', minHeight: 56,
                  border: on ? '1px solid var(--brand-primary)' : '1px solid var(--border-hairline)',
                  borderRadius: 14, padding: '13px 14px', cursor: 'pointer',
                  background: tint.background, color: tint.color,
                }}>
                  <span className="material-icons" style={{ fontSize: 20, marginTop: 1 }}>{p.icon}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14.5 }}>{p.id === 'none' ? 'Sin acceso' : p.label}</span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 12.5, lineHeight: 1.45, marginTop: 3, opacity: 0.85 }}>{p.desc}</span>
                  </span>
                  {on && <span className="material-icons" style={{ fontSize: 19 }}>check</span>}
                </button>
              );
            })}
          </div>
        </div>
      </MobileBottomSheet>
    );
  }

  /* Paso 1 — miembros del grupo */
  const granted = Object.values(form.perms).filter(p => p !== 'none').length;
  return (
    <MobileBottomSheet open={open} onClose={onClose} title="Compartir cuenta">
      <div style={{ padding: '0 20px 28px' }}>
        <p style={{ ...label, marginBottom: 12 }}>{account.name} · sos el dueño</p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {others.map((m, i) => {
            const perm = owfPermission(form.perms[m.user_id]);
            const pending = m.status === 'invited';
            const none = form.perms[m.user_id] === 'none';
            return (
              <div key={m.user_id}>
                {i > 0 && <Divider mx={0} />}
                <button disabled={pending} onClick={() => setForm(f => ({ ...f, editing: m.user_id }))} style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%', minHeight: 60,
                  border: 0, background: 'transparent', padding: '14px 0', cursor: pending ? 'default' : 'pointer',
                  opacity: pending ? 0.55 : 1, textAlign: 'left',
                }}>
                  <Avatar initial={m.name.charAt(0)} size={40} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                    <span style={{ display: 'block', ...label, fontSize: 12.5, marginTop: 2 }}>{pending ? 'Esperando que acepte' : (none ? 'Sin acceso' : perm.desc.split('.')[0])}</span>
                  </span>
                  <MobileChip variant={none ? 'default' : 'brand'}>{none ? '—' : perm.badge}</MobileChip>
                  <span className="material-icons" style={{ fontSize: 20, color: 'var(--fg-3)' }}>chevron_right</span>
                </button>
              </div>
            );
          })}
        </div>
        <p style={{ ...label, fontSize: 12.5, lineHeight: 1.5, margin: '14px 0 14px', textWrap: 'pretty' }}>
          {granted === 0 ? 'Nadie tiene acceso a esta cuenta.' : `${granted} ${granted === 1 ? 'persona con acceso' : 'personas con acceso'}. Podés cambiarlo o quitarlo cuando quieras.`}
        </p>
        <PillButtonMobile fullWidth onPress={() => onSave && onSave({ account_id: account.id, shares: Object.keys(form.perms).map(k => ({ user_id: Number(k), permission: form.perms[k] })).filter(s => s.permission !== 'none') })}>Guardar acceso</PillButtonMobile>
      </div>
    </MobileBottomSheet>
  );
}

Object.assign(window, { AccountShareSheet });
