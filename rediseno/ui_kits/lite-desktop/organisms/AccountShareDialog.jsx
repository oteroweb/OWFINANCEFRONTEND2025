/* ─── Organism · AccountShareDialog (Pro-only) ────────────────────────────
 * Pantalla 2 de la Fase 1: compartir UNA cuenta con miembros del grupo
 * familiar. Pensado para insertarse dentro del flujo de `AccountDialog`
 * (organisms/AccountsCategoriesTaxes.jsx) como una sección más del detalle.
 *
 * Contrato de callbacks:
 *   onChange('permission:<user_id>', 'none'|'view_balance'|'view_full'|'manage')
 *   onSave({ account_id, shares: [{ user_id, permission }] })
 *   onClose()
 *   onSelectAction('open-family-group')  → sin grupo todavía
 *
 * ── Varios grupos (D-014) ───────────────────────────────────────────────
 * Un usuario puede estar en más de un grupo (pareja, padres), y una misma
 * persona puede aparecer en dos de ellos.
 *
 * Decisión de fondo: **una fila por PERSONA, no por membresía.** Listar a
 * alguien dos veces —una por grupo— daría dos selectores de permiso para una
 * sola pregunta, y dos respuestas posibles para "¿qué ve Mariangela en esta
 * cuenta?". El permiso es de la persona sobre la cuenta; el grupo es solo
 * cómo llegaron a estar conectados, y eso se dice en la fila.
 *
 * Props: `groups` (array) — `group` (uno) sigue funcionando.
 *
 * Reglas visibles:
 *   · No hay buscador libre de usuarios. Siempre se parte del grupo familiar.
 *   · `owner` no es una opción: es implícito del dueño, se muestra como estado.
 *   · Los 4 niveles se muestran siempre, uno activo por persona.
 *   · Un solo hue (--brand-primary) con distinta intensidad por nivel.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, Avatar, PillButton, OWF_PERMISSIONS, owfPermTint */

function AccountShareDialog({ account, group = null, groups = null, shares = [], onChange, onSave, onClose, onSelectAction }) {
  const allGroups = groups && groups.length ? groups : (group ? [group] : []);

  /* Una fila por persona. `via` acumula los grupos por los que llega. */
  const people = [];
  allGroups.forEach(g => {
    (g.members || []).forEach(m => {
      if (m.is_you) return;
      const found = people.find(p => p.user_id === m.user_id);
      if (found) { found.via.push(g.name); if (m.status !== 'invited') found.status = m.status; return; }
      people.push({ ...m, via: [g.name] });
    });
  });

  const initial = {};
  people.forEach(m => {
    const found = shares.find(s => s.user_id === m.user_id);
    initial[m.user_id] = found ? found.permission : 'none';
  });
  const [form, setForm] = React.useState({ perms: initial, explain: null });

  const label = { fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' };
  const shell = { background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', padding: 26, width: 560, maxWidth: '100%' };

  const header = (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--fg-1)' }}>{allGroups.length > 1 ? 'Compartir con mis grupos' : 'Compartir con mi grupo familiar'}</div>
        <div style={{ ...label, marginTop: 3 }}>{account.name}</div>
      </div>
      <button onClick={onClose} aria-label="Cerrar" style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', display: 'flex', padding: 2 }}>
        <span className="material-icons" style={{ fontSize: 22 }}>close</span>
      </button>
    </div>
  );

  /* ── Sin grupo familiar: no se ofrece compartir ──────────────────────── */
  if (!allGroups.length) {
    return (
      <div style={shell}>
        {header}
        <div style={{ display: 'flex', gap: 14, padding: 18, borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)' }}>
          <span className="material-icons" style={{ fontSize: 22, color: 'var(--fg-3)' }}>group_off</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--fg-1)' }}>Todavía no tenés grupo familiar</div>
            <p style={{ ...label, fontSize: 12.5, lineHeight: 1.55, margin: '6px 0 14px', textWrap: 'pretty' }}>
              Una cuenta solo se comparte con miembros de tu grupo familiar. Creá el grupo primero.
            </p>
            <PillButton size="sm" icon="group_add" onClick={() => onSelectAction && onSelectAction('open-family-group')}>Ir a grupo familiar</PillButton>
          </div>
        </div>
      </div>
    );
  }

  const others = people;
  const you = (allGroups[0].members || []).find(m => m.is_you);
  const pick = (userId, permId) => {
    setForm(f => ({ ...f, perms: { ...f.perms, [userId]: permId }, explain: permId === 'none' ? null : permId }));
    onChange && onChange('permission:' + userId, permId);
  };
  const granted = Object.values(form.perms).filter(p => p !== 'none').length;

  return (
    <div style={shell}>
      {header}

      {/* Dueño — owner no es una opción seleccionable */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)', marginBottom: 16 }}>
        <Avatar initial={you ? you.name.charAt(0) : 'J'} size={32} />
        <div style={{ flex: 1, minWidth: 0, fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--fg-1)' }}>
          {you ? you.name : 'Vos'} · <span style={{ color: 'var(--fg-2)' }}>dueño de la cuenta</span>
        </div>
        <span className="material-icons" style={{ fontSize: 18, color: 'var(--fg-3)' }}>verified_user</span>
      </div>

      {/* Un miembro por fila, 4 niveles siempre visibles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {others.map(m => {
          const pending = m.status === 'invited';
          const cur = form.perms[m.user_id];
          return (
            <div key={m.user_id} style={{ opacity: pending ? 0.55 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
                <Avatar initial={m.name.charAt(0)} size={28} />
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--fg-1)' }}>{m.name}</span>
                {/* Por qué aparece esta persona: con varios grupos, sin esto no
                  * se sabe si es del grupo de la pareja o del de los padres. */}
                {allGroups.length > 1 && (
                  <span style={{ ...label, fontSize: 11.5, color: 'var(--fg-3)' }}>
                    {m.via.length > 1 ? `en ${m.via.join(' y ')}` : `en ${m.via[0]}`}
                  </span>
                )}
                {pending && <span style={{ ...label, fontSize: 12 }}>— esperando que acepte la invitación</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {OWF_PERMISSIONS.map(p => {
                  const on = cur === p.id;
                  const tint = owfPermTint(p.weight, on);
                  return (
                    <button key={p.id} disabled={pending} onClick={() => pick(m.user_id, p.id)} title={p.desc} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 5,
                      border: on ? '1px solid var(--brand-primary)' : '1px solid var(--border-hairline)',
                      borderRadius: 12, padding: '10px 11px', cursor: pending ? 'default' : 'pointer',
                      background: tint.background, color: tint.color, textAlign: 'left',
                      transition: 'background 140ms, border-color 140ms',
                    }}>
                      <span className="material-icons" style={{ fontSize: 17 }}>{p.icon}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11.5, lineHeight: 1.25 }}>{p.id === 'none' ? 'Sin acceso' : p.badge}</span>
                    </button>
                  );
                })}
              </div>
              {cur !== 'none' && !pending && (
                <p style={{ ...label, fontSize: 12.5, lineHeight: 1.5, marginTop: 8, textWrap: 'pretty' }}>
                  {OWF_PERMISSIONS.find(p => p.id === cur).desc}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border-hairline)' }}>
        <p style={{ ...label, fontSize: 12.5, flex: 1, lineHeight: 1.45, textWrap: 'pretty' }}>
          {granted === 0 ? 'Nadie tiene acceso a esta cuenta.' : `${granted} ${granted === 1 ? 'persona con acceso' : 'personas con acceso'}. Podés cambiarlo o quitarlo cuando quieras.`}
        </p>
        <PillButton variant="ghost" onClick={onClose}>Cancelar</PillButton>
        <PillButton onClick={() => onSave && onSave({ account_id: account.id, shares: Object.keys(form.perms).map(k => ({ user_id: Number(k), permission: form.perms[k] })).filter(s => s.permission !== 'none') })}>Guardar acceso</PillButton>
      </div>
    </div>
  );
}

Object.assign(window, { AccountShareDialog });
