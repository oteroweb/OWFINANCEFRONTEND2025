/* ─── AdminScreens — pantallas del panel /admin/* (PROMPT_REDISENO_ADMIN.md) ──
 * 4 custom (Dashboard, Users index+detail, AI Monitor, System) + 1 motor
 * genérico parametrizable (AdminCrudTable) demostrado con 2 entidades reales
 * del dictionary (Monedas, Proveedores) en vez de construir las 15 pantallas
 * CRUD por separado — misma recomendación del prompt §2.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const { useState: useAdState } = React;

/* ═══ Fixtures ═══ */
const ADMIN_KPIS = [
  { icon: 'group', label: 'Usuarios totales', value: '1,284', accent: 'var(--brand-primary)' },
  { icon: 'person_check', label: 'Usuarios activos', value: '812', accent: 'var(--income)' },
  { icon: 'receipt_long', label: 'Transacciones totales', value: '48,930', accent: 'var(--info)' },
  { icon: 'calendar_month', label: 'Transacciones del mes', value: '3,102', accent: '#8B5CF6' },
  { icon: 'account_balance_wallet', label: 'Cuentas', value: '2,047', accent: '#F59E0B' },
  { icon: 'savings', label: 'Cántaros', value: '6,415', accent: '#EC4899' },
];

const AI_PROVIDERS = [
  { id: 'groq', label: 'Groq', model: 'llama-3.3-70b-versatile', active: true, position: 1 },
  { id: 'opencode-go', label: 'OpenCode Zen', model: 'opencode-go', active: true, position: 2 },
  { id: 'gemini', label: 'Gemini', model: 'gemini-1.5-flash', active: true, position: 3 },
  { id: 'openrouter', label: 'OpenRouter', model: '—', active: false, position: null },
  { id: 'xai', label: 'xAI (Grok)', model: '—', active: false, position: null },
  { id: 'openai', label: 'OpenAI', model: '—', active: false, position: null },
  { id: 'anthropic', label: 'Anthropic', model: '—', active: false, position: null },
];
const AI_FEATURES = [
  { key: 'advisor', label: 'Asesor IA', calls: 4102, tokensIn: 512000, tokensOut: 288000, cost: 4.12 },
  { key: 'voice', label: 'Voz', calls: 890, tokensIn: 98000, tokensOut: 41000, cost: 0.94 },
  { key: 'ocr', label: 'Foto / OCR', calls: 623, tokensIn: 210000, tokensOut: 35000, cost: 1.38 },
  { key: 'auto_ia', label: 'Auto IA', calls: 1245, tokensIn: 156000, tokensOut: 62000, cost: 1.51 },
];
const AI_CALLS = [
  { date: '25 Jul 14:22', user: 'usertestpro@demo.com', feature: 'advisor', provider: 'groq', model: 'llama-3.3-70b', tokens: 812, cost: 0.006 },
  { date: '25 Jul 14:18', user: 'otero@demo.com', feature: 'auto_ia', provider: 'opencode-go', model: 'opencode-go', tokens: 340, cost: 0.003 },
  { date: '25 Jul 13:55', user: 'maria@demo.com', feature: 'ocr', provider: 'gemini', model: 'gemini-1.5-flash', tokens: 1204, cost: 0.011 },
  { date: '25 Jul 13:40', user: 'usertestpro@demo.com', feature: 'voice', provider: 'groq', model: 'whisper-large-v3', tokens: 210, cost: 0.002 },
];

const SYSTEM_TABLES = [
  { name: 'users', count: 1284 }, { name: 'transactions', count: 48930 }, { name: 'accounts', count: 2047 },
  { name: 'jars', count: 6415 }, { name: 'categories', count: 3890 }, { name: 'debts', count: 512 },
  { name: 'dreams', count: 340 }, { name: 'ai_usage_logs', count: 6860 },
];
const SYSTEM_SESSIONS = [
  { name: 'José Otero', email: 'otero@demo.com', lastLogin: '25 Jul 09:14' },
  { name: 'Usuario Pro Test', email: 'usertestpro@demo.com', lastLogin: '25 Jul 08:02' },
  { name: 'María González', email: 'maria@demo.com', lastLogin: '24 Jul 21:47' },
];

const ADMIN_USERS = [
  { id: 1, name: 'José Otero', email: 'otero@demo.com', role: 'admin', mode: 'pro', active: true, registered: '11 Ene 2025' },
  { id: 2, name: 'Usuario Pro Test', email: 'usertestpro@demo.com', role: 'user', mode: 'pro', active: true, registered: '02 Mar 2025' },
  { id: 3, name: 'María González', email: 'maria@demo.com', role: 'user', mode: 'lite', active: true, registered: '18 Abr 2025' },
  { id: 4, name: 'Carlos Ruiz', email: 'carlos@demo.com', role: 'user', mode: 'lite', active: false, registered: '02 Jun 2025' },
];

const CRUD_ENTITIES = {
  currencies: {
    label: 'Monedas', icon: 'attach_money',
    columns: ['name', 'symbol', 'code', 'align', 'active'],
    labels: { name: 'Nombre', symbol: 'Símbolo', code: 'Código', align: 'Alineación', active: 'Activo' },
    rows: [
      { id: 1, name: 'Dólar estadounidense', symbol: '$', code: 'USD', align: 'left', active: true },
      { id: 2, name: 'Bolívar', symbol: 'Bs', code: 'VES', align: 'right', active: true },
      { id: 3, name: 'Euro', symbol: '€', code: 'EUR', align: 'left', active: true },
      { id: 4, name: 'Peso colombiano', symbol: '$', code: 'COP', align: 'right', active: false },
    ],
  },
  providers: {
    label: 'Proveedores', icon: 'storefront',
    columns: ['name', 'city', 'country', 'phone', 'active'],
    labels: { name: 'Nombre', city: 'Ciudad', country: 'País', phone: 'Teléfono', active: 'Activo' },
    rows: [
      { id: 1, name: 'Apple Store VE', city: 'Caracas', country: 'Venezuela', phone: '+58 212 000 0000', active: true },
      { id: 2, name: 'Megastore', city: 'Valencia', country: 'Venezuela', phone: '+58 241 000 0000', active: true },
      { id: 3, name: 'Whole Foods Market', city: 'Miami', country: 'USA', phone: '+1 305 000 0000', active: true },
    ],
  },
};

/* ═══ 1. Dashboard ═══ */
function AdminDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <Eyebrow>{t('Panel de administración')}</Eyebrow>
        <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t('Dashboard')}</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {ADMIN_KPIS.map((k, i) => (
          <Card key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: k.accent + '22', color: k.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ fontSize: 17 }}>{k.icon}</span>
            </span>
            <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 22, color: 'var(--fg-1)' }}>{k.value}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>{t(k.label)}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ═══ 2. AI Monitor ═══ */
function AiMonitorScreen() {
  const [period, setPeriod] = useAdState('30');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Eyebrow>{t('Panel de administración')}</Eyebrow>
          <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t('Monitor de IA')}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['7', '30', '90'].map(p => (
            <button key={p} type="button" onClick={() => setPeriod(p)} style={{ border: 0, cursor: 'pointer', padding: '7px 14px', borderRadius: 999, background: period === p ? 'var(--brand-primary)' : 'var(--surface-1)', color: period === p ? '#fff' : 'var(--fg-2)', fontFamily: 'var(--font-body)', fontWeight: period === p ? 700 : 600, fontSize: 12.5, boxShadow: period === p ? 'none' : 'var(--shadow-card)' }}>{p}d</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {AI_PROVIDERS.map(p => (
          <Card key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13.5, color: 'var(--fg-1)' }}>{p.label}</span>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: p.active ? 'var(--income)' : 'var(--surface-3)', flexShrink: 0 }} />
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-2)' }}>{p.model}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 600, color: p.active ? 'var(--income-fg)' : 'var(--fg-3)' }}>
              {p.active ? `${t('Fallback')} #${p.position}` : t('Sin key')}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)', marginBottom: 14 }}>{t('Desglose por funcionalidad')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          {AI_FEATURES.map(f => (
            <div key={f.key} style={{ padding: 14, borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 6 }}>{t(f.label)}</div>
              <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 18, color: 'var(--fg-1)' }}>{f.calls.toLocaleString('en-US')}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'var(--fg-3)' }}>{t('llamadas')} · ${f.cost.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card padding={0} style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 12.5, minWidth: 640 }}>
          <thead><tr>
            {['Fecha', 'Usuario', 'Feature', 'Proveedor', 'Modelo', 'Tokens', 'Costo'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid var(--border-hairline)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', color: 'var(--fg-3)' }}>{t(h)}</th>
            ))}
          </tr></thead>
          <tbody>
            {AI_CALLS.map((c, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-hairline)' }}>
                <td style={{ padding: '11px 14px', color: 'var(--fg-2)' }}>{c.date}</td>
                <td style={{ padding: '11px 14px', color: 'var(--fg-1)' }}>{c.user}</td>
                <td style={{ padding: '11px 14px' }}>{t(AI_FEATURES.find(f => f.key === c.feature)?.label || c.feature)}</td>
                <td style={{ padding: '11px 14px' }}>{c.provider}</td>
                <td style={{ padding: '11px 14px', color: 'var(--fg-2)' }}>{c.model}</td>
                <td style={{ padding: '11px 14px', fontFamily: 'var(--font-money)' }}>{c.tokens}</td>
                <td style={{ padding: '11px 14px', fontFamily: 'var(--font-money)' }}>${c.cost.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ═══ 3. System ═══ */
function SystemScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <Eyebrow>{t('Panel de administración')}</Eyebrow>
        <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t('Sistema')}</h1>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[['Entorno', 'production'], ['Deploy', '25 Jul 09:02'], ['Versión', 'v1.0.28']].map(([l, v], i) => (
          <span key={i} style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600, padding: '5px 12px', borderRadius: 999, background: 'var(--surface-2)', color: 'var(--fg-2)' }}>{l}: <strong style={{ color: 'var(--fg-1)' }}>{v}</strong></span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {SYSTEM_TABLES.map(tb => (
          <Card key={tb.name} padding={16}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)' }}>{tb.name}</div>
            <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 18, color: 'var(--fg-1)' }}>{tb.count.toLocaleString('en-US')}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)', marginBottom: 10 }}>{t('Últimas sesiones')}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {SYSTEM_SESSIONS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i ? '1px solid var(--border-hairline)' : 'none' }}>
              <Avatar initial={s.name.charAt(0)} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{s.name}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)' }}>{s.email}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>{s.lastLogin}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══ 4. Usuarios — index + detail (6 tabs) ═══ */
function UsersIndex({ onOpen }) {
  const [q, setQ] = useAdState('');
  const users = ADMIN_USERS.filter(u => !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <Eyebrow>{t('Panel de administración')}</Eyebrow>
        <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t('Usuarios')}</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {[['Total usuarios', ADMIN_USERS.length], ['Activos hoy', 3], ['Nuevos este mes', 1], ['Total registros', ADMIN_USERS.length]].map(([l, v], i) => (
          <Card key={i} padding={16}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)' }}>{t(l)}</div>
            <div style={{ fontFamily: 'var(--font-money)', fontWeight: 700, fontSize: 18, color: 'var(--fg-1)' }}>{v}</div>
          </Card>
        ))}
      </div>
      <TextInput value={q} onChange={setQ} placeholder={t('Buscar por nombre o email…')} icon="search" />
      <Card padding={0} style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 12.5, minWidth: 640 }}>
          <thead><tr>
            {['Usuario', 'Rol', 'Modo', 'Activo', 'Registrado', ''].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid var(--border-hairline)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', color: 'var(--fg-3)' }}>{t(h)}</th>
            ))}
          </tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-hairline)' }}>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar initial={u.name.charAt(0)} size={28} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--fg-1)' }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg-2)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '11px 14px' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: u.role === 'admin' ? 'var(--brand-primary-soft)' : 'var(--surface-2)', color: u.role === 'admin' ? 'var(--brand-primary)' : 'var(--fg-2)' }}>{u.role}</span>
                </td>
                <td style={{ padding: '11px 14px', textTransform: 'capitalize' }}>{u.mode}</td>
                <td style={{ padding: '11px 14px' }}>
                  <span style={{ width: 30, height: 18, borderRadius: 999, background: u.active ? 'var(--income-fg)' : 'var(--surface-3)', position: 'relative', display: 'inline-block' }}>
                    <span style={{ position: 'absolute', top: 2, left: u.active ? 14 : 2, width: 14, height: 14, borderRadius: 999, background: '#fff' }} />
                  </span>
                </td>
                <td style={{ padding: '11px 14px', color: 'var(--fg-2)' }}>{u.registered}</td>
                <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                  <button type="button" onClick={() => onOpen(u.id)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12 }}>{t('Ver')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

const USER_DETAIL_TABS = ['Perfil', 'Cuentas', 'Cántaros', 'Transacciones', 'Seguridad', 'Ajustes'];
function UserDetail({ userId, onBack, onImpersonate }) {
  const user = ADMIN_USERS.find(u => u.id === userId) || ADMIN_USERS[0];
  const [tab, setTab] = useAdState('Perfil');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <button type="button" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, padding: 0, alignSelf: 'flex-start' }}>
        <span className="material-icons" style={{ fontSize: 17 }}>chevron_left</span>{t('Usuarios')}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <Avatar initial={user.name.charAt(0)} size={52} />
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: 'var(--fg-1)' }}>{user.name}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg-2)' }}>{user.email}</div>
        </div>
        <PillButton variant="secondary" icon="visibility" onClick={onImpersonate}>{t('Impersonar')}</PillButton>
      </div>
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border-hairline)', flexWrap: 'wrap' }}>
        {USER_DETAIL_TABS.map(tb => (
          <button key={tb} type="button" onClick={() => setTab(tb)} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: '9px 14px', fontFamily: 'var(--font-body)', fontWeight: tab === tb ? 700 : 500, fontSize: 13, color: tab === tb ? 'var(--brand-primary)' : 'var(--fg-2)', borderBottom: tab === tb ? '2px solid var(--brand-primary)' : '2px solid transparent', marginBottom: -1 }}>{t(tb)}</button>
        ))}
      </div>
      <Card>
        {tab === 'Perfil' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label={t('Nombre')}><TextInput value={user.name} onChange={() => {}} /></Field>
            <Field label={t('Rol')}><Picker value={user.role} onChange={() => {}} options={[{ value: 'user', label: t('Usuario') }, { value: 'admin', label: t('Admin') }]} /></Field>
            <Field label={t('Modo')}><Picker value={user.mode} onChange={() => {}} options={[{ value: 'lite', label: 'Lite' }, { value: 'pro', label: 'Pro' }]} /></Field>
          </div>
        )}
        {tab === 'Cuentas' && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>{t('3 cuentas · patrimonio $8,240.00')}</div>}
        {tab === 'Cántaros' && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>{t('5 cántaros activos')}</div>}
        {tab === 'Transacciones' && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>{t('142 transacciones recientes')}</div>}
        {tab === 'Seguridad' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)' }}>{t('2 sesiones activas')}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <PillButton variant="secondary" icon="lock_reset">{t('Enviar reset por email')}</PillButton>
              <PillButton variant="ghost" icon="logout">{t('Revocar sesiones')}</PillButton>
            </div>
          </div>
        )}
        {tab === 'Ajustes' && (
          <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: 11.5, color: 'var(--fg-2)', background: 'var(--surface-2)', padding: 12, borderRadius: 'var(--radius-sm)', overflowX: 'auto' }}>{JSON.stringify({ layout_mode: user.mode, hide_values: false, theme: 'light' }, null, 2)}</pre>
        )}
      </Card>
    </div>
  );
}

/* ═══ 5. Motor genérico — AdminCrudTable, parametrizable ═══ */
function AdminCrudTable({ entityKey }) {
  const entity = CRUD_ENTITIES[entityKey];
  const [rows, setRows] = useAdState(entity.rows);
  const [editId, setEditId] = useAdState(null);
  const [newOpen, setNewOpen] = useAdState(false);

  const removeRow = (id) => setRows(rs => rs.filter(r => r.id !== id));
  const editRow = rows.find(r => r.id === editId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Eyebrow>{t('Panel de administración')}</Eyebrow>
          <h1 className="t-h1" style={{ margin: '6px 0 0' }}>{t(entity.label)}</h1>
        </div>
        <PillButton variant="primary" icon="add" onClick={() => setNewOpen(true)}>{t('Nuevo')}</PillButton>
      </div>
      <Card padding={0} style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 12.5, minWidth: 560 }}>
          <thead><tr>
            {entity.columns.map(c => <th key={c} style={{ textAlign: 'left', padding: '12px 14px', borderBottom: '1px solid var(--border-hairline)', fontSize: 10.5, fontWeight: 700, letterSpacing: '.04em', color: 'var(--fg-3)' }}>{entity.labels[c]}</th>)}
            <th style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-hairline)' }} />
          </tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border-hairline)' }}>
                {entity.columns.map(c => (
                  <td key={c} style={{ padding: '11px 14px', color: 'var(--fg-1)' }}>
                    {c === 'active' ? (
                      <span style={{ width: 30, height: 18, borderRadius: 999, background: r[c] ? 'var(--income-fg)' : 'var(--surface-3)', position: 'relative', display: 'inline-block' }}>
                        <span style={{ position: 'absolute', top: 2, left: r[c] ? 14 : 2, width: 14, height: 14, borderRadius: 999, background: '#fff' }} />
                      </span>
                    ) : String(r[c])}
                  </td>
                ))}
                <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button type="button" onClick={() => setEditId(r.id)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--brand-primary)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, marginRight: 10 }}>{t('Editar')}</button>
                  <button type="button" onClick={() => removeRow(r.id)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--expense-fg)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12 }}>{t('Eliminar')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-3)' }}>
        {t('Elimina sin confirmación previa — mismo patrón en las 15 vistas CRUD genéricas del panel admin (ver prompt §1, decidir si se agrega confirmación al motor).')}
      </div>
      {(editRow || newOpen) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 15000, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => { setEditId(null); setNewOpen(false); }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 'min(380px,100%)', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--fg-1)' }}>{editRow ? t('Editar') : t('Nuevo')} · {t(entity.label)}</div>
            {entity.columns.filter(c => c !== 'active').map(c => (
              <Field key={c} label={entity.labels[c]}><TextInput value={editRow ? String(editRow[c]) : ''} onChange={() => {}} /></Field>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={() => { setEditId(null); setNewOpen(false); }} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600 }}>{t('Cancelar')}</button>
              <button type="button" onClick={() => { setEditId(null); setNewOpen(false); }} style={{ border: 0, cursor: 'pointer', padding: '9px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--brand-primary)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13 }}>{t('Guardar')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { AdminDashboard, AiMonitorScreen, SystemScreen, UsersIndex, UserDetail, AdminCrudTable, CRUD_ENTITIES });
