/* ─── Organism · BusinessAccessPanel (Fase 2 · `business_users`) ───────────
 * Quién entra a la contabilidad de una empresa, y con qué rol.
 *
 * NO es el grupo familiar con otro nombre, y la diferencia manda el diseño:
 *
 *   · El grupo familiar comparte CUENTA POR CUENTA, con un nivel por cuenta.
 *     Una empresa da acceso a TODA su contabilidad con un rol. Un contador que
 *     ve tres cuentas de cinco no puede cerrar un mes.
 *   · El grupo familiar es recíproco: yo comparto lo mío, vos lo tuyo. Acá no.
 *     El dueño otorga, el invitado recibe. Por eso no hay "salir del grupo"
 *     simétrico: el dueño revoca, el invitado deja de acceder — dos acciones
 *     distintas, con dos textos distintos.
 *   · Un contador no es familia. No aparece en el grupo familiar, no comparte
 *     deudas internas y no se le puede registrar una deuda.
 *
 * Cada rol dice lo que PUEDE hacer en la propia fila, no en un tooltip: es la
 * única forma de que alguien elija bien sin abrir documentación.
 *
 * Regla que la UI impide romper: no se puede quitar al último dueño. Una
 * empresa sin dueño no la puede administrar nadie.
 *
 * Props: business({id,name,color,users[]}) · viewerUserId · onSave · onDelete
 *        onSelectAction · onChange
 * ──────────────────────────────────────────────────────────────────────── */
/* global React, Avatar, PillButton */

/* El rol se explica por lo que habilita, no por su nombre. "Contador" no dice
 * si puede borrar una cuenta; "registra movimientos, no toca la estructura" sí. */
const OWF_BIZ_ROLES = [
  { id: 'owner',      label: 'Dueño',       can: 'Todo: cuentas, categorías, cántaros, y dar acceso a otros.' },
  { id: 'accountant', label: 'Contador',    can: 'Registra y edita movimientos. No cambia la estructura ni da acceso.' },
  { id: 'viewer',     label: 'Solo lectura', can: 'Ve todo y exporta reportes. No registra nada.' },
];

function owfBizRole(id) { return OWF_BIZ_ROLES.find(r => r.id === id) || OWF_BIZ_ROLES[2]; }

function BusinessAccessPanel({ business, viewerUserId = 1, onSave, onDelete, onSelectAction, onChange }) {
  /* BIZ_FORCE_VIEW existe solo para revisar estados desde el mapa de rutas.
   * `role` y `revoke` hablan SIEMPRE de alguien concreto, así que el forzado
   * también siembra a quién: sin eso el título quedaba en "Quitar a " — una
   * confirmación destructiva sin el dato que la hace segura. */
  const forced = (typeof window !== 'undefined' && window.BIZ_FORCE_VIEW) || null;
  const forcedTarget = (typeof window !== 'undefined' && window.BIZ_FORCE_TARGET) || null;
  const [ui, setUi] = React.useState({
    view: forced || 'list',
    email: '', role: (((business && business.users) || []).find(u => u.user_id === forcedTarget) || {}).role || 'accountant', target: forcedTarget,
  });
  const set = (patch) => setUi(u => ({ ...u, ...patch }));

  const biz = business || {};
  const users = biz.users || [];
  const tint = biz.color || 'var(--brand-primary)';
  const owners = users.filter(u => u.role === 'owner' && u.status !== 'invited');
  const me = users.find(u => u.user_id === viewerUserId);
  const iAmOwner = !!me && me.role === 'owner';
  const otherOwners = owners.filter(u => u.user_id !== viewerUserId);
  /* Los bloques de rol y de quitar no se montan sin una persona resuelta: son
   * frases sobre alguien, no formularios genéricos. */
  const target = users.find(u => u.user_id === ui.target) || null;

  const label = { fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' };
  const input = { width: '100%', border: '1px solid var(--border-hairline)', borderRadius: 12, background: 'var(--surface-1)', color: 'var(--fg-1)', padding: '12px 14px', fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none' };

  const RolePicker = ({ value, onPick }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {OWF_BIZ_ROLES.map(r => {
        const on = value === r.id;
        return (
          <button key={r.id} type="button" onClick={() => onPick(r.id)}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 11, textAlign: 'left', width: '100%', cursor: 'pointer', padding: '12px 14px', borderRadius: 12, background: on ? 'var(--surface-1)' : 'transparent', border: `1px solid ${on ? tint : 'var(--border-hairline)'}` }}>
            <span style={{ width: 18, height: 18, borderRadius: 999, flexShrink: 0, marginTop: 1, border: `2px solid ${on ? tint : 'var(--border-hairline)'}`, background: on ? tint : 'transparent', display: 'grid', placeItems: 'center' }}>
              {on && <span style={{ width: 6, height: 6, borderRadius: 999, background: '#fff' }} />}
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--fg-1)' }}>{r.label}</span>
              <span style={{ display: 'block', ...label, fontSize: 12.5, lineHeight: 1.5, marginTop: 2, textWrap: 'pretty' }}>{r.can}</span>
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: 28, maxWidth: 620 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-pill)', background: tint, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>
          {(biz.name || '?').charAt(0)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: 'var(--fg-1)' }}>Acceso a la contabilidad</div>
          <div style={{ ...label, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{biz.name} · {users.length} {users.length === 1 ? 'persona' : 'personas'}</div>
        </div>
      </div>

      {/* Lo que distingue esto del grupo familiar, dicho una vez y arriba. */}
      <p style={{ ...label, fontSize: 12.5, lineHeight: 1.55, marginBottom: 20, textWrap: 'pretty' }}>
        Acá el acceso es a <b style={{ color: 'var(--fg-1)' }}>toda</b> la contabilidad de {biz.name}, con un rol — no cuenta por cuenta como en el grupo familiar. Tu contabilidad personal no se ve desde acá.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {users.map((u, i) => {
          const pending = u.status === 'invited';
          const role = owfBizRole(u.role);
          const lastOwner = u.role === 'owner' && owners.length === 1 && !pending;
          return (
            <div key={u.user_id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)' }}>
              <Avatar initial={u.name.charAt(0)} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14.5, color: pending ? 'var(--fg-2)' : 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: pending ? 'var(--warning-soft)' : (u.role === 'owner' ? 'var(--brand-primary-soft)' : 'var(--surface-2)'), color: pending ? 'var(--warning-fg)' : (u.role === 'owner' ? 'var(--brand-primary-fg-soft)' : 'var(--fg-2)') }}>
                    {pending ? 'Invitación enviada' : role.label}
                  </span>
                  {u.user_id === viewerUserId && <span style={{ ...label, fontSize: 11.5 }}>vos</span>}
                </div>
                <div style={{ ...label, fontSize: 12.5, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                {pending && <div style={{ ...label, fontSize: 12, marginTop: 3 }}>Invitado como {role.label.toLowerCase()} · hasta que acepte no ve nada</div>}
              </div>

              {pending ? (
                /* Cancelar una invitación es quitar acceso. Si solo el dueño
                 * invita, solo el dueño cancela — un contador que desinvita a
                 * gente de la contabilidad de otro es el mismo agujero. Un
                 * no-dueño ve la fila y su estado, sin acciones. */
                iAmOwner ? (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <PillButton size="sm" variant="ghost" onClick={() => onSelectAction && onSelectAction('resend:' + u.user_id)}>Reenviar</PillButton>
                    <PillButton size="sm" variant="ghost" onClick={() => onSelectAction && onSelectAction('cancel:' + u.user_id)}>Cancelar</PillButton>
                  </div>
                ) : null
              ) : u.user_id === viewerUserId ? (
                /* Fila propia: siempre hay salida, salvo si sos el último
                 * dueño. Un dueño con co-dueño sí se puede ir — la empresa
                 * queda administrada. Sin esta rama el mensaje del último
                 * dueño prometía un camino que desaparecía al seguirlo:
                 * pasabas el rol y la fila se quedaba sin botón. */
                lastOwner ? (
                  <span style={{ ...label, fontSize: 11.5, textAlign: 'right', maxWidth: 150, lineHeight: 1.4, flexShrink: 0, textWrap: 'pretty' }}>Sos el único dueño: para salir, primero pasale el rol a alguien</span>
                ) : (
                  <PillButton size="sm" variant="ghost" onClick={() => set({ view: 'leave' })}>Dejar de acceder</PillButton>
                )
              ) : iAmOwner ? (
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <PillButton size="sm" variant="ghost" onClick={() => set({ view: 'role', target: u.user_id, role: u.role })}>Cambiar rol</PillButton>
                  {/* Al último dueño no se lo puede quitar: una empresa sin
                    * dueño no la administra nadie. */}
                  {!lastOwner && <PillButton size="sm" variant="ghost" onClick={() => set({ view: 'revoke', target: u.user_id })}>Quitar</PillButton>}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {ui.view === 'invite' && (
        <div style={{ marginTop: 18, padding: 18, borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={label}>Correo de la persona</span>
            <input style={input} type="email" value={ui.email} onChange={e => { set({ email: e.target.value }); onChange && onChange('draftEmail', e.target.value); }} placeholder="contador@ejemplo.com" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={label}>Con qué rol</span>
            <RolePicker value={ui.role} onPick={r => { set({ role: r }); onChange && onChange('draftRole', r); }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <PillButton size="sm" disabled={!ui.email.trim()} onClick={() => { onSave && onSave({ action: 'invite', email: ui.email, role: ui.role, businessId: biz.id }); set({ view: 'list', email: '' }); }}>Enviar invitación</PillButton>
            <PillButton size="sm" variant="ghost" onClick={() => set({ view: 'list' })}>Cancelar</PillButton>
          </div>
        </div>
      )}

      {ui.view === 'role' && target && (
        <div style={{ marginTop: 18, padding: 18, borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)' }}>
            Rol de {target.name}
          </div>
          <RolePicker value={ui.role} onPick={r => set({ role: r })} />
          {ui.role === 'owner' && (
            <p style={{ ...label, fontSize: 12.5, lineHeight: 1.5, textWrap: 'pretty' }}>
              Como dueño también puede dar y quitar acceso, incluido el tuyo.
            </p>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <PillButton size="sm" onClick={() => { onSave && onSave({ action: 'set-role', userId: ui.target, role: ui.role, businessId: biz.id }); set({ view: 'list', target: null }); }}>Guardar rol</PillButton>
            <PillButton size="sm" variant="ghost" onClick={() => set({ view: 'list', target: null })}>Cancelar</PillButton>
          </div>
        </div>
      )}

      {ui.view === 'revoke' && target && (
        <div style={{ marginTop: 18, padding: 18, borderRadius: 'var(--radius-lg)', background: 'var(--expense-soft)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--expense-fg)' }}>
            Quitar a {target.name}
          </div>
          {/* Lo que se conserva importa tanto como lo que se pierde: sin esta
            * frase, quitar a un contador parece borrar su trabajo del mes. */}
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.55, color: 'var(--expense-fg)', textWrap: 'pretty' }}>
            Pierde el acceso a {biz.name} de inmediato. Los movimientos que registró quedan, con su marca de “operado por”.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <PillButton size="sm" variant="danger" onClick={() => { onDelete && onDelete(ui.target); set({ view: 'list', target: null }); }}>Quitar acceso</PillButton>
            <PillButton size="sm" variant="ghost" onClick={() => set({ view: 'list', target: null })}>Cancelar</PillButton>
          </div>
        </div>
      )}

      {ui.view === 'leave' && (
        <div style={{ marginTop: 18, padding: 18, borderRadius: 'var(--radius-lg)', background: 'var(--expense-soft)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--expense-fg)' }}>Dejar de acceder a {biz.name}</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.55, color: 'var(--expense-fg)', textWrap: 'pretty' }}>
            {biz.name} desaparece de tu selector de contabilidad. Tu contabilidad personal no cambia.{' '}
            {/* Un dueño que se va deja la empresa en manos del otro dueño; un
              * invitado depende de que lo vuelvan a invitar. No es la misma
              * consecuencia, así que no es la misma frase. */}
            {iAmOwner && otherOwners.length
              ? `${otherOwners.map(o => o.name).join(' y ')} queda${otherOwners.length > 1 ? 'n' : ''} al frente de la contabilidad. Para volver, tiene que invitarte.`
              : 'Para volver, alguien de la empresa tiene que invitarte otra vez.'}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <PillButton size="sm" variant="danger" onClick={() => { onSelectAction && onSelectAction('leave:' + biz.id); set({ view: 'list' }); }}>Dejar de acceder</PillButton>
            <PillButton size="sm" variant="ghost" onClick={() => set({ view: 'list' })}>Quedarme</PillButton>
          </div>
        </div>
      )}

      {/* Solo el dueño invita. Un contador que puede traer gente a la
        * contabilidad de otro es un agujero, no una comodidad. */}
      {iAmOwner && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border-hairline)' }}>
          <PillButton icon="person_add" onClick={() => set({ view: ui.view === 'invite' ? 'list' : 'invite', email: '', role: 'accountant' })}>Dar acceso a alguien</PillButton>
        </div>
      )}
      {!iAmOwner && (
        <p style={{ ...label, fontSize: 12.5, marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border-hairline)', textWrap: 'pretty' }}>
          Solo un dueño de {biz.name} puede dar o quitar acceso.
        </p>
      )}
    </div>
  );
}

Object.assign(window, { BusinessAccessPanel, OWF_BIZ_ROLES, owfBizRole });
