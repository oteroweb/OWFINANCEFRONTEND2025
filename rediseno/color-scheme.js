/* ============================================================
   OW Finance — Color scheme customizer
   Live editing of the 5 standardized roles + presets + export.
   ============================================================ */
(function () {
  'use strict';

  // The 5 standardized roles
  const ROLES = [
    { key: 'brand',   var: '--c-brand',   n: 'Marca',                t: '30%', d: 'Identidad, estado activo, logo' },
    { key: 'action',  var: '--c-action',  n: 'Acción (CTA)',         t: '10%', d: 'El botón que convierte' },
    { key: 'heading', var: '--c-heading', n: 'Títulos',              t: 'Tinta', d: 'Texto de alto contraste' },
    { key: 'body',    var: '--c-body',    n: 'Subtítulos / cuerpo',  t: 'Tinta —', d: 'Texto secundario' },
    { key: 'surface', var: '--c-surface', n: 'Fondo / Superficie',   t: '60%', d: 'Base neutra dominante' },
  ];

  // 5-color presets (each a valid standardized scheme)
  const PRESETS = {
    'Navy (actual)': { brand: '#1E3A8A', action: '#1E3A8A', heading: '#0F172A', body: '#64748B', surface: '#F8FAFC' },
    'Cyan primero':  { brand: '#0EA5E9', action: '#0284C7', heading: '#0F172A', body: '#64748B', surface: '#F8FAFC' },
    'Esmeralda':     { brand: '#047857', action: '#059669', heading: '#0B1220', body: '#6B7280', surface: '#F5FAF7' },
    'Grafito':       { brand: '#111827', action: '#2563EB', heading: '#0B1220', body: '#64748B', surface: '#F7F8FA' },
    'Ciruela':       { brand: '#6D28D9', action: '#7C3AED', heading: '#1A1426', body: '#6B7280', surface: '#FAF9FE' },
    'Terracota':     { brand: '#9A3412', action: '#EA580C', heading: '#1C1410', body: '#78716C', surface: '#FBF7F4' },
  };

  const DARK_NEUTRALS = { heading: '#F1F5F9', body: '#94A3B8', surface: '#0F172A' };

  const state = {
    light: { ...PRESETS['Navy (actual)'] },
    dark:  { brand: '#1E3A8A', action: '#1E3A8A', ...DARK_NEUTRALS },
    theme: 'light',
  };

  const $ = s => document.querySelector(s);
  const preview = () => document.getElementById('previewRoot');

  function current() { return state[state.theme]; }

  function apply() {
    const c = current();
    const root = preview();
    ROLES.forEach(r => root.style.setProperty(r.var, c[r.key]));
    // sync swatch UI
    ROLES.forEach(r => {
      const sw = document.querySelector(`.role-card[data-key="${r.key}"]`);
      if (!sw) return;
      sw.querySelector('.rc-chip').style.background = c[r.key];
      sw.querySelector('.rc-hex').textContent = c[r.key].toUpperCase();
      sw.querySelector('input[type="color"]').value = toHex6(c[r.key]);
    });
    updateExports();
  }

  function toHex6(v) {
    // normalize to #rrggbb for <input type=color>
    if (/^#[0-9a-f]{6}$/i.test(v)) return v;
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = v; return ctx.fillStyle;
  }

  function setRole(key, val) { current()[key] = val; apply(); }

  function loadPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.light = { ...p };
    // dark keeps brand+action, swaps neutrals
    state.dark = { brand: p.brand, action: p.action, ...DARK_NEUTRALS };
    apply();
    document.querySelectorAll('.preset').forEach(b => b.classList.toggle('on', b.dataset.name === name));
  }

  /* ── exports ── */
  function updateExports() {
    const c = current();
    const cssBlock =
`:root {
  --c-brand:   ${c.brand.toUpperCase()};   /* Marca */
  --c-action:  ${c.action.toUpperCase()};   /* Acción (CTA) */
  --c-heading: ${c.heading.toUpperCase()};   /* Títulos */
  --c-body:    ${c.body.toUpperCase()};   /* Subtítulos / cuerpo */
  --c-surface: ${c.surface.toUpperCase()};   /* Fondo */
}`;
    const envBlock =
`# OW Finance · esquema de color (5 roles)
VITE_OW_COLOR_BRAND=${c.brand.toUpperCase()}
VITE_OW_COLOR_ACTION=${c.action.toUpperCase()}
VITE_OW_COLOR_HEADING=${c.heading.toUpperCase()}
VITE_OW_COLOR_BODY=${c.body.toUpperCase()}
VITE_OW_COLOR_SURFACE=${c.surface.toUpperCase()}`;
    const jsBlock =
`// quasar.config / theme object
export const owColorScheme = {
  brand:   '${c.brand.toUpperCase()}',
  action:  '${c.action.toUpperCase()}',
  heading: '${c.heading.toUpperCase()}',
  body:    '${c.body.toUpperCase()}',
  surface: '${c.surface.toUpperCase()}',
};`;
    const m = { css: cssBlock, env: envBlock, js: jsBlock };
    Object.keys(m).forEach(k => { const el = document.getElementById('out-' + k); if (el) el.textContent = m[k]; });
  }

  /* ── boot ── */
  document.addEventListener('DOMContentLoaded', () => {
    // build role cards
    const rolesWrap = document.getElementById('roles');
    if (!rolesWrap) return; // not the color-scheme tool page — no-op in any consumer
    rolesWrap.innerHTML = ROLES.map((r, i) => `
      <div class="role-card" data-key="${r.key}">
        <div class="rc-top">
          <span class="rc-num">${i + 1}</span>
          <span class="rc-theory">${r.t}</span>
        </div>
        <label class="rc-chip-wrap">
          <span class="rc-chip"></span>
          <input type="color" aria-label="${r.n}">
        </label>
        <div class="rc-meta">
          <div class="rc-name">${r.n}</div>
          <div class="rc-desc">${r.d}</div>
          <div class="rc-hex">#000000</div>
        </div>
      </div>`).join('');

    rolesWrap.querySelectorAll('.role-card').forEach(card => {
      const key = card.dataset.key;
      const input = card.querySelector('input[type="color"]');
      input.addEventListener('input', () => setRole(key, input.value));
    });

    // presets
    const presetWrap = document.getElementById('presets');
    presetWrap.innerHTML = Object.keys(PRESETS).map(name => {
      const p = PRESETS[name];
      const dots = ['brand', 'action', 'heading', 'body', 'surface']
        .map(k => `<span style="background:${p[k]}"></span>`).join('');
      return `<button class="preset ${name === 'Navy (actual)' ? 'on' : ''}" data-name="${name}">
        <span class="pr-dots">${dots}</span><span class="pr-name">${name}</span></button>`;
    }).join('');
    presetWrap.querySelectorAll('.preset').forEach(b => b.addEventListener('click', () => loadPreset(b.dataset.name)));

    // theme toggle (affects preview + which scheme you edit)
    const themeSeg = document.getElementById('themeSeg');
    themeSeg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      state.theme = b.dataset.theme;
      preview().setAttribute('data-theme', state.theme);
      themeSeg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      apply();
    }));

    // page theme toggle (the doc chrome)
    const pageBtn = document.getElementById('page-theme');
    pageBtn.addEventListener('click', () => {
      const html = document.documentElement;
      const dark = html.getAttribute('data-theme') === 'dark';
      html.setAttribute('data-theme', dark ? 'light' : 'dark');
      pageBtn.querySelector('.material-icons').textContent = dark ? 'dark_mode' : 'light_mode';
    });

    // tabs for export
    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x === t));
      document.querySelectorAll('.out-pane').forEach(p => p.classList.toggle('on', p.id === 'out-pane-' + t.dataset.tab));
    }));

    // copy buttons
    document.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', () => {
      const txt = document.getElementById('out-' + btn.dataset.copy).textContent;
      navigator.clipboard.writeText(txt).then(() => {
        const o = btn.innerHTML;
        btn.innerHTML = '<span class="material-icons">check</span>Copiado';
        setTimeout(() => btn.innerHTML = o, 1500);
      });
    }));

    // randomize (harmonious-ish): rotate hue of brand/action, keep neutrals
    const rnd = document.getElementById('randomBtn');
    if (rnd) rnd.addEventListener('click', () => {
      const h = Math.floor(Math.random() * 360);
      const brand = hsl(h, 64, 34), action = hsl(h, 70, 42);
      current().brand = brand; current().action = action; apply();
      document.querySelectorAll('.preset').forEach(b => b.classList.remove('on'));
    });

    apply();
  });

  function hsl(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const to = x => Math.round(255 * x).toString(16).padStart(2, '0');
    return '#' + to(f(0)) + to(f(8)) + to(f(4));
  }
})();
