/* @ds-bundle: {"format":3,"namespace":"OWFinanceDesignSystem_5fd9e1","components":[],"sourceHashes":{"color-scheme.js":"3826de35bf09","marketing.js":"36bbac9b2d80","period-selector.js":"c2a20d7eedfd","ui_kits/lite-desktop/atoms/Buttons.jsx":"c3e71689c42d","ui_kits/lite-desktop/atoms/Chips.jsx":"a65662ac37ef","ui_kits/lite-desktop/atoms/Primitives.jsx":"e7aac8cbb6a3","ui_kits/lite-desktop/data/analisis-data.jsx":"e23f915aba6d","ui_kits/lite-desktop/data/finance-data.jsx":"b6e0ba2e425f","ui_kits/lite-desktop/data/i18n.jsx":"de1debafb9a5","ui_kits/lite-desktop/data/sample-data.jsx":"990e5a45a9ba","ui_kits/lite-desktop/molecules/FormControls.jsx":"b9ef67ebbd31","ui_kits/lite-desktop/molecules/SectionHeader.jsx":"c678a94f59f6","ui_kits/lite-desktop/organisms/AIAdvisorPanel.jsx":"4fbe1bc97d0b","ui_kits/lite-desktop/organisms/AccountsPanel.jsx":"056fe9295aa8","ui_kits/lite-desktop/organisms/AnalisisParts.jsx":"74865d041fe2","ui_kits/lite-desktop/organisms/BulkImportPanel.jsx":"65d4fd8387e2","ui_kits/lite-desktop/organisms/DebtsPreview.jsx":"b4733871862e","ui_kits/lite-desktop/organisms/DesktopQuickModal.jsx":"cfecb8dac9d5","ui_kits/lite-desktop/organisms/DreamsPreview.jsx":"5462b9553bdd","ui_kits/lite-desktop/organisms/ExchangeRatesWidget.jsx":"a07bd95d9511","ui_kits/lite-desktop/organisms/ExpandedMenu.jsx":"0c3e79aec576","ui_kits/lite-desktop/organisms/HeroBalance.jsx":"5cecf9195e72","ui_kits/lite-desktop/organisms/JarsPreview.jsx":"5c5508796730","ui_kits/lite-desktop/organisms/LiteHeader.jsx":"6e4a5afe2210","ui_kits/lite-desktop/organisms/LiteNavPill.jsx":"f054260b22fc","ui_kits/lite-desktop/organisms/MobileTabBar.jsx":"1fbb5dbe5887","ui_kits/lite-desktop/organisms/NotificationsPanel.jsx":"38325011a256","ui_kits/lite-desktop/organisms/RecentTransactions.jsx":"739e778ab245","ui_kits/lite-desktop/organisms/SmartTransactionModal.jsx":"90e5576352f1","ui_kits/lite-desktop/organisms/TransactionForm.jsx":"30842be6a667","ui_kits/lite-desktop/shells/LiteShell.jsx":"0d2ee697f753","ui_kits/lite-desktop/shells/ProShell.jsx":"a3213bcb13fe","ui_kits/lite-desktop/templates/AnalisisRoute.jsx":"592e90af5138","ui_kits/lite-desktop/templates/ConfigRoute.jsx":"d2da1bd4282b","ui_kits/lite-desktop/templates/DebtsRoute.jsx":"92530729a003","ui_kits/lite-desktop/templates/DreamsRoute.jsx":"b614f96aa92e","ui_kits/lite-desktop/templates/HomeRoute.jsx":"cb2aebdcad3c","ui_kits/lite-desktop/templates/JarsRoute.jsx":"53325c31755b","ui_kits/lite-desktop/templates/ProAnalisisRoute.jsx":"53219c9595fb","ui_kits/lite-desktop/templates/ProHomeRoute.jsx":"80ccaf7f02fc","ui_kits/lite-desktop/templates/TransactionsRoute.jsx":"65c848606c58","ui_kits/mobile/Shell.jsx":"a7195d798de0","ui_kits/mobile/components/Atoms.jsx":"f89904173ab3","ui_kits/mobile/components/BalanceCard.jsx":"01b71c947363","ui_kits/mobile/components/ChatComponents.jsx":"753c82f5ef5f","ui_kits/mobile/components/JarComponents.jsx":"f023ec4718e6","ui_kits/mobile/components/Navigation.jsx":"668e1954c585","ui_kits/mobile/components/QuickActionSheet.jsx":"15046132a771","ui_kits/mobile/components/SmartTransactionSheet.jsx":"87d9ec1c246e","ui_kits/mobile/components/TransactionComponents.jsx":"7c73db0de41d","ui_kits/mobile/data.jsx":"f62a033856e8","ui_kits/mobile/screens/AIAdvisorScreen.jsx":"c8481db07461","ui_kits/mobile/screens/HomeScreenLite.jsx":"5f34f5ae1b7d","ui_kits/mobile/screens/HomeScreenPro.jsx":"48d19eac4dcb","ui_kits/mobile/screens/JarsScreen.jsx":"c4d236dbde24","ui_kits/mobile/screens/SettingsScreen.jsx":"e98f5ffaff9c","ui_kits/mobile/screens/TransactionsScreen.jsx":"805c0f2aee6e","ui_kits/mobile/tokens.js":"66ccee7c23e3"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.OWFinanceDesignSystem_5fd9e1 = window.OWFinanceDesignSystem_5fd9e1 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// color-scheme.js
try { (() => {
/* ============================================================
   OW Finance — Color scheme customizer
   Live editing of the 5 standardized roles + presets + export.
   ============================================================ */
(function () {
  'use strict';

  // The 5 standardized roles
  const ROLES = [{
    key: 'brand',
    var: '--c-brand',
    n: 'Marca',
    t: '30%',
    d: 'Identidad, estado activo, logo'
  }, {
    key: 'action',
    var: '--c-action',
    n: 'Acción (CTA)',
    t: '10%',
    d: 'El botón que convierte'
  }, {
    key: 'heading',
    var: '--c-heading',
    n: 'Títulos',
    t: 'Tinta',
    d: 'Texto de alto contraste'
  }, {
    key: 'body',
    var: '--c-body',
    n: 'Subtítulos / cuerpo',
    t: 'Tinta —',
    d: 'Texto secundario'
  }, {
    key: 'surface',
    var: '--c-surface',
    n: 'Fondo / Superficie',
    t: '60%',
    d: 'Base neutra dominante'
  }];

  // 5-color presets (each a valid standardized scheme)
  const PRESETS = {
    'Navy (actual)': {
      brand: '#1E3A8A',
      action: '#1E3A8A',
      heading: '#0F172A',
      body: '#64748B',
      surface: '#F8FAFC'
    },
    'Cyan primero': {
      brand: '#0EA5E9',
      action: '#0284C7',
      heading: '#0F172A',
      body: '#64748B',
      surface: '#F8FAFC'
    },
    'Esmeralda': {
      brand: '#047857',
      action: '#059669',
      heading: '#0B1220',
      body: '#6B7280',
      surface: '#F5FAF7'
    },
    'Grafito': {
      brand: '#111827',
      action: '#2563EB',
      heading: '#0B1220',
      body: '#64748B',
      surface: '#F7F8FA'
    },
    'Ciruela': {
      brand: '#6D28D9',
      action: '#7C3AED',
      heading: '#1A1426',
      body: '#6B7280',
      surface: '#FAF9FE'
    },
    'Terracota': {
      brand: '#9A3412',
      action: '#EA580C',
      heading: '#1C1410',
      body: '#78716C',
      surface: '#FBF7F4'
    }
  };
  const DARK_NEUTRALS = {
    heading: '#F1F5F9',
    body: '#94A3B8',
    surface: '#0F172A'
  };
  const state = {
    light: {
      ...PRESETS['Navy (actual)']
    },
    dark: {
      brand: '#1E3A8A',
      action: '#1E3A8A',
      ...DARK_NEUTRALS
    },
    theme: 'light'
  };
  const $ = s => document.querySelector(s);
  const preview = () => document.getElementById('previewRoot');
  function current() {
    return state[state.theme];
  }
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
    ctx.fillStyle = v;
    return ctx.fillStyle;
  }
  function setRole(key, val) {
    current()[key] = val;
    apply();
  }
  function loadPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.light = {
      ...p
    };
    // dark keeps brand+action, swaps neutrals
    state.dark = {
      brand: p.brand,
      action: p.action,
      ...DARK_NEUTRALS
    };
    apply();
    document.querySelectorAll('.preset').forEach(b => b.classList.toggle('on', b.dataset.name === name));
  }

  /* ── exports ── */
  function updateExports() {
    const c = current();
    const cssBlock = `:root {
  --c-brand:   ${c.brand.toUpperCase()};   /* Marca */
  --c-action:  ${c.action.toUpperCase()};   /* Acción (CTA) */
  --c-heading: ${c.heading.toUpperCase()};   /* Títulos */
  --c-body:    ${c.body.toUpperCase()};   /* Subtítulos / cuerpo */
  --c-surface: ${c.surface.toUpperCase()};   /* Fondo */
}`;
    const envBlock = `# OW Finance · esquema de color (5 roles)
VITE_OW_COLOR_BRAND=${c.brand.toUpperCase()}
VITE_OW_COLOR_ACTION=${c.action.toUpperCase()}
VITE_OW_COLOR_HEADING=${c.heading.toUpperCase()}
VITE_OW_COLOR_BODY=${c.body.toUpperCase()}
VITE_OW_COLOR_SURFACE=${c.surface.toUpperCase()}`;
    const jsBlock = `// quasar.config / theme object
export const owColorScheme = {
  brand:   '${c.brand.toUpperCase()}',
  action:  '${c.action.toUpperCase()}',
  heading: '${c.heading.toUpperCase()}',
  body:    '${c.body.toUpperCase()}',
  surface: '${c.surface.toUpperCase()}',
};`;
    const m = {
      css: cssBlock,
      env: envBlock,
      js: jsBlock
    };
    Object.keys(m).forEach(k => {
      const el = document.getElementById('out-' + k);
      if (el) el.textContent = m[k];
    });
  }

  /* ── boot ── */
  document.addEventListener('DOMContentLoaded', () => {
    // build role cards
    const rolesWrap = document.getElementById('roles');
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
      const dots = ['brand', 'action', 'heading', 'body', 'surface'].map(k => `<span style="background:${p[k]}"></span>`).join('');
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
      const brand = hsl(h, 64, 34),
        action = hsl(h, 70, 42);
      current().brand = brand;
      current().action = action;
      apply();
      document.querySelectorAll('.preset').forEach(b => b.classList.remove('on'));
    });
    apply();
  });
  function hsl(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const to = x => Math.round(255 * x).toString(16).padStart(2, '0');
    return '#' + to(f(0)) + to(f(8)) + to(f(4));
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "color-scheme.js", error: String((e && e.message) || e) }); }

// marketing.js
try { (() => {
/* OW Finance marketing — shared behaviors */
(function () {
  // Theme: persist + restore
  var KEY = "ow-theme";
  function apply(t) {
    document.documentElement.setAttribute("data-theme", t);
    document.querySelectorAll("[data-theme-toggle] .material-icons").forEach(function (i) {
      i.textContent = t === "dark" ? "light_mode" : "dark_mode";
    });
  }
  try {
    var saved = localStorage.getItem(KEY);
    if (saved) apply(saved);
  } catch (e) {}
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-theme-toggle]");
    if (t) {
      var cur = document.documentElement.getAttribute("data-theme") || "light";
      var next = cur === "dark" ? "light" : "dark";
      apply(next);
      try {
        localStorage.setItem(KEY, next);
      } catch (er) {}
      return;
    }
    var b = e.target.closest("[data-nav-burger]");
    if (b) {
      var menu = document.querySelector("[data-mobile-menu]");
      if (menu) menu.toggleAttribute("hidden");
    }
    var ml = e.target.closest("[data-mobile-menu] a");
    if (ml) {
      var m = document.querySelector("[data-mobile-menu]");
      if (m) m.setAttribute("hidden", "");
    }
  });

  // Reveal on scroll
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -8% 0px"
  });
  function observe() {
    document.querySelectorAll(".reveal:not(.in)").forEach(function (el) {
      io.observe(el);
    });
  }
  if (document.readyState !== "loading") observe();else document.addEventListener("DOMContentLoaded", observe);
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "marketing.js", error: String((e && e.message) || e) }); }

// period-selector.js
try { (() => {
/* ============================================================
   OW Finance — Period selector engine
   8 granularities + Todo + Personalizado.
   Anchored to the current date (June 7, 2026 in this system).
   ============================================================ */
(function () {
  'use strict';

  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MABBR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const DOW_SH = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const DOW_MN = ['L', 'M', 'M', 'J', 'V', 'S', 'D']; // Monday-first picker header

  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const d = (y, m, day) => new Date(y, m, day);
  const clone = dt => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const lastDay = (y, m) => new Date(y, m + 1, 0).getDate();
  const addDays = (dt, n) => {
    const x = clone(dt);
    x.setDate(x.getDate() + n);
    return x;
  };
  const addMonths = (dt, n) => {
    const x = clone(dt);
    x.setMonth(x.getMonth() + n, 1);
    return x;
  };
  const sameYMD = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const TODAY = new Date(2026, 5, 7); // Jun 7, 2026 — system "now"

  // Monday of the week containing dt
  function mondayOf(dt) {
    const x = clone(dt);
    const wd = (x.getDay() + 6) % 7; // 0 = Monday
    return addDays(x, -wd);
  }
  // ISO week number
  function isoWeek(dt) {
    const t = clone(dt);
    t.setDate(t.getDate() + 4 - (t.getDay() + 6) % 7);
    const yStart = new Date(t.getFullYear(), 0, 1);
    return Math.ceil(((t - yStart) / 86400000 + 1) / 7);
  }

  /* ── Grain catalogue ─────────────────────────────────────── */
  const GRAINS = {
    dia: {
      name: 'Día',
      icon: 'today',
      group: 'Cortos',
      unit: 'día'
    },
    semana: {
      name: 'Semana',
      icon: 'date_range',
      group: 'Cortos',
      unit: 'semana'
    },
    quincena: {
      name: 'Quincena',
      icon: 'splitscreen',
      group: 'Cortos',
      unit: 'quincena'
    },
    mes: {
      name: 'Mes',
      icon: 'calendar_view_month',
      group: 'Estándar',
      unit: 'mes'
    },
    bimestre: {
      name: 'Bimestre',
      icon: 'calendar_view_week',
      group: 'Estándar',
      unit: '2 meses'
    },
    trimestre: {
      name: 'Trimestre',
      icon: 'event_note',
      group: 'Estándar',
      unit: '3 meses'
    },
    semestre: {
      name: 'Semestre',
      icon: 'calendar_month',
      group: 'Estándar',
      unit: '6 meses'
    },
    anio: {
      name: 'Año',
      icon: 'calendar_today',
      group: 'Largos',
      unit: 'año'
    },
    todo: {
      name: 'Todo',
      icon: 'all_inclusive',
      group: 'Especiales',
      unit: '— histórico'
    },
    custom: {
      name: 'Personalizado',
      icon: 'tune',
      group: 'Especiales',
      unit: '— rango'
    }
  };
  const GROUP_ORDER = ['Cortos', 'Estándar', 'Largos', 'Especiales'];
  const QUICK = ['mes', 'trimestre', 'anio'];

  /* ── Period resolution: anchor + grain → {from, to, label, example} ── */
  function resolve(grain, anchor) {
    const a = clone(anchor);
    const y = a.getFullYear(),
      m = a.getMonth(),
      day = a.getDate();
    switch (grain) {
      case 'dia':
        {
          return {
            from: a,
            to: a,
            label: `${DOW_SH[a.getDay()]} ${day} ${MABBR[m]} ${y}`
          };
        }
      case 'semana':
        {
          const mon = mondayOf(a),
            sun = addDays(mon, 6);
          const wk = isoWeek(a);
          const span = sun.getMonth() === mon.getMonth() ? `${mon.getDate()}–${sun.getDate()} ${MABBR[mon.getMonth()]}` : `${mon.getDate()} ${MABBR[mon.getMonth()]}–${sun.getDate()} ${MABBR[sun.getMonth()]}`;
          return {
            from: mon,
            to: sun,
            label: `Sem ${wk} · ${span}`
          };
        }
      case 'quincena':
        {
          const first = day <= 15;
          const from = d(y, m, first ? 1 : 16);
          const to = d(y, m, first ? 15 : lastDay(y, m));
          return {
            from,
            to,
            label: `Q${first ? 1 : 2} ${MABBR[m]} · ${from.getDate()}–${to.getDate()}`
          };
        }
      case 'mes':
        {
          return {
            from: d(y, m, 1),
            to: d(y, m, lastDay(y, m)),
            label: `${cap(MONTHS[m])} ${y}`
          };
        }
      case 'bimestre':
        {
          const bStart = Math.floor(m / 2) * 2;
          return {
            from: d(y, bStart, 1),
            to: d(y, bStart + 1, lastDay(y, bStart + 1)),
            label: `${cap(MABBR[bStart])}–${cap(MABBR[bStart + 1])} ${y}`
          };
        }
      case 'trimestre':
        {
          const qStart = Math.floor(m / 3) * 3,
            q = qStart / 3 + 1;
          return {
            from: d(y, qStart, 1),
            to: d(y, qStart + 2, lastDay(y, qStart + 2)),
            label: `T${q} ${y} · ${MABBR[qStart]}–${MABBR[qStart + 2]}`
          };
        }
      case 'semestre':
        {
          const sStart = m < 6 ? 0 : 6,
            s = sStart === 0 ? 1 : 2;
          return {
            from: d(y, sStart, 1),
            to: d(y, sStart + 5, lastDay(y, sStart + 5)),
            label: `S${s} ${y} · ${MABBR[sStart]}–${MABBR[sStart + 5]}`
          };
        }
      case 'anio':
        {
          return {
            from: d(y, 0, 1),
            to: d(y, 11, 31),
            label: `${y}`
          };
        }
      case 'todo':
        {
          return {
            from: null,
            to: null,
            label: 'Todo el histórico',
            noStep: true
          };
        }
      case 'custom':
        {
          const from = mondayOf(TODAY),
            to = clone(TODAY);
          return {
            from,
            to,
            label: `${from.getDate()} ${MABBR[from.getMonth()]} – ${to.getDate()} ${MABBR[to.getMonth()]}`,
            noStep: true
          };
        }
    }
  }

  // short example label for menus/ref grid (uses TODAY)
  function example(grain) {
    return resolve(grain, TODAY).label;
  }

  /* ── Stepping ── */
  function step(grain, anchor, dir) {
    switch (grain) {
      case 'dia':
        return addDays(anchor, dir);
      case 'semana':
        return addDays(anchor, dir * 7);
      case 'quincena':
        {
          const first = anchor.getDate() <= 15;
          if (dir > 0) return first ? d(anchor.getFullYear(), anchor.getMonth(), 16) : addMonths(anchor, 1);
          return first ? (() => {
            const p = addMonths(anchor, -1);
            return d(p.getFullYear(), p.getMonth(), 16);
          })() : d(anchor.getFullYear(), anchor.getMonth(), 1);
        }
      case 'mes':
        return addMonths(anchor, dir);
      case 'bimestre':
        return addMonths(anchor, dir * 2);
      case 'trimestre':
        return addMonths(anchor, dir * 3);
      case 'semestre':
        return addMonths(anchor, dir * 6);
      case 'anio':
        return addMonths(anchor, dir * 12);
      default:
        return anchor;
    }
  }
  const fmtFull = dt => dt ? `${DOW_SH[dt.getDay()]} ${dt.getDate()} ${MABBR[dt.getMonth()]} ${dt.getFullYear()}` : '—';
  function spanLabel(from, to) {
    if (!from || !to) return 'Sin límite';
    const days = Math.round((to - from) / 86400000) + 1;
    if (days === 1) return '1 día';
    if (days < 14) return `${days} días`;
    if (days < 70) return `${days} días · ${Math.round(days / 7)} sem`;
    return `${days} días · ${(days / 30.44).toFixed(1)} meses`;
  }

  /* ── Shared state ── */
  const state = {
    grain: 'mes',
    anchor: clone(TODAY)
  };
  const listeners = [];
  const onChange = fn => listeners.push(fn);
  function setGrain(g) {
    state.grain = g;
    if (g === 'custom' || g === 'todo') {/* keep anchor */}
    emit();
  }
  function setAnchor(dt) {
    state.anchor = clone(dt);
    emit();
  }
  function doStep(dir) {
    const r = resolve(state.grain, state.anchor);
    if (r.noStep) return;
    state.anchor = step(state.grain, state.anchor, dir);
    emit();
  }
  function goToday() {
    state.anchor = clone(TODAY);
    emit();
  }
  function emit() {
    const r = resolve(state.grain, state.anchor);
    listeners.forEach(fn => fn(state, r));
  }

  /* ── DOM wiring ─────────────────────────────────────────── */
  function buildMenu(menuEl, onPick) {
    let html = '';
    let lastGroup = null;
    Object.keys(GRAINS).forEach(id => {
      const g = GRAINS[id];
      if (g.group !== lastGroup) {
        html += `<div class="grain-group">${g.group}</div>`;
        lastGroup = g.group;
      }
      html += `<button class="grain-item" data-grain="${id}">
        <span class="gi-ic"><span class="material-icons">${g.icon}</span></span>
        <span class="gi-tx"><span class="gi-nm">${g.name}</span><span class="gi-ex">${id === 'todo' || id === 'custom' ? g.unit.replace(/^—\s*/, '') : example(id)}</span></span>
        <span class="material-icons gi-chk">check</span>
      </button>`;
    });
    menuEl.innerHTML = html;
    menuEl.querySelectorAll('.grain-item').forEach(b => {
      b.addEventListener('click', e => {
        e.stopPropagation();
        onPick(b.dataset.grain);
      });
    });
  }
  function syncMenu(menuEl) {
    menuEl.querySelectorAll('.grain-item').forEach(b => b.classList.toggle('on', b.dataset.grain === state.grain));
  }

  /* ── Mini picker ── */
  function buildPicker(pickerEl) {
    const grain = state.grain;
    const a = clone(state.anchor);
    let html = '';
    if (grain === 'dia' || grain === 'semana' || grain === 'quincena') {
      // month calendar
      const y = a.getFullYear(),
        m = a.getMonth();
      const first = mondayOf(d(y, m, 1));
      const sel = resolve(grain, a);
      html += `<div class="pk-head"><span class="pk-title">${cap(MONTHS[m])} ${y}</span>
        <span class="pk-nav"><button data-mv="-1"><span class="material-icons" style="font-size:18px">chevron_left</span></button>
        <button data-mv="1"><span class="material-icons" style="font-size:18px">chevron_right</span></button></span></div>`;
      html += `<div class="pk-grid cols-7">`;
      DOW_MN.forEach(w => html += `<div class="pk-cell dow">${w}</div>`);
      for (let i = 0; i < 42; i++) {
        const cur = addDays(first, i);
        const inMonth = cur.getMonth() === m;
        const inSel = sel.from && sel.to && cur >= sel.from && cur <= sel.to;
        html += `<button class="pk-cell ${inMonth ? '' : 'muted'} ${inSel ? 'on' : ''}" data-day="${cur.getFullYear()}-${cur.getMonth()}-${cur.getDate()}">${cur.getDate()}</button>`;
      }
      html += `</div>`;
    } else if (grain === 'mes' || grain === 'bimestre') {
      const y = a.getFullYear();
      html += `<div class="pk-head"><span class="pk-title">${y}</span>
        <span class="pk-nav"><button data-mv="-12"><span class="material-icons" style="font-size:18px">chevron_left</span></button>
        <button data-mv="12"><span class="material-icons" style="font-size:18px">chevron_right</span></button></span></div>`;
      html += `<div class="pk-grid cols-3">`;
      const sel = resolve(grain, a);
      for (let mo = 0; mo < 12; mo++) {
        const cur = d(y, mo, 1);
        const inSel = cur >= sel.from && cur <= sel.to;
        html += `<button class="pk-cell ${inSel ? 'on' : ''}" data-mo="${mo}">${cap(MABBR[mo])}</button>`;
      }
      html += `</div>`;
    } else if (grain === 'trimestre' || grain === 'semestre') {
      const y = a.getFullYear();
      const n = grain === 'trimestre' ? 4 : 2;
      const sel = resolve(grain, a);
      html += `<div class="pk-head"><span class="pk-title">${y}</span>
        <span class="pk-nav"><button data-mv="-12"><span class="material-icons" style="font-size:18px">chevron_left</span></button>
        <button data-mv="12"><span class="material-icons" style="font-size:18px">chevron_right</span></button></span></div>`;
      html += `<div class="pk-grid cols-${n === 4 ? 2 : 2}">`;
      for (let i = 0; i < n; i++) {
        const mo = grain === 'trimestre' ? i * 3 : i * 6;
        const cur = d(y, mo, 1);
        const inSel = cur >= sel.from && cur <= sel.to;
        const tag = grain === 'trimestre' ? `T${i + 1}` : `S${i + 1}`;
        const sub = grain === 'trimestre' ? `${MABBR[mo]}–${MABBR[mo + 2]}` : `${MABBR[mo]}–${MABBR[mo + 5]}`;
        html += `<button class="pk-cell ${inSel ? 'on' : ''}" data-mo="${mo}" style="padding:14px 4px;line-height:1.5">${tag}<br><span style="font-size:10.5px;font-weight:600;opacity:.7">${sub}</span></button>`;
      }
      html += `</div>`;
    } else if (grain === 'anio') {
      const y = a.getFullYear(),
        base = y - 4;
      html += `<div class="pk-head"><span class="pk-title">${base}–${base + 8}</span>
        <span class="pk-nav"><button data-mv="-108"><span class="material-icons" style="font-size:18px">chevron_left</span></button>
        <button data-mv="108"><span class="material-icons" style="font-size:18px">chevron_right</span></button></span></div>`;
      html += `<div class="pk-grid cols-3">`;
      for (let i = 0; i < 9; i++) {
        const yr = base + i;
        html += `<button class="pk-cell ${yr === y ? 'on' : ''}" data-yr="${yr}">${yr}</button>`;
      }
      html += `</div>`;
    } else {
      html += `<div class="pk-head"><span class="pk-title">${grain === 'todo' ? 'Todo el histórico' : 'Rango personalizado'}</span></div>
        <div style="font-size:12.5px;color:var(--fg-2);line-height:1.6;padding:4px 2px">${grain === 'todo' ? 'Sin límite de fechas — incluye cada movimiento registrado.' : 'En producción aquí va un selector de fecha inicio → fecha fin. La maqueta usa la semana en curso.'}</div>`;
    }
    pickerEl.innerHTML = html;
    pickerEl.querySelectorAll('[data-mv]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      // mv is a month delta: ±12 paginates a year, ±108 paginates the 9-year year-grid
      state.anchor = addMonths(clone(a), parseInt(b.dataset.mv, 10));
      buildPicker(pickerEl);
    }));
    pickerEl.querySelectorAll('[data-day]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      const [yy, mm, dd] = b.dataset.day.split('-').map(Number);
      setAnchor(d(yy, mm, dd));
      closeAll();
    }));
    pickerEl.querySelectorAll('[data-mo]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      setAnchor(d(a.getFullYear(), parseInt(b.dataset.mo, 10), 1));
      closeAll();
    }));
    pickerEl.querySelectorAll('[data-yr]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      setAnchor(d(parseInt(b.dataset.yr, 10), a.getMonth(), 1));
      closeAll();
    }));
  }
  let openEls = [];
  function closeAll() {
    openEls.forEach(el => el.classList.remove('open'));
    openEls = [];
  }
  function openOnly(el) {
    closeAll();
    el.classList.add('open');
    openEls = [el];
  }

  /* ── Boot ── */
  document.addEventListener('DOMContentLoaded', () => {
    // theme toggle
    const tbtn = document.getElementById('theme-btn');
    tbtn.addEventListener('click', () => {
      const html = document.documentElement;
      const dark = html.getAttribute('data-theme') === 'dark';
      html.setAttribute('data-theme', dark ? 'light' : 'dark');
      tbtn.querySelector('.material-icons').textContent = dark ? 'dark_mode' : 'light_mode';
    });

    // Main pill
    const grainPill = document.getElementById('grainPill');
    const grainMenu = document.getElementById('grainMenu');
    const grainBtn = document.getElementById('grainBtn');
    buildMenu(grainMenu, g => {
      setGrain(g);
      closeAll();
    });
    grainBtn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = grainMenu.classList.contains('open');
      if (isOpen) closeAll();else {
        syncMenu(grainMenu);
        grainPill.classList.add('open');
        openOnly(grainMenu);
      }
    });
    grainMenu.addEventListener('transitionend', () => {});

    // Stepper + picker
    document.getElementById('prevBtn').addEventListener('click', () => doStep(-1));
    document.getElementById('nextBtn').addEventListener('click', () => doStep(1));
    document.getElementById('todayBtn').addEventListener('click', goToday);
    const picker = document.getElementById('picker');
    const periodBtn = document.getElementById('periodBtn');
    periodBtn.addEventListener('click', e => {
      e.stopPropagation();
      const r = resolve(state.grain, state.anchor);
      if (r.noStep && state.grain === 'todo') return;
      if (picker.classList.contains('open')) closeAll();else {
        buildPicker(picker);
        openOnly(picker);
      }
    });

    // Pro pill
    const proPill = document.getElementById('proGrainPill');
    const proMenu = document.getElementById('proGrainMenu');
    buildMenu(proMenu, g => {
      setGrain(g);
      closeAll();
    });
    document.getElementById('proGrainBtn').addEventListener('click', e => {
      e.stopPropagation();
      if (proMenu.classList.contains('open')) closeAll();else {
        syncMenu(proMenu);
        openOnly(proMenu);
      }
    });
    document.getElementById('proPrev').addEventListener('click', () => doStep(-1));
    document.getElementById('proNext').addEventListener('click', () => doStep(1));

    // Lite quick segment
    const liteMore = document.getElementById('liteMore');
    const liteQuick = document.getElementById('liteQuick');
    liteQuick.querySelectorAll('button[data-grain]').forEach(b => {
      b.addEventListener('click', () => setGrain(b.dataset.grain));
    });
    // reuse main menu for "Más"
    liteMore.addEventListener('click', e => {
      e.stopPropagation();
      if (grainMenu.classList.contains('open')) {
        closeAll();
        return;
      }
      syncMenu(grainMenu);
      // anchor the menu near liteMore
      grainPill.classList.add('open');
      openOnly(grainMenu);
      grainBtn.scrollIntoView ? null : null;
    });
    document.getElementById('litePrev').addEventListener('click', () => doStep(-1));
    document.getElementById('liteNext').addEventListener('click', () => doStep(1));

    // Grain reference grid
    const ref = document.getElementById('grainRef');
    ref.innerHTML = Object.keys(GRAINS).map(id => {
      const g = GRAINS[id];
      const ex = id === 'todo' || id === 'custom' ? g.unit.replace(/^—\s*/, '') : example(id);
      return `<button class="gref" data-grain="${id}">
        <span class="gr-ic"><span class="material-icons">${g.icon}</span></span>
        <span><span class="gr-nm">${g.name}</span><span class="gr-ex" style="display:block">${ex}</span><span class="gr-unit">Paso: ${g.unit}</span></span>
      </button>`;
    }).join('');
    ref.querySelectorAll('.gref').forEach(b => b.addEventListener('click', () => {
      setGrain(b.dataset.grain);
      document.getElementById('app').scrollIntoView ? null : null;
    }));

    // global close
    document.addEventListener('click', closeAll);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAll();
      if (e.key === 'ArrowLeft') doStep(-1);
      if (e.key === 'ArrowRight') doStep(1);
    });

    /* ── render loop ── */
    onChange((st, r) => {
      const g = GRAINS[st.grain];
      // main
      document.getElementById('grainBtnIc').textContent = g.icon;
      document.getElementById('grainBtnLabel').textContent = g.name;
      document.getElementById('periodMain').textContent = r.label;
      document.getElementById('roFrom').textContent = fmtFull(r.from);
      document.getElementById('roTo').textContent = fmtFull(r.to);
      document.getElementById('roSpan').textContent = spanLabel(r.from, r.to);
      const noStep = !!r.noStep;
      document.getElementById('prevBtn').disabled = noStep;
      document.getElementById('nextBtn').disabled = noStep;
      grainPill.classList.remove('open');
      syncMenu(grainMenu);
      syncMenu(proMenu);

      // pro
      document.getElementById('proGrainIc').textContent = g.icon;
      document.getElementById('proGrainLabel').textContent = g.name;
      document.getElementById('proLabel').textContent = r.label;

      // lite
      document.getElementById('liteLabel').textContent = r.label;
      const inQuick = QUICK.includes(st.grain);
      liteQuick.querySelectorAll('button[data-grain]').forEach(b => b.classList.toggle('on', b.dataset.grain === st.grain));
      // if advanced grain, show it as active chip in place of the "more" label
      liteMore.innerHTML = inQuick ? `Más<span class="material-icons">expand_more</span>` : `${g.name}<span class="material-icons">expand_more</span>`;
      liteMore.classList.toggle('on', !inQuick);
      if (!inQuick) {
        liteMore.style.background = 'var(--accent)';
        liteMore.style.color = '#fff';
      } else {
        liteMore.style.background = '';
        liteMore.style.color = '';
      }
      // disable lite stepper on no-step grains
      document.getElementById('litePrev').disabled = noStep;
      document.getElementById('liteNext').disabled = noStep;
    });
    emit();
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "period-selector.js", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/atoms/Buttons.jsx
try { (() => {
/* global React */
const {
  useState,
  useEffect,
  useRef
} = React;

/* ---------- PillButton ---------- */
function PillButton({
  children,
  icon,
  variant = 'primary',
  size = 'md',
  onClick,
  ariaLabel,
  type = 'button'
}) {
  const pad = size === 'sm' ? '8px 14px' : '12px 22px';
  const fontSize = size === 'sm' ? 13 : 14;
  const palette = {
    primary: {
      bg: 'var(--brand-primary)',
      color: 'var(--fg-on-brand)',
      hover: 'var(--brand-primary-hover)',
      shadow: 'none'
    },
    secondary: {
      bg: 'var(--surface-1)',
      color: 'var(--fg-1)',
      hover: 'var(--surface-2)',
      shadow: 'var(--shadow-card)'
    },
    ghost: {
      bg: 'transparent',
      color: 'var(--fg-1)',
      hover: 'var(--surface-2)',
      shadow: 'none'
    },
    danger: {
      bg: 'var(--expense-soft)',
      color: 'var(--expense-fg)',
      hover: 'var(--expense-soft)',
      shadow: 'none'
    }
  }[variant];
  const [h, setH] = useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    onClick: onClick,
    "aria-label": ariaLabel,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize,
      border: 0,
      borderRadius: 'var(--radius-pill)',
      cursor: 'pointer',
      padding: pad,
      background: h ? palette.hover : palette.bg,
      color: palette.color,
      boxShadow: palette.shadow,
      transition: 'background var(--dur-base) var(--ease-out)'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18
    }
  }, icon), children);
}

/* ---------- IconButton ---------- */
function IconButton({
  icon,
  onClick,
  ariaLabel,
  active = false,
  size = 40
}) {
  const [h, setH] = useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    "aria-label": ariaLabel,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      width: size,
      height: size,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 0,
      cursor: 'pointer',
      borderRadius: 'var(--radius-pill)',
      background: active ? 'var(--brand-primary-soft)' : h ? 'var(--surface-2)' : 'var(--surface-1)',
      color: active ? 'var(--brand-primary-fg-soft)' : 'var(--fg-1)',
      boxShadow: active ? 'none' : 'var(--shadow-card)',
      transition: 'background var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 20
    }
  }, icon));
}
Object.assign(window, {
  PillButton,
  IconButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/atoms/Buttons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/atoms/Chips.jsx
try { (() => {
/* global React */
const {
  useState: useChipState
} = React;
function Chip({
  children,
  variant = 'default',
  icon
}) {
  const palette = {
    default: {
      bg: 'var(--surface-2)',
      color: 'var(--fg-1)'
    },
    currency: {
      bg: 'var(--surface-1)',
      color: 'var(--fg-1)',
      shadow: 'var(--shadow-card)',
      weight: 600,
      letter: '0.06em'
    },
    brand: {
      bg: 'var(--brand-primary-soft)',
      color: 'var(--brand-primary-fg-soft)',
      weight: 600
    },
    income: {
      bg: 'var(--income-soft)',
      color: 'var(--income-fg)'
    },
    expense: {
      bg: 'var(--expense-soft)',
      color: 'var(--expense-fg)'
    },
    warning: {
      bg: 'var(--warning-soft)',
      color: 'var(--warning-fg)'
    },
    info: {
      bg: 'var(--info-soft)',
      color: 'var(--info-fg)'
    }
  }[variant];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-body)',
      fontWeight: palette.weight || 500,
      fontSize: 12,
      letterSpacing: palette.letter || 'normal',
      padding: '6px 12px',
      borderRadius: 'var(--radius-pill)',
      background: palette.bg,
      color: palette.color,
      boxShadow: palette.shadow || 'none'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 14
    }
  }, icon), children);
}
function CurrencyChip({
  code = 'USD',
  active = true
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 12,
      letterSpacing: '0.06em',
      padding: '8px 14px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-1)',
      color: 'var(--fg-1)',
      boxShadow: 'var(--shadow-card)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: active ? 'var(--income)' : 'var(--fg-3)'
    }
  }), code);
}
Object.assign(window, {
  Chip,
  CurrencyChip
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/atoms/Chips.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/atoms/Primitives.jsx
try { (() => {
/* ─── Atoms · Primitives ────────────────────────────────────────────────
 * Pure visual primitives — no domain knowledge.
 *   Money · Eyebrow · Card · Avatar
 * (SectionHeader lives in molecules/ since it composes a heading + action.)
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

/* ---------- useViewportMobile — true when the demo frame is in mobile mode ----------
 * The toolbar toggles `body.viewport-mobile`. Components observe that class so
 * they can render a genuinely different layout on phones (not just CSS reflow). */
function useViewportMobile() {
  const [mobile, setMobile] = React.useState(typeof document !== 'undefined' && document.body.classList.contains('viewport-mobile'));
  React.useEffect(() => {
    const read = () => setMobile(document.body.classList.contains('viewport-mobile'));
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => obs.disconnect();
  }, []);
  return mobile;
}

/* ---------- useAppTheme — current theme ('light'|'dark'), reactive ---------- */
function useAppTheme() {
  const read = () => typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') || 'light' : 'light';
  const [theme, setTheme] = React.useState(read);
  React.useEffect(() => {
    const obs = new MutationObserver(() => setTheme(read()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    setTheme(read());
    return () => obs.disconnect();
  }, []);
  return theme;
}

/* ---------- Money — masks digits when visibility is off ---------- */
function Money({
  value,
  currency = '$',
  className = 't-amount-md',
  sign = false,
  hidden = false,
  color
}) {
  const isNeg = value < 0;
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const display = hidden ? '••••••' : formatted;
  const prefix = sign ? isNeg ? '− ' : '+ ' : isNeg ? '− ' : '';
  return /*#__PURE__*/React.createElement("span", {
    className: className,
    style: {
      color: color || 'inherit'
    }
  }, prefix, currency, " ", display);
}

/* ---------- Eyebrow ---------- */
function Eyebrow({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "t-eyebrow"
  }, children);
}

/* ---------- Card ---------- */
function Card({
  children,
  hero = false,
  padding = 24,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-1)',
      borderRadius: hero ? 'var(--radius-xl)' : 'var(--radius-lg)',
      padding: hero ? 32 : padding,
      boxShadow: hero ? 'var(--shadow-float)' : 'var(--shadow-card)',
      ...style
    }
  }, children);
}

/* ---------- Avatar (initial) ---------- */
function Avatar({
  initial,
  size = 40
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--brand-primary)',
      color: 'var(--fg-on-brand)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: size * 0.42
    }
  }, initial);
}
Object.assign(window, {
  Money,
  Eyebrow,
  Card,
  Avatar,
  useViewportMobile,
  useAppTheme
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/atoms/Primitives.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/data/analisis-data.jsx
try { (() => {
/* global React */
/* ─── Análisis data — June 2026, mirrors the live expense screen ──────────
 * Spend & budget per cántaro, KPIs, drill-down groups and insights for the
 * "Navegador financiero" route (Lite + Pro). Chart colors are explicit hues
 * (not theme tokens) so the donut keeps its hierarchy in light & dark. */

const AN_JARS = [{
  id: 'needs',
  name: 'Necesidades básicas',
  spent: 45.40,
  budget: 89.00,
  color: '#1E3A8A'
}, {
  id: 'fun',
  name: 'Ocio / Diversión',
  spent: 37.48,
  budget: 45.00,
  color: '#F59E0B'
}, {
  id: 'give',
  name: 'Donaciones',
  spent: 26.17,
  budget: 20.00,
  color: '#8B5CF6'
}, {
  id: 'home',
  name: 'Hogar cómodo',
  spent: 24.26,
  budget: 40.00,
  color: '#10B981'
}, {
  id: 'social',
  name: 'Sociales',
  spent: 11.32,
  budget: 18.00,
  color: '#0EA5E9'
}, {
  id: 'health',
  name: 'Salud',
  spent: 9.92,
  budget: 30.00,
  color: '#EF4444'
}, {
  id: 'car',
  name: 'Coche / Auto y transporte',
  spent: 7.71,
  budget: 25.00,
  color: '#64748B'
}];
const AN_TOTAL = AN_JARS.reduce((s, j) => s + j.spent, 0);
const AN_BUDGET = AN_JARS.reduce((s, j) => s + j.budget, 0);
const AN_KPIS = [{
  label: 'Transacciones visibles',
  val: '29',
  meta: 'Periodo: Junio 2026',
  color: 'var(--fg-1)'
}, {
  label: 'Gastos',
  val: '$162.26',
  meta: 'Convertido a USD',
  color: 'var(--expense-fg)'
}, {
  label: 'Ingresos',
  val: '$17.79M',
  meta: 'Incl. 1 movimiento atípico',
  color: 'var(--income-fg)',
  flag: true
}, {
  label: 'Balance',
  val: '$17.79M',
  meta: 'Resultado neto filtrado',
  color: 'var(--income-fg)'
}];
const AN_RANGES = ['Todo', 'Anual', 'Semestral', 'Trimestral', 'Mensual', 'Quincenal', 'Semanal', 'Diario', 'Personalizado'];
const AN_DETALLE = [{
  jar: 'needs',
  name: 'Necesidades básicas',
  count: 6,
  total: 45.40,
  subs: [{
    name: 'Supermercado',
    count: 3,
    total: 13.81,
    tx: [{
      nm: '1167,75 carbo saludable vbrocoli',
      date: '06/04/2026, 10:09 PM',
      acct: 'Banca amiga',
      cat: 'Supermercado',
      amt: 1.56,
      rate: 'tasa 746.84',
      src: 'Banca amiga: -1167.57'
    }, {
      nm: '1506,50 avena',
      date: '06/02/2026, 11:47 PM',
      acct: 'JL Banesco',
      cat: 'Supermercado',
      amt: 2.07,
      rate: 'tasa 728.22',
      src: 'JL Banesco: -1510.48'
    }, {
      nm: '7.373,86 redvital mercado pago cashea',
      date: '06/01/2026, 07:25 PM',
      acct: 'JL Banesco',
      cat: 'Supermercado',
      amt: 10.18,
      rate: 'tasa 724.32',
      src: 'JL Banesco: -7373.86'
    }]
  }, {
    name: 'Proteína',
    count: 3,
    total: 31.59,
    tx: [{
      nm: 'Proteina huevos carton',
      date: '06/02/2026, 11:49 PM',
      acct: 'JL Banesco',
      cat: 'Proteína',
      amt: 2.75,
      rate: 'tasa 728.22',
      src: 'JL Banesco: -2006.00'
    }, {
      nm: 'Cashea Forum',
      date: '06/02/2026, 02:35 PM',
      acct: 'JL Banesco',
      cat: 'Proteína',
      amt: 10.05,
      rate: 'tasa 728.22',
      src: 'JL Banesco: -7315.04'
    }, {
      nm: 'pollo milanesa 13,682.02',
      date: '06/01/2026, 07:31 PM',
      acct: 'JL Banesco',
      cat: 'Proteína',
      amt: 18.79,
      rate: 'tasa 728.22',
      src: 'JL Banesco: -13682.02'
    }]
  }]
}, {
  jar: 'fun',
  name: 'Ocio / Diversión',
  count: 5,
  total: 37.48,
  subs: [{
    name: 'Restaurantes',
    count: 3,
    total: 24.10,
    tx: [{
      nm: 'Cena aniversario',
      date: '06/03/2026, 09:12 PM',
      acct: 'BBVA',
      cat: 'Restaurantes',
      amt: 16.40,
      rate: 'tasa 728.22',
      src: 'BBVA: -11942.81'
    }, {
      nm: 'Café con equipo',
      date: '06/02/2026, 04:20 PM',
      acct: 'Efectivo',
      cat: 'Restaurantes',
      amt: 4.20,
      rate: 'tasa 728.22',
      src: 'Efectivo: -3058.52'
    }, {
      nm: 'Heladería',
      date: '06/01/2026, 06:00 PM',
      acct: 'BBVA',
      cat: 'Restaurantes',
      amt: 3.50,
      rate: 'tasa 724.32',
      src: 'BBVA: -2535.12'
    }]
  }, {
    name: 'Streaming',
    count: 2,
    total: 13.38,
    tx: [{
      nm: 'Netflix',
      date: '06/02/2026, 12:00 AM',
      acct: 'Visa USD',
      cat: 'Streaming',
      amt: 8.99,
      rate: 'USD desde USD',
      src: 'Visa USD: -8.99'
    }, {
      nm: 'Spotify',
      date: '06/01/2026, 12:00 AM',
      acct: 'Visa USD',
      cat: 'Streaming',
      amt: 4.39,
      rate: 'USD desde USD',
      src: 'Visa USD: -4.39'
    }]
  }]
}, {
  jar: 'give',
  name: 'Donaciones',
  count: 2,
  total: 26.17,
  subs: [{
    name: 'Iglesia',
    count: 1,
    total: 20.00,
    tx: [{
      nm: 'Diezmo mensual',
      date: '06/01/2026, 08:00 AM',
      acct: 'JL Banesco',
      cat: 'Iglesia',
      amt: 20.00,
      rate: 'tasa 724.32',
      src: 'JL Banesco: -14486.40'
    }]
  }, {
    name: 'Causas',
    count: 1,
    total: 6.17,
    tx: [{
      nm: 'Colecta vecinal',
      date: '06/03/2026, 05:00 PM',
      acct: 'Efectivo',
      cat: 'Causas',
      amt: 6.17,
      rate: 'tasa 728.22',
      src: 'Efectivo: -4493.10'
    }]
  }]
}];
const AN_FMT = n => '$' + n.toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
function AN_CONIC(jars, total) {
  let acc = 0;
  const stops = [];
  jars.forEach(j => {
    const a = acc / total * 360;
    acc += j.spent;
    const b = acc / total * 360;
    stops.push(`${j.color} ${a}deg ${b}deg`);
  });
  return `conic-gradient(${stops.join(',')})`;
}
Object.assign(window, {
  AN_JARS,
  AN_TOTAL,
  AN_BUDGET,
  AN_KPIS,
  AN_RANGES,
  AN_DETALLE,
  AN_FMT,
  AN_CONIC
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/data/analisis-data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/data/finance-data.jsx
try { (() => {
/* ─── Finance domain data — modeled on OWFINANCE 2026 backend ────────────
 * Mirrors the real model: accounts (multi-currency), categories,
 * transaction types, taxes (IGTF / Pago Móvil / IVA), providers, and
 * user exchange rates (current/official).
 * Source of truth: docs/02-backend/endpoints/transaction-payloads.md,
 *                  docs/producto/CUENTAS_Y_TRANSACCIONES.md
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

/* Transaction types (transaction_types) */
const TX_TYPES = [{
  slug: 'income',
  id: 1,
  label: 'Ingreso',
  icon: 'arrow_downward',
  color: 'var(--income)',
  sign: +1
}, {
  slug: 'expense',
  id: 2,
  label: 'Gasto',
  icon: 'arrow_outward',
  color: 'var(--expense)',
  sign: -1
}, {
  slug: 'transfer',
  id: 3,
  label: 'Transferencia',
  icon: 'swap_horiz',
  color: '#8B5CF6',
  sign: 0
}, {
  slug: 'ajuste',
  id: 5,
  label: 'Ajuste',
  icon: 'tune',
  color: 'var(--warning)',
  sign: 0
}];

/* Account types (account_types) */
const ACCOUNT_TYPES = {
  bank: {
    label: 'Banco',
    icon: 'account_balance'
  },
  card: {
    label: 'Tarjeta',
    icon: 'credit_card'
  },
  cash: {
    label: 'Efectivo',
    icon: 'payments'
  },
  cashea: {
    label: 'Cashea',
    icon: 'shopping_bag'
  }
};

/* Currencies */
const CURRENCIES = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dólar',
    flag: '🇺🇸'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺'
  },
  VES: {
    code: 'VES',
    symbol: 'Bs.',
    name: 'Bolívar',
    flag: '🇻🇪'
  }
};

/* User exchange rates — USD is the user's base currency.
 * current = la tasa "actual" del usuario; official = tasa oficial (BCV). */
const DEFAULT_RATES = {
  USD: {
    current: 1,
    official: 1
  },
  EUR: {
    current: 0.92,
    official: 0.93
  },
  VES: {
    current: 40.50,
    official: 36.80
  }
};

/* Accounts (accounts) — PRO only. LITE uses an implicit single wallet. */
const SAMPLE_ACCOUNTS = [{
  id: 1,
  name: 'BofA · Corriente',
  type: 'bank',
  currency: 'USD',
  balance: 3420.50,
  last4: '4521',
  color: '#1E3A8A'
}, {
  id: 2,
  name: 'BofA · Ahorros',
  type: 'bank',
  currency: 'USD',
  balance: 12480.00,
  last4: '8830',
  color: '#2D4DA6'
}, {
  id: 3,
  name: 'Efectivo USD',
  type: 'cash',
  currency: 'USD',
  balance: 340.00,
  color: '#10B981'
}, {
  id: 4,
  name: 'Mercantil',
  type: 'bank',
  currency: 'VES',
  balance: 48500.00,
  last4: '1290',
  color: '#F59E0B'
}, {
  id: 5,
  name: 'Visa · Crédito',
  type: 'card',
  currency: 'USD',
  balance: -1240.20,
  last4: '0072',
  color: '#EF4444'
}, {
  id: 6,
  name: 'Cashea',
  type: 'cashea',
  currency: 'VES',
  balance: -626.00,
  color: '#8B5CF6'
}];

/* LITE implicit wallet (hidden in UI; the only account in LITE) */
const LITE_WALLET = {
  id: 0,
  name: 'Billetera',
  type: 'cash',
  currency: 'USD',
  balance: 4280.50
};

/* Categories (categories) — operational classification for jars/budget */
const SAMPLE_CATEGORIES = [{
  id: 1,
  name: 'Vivienda',
  icon: 'home',
  jarId: 'j1'
}, {
  id: 2,
  name: 'Supermercado',
  icon: 'shopping_cart',
  jarId: 'j1'
}, {
  id: 3,
  name: 'Servicios',
  icon: 'bolt',
  jarId: 'j1'
}, {
  id: 4,
  name: 'Transporte',
  icon: 'directions_car',
  jarId: 'j1'
}, {
  id: 5,
  name: 'Salud',
  icon: 'favorite',
  jarId: 'j1'
}, {
  id: 6,
  name: 'Restaurantes',
  icon: 'restaurant',
  jarId: 'j2'
}, {
  id: 7,
  name: 'Entretenimiento',
  icon: 'sports_esports',
  jarId: 'j2'
}, {
  id: 8,
  name: 'Educación',
  icon: 'school',
  jarId: 'j4'
}, {
  id: 9,
  name: 'Ingresos',
  icon: 'payments',
  jarId: null
}, {
  id: 10,
  name: 'Otros',
  icon: 'category',
  jarId: 'j5'
}];

/* Taxes (taxes) — applies_to: item | payment | both */
const SAMPLE_TAXES = [{
  id: 10,
  name: 'IVA 16%',
  rate: 16,
  applies_to: 'item',
  kind: 'percent'
}, {
  id: 11,
  name: 'IGTF 3%',
  rate: 3,
  applies_to: 'payment',
  kind: 'percent'
}, {
  id: 12,
  name: 'Comisión P. Móvil',
  rate: 0.30,
  applies_to: 'payment',
  kind: 'percent'
}];

/* Providers (providers) */
const SAMPLE_PROVIDERS = [{
  id: 1,
  name: 'Whole Foods Market'
}, {
  id: 2,
  name: 'Uber'
}, {
  id: 3,
  name: 'Netflix'
}, {
  id: 4,
  name: 'Farmatodo'
}, {
  id: 5,
  name: 'Cliente · ACME Corp'
}, {
  id: 6,
  name: 'Apple Store VE'
}, {
  id: 7,
  name: 'Megastore'
}];
Object.assign(window, {
  TX_TYPES,
  ACCOUNT_TYPES,
  CURRENCIES,
  DEFAULT_RATES,
  SAMPLE_ACCOUNTS,
  LITE_WALLET,
  SAMPLE_CATEGORIES,
  SAMPLE_TAXES,
  SAMPLE_PROVIDERS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/data/finance-data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/data/i18n.jsx
try { (() => {
/* ─── i18n — bilingual (ES / EN) ────────────────────────────────────────
 * Spanish is the source language and the KEY. t('Disponible') returns the
 * Spanish string as-is when lang==='es', or its English translation.
 * Missing keys fall back to the key itself (so untranslated = Spanish).
 *
 * window.I18N.lang   — current language ('es' | 'en')
 * window.t(key)      — translate
 * window.setLang(l)  — set language + re-render the app
 * ──────────────────────────────────────────────────────────────────────── */
/* global window */

const I18N_EN = {
  /* ── Toolbar ── */
  'Modo': 'Mode',
  'Tema': 'Theme',
  'Vista': 'View',
  'Idioma': 'Language',
  'Light': 'Light',
  'Dark': 'Dark',
  'Desktop': 'Desktop',
  'Móvil': 'Mobile',
  /* ── Header / greeting ── */
  'Buenas tardes': 'Good afternoon',
  'Buenas tardes,': 'Good afternoon,',
  'Buenos días': 'Good morning',
  'Buenas noches': 'Good evening',
  /* ── Hero ── */
  'Disponible': 'Available',
  'Agregar': 'Add',
  'Ingresos · este mes': 'Income · this month',
  'Gastos · este mes': 'Spent · this month',
  'Neto · este mes': 'Net · this month',
  'Al': 'As of',
  'hoy, 2:42 PM': 'today, 2:42 PM',
  'vs. mes ant.': 'vs. last mo.',
  /* ── Nav (Lite + Pro) ── */
  'Inicio': 'Home',
  'Movs': 'Activity',
  'Cántaros': 'Jars',
  'Sueños': 'Dreams',
  'Deudas': 'Debts',
  'Ajustes': 'Settings',
  'Transacciones': 'Transactions',
  'Configuración': 'Settings',
  /* ── Section headers / common ── */
  'Ver todos': 'See all',
  'Ver todas': 'See all',
  'Ver análisis': 'View analysis',
  'Movimientos recientes': 'Recent activity',
  'Gastos por categoría': 'Spending by category',
  'Sin transacciones todavía.': 'No transactions yet.',
  'Cuentas': 'Accounts',
  /* ── Jars ── */
  'Necesidades básicas': 'Basic needs',
  'Diversión': 'Fun',
  'Ahorro': 'Savings',
  'Educación': 'Education',
  'Reservas': 'Reserves',
  '55% del ingreso': '55% of income',
  '10% del ingreso': '10% of income',
  'de': 'of',
  'Meta:': 'Goal:',
  'disp.': 'avail.',
  '68% usado': '68% used',
  '73% usado': '73% used',
  '42% usado': '42% used',
  'Meta 59%': 'Goal 59%',
  'Acumula': 'Accruing',
  'Tu dinero, repartido': 'Your money, allocated',
  'Total en cántaros · USD': 'Total in jars · USD',
  'cántaros activos · 1 requiere atención': 'active jars · 1 needs attention',
  'Nuevo cántaro': 'New jar',
  /* ── Pro KPIs ── */
  'Ingresos · mes': 'Income · mo',
  'Gastos · mes': 'Spent · mo',
  'Tasa de ahorro': 'Savings rate',
  'Meta: 40%': 'Goal: 40%',
  /* ── Spending breakdown ── */
  'Vivienda': 'Housing',
  'Supermercado': 'Groceries',
  'Transporte': 'Transport',
  'Entretenimiento': 'Entertainment',
  'Salud': 'Health',
  'Servicios': 'Utilities',
  'Restaurantes': 'Dining',
  'Ingresos': 'Income',
  'Otros': 'Other',
  /* ── Accounts panel ── */
  'Patrimonio neto · USD': 'Net worth · USD',
  'Total adeudado · USD': 'Total owed · USD',
  'Agregar cuenta': 'Add account',
  'Registrar deuda': 'Add debt',
  'Cuenta corriente': 'Checking',
  'Cuenta ahorros': 'Savings',
  'Caja': 'Cash',
  'Vence:': 'Due:',
  'cuota': 'installment',
  'Próx. pago:': 'Next payment:',
  'Pendiente': 'Pending',
  'Vence pronto': 'Due soon',
  'Vencido': 'Overdue',
  'Activo': 'Active',
  /* ── Debts ── */
  'Deudas y planes de pago': 'Debts & payment plans',
  'Total pendiente': 'Total outstanding',
  'Próximas cuotas · 30d': 'Upcoming · 30d',
  'Estado': 'Status',
  'Todo al día': 'All on track',
  'Pagar cuota': 'Pay installment',
  'Nuevo plan': 'New plan',
  'Al día': 'On track',
  'Próximo': 'Upcoming',
  'Atrasado': 'Late',
  'Pagado': 'Paid',
  'Cuota': 'Installment',
  'Próxima:': 'Next:',
  'Planes Cashea': 'Cashea plans',
  '0% interés': '0% interest',
  'Otras deudas': 'Other debts',
  'Tarjeta': 'Card',
  'Préstamo': 'Loan',
  'Personal': 'Personal',
  /* ── Dreams ── */
  'Total ahorrado en sueños': 'Total saved in dreams',
  'Meta combinada': 'Combined goal',
  'Progreso global': 'Overall progress',
  'Aportar': 'Contribute',
  'Nuevo sueño': 'New dream',
  'Faltan': 'Remaining',
  /* ── Transactions route ── */
  'Mayo': 'May',
  'Todas': 'All',
  'Gastos': 'Expenses',
  'Buscar concepto, monto…': 'Search description, amount…',
  /* ── Config ── */
  'Preferencias': 'Preferences',
  'Cuenta': 'Account',
  'Perfil': 'Profile',
  'Cuentas vinculadas': 'Linked accounts',
  'Exportar datos': 'Export data',
  'Visualización': 'Display',
  'Ocultar saldos por defecto': 'Hide balances by default',
  'Divisa predeterminada': 'Default currency',
  'Pantalla de inicio': 'Home screen',
  'Notificaciones': 'Notifications',
  'Resumen semanal': 'Weekly digest',
  'Alertas de dinero ocioso': 'Idle money alerts',
  'Alerta de sobrepresupuesto': 'Over-budget alert',
  'Cerrar sesión': 'Sign out',
  'Tasas de cambio': 'Exchange rates',
  '· Ingresa manualmente · se aplican en todo Pro': '· Enter manually · applied across Pro',
  '3 tarjetas · 2 bancos': '3 cards · 2 banks',
  'Inicio': 'Home',
  'Tu tasa de ahorro es 42%. Hay $540 inactivos que podrías mover al jar de emergencia.': 'Your savings rate is 42%. There is $540 idle you could move to the emergency jar.',
  /* ── App preferences (Settings) ── */
  'Aplicación': 'Application',
  'Modo de la app': 'App mode',
  'Lite · simple y enfocado': 'Lite · simple and focused',
  'Pro · panel completo multi-cuenta': 'Pro · full multi-account dashboard',
  'Interfaz y formatos': 'Interface and formats',
  'Vista previa': 'Preview',
  'Tamaño de pantalla': 'Screen size',
  'PC': 'PC',
  'Tablet': 'Tablet',
  'Celular': 'Phone',
  /* ── Notifications ── */
  'sin leer': 'unread',
  'Marcar todas': 'Mark all read',
  'Ver todas las notificaciones': 'See all notifications',
  'Cuota Cashea por vencer': 'Cashea installment due soon',
  'iPhone 15 · $148.50 vence en 2 días (28 mar).': 'iPhone 15 · $148.50 due in 2 days (Mar 28).',
  'Dinero ocioso detectado': 'Idle money detected',
  'Tienes $1,240 sin asignar a ningún cántaro hace 9 días.': 'You have $1,240 unassigned to any jar for 9 days.',
  '¡Meta de sueño más cerca!': 'Dream goal getting closer!',
  'Vacaciones Margarita llegó al 72% de tu objetivo.': 'Margarita Vacation reached 72% of your goal.',
  'Cántaro Diversión al 90%': 'Fun jar at 90%',
  'Has usado $270 de $300 este mes. Cuida el límite.': "You've used $270 of $300 this month. Mind the limit.",
  'Pago recibido': 'Payment received',
  'Banesco · +$820.00 acreditado a Cuenta principal.': 'Banesco · +$820.00 credited to Main account.',
  'Tu resumen semanal está listo': 'Your weekly digest is ready',
  'Gastaste 8% menos que la semana pasada. Buen ritmo.': 'You spent 8% less than last week. Good pace.',
  'Hace 2 h': '2 h ago',
  'Hace 5 h': '5 h ago',
  'Ayer': 'Yesterday',
  'Hace 2 d': '2 d ago',
  'Hace 3 d': '3 d ago',
  'Hace 4 d': '4 d ago',
  /* ── Quick modal ── */
  'Acción rápida': 'Quick action',
  '¿Qué quieres registrar?': 'What do you want to record?',
  'Tipo de movimiento': 'Entry type',
  'Paso 1 de 2': 'Step 1 of 2',
  'Paso 2 de 2': 'Step 2 of 2',
  '¿Cómo lo querés ingresar?': 'How do you want to enter it?',
  'O registrá un movimiento especial': 'Or record a special entry',
  'Gasto': 'Expense',
  'Ingreso': 'Income',
  'Transferir': 'Transfer',
  'Pago de deuda': 'Debt payment',
  'Aporte a sueño': 'Dream contribution',
  'Aporte a jar': 'Jar contribution',
  'Cuota Cashea, tarjeta, préstamo o personal.': 'Cashea installment, card, loan or personal.',
  'Sumá al ahorro de una meta de largo plazo.': 'Add to a long-term goal.',
  'Movimiento hacia un jar de corto plazo.': 'Move into a short-term jar.',
  'Escribir': 'Write',
  'Nota de voz': 'Voice note',
  'Foto de factura': 'Invoice photo',
  'Auto IA': 'Auto AI',
  'Completá monto, comercio y categoría paso a paso.': 'Fill amount, merchant and category step by step.',
  'Dictá la transacción — la IA la transcribe y categoriza.': 'Dictate it — AI transcribes and categorizes.',
  'Sacá la foto y se extraen todos los datos del recibo.': 'Snap it and all receipt data is extracted.',
  'Pegá un mensaje o describí en lenguaje natural.': 'Paste a message or describe in natural language.',
  'Transcripción IA': 'AI transcription',
  'Beta': 'Beta',
  '¿Tenés una duda? Hablá con el Asesor IA': 'Got a question? Talk to the AI Advisor',
  /* ── Smart modal ── */
  'Nuevo movimiento': 'New entry',
  'Carga masiva': 'Bulk import',
  '¿Qué pasó con tu dinero?': 'What happened with your money?',
  'Voz': 'Voice',
  'Foto': 'Photo',
  'Pre-rellenado por IA desde': 'Pre-filled by AI from',
  'revisa y confirma': 'review and confirm',
  'Escuchando…': 'Listening…',
  'Toca para dictar': 'Tap to dictate',
  'Di monto, comercio y cuenta. La IA transcribe y arma el movimiento.': 'Say amount, merchant and account. AI transcribes and builds the entry.',
  'Sube o arrastra una factura': 'Upload or drag an invoice',
  'OCR extrae monto, comercio, fecha e ítems': 'OCR extracts amount, merchant, date and items',
  'Monto': 'Amount',
  'Comercio': 'Merchant',
  'Ítems': 'Items',
  'Fecha': 'Date',
  "Pega o describe: 'Pagué $730 en VES a 40.5, mercado del mes con Mercantil, categoría supermercado'": "Paste or describe: 'Paid $730 in VES at 40.5, monthly groceries with Mercantil, category groceries'",
  'No pude interpretar el texto. Sé más específico con monto y concepto.': "Couldn't parse the text. Be more specific with amount and description.",
  'Analizar con IA': 'Analyze with AI',
  'Analizando…': 'Analyzing…',
  'voz': 'voice',
  'foto de factura': 'invoice photo',
  'texto': 'text',
  /* ── Transaction form ── */
  'Ajuste': 'Adjustment',
  '¿De qué cántaro sale?': 'Which jar does it come from?',
  'Elige un cántaro': 'Pick a jar',
  'Se reparte automáticamente': 'Split automatically',
  'Concepto (opcional)': 'Note (optional)',
  'Ej: Mercado del super': 'e.g. Grocery run',
  'Hoy': 'Today',
  'Ayer': 'Yesterday',
  'Otra fecha…': 'Other date…',
  'Categoría (opcional)': 'Category (optional)',
  'Categoría': 'Category',
  'Categoría': 'Category',
  'Registrar ingreso': 'Record income',
  'Registrar gasto': 'Record expense',
  'Cuenta a ajustar': 'Account to adjust',
  'Saldo objetivo': 'Target balance',
  'Saldo actual:': 'Current balance:',
  'Se creará un ajuste de': 'An adjustment of',
  'Motivo': 'Reason',
  'Ej: Sincronización con banco': 'e.g. Bank sync',
  'Desde (origen)': 'From (source)',
  'Hacia (destino)': 'To (destination)',
  'Cruce de moneda ·': 'Currency crossing ·',
  'tasa': 'rate',
  'Envías': 'You send',
  'Llega': 'Arrives',
  'Ej: Traspaso a ahorros': 'e.g. Transfer to savings',
  'Total (suma de ítems)': 'Total (sum of items)',
  'Cuenta de origen': 'Source account',
  'Sin categoría': 'No category',
  'Repartir por %': 'Split by %',
  'Sin cántaro': 'No jar',
  'Cántaro (opcional)': 'Jar (optional)',
  'Cántaro': 'Jar',
  'Proveedor': 'Provider',
  'Sin proveedor': 'No provider',
  'Pago múltiple': 'Multiple payment',
  'Varias cuentas': 'Several accounts',
  'Detalle / factura': 'Detail / invoice',
  'Ítems + impuestos': 'Items + taxes',
  'Afecta el saldo': 'Affects balance',
  'Desactiva para movimientos informativos': 'Turn off for informational entries',
  'Ver': 'Show',
  'Ocultar': 'Hide',
  'Cancelar': 'Cancel',
  'Registrar transferencia': 'Record transfer',
  'Aplicar ajuste': 'Apply adjustment',
  'Pagos': 'Payments',
  'Añadir cuenta': 'Add account',
  'Ítems de la factura': 'Invoice items',
  'Añadir ítem': 'Add item',
  'Sin impuesto': 'No tax',
  /* ── Bulk import ── */
  'Carga masiva (dry-run)': 'Bulk import (dry-run)',
  'Pega filas:': 'Paste rows:',
  '. Verás una vista previa antes de aplicar.': '. You will see a preview before applying.',
  'Procesar (vista previa)': 'Process (preview)',
  'Filas válidas': 'Valid rows',
  'Con error': 'With error',
  'Neto': 'Net',
  'Concepto': 'Description',
  'Cuenta': 'Account',
  'Revisar': 'Review',
  'Error': 'Error',
  '← Editar filas': '← Edit rows',
  'Aplicar': 'Apply',
  'transacciones': 'transactions',
  /* ── Route headers ── */
  'Lo que estás construyendo': "What you're building",
  'Total acumulado · USD': 'Total accumulated · USD',
  'sueños activos · meta combinada': 'active dreams · combined goal',
  'del camino': 'of the way',
  'Mantén el control de lo que debes': 'Stay on top of what you owe',
  'Total pendiente · USD': 'Total outstanding · USD',
  'planes activos ·': 'active plans ·',
  'en Cashea ·': 'on Cashea ·',
  'todo al día': 'all on track',
  'Próximas cuotas (30 días):': 'Upcoming installments (30 days):',
  /* ── Misc data ── */
  'Pendiente': 'Outstanding',
  'pagado': 'paid',
  'atrasada': 'overdue',
  '/mes': '/mo',
  'Cantidad': 'Quantity',
  'Impuesto': 'Tax',
  'Ítem': 'Item',
  'Banco': 'Bank',
  'Efectivo': 'Cash',
  'Cashea': 'Cashea',
  'Asesor Financiero IA': 'AI Financial Advisor',
  'EN LÍNEA': 'ONLINE',
  'Finance': 'Finance',
  'Menú': 'Menu',
  'Asesor IA': 'AI Advisor',
  '. Verás una vista previa antes de aplicar.': '. You will see a preview before applying.',
  'Pega filas:': 'Paste rows:',
  'fecha, concepto, monto, cuenta, categoría': 'date, description, amount, account, category',
  'No pude conectar. Intenta de nuevo.': "Couldn't connect. Try again."
};
window.I18N = window.I18N || {
  lang: 'es'
};
window.I18N_EN = I18N_EN;
window.t = function t(key) {
  if (key == null) return key;
  if (window.I18N.lang === 'es') return key;
  return I18N_EN[key] != null ? I18N_EN[key] : key;
};
window.setLang = function setLang(lang) {
  window.I18N.lang = lang === 'en' ? 'en' : 'es';
  document.documentElement.setAttribute('lang', window.I18N.lang);
  if (typeof window.renderApp === 'function') window.renderApp();
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/data/i18n.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/data/sample-data.jsx
try { (() => {
/* global React */

/* ─── Cántaros (Jars) — plantilla real 55/10/10/10/10 ─────────────────
 * Método Harv Eker. El usuario reparte el 100% del ingreso.
 * type:'percent' → recibe % del ingreso · base all_income.
 * id se usa para imputar gastos/ítems a cántaros en el formulario.
 * ──────────────────────────────────────────────────────────────────── */
const SAMPLE_JARS = [{
  id: 'j1',
  name: 'Necesidades básicas',
  subtitle: '55% del ingreso',
  percent: 55,
  type: 'percent',
  icon: 'home',
  color: '#1E3A8A',
  amount: 1815.00,
  progress: 68,
  goalText: '$ 2,668',
  statusText: '68% usado',
  tone: 'brand'
}, {
  id: 'j2',
  name: 'Diversión',
  subtitle: '10% del ingreso',
  percent: 10,
  type: 'percent',
  icon: 'celebration',
  color: '#F59E0B',
  amount: 132.00,
  progress: 73,
  goalText: '$ 485',
  statusText: '73% usado',
  tone: 'warn'
}, {
  id: 'j3',
  name: 'Ahorro',
  subtitle: '10% del ingreso',
  percent: 10,
  type: 'percent',
  icon: 'savings',
  color: '#10B981',
  amount: 2940.00,
  progress: 100,
  goalText: '$ 5,000',
  statusText: 'Meta 59%',
  tone: 'income'
}, {
  id: 'j4',
  name: 'Educación',
  subtitle: '10% del ingreso',
  percent: 10,
  type: 'percent',
  icon: 'school',
  color: '#0EA5E9',
  amount: 410.00,
  progress: 42,
  goalText: '$ 485',
  statusText: '42% usado',
  tone: 'brand'
}, {
  id: 'j5',
  name: 'Reservas',
  subtitle: '10% del ingreso',
  percent: 10,
  type: 'percent',
  icon: 'shield',
  color: '#8B5CF6',
  amount: 1260.00,
  progress: 31,
  goalText: '$ 485',
  statusText: 'Acumula',
  tone: 'brand'
}];

/* Cada transacción se imputa a un cántaro (jar) además de su categoría.
 * jar:null = sin cántaro (ingresos). jarColor refleja SAMPLE_JARS. */
const SAMPLE_TX = [{
  label: 'Sueldo · ACME Corp',
  meta: 'Hoy · 26 May · 9:02',
  amount: 3200.00,
  day: 'Hoy · lun 26 May',
  category: 'Ingresos',
  jar: null,
  jarColor: null
}, {
  label: 'Whole Foods Market',
  meta: 'Hoy · 26 May · 14:42',
  amount: -84.12,
  day: 'Hoy · lun 26 May',
  category: 'Supermercado',
  jar: 'Necesidades básicas',
  jarColor: '#1E3A8A'
}, {
  label: 'Uber · al aeropuerto',
  meta: 'Hoy · 26 May · 6:18',
  amount: -32.60,
  day: 'Hoy · lun 26 May',
  category: 'Transporte',
  jar: 'Necesidades básicas',
  jarColor: '#1E3A8A'
}, {
  label: 'Netflix',
  meta: 'dom 25 May',
  amount: -16.99,
  day: 'dom 25 May',
  category: 'Entretenimiento',
  jar: 'Diversión',
  jarColor: '#F59E0B'
}, {
  label: 'Cashea · Cuota 3/6 iPhone',
  meta: 'dom 25 May',
  amount: -148.50,
  day: 'dom 25 May',
  category: 'Deuda',
  jar: 'Necesidades básicas',
  jarColor: '#1E3A8A'
}, {
  label: 'Aporte → Sueño Casa propia',
  meta: 'dom 25 May',
  amount: -500.00,
  day: 'dom 25 May',
  category: 'Sueño',
  jar: 'Ahorro',
  jarColor: '#10B981'
}, {
  label: 'Aporte → Cántaro Ahorro',
  meta: 'dom 25 May',
  amount: -200.00,
  day: 'dom 25 May',
  category: 'Cántaro',
  jar: 'Ahorro',
  jarColor: '#10B981'
}, {
  label: 'Freelance · factura 042',
  meta: 'sáb 24 May',
  amount: 720.00,
  day: 'sáb 24 May',
  category: 'Ingresos',
  jar: null,
  jarColor: null
}, {
  label: 'Farmatodo · mensual',
  meta: 'sáb 24 May',
  amount: -116.00,
  day: 'sáb 24 May',
  category: 'Salud',
  jar: 'Necesidades básicas',
  jarColor: '#1E3A8A'
}, {
  label: 'Alquiler · mayo',
  meta: 'vie 23 May',
  amount: -1450.00,
  day: 'vie 23 May',
  category: 'Vivienda',
  jar: 'Necesidades básicas',
  jarColor: '#1E3A8A'
}];

/* ─── Deudas / Planes de pago ─────────────────────────────────────────
 * provider: 'cashea' | 'card' | 'loan' | 'personal'
 * paid / total : cuotas pagadas / totales
 * nextDue : próxima cuota
 * status  : 'on-track' | 'due-soon' | 'late' | 'paid'
 * ──────────────────────────────────────────────────────────────────── */
const SAMPLE_DEBTS = [{
  id: 'd1',
  name: 'iPhone 15 · Cashea',
  provider: 'cashea',
  merchant: 'Apple Store VE',
  balance: 445.50,
  original: 891.00,
  paid: 3,
  total: 6,
  nextDueDate: '28 Mar',
  nextDueAmount: 148.50,
  rate: '0% interés',
  status: 'on-track'
}, {
  id: 'd2',
  name: 'Lavadora LG · Cashea',
  provider: 'cashea',
  merchant: 'Megastore',
  balance: 180.00,
  original: 720.00,
  paid: 4,
  total: 5,
  nextDueDate: '02 Abr',
  nextDueAmount: 180.00,
  rate: '0% interés',
  status: 'due-soon'
}, {
  id: 'd3',
  name: 'Tarjeta Visa BofA',
  provider: 'card',
  merchant: 'Bank of America',
  balance: 2340.20,
  original: 4500.00,
  paid: null,
  total: null,
  nextDueDate: '15 Abr',
  nextDueAmount: 220.00,
  rate: 'TEA 28%',
  status: 'on-track'
}, {
  id: 'd4',
  name: 'Préstamo personal',
  provider: 'loan',
  merchant: 'Banesco',
  balance: 3850.00,
  original: 6000.00,
  paid: 7,
  total: 18,
  nextDueDate: '20 Mar',
  nextDueAmount: 195.00,
  rate: 'TEA 14%',
  status: 'late'
}, {
  id: 'd5',
  name: 'Préstamo · Carlos M.',
  provider: 'personal',
  merchant: 'Familia',
  balance: 200.00,
  original: 500.00,
  paid: 3,
  total: 5,
  nextDueDate: '01 Abr',
  nextDueAmount: 100.00,
  rate: 'Sin interés',
  status: 'on-track'
}];

/* ─── Sueños ──────────────────────────────────────────────────────────
 * Aspirational long-term goals — bigger, more emotional than jars.
 * eta : "Sep 2027"
 * monthly : aporte mensual sugerido
 * ──────────────────────────────────────────────────────────────────── */
const SAMPLE_DREAMS = [{
  id: 's1',
  name: 'Casa propia',
  subtitle: 'Inicial 20% · Caracas',
  icon: 'home',
  amount: 18500.00,
  goal: 45000.00,
  progress: 41,
  eta: 'Dic 2027',
  monthly: 850.00,
  contributors: 2,
  tone: 'dream-primary'
}, {
  id: 's2',
  name: 'Maestría en Europa',
  subtitle: 'IE Business School',
  icon: 'school',
  amount: 7200.00,
  goal: 22000.00,
  progress: 33,
  eta: 'Sep 2026',
  monthly: 1200.00,
  contributors: 1,
  tone: 'dream-secondary'
}, {
  id: 's3',
  name: 'Auto eléctrico',
  subtitle: 'Tesla Model 3',
  icon: 'directions_car',
  amount: 3400.00,
  goal: 12000.00,
  progress: 28,
  eta: 'Mar 2028',
  monthly: 320.00,
  contributors: 1,
  tone: 'dream-primary'
}, {
  id: 's4',
  name: 'Año sabático',
  subtitle: 'Sudeste asiático',
  icon: 'flight_takeoff',
  amount: 1800.00,
  goal: 8000.00,
  progress: 22,
  eta: 'Ene 2027',
  monthly: 240.00,
  contributors: 1,
  tone: 'dream-secondary'
}];
Object.assign(window, {
  SAMPLE_JARS,
  SAMPLE_TX,
  SAMPLE_DEBTS,
  SAMPLE_DREAMS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/data/sample-data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/molecules/FormControls.jsx
try { (() => {
/* ─── Form controls — molecules for the transaction form ────────────────
 * Field · TextInput · MoneyInput · Segmented · Picker · Switch · DateField
 * All styled from design-system tokens; used by TransactionForm + Bulk.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const {
  useState: useFcState,
  useRef: useFcRef,
  useEffect: useFcEffect
} = React;

/* ---------- Field (label + control + hint) ---------- */
function Field({
  label,
  hint,
  required,
  children,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--fg-2)'
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--expense)'
    }
  }, " *")), children, hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11.5,
      color: 'var(--fg-3)'
    }
  }, hint));
}
const FC_INPUT_STYLE = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid var(--border-hairline)',
  borderRadius: 'var(--radius-sm)',
  padding: '11px 13px',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: 'var(--fg-1)',
  background: 'var(--surface-2)',
  outline: 'none',
  transition: 'border-color 150ms, background 150ms'
};
function fcFocus(e) {
  e.target.style.borderColor = 'var(--brand-primary)';
  e.target.style.background = 'var(--surface-1)';
}
function fcBlur(e) {
  e.target.style.borderColor = 'var(--border-hairline)';
  e.target.style.background = 'var(--surface-2)';
}

/* ---------- TextInput ---------- */
function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      position: 'absolute',
      left: 11,
      fontSize: 18,
      color: 'var(--fg-3)',
      pointerEvents: 'none'
    }
  }, icon), /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value),
    onFocus: fcFocus,
    onBlur: fcBlur,
    style: {
      ...FC_INPUT_STYLE,
      paddingLeft: icon ? 38 : 13,
      ...style
    }
  }));
}

/* ---------- MoneyInput (big amount + currency chip) ---------- */
function MoneyInput({
  value,
  onChange,
  currency = 'USD',
  onCurrency,
  currencies,
  accent = 'var(--brand-primary)',
  autoFocus
}) {
  const sym = window.CURRENCIES?.[currency]?.symbol || '$';
  const ref = useFcRef(null);
  useFcEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'var(--surface-2)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 30,
      color: 'var(--fg-3)'
    }
  }, sym), /*#__PURE__*/React.createElement("input", {
    ref: ref,
    type: "number",
    inputMode: "decimal",
    value: value,
    placeholder: "0.00",
    onChange: e => onChange(e.target.value),
    style: {
      flex: 1,
      minWidth: 0,
      border: 0,
      background: 'transparent',
      outline: 'none',
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 30,
      color: 'var(--fg-1)',
      fontVariantNumeric: 'tabular-nums'
    }
  }), currencies && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 3,
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-pill)',
      padding: 3
    }
  }, currencies.map(c => {
    const active = c === currency;
    return /*#__PURE__*/React.createElement("button", {
      key: c,
      onClick: () => onCurrency && onCurrency(c),
      type: "button",
      style: {
        border: 0,
        cursor: 'pointer',
        padding: '5px 11px',
        borderRadius: 'var(--radius-pill)',
        background: active ? accent : 'transparent',
        color: active ? '#fff' : 'var(--fg-2)',
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        fontWeight: 700,
        transition: 'all 150ms'
      }
    }, c);
  })));
}

/* ---------- Segmented control ---------- */
function Segmented({
  options,
  value,
  onChange,
  accentMap
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-pill)',
      padding: 4
    }
  }, options.map(o => {
    const active = value === o.value;
    const accent = accentMap && accentMap[o.value] || 'var(--brand-primary)';
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      type: "button",
      onClick: () => onChange(o.value),
      style: {
        flex: 1,
        border: 0,
        cursor: 'pointer',
        padding: '9px 8px',
        borderRadius: 'var(--radius-pill)',
        background: active ? 'var(--surface-1)' : 'transparent',
        color: active ? accent : 'var(--fg-2)',
        fontFamily: 'var(--font-body)',
        fontWeight: active ? 700 : 500,
        fontSize: 13,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        boxShadow: active ? 'var(--shadow-card)' : 'none',
        transition: 'all 150ms'
      }
    }, o.icon && /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 16
      }
    }, o.icon), o.label);
  }));
}

/* ---------- Picker (custom dropdown) ----------
 * options: [{ value, label, sub?, icon?, color?, right? }]
 */
function Picker({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar',
  leadingIcon
}) {
  const [open, setOpen] = useFcState(false);
  const boxRef = useFcRef(null);
  useFcEffect(() => {
    if (!open) return;
    const fn = e => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);
  const sel = options.find(o => o.value === value);
  return /*#__PURE__*/React.createElement("div", {
    ref: boxRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(o => !o),
    style: {
      ...FC_INPUT_STYLE,
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      cursor: 'pointer',
      textAlign: 'left',
      borderColor: open ? 'var(--brand-primary)' : 'var(--border-hairline)',
      background: open ? 'var(--surface-1)' : 'var(--surface-2)'
    }
  }, sel?.color && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: 3,
      background: sel.color,
      flexShrink: 0
    }
  }), (sel?.icon || leadingIcon) && !sel?.color && /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      color: 'var(--fg-2)'
    }
  }, sel?.icon || leadingIcon), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: sel ? 'var(--fg-1)' : 'var(--fg-3)'
    }
  }, sel ? sel.label : placeholder), sel?.right && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontSize: 12,
      color: 'var(--fg-2)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, sel.right), /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      color: 'var(--fg-3)'
    }
  }, open ? 'expand_less' : 'expand_more')), open && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: 0,
      right: 0,
      zIndex: 40,
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-popover)',
      padding: 6,
      maxHeight: 260,
      overflowY: 'auto',
      border: '1px solid var(--border-hairline)'
    }
  }, options.map(o => {
    const active = o.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: String(o.value),
      type: "button",
      onClick: () => {
        onChange(o.value);
        setOpen(false);
      },
      onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-2)',
      onMouseLeave: e => e.currentTarget.style.background = active ? 'var(--brand-primary-soft)' : 'transparent',
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '9px 10px',
        border: 0,
        cursor: 'pointer',
        borderRadius: 'var(--radius-xs)',
        background: active ? 'var(--brand-primary-soft)' : 'transparent',
        textAlign: 'left',
        transition: 'background 120ms'
      }
    }, o.color && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: 3,
        background: o.color,
        flexShrink: 0
      }
    }), o.icon && !o.color && /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 18,
        color: 'var(--fg-2)'
      }
    }, o.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-body)',
        fontSize: 13.5,
        fontWeight: 500,
        color: 'var(--fg-1)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, o.label), o.sub && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-body)',
        fontSize: 11.5,
        color: 'var(--fg-2)'
      }
    }, o.sub)), o.right && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-money)',
        fontSize: 12,
        color: 'var(--fg-2)',
        fontVariantNumeric: 'tabular-nums'
      }
    }, o.right), active && /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 16,
        color: 'var(--brand-primary)'
      }
    }, "check"));
  })));
}

/* ---------- Switch ---------- */
function Switch({
  on,
  onChange,
  label,
  sub,
  icon
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onChange(!on),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      width: '100%',
      border: '1px solid var(--border-hairline)',
      cursor: 'pointer',
      borderRadius: 'var(--radius-sm)',
      padding: '11px 13px',
      background: on ? 'var(--brand-primary-soft)' : 'var(--surface-2)',
      transition: 'background 150ms',
      textAlign: 'left'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 19,
      color: on ? 'var(--brand-primary)' : 'var(--fg-2)'
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-body)',
      fontSize: 13.5,
      fontWeight: 600,
      color: 'var(--fg-1)'
    }
  }, label), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-body)',
      fontSize: 11.5,
      color: 'var(--fg-2)'
    }
  }, sub)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 22,
      borderRadius: 999,
      background: on ? 'var(--brand-primary)' : 'var(--surface-3)',
      position: 'relative',
      flexShrink: 0,
      transition: 'background 180ms'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: on ? 18 : 2,
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: '#fff',
      transition: 'left 180ms',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    }
  })));
}
Object.assign(window, {
  Field,
  TextInput,
  MoneyInput,
  Segmented,
  Picker,
  Switch,
  FC_INPUT_STYLE,
  fcFocus,
  fcBlur
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/molecules/FormControls.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/molecules/SectionHeader.jsx
try { (() => {
/* ─── Molecule · SectionHeader ──────────────────────────────────────────
 * A section heading (h2) plus an optional trailing action node.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

function SectionHeader({
  title,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "t-h2",
    style: {
      margin: 0
    }
  }, title), action);
}
Object.assign(window, {
  SectionHeader
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/molecules/SectionHeader.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/AIAdvisorPanel.jsx
try { (() => {
/* ─── Desktop AI Advisor Panel ──────────────────────────────────────────
 * Right-side sliding panel with real Claude integration.
 * Props: open, onClose
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const {
  useState: useAIPanelState,
  useEffect: useAIPanelEffect,
  useRef: useAIPanelRef
} = React;
const DESKTOP_AI_SYSTEM = `You are the AI Financial Advisor ("Asesor Financiero IA") for OW Finance 2026.
User: José Otero, 35, freelancer.
Finances: balance $12,480.50 USD · savings rate 42% · monthly income ~$4,820 · monthly expenses ~$2,360.
Jars (plantilla 55/10/10/10/10): Necesidades básicas $1,815 (68% usado) · Diversión $132 (73% usado) · Ahorro $2,940 (meta 59%) · Educación $410 (42% usado) · Reservas $1,260.
Cuentas: BofA Corriente $3,420 · BofA Ahorros $12,480 · Mercantil (VES) · Visa crédito −$1,240 · Cashea (VES) −$626.
Impuestos del país: IGTF 3% en divisas, comisión Pago Móvil 0.30%.
Rules:
- Always respond in Spanish
- Be brief: 2-3 sentences max
- When you suggest a concrete action end with: [CTA: button text]
- Tone: calm, professional, empathetic
- No emojis or markdown
- Never mention Claude or third-party AI — you are OW Finance's native advisor`;
const DESKTOP_AI_SEED = [{
  id: 1,
  role: 'ai',
  time: '14:22',
  parts: [{
    text: '¡Hola! He revisado tus finanzas.\nTasa de ahorro: ',
    plain: true
  }, {
    text: '42%',
    color: '#10B981'
  }, {
    text: '. Sugiero redirigir ',
    plain: true
  }, {
    text: '$50',
    color: '#0EA5E9'
  }, {
    text: ' al jar de emergencia.',
    plain: true
  }],
  ctas: ['Asignar $50', 'Detalles']
}, {
  id: 2,
  role: 'user',
  time: '14:25',
  parts: [{
    text: '¿Cómo pago mi tarjeta más rápido?',
    plain: true
  }]
}, {
  id: 3,
  role: 'ai',
  time: '14:26',
  parts: [{
    text: 'Según tu perfil freelancer: Usa ',
    plain: true
  }, {
    text: 'método Avalancha',
    color: '#F59E0B'
  }, {
    text: '. Minimizará los intereses más rápido.',
    plain: true
  }],
  ctas: ['Crear plan de pago']
}];
const DESK_QUICK_REPLIES = ['Analiza gastos', 'Consejos', 'Próximos pagos', '¿Cuánto ahorré?'];
function AIAdvisorPanel({
  open,
  onClose
}) {
  const isMobile = useViewportMobile();
  const [messages, setMessages] = useAIPanelState([...DESKTOP_AI_SEED]);
  const [input, setInput] = useAIPanelState('');
  const [loading, setLoading] = useAIPanelState(false);
  const bottomRef = useAIPanelRef(null);
  useAIPanelEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollTop = bottomRef.current.scrollHeight;
  }, [messages, loading]);
  useAIPanelEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  const send = async text => {
    const t = (text || input).trim();
    if (!t || loading) return;
    setInput('');
    const userMsg = {
      id: Date.now(),
      role: 'user',
      time: new Date().toTimeString().slice(0, 5),
      parts: [{
        text: t,
        plain: true
      }]
    };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: (m.parts || []).map(p => p.text).join('')
      }));
      const raw = await window.claude.complete({
        messages: history,
        system: DESKTOP_AI_SYSTEM
      });
      const ctaMatch = raw.match(/\[CTA:\s*(.+?)\]/);
      const cta = ctaMatch ? ctaMatch[1].trim() : null;
      const clean = raw.replace(/\[CTA:\s*.+?\]/g, '').trim();
      setMessages(m => [...m, {
        id: Date.now() + 1,
        role: 'ai',
        time: new Date().toTimeString().slice(0, 5),
        parts: [{
          text: clean,
          plain: true
        }],
        ctas: cta ? [cta] : []
      }]);
    } catch {
      setMessages(m => [...m, {
        id: Date.now() + 1,
        role: 'ai',
        time: new Date().toTimeString().slice(0, 5),
        parts: [{
          text: 'No pude conectar. Intenta de nuevo.',
          plain: true
        }],
        ctas: []
      }]);
    }
    setLoading(false);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, `
        @keyframes panelSlide { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes panelFade  { from{opacity:0} to{opacity:1} }
      `), open && /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: isMobile ? 'absolute' : 'fixed',
      inset: 0,
      zIndex: 70,
      background: 'rgba(10,14,28,0.30)',
      animation: 'panelFade 200ms'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: isMobile ? {
      position: 'absolute',
      inset: 0,
      zIndex: 80,
      width: '100%',
      boxSizing: 'border-box',
      background: 'var(--surface-1)',
      boxShadow: '0 -10px 40px rgba(0,0,0,0.28)',
      display: 'flex',
      flexDirection: 'column',
      transform: open ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 300ms var(--ease-out)',
      borderRadius: '22px 22px 0 0',
      overflow: 'hidden'
    } : {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      zIndex: 80,
      width: 420,
      background: 'var(--surface-1)',
      boxShadow: '-8px 0 48px rgba(0,0,0,0.20)',
      display: 'flex',
      flexDirection: 'column',
      transform: open ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 280ms var(--ease-out)',
      borderLeft: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 20px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      borderBottom: '1px solid var(--border-hairline)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 20,
      flexShrink: 0,
      background: 'linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 20,
      color: '#fff'
    }
  }, "auto_awesome")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 15,
      color: 'var(--fg-1)'
    }
  }, "Asesor Financiero IA"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--income-fg)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 3,
      background: 'var(--income)',
      display: 'inline-block'
    }
  }), "EN L\xCDNEA")), /*#__PURE__*/React.createElement(IconButton, {
    icon: "close",
    ariaLabel: "Cerrar panel",
    onClick: onClose
  })), /*#__PURE__*/React.createElement("div", {
    ref: bottomRef,
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      scrollbarWidth: 'thin'
    }
  }, messages.map(msg => /*#__PURE__*/React.createElement(DesktopChatBubble, {
    key: msg.id,
    message: msg,
    onCta: send
  })), loading && /*#__PURE__*/React.createElement(DesktopTypingBubble, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      padding: '10px 16px 0',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      flexShrink: 0
    }
  }, DESK_QUICK_REPLIES.map(q => /*#__PURE__*/React.createElement("button", {
    key: q,
    onClick: () => send(q),
    style: {
      flexShrink: 0,
      border: '1px solid var(--border-hairline)',
      cursor: 'pointer',
      padding: '7px 14px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-2)',
      color: 'var(--fg-1)',
      fontFamily: 'var(--font-body)',
      fontWeight: 500,
      fontSize: 12
    }
  }, q))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px 20px',
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-pill)',
      padding: '0 16px',
      border: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: input,
    onChange: e => setInput(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter' && !e.shiftKey && !loading) {
        e.preventDefault();
        send(input);
      }
    },
    placeholder: "Escribe un mensaje...",
    disabled: loading,
    style: {
      flex: 1,
      border: 0,
      background: 'transparent',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--fg-1)',
      outline: 'none',
      padding: '11px 0'
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => send(input),
    disabled: loading || !input.trim(),
    style: {
      width: 42,
      height: 42,
      borderRadius: 21,
      border: 0,
      cursor: 'pointer',
      background: loading || !input.trim() ? 'var(--surface-2)' : 'var(--info)',
      color: loading || !input.trim() ? 'var(--fg-3)' : '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 160ms',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 20
    }
  }, loading ? 'hourglass_empty' : 'send')))));
}
function DesktopChatBubble({
  message,
  onCta
}) {
  const isUser = message.role === 'user';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      gap: 8,
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'flex-end',
      flexDirection: isUser ? 'row-reverse' : 'row'
    }
  }, !isUser && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 26,
      height: 26,
      borderRadius: 13,
      flexShrink: 0,
      background: 'linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 13,
      color: '#fff'
    }
  }, "auto_awesome")), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '82%',
      background: isUser ? 'var(--surface-2)' : 'var(--surface-1)',
      borderRadius: isUser ? '14px 14px 3px 14px' : '3px 14px 14px 14px',
      padding: '10px 14px',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      lineHeight: 1.55,
      color: 'var(--fg-1)',
      whiteSpace: 'pre-wrap'
    }
  }, (message.parts || []).map((p, i) => p.color ? /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      color: p.color,
      fontWeight: 600
    }
  }, p.text) : /*#__PURE__*/React.createElement("span", {
    key: i
  }, p.text))))), !isUser && message.ctas && message.ctas.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 34,
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, message.ctas.map((cta, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => onCta(cta),
    style: {
      border: 0,
      cursor: 'pointer',
      padding: '8px 16px',
      borderRadius: 'var(--radius-pill)',
      background: i === 0 ? 'var(--info)' : 'var(--surface-2)',
      color: i === 0 ? '#fff' : 'var(--fg-1)',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 13
    }
  }, cta))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      color: 'var(--fg-3)',
      marginLeft: isUser ? 0 : 34
    }
  }, message.time));
}
function DesktopTypingBubble() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 8,
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 26,
      height: 26,
      borderRadius: 13,
      background: 'linear-gradient(135deg,#7C3AED,#0EA5E9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 13,
      color: '#fff'
    }
  }, "auto_awesome")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-1)',
      borderRadius: '3px 14px 14px 14px',
      padding: '12px 16px',
      display: 'flex',
      gap: 5,
      boxShadow: 'var(--shadow-card)'
    }
  }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 6,
      height: 6,
      borderRadius: 3,
      background: 'var(--fg-3)',
      display: 'inline-block',
      animation: `dotPulse 1.2s ${i * 0.2}s ease-in-out infinite`
    }
  })), /*#__PURE__*/React.createElement("style", null, `@keyframes dotPulse{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`)));
}
Object.assign(window, {
  AIAdvisorPanel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/AIAdvisorPanel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/AccountsPanel.jsx
try { (() => {
/* ─── Accounts Panel — Pro Desktop Right Column ──────────────────────────
 * Shows multi-currency accounts + debts + Cashea.
 * Renders as a fixed right column inside ProShell (280px wide).
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const {
  useState: useAPState
} = React;

/* Accounts aligned with data/finance-data.jsx (SAMPLE_ACCOUNTS) */
const ACCOUNTS_DATA = [{
  id: 1,
  name: 'BofA · Corriente',
  short: 'BofA',
  sub: 'Cuenta corriente',
  currency: 'USD',
  balance: 3420.50,
  color: '#1E3A8A',
  flag: '🇺🇸'
}, {
  id: 2,
  name: 'BofA · Ahorros',
  short: 'BofA',
  sub: 'Cuenta ahorros',
  currency: 'USD',
  balance: 12480.00,
  color: '#2D4DA6',
  flag: '🇺🇸'
}, {
  id: 3,
  name: 'Efectivo USD',
  short: 'EFE',
  sub: 'Caja',
  currency: 'USD',
  balance: 340.00,
  color: '#10B981',
  flag: '🇺🇸'
}, {
  id: 4,
  name: 'Mercantil',
  short: 'MER',
  sub: 'Cuenta corriente',
  currency: 'VES',
  balance: 48500.00,
  color: '#F59E0B',
  flag: '🇻🇪'
}];
const DEBTS_DATA = [{
  id: 1,
  name: 'Visa · Crédito',
  type: 'credit',
  icon: 'credit_card',
  balance: 1240.20,
  currency: 'USD',
  apr: 17.9,
  next: 120.00,
  dueDate: '5 Jun',
  status: 'due_soon'
}, {
  id: 2,
  name: 'Cashea · iPhone',
  type: 'bnpl',
  icon: 'shopping_bag',
  balance: 445.50,
  currency: 'USD',
  cuota: '3/6',
  next: 148.50,
  dueDate: '8 Jun',
  status: 'pending'
}, {
  id: 3,
  name: 'Cashea · TV',
  type: 'bnpl',
  icon: 'shopping_bag',
  balance: 320.00,
  currency: 'USD',
  cuota: '2/6',
  next: 80.00,
  dueDate: '12 Jun',
  status: 'pending'
}, {
  id: 4,
  name: 'Préstamo personal',
  type: 'loan',
  icon: 'account_balance',
  balance: 6400.00,
  currency: 'USD',
  apr: 12.5,
  next: 320.00,
  dueDate: '15 Jun',
  status: 'active'
}];

/* Local fallback rates (flat). Real rates come from finance-data DEFAULT_RATES
 * (nested: { USD: { current, official } }) via the `rates` prop — toUSD handles both. */
const AP_RATES = {
  USD: 1,
  EUR: 0.92,
  VES: 40.50,
  COP: 4100
};
function AccountsPanel({
  hidden = false,
  rates = AP_RATES,
  mobile = false
}) {
  const [section, setSection] = useAPState('accounts'); // 'accounts' | 'debts'

  // Robust to flat ({VES: 40.5}) or nested ({VES: {current: 40.5}}) rate maps
  const rateOf = currency => {
    const r = rates[currency];
    const f = r && typeof r === 'object' ? r.current : r;
    return f || AP_RATES[currency] || 1;
  };
  const toUSD = (amount, currency) => amount / rateOf(currency);
  const totalUSD = ACCOUNTS_DATA.reduce((s, a) => s + toUSD(a.balance, a.currency), 0);
  const totalDebt = DEBTS_DATA.reduce((s, d) => s + d.balance, 0);
  return /*#__PURE__*/React.createElement("aside", {
    style: mobile ? {
      width: '100%',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column'
    } : {
      width: 280,
      flexShrink: 0,
      background: 'var(--surface-1)',
      borderLeft: '1px solid var(--border-hairline)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: mobile ? '0 0 12px' : '18px 18px 12px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-pill)',
      padding: 3,
      gap: 2
    }
  }, [['accounts', t('Cuentas')], ['debts', t('Deudas')]].map(([s, label]) => /*#__PURE__*/React.createElement("button", {
    key: s,
    onClick: () => setSection(s),
    style: {
      flex: 1,
      border: 0,
      cursor: 'pointer',
      padding: '7px',
      borderRadius: 'var(--radius-pill)',
      background: section === s ? 'var(--surface-1)' : 'transparent',
      color: section === s ? s === 'debts' ? 'var(--expense-fg)' : 'var(--fg-1)' : 'var(--fg-2)',
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: section === s ? 700 : 500,
      boxShadow: section === s ? 'var(--shadow-card)' : 'none',
      transition: 'all 150ms'
    }
  }, label)))), section === 'accounts' && /*#__PURE__*/React.createElement("div", {
    style: mobile ? {} : {
      flex: 1,
      overflowY: 'auto',
      scrollbarWidth: 'thin'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: mobile ? '0 2px 14px' : '0 18px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-eyebrow",
    style: {
      marginBottom: 4
    }
  }, t('Patrimonio neto · USD')), /*#__PURE__*/React.createElement("div", {
    className: "t-amount-lg"
  }, hidden ? '$ ••••••' : `$ ${totalUSD.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-hairline)',
      margin: mobile ? '0 2px 12px' : '0 18px 12px'
    }
  }), ACCOUNTS_DATA.map(acc => /*#__PURE__*/React.createElement(AccountRow, {
    key: acc.id,
    account: acc,
    hidden: hidden,
    usdValue: toUSD(acc.balance, acc.currency),
    mobile: mobile
  })), /*#__PURE__*/React.createElement("button", {
    style: {
      width: '100%',
      border: 0,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: mobile ? '12px 2px' : '12px 18px',
      background: 'transparent',
      color: 'var(--info)',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 600
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-2)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18
    }
  }, "add_circle_outline"), t('Agregar cuenta'))), section === 'debts' && /*#__PURE__*/React.createElement("div", {
    style: mobile ? {} : {
      flex: 1,
      overflowY: 'auto',
      scrollbarWidth: 'thin'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: mobile ? '0 2px 14px' : '0 18px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-eyebrow",
    style: {
      marginBottom: 4
    }
  }, t('Total adeudado · USD')), /*#__PURE__*/React.createElement("div", {
    className: "t-amount-lg",
    style: {
      color: 'var(--expense-fg)'
    }
  }, hidden ? '$ ••••••' : `$ ${totalDebt.toLocaleString('en-US', {
    minimumFractionDigits: 2
  })}`)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-hairline)',
      margin: mobile ? '0 2px 12px' : '0 18px 12px'
    }
  }), DEBTS_DATA.map(d => /*#__PURE__*/React.createElement(DebtRow, {
    key: d.id,
    debt: d,
    hidden: hidden,
    mobile: mobile
  })), /*#__PURE__*/React.createElement("button", {
    style: {
      width: '100%',
      border: 0,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: mobile ? '12px 2px' : '12px 18px',
      background: 'transparent',
      color: 'var(--expense-fg)',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 600
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-2)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18
    }
  }, "add_circle_outline"), t('Registrar deuda'))));
}
function AccountRow({
  account: a,
  hidden,
  usdValue,
  mobile = false
}) {
  const fmt = (n, cur) => {
    if (cur === 'VES' || cur === 'COP') return `${cur} ${(n / 1000).toFixed(0)}k`;
    return `${cur} ${n.toLocaleString('en-US', {
      minimumFractionDigits: 2
    })}`;
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: mobile ? '11px 2px' : '11px 18px',
      cursor: 'pointer',
      transition: 'background 150ms'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-2)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: a.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontSize: 11,
      fontWeight: 800,
      color: '#fff',
      letterSpacing: '-0.02em',
      flexShrink: 0
    }
  }, a.short.slice(0, 3)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--fg-1)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, a.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-2)'
    }
  }, t(a.sub))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-money)',
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--fg-1)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, hidden ? '••••' : fmt(a.balance, a.currency)), a.currency !== 'USD' && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      color: 'var(--fg-3)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, hidden ? '' : `≈ $ ${usdValue.toFixed(2)}`)));
}
function DebtRow({
  debt: d,
  hidden,
  mobile = false
}) {
  const statusColor = {
    pending: 'var(--fg-2)',
    due_soon: 'var(--warning-fg)',
    overdue: 'var(--expense-fg)',
    active: 'var(--fg-2)'
  }[d.status];
  const statusBg = {
    pending: 'var(--surface-2)',
    due_soon: 'var(--warning-soft)',
    overdue: 'var(--expense-soft)',
    active: 'var(--surface-2)'
  }[d.status];
  const statusLabel = {
    pending: t('Pendiente'),
    due_soon: t('Vence pronto'),
    overdue: t('Vencido'),
    active: t('Activo')
  }[d.status];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: mobile ? '12px 2px' : '12px 18px',
      cursor: 'pointer',
      transition: 'background 150ms'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-2)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 8,
      background: 'var(--expense-soft)',
      color: 'var(--expense-fg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 16
    }
  }, d.icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--fg-1)'
    }
  }, d.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-2)'
    }
  }, t('Vence:'), " ", d.dueDate, d.apr ? ` · ${d.apr}% APR` : '', d.cuota ? ` · ${t('cuota')} ${d.cuota}` : '')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-money)',
      fontSize: 14,
      fontWeight: 700,
      color: 'var(--expense-fg)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, hidden ? '••••' : `$ ${d.balance.toFixed(2)}`)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      padding: '3px 8px',
      borderRadius: 'var(--radius-pill)',
      background: statusBg,
      color: statusColor
    }
  }, statusLabel), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-2)'
    }
  }, t('Próx. pago:'), " ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--fg-1)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, hidden ? '••' : `$ ${d.next.toFixed(2)}`))));
}
Object.assign(window, {
  AccountsPanel,
  ACCOUNTS_DATA,
  DEBTS_DATA
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/AccountsPanel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/AnalisisParts.jsx
try { (() => {
/* global React, AN_JARS, AN_TOTAL, AN_RANGES, AN_FMT, AN_CONIC */
/* ─── Análisis · reusable parts (Lite + Pro) ─────────────────────────────
 * PeriodNavigator (collapsed gadget), SpendDonut+legend, TopJars, Budget vs
 * actual, Unassigned callout, KPIs, Insight, Detalle drill-down.
 * `accent` = navy in Lite, cyan in Pro. */
const {
  useState: useAnState,
  useRef: useAnRef,
  useEffect: useAnEffect
} = React;
const AN_JARCOLOR = id => {
  const j = (window.AN_JARS || []).find(x => x.id === id);
  return j ? j.color : 'var(--surface-3)';
};

/* ── Period navigator: collapsed range menu + stepper ─────────────────── */
function AnPeriodNav({
  accent = 'var(--brand-primary)',
  simple = false,
  onAdd
}) {
  const [open, setOpen] = useAnState(false);
  const [range, setRange] = useAnState('Mensual');
  const ref = useAnRef(null);
  useAnEffect(() => {
    if (!open) return;
    const close = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const t = setTimeout(() => document.addEventListener('mousedown', close), 0);
    return () => {
      document.removeEventListener('mousedown', close);
      clearTimeout(t);
    };
  }, [open]);
  const stepBtn = {
    width: 34,
    height: 34,
    border: '1px solid var(--border-hairline)',
    borderRadius: 'var(--radius-pill)',
    background: 'var(--surface-1)',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--fg-1)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
      marginBottom: 18
    }
  }, simple ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-pill)',
      padding: 3,
      gap: 2
    }
  }, ['Mes', 'Trimestre', 'Año'].map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => setRange(p),
    style: {
      border: 0,
      cursor: 'pointer',
      padding: '7px 13px',
      borderRadius: 'var(--radius-pill)',
      background: range === p || i === 0 && range === 'Mensual' ? accent : 'transparent',
      color: range === p || i === 0 && range === 'Mensual' ? '#fff' : 'var(--fg-2)',
      fontFamily: 'var(--font-body)',
      fontSize: 12.5,
      fontWeight: 600
    }
  }, p))) : /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 9,
      padding: '10px 16px',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-1)',
      boxShadow: 'var(--shadow-card)',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: 13.5,
      fontWeight: 600,
      color: 'var(--fg-1)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      color: 'var(--fg-3)'
    }
  }, "calendar_view_month"), t(range), /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      color: 'var(--fg-3)'
    }
  }, "expand_more")), open && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      zIndex: 'var(--z-popover)',
      minWidth: 200,
      background: 'var(--surface-1)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-popover)',
      padding: 5
    }
  }, AN_RANGES.map(r => {
    const on = r === range;
    return /*#__PURE__*/React.createElement("button", {
      key: r,
      onClick: () => {
        setRange(r);
        setOpen(false);
      },
      onMouseEnter: e => {
        if (!on) e.currentTarget.style.background = 'var(--surface-2)';
      },
      onMouseLeave: e => {
        if (!on) e.currentTarget.style.background = 'transparent';
      },
      style: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        padding: '9px 12px',
        border: 0,
        background: on ? 'var(--surface-2)' : 'transparent',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: on ? 600 : 500,
        color: 'var(--fg-1)',
        textAlign: 'left'
      }
    }, t(r), on && /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 18,
        color: accent
      }
    }, "check"));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: stepBtn
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons"
  }, "chevron_left")), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 116,
      textAlign: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 16
    }
  }, "Junio 2026"), /*#__PURE__*/React.createElement("button", {
    style: stepBtn
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons"
  }, "chevron_right"))));
}

/* ── Scannable cántaro strip ──────────────────────────────────────────── */
function AnJarStrip({
  jars = AN_JARS
}) {
  const max = Math.max(...jars.map(j => j.spent));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      padding: '4px 0 10px'
    }
  }, jars.map(j => /*#__PURE__*/React.createElement("div", {
    key: j.id,
    style: {
      flex: '0 0 auto',
      minWidth: 134,
      padding: '9px 13px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-1)',
      boxShadow: 'var(--shadow-card)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: j.color,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color: 'var(--fg-2)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, j.name)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 15,
      marginTop: 4,
      color: 'var(--expense-fg)'
    }
  }, "-", AN_FMT(j.spent)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 3,
      borderRadius: 2,
      background: 'var(--surface-3)',
      marginTop: 7,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      display: 'block',
      height: '100%',
      width: (j.spent / max * 100).toFixed(0) + '%',
      background: j.color
    }
  })))));
}

/* ── Donut + interactive legend ───────────────────────────────────────── */
function AnDonutLegend({
  jars = AN_JARS,
  total = AN_TOTAL,
  size = 220
}) {
  const [focus, setFocus] = useAnState(null);
  const sorted = [...jars].sort((a, b) => b.spent - a.spent);
  const f = focus ? jars.find(x => x.id === focus) : null;
  const hole = size - 60;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 26,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size,
      flex: '0 0 auto',
      borderRadius: '50%',
      background: AN_CONIC(jars, total)
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 30,
      background: 'var(--surface-1)',
      borderRadius: '50%',
      display: 'grid',
      placeContent: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 600,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      color: 'var(--fg-2)'
    }
  }, f ? f.name : 'Gastos'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 23,
      marginTop: 3,
      color: f ? f.color : 'var(--fg-1)'
    }
  }, AN_FMT(f ? f.spent : total)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--fg-3)',
      marginTop: 2
    }
  }, f ? (f.spent / total * 100).toFixed(1) + '% del gasto' : jars.length + ' cántaros'))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 210,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, sorted.map(j => /*#__PURE__*/React.createElement("div", {
    key: j.id,
    onMouseEnter: () => setFocus(j.id),
    onMouseLeave: () => setFocus(null),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '7px 8px',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      background: focus === j.id ? 'var(--surface-2)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 3,
      background: j.color,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--fg-1)'
    }
  }, j.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--fg-2)'
    }
  }, (j.spent / total * 100).toFixed(1), "%"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 600,
      fontSize: 13,
      minWidth: 64,
      textAlign: 'right'
    }
  }, AN_FMT(j.spent))))));
}

/* ── Top cántaros list (mini-bars) ────────────────────────────────────── */
function AnTopList({
  jars = AN_JARS
}) {
  const sorted = [...jars].sort((a, b) => b.spent - a.spent);
  const max = sorted[0].spent;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, sorted.map(j => /*#__PURE__*/React.createElement("div", {
    key: j.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '9px 4px',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-2)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 11,
      height: 11,
      borderRadius: 3,
      background: j.color,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      minWidth: 116
    }
  }, j.name), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 9,
      background: 'var(--surface-2)',
      borderRadius: 999,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      display: 'block',
      height: '100%',
      width: (j.spent / max * 100).toFixed(0) + '%',
      background: j.color,
      borderRadius: 999
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 13,
      minWidth: 62,
      textAlign: 'right',
      color: 'var(--expense-fg)'
    }
  }, AN_FMT(j.spent)))));
}

/* ── Budget vs actual (diverging) ─────────────────────────────────────── */
function AnBudget({
  jars = AN_JARS
}) {
  const maxV = Math.max(...jars.map(j => Math.max(j.spent, j.budget)));
  return /*#__PURE__*/React.createElement("div", null, jars.map(j => {
    const over = j.spent > j.budget;
    const pct = Math.round(j.spent / j.budget * 100);
    return /*#__PURE__*/React.createElement("div", {
      key: j.id,
      style: {
        padding: '10px 0',
        borderBottom: '1px solid var(--border-hairline)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: 3,
        background: j.color
      }
    }), j.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--fg-2)'
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--fg-1)',
        fontWeight: 600
      }
    }, AN_FMT(j.spent)), " / ", AN_FMT(j.budget), " ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 7px',
        borderRadius: 999,
        background: over ? 'var(--expense-soft)' : 'var(--surface-2)',
        color: over ? 'var(--expense-fg)' : 'var(--fg-2)'
      }
    }, pct, "%"))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: 8,
        background: 'var(--surface-2)',
        borderRadius: 999,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        borderRadius: 999,
        width: Math.min(j.spent / maxV * 100, 100).toFixed(1) + '%',
        background: over ? 'var(--expense)' : j.color
      }
    })));
  }));
}

/* ── Unassigned callout ───────────────────────────────────────────────── */
function AnUnassigned() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      padding: '15px 18px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--warning-soft)',
      border: '1px solid color-mix(in srgb, var(--warning) 30%, transparent)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-1)',
      display: 'grid',
      placeItems: 'center',
      color: 'var(--warning-fg)',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons"
  }, "savings")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 700
    }
  }, t('Tienes'), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      color: 'var(--warning-fg)'
    }
  }, "$17,787,042.81"), " ", t('sin asignar a un cántaro')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--fg-2)',
      marginTop: 1
    }
  }, t('Un ingreso atípico entró fuera del método 55/10/10/10/10. Asígnalo para que tu análisis cuadre.'))), /*#__PURE__*/React.createElement("button", {
    style: {
      border: 0,
      cursor: 'pointer',
      background: 'var(--warning)',
      color: '#3a2a00',
      fontWeight: 700,
      fontSize: 12.5,
      padding: '9px 16px',
      borderRadius: 'var(--radius-pill)',
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18
    }
  }, "call_split"), t('Asignar')));
}

/* ── KPI row ──────────────────────────────────────────────────────────── */
function AnKpis({
  kpis = window.AN_KPIS
}) {
  const isMobile = useViewportMobile();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? 12 : 16
    }
  }, kpis.map((k, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding: isMobile ? '14px 16px' : '18px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      color: 'var(--fg-2)'
    }
  }, t(k.label)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: isMobile ? 22 : 30,
      letterSpacing: '-.01em',
      marginTop: 8,
      color: k.color
    }
  }, k.val), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: k.flag ? 'var(--warning-fg)' : 'var(--fg-3)',
      marginTop: 6
    }
  }, t(k.meta)))));
}

/* ── Insight card (violet) ────────────────────────────────────────────── */
function AnInsight({
  icon = 'bolt',
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      padding: 16,
      borderRadius: 'var(--radius-md)',
      background: 'color-mix(in srgb, var(--violet-500) 10%, var(--surface-1))',
      border: '1px solid color-mix(in srgb, var(--violet-500) 22%, transparent)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 'var(--radius-sm)',
      background: 'color-mix(in srgb, var(--violet-500) 18%, transparent)',
      color: 'var(--violet-500)',
      display: 'grid',
      placeItems: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons"
  }, icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: 1.5
    }
  }, children));
}

/* ── Detalle agrupado (drill-down) ────────────────────────────────────── */
function AnDetalle({
  groups = window.AN_DETALLE
}) {
  const [open, setOpen] = useAnState({
    0: true
  });
  return /*#__PURE__*/React.createElement("div", null, groups.map((g, gi) => {
    const isOpen = !!open[gi];
    return /*#__PURE__*/React.createElement("div", {
      key: gi,
      style: {
        border: '1px solid var(--border-hairline)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => setOpen(o => ({
        ...o,
        [gi]: !o[gi]
      })),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        cursor: 'pointer',
        background: 'var(--surface-1)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        color: 'var(--fg-3)',
        transform: isOpen ? 'rotate(90deg)' : 'none',
        transition: 'transform .2s'
      }
    }, "chevron_right"), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 10,
        borderRadius: 3,
        background: AN_JARCOLOR(g.jar),
        flex: '0 0 auto'
      }
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: 14
      }
    }, g.name), " \xB7 ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--fg-2)'
      }
    }, g.count, " ", t('transacciones'))), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        textAlign: 'right'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-money)',
        fontWeight: 700,
        fontSize: 14,
        color: 'var(--expense-fg)'
      }
    }, "-", AN_FMT(g.total)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: 'var(--fg-3)'
      }
    }, t('Ingresos'), " $0.00"))), isOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 8px 8px',
        background: 'var(--bg-canvas)'
      }
    }, g.subs.map((s, si) => /*#__PURE__*/React.createElement("div", {
      key: si
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 10px 2px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: 12.5
      }
    }, s.name, " ", /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500,
        color: 'var(--fg-2)'
      }
    }, "\xB7 ", s.count, " tx")), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-money)',
        fontWeight: 600,
        fontSize: 12.5,
        color: 'var(--expense-fg)'
      }
    }, "-", AN_FMT(s.total))), s.tx.map((tr, ti) => /*#__PURE__*/React.createElement("div", {
      key: ti,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 12px',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer'
      },
      onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-2)',
      onMouseLeave: e => e.currentTarget.style.background = 'transparent'
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 36,
        height: 36,
        borderRadius: 'var(--radius-sm)',
        display: 'grid',
        placeItems: 'center',
        flex: '0 0 auto',
        background: 'var(--expense-soft)',
        color: 'var(--expense-fg)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 18
      }
    }, "south_west")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, tr.nm), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 600,
        padding: '1px 7px',
        borderRadius: 999,
        border: '1px solid color-mix(in srgb, var(--info) 40%, transparent)',
        color: 'var(--info-fg)'
      }
    }, t('Gasto'))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--fg-2)',
        marginTop: 2
      }
    }, tr.date, " \xB7 ", tr.acct, " \xB7 ", tr.cat), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: 'var(--fg-3)',
        marginTop: 1
      }
    }, tr.src, " (", tr.rate, ")")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'right',
        flex: '0 0 auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-money)',
        fontWeight: 700,
        fontSize: 14,
        color: 'var(--expense-fg)'
      }
    }, "-", AN_FMT(tr.amt)))))))));
  }));
}
Object.assign(window, {
  AnPeriodNav,
  AnJarStrip,
  AnDonutLegend,
  AnTopList,
  AnBudget,
  AnUnassigned,
  AnKpis,
  AnInsight,
  AnDetalle
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/AnalisisParts.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/BulkImportPanel.jsx
try { (() => {
/* ─── BulkImportPanel — carga masiva con dry-run ────────────────────────
 * PRO only. Paste CSV-like rows → preview (dry-run) con tipo detectado,
 * cuenta, monto, cántaro y estado por fila antes de aplicar.
 * Endpoint real: POST /api/v1/transactions/bulk (dry_run=true).
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const {
  useState: useBulkState
} = React;
const BULK_SAMPLE = `2026-05-26, Whole Foods, -84.12, BofA Corriente, Supermercado
2026-05-26, Sueldo ACME, 3200.00, BofA Ahorros, Ingresos
2026-05-25, Cashea cuota 3/6, -148.50, Mercantil, Deuda
2026-05-24, Uber aeropuerto, -32.60, BofA Corriente, Transporte
2026-05-24, Netflix, -16.99, Visa Crédito, Entretenimiento`;
function bulkParse(text) {
  return text.split('\n').map(l => l.trim()).filter(Boolean).map((line, i) => {
    const [date, name, amountRaw, account, category] = line.split(',').map(s => (s || '').trim());
    const amount = parseFloat(amountRaw);
    const valid = name && !isNaN(amount) && account;
    return {
      i,
      date: date || '—',
      name: name || '(sin concepto)',
      amount: isNaN(amount) ? 0 : amount,
      type: isNaN(amount) ? 'expense' : amount >= 0 ? 'income' : 'expense',
      account: account || '—',
      category: category || '—',
      status: !valid ? 'error' : Math.abs(amount) > 1000 ? 'warn' : 'ok'
    };
  });
}
function BulkImportPanel({
  onClose
}) {
  const [text, setText] = useBulkState(BULK_SAMPLE);
  const [rows, setRows] = useBulkState(null);
  const run = () => setRows(bulkParse(text));
  const okCount = rows ? rows.filter(r => r.status !== 'error').length : 0;
  const errCount = rows ? rows.filter(r => r.status === 'error').length : 0;
  const total = rows ? rows.reduce((s, r) => s + (r.status !== 'error' ? r.amount : 0), 0) : 0;
  const STATUS = {
    ok: {
      bg: 'var(--income-soft)',
      fg: 'var(--income-fg)',
      icon: 'check_circle',
      label: window.t('OK')
    },
    warn: {
      bg: 'var(--warning-soft)',
      fg: 'var(--warning-fg)',
      icon: 'warning',
      label: window.t('Revisar')
    },
    error: {
      bg: 'var(--expense-soft)',
      fg: 'var(--expense-fg)',
      icon: 'error',
      label: window.t('Error')
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      padding: '12px 14px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--info-soft)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 20,
      color: 'var(--info-fg)'
    }
  }, "upload_file"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--fg-1)'
    }
  }, t("Carga masiva (dry-run)")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--fg-2)',
      marginTop: 2
    }
  }, t("Pega filas:"), " ", /*#__PURE__*/React.createElement("code", {
    style: {
      fontSize: 11
    }
  }, t("fecha, concepto, monto, cuenta, categoría")), t(". Verás una vista previa antes de aplicar.")))), /*#__PURE__*/React.createElement("textarea", {
    value: text,
    onChange: e => {
      setText(e.target.value);
      setRows(null);
    },
    rows: 6,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-sm)',
      padding: '12px 14px',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: 12.5,
      lineHeight: 1.6,
      color: 'var(--fg-1)',
      background: 'var(--surface-2)',
      resize: 'vertical',
      outline: 'none'
    },
    onFocus: window.fcFocus,
    onBlur: window.fcBlur
  }), !rows && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: run,
    style: {
      alignSelf: 'flex-start',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      border: 0,
      cursor: 'pointer',
      padding: '11px 20px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--info)',
      color: '#fff',
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18
    }
  }, "play_arrow"), t("Procesar (vista previa)")), rows && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(BulkStat, {
    label: t("Filas válidas"),
    value: okCount,
    tone: "income"
  }), /*#__PURE__*/React.createElement(BulkStat, {
    label: t("Con error"),
    value: errCount,
    tone: "expense"
  }), /*#__PURE__*/React.createElement(BulkStat, {
    label: t("Neto"),
    value: tfMoney(total),
    tone: "brand"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-hairline)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '88px 1fr 96px 110px 92px',
      gap: 0,
      padding: '9px 12px',
      background: 'var(--surface-2)',
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: 'var(--fg-3)'
    }
  }, /*#__PURE__*/React.createElement("span", null, t("Fecha")), /*#__PURE__*/React.createElement("span", null, t("Concepto")), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: 'right'
    }
  }, t("Monto")), /*#__PURE__*/React.createElement("span", null, t("Cuenta")), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: 'center'
    }
  }, t("Estado"))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: 240,
      overflowY: 'auto'
    }
  }, rows.map(r => {
    const st = STATUS[r.status];
    return /*#__PURE__*/React.createElement("div", {
      key: r.i,
      style: {
        display: 'grid',
        gridTemplateColumns: '88px 1fr 96px 110px 92px',
        gap: 0,
        padding: '10px 12px',
        borderTop: '1px solid var(--border-hairline)',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 11.5,
        color: 'var(--fg-2)'
      }
    }, r.date.slice(5)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--fg-1)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        paddingRight: 8
      }
    }, r.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-money)',
        fontSize: 13,
        fontWeight: 600,
        textAlign: 'right',
        color: r.amount >= 0 ? 'var(--income-fg)' : 'var(--fg-1)',
        fontVariantNumeric: 'tabular-nums'
      }
    }, r.amount >= 0 ? '+' : '−', tfMoney(r.amount)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 11.5,
        color: 'var(--fg-2)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        paddingLeft: 8
      }
    }, r.account), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        justifySelf: 'center',
        padding: '3px 9px',
        borderRadius: 'var(--radius-pill)',
        background: st.bg,
        color: st.fg,
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 13
      }
    }, st.icon), st.label));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(PillButton, {
    variant: "ghost",
    onClick: () => setRows(null)
  }, t("← Editar filas")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      border: 0,
      cursor: 'pointer',
      padding: '12px 24px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--info)',
      color: '#fff',
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: 14.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 19
    }
  }, "library_add_check"), t("Aplicar"), " ", okCount, " ", t("transacciones")))));
}
function BulkStat({
  label,
  value,
  tone
}) {
  const c = tone === 'income' ? 'var(--income-fg)' : tone === 'expense' ? 'var(--expense-fg)' : 'var(--brand-primary)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 110,
      padding: '12px 14px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--fg-2)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-money)',
      fontSize: 22,
      fontWeight: 700,
      color: c,
      marginTop: 3,
      fontVariantNumeric: 'tabular-nums'
    }
  }, value));
}
Object.assign(window, {
  BulkImportPanel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/BulkImportPanel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/DebtsPreview.jsx
try { (() => {
/* global React */
/* ─── Debts / Planes de pago ──────────────────────────────────────────
 * DebtTile      — card for a single debt/plan
 * CasheaPlanTile — special card for Cashea BNPL plans
 * DebtsPreview  — home preview (3 tiles + summary)
 * DebtsFullList — full route grid
 * ──────────────────────────────────────────────────────────────────── */

const DEBT_PROVIDER_META = {
  cashea: {
    label: 'Cashea',
    icon: 'shopping_bag',
    accent: '#F97316',
    tint: 'rgba(249,115,22,0.10)'
  },
  card: {
    label: 'Tarjeta',
    icon: 'credit_card',
    accent: '#EF4444',
    tint: 'rgba(239,68,68,0.10)'
  },
  loan: {
    label: 'Préstamo',
    icon: 'account_balance',
    accent: '#8B5CF6',
    tint: 'rgba(139,92,246,0.10)'
  },
  personal: {
    label: 'Personal',
    icon: 'handshake',
    accent: '#0EA5E9',
    tint: 'rgba(14,165,233,0.10)'
  }
};
const DEBT_STATUS_META = {
  'on-track': {
    label: 'Al día',
    color: 'var(--income)',
    soft: 'var(--income-soft)',
    fg: 'var(--income-fg)'
  },
  'due-soon': {
    label: 'Próximo',
    color: 'var(--warning)',
    soft: 'var(--warning-soft)',
    fg: 'var(--warning-fg)'
  },
  'late': {
    label: 'Atrasado',
    color: 'var(--expense)',
    soft: 'var(--expense-soft)',
    fg: 'var(--expense-fg)'
  },
  'paid': {
    label: 'Pagado',
    color: 'var(--income)',
    soft: 'var(--income-soft)',
    fg: 'var(--income-fg)'
  }
};
function DebtTile({
  debt,
  hidden,
  compact = false
}) {
  const provider = DEBT_PROVIDER_META[debt.provider] || DEBT_PROVIDER_META.loan;
  const status = DEBT_STATUS_META[debt.status] || DEBT_STATUS_META['on-track'];
  const progress = debt.total ? Math.round(debt.paid / debt.total * 100) : Math.round((debt.original - debt.balance) / debt.original * 100);
  const isCashea = debt.provider === 'cashea';
  return /*#__PURE__*/React.createElement(Card, {
    padding: compact ? 18 : 22,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }
  }, isCashea && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
      color: '#fff',
      fontFamily: 'var(--font-body)',
      fontSize: 9.5,
      fontWeight: 700,
      padding: '4px 10px',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      borderBottomLeftRadius: 'var(--radius-md)'
    }
  }, "Cashea"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 'var(--radius-md)',
      background: provider.tint,
      color: provider.accent,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 19
    }
  }, provider.icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 14,
      color: 'var(--fg-1)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, debt.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-2)'
    }
  }, t(debt.merchant), " \xB7 ", debt.rate))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-eyebrow",
    style: {
      marginBottom: 2
    }
  }, t('Pendiente')), /*#__PURE__*/React.createElement(Money, {
    value: debt.balance,
    className: "t-amount-lg",
    hidden: hidden
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      fontWeight: 700,
      padding: '3px 9px',
      borderRadius: 'var(--radius-pill)',
      background: status.soft,
      color: status.fg,
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }
  }, t(status.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      borderRadius: 999,
      background: 'var(--surface-2)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${progress}%`,
      background: status.color,
      borderRadius: 999,
      transition: 'width var(--dur-slow) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-2)'
    }
  }, /*#__PURE__*/React.createElement("span", null, debt.total ? /*#__PURE__*/React.createElement(React.Fragment, null, t('Cuota'), " ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--fg-1)'
    }
  }, debt.paid, "/", debt.total)) : /*#__PURE__*/React.createElement(React.Fragment, null, progress, "% ", t('pagado'))), /*#__PURE__*/React.createElement("span", null, t('Próxima:'), " ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--fg-1)'
    },
    className: "tabular"
  }, "$", debt.nextDueAmount.toFixed(2)), " \xB7 ", debt.nextDueDate)));
}
function DebtsPreview({
  debts,
  hidden,
  onViewAll
}) {
  const isMobile = useViewportMobile();
  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const nextDue = debts.filter(d => d.status !== 'paid').sort((a, b) => a.nextDueAmount - b.nextDueAmount);
  const upcomingThisMonth = debts.reduce((s, d) => s + (d.nextDueAmount || 0), 0);
  const lateCount = debts.filter(d => d.status === 'late').length;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeader, {
    title: t('Deudas y planes de pago'),
    action: /*#__PURE__*/React.createElement(PillButton, {
      variant: "ghost",
      size: "sm",
      onClick: onViewAll
    }, t('Ver todas'))
  }), /*#__PURE__*/React.createElement(Card, {
    padding: 20,
    style: {
      marginBottom: 14,
      display: 'flex',
      gap: 28,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-eyebrow"
  }, t('Total pendiente')), /*#__PURE__*/React.createElement(Money, {
    value: totalBalance,
    className: "t-amount-xl",
    hidden: hidden,
    color: "var(--expense)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 36,
      background: 'var(--border-hairline)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-eyebrow"
  }, t('Próximas cuotas · 30d')), /*#__PURE__*/React.createElement("span", {
    className: "t-amount-lg tabular",
    style: {
      color: 'var(--fg-1)'
    }
  }, hidden ? '••••••' : `$ ${upcomingThisMonth.toFixed(2)}`)), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 36,
      background: 'var(--border-hairline)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-eyebrow"
  }, t('Estado')), /*#__PURE__*/React.createElement("span", {
    className: "t-body",
    style: {
      color: lateCount > 0 ? 'var(--expense)' : 'var(--income)',
      fontWeight: 600
    }
  }, lateCount > 0 ? `${lateCount} ${t('atrasada')}${lateCount > 1 ? 's' : ''}` : t('Todo al día'))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(PillButton, {
    variant: "secondary",
    size: "sm",
    icon: "payments"
  }, t('Pagar cuota')), /*#__PURE__*/React.createElement(PillButton, {
    variant: "primary",
    size: "sm",
    icon: "add"
  }, t('Nuevo plan')))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: 14
    }
  }, nextDue.slice(0, 3).map(d => /*#__PURE__*/React.createElement(DebtTile, {
    key: d.id,
    debt: d,
    hidden: hidden
  }))));
}
function DebtsFullList({
  debts,
  hidden
}) {
  const isMobile = useViewportMobile();
  const cashea = debts.filter(d => d.provider === 'cashea');
  const others = debts.filter(d => d.provider !== 'cashea');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 28
    }
  }, cashea.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 6,
      background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 12
    }
  }, "c"), /*#__PURE__*/React.createElement("h3", {
    className: "t-h3",
    style: {
      margin: 0
    }
  }, t('Planes Cashea')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 'var(--radius-pill)',
      background: 'rgba(249,115,22,0.10)',
      color: '#F97316',
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }
  }, t('0% interés'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: 14
    }
  }, cashea.map(d => /*#__PURE__*/React.createElement(DebtTile, {
    key: d.id,
    debt: d,
    hidden: hidden
  })))), others.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "t-h3",
    style: {
      margin: '0 0 12px'
    }
  }, t('Otras deudas')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: 14
    }
  }, others.map(d => /*#__PURE__*/React.createElement(DebtTile, {
    key: d.id,
    debt: d,
    hidden: hidden
  })))));
}
Object.assign(window, {
  DebtTile,
  DebtsPreview,
  DebtsFullList,
  DEBT_PROVIDER_META,
  DEBT_STATUS_META
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/DebtsPreview.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/DesktopQuickModal.jsx
try { (() => {
/* ─── Desktop Quick Action Modal ────────────────────────────────────────
 * Lite + Pro modal for adding a movement.
 *
 *   Step 1 — pick type   (Gasto / Ingreso / Transferir) — segmented
 *   Step 2 — pick method (Escribir / Voz / Foto / Auto IA) — tiles
 *
 * Emits onSelectAction("<type>:<method>"), e.g. "expense:voice".
 * The shell parses and forwards to SmartTransactionModal.
 *
 * Props: open, onClose, onOpenAI, onSelectAction, mode('lite'|'pro')
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

const DQM_TYPES = [{
  id: 'expense',
  label: 'Gasto',
  icon: 'arrow_outward',
  color: 'var(--expense)'
}, {
  id: 'income',
  label: 'Ingreso',
  icon: 'arrow_downward',
  color: 'var(--income)'
}, {
  id: 'transfer',
  label: 'Transferir',
  icon: 'swap_horiz',
  color: '#8B5CF6'
}];
const DQM_PLANS = [{
  id: 'debt',
  label: 'Pago de deuda',
  sub: 'Cuota Cashea, tarjeta, préstamo o personal.',
  icon: 'credit_card',
  accent: '#EF4444',
  tint: 'rgba(239,68,68,0.10)',
  badge: 'Cashea'
}, {
  id: 'dream',
  label: 'Aporte a sueño',
  sub: 'Sumá al ahorro de una meta de largo plazo.',
  icon: 'auto_awesome',
  accent: '#8B5CF6',
  tint: 'rgba(139,92,246,0.10)'
}, {
  id: 'jar',
  label: 'Aporte a jar',
  sub: 'Movimiento hacia un jar de corto plazo.',
  icon: 'savings',
  accent: 'var(--brand-primary)',
  tint: 'var(--brand-primary-soft)'
}];
const DQM_METHODS = [{
  id: 'text',
  label: 'Escribir',
  sub: 'Completá monto, comercio y categoría paso a paso.',
  icon: 'edit_note',
  accent: 'var(--brand-primary)',
  tint: 'var(--brand-primary-soft)'
}, {
  id: 'voice',
  label: 'Nota de voz',
  sub: 'Dictá la transacción — la IA la transcribe y categoriza.',
  icon: 'mic',
  accent: '#0EA5E9',
  tint: 'rgba(14,165,233,0.10)',
  badge: 'Transcripción IA'
}, {
  id: 'photo',
  label: 'Foto de factura',
  sub: 'Sacá la foto y se extraen todos los datos del recibo.',
  icon: 'receipt_long',
  accent: '#F59E0B',
  tint: 'rgba(245,158,11,0.10)',
  chips: ['Monto', 'Comercio', 'Items', 'Fecha', 'IVA']
}, {
  id: 'autoai',
  label: 'Auto IA',
  sub: 'Pegá un mensaje o describí en lenguaje natural.',
  icon: 'auto_awesome',
  accent: '#8B5CF6',
  tint: 'rgba(139,92,246,0.10)',
  badge: 'Beta'
}];
function DesktopQuickModal({
  open,
  onClose,
  onOpenAI,
  onSelectAction,
  mode = 'lite'
}) {
  const [type, setType] = React.useState('expense');
  const isMobile = useViewportMobile();
  React.useEffect(() => {
    if (!open) return;
    setType('expense'); // reset on each open
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  const choose = methodId => {
    onClose();
    const mapped = methodId === 'autoai' ? 'text' : methodId;
    onSelectAction && onSelectAction(`${type}:${mapped}`);
  };
  const choosePlan = planId => {
    onClose();
    onSelectAction && onSelectAction(`${planId}:text`);
  };
  const activeType = DQM_TYPES.find(t => t.id === type);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: isMobile ? 'absolute' : 'fixed',
      inset: 0,
      zIndex: 'var(--z-modal)',
      background: 'rgba(10,14,28,0.55)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center',
      padding: isMobile ? 0 : 16,
      boxSizing: 'border-box',
      animation: 'dqmFade 200ms var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("style", null, `
        @keyframes dqmFade { from{opacity:0} to{opacity:1} }
        @keyframes dqmRise { from{opacity:0;transform:scale(0.97) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes dqmSheet { from{transform:translateY(100%)} to{transform:translateY(0)} }
      `), /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-label": "Agregar movimiento",
    onClick: e => e.stopPropagation(),
    style: isMobile ? {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      maxWidth: 'none',
      boxSizing: 'border-box',
      maxHeight: '90%',
      overflow: 'auto',
      background: 'var(--surface-1)',
      borderRadius: '22px 22px 0 0',
      padding: '10px 18px calc(20px + env(safe-area-inset-bottom))',
      boxShadow: '0 -10px 40px rgba(0,0,0,0.28)',
      animation: 'dqmFade 200ms var(--ease-out)'
    } : {
      width: 'min(620px, 100%)',
      maxHeight: '92vh',
      overflow: 'auto',
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-xl)',
      padding: '28px',
      boxShadow: 'var(--shadow-popover)',
      animation: 'dqmRise 240ms var(--ease-out)'
    }
  }, isMobile && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 999,
      background: 'var(--border-strong, var(--border-hairline))',
      margin: '0 auto 14px',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t-eyebrow"
  }, t('Acción rápida')), /*#__PURE__*/React.createElement("div", {
    className: "t-h2",
    style: {
      marginTop: 4
    }
  }, t('¿Qué quieres registrar?'))), /*#__PURE__*/React.createElement(IconButton, {
    icon: "close",
    ariaLabel: "Cerrar",
    onClick: onClose
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--fg-3)'
    }
  }, t('Tipo de movimiento')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--fg-2)'
    }
  }, t('Paso 1 de 2'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-pill)',
      padding: 4
    }
  }, DQM_TYPES.map(t => {
    const active = type === t.id;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => setType(t.id),
      style: {
        flex: 1,
        border: 0,
        cursor: 'pointer',
        padding: '10px 12px',
        borderRadius: 'var(--radius-pill)',
        background: active ? 'var(--surface-1)' : 'transparent',
        color: active ? t.color : 'var(--fg-2)',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        boxShadow: active ? 'var(--shadow-card)' : 'none',
        transition: 'all 160ms var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 16
      }
    }, t.icon), window.t(t.label));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--fg-3)'
    }
  }, t('¿Cómo lo querés ingresar?')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--fg-2)'
    }
  }, t('Paso 2 de 2'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, DQM_METHODS.map(m => /*#__PURE__*/React.createElement(DQMMethodTile, {
    key: m.id,
    method: m,
    typeColor: activeType.color,
    onPress: () => choose(m.id)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-hairline)',
      margin: '0 0 18px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--fg-3)'
    }
  }, t('O registrá un movimiento especial'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: 10
    }
  }, DQM_PLANS.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    onClick: () => choosePlan(p.id),
    onMouseEnter: e => {
      e.currentTarget.style.borderColor = p.accent;
      e.currentTarget.style.background = p.tint;
    },
    onMouseLeave: e => {
      e.currentTarget.style.borderColor = 'var(--border-hairline)';
      e.currentTarget.style.background = 'var(--surface-1)';
    },
    style: {
      textAlign: 'left',
      cursor: 'pointer',
      border: '1px solid var(--border-hairline)',
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-lg)',
      padding: '12px 12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      transition: 'all 160ms var(--ease-out)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 'var(--radius-sm)',
      background: p.tint,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 16,
      color: p.accent
    }
  }, p.icon)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 13,
      color: 'var(--fg-1)'
    }
  }, t(p.label)), p.badge && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontFamily: 'var(--font-body)',
      fontSize: 9,
      fontWeight: 700,
      padding: '2px 6px',
      borderRadius: 'var(--radius-pill)',
      background: p.tint,
      color: p.accent,
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }
  }, t(p.badge))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11.5,
      color: 'var(--fg-2)',
      lineHeight: 1.4
    }
  }, t(p.sub)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-hairline)',
      margin: '0 0 18px'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      onClose();
      onOpenAI && onOpenAI();
    },
    style: {
      width: '100%',
      border: 0,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: '14px',
      borderRadius: 'var(--radius-pill)',
      background: 'linear-gradient(90deg, #7C3AED 0%, #2563EB 60%, #0EA5E9 100%)',
      color: '#fff',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 15,
      boxShadow: '0 6px 24px rgba(124,58,237,0.30)',
      transition: 'opacity 160ms'
    },
    onMouseEnter: e => e.currentTarget.style.opacity = '0.88',
    onMouseLeave: e => e.currentTarget.style.opacity = '1'
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 20
    }
  }, "psychology"), t('¿Tenés una duda? Hablá con el Asesor IA'))));
}

/* ─── Method tile ──────────────────────────────────────────────────── */
function DQMMethodTile({
  method: m,
  typeColor,
  onPress
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onPress,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      textAlign: 'left',
      border: '1px solid',
      borderColor: hover ? m.accent : 'var(--border-hairline)',
      cursor: 'pointer',
      background: hover ? m.tint : 'var(--surface-1)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      transition: 'all 160ms var(--ease-out)',
      position: 'relative',
      minHeight: 116
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 'var(--radius-md)',
      background: m.tint,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 20,
      color: m.accent
    }
  }, m.icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 15,
      color: 'var(--fg-1)'
    }
  }, t(m.label)), m.badge && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.04em',
      padding: '3px 7px',
      borderRadius: 'var(--radius-pill)',
      background: m.tint,
      color: m.accent,
      textTransform: 'uppercase'
    }
  }, t(m.badge)))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12.5,
      color: 'var(--fg-2)',
      lineHeight: 1.45
    }
  }, t(m.sub)), m.chips && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 4,
      marginTop: 'auto',
      paddingTop: 4
    }
  }, m.chips.map(c => /*#__PURE__*/React.createElement("span", {
    key: c,
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10.5,
      fontWeight: 600,
      padding: '3px 7px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-2)',
      color: 'var(--fg-2)',
      border: '1px solid var(--border-hairline)'
    }
  }, t(c)))));
}
Object.assign(window, {
  DesktopQuickModal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/DesktopQuickModal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/DreamsPreview.jsx
try { (() => {
/* global React */
/* ─── Dreams (Sueños) ─────────────────────────────────────────────────
 * Long-term aspirational goals: house, masters, sabbatical.
 * More emotional + visual than jars. Violet/purple palette.
 * ──────────────────────────────────────────────────────────────────── */

const DREAM_TONES = {
  'dream-primary': {
    accent: '#8B5CF6',
    tint: 'rgba(139,92,246,0.10)',
    soft: 'rgba(139,92,246,0.18)'
  },
  'dream-secondary': {
    accent: '#EC4899',
    tint: 'rgba(236,72,153,0.10)',
    soft: 'rgba(236,72,153,0.18)'
  }
};
function DreamTile({
  dream,
  hidden,
  compact = false
}) {
  const t = DREAM_TONES[dream.tone] || DREAM_TONES['dream-primary'];
  const remaining = dream.goal - dream.amount;
  return /*#__PURE__*/React.createElement(Card, {
    padding: compact ? 18 : 22,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 160,
      height: 160,
      borderRadius: '50%',
      background: t.tint,
      pointerEvents: 'none',
      filter: 'blur(2px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 'var(--radius-md)',
      background: `linear-gradient(135deg, ${t.accent}, ${t.accent}cc)`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      flexShrink: 0,
      boxShadow: `0 4px 16px ${t.tint}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 22
    }
  }, dream.icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 15,
      color: 'var(--fg-1)'
    }
  }, window.t(dream.name)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-2)'
    }
  }, window.t(dream.subtitle)))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(Money, {
    value: dream.amount,
    className: "t-amount-lg",
    hidden: hidden
  }), /*#__PURE__*/React.createElement("span", {
    className: "t-body-sm",
    style: {
      color: 'var(--fg-2)'
    }
  }, window.t('de'), " ", /*#__PURE__*/React.createElement("span", {
    className: "tabular",
    style: {
      fontWeight: 600
    }
  }, "$", dream.goal.toLocaleString('en-US')))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      borderRadius: 999,
      background: 'var(--surface-2)',
      overflow: 'hidden',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${dream.progress}%`,
      background: `linear-gradient(90deg, ${t.accent} 0%, ${DREAM_TONES['dream-secondary'].accent} 100%)`,
      borderRadius: 999,
      transition: 'width var(--dur-slow) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 8,
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-2)'
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: t.accent
    }
  }, dream.progress, "%"), " \xB7 ETA ", dream.eta), /*#__PURE__*/React.createElement("span", null, window.t('Faltan'), " ", /*#__PURE__*/React.createElement("span", {
    className: "tabular",
    style: {
      color: 'var(--fg-1)',
      fontWeight: 600
    }
  }, "$", remaining.toLocaleString('en-US', {
    maximumFractionDigits: 0
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      position: 'relative',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      padding: '4px 9px',
      borderRadius: 'var(--radius-pill)',
      background: t.tint,
      color: t.accent
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 12
    }
  }, "autorenew"), "$", dream.monthly, window.t('/mes')), dream.contributors > 1 && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      padding: '4px 9px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-2)',
      color: 'var(--fg-2)',
      border: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 12
    }
  }, "group"), dream.contributors)));
}
function DreamsPreview({
  dreams,
  hidden,
  onViewAll
}) {
  const isMobile = useViewportMobile();
  const totalSaved = dreams.reduce((s, d) => s + d.amount, 0);
  const totalGoal = dreams.reduce((s, d) => s + d.goal, 0);
  const overallProgress = Math.round(totalSaved / totalGoal * 100);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeader, {
    title: t('Sueños'),
    action: /*#__PURE__*/React.createElement(PillButton, {
      variant: "ghost",
      size: "sm",
      onClick: onViewAll
    }, t('Ver todos'))
  }), /*#__PURE__*/React.createElement(Card, {
    padding: 20,
    style: {
      marginBottom: 14,
      display: 'flex',
      gap: 28,
      alignItems: 'center',
      flexWrap: 'wrap',
      background: 'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(236,72,153,0.05) 100%)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-eyebrow"
  }, t('Total ahorrado en sueños')), /*#__PURE__*/React.createElement(Money, {
    value: totalSaved,
    className: "t-amount-xl",
    hidden: hidden,
    color: "#8B5CF6"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 36,
      background: 'var(--border-hairline)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-eyebrow"
  }, t('Meta combinada')), /*#__PURE__*/React.createElement("span", {
    className: "t-amount-lg tabular",
    style: {
      color: 'var(--fg-1)'
    }
  }, hidden ? '••••••' : `$ ${totalGoal.toLocaleString('en-US')}`)), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 36,
      background: 'var(--border-hairline)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minWidth: 140
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-eyebrow"
  }, t('Progreso global')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "t-amount-lg",
    style: {
      color: '#8B5CF6'
    }
  }, overallProgress, "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 6,
      borderRadius: 999,
      background: 'var(--surface-2)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${overallProgress}%`,
      background: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%)',
      borderRadius: 999
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(PillButton, {
    variant: "secondary",
    size: "sm",
    icon: "favorite"
  }, t('Aportar')), /*#__PURE__*/React.createElement(PillButton, {
    variant: "primary",
    size: "sm",
    icon: "add"
  }, t('Nuevo sueño')))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: 14
    }
  }, dreams.slice(0, 2).map(d => /*#__PURE__*/React.createElement(DreamTile, {
    key: d.id,
    dream: d,
    hidden: hidden
  }))));
}
function DreamsFullGrid({
  dreams,
  hidden
}) {
  const isMobile = useViewportMobile();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: 16
    }
  }, dreams.map(d => /*#__PURE__*/React.createElement(DreamTile, {
    key: d.id,
    dream: d,
    hidden: hidden
  })));
}
Object.assign(window, {
  DreamTile,
  DreamsPreview,
  DreamsFullGrid,
  DREAM_TONES
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/DreamsPreview.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/ExchangeRatesWidget.jsx
try { (() => {
/* ─── Exchange Rates Widget ──────────────────────────────────────────────
 * Manual rate setter for multi-currency Pro accounts.
 * Rates are stored in parent state and passed to AccountsPanel for conversion.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const {
  useState: useERState
} = React;
const RATE_DEFS = [{
  code: 'EUR',
  name: 'Euro',
  flag: 'EU',
  base: 'USD → EUR',
  hint: '1 USD ='
}, {
  code: 'VES',
  name: 'Bolívar venezolano',
  flag: 'VE',
  base: 'USD → VES',
  hint: '1 USD ='
}, {
  code: 'COP',
  name: 'Peso colombiano',
  flag: 'CO',
  base: 'USD → COP',
  hint: '1 USD ='
}, {
  code: 'CLP',
  name: 'Peso chileno',
  flag: 'CL',
  base: 'USD → CLP',
  hint: '1 USD ='
}, {
  code: 'PEN',
  name: 'Sol peruano',
  flag: 'PE',
  base: 'USD → PEN',
  hint: '1 USD ='
}];
function ExchangeRatesWidget({
  rates,
  onChange
}) {
  // Tolerant to flat ({VES: 40.5}) or nested ({VES: {current, official}}) shapes.
  const readRate = code => {
    const r = rates[code];
    return r && typeof r === 'object' ? r.current ?? '' : r ?? '';
  };
  const writeRate = (code, v) => {
    const r = rates[code];
    if (r && typeof r === 'object') return onChange({
      ...rates,
      [code]: {
        ...r,
        current: v
      }
    });
    return onChange({
      ...rates,
      [code]: v
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0
    }
  }, RATE_DEFS.map((def, i) => /*#__PURE__*/React.createElement(RateRow, {
    key: def.code,
    def: def,
    value: readRate(def.code),
    onChange: v => writeRate(def.code, v),
    first: i === 0
  })));
}
function RateRow({
  def,
  value,
  onChange,
  first
}) {
  const [focused, setFocused] = useERState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '13px 18px',
      borderTop: first ? 'none' : '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: 'var(--surface-2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontSize: 10,
      fontWeight: 700,
      color: 'var(--fg-2)',
      letterSpacing: '0.04em',
      flexShrink: 0
    }
  }, def.flag), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--fg-1)'
    }
  }, def.code), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-2)'
    }
  }, def.name)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--fg-2)',
      flexShrink: 0
    }
  }, "1 USD ="), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: focused ? 'var(--surface-1)' : 'var(--surface-2)',
      border: `1px solid ${focused ? 'var(--brand-primary)' : 'var(--border-hairline)'}`,
      borderRadius: 'var(--radius-sm)',
      padding: '7px 12px',
      transition: 'all 160ms',
      minWidth: 120
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "0",
    step: "any",
    value: value,
    onChange: e => onChange(parseFloat(e.target.value) || ''),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      border: 0,
      background: 'transparent',
      fontFamily: 'var(--font-money)',
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--fg-1)',
      outline: 'none',
      width: 80,
      fontVariantNumeric: 'tabular-nums'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--fg-2)'
    }
  }, def.code)));
}
Object.assign(window, {
  ExchangeRatesWidget,
  RATE_DEFS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/ExchangeRatesWidget.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/ExpandedMenu.jsx
try { (() => {
/* global React */
const {
  useEffect: useMenuEffect,
  useRef: useMenuRef
} = React;
const MENU_GROUPS = [{
  label: 'Account',
  items: [{
    icon: 'person',
    label: 'Profile',
    hint: 'José Otero'
  }, {
    icon: 'savings',
    label: 'Payment methods',
    hint: '3 cards · 1 bank'
  }, {
    icon: 'notifications',
    label: 'Notifications',
    hint: 'On · weekly digest'
  }]
}, {
  label: 'Preferences',
  items: [{
    icon: 'settings',
    label: 'App settings'
  }, {
    icon: 'visibility',
    label: 'Privacy & visibility'
  }, {
    icon: 'receipt_long',
    label: 'Export data'
  }]
}, {
  label: '',
  items: [{
    icon: 'close',
    label: 'Sign out',
    destructive: true
  }]
}];
function ExpandedMenu({
  open,
  onClose,
  anchorRight = 32
}) {
  const ref = useMenuRef(null);
  useMenuEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    const onClick = e => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('keydown', onKey);
    // small delay so the click that opened it doesn't immediately close it
    const t = setTimeout(() => document.addEventListener('mousedown', onClick), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
      clearTimeout(t);
    };
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    role: "dialog",
    "aria-label": "Account menu",
    style: {
      position: 'absolute',
      top: 76,
      right: anchorRight,
      width: 320,
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-popover)',
      zIndex: 'var(--z-popover)',
      overflow: 'hidden',
      animation: 'fadeIn var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("style", null, `@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 18px 8px',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--brand-primary)',
      color: 'var(--fg-on-brand)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 16
    }
  }, "J"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 14,
      color: 'var(--fg-1)'
    }
  }, "Jos\xE9 Otero"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--fg-2)'
    }
  }, "jose@owfinance.com"))), MENU_GROUPS.map((group, gi) => /*#__PURE__*/React.createElement("div", {
    key: gi,
    style: {
      padding: '6px 8px'
    }
  }, group.label && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 12px 4px',
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: 'var(--fg-2)'
    }
  }, group.label), group.items.map((item, ii) => /*#__PURE__*/React.createElement(MenuRow, {
    key: ii,
    item: item
  })))));
}
function MenuRow({
  item
}) {
  const [h, setH] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      width: '100%',
      border: 0,
      cursor: 'pointer',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 12px',
      borderRadius: 'var(--radius-sm)',
      background: h ? 'var(--surface-2)' : 'transparent',
      color: item.destructive ? 'var(--expense-fg)' : 'var(--fg-1)',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 500,
      transition: 'background var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      color: item.destructive ? 'var(--expense)' : 'var(--fg-2)'
    }
  }, item.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("span", null, item.label), item.hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--fg-2)',
      fontWeight: 400
    }
  }, item.hint)), !item.destructive && /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      color: 'var(--fg-3)'
    }
  }, "chevron_right"));
}
Object.assign(window, {
  ExpandedMenu
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/ExpandedMenu.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/HeroBalance.jsx
try { (() => {
/* global React */

function HeroBalance({
  amount,
  currency,
  hidden,
  onQuickAdd,
  asOf,
  delta
}) {
  return /*#__PURE__*/React.createElement(Card, {
    hero: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, t('Disponible'), " \xB7 ", currency), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Money, {
    value: amount,
    className: "t-hero-amount",
    hidden: hidden
  }), delta && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 600,
      color: delta.value >= 0 ? 'var(--income-fg)' : 'var(--expense-fg)',
      background: delta.value >= 0 ? 'var(--income-soft)' : 'var(--expense-soft)',
      padding: '4px 10px',
      borderRadius: 'var(--radius-pill)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 14
    }
  }, delta.value >= 0 ? 'arrow_upward' : 'arrow_downward'), delta.value >= 0 ? '+' : '', delta.value.toFixed(1), "% ", t(delta.label))), /*#__PURE__*/React.createElement("div", {
    className: "t-body-sm"
  }, t('Al'), " ", t(asOf))), /*#__PURE__*/React.createElement("div", {
    style: {
      alignSelf: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(PillButton, {
    variant: "primary",
    icon: "add",
    onClick: onQuickAdd
  }, t('Agregar')))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      paddingTop: 20,
      borderTop: '1px solid var(--border-hairline)',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: t('Ingresos · este mes'),
    value: 4820.00,
    tone: "income",
    hidden: hidden
  }), /*#__PURE__*/React.createElement(KPI, {
    label: t('Gastos · este mes'),
    value: -2360.50,
    tone: "expense",
    hidden: hidden
  }), /*#__PURE__*/React.createElement(KPI, {
    label: t('Neto · este mes'),
    value: 2459.50,
    tone: "default",
    hidden: hidden
  })));
}
function KPI({
  label,
  value,
  tone,
  hidden
}) {
  const color = tone === 'income' ? 'var(--income-fg)' : tone === 'expense' ? 'var(--expense-fg)' : 'var(--fg-1)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, label), /*#__PURE__*/React.createElement(Money, {
    value: value,
    className: "t-amount-lg",
    hidden: hidden,
    sign: tone !== 'default',
    color: color
  }));
}
Object.assign(window, {
  HeroBalance
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/HeroBalance.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/JarsPreview.jsx
try { (() => {
/* global React */

function JarTile({
  jar,
  hidden,
  compact = false
}) {
  const toneVar = jar.tone === 'warn' ? 'var(--warning)' : jar.tone === 'income' ? 'var(--income)' : 'var(--brand-primary)';
  const softVar = jar.tone === 'warn' ? 'var(--warning-soft)' : jar.tone === 'income' ? 'var(--income-soft)' : 'var(--brand-primary-soft)';
  const fgVar = jar.tone === 'warn' ? 'var(--warning-fg)' : jar.tone === 'income' ? 'var(--income-fg)' : 'var(--brand-primary-fg-soft)';
  return /*#__PURE__*/React.createElement(Card, {
    padding: compact ? 18 : 22,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 'var(--radius-pill)',
      background: softVar,
      color: fgVar,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18
    }
  }, "savings")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 14,
      color: 'var(--fg-1)'
    }
  }, t(jar.name)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-2)'
    }
  }, t(jar.subtitle)))), /*#__PURE__*/React.createElement(Money, {
    value: jar.amount,
    className: "t-amount-lg",
    hidden: hidden
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      borderRadius: 999,
      background: 'var(--surface-2)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${jar.progress}%`,
      background: toneVar,
      borderRadius: 999,
      transition: 'width var(--dur-slow) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-2)'
    }
  }, /*#__PURE__*/React.createElement("span", null, jar.progress, "% ", t('de'), " ", /*#__PURE__*/React.createElement("span", {
    className: "tabular"
  }, jar.goalText)), /*#__PURE__*/React.createElement("span", null, t(jar.statusText))));
}
function JarsPreview({
  jars,
  hidden,
  onViewAll
}) {
  const isMobile = useViewportMobile();
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeader, {
    title: t('Cántaros'),
    action: /*#__PURE__*/React.createElement(PillButton, {
      variant: "ghost",
      size: "sm",
      onClick: onViewAll
    }, t('Ver todos'))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: 14
    }
  }, jars.slice(0, 3).map((j, i) => /*#__PURE__*/React.createElement(JarTile, {
    key: i,
    jar: j,
    hidden: hidden
  }))));
}
function JarsFullGrid({
  jars,
  hidden
}) {
  const isMobile = useViewportMobile();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: 16
    }
  }, jars.map((j, i) => /*#__PURE__*/React.createElement(JarTile, {
    key: i,
    jar: j,
    hidden: hidden
  })));
}
Object.assign(window, {
  JarsPreview,
  JarsFullGrid,
  JarTile
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/JarsPreview.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/LiteHeader.jsx
try { (() => {
/* global React */
const {
  useState: useHdr
} = React;
function LiteHeader({
  user,
  currency,
  balanceVisible,
  onToggleVisibility,
  onOpenMenu,
  onOpenNotifications,
  onAvatarClick,
  notificationCount = 2
}) {
  const theme = useAppTheme();
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      padding: '18px 32px 14px',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onAvatarClick,
    "aria-label": "Open profile menu",
    style: {
      width: 42,
      height: 42,
      border: 0,
      padding: 0,
      cursor: 'pointer',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--brand-primary)',
      color: 'var(--fg-on-brand)',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 16,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, user.initial), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      lineHeight: 1.25
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12.5,
      fontWeight: 500,
      color: 'var(--fg-2)',
      whiteSpace: 'nowrap'
    }
  }, t(user.greeting)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 17,
      color: 'var(--fg-1)',
      whiteSpace: 'nowrap',
      letterSpacing: '-0.01em'
    }
  }, user.name))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(CurrencyChip, {
    code: currency
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 22,
      background: 'var(--border-hairline)',
      margin: '0 2px',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: balanceVisible ? 'visibility' : 'visibility_off',
    ariaLabel: balanceVisible ? 'Hide balance' : 'Show balance',
    onClick: onToggleVisibility
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: theme === 'dark' ? 'light_mode' : 'dark_mode',
    ariaLabel: theme === 'dark' ? 'Modo claro' : 'Modo oscuro',
    onClick: () => window.toggleAppTheme && window.toggleAppTheme()
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "notifications",
    ariaLabel: "Notifications",
    onClick: onOpenNotifications
  }), notificationCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 999,
      background: 'var(--expense)',
      boxShadow: '0 0 0 2px var(--surface-1)'
    }
  })), /*#__PURE__*/React.createElement(IconButton, {
    icon: "menu",
    ariaLabel: "Open menu",
    onClick: onOpenMenu
  })));
}
Object.assign(window, {
  LiteHeader
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/LiteHeader.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/LiteNavPill.jsx
try { (() => {
/* global React */

const NAV_ITEMS = [{
  id: 'home',
  label: 'Home',
  icon: 'home',
  route: '/user/home'
}, {
  id: 'transactions',
  label: 'Movs',
  icon: 'receipt_long',
  route: '/user/transactions'
}, {
  id: 'analisis',
  label: 'Análisis',
  icon: 'donut_small',
  route: '/user/expense-analysis'
}, {
  id: 'jars',
  label: 'Cántaros',
  icon: 'savings',
  route: '/user/jars'
}, {
  id: 'dreams',
  label: 'Sueños',
  icon: 'auto_awesome',
  route: '/user/dreams'
}, {
  id: 'debts',
  label: 'Deudas',
  icon: 'credit_card',
  route: '/user/debts'
}, {
  id: 'config',
  label: 'Ajustes',
  icon: 'settings',
  route: '/user/config'
}];
function LiteNavPill({
  active,
  onChange,
  onQuickAdd
}) {
  return /*#__PURE__*/React.createElement("nav", {
    role: "navigation",
    "aria-label": "Primary",
    style: {
      position: 'fixed',
      bottom: 28,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 'var(--z-nav)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-pill)',
      padding: 6,
      boxShadow: 'var(--shadow-float)'
    }
  }, NAV_ITEMS.map(item => {
    const isActive = item.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: item.id,
      onClick: () => onChange(item.id),
      "aria-current": isActive ? 'page' : undefined,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 14px',
        border: 0,
        cursor: 'pointer',
        borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: isActive ? 600 : 500,
        color: isActive ? 'var(--fg-on-brand)' : 'var(--fg-2)',
        background: isActive ? 'var(--brand-primary)' : 'transparent',
        transition: 'background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out)'
      },
      onMouseEnter: e => {
        if (!isActive) {
          e.currentTarget.style.background = 'var(--surface-2)';
          e.currentTarget.style.color = 'var(--fg-1)';
        }
      },
      onMouseLeave: e => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--fg-2)';
        }
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 20
      }
    }, item.icon), t(item.label));
  }), /*#__PURE__*/React.createElement("button", {
    onClick: onQuickAdd,
    "aria-label": "Quick add",
    style: {
      marginLeft: 4,
      width: 48,
      height: 48,
      border: 0,
      cursor: 'pointer',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--brand-primary)',
      color: 'var(--fg-on-brand)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 14px rgba(30, 58, 138, 0.30)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 26
    }
  }, "add")));
}
Object.assign(window, {
  LiteNavPill,
  NAV_ITEMS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/LiteNavPill.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/MobileTabBar.jsx
try { (() => {
/* global React */
/* ─── MobileTabBar ────────────────────────────────────────────────────────
 * Bottom navigation used on phones by BOTH Lite and Pro shells.
 * Renders <nav aria-label="Primary"> so the mobile CSS in index.html
 * (body.viewport-mobile nav[aria-label="Primary"]) reshapes it into a docked
 * full-width tab bar. `accent` sets the active pill color (navy for Lite,
 * cyan for Pro).
 * ──────────────────────────────────────────────────────────────────────── */

function MobileTabBar({
  items,
  active,
  onChange,
  onQuickAdd,
  accent = 'var(--brand-primary)',
  addColor
}) {
  const fab = addColor || accent;
  return /*#__PURE__*/React.createElement("nav", {
    role: "navigation",
    "aria-label": "Primary",
    style: {
      position: 'fixed',
      bottom: 28,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 'var(--z-nav)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-pill)',
      padding: 6,
      boxShadow: 'var(--shadow-float)'
    }
  }, items.map(item => {
    const isActive = item.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: item.id,
      onClick: () => onChange(item.id),
      "aria-current": isActive ? 'page' : undefined,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 14px',
        border: 0,
        cursor: 'pointer',
        borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: isActive ? 600 : 500,
        color: isActive ? '#fff' : 'var(--fg-2)',
        background: isActive ? accent : 'transparent',
        transition: 'background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 20
      }
    }, item.icon), window.t(item.label));
  }), /*#__PURE__*/React.createElement("button", {
    onClick: onQuickAdd,
    "aria-label": "Quick add",
    style: {
      marginLeft: 4,
      width: 48,
      height: 48,
      border: 0,
      cursor: 'pointer',
      borderRadius: 'var(--radius-pill)',
      background: fab,
      color: '#fff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 14px rgba(0,0,0,0.20)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 26
    }
  }, "add")));
}
Object.assign(window, {
  MobileTabBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/MobileTabBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/NotificationsPanel.jsx
try { (() => {
/* global React */
/* ─── NotificationsPanel ──────────────────────────────────────────────────
 * Bell dropdown shared by Lite + Pro shells.
 *  · Desktop  → popover anchored under the header bell
 *  · Mobile   → bottom-sheet docked to the frame (matches modals)
 * Notifications are realistic OW Finance events (Cashea cuotas, idle money,
 * weekly digest, dream goals, over-budget, incoming payment).
 * `accent` tints the unread dot + "mark all read" link (navy Lite / cyan Pro).
 * ──────────────────────────────────────────────────────────────────────── */
const {
  useEffect: useNotifEffect,
  useRef: useNotifRef,
  useState: useNotifState
} = React;
const NOTIF_SEED = [{
  id: 1,
  icon: 'credit_card',
  tone: 'expense',
  title: 'Cuota Cashea por vencer',
  body: 'iPhone 15 · $148.50 vence en 2 días (28 mar).',
  time: 'Hace 2 h',
  unread: true
}, {
  id: 2,
  icon: 'savings',
  tone: 'info',
  title: 'Dinero ocioso detectado',
  body: 'Tienes $1,240 sin asignar a ningún cántaro hace 9 días.',
  time: 'Hace 5 h',
  unread: true
}, {
  id: 3,
  icon: 'auto_awesome',
  tone: 'income',
  title: '¡Meta de sueño más cerca!',
  body: 'Vacaciones Margarita llegó al 72% de tu objetivo.',
  time: 'Ayer',
  unread: false
}, {
  id: 4,
  icon: 'trending_up',
  tone: 'warning',
  title: 'Cántaro Diversión al 90%',
  body: 'Has usado $270 de $300 este mes. Cuida el límite.',
  time: 'Hace 2 d',
  unread: false
}, {
  id: 5,
  icon: 'arrow_downward',
  tone: 'income',
  title: 'Pago recibido',
  body: 'Banesco · +$820.00 acreditado a Cuenta principal.',
  time: 'Hace 3 d',
  unread: false
}, {
  id: 6,
  icon: 'receipt_long',
  tone: 'info',
  title: 'Tu resumen semanal está listo',
  body: 'Gastaste 8% menos que la semana pasada. Buen ritmo.',
  time: 'Hace 4 d',
  unread: false
}];
const NOTIF_TONE = {
  expense: {
    fg: 'var(--expense-fg)',
    bg: 'var(--expense-soft)'
  },
  income: {
    fg: 'var(--income-fg)',
    bg: 'var(--income-soft)'
  },
  warning: {
    fg: 'var(--warning-fg)',
    bg: 'var(--warning-soft)'
  },
  info: {
    fg: 'var(--info)',
    bg: 'var(--surface-2)'
  }
};
function NotificationsPanel({
  open,
  onClose,
  accent = 'var(--brand-primary)',
  anchorRight = 32,
  anchorTop = 76
}) {
  const ref = useNotifRef(null);
  const isMobile = useViewportMobile();
  const [items, setItems] = useNotifState(NOTIF_SEED);
  useNotifEffect(() => {
    if (!open) return;
    setItems(NOTIF_SEED.map(n => ({
      ...n
    }))); // reset each open
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    const onClick = e => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => document.addEventListener('mousedown', onClick), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
      clearTimeout(t);
    };
  }, [open, onClose]);
  if (!open) return null;
  const T = window.t || (s => s);
  const unreadCount = items.filter(n => n.unread).length;
  const markAllRead = () => setItems(items.map(n => ({
    ...n,
    unread: false
  })));
  const readOne = id => setItems(items.map(n => n.id === id ? {
    ...n,
    unread: false
  } : n));

  /* ── Mobile: bottom-sheet ─────────────────────────────────────── */
  if (isMobile) {
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 'var(--z-modal)',
        background: 'rgba(10,14,28,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'npFade 200ms'
      }
    }, /*#__PURE__*/React.createElement("style", null, `@keyframes npFade { from{opacity:0} to{opacity:1} }`), /*#__PURE__*/React.createElement("div", {
      ref: ref,
      role: "dialog",
      "aria-label": "Notificaciones",
      onClick: e => e.stopPropagation(),
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        boxSizing: 'border-box',
        background: 'var(--surface-1)',
        borderRadius: '22px 22px 0 0',
        maxHeight: '88%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.28)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 38,
        height: 4,
        borderRadius: 999,
        background: 'var(--border-hairline)',
        margin: '10px auto 6px',
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement(NotifHeader, {
      T: T,
      accent: accent,
      unreadCount: unreadCount,
      onMarkAll: markAllRead,
      pad: "6px 18px 12px"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        overflowY: 'auto',
        flex: 1
      }
    }, items.map(n => /*#__PURE__*/React.createElement(NotifRow, {
      key: n.id,
      n: n,
      T: T,
      onClick: () => readOne(n.id)
    })), /*#__PURE__*/React.createElement(NotifFooter, {
      T: T
    }))));
  }

  /* ── Desktop: popover ─────────────────────────────────────────── */
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    role: "dialog",
    "aria-label": "Notificaciones",
    style: {
      position: 'absolute',
      top: anchorTop,
      right: anchorRight,
      width: 380,
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-popover)',
      border: '1px solid var(--border-hairline)',
      zIndex: 'var(--z-popover)',
      overflow: 'hidden',
      animation: 'npRise var(--dur-base) var(--ease-out)',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 540
    }
  }, /*#__PURE__*/React.createElement("style", null, `@keyframes npRise { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }`), /*#__PURE__*/React.createElement(NotifHeader, {
    T: T,
    accent: accent,
    unreadCount: unreadCount,
    onMarkAll: markAllRead,
    pad: "16px 18px 12px"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowY: 'auto'
    }
  }, items.map(n => /*#__PURE__*/React.createElement(NotifRow, {
    key: n.id,
    n: n,
    T: T,
    onClick: () => readOne(n.id)
  })), /*#__PURE__*/React.createElement(NotifFooter, {
    T: T
  })));
}
function NotifHeader({
  T,
  accent,
  unreadCount,
  onMarkAll,
  pad
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: pad,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexShrink: 0,
      borderBottom: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 17,
      color: 'var(--fg-1)'
    }
  }, T('Notificaciones')), unreadCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600,
      color: accent
    }
  }, unreadCount, " ", T('sin leer'))), unreadCount > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: onMarkAll,
    style: {
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: 12.5,
      fontWeight: 600,
      color: accent,
      padding: 0
    }
  }, T('Marcar todas')));
}
function NotifRow({
  n,
  T,
  onClick
}) {
  const [h, setH] = useNotifState(false);
  const tone = NOTIF_TONE[n.tone] || NOTIF_TONE.info;
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      width: '100%',
      border: 0,
      cursor: 'pointer',
      textAlign: 'left',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      padding: '13px 18px',
      background: h ? 'var(--surface-2)' : n.unread ? 'var(--unread-bg, rgba(37,99,235,0.045))' : 'transparent',
      borderBottom: '1px solid var(--border-hairline)',
      transition: 'background var(--dur-base) var(--ease-out)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      width: 38,
      height: 38,
      borderRadius: 'var(--radius-md)',
      background: tone.bg,
      color: tone.fg,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 20
    }
  }, n.icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13.5,
      fontWeight: n.unread ? 700 : 600,
      color: 'var(--fg-1)'
    }
  }, T(n.title)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12.5,
      color: 'var(--fg-2)',
      lineHeight: 1.4
    }
  }, T(n.body)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-3)',
      marginTop: 2
    }
  }, T(n.time))), n.unread && /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      width: 8,
      height: 8,
      borderRadius: 4,
      background: 'var(--info)',
      marginTop: 6
    }
  }));
}
function NotifFooter({
  T
}) {
  const [h, setH] = useNotifState(false);
  return /*#__PURE__*/React.createElement("button", {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      width: '100%',
      border: 0,
      cursor: 'pointer',
      padding: '14px 18px',
      background: h ? 'var(--surface-2)' : 'transparent',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--fg-2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      transition: 'background var(--dur-base) var(--ease-out)'
    }
  }, T('Ver todas las notificaciones'), /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18
    }
  }, "chevron_right"));
}
Object.assign(window, {
  NotificationsPanel,
  NOTIF_SEED
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/NotificationsPanel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/RecentTransactions.jsx
try { (() => {
/* global React */

function TxRow({
  tx,
  hidden,
  dense = false
}) {
  const isIncome = tx.amount > 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: dense ? 'auto 1fr auto auto' : 'auto 1fr auto',
      gap: 14,
      alignItems: 'center',
      padding: dense ? '10px 20px' : '14px 20px',
      borderTop: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: dense ? 32 : 38,
      height: dense ? 32 : 38,
      borderRadius: 'var(--radius-pill)',
      background: isIncome ? 'var(--income-soft)' : 'var(--expense-soft)',
      color: isIncome ? 'var(--income-fg)' : 'var(--expense-fg)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: dense ? 18 : 20
    }
  }, isIncome ? 'arrow_downward' : 'arrow_outward')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 500,
      fontSize: 14,
      color: 'var(--fg-1)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, t(tx.label)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--fg-2)'
    }
  }, t(tx.meta))), dense && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      justifyContent: 'flex-end',
      flexWrap: 'wrap'
    }
  }, tx.jar ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      padding: '4px 10px 4px 8px',
      borderRadius: 'var(--radius-pill)',
      background: 'color-mix(in srgb, ' + tx.jarColor + ' 12%, var(--surface-1))',
      color: 'color-mix(in srgb, ' + tx.jarColor + ' 72%, var(--fg-1))'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: tx.jarColor,
      flexShrink: 0
    }
  }), t(tx.jar)) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 500,
      padding: '4px 10px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--income-soft)',
      color: 'var(--income-fg)'
    }
  }, t('Sin cántaro')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 500,
      padding: '4px 10px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-2)',
      color: 'var(--fg-2)'
    }
  }, t(tx.category))), /*#__PURE__*/React.createElement(Money, {
    value: tx.amount,
    className: "t-amount-sm",
    sign: true,
    hidden: hidden,
    color: isIncome ? 'var(--income-fg)' : 'var(--expense-fg)'
  }));
}
function RecentTransactions({
  transactions,
  hidden,
  onViewAll,
  title = 'Recent transactions'
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeader, {
    title: title,
    action: onViewAll && /*#__PURE__*/React.createElement(PillButton, {
      variant: "ghost",
      size: "sm",
      onClick: onViewAll
    }, t('Ver todas'))
  }), /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 0'
    }
  }, transactions.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '32px 20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-body",
    style: {
      color: 'var(--fg-2)'
    }
  }, t('Sin transacciones todavía.'))) : transactions.map((tx, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      borderTop: i === 0 ? 'none' : undefined
    }
  }, /*#__PURE__*/React.createElement(TxRow, {
    tx: tx,
    hidden: hidden
  }))))));
}
function TransactionsLedger({
  transactions,
  hidden
}) {
  // dense variant with category column, grouped by day header
  const grouped = transactions.reduce((acc, tx) => {
    (acc[tx.day] = acc[tx.day] || []).push(tx);
    return acc;
  }, {});
  const days = Object.keys(grouped);
  return /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, days.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: d
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px 8px',
      borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, t(d))), grouped[d].map((tx, j) => /*#__PURE__*/React.createElement(TxRow, {
    key: j,
    tx: tx,
    hidden: hidden,
    dense: true
  })))));
}
Object.assign(window, {
  RecentTransactions,
  TransactionsLedger,
  TxRow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/RecentTransactions.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/SmartTransactionModal.jsx
try { (() => {
/* ─── Smart Transaction Modal — shell ───────────────────────────────────
 * Wraps the structured TransactionForm with 4 AI input methods:
 *   Escribir (manual form) · Nota de voz · Foto/factura (OCR) · Auto IA (texto)
 * PRO adds a 5th: Carga masiva (bulk dry-run).
 * Voice/Foto/Auto IA produce a prefill that drops into the manual form.
 *
 * Props: open · onClose · initialType · initialTab · mode('lite'|'pro')
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const {
  useState: useSTMState,
  useEffect: useSTMEffect
} = React;
const STM_SYSTEM = `You are a financial transaction parser for OW Finance 2026.
Parse the user's description and return ONLY a valid JSON object:
{ "type":"expense"|"income"|"transfer", "amount":<number>, "currency":"USD"|"EUR"|"VES",
  "merchant":"<name>", "category":"<category>", "confidence":"high"|"medium"|"low" }
Return ONLY the JSON.`;
const STM_VOICE_MOCK = {
  type: 'expense',
  amount: 45.20,
  currency: 'USD',
  merchant: 'Whole Foods Market',
  category: 'Supermercado',
  confidence: 'high'
};
const STM_PHOTO_MOCK = {
  type: 'expense',
  amount: 116.00,
  currency: 'USD',
  merchant: 'Farmatodo',
  category: 'Salud',
  confidence: 'medium',
  items: 3
};

/* Methods */
const STM_METHODS = [{
  id: 'write',
  icon: 'edit_note',
  label: 'Escribir'
}, {
  id: 'voice',
  icon: 'mic',
  label: 'Voz'
}, {
  id: 'photo',
  icon: 'receipt_long',
  label: 'Foto'
}, {
  id: 'autoai',
  icon: 'auto_awesome',
  label: 'Auto IA'
}];
function SmartTransactionModal({
  open,
  onClose,
  initialType = 'expense',
  initialTab = 'write',
  mode = 'pro',
  rates
}) {
  const isLite = mode === 'lite';
  const isMobile = useViewportMobile();
  const normTab = initialTab === 'text' ? 'write' : initialTab;
  const [tab, setTab] = useSTMState(normTab);
  const [prefill, setPrefill] = useSTMState(null);
  const [aiSource, setAiSource] = useSTMState(null);
  const [recording, setRecording] = useSTMState(false);
  const [text, setText] = useSTMState('');
  const [loading, setLoading] = useSTMState(false);
  const [error, setError] = useSTMState(null);
  useSTMEffect(() => {
    if (open) {
      setTab(initialTab === 'text' ? 'write' : initialTab);
      setPrefill(null);
      setAiSource(null);
      setRecording(false);
      setText('');
      setError(null);
    }
  }, [open, initialTab]);
  useSTMEffect(() => {
    if (!open) return;
    const fn = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [open, onClose]);
  if (!open) return null;

  // Both LITE and PRO expose the same 5 input methods.
  const methods = [...STM_METHODS, {
    id: 'bulk',
    icon: 'upload_file',
    label: 'Carga masiva'
  }];
  const toForm = (data, source) => {
    setPrefill(data);
    setAiSource(source);
    setTab('write');
  };
  const startVoice = () => {
    setRecording(true);
    setTimeout(() => {
      setRecording(false);
      toForm(STM_VOICE_MOCK, 'voz');
    }, 2600);
  };
  const analyze = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const raw = await window.claude.complete({
        system: STM_SYSTEM,
        messages: [{
          role: 'user',
          content: text
        }]
      });
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('x');
      toForm(JSON.parse(m[0]), 'texto');
    } catch {
      setError(t('No pude interpretar el texto. Sé más específico con monto y concepto.'));
    }
    setLoading(false);
  };
  const width = isLite ? 560 : 720;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: isMobile ? 'absolute' : 'fixed',
      inset: 0,
      zIndex: 'var(--z-modal)',
      background: 'rgba(10,14,28,0.60)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'flex-start',
      justifyContent: 'center',
      padding: isMobile ? 0 : '4vh 16px',
      overflowY: isMobile ? 'hidden' : 'auto',
      animation: 'stmFade 200ms'
    }
  }, /*#__PURE__*/React.createElement("style", null, `
        @keyframes stmFade { from{opacity:0} to{opacity:1} }
        @keyframes stmRise { from{opacity:0;transform:scale(0.97) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes stmSheet { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes stmPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.14);opacity:0.8} }
        .stm-card{ width:100%; max-width:var(--stm-w); }
      `), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "stm-card",
    style: isMobile ? {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      '--stm-w': 'none',
      boxSizing: 'border-box',
      background: 'var(--surface-1)',
      borderRadius: '22px 22px 0 0',
      padding: '10px 18px calc(20px + env(safe-area-inset-bottom))',
      boxShadow: '0 -10px 40px rgba(0,0,0,0.28)',
      animation: 'stmFade 200ms',
      maxHeight: '92%',
      overflowY: 'auto'
    } : {
      '--stm-w': width + 'px',
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-xl)',
      padding: 26,
      boxShadow: 'var(--shadow-popover)',
      animation: 'stmRise 240ms var(--ease-out)',
      marginBottom: '4vh'
    }
  }, isMobile && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 999,
      background: 'var(--border-hairline)',
      margin: '0 auto 14px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t-eyebrow"
  }, t('Nuevo movimiento'), isLite ? ' · Lite' : ' · Pro'), /*#__PURE__*/React.createElement("div", {
    className: "t-h2",
    style: {
      marginTop: 4
    }
  }, tab === 'bulk' ? t('Carga masiva') : t('¿Qué pasó con tu dinero?'))), /*#__PURE__*/React.createElement(IconButton, {
    icon: "close",
    ariaLabel: "Cerrar",
    onClick: onClose
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 18,
      flexWrap: 'wrap'
    }
  }, methods.map(m => {
    const active = tab === m.id;
    return /*#__PURE__*/React.createElement("button", {
      key: m.id,
      type: "button",
      onClick: () => {
        setTab(m.id);
        setError(null);
      },
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        border: 0,
        cursor: 'pointer',
        borderRadius: 'var(--radius-pill)',
        background: active ? 'var(--brand-primary)' : 'var(--surface-2)',
        color: active ? '#fff' : 'var(--fg-2)',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        transition: 'all 150ms'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 16
      }
    }, m.icon), t(m.label));
  })), tab === 'write' && aiSource && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '10px 13px',
      borderRadius: 'var(--radius-sm)',
      background: 'linear-gradient(90deg, rgba(124,58,237,.10), rgba(14,165,233,.10))',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      color: '#8B5CF6'
    }
  }, "auto_awesome"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: 'var(--font-body)',
      fontSize: 12.5,
      color: 'var(--fg-1)'
    }
  }, t('Pre-rellenado por IA desde'), " ", /*#__PURE__*/React.createElement("strong", null, t(aiSource)), " \xB7 ", t('revisa y confirma')), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setPrefill(null);
      setAiSource(null);
    },
    style: {
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--fg-3)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 16
    }
  }, "close"))), tab === 'write' && /*#__PURE__*/React.createElement(TransactionForm, {
    key: aiSource || 'fresh',
    mode: mode,
    type: prefill?.type || initialType,
    prefill: prefill,
    rates: rates,
    onClose: onClose,
    onSubmit: () => onClose()
  }), tab === 'voice' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      padding: '36px 20px',
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-lg)'
    }
  }, recording ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 76,
      height: 76,
      borderRadius: 38,
      background: 'rgba(239,68,68,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'stmPulse 1s infinite'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 38,
      color: 'var(--expense)'
    }
  }, "mic")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--expense)'
    }
  }, t('Escuchando…')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12.5,
      color: 'var(--fg-2)'
    }
  }, "\"Gast\xE9 45 d\xF3lares en Whole Foods con BofA\"")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: startVoice,
    style: {
      width: 76,
      height: 76,
      borderRadius: 38,
      background: 'var(--brand-primary)',
      border: 0,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 6px 22px rgba(30,58,138,.35)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 38,
      color: '#fff'
    }
  }, "mic")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--fg-1)'
    }
  }, t('Toca para dictar')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12.5,
      color: 'var(--fg-2)',
      textAlign: 'center'
    }
  }, t('Di monto, comercio y cuenta. La IA transcribe y arma el movimiento.')))), tab === 'photo' && /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      border: '2px dashed var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      padding: '40px 20px',
      cursor: 'pointer',
      background: 'var(--surface-2)',
      transition: 'border-color 160ms'
    },
    onMouseEnter: e => e.currentTarget.style.borderColor = 'var(--brand-primary)',
    onMouseLeave: e => e.currentTarget.style.borderColor = 'var(--border-hairline)'
  }, /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    style: {
      display: 'none'
    },
    onChange: e => {
      if (e.target.files[0]) toForm(STM_PHOTO_MOCK, 'foto de factura');
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 46,
      color: 'var(--fg-3)'
    }
  }, "receipt_long"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--fg-1)'
    }
  }, t('Sube o arrastra una factura')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12.5,
      color: 'var(--fg-2)',
      textAlign: 'center'
    }
  }, t('OCR extrae monto, comercio, fecha e ítems')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: 4
    }
  }, ['Monto', 'Comercio', 'Ítems', 'IVA', 'Fecha'].map(c => /*#__PURE__*/React.createElement("span", {
    key: c,
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10.5,
      fontWeight: 600,
      padding: '3px 8px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-1)',
      color: 'var(--fg-2)',
      border: '1px solid var(--border-hairline)'
    }
  }, t(c))))), tab === 'autoai' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    value: text,
    onChange: e => {
      setText(e.target.value);
      setError(null);
    },
    rows: 4,
    placeholder: t("Pega o describe: 'Pagué $730 en VES a 40.5, mercado del mes con Mercantil, categoría supermercado'"),
    style: {
      width: '100%',
      boxSizing: 'border-box',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      color: 'var(--fg-1)',
      background: 'var(--surface-2)',
      resize: 'none',
      outline: 'none',
      lineHeight: 1.55
    },
    onFocus: window.fcFocus,
    onBlur: window.fcBlur
  }), error && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--expense-soft)',
      color: 'var(--expense-fg)',
      fontFamily: 'var(--font-body)',
      fontSize: 13
    }
  }, error), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(PillButton, {
    variant: "ghost",
    onClick: onClose
  }, t('Cancelar')), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: analyze,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      border: 0,
      cursor: 'pointer',
      padding: '12px 22px',
      borderRadius: 'var(--radius-pill)',
      background: 'linear-gradient(90deg,#7C3AED,#2563EB)',
      color: '#fff',
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: 14,
      opacity: loading ? 0.7 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18
    }
  }, "auto_awesome"), loading ? t('Analizando…') : t('Analizar con IA')))), tab === 'bulk' && /*#__PURE__*/React.createElement(BulkImportPanel, {
    onClose: onClose
  })));
}

// Map action IDs → modal config (used by DesktopQuickModal via shells)
const STM_ACTION_MAP = {
  expense: {
    type: 'expense',
    tab: 'write'
  },
  income: {
    type: 'income',
    tab: 'write'
  },
  transfer: {
    type: 'transfer',
    tab: 'write'
  },
  debt: {
    type: 'expense',
    tab: 'write'
  },
  dream: {
    type: 'transfer',
    tab: 'write'
  },
  jar: {
    type: 'transfer',
    tab: 'write'
  },
  voice: {
    type: 'expense',
    tab: 'voice'
  },
  scan: {
    type: 'expense',
    tab: 'photo'
  },
  autoai: {
    type: 'expense',
    tab: 'autoai'
  }
};
Object.assign(window, {
  SmartTransactionModal,
  STM_ACTION_MAP
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/SmartTransactionModal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/organisms/TransactionForm.jsx
try { (() => {
/* ─── TransactionForm — structured manual entry (LITE + PRO) ────────────
 * Real OWFINANCE model: cabecera + payments[] + items[].
 *   LITE  → simple: monto → cántaro → listo (billetera implícita).
 *   PRO   → 8 caminos: simple · transfer · cross-currency · split ·
 *           ítems+impuestos · cántaro por ítem · ajuste · (bulk: panel aparte).
 * Visual-realistic; no hard validation. Shows a live JSON payload preview.
 *
 * Props: mode('lite'|'pro') · type · prefill · rates · onClose · onSubmit
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const {
  useState: useTfState,
  useMemo: useTfMemo
} = React;
function tfMoney(n, sym = '$') {
  const v = Math.abs(Number(n) || 0);
  return `${sym} ${v.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
function TransactionForm({
  mode = 'pro',
  type: initialType = 'expense',
  prefill = null,
  rates,
  onClose,
  onSubmit
}) {
  const isLite = mode === 'lite';
  const RATES = rates || window.DEFAULT_RATES;
  const [type, setType] = useTfState(initialType === 'income' ? 'income' : initialType === 'transfer' ? 'transfer' : initialType === 'ajuste' ? 'ajuste' : 'expense');
  const [concept, setConcept] = useTfState(prefill?.merchant || '');
  const [amount, setAmount] = useTfState(prefill?.amount || '');
  const [currency, setCurrency] = useTfState(prefill?.currency || 'USD');
  const [dateLabel, setDateLabel] = useTfState('Hoy');
  const [categoryId, setCategoryId] = useTfState(null);
  const [jarId, setJarId] = useTfState(isLite ? 'j1' : null);
  const [providerId, setProviderId] = useTfState(null);
  const [accountId, setAccountId] = useTfState(1);
  const [toAccountId, setToAccountId] = useTfState(2);
  const [includeBal, setIncludeBal] = useTfState(true);
  const [showPayload, setShowPayload] = useTfState(false);

  // advanced
  const [splitOn, setSplitOn] = useTfState(false);
  const [itemsOn, setItemsOn] = useTfState(false);
  const [payments, setPayments] = useTfState([{
    accountId: 1,
    amount: '',
    rate: 1
  }, {
    accountId: 4,
    amount: '',
    rate: RATES.VES.current
  }]);
  const [items, setItems] = useTfState([{
    name: '',
    qty: 1,
    amount: '',
    taxId: null,
    jarId: null,
    categoryId: null
  }]);
  // ajuste
  const [targetBalance, setTargetBalance] = useTfState('');
  const accents = {
    expense: 'var(--expense)',
    income: 'var(--income)',
    transfer: '#8B5CF6',
    ajuste: 'var(--warning)'
  };
  const accent = accents[type];

  // ---- option lists ----
  const acc = window.SAMPLE_ACCOUNTS;
  const accountOpts = acc.map(a => ({
    value: a.id,
    label: a.name,
    sub: `${window.t(window.ACCOUNT_TYPES[a.type].label)} · ${a.currency}`,
    color: a.color,
    right: tfMoney(a.balance, window.CURRENCIES[a.currency].symbol)
  }));
  const jarOpts = window.SAMPLE_JARS.map(j => ({
    value: j.id,
    label: window.t(j.name),
    sub: `${j.percent}% · ${window.t('disp.')} ${tfMoney(j.amount)}`,
    color: j.color
  }));
  const catOpts = window.SAMPLE_CATEGORIES.map(c => ({
    value: c.id,
    label: window.t(c.name),
    icon: c.icon
  }));
  const provOpts = [{
    value: null,
    label: window.t('Sin proveedor'),
    icon: 'block'
  }, ...window.SAMPLE_PROVIDERS.map(p => ({
    value: p.id,
    label: p.name,
    icon: 'storefront'
  }))];
  const itemTaxOpts = [{
    value: null,
    label: window.t('Sin impuesto')
  }, ...window.SAMPLE_TAXES.filter(t => t.applies_to !== 'payment').map(t => ({
    value: t.id,
    label: t.name
  }))];
  const selAccount = acc.find(a => a.id === accountId);
  const selTo = acc.find(a => a.id === toAccountId);
  const userSym = window.CURRENCIES.USD.symbol;

  // ---- derived ----
  const itemsTotal = useTfMemo(() => items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.amount) || 0), 0), [items]);
  const splitTotal = useTfMemo(() => payments.reduce((s, p) => s + (Number(p.amount) || 0) / (Number(p.rate) || 1), 0), [payments]);
  const effectiveAmount = itemsOn ? itemsTotal : Number(amount) || 0;

  // cross-currency conversion preview (amount typed in `currency` → USD base)
  const rateForCur = RATES[currency]?.current || 1;
  const usdEquiv = currency === 'USD' ? effectiveAmount : effectiveAmount / rateForCur;

  // transfer cross-currency
  const xferCross = selAccount && selTo && selAccount.currency !== selTo.currency;
  const xferRate = selTo ? (RATES[selTo.currency]?.current || 1) / (RATES[selAccount?.currency]?.current || 1) : 1;
  const xferArrives = (Number(amount) || 0) * xferRate;

  // ajuste diff
  const adjustDiff = (Number(targetBalance) || 0) - (selAccount?.balance || 0);
  const buildPayload = () => {
    const txType = window.TX_TYPES.find(t => t.slug === type);
    const base = {
      name: concept || (type === 'income' ? 'Ingreso' : 'Movimiento'),
      transaction_type_id: txType?.id,
      date: dateLabel === 'Hoy' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : dateLabel,
      include_in_balance: includeBal
    };
    if (isLite) return {
      ...base,
      amount: txType.sign * effectiveAmount,
      jar_id: jarId,
      category_id: categoryId
    };
    if (type === 'transfer') return {
      ...base,
      amount: Number(amount) || 0,
      payments: [{
        account_id: accountId,
        amount: -(Number(amount) || 0),
        rate: 1
      }, {
        account_id: toAccountId,
        amount: xferArrives,
        rate: xferCross ? +xferRate.toFixed(4) : 1
      }]
    };
    if (type === 'ajuste') return {
      name: concept || 'Ajuste manual',
      transaction_type_id: txType?.id,
      account_id: accountId,
      target_balance: Number(targetBalance) || 0,
      include_in_balance: includeBal
    };
    // income / expense
    const sign = type === 'income' ? 1 : -1;
    const pay = splitOn ? payments.map(p => ({
      account_id: p.accountId,
      amount: sign * (Number(p.amount) || 0),
      rate: Number(p.rate) || 1
    })) : [{
      account_id: accountId,
      amount: sign * (currency === selAccount?.currency ? effectiveAmount : effectiveAmount),
      rate: currency === 'USD' ? 1 : rateForCur,
      rate_is_current: currency !== 'USD'
    }];
    const it = itemsOn ? items.map(i => ({
      name: i.name,
      quantity: Number(i.qty) || 1,
      amount: Number(i.amount) || 0,
      tax_id: i.taxId,
      jar_id: i.jarId,
      category_id: i.categoryId
    })) : [{
      name: concept || 'Movimiento',
      amount: effectiveAmount,
      category_id: categoryId,
      jar_id: jarId
    }];
    return {
      ...base,
      amount: sign * effectiveAmount,
      provider_id: providerId,
      category_id: categoryId,
      payments: pay,
      items: it
    };
  };
  const payload = buildPayload();
  const G = 14; // gap
  const isMobile = useViewportMobile();
  const rowDir = isMobile ? 'column' : 'row';

  // ════════════════════════════════ LITE ════════════════════════════════
  if (isLite) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }
    }, /*#__PURE__*/React.createElement(Segmented, {
      value: type === 'income' ? 'income' : 'expense',
      onChange: setType,
      accentMap: accents,
      options: [{
        value: 'expense',
        label: window.t('Gasto'),
        icon: 'arrow_outward'
      }, {
        value: 'income',
        label: window.t('Ingreso'),
        icon: 'arrow_downward'
      }]
    }), /*#__PURE__*/React.createElement(MoneyInput, {
      value: amount,
      onChange: setAmount,
      currency: "USD",
      accent: accent,
      autoFocus: true
    }), type === 'expense' ? /*#__PURE__*/React.createElement(Field, {
      label: t("¿De qué cántaro sale?"),
      required: true
    }, /*#__PURE__*/React.createElement(Picker, {
      value: jarId,
      onChange: setJarId,
      options: jarOpts,
      placeholder: t("Elige un cántaro")
    })) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        padding: '13px 15px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--income-soft)',
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 20,
        color: 'var(--income-fg)'
      }
    }, "auto_awesome"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--income-fg)'
      }
    }, t("Se reparte automáticamente")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: 'var(--fg-2)',
        marginTop: 2
      }
    }, window.SAMPLE_JARS.map(j => `${j.name.split(' ')[0]} ${j.percent}%`).join(' · ')))), /*#__PURE__*/React.createElement(Field, {
      label: t("Concepto (opcional)")
    }, /*#__PURE__*/React.createElement(TextInput, {
      value: concept,
      onChange: setConcept,
      placeholder: t("Ej: Mercado del super"),
      icon: "notes"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: rowDir,
        gap: G
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Fecha",
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(Picker, {
      value: dateLabel,
      onChange: setDateLabel,
      options: [{
        value: 'Hoy',
        label: window.t('Hoy'),
        icon: 'today'
      }, {
        value: 'Ayer',
        label: window.t('Ayer'),
        icon: 'history'
      }, {
        value: 'Personalizada',
        label: window.t('Otra fecha…'),
        icon: 'calendar_month'
      }]
    })), /*#__PURE__*/React.createElement(Field, {
      label: t("Categoría (opcional)"),
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(Picker, {
      value: categoryId,
      onChange: setCategoryId,
      options: [{
        value: null,
        label: window.t('Sin categoría'),
        icon: 'block'
      }, ...catOpts],
      placeholder: t("Categoría")
    }))), /*#__PURE__*/React.createElement(TfFooter, {
      accent: accent,
      onClose: onClose,
      onSubmit: () => onSubmit && onSubmit(payload),
      label: type === 'income' ? t('Registrar ingreso') : t('Registrar gasto')
    }));
  }

  // ════════════════════════════════ PRO ════════════════════════════════
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Segmented, {
    value: type,
    onChange: setType,
    accentMap: accents,
    options: [{
      value: 'expense',
      label: window.t('Gasto'),
      icon: 'arrow_outward'
    }, {
      value: 'income',
      label: window.t('Ingreso'),
      icon: 'arrow_downward'
    }, {
      value: 'transfer',
      label: window.t('Transferir'),
      icon: 'swap_horiz'
    }, {
      value: 'ajuste',
      label: window.t('Ajuste'),
      icon: 'tune'
    }]
  }), type === 'ajuste' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Field, {
    label: t("Cuenta a ajustar"),
    required: true
  }, /*#__PURE__*/React.createElement(Picker, {
    value: accountId,
    onChange: setAccountId,
    options: accountOpts
  })), /*#__PURE__*/React.createElement(Field, {
    label: t('Saldo objetivo'),
    hint: `${t('Saldo actual:')} ${tfMoney(selAccount?.balance, window.CURRENCIES[selAccount?.currency || 'USD'].symbol)}`
  }, /*#__PURE__*/React.createElement(MoneyInput, {
    value: targetBalance,
    onChange: setTargetBalance,
    currency: selAccount?.currency || 'USD',
    accent: accent
  })), targetBalance !== '' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '11px 14px',
      borderRadius: 'var(--radius-sm)',
      background: adjustDiff >= 0 ? 'var(--income-soft)' : 'var(--expense-soft)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      color: adjustDiff >= 0 ? 'var(--income-fg)' : 'var(--expense-fg)'
    }
  }, adjustDiff >= 0 ? 'trending_up' : 'trending_down'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--fg-1)'
    }
  }, t("Se creará un ajuste de"), " ", /*#__PURE__*/React.createElement("strong", null, adjustDiff >= 0 ? '+' : '−', tfMoney(adjustDiff, window.CURRENCIES[selAccount?.currency || 'USD'].symbol)))), /*#__PURE__*/React.createElement(Field, {
    label: t("Motivo")
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: concept,
    onChange: setConcept,
    placeholder: t("Ej: Sincronización con banco"),
    icon: "notes"
  }))), type === 'transfer' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(MoneyInput, {
    value: amount,
    onChange: setAmount,
    currency: selAccount?.currency || 'USD',
    accent: accent,
    autoFocus: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: rowDir,
      gap: G,
      alignItems: isMobile ? 'stretch' : 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: t("Desde (origen)"),
    style: {
      flex: 1
    },
    required: true
  }, /*#__PURE__*/React.createElement(Picker, {
    value: accountId,
    onChange: setAccountId,
    options: accountOpts
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 22,
      color: 'var(--fg-3)'
    }
  }, "arrow_forward")), /*#__PURE__*/React.createElement(Field, {
    label: t("Hacia (destino)"),
    style: {
      flex: 1
    },
    required: true
  }, /*#__PURE__*/React.createElement(Picker, {
    value: toAccountId,
    onChange: setToAccountId,
    options: accountOpts.filter(o => o.value !== accountId)
  }))), xferCross && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '13px 15px',
      borderRadius: 'var(--radius-md)',
      background: 'rgba(139,92,246,0.08)',
      border: '1px solid rgba(139,92,246,0.18)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600,
      color: '#8B5CF6'
    }
  }, t("Cruce de moneda ·"), " ", selAccount.currency, " \u2192 ", selTo.currency), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontSize: 12,
      color: 'var(--fg-2)'
    }
  }, t("tasa"), " ", xferRate.toFixed(2))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-3)'
    }
  }, t('Envías')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 18
    }
  }, tfMoney(amount, window.CURRENCIES[selAccount.currency].symbol))), /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      color: 'var(--fg-3)'
    }
  }, "east"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-3)'
    }
  }, t('Llega')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 18,
      color: '#8B5CF6'
    }
  }, tfMoney(xferArrives, window.CURRENCIES[selTo.currency].symbol))))), /*#__PURE__*/React.createElement(Field, {
    label: t("Concepto (opcional)")
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: concept,
    onChange: setConcept,
    placeholder: t("Ej: Traspaso a ahorros"),
    icon: "notes"
  }))), (type === 'expense' || type === 'income') && /*#__PURE__*/React.createElement(React.Fragment, null, !itemsOn && /*#__PURE__*/React.createElement(MoneyInput, {
    value: amount,
    onChange: setAmount,
    currency: currency,
    onCurrency: setCurrency,
    currencies: ['USD', 'EUR', 'VES'],
    accent: accent,
    autoFocus: true
  }), itemsOn && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      padding: '10px 14px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--fg-2)'
    }
  }, t("Total (suma de ítems)")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 24,
      color: 'var(--fg-1)'
    }
  }, tfMoney(itemsTotal))), !splitOn && currency !== 'USD' && !itemsOn && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '9px 13px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--info-soft)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 17,
      color: 'var(--info-fg)'
    }
  }, "currency_exchange"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12.5,
      color: 'var(--fg-1)'
    }
  }, t("tasa"), " ", currency, " ", rateForCur, " \xB7 \u2248 ", /*#__PURE__*/React.createElement("strong", null, tfMoney(usdEquiv)))), !splitOn ? /*#__PURE__*/React.createElement(Field, {
    label: t("Cuenta de origen"),
    required: true
  }, /*#__PURE__*/React.createElement(Picker, {
    value: accountId,
    onChange: setAccountId,
    options: accountOpts
  })) : /*#__PURE__*/React.createElement(TfPaymentsEditor, {
    payments: payments,
    setPayments: setPayments,
    accountOpts: accountOpts,
    accounts: acc,
    total: splitTotal
  }), !itemsOn && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: rowDir,
      gap: G
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Categor\xEDa",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Picker, {
    value: categoryId,
    onChange: setCategoryId,
    options: [{
      value: null,
      label: window.t('Sin categoría'),
      icon: 'block'
    }, ...catOpts],
    placeholder: t("Categoría")
  })), /*#__PURE__*/React.createElement(Field, {
    label: type === 'income' ? t('Cántaro (opcional)') : t('Cántaro'),
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Picker, {
    value: jarId,
    onChange: setJarId,
    options: [{
      value: null,
      label: type === 'income' ? window.t('Repartir por %') : window.t('Sin cántaro'),
      color: 'transparent'
    }, ...jarOpts],
    placeholder: t("Cántaro")
  }))), itemsOn && /*#__PURE__*/React.createElement(TfItemsEditor, {
    items: items,
    setItems: setItems,
    taxOpts: itemTaxOpts,
    jarOpts: jarOpts,
    catOpts: catOpts
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: rowDir,
      gap: G
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: t("Proveedor"),
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Picker, {
    value: providerId,
    onChange: setProviderId,
    options: provOpts,
    placeholder: t("Proveedor")
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Fecha",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Picker, {
    value: dateLabel,
    onChange: setDateLabel,
    options: [{
      value: 'Hoy',
      label: window.t('Hoy'),
      icon: 'today'
    }, {
      value: 'Ayer',
      label: window.t('Ayer'),
      icon: 'history'
    }, {
      value: 'Personalizada',
      label: window.t('Otra fecha…'),
      icon: 'calendar_month'
    }]
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: rowDir,
      gap: G
    }
  }, /*#__PURE__*/React.createElement(Switch, {
    on: splitOn,
    onChange: setSplitOn,
    icon: "call_split",
    label: t("Pago múltiple"),
    sub: t("Varias cuentas")
  }), /*#__PURE__*/React.createElement(Switch, {
    on: itemsOn,
    onChange: setItemsOn,
    icon: "receipt_long",
    label: t("Detalle / factura"),
    sub: t("Ítems + impuestos")
  })), /*#__PURE__*/React.createElement(Switch, {
    on: includeBal,
    onChange: setIncludeBal,
    icon: "account_balance_wallet",
    label: t("Afecta el saldo"),
    sub: t("Desactiva para movimientos informativos")
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-hairline)',
      paddingTop: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShowPayload(s => !s),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--fg-2)',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 16
    }
  }, showPayload ? 'expand_less' : 'data_object'), showPayload ? t('Ocultar') : t('Ver'), " payload \xB7 POST /api/v1/transactions"), showPayload && /*#__PURE__*/React.createElement("pre", {
    style: {
      marginTop: 10,
      padding: 14,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--ink-base)',
      color: '#A8BCE6',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: 11.5,
      lineHeight: 1.5,
      overflowX: 'auto',
      maxHeight: 220
    }
  }, JSON.stringify(payload, null, 2))), /*#__PURE__*/React.createElement(TfFooter, {
    accent: accent,
    onClose: onClose,
    onSubmit: () => onSubmit && onSubmit(payload),
    label: type === 'transfer' ? t('Registrar transferencia') : type === 'ajuste' ? t('Aplicar ajuste') : type === 'income' ? t('Registrar ingreso') : t('Registrar gasto')
  }));
}

/* ---------- Footer ---------- */
function TfFooter({
  accent,
  onClose,
  onSubmit,
  label
}) {
  const [h, setH] = useTfState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(PillButton, {
    variant: "ghost",
    onClick: onClose
  }, t("Cancelar")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onSubmit,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      border: 0,
      cursor: 'pointer',
      padding: '12px 24px',
      borderRadius: 'var(--radius-pill)',
      background: accent,
      color: '#fff',
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: 14.5,
      filter: h ? 'brightness(0.92)' : 'none',
      transition: 'filter 150ms'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 19
    }
  }, "check"), label));
}

/* ---------- Payments editor (split) ---------- */
function TfPaymentsEditor({
  payments,
  setPayments,
  accountOpts,
  accounts,
  total
}) {
  const upd = (i, k, v) => setPayments(payments.map((p, idx) => idx === i ? {
    ...p,
    [k]: v
  } : p));
  const add = () => setPayments([...payments, {
    accountId: accountOpts[0].value,
    amount: '',
    rate: 1
  }]);
  const rm = i => setPayments(payments.filter((_, idx) => idx !== i));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: 12,
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--fg-2)'
    }
  }, t("Pagos"), " (", payments.length, ")"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--fg-1)'
    }
  }, "\u03A3 \u2248 ", tfMoney(total))), payments.map((p, i) => {
    const a = accounts.find(x => x.id === p.accountId);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1.6
      }
    }, /*#__PURE__*/React.createElement(Picker, {
      value: p.accountId,
      onChange: v => {
        const acct = accounts.find(x => x.id === v);
        upd(i, 'accountId', v);
        upd(i, 'rate', window.DEFAULT_RATES[acct.currency]?.current || 1);
      },
      options: accountOpts
    })), /*#__PURE__*/React.createElement("input", {
      type: "number",
      value: p.amount,
      placeholder: "0.00",
      onChange: e => upd(i, 'amount', e.target.value),
      style: {
        ...window.FC_INPUT_STYLE,
        flex: 1,
        padding: '11px 12px'
      },
      onFocus: window.fcFocus,
      onBlur: window.fcBlur
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        color: 'var(--fg-3)',
        width: 30
      }
    }, a?.currency), payments.length > 1 && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => rm(i),
      style: {
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
        color: 'var(--fg-3)',
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 18
      }
    }, "close")));
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: add,
    style: {
      alignSelf: 'flex-start',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--brand-primary)',
      fontFamily: 'var(--font-body)',
      fontSize: 12.5,
      fontWeight: 600,
      padding: '4px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 16
    }
  }, "add"), t("Añadir cuenta")));
}

/* ---------- Items editor (factura) ---------- */
function TfItemsEditor({
  items,
  setItems,
  taxOpts,
  jarOpts,
  catOpts
}) {
  const upd = (i, k, v) => setItems(items.map((it, idx) => idx === i ? {
    ...it,
    [k]: v
  } : it));
  const add = () => setItems([...items, {
    name: '',
    qty: 1,
    amount: '',
    taxId: null,
    jarId: null,
    categoryId: null
  }]);
  const rm = i => setItems(items.filter((_, idx) => idx !== i));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: 12,
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--fg-2)'
    }
  }, t("Ítems de la factura")), items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      padding: 11,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-1)',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: it.name,
    placeholder: `${t("Ítem")} ${i + 1}`,
    onChange: e => upd(i, 'name', e.target.value),
    style: {
      ...window.FC_INPUT_STYLE,
      flex: 1,
      padding: '9px 11px'
    },
    onFocus: window.fcFocus,
    onBlur: window.fcBlur
  }), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: it.qty,
    onChange: e => upd(i, 'qty', e.target.value),
    title: t("Cantidad"),
    style: {
      ...window.FC_INPUT_STYLE,
      width: 56,
      padding: '9px 8px',
      textAlign: 'center'
    },
    onFocus: window.fcFocus,
    onBlur: window.fcBlur
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--fg-3)',
      fontSize: 13
    }
  }, "\xD7"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: it.amount,
    placeholder: "0.00",
    onChange: e => upd(i, 'amount', e.target.value),
    style: {
      ...window.FC_INPUT_STYLE,
      width: 90,
      padding: '9px 10px'
    },
    onFocus: window.fcFocus,
    onBlur: window.fcBlur
  }), items.length > 1 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => rm(i),
    style: {
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--fg-3)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18
    }
  }, "close"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Picker, {
    value: it.jarId,
    onChange: v => upd(i, 'jarId', v),
    options: [{
      value: null,
      label: window.t('Cántaro'),
      color: 'transparent'
    }, ...jarOpts],
    placeholder: t("Cántaro")
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Picker, {
    value: it.categoryId,
    onChange: v => upd(i, 'categoryId', v),
    options: [{
      value: null,
      label: window.t('Categoría'),
      icon: 'block'
    }, ...catOpts],
    placeholder: t("Categoría")
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Picker, {
    value: it.taxId,
    onChange: v => upd(i, 'taxId', v),
    options: taxOpts,
    placeholder: t("Impuesto")
  }))))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: add,
    style: {
      alignSelf: 'flex-start',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--brand-primary)',
      fontFamily: 'var(--font-body)',
      fontSize: 12.5,
      fontWeight: 600,
      padding: '2px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 16
    }
  }, "add"), t("Añadir ítem")));
}
Object.assign(window, {
  TransactionForm
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/organisms/TransactionForm.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/shells/LiteShell.jsx
try { (() => {
/* global React */
const {
  useState: useShellState
} = React;
const USER = {
  initial: 'J',
  name: 'José',
  greeting: 'Buenas tardes,'
};
function LiteShell() {
  const [route, setRouteRaw] = useShellState(window.__appRoute || 'home');
  const setRoute = r => {
    window.__appRoute = r;
    setRouteRaw(r);
  };
  const [menuOpen, setMenuOpen] = useShellState(false);
  const [notifOpen, setNotifOpen] = useShellState(false);
  const [quickOpen, setQuickOpen] = useShellState(false);
  const [aiOpen, setAIOpen] = useShellState(false);
  const [balanceVisible, setBalanceVisible] = useShellState(true);
  const [currency] = useShellState('USD');
  const hidden = !balanceVisible;
  const [smartOpen, setSmartOpen] = useShellState(false);
  const [smartType, setSmartType] = useShellState('expense');
  const [smartTab, setSmartTab] = useShellState('text');
  const openAI = () => {
    setQuickOpen(false);
    setSmartOpen(false);
    setAIOpen(true);
  };
  const openQuick = () => {
    setAIOpen(false);
    setSmartOpen(false);
    setQuickOpen(true);
  };
  const openSmart = (type = 'expense', tab = 'text') => {
    setSmartType(type);
    setSmartTab(tab);
    setQuickOpen(false);
    setSmartOpen(true);
  };
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": `Lite Desktop · ${route}`,
    style: {
      minHeight: '100vh',
      background: 'var(--bg-canvas)',
      color: 'var(--fg-1)',
      position: 'relative',
      paddingBottom: 140
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(LiteHeader, {
    user: USER,
    currency: currency,
    balanceVisible: balanceVisible,
    onToggleVisibility: () => setBalanceVisible(v => !v),
    onOpenMenu: () => {
      setNotifOpen(false);
      setMenuOpen(o => !o);
    },
    onAvatarClick: () => {
      setNotifOpen(false);
      setMenuOpen(o => !o);
    },
    onOpenNotifications: () => {
      setMenuOpen(false);
      setNotifOpen(o => !o);
    }
  }), /*#__PURE__*/React.createElement(ExpandedMenu, {
    open: menuOpen,
    onClose: () => setMenuOpen(false)
  })), /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      width: '100%',
      padding: '12px 32px 32px',
      boxSizing: 'border-box'
    }
  }, route === 'home' && /*#__PURE__*/React.createElement(HomeRoute, {
    hidden: hidden,
    onQuickAdd: openQuick,
    onGo: setRoute
  }), route === 'transactions' && /*#__PURE__*/React.createElement(TransactionsRoute, {
    hidden: hidden
  }), route === 'analisis' && /*#__PURE__*/React.createElement(AnalisisRoute, {
    hidden: hidden
  }), route === 'jars' && /*#__PURE__*/React.createElement(JarsRoute, {
    hidden: hidden
  }), route === 'dreams' && /*#__PURE__*/React.createElement(DreamsRoute, {
    hidden: hidden
  }), route === 'debts' && /*#__PURE__*/React.createElement(DebtsRoute, {
    hidden: hidden
  }), route === 'config' && /*#__PURE__*/React.createElement(ConfigRoute, null)), /*#__PURE__*/React.createElement(LiteNavPill, {
    active: route,
    onChange: setRoute,
    onQuickAdd: openQuick
  }), /*#__PURE__*/React.createElement(DesktopQuickModal, {
    open: quickOpen,
    onClose: () => setQuickOpen(false),
    onOpenAI: openAI,
    onSelectAction: id => {
      if (id.includes(':')) {
        const [t, tab] = id.split(':');
        openSmart(t, tab);
        return;
      }
      const cfg = STM_ACTION_MAP[id];
      if (cfg) openSmart(cfg.type, cfg.tab);
    },
    mode: "lite"
  }), /*#__PURE__*/React.createElement(SmartTransactionModal, {
    open: smartOpen,
    onClose: () => setSmartOpen(false),
    initialType: smartType,
    initialTab: smartTab,
    mode: "lite"
  }), /*#__PURE__*/React.createElement(AIAdvisorPanel, {
    open: aiOpen,
    onClose: () => setAIOpen(false)
  }), /*#__PURE__*/React.createElement(NotificationsPanel, {
    open: notifOpen,
    onClose: () => setNotifOpen(false),
    accent: "var(--brand-primary)",
    anchorRight: 32
  }));
}
Object.assign(window, {
  LiteShell
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/shells/LiteShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/shells/ProShell.jsx
try { (() => {
/* ─── Pro Desktop Shell — 3-column layout ───────────────────────────────
 * [Sidebar 240px] [Main content flex] [Accounts+Debts panel 280px]
 * Pro primary: cyan (#0EA5E9). Sidebar + AccountsPanel always visible.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const {
  useState: useProState
} = React;
const PRO_NAV = [{
  id: 'home',
  icon: 'home',
  label: 'Inicio'
}, {
  id: 'transactions',
  icon: 'receipt_long',
  label: 'Transacciones'
}, {
  id: 'analisis',
  icon: 'donut_small',
  label: 'Análisis'
}, {
  id: 'jars',
  icon: 'savings',
  label: 'Cántaros'
}, {
  id: 'dreams',
  icon: 'auto_awesome',
  label: 'Sueños'
}, {
  id: 'debts',
  icon: 'credit_card',
  label: 'Deudas'
}, {
  id: 'config',
  icon: 'settings',
  label: 'Configuración'
}];
function ProShell() {
  const [route, setRouteRaw] = useProState(window.__appRoute || 'home');
  const setRoute = r => {
    window.__appRoute = r;
    setRouteRaw(r);
  };
  const [balanceVisible, setBalanceVisible] = useProState(true);
  const [aiOpen, setAIOpen] = useProState(false);
  const [quickOpen, setQuickOpen] = useProState(false);
  const [smartOpen, setSmartOpen] = useProState(false);
  const [smartType, setSmartType] = useProState('expense');
  const [smartTab, setSmartTab] = useProState('text');
  const [rates, setRates] = useProState({
    ...DEFAULT_RATES
  });
  const [notifOpen, setNotifOpen] = useProState(false);
  const hidden = !balanceVisible;
  const isMobile = useViewportMobile();
  const appTheme = useAppTheme();
  const openAI = () => {
    setQuickOpen(false);
    setSmartOpen(false);
    setAIOpen(true);
  };
  const openQuick = () => {
    setAIOpen(false);
    setSmartOpen(false);
    setQuickOpen(true);
  };
  const openSmart = (type = 'expense', tab = 'text') => {
    setSmartType(type);
    setSmartTab(tab);
    setQuickOpen(false);
    setSmartOpen(true);
  };
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "Pro Desktop",
    style: {
      display: 'flex',
      height: '100vh',
      background: 'var(--bg-canvas)',
      overflow: 'hidden',
      position: 'relative'
    }
  }, !isMobile && /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 240,
      flexShrink: 0,
      background: 'var(--surface-1)',
      borderRight: '1px solid var(--border-hairline)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 8px 28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 9,
      background: 'var(--info)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 12,
      color: '#fff',
      letterSpacing: '-0.04em'
    }
  }, "OW")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 14,
      color: 'var(--fg-1)'
    }
  }, "Finance"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--info)',
      padding: '1px 6px',
      background: 'var(--info-soft)',
      borderRadius: 4,
      alignSelf: 'flex-start'
    }
  }, "PRO"))), /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--fg-3)',
      padding: '0 8px',
      marginBottom: 6
    }
  }, t('Menú')), PRO_NAV.map(item => {
    const active = route === item.id;
    return /*#__PURE__*/React.createElement("button", {
      key: item.id,
      onClick: () => setRoute(item.id),
      onMouseEnter: e => {
        if (!active) {
          e.currentTarget.style.background = 'var(--surface-2)';
          e.currentTarget.style.color = 'var(--fg-1)';
        }
      },
      onMouseLeave: e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--fg-2)';
        }
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        border: 0,
        cursor: 'pointer',
        borderRadius: 'var(--radius-sm)',
        background: active ? 'var(--info-soft)' : 'transparent',
        color: active ? 'var(--info)' : 'var(--fg-2)',
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        textAlign: 'left',
        width: '100%',
        transition: 'background 150ms, color 150ms'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 20
      }
    }, item.icon), t(item.label));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-hairline)',
      margin: '12px 0'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: openAI,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 12px',
      border: 0,
      cursor: 'pointer',
      borderRadius: 'var(--radius-sm)',
      background: 'linear-gradient(90deg, rgba(124,58,237,.10) 0%, rgba(14,165,233,.10) 100%)',
      color: '#8B5CF6',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 600,
      textAlign: 'left',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 20
    }
  }, "auto_awesome"), t('Asesor IA'))), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 16,
      borderTop: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px',
      borderRadius: 'var(--radius-sm)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 16,
      background: 'var(--info)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 14,
      flexShrink: 0
    }
  }, "J"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--fg-1)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, "Jos\xE9 Otero"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-2)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, "jose@owfinance.com")), /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 16,
      color: 'var(--fg-3)',
      flexShrink: 0
    }
  }, "more_vert")))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      height: 60,
      flexShrink: 0,
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--surface-1)',
      borderBottom: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 18,
      color: 'var(--fg-1)'
    }
  }, t(PRO_NAV.find(n => n.id === route)?.label) || t('Inicio')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: openQuick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 20px',
      border: 0,
      cursor: 'pointer',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--info)',
      color: '#fff',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 14,
      boxShadow: '0 4px 14px rgba(14,165,233,.30)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18
    }
  }, "add"), t('Agregar')), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 22,
      background: 'var(--border-hairline)',
      margin: '0 2px',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: balanceVisible ? 'visibility' : 'visibility_off',
    ariaLabel: "Ocultar saldos",
    onClick: () => setBalanceVisible(v => !v)
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: appTheme === 'dark' ? 'light_mode' : 'dark_mode',
    ariaLabel: appTheme === 'dark' ? 'Modo claro' : 'Modo oscuro',
    onClick: () => window.toggleAppTheme && window.toggleAppTheme()
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "notifications",
    ariaLabel: "Notificaciones",
    onClick: () => setNotifOpen(o => !o)
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      background: 'var(--expense)',
      boxShadow: '0 0 0 2px var(--surface-1)'
    }
  })))), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '24px 24px 80px',
      boxSizing: 'border-box'
    }
  }, isMobile && route === 'home' && /*#__PURE__*/React.createElement(Card, {
    style: {
      marginBottom: 16,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement(AccountsPanel, {
    hidden: hidden,
    rates: rates,
    mobile: true
  })), route === 'home' && /*#__PURE__*/React.createElement(ProHomeRoute, {
    hidden: hidden,
    onQuickAdd: openQuick,
    onGo: setRoute,
    onOpenAI: openAI
  }), route === 'transactions' && /*#__PURE__*/React.createElement(TransactionsRoute, {
    hidden: hidden
  }), route === 'analisis' && /*#__PURE__*/React.createElement(ProAnalisisRoute, {
    hidden: hidden
  }), route === 'jars' && /*#__PURE__*/React.createElement(JarsRoute, {
    hidden: hidden
  }), route === 'dreams' && /*#__PURE__*/React.createElement(DreamsRoute, {
    hidden: hidden
  }), route === 'debts' && /*#__PURE__*/React.createElement(DebtsRoute, {
    hidden: hidden
  }), route === 'config' && /*#__PURE__*/React.createElement(ConfigRoute, {
    rates: rates,
    onRatesChange: setRates
  }))), !isMobile && /*#__PURE__*/React.createElement(AccountsPanel, {
    hidden: hidden,
    rates: rates
  }), isMobile && /*#__PURE__*/React.createElement(MobileTabBar, {
    items: [{
      id: 'home',
      icon: 'home',
      label: 'Inicio'
    }, {
      id: 'transactions',
      icon: 'receipt_long',
      label: 'Movs'
    }, {
      id: 'analisis',
      icon: 'donut_small',
      label: 'Análisis'
    }, {
      id: 'jars',
      icon: 'savings',
      label: 'Cántaros'
    }, {
      id: 'dreams',
      icon: 'auto_awesome',
      label: 'Sueños'
    }, {
      id: 'debts',
      icon: 'credit_card',
      label: 'Deudas'
    }, {
      id: 'config',
      icon: 'settings',
      label: 'Ajustes'
    }],
    active: route,
    onChange: setRoute,
    onQuickAdd: openQuick,
    accent: "var(--info)"
  }), /*#__PURE__*/React.createElement(DesktopQuickModal, {
    open: quickOpen,
    onClose: () => setQuickOpen(false),
    onOpenAI: openAI,
    onSelectAction: id => {
      if (id.includes(':')) {
        const [t, tab] = id.split(':');
        openSmart(t, tab);
        return;
      }
      const cfg = STM_ACTION_MAP[id];
      if (cfg) openSmart(cfg.type, cfg.tab);
    },
    mode: "pro"
  }), /*#__PURE__*/React.createElement(SmartTransactionModal, {
    open: smartOpen,
    onClose: () => setSmartOpen(false),
    initialType: smartType,
    initialTab: smartTab,
    mode: "pro",
    rates: rates
  }), /*#__PURE__*/React.createElement(AIAdvisorPanel, {
    open: aiOpen,
    onClose: () => setAIOpen(false)
  }), /*#__PURE__*/React.createElement(NotificationsPanel, {
    open: notifOpen,
    onClose: () => setNotifOpen(false),
    accent: "var(--info)",
    anchorRight: 24,
    anchorTop: 60
  }));
}
Object.assign(window, {
  ProShell
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/shells/ProShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/templates/AnalisisRoute.jsx
try { (() => {
/* global React, AN_TOTAL, AN_BUDGET */
/* ─── Lite · Análisis route — "¿En qué se fue?" (enfocado) ──────────────── */

function AnalisisRoute({
  hidden
}) {
  const ACCENT = 'var(--brand-primary)';
  const card = {
    background: 'var(--surface-1)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)',
    padding: 22,
    marginBottom: 18
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 780,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(AnPeriodNav, {
    accent: ACCENT,
    simple: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: ACCENT,
      marginBottom: 10
    }
  }, t('En qué se fue')), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-float)',
      padding: 28,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: 'var(--fg-2)'
    }
  }, t('En'), " ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--fg-1)'
    }
  }, "junio"), " ", t('hiciste'), " ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--fg-1)'
    }
  }, "29 ", t('movimientos')), ". ", t('Gastaste')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 60,
      letterSpacing: '-.02em',
      lineHeight: 1.05,
      margin: '8px 0 14px',
      color: 'var(--expense-fg)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--fg-3)',
      fontSize: 30
    }
  }, "$"), hidden ? '••••' : '162.26'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 13px',
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 600,
      background: 'var(--income-soft)',
      color: 'var(--income-fg)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 17
    }
  }, "trending_down"), "18% ", t('menos que mayo')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--fg-2)'
    }
  }, t('Ingresos del mes'), " \xB7 ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--income-fg)',
      fontFamily: 'var(--font-money)'
    }
  }, "$17.79M")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(AnUnassigned, null)), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-h3"
  }, t('¿En qué se fue?')), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--fg-2)',
      fontSize: 12.5,
      margin: '3px 0 18px'
    }
  }, t('Tu gasto del mes, por cántaro.')), /*#__PURE__*/React.createElement(AnDonutLegend, {
    size: 200
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(AnInsight, {
    icon: "bolt"
  }, t('El'), " ", /*#__PURE__*/React.createElement("b", null, "57%"), " ", t('de tu gasto fue en'), " ", /*#__PURE__*/React.createElement("b", null, "Necesidades b\xE1sicas"), " ", t('y'), " ", /*#__PURE__*/React.createElement("b", null, "Ocio / Diversi\xF3n"), ". ", t('Ahí está el foco si quieres mover la aguja.'))), /*#__PURE__*/React.createElement("div", {
    style: card
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-h3"
  }, t('Tu presupuesto')), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--fg-2)',
      fontSize: 12.5,
      margin: '3px 0 18px'
    }
  }, t('Cómo vas contra lo que asignaste este mes.')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: '50%',
      flex: '0 0 auto',
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 12,
      color: ACCENT,
      background: `conic-gradient(${ACCENT} 184deg, var(--surface-3) 0)`,
      boxShadow: 'inset 0 0 0 4px var(--surface-2)'
    }
  }, "51%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5
    }
  }, t('Vas al'), " ", /*#__PURE__*/React.createElement("b", null, "51%"), " ", t('de lo asignado'), " ($162.26 ", t('de'), " $267.00). ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--expense-fg)'
    }
  }, "Donaciones"), " ", t('ya se pasó del límite.')))));
}
Object.assign(window, {
  AnalisisRoute
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/templates/AnalisisRoute.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/templates/ConfigRoute.jsx
try { (() => {
/* global React */
const {
  useState: useCfgState
} = React;
const CONFIG_GROUPS = [{
  label: 'Cuenta',
  items: [{
    icon: 'person',
    label: 'Perfil',
    hint: 'José Otero · jose@owfinance.com'
  }, {
    icon: 'savings',
    label: 'Cuentas vinculadas',
    hint: '3 tarjetas · 2 bancos'
  }, {
    icon: 'receipt_long',
    label: 'Exportar datos',
    hint: 'CSV, PDF'
  }]
}, {
  label: 'Visualización',
  items: [{
    icon: 'visibility',
    label: 'Ocultar saldos por defecto',
    toggle: 'hideBal',
    value: false
  }, {
    icon: 'settings',
    label: 'Divisa predeterminada',
    hint: 'USD',
    chevron: true
  }, {
    icon: 'home',
    label: 'Pantalla de inicio',
    hint: 'Inicio',
    chevron: true
  }]
}, {
  label: 'Notificaciones',
  items: [{
    icon: 'notifications',
    label: 'Resumen semanal',
    toggle: 'weekDigest',
    value: true
  }, {
    icon: 'notifications',
    label: 'Alertas de dinero ocioso',
    toggle: 'idleAlerts',
    value: true
  }, {
    icon: 'notifications',
    label: 'Alerta de sobrepresupuesto',
    toggle: 'overBudget',
    value: false
  }]
}, {
  label: '',
  items: [{
    icon: 'close',
    label: 'Cerrar sesión',
    destructive: true
  }]
}];
function ConfigRoute({
  rates = {},
  onRatesChange
}) {
  const initToggles = {};
  CONFIG_GROUPS.forEach(g => g.items.forEach(it => {
    if (it.toggle) initToggles[it.toggle] = it.value;
  }));
  const [toggles, setToggles] = useCfgState(initToggles);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      maxWidth: 720,
      margin: '0 auto',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, t("Configuración")), /*#__PURE__*/React.createElement("h1", {
    className: "t-h1",
    style: {
      margin: '6px 0 0'
    }
  }, t('Preferencias'))), /*#__PURE__*/React.createElement(AppPrefsSection, null), onRatesChange && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, t("Tasas de cambio")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-2)',
      fontStyle: 'italic'
    }
  }, t("· Ingresa manualmente · se aplican en todo Pro"))), /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, /*#__PURE__*/React.createElement(ExchangeRatesWidget, {
    rates: rates,
    onChange: onRatesChange
  }))), CONFIG_GROUPS.map((group, gi) => /*#__PURE__*/React.createElement("div", {
    key: gi
  }, group.label && /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 10
    }
  }, t(group.label)), /*#__PURE__*/React.createElement(Card, {
    padding: 0,
    style: {
      marginTop: group.label ? 10 : 0
    }
  }, group.items.map((item, ii) => /*#__PURE__*/React.createElement(ConfigRow, {
    key: ii,
    item: item,
    first: ii === 0,
    value: item.toggle ? toggles[item.toggle] : undefined,
    onToggle: item.toggle ? () => setToggles(s => ({
      ...s,
      [item.toggle]: !s[item.toggle]
    })) : undefined
  }))))));
}
function ConfigRow({
  item,
  first,
  value,
  onToggle
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onToggle,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 18px',
      borderTop: first ? 'none' : '1px solid var(--border-hairline)',
      cursor: item.toggle || item.chevron ? 'pointer' : 'default'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 20,
      color: item.destructive ? 'var(--expense)' : 'var(--fg-2)',
      flexShrink: 0
    }
  }, item.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 500,
      color: item.destructive ? 'var(--expense-fg)' : 'var(--fg-1)'
    }
  }, t(item.label)), item.hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--fg-2)'
    }
  }, t(item.hint))), item.toggle && /*#__PURE__*/React.createElement(Toggle, {
    on: value
  }), item.chevron && !item.toggle && /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      color: 'var(--fg-3)'
    }
  }, "chevron_right"));
}
function Toggle({
  on
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 22,
      borderRadius: 999,
      background: on ? 'var(--brand-primary)' : 'var(--surface-3)',
      position: 'relative',
      transition: 'background 180ms',
      flexShrink: 0,
      display: 'inline-block'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: on ? 16 : 2,
      width: 18,
      height: 18,
      borderRadius: 999,
      background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,.20)',
      transition: 'left var(--dur-base) var(--ease-out)'
    }
  }));
}

/* ─── App preferences: mode · language · device ─────────────────────────── */
function AppPrefsSection() {
  const isMobile = useViewportMobile();
  // local mirrors of global state — bump to force re-read after global setters
  const [, force] = useCfgState(0);
  const mode = window.getMode && window.getMode() || 'lite';
  const lang = window.I18N && window.I18N.lang || 'es';
  const device = window.getDevice && window.getDevice() || 'desktop';
  const accent = mode === 'pro' ? 'var(--info)' : 'var(--brand-primary)';
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 10
    }
  }, t('Aplicación')), /*#__PURE__*/React.createElement(Card, {
    padding: 0,
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 18px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 20,
      color: 'var(--fg-2)',
      flexShrink: 0
    }
  }, "tune"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 140,
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--fg-1)'
    }
  }, t('Modo de la app')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--fg-2)'
    }
  }, mode === 'pro' ? t('Pro · panel completo multi-cuenta') : t('Lite · simple y enfocado'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-pill)',
      padding: 3,
      gap: 2,
      flexShrink: 0
    }
  }, [['lite', 'Lite'], ['pro', 'Pro']].map(([id, label]) => {
    const on = mode === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => {
        window.setMode && window.setMode(id);
        force(n => n + 1);
      },
      style: {
        border: 0,
        cursor: 'pointer',
        padding: '7px 18px',
        borderRadius: 'var(--radius-pill)',
        background: on ? id === 'pro' ? 'var(--info)' : 'var(--brand-primary)' : 'transparent',
        color: on ? '#fff' : 'var(--fg-2)',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: on ? 600 : 500,
        transition: 'background 150ms, color 150ms'
      }
    }, label);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-hairline)'
    }
  }), /*#__PURE__*/React.createElement(PrefDropdown, {
    icon: "language",
    label: t('Idioma'),
    hint: t('Interfaz y formatos'),
    value: lang,
    accent: accent,
    options: [['es', 'Español'], ['en', 'English']],
    onChange: v => {
      window.setLang && window.setLang(v);
      force(n => n + 1);
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-hairline)'
    }
  }), /*#__PURE__*/React.createElement(PrefDropdown, {
    icon: "devices",
    label: t('Vista previa'),
    hint: t('Tamaño de pantalla'),
    value: device,
    accent: accent,
    options: [['desktop', t('PC')], ['tablet', t('Tablet')], ['mobile', t('Celular')]],
    onChange: v => {
      window.setDevice && window.setDevice(v);
      force(n => n + 1);
    }
  })));
}
function PrefDropdown({
  icon,
  label,
  hint,
  value,
  options,
  onChange,
  accent
}) {
  const [open, setOpen] = useCfgState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    const tmo = setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      clearTimeout(tmo);
    };
  }, [open]);
  const current = options.find(([id]) => id === value);
  const currentLabel = current ? current[1] : value;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 18px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 20,
      color: 'var(--fg-2)',
      flexShrink: 0
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--fg-1)'
    }
  }, label), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--fg-2)'
    }
  }, hint)), /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    "aria-haspopup": "listbox",
    "aria-expanded": open,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      border: '1px solid var(--border-hairline)',
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-1)',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--fg-1)',
      minWidth: 120,
      justifyContent: 'space-between'
    }
  }, currentLabel, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      color: 'var(--fg-3)',
      transform: open ? 'rotate(180deg)' : 'none',
      transition: 'transform 150ms'
    }
  }, "expand_more")), open && /*#__PURE__*/React.createElement("div", {
    role: "listbox",
    style: {
      position: 'absolute',
      top: 'calc(100% + 6px)',
      right: 0,
      minWidth: 160,
      zIndex: 'var(--z-popover)',
      background: 'var(--surface-1)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-popover)',
      overflow: 'hidden',
      padding: 4
    }
  }, options.map(([id, lbl]) => {
    const on = id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      role: "option",
      "aria-selected": on,
      onClick: () => {
        onChange(id);
        setOpen(false);
      },
      style: {
        width: '100%',
        textAlign: 'left',
        border: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '9px 12px',
        borderRadius: 'var(--radius-sm)',
        background: on ? 'var(--surface-2)' : 'transparent',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: on ? 600 : 500,
        color: 'var(--fg-1)'
      },
      onMouseEnter: e => {
        if (!on) e.currentTarget.style.background = 'var(--surface-2)';
      },
      onMouseLeave: e => {
        if (!on) e.currentTarget.style.background = 'transparent';
      }
    }, lbl, on && /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 18,
        color: accent
      }
    }, "check"));
  }))));
}
Object.assign(window, {
  ConfigRoute
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/templates/ConfigRoute.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/templates/DebtsRoute.jsx
try { (() => {
/* global React */

function DebtsRoute({
  hidden
}) {
  const total = SAMPLE_DEBTS.reduce((s, d) => s + d.balance, 0);
  const monthly = SAMPLE_DEBTS.reduce((s, d) => s + (d.nextDueAmount || 0), 0);
  const lateCount = SAMPLE_DEBTS.filter(d => d.status === 'late').length;
  const casheaCount = SAMPLE_DEBTS.filter(d => d.provider === 'cashea').length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 28
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, t("Deudas y planes de pago")), /*#__PURE__*/React.createElement("h1", {
    className: "t-h1",
    style: {
      margin: '6px 0 0'
    }
  }, t('Mantén el control de lo que debes'))), /*#__PURE__*/React.createElement(Card, {
    hero: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 24,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, t("Total pendiente · USD")), /*#__PURE__*/React.createElement(Money, {
    value: total,
    className: "t-hero-amount",
    hidden: hidden,
    color: "var(--expense)"
  }), /*#__PURE__*/React.createElement("div", {
    className: "t-body-sm"
  }, SAMPLE_DEBTS.length, " ", t("planes activos ·"), " ", casheaCount, " ", t("en Cashea ·"), lateCount > 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--expense)',
      fontWeight: 600
    }
  }, " ", lateCount, " ", t("atrasada"), lateCount > 1 ? 's' : '') : /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--income)',
      fontWeight: 600
    }
  }, " ", t("todo al día"))), /*#__PURE__*/React.createElement("div", {
    className: "t-body-sm",
    style: {
      marginTop: 4
    }
  }, t("Próximas cuotas (30 días):"), " ", /*#__PURE__*/React.createElement("strong", {
    className: "tabular",
    style: {
      color: 'var(--fg-1)'
    }
  }, "$", monthly.toFixed(2)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(PillButton, {
    variant: "secondary",
    icon: "payments"
  }, t("Pagar cuota")), /*#__PURE__*/React.createElement(PillButton, {
    variant: "primary",
    icon: "add"
  }, t("Nuevo plan"))))), /*#__PURE__*/React.createElement(DebtsFullList, {
    debts: SAMPLE_DEBTS,
    hidden: hidden
  }));
}
Object.assign(window, {
  DebtsRoute
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/templates/DebtsRoute.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/templates/DreamsRoute.jsx
try { (() => {
/* global React */

function DreamsRoute({
  hidden
}) {
  const totalSaved = SAMPLE_DREAMS.reduce((s, d) => s + d.amount, 0);
  const totalGoal = SAMPLE_DREAMS.reduce((s, d) => s + d.goal, 0);
  const overallProgress = Math.round(totalSaved / totalGoal * 100);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 28
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, t("Sueños")), /*#__PURE__*/React.createElement("h1", {
    className: "t-h1",
    style: {
      margin: '6px 0 0'
    }
  }, t('Lo que estás construyendo'))), /*#__PURE__*/React.createElement(Card, {
    hero: true,
    style: {
      background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(236,72,153,0.06) 100%)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 24,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, t("Total acumulado · USD")), /*#__PURE__*/React.createElement(Money, {
    value: totalSaved,
    className: "t-hero-amount",
    hidden: hidden,
    color: "#8B5CF6"
  }), /*#__PURE__*/React.createElement("div", {
    className: "t-body-sm"
  }, SAMPLE_DREAMS.length, " ", t("sueños activos · meta combinada"), ' ', /*#__PURE__*/React.createElement("strong", {
    className: "tabular",
    style: {
      color: 'var(--fg-1)'
    }
  }, "$", totalGoal.toLocaleString('en-US')), ' ', "\xB7 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#8B5CF6',
      fontWeight: 600
    }
  }, overallProgress, "% ", t("del camino")))), /*#__PURE__*/React.createElement(PillButton, {
    variant: "primary",
    icon: "add"
  }, t("Nuevo sueño")))), /*#__PURE__*/React.createElement(DreamsFullGrid, {
    dreams: SAMPLE_DREAMS,
    hidden: hidden
  }));
}
Object.assign(window, {
  DreamsRoute
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/templates/DreamsRoute.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/templates/HomeRoute.jsx
try { (() => {
/* global React */

function HomeRoute({
  hidden,
  onQuickAdd,
  onGo
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement(HeroBalance, {
    amount: 12480.50,
    currency: "USD",
    hidden: hidden,
    onQuickAdd: onQuickAdd,
    asOf: "hoy, 2:42 PM",
    delta: {
      value: 4.2,
      label: 'vs. mes ant.'
    }
  }), /*#__PURE__*/React.createElement(JarsPreview, {
    jars: SAMPLE_JARS,
    hidden: hidden,
    onViewAll: () => onGo('jars')
  }), /*#__PURE__*/React.createElement(DreamsPreview, {
    dreams: SAMPLE_DREAMS,
    hidden: hidden,
    onViewAll: () => onGo('dreams')
  }), /*#__PURE__*/React.createElement(DebtsPreview, {
    debts: SAMPLE_DEBTS,
    hidden: hidden,
    onViewAll: () => onGo('debts')
  }), /*#__PURE__*/React.createElement(RecentTransactions, {
    transactions: SAMPLE_TX.slice(0, 5),
    hidden: hidden,
    onViewAll: () => onGo('transactions')
  }));
}
Object.assign(window, {
  HomeRoute
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/templates/HomeRoute.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/templates/JarsRoute.jsx
try { (() => {
/* global React */

function JarsRoute({
  hidden
}) {
  const total = SAMPLE_JARS.reduce((s, j) => s + j.amount, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 28
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, t("Cántaros")), /*#__PURE__*/React.createElement("h1", {
    className: "t-h1",
    style: {
      margin: '6px 0 0'
    }
  }, t('Tu dinero, repartido'))), /*#__PURE__*/React.createElement(Card, {
    hero: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 24,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, t("Total en cántaros · USD")), /*#__PURE__*/React.createElement(Money, {
    value: total,
    className: "t-hero-amount",
    hidden: hidden
  }), /*#__PURE__*/React.createElement("div", {
    className: "t-body-sm"
  }, SAMPLE_JARS.length, " ", t("cántaros activos · 1 requiere atención"))), /*#__PURE__*/React.createElement(PillButton, {
    variant: "primary",
    icon: "add"
  }, t("Nuevo cántaro")))), /*#__PURE__*/React.createElement(JarsFullGrid, {
    jars: SAMPLE_JARS,
    hidden: hidden
  }));
}
Object.assign(window, {
  JarsRoute
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/templates/JarsRoute.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/templates/ProAnalisisRoute.jsx
try { (() => {
/* global React, AN_TOTAL */
/* ─── Pro · Análisis route — "Navegador financiero" (dirección Mezcla) ──── */

function ProAnalisisRoute({
  hidden
}) {
  const isMobile = useViewportMobile();
  const ACCENT = 'var(--info)';
  const card = {
    background: 'var(--surface-1)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)',
    padding: 22
  };
  const head = (title, hint) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-h3",
    style: {
      flex: 1,
      minWidth: 0
    }
  }, t(title)), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--fg-2)',
      fontSize: 12.5,
      flexShrink: 0,
      whiteSpace: 'nowrap',
      paddingTop: 3
    }
  }, t(hint)));
  const desc = txt => /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--fg-2)',
      fontSize: 12.5,
      margin: '2px 0 16px'
    }
  }, t(txt));
  const field = (label, value, icon = 'expand_more') => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: 'var(--fg-2)'
    }
  }, t(label)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      padding: '10px 12px',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-1)',
      fontSize: 13,
      color: 'var(--fg-1)',
      cursor: 'pointer'
    }
  }, t(value), /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      color: 'var(--fg-3)'
    }
  }, icon)));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(AnPeriodNav, {
    accent: ACCENT
  }), /*#__PURE__*/React.createElement(AnJarStrip, null), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 0 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: ACCENT
    }
  }, t('Analítica de gastos')), /*#__PURE__*/React.createElement("h1", {
    className: "t-h1",
    style: {
      margin: '6px 0 0'
    }
  }, t('Navegador financiero'))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(AnUnassigned, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 24,
      flexWrap: 'wrap',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--fg-2)',
      marginBottom: 4
    }
  }, t('En'), " ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--fg-1)'
    }
  }, "junio 2026"), " ", t('registraste'), " ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--fg-1)'
    }
  }, "29 ", t('movimientos')), ". ", t('Gastaste')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 44,
      letterSpacing: '-.02em'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--fg-3)',
      fontSize: 22
    }
  }, "$"), "162.26")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 600,
      background: 'var(--income-soft)',
      color: 'var(--income-fg)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 17
    }
  }, "trending_down"), "18% ", t('menos que mayo')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--fg-2)'
    }
  }, t('Ingresos del periodo'), " \xB7 ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--income-fg)',
      fontFamily: 'var(--font-money)'
    }
  }, "$17.79M")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(AnKpis, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '280px 1fr 340px',
      gap: 20,
      alignItems: 'start'
    }
  }, !isMobile && /*#__PURE__*/React.createElement("aside", {
    style: {
      position: 'sticky',
      top: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...card,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-h3",
    style: {
      marginBottom: 2
    }
  }, t('Vista')), desc('Agrupa y filtra como prefieras.'), field('Agrupación principal', 'Cántaro › Categoría › Transacción'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      padding: '10px 12px',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-1)',
      fontSize: 13,
      color: 'var(--fg-3)',
      cursor: 'pointer'
    }
  }, t('Buscar concepto, categoría o cuenta'), /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      color: 'var(--fg-3)'
    }
  }, "search"))), field('Filtrar por cántaro', 'Todos'), field('Filtrar por categoría', 'Todas'), field('Filtrar por cuenta', 'Todas'), field('Filtrar por tipo', 'Todos'), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-hairline)',
      margin: '14px 0'
    }
  }), /*#__PURE__*/React.createElement("button", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 13,
      color: 'var(--fg-2)',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      color: ACCENT,
      fontSize: 18
    }
  }, "filter_alt_off"), t('Limpiar filtros')))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, head('Distribución por cántaro', 'Gastos · Junio 2026'), desc('Pasa por la leyenda para enfocar un cántaro.'), /*#__PURE__*/React.createElement(AnDonutLegend, null)), /*#__PURE__*/React.createElement("div", {
    style: card
  }, head('Top cántaros', 'Toca para ver movimientos'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(AnTopList, null)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, head('Asignado vs gastado'), desc('Lo planificado contra lo consumido.'), /*#__PURE__*/React.createElement(AnBudget, null)), /*#__PURE__*/React.createElement(AnInsight, {
    icon: "warning"
  }, /*#__PURE__*/React.createElement("b", null, "Donaciones"), " ", t('superó su presupuesto'), ": $26.17 / $20.00 (131%)."))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: card
  }, head('Detalle agrupado', 'Moneda base: USD'), desc('Haz click en cualquier transacción para abrir la edición completa.'), /*#__PURE__*/React.createElement(AnDetalle, null))));
}
Object.assign(window, {
  ProAnalisisRoute
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/templates/ProAnalisisRoute.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/templates/ProHomeRoute.jsx
try { (() => {
/* ─── Pro Home Route ─────────────────────────────────────────────────────
 * Denser dashboard for Pro mode: KPI strip + spending breakdown +
 * full jars grid + dense transactions list.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

function ProHomeRoute({
  hidden,
  onQuickAdd,
  onGo,
  onOpenAI
}) {
  const isMobile = useViewportMobile();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      gap: isMobile ? 12 : 16
    }
  }, [{
    label: window.t('Disponible'),
    value: 12480.50,
    icon: 'account_balance',
    color: 'var(--info)',
    delta: '+4.2%'
  }, {
    label: window.t('Ingresos · mes'),
    value: 4820.00,
    icon: 'arrow_downward',
    color: 'var(--income)',
    delta: '+8.1%'
  }, {
    label: window.t('Gastos · mes'),
    value: -2360.50,
    icon: 'arrow_outward',
    color: 'var(--expense)',
    delta: '-2.3%'
  }, {
    label: window.t('Tasa de ahorro'),
    value: null,
    text: '42%',
    icon: 'trending_up',
    color: 'var(--income)',
    delta: window.t('Meta: 40%')
  }].map((kpi, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: 'var(--info-soft)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      color: kpi.color
    }
  }, kpi.icon)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      color: i < 3 ? kpi.delta.startsWith('+') ? 'var(--income-fg)' : 'var(--expense-fg)' : 'var(--income-fg)',
      background: i < 3 ? kpi.delta.startsWith('+') ? 'var(--income-soft)' : 'var(--expense-soft)' : 'var(--income-soft)',
      padding: '3px 8px',
      borderRadius: 'var(--radius-pill)'
    }
  }, kpi.delta)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "t-eyebrow",
    style: {
      marginBottom: 4
    }
  }, kpi.label), kpi.text ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontSize: 28,
      fontWeight: 700,
      color: 'var(--fg-1)'
    }
  }, hidden ? '••%' : kpi.text) : /*#__PURE__*/React.createElement(Money, {
    value: kpi.value,
    className: "t-amount-lg",
    hidden: hidden,
    color: kpi.value < 0 ? 'var(--expense-fg)' : 'var(--fg-1)'
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(SectionHeader, {
    title: t("Gastos por categoría"),
    action: /*#__PURE__*/React.createElement(PillButton, {
      variant: "ghost",
      size: "sm"
    }, t("Ver análisis"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      marginTop: 8
    }
  }, [[window.t('Vivienda'), 1450.00, 61], [window.t('Supermercado'), 268.42, 11], [window.t('Transporte'), 32.60, 2], [window.t('Entretenimiento'), 16.99, 1], [window.t('Cántaros'), 200.00, 8]].map(([cat, amt, pct]) => /*#__PURE__*/React.createElement("div", {
    key: cat,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--fg-1)',
      width: 110,
      flexShrink: 0
    }
  }, cat), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      background: 'var(--surface-2)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${pct * 1.5}%`,
      background: 'var(--info)',
      borderRadius: 3
    }
  })), /*#__PURE__*/React.createElement(Money, {
    value: -amt,
    className: "t-amount-sm",
    hidden: hidden,
    color: "var(--expense-fg)"
  }))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(SectionHeader, {
    title: t("Cántaros"),
    action: /*#__PURE__*/React.createElement(PillButton, {
      variant: "ghost",
      size: "sm",
      onClick: () => onGo('jars')
    }, t("Ver todos"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginTop: 8
    }
  }, SAMPLE_JARS.map(j => {
    const bar = j.tone === 'warn' ? 'var(--warning)' : j.tone === 'income' ? 'var(--income)' : 'var(--info)';
    return /*#__PURE__*/React.createElement("div", {
      key: j.name,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--fg-1)',
        width: 130,
        flexShrink: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, t(j.name)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 5,
        borderRadius: 3,
        background: 'var(--surface-2)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: `${j.progress}%`,
        background: bar,
        borderRadius: 3
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        color: 'var(--fg-2)',
        width: 26,
        textAlign: 'right'
      }
    }, j.progress, "%"), /*#__PURE__*/React.createElement(Money, {
      value: j.amount,
      className: "t-amount-sm",
      hidden: hidden
    }));
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHeader, {
    title: t("Movimientos recientes"),
    action: /*#__PURE__*/React.createElement(PillButton, {
      variant: "ghost",
      size: "sm",
      onClick: () => onGo('transactions')
    }, t("Ver todos"))
  }), /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, SAMPLE_TX.slice(0, 6).map((tx, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto auto',
      gap: 14,
      alignItems: 'center',
      padding: '11px 20px',
      borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 17,
      background: tx.amount > 0 ? 'var(--income-soft)' : 'var(--expense-soft)',
      color: tx.amount > 0 ? 'var(--income-fg)' : 'var(--expense-fg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 16
    }
  }, tx.amount > 0 ? 'arrow_downward' : 'arrow_outward')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--fg-1)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, t(tx.label)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-2)'
    }
  }, t(tx.day))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 500,
      padding: '3px 8px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-2)',
      color: 'var(--fg-2)'
    }
  }, t(tx.category)), /*#__PURE__*/React.createElement(Money, {
    value: tx.amount,
    className: "t-amount-sm",
    sign: true,
    hidden: hidden,
    color: tx.amount > 0 ? 'var(--income-fg)' : 'var(--expense-fg)'
  }))))), /*#__PURE__*/React.createElement("button", {
    onClick: onOpenAI,
    style: {
      border: 0,
      cursor: 'pointer',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '20px 24px',
      borderRadius: 'var(--radius-lg)',
      background: 'linear-gradient(90deg, rgba(124,58,237,0.08) 0%, rgba(14,165,233,0.08) 100%)',
      border: '1px solid rgba(124,58,237,0.15)',
      transition: 'background 160ms'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'linear-gradient(90deg, rgba(124,58,237,0.14) 0%, rgba(14,165,233,0.14) 100%)',
    onMouseLeave: e => e.currentTarget.style.background = 'linear-gradient(90deg, rgba(124,58,237,0.08) 0%, rgba(14,165,233,0.08) 100%)'
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 22,
      background: 'linear-gradient(135deg,#7C3AED,#0EA5E9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 22,
      color: '#fff'
    }
  }, "auto_awesome")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 15,
      color: 'var(--fg-1)'
    }
  }, t("Asesor Financiero IA")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--fg-2)'
    }
  }, t("Tu tasa de ahorro es 42%. Hay $540 inactivos que podrías mover al jar de emergencia."))), /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 20,
      color: 'var(--fg-3)'
    }
  }, "chevron_right")));
}
Object.assign(window, {
  ProHomeRoute
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/templates/ProHomeRoute.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lite-desktop/templates/TransactionsRoute.jsx
try { (() => {
/* global React */
const {
  useState: useTxState,
  useRef: useTxRef,
  useEffect: useTxEffect
} = React;

/* ── Dropdown compacto reutilizable (cántaro / categoría / día) ─────── */
function TxDropdown({
  icon,
  label,
  value,
  options,
  onChange,
  full
}) {
  const [open, setOpen] = useTxState(false);
  const ref = useTxRef(null);
  useTxEffect(() => {
    if (!open) return;
    const close = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);
  const active = value !== 'all';
  const current = options.find(o => o.id === value);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'relative',
      width: full ? '100%' : 'auto'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      cursor: 'pointer',
      width: full ? '100%' : 'auto',
      padding: '9px 12px',
      borderRadius: full ? 'var(--radius-md)' : 'var(--radius-pill)',
      border: 0,
      background: active ? 'color-mix(in srgb, var(--brand-primary) 12%, var(--surface-1))' : 'var(--surface-2)',
      color: active ? 'var(--brand-primary)' : 'var(--fg-1)',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: active ? 600 : 500
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 17
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: full ? 1 : 'unset',
      textAlign: 'left'
    }
  }, active ? current ? t(current.label) : label : label), /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      opacity: .6
    }
  }, open ? 'expand_less' : 'expand_more')), open && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      zIndex: 60,
      minWidth: 230,
      width: full ? '100%' : 'auto',
      maxHeight: 300,
      overflowY: 'auto',
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 18px 50px rgba(15,23,42,.18)',
      border: '1px solid var(--border-hairline)',
      padding: 6
    }
  }, options.map(o => {
    const on = o.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o.id,
      onClick: () => {
        onChange(o.id);
        setOpen(false);
      },
      style: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: 10,
        padding: '9px 11px',
        border: 0,
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        textAlign: 'left',
        background: on ? 'var(--surface-2)' : 'transparent',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: on ? 600 : 500,
        color: 'var(--fg-1)'
      }
    }, o.color ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: '50%',
        background: o.color,
        flexShrink: 0
      }
    }) : o.icon ? /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 17,
        color: 'var(--fg-3)'
      }
    }, o.icon) : /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, t(o.label)), o.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: 'var(--fg-3)',
        fontFamily: 'var(--font-money)'
      }
    }, o.count), on && /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 17,
        color: 'var(--brand-primary)'
      }
    }, "check"));
  })));
}
const TX_AMOUNT_PRESETS = [{
  id: 'any',
  label: 'Cualquiera',
  min: '',
  max: ''
}, {
  id: 'lt50',
  label: '< $50',
  min: '',
  max: '50'
}, {
  id: '50-200',
  label: '$50 – $200',
  min: '50',
  max: '200'
}, {
  id: 'gt200',
  label: '> $200',
  min: '200',
  max: ''
}];
function TransactionsRoute({
  hidden
}) {
  const [type, setType] = useTxState('all');
  const [jar, setJar] = useTxState('all');
  const [cat, setCat] = useTxState('all');
  const [day, setDay] = useTxState('all');
  const [min, setMin] = useTxState('');
  const [max, setMax] = useTxState('');
  const [query, setQuery] = useTxState('');
  const [panel, setPanel] = useTxState(false);
  const panelRef = useTxRef(null);
  useTxEffect(() => {
    if (!panel) return;
    const close = e => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setPanel(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [panel]);
  const types = [{
    id: 'all',
    label: window.t('Todas')
  }, {
    id: 'income',
    label: window.t('Ingresos')
  }, {
    id: 'expense',
    label: window.t('Gastos')
  }];

  // Campos derivados de los datos (con conteo)
  const jarOptions = (() => {
    const seen = {};
    SAMPLE_TX.forEach(t => {
      if (t.jar) seen[t.jar] = {
        color: t.jarColor,
        count: (seen[t.jar]?.count || 0) + 1
      };
    });
    return [{
      id: 'all',
      label: window.t('Todos los cántaros'),
      icon: 'savings'
    }, {
      id: '__none',
      label: window.t('Sin cántaro'),
      icon: 'block',
      count: SAMPLE_TX.filter(t => !t.jar).length
    }, ...Object.keys(seen).map(n => ({
      id: n,
      label: n,
      color: seen[n].color,
      count: seen[n].count
    }))];
  })();
  const catOptions = (() => {
    const seen = {};
    SAMPLE_TX.forEach(t => {
      seen[t.category] = (seen[t.category] || 0) + 1;
    });
    return [{
      id: 'all',
      label: window.t('Todas las categorías'),
      icon: 'sell'
    }, ...Object.keys(seen).map(n => ({
      id: n,
      label: n,
      icon: 'label',
      count: seen[n]
    }))];
  })();
  const dayOptions = (() => {
    const seen = {};
    SAMPLE_TX.forEach(t => {
      seen[t.day] = (seen[t.day] || 0) + 1;
    });
    return [{
      id: 'all',
      label: window.t('Cualquier día'),
      icon: 'event'
    }, ...Object.keys(seen).map(n => ({
      id: n,
      label: n,
      icon: 'calendar_today',
      count: seen[n]
    }))];
  })();
  const filtered = SAMPLE_TX.filter(t => {
    if (type === 'income' && !(t.amount > 0)) return false;
    if (type === 'expense' && !(t.amount < 0)) return false;
    if (jar === '__none' && t.jar) return false;
    if (jar !== 'all' && jar !== '__none' && t.jar !== jar) return false;
    if (cat !== 'all' && t.category !== cat) return false;
    if (day !== 'all' && t.day !== day) return false;
    const abs = Math.abs(t.amount);
    if (min !== '' && abs < parseFloat(min)) return false;
    if (max !== '' && abs > parseFloat(max)) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!`${t.label} ${t.category} ${t.jar || ''} ${t.meta} ${Math.abs(t.amount)}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Chips activos (cada campo posible)
  const chips = [];
  if (type !== 'all') chips.push({
    k: 'type',
    icon: 'swap_vert',
    label: types.find(x => x.id === type).label,
    clear: () => setType('all')
  });
  if (jar !== 'all') chips.push({
    k: 'jar',
    dot: jar !== '__none' ? jarOptions.find(o => o.id === jar)?.color : null,
    icon: jar === '__none' ? 'block' : null,
    label: jar === '__none' ? window.t('Sin cántaro') : jar,
    clear: () => setJar('all')
  });
  if (cat !== 'all') chips.push({
    k: 'cat',
    icon: 'label',
    label: cat,
    clear: () => setCat('all')
  });
  if (day !== 'all') chips.push({
    k: 'day',
    icon: 'event',
    label: day,
    clear: () => setDay('all')
  });
  if (min !== '' || max !== '') chips.push({
    k: 'amt',
    icon: 'payments',
    label: `${min !== '' ? '≥ $' + min : ''}${min !== '' && max !== '' ? ' · ' : ''}${max !== '' ? '≤ $' + max : ''}`,
    clear: () => {
      setMin('');
      setMax('');
    }
  });
  if (query.trim()) chips.push({
    k: 'q',
    icon: 'search',
    label: `"${query}"`,
    clear: () => setQuery('')
  });
  const activeCount = chips.length;
  const clearAll = () => {
    setType('all');
    setJar('all');
    setCat('all');
    setDay('all');
    setMin('');
    setMax('');
    setQuery('');
  };
  const total = filtered.reduce((s, t) => s + t.amount, 0);
  const panelField = (label, node) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      color: 'var(--fg-3)'
    }
  }, label), node);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, t("Transacciones")), /*#__PURE__*/React.createElement("h1", {
    className: "t-h1",
    style: {
      margin: '6px 0 0'
    }
  }, t('Mayo'))), /*#__PURE__*/React.createElement(Card, {
    padding: 16,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      flex: 1,
      minWidth: 220,
      padding: '9px 14px',
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-pill)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      color: 'var(--fg-3)'
    }
  }, "search"), /*#__PURE__*/React.createElement("input", {
    value: query,
    onChange: e => setQuery(e.target.value),
    placeholder: t('Buscar en concepto, cántaro, categoría, monto…'),
    style: {
      border: 0,
      outline: 'none',
      background: 'transparent',
      flex: 1,
      minWidth: 0,
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--fg-1)'
    }
  }), query && /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    onClick: () => setQuery(''),
    style: {
      fontSize: 17,
      color: 'var(--fg-3)',
      cursor: 'pointer'
    }
  }, "close")), /*#__PURE__*/React.createElement("div", {
    ref: panelRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setPanel(p => !p),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      padding: '9px 16px',
      borderRadius: 'var(--radius-pill)',
      border: 0,
      background: activeCount ? 'var(--brand-primary)' : 'var(--surface-2)',
      color: activeCount ? 'var(--fg-on-brand)' : 'var(--fg-1)',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18
    }
  }, "tune"), t('Filtros'), activeCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'rgba(255,255,255,.25)',
      borderRadius: 'var(--radius-pill)',
      minWidth: 18,
      height: 18,
      display: 'inline-grid',
      placeItems: 'center',
      fontSize: 11,
      fontFamily: 'var(--font-money)',
      padding: '0 5px'
    }
  }, activeCount)), panel && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'calc(100% + 10px)',
      right: 0,
      zIndex: 70,
      width: 340,
      maxWidth: '88vw',
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: '0 24px 60px rgba(15,23,42,.22)',
      border: '1px solid var(--border-hairline)',
      padding: 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 15,
      color: 'var(--fg-1)'
    }
  }, t('Filtro inteligente')), activeCount > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: clearAll,
    style: {
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--brand-primary)',
      fontFamily: 'var(--font-body)',
      fontSize: 12.5,
      fontWeight: 600
    }
  }, t('Limpiar todo'))), panelField(t('Tipo'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-pill)',
      padding: 3,
      gap: 2,
      width: '100%'
    }
  }, types.map(f => {
    const on = type === f.id;
    return /*#__PURE__*/React.createElement("button", {
      key: f.id,
      onClick: () => setType(f.id),
      style: {
        flex: 1,
        border: 0,
        cursor: 'pointer',
        padding: '7px 0',
        borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--brand-primary)' : 'transparent',
        color: on ? 'var(--fg-on-brand)' : 'var(--fg-2)',
        fontFamily: 'var(--font-body)',
        fontSize: 12.5,
        fontWeight: on ? 600 : 500
      }
    }, f.label);
  }))), panelField(t('Cántaro'), /*#__PURE__*/React.createElement(TxDropdown, {
    full: true,
    icon: "savings",
    label: t('Todos los cántaros'),
    value: jar,
    options: jarOptions,
    onChange: setJar
  })), panelField(t('Categoría'), /*#__PURE__*/React.createElement(TxDropdown, {
    full: true,
    icon: "sell",
    label: t('Todas las categorías'),
    value: cat,
    options: catOptions,
    onChange: setCat
  })), panelField(t('Día'), /*#__PURE__*/React.createElement(TxDropdown, {
    full: true,
    icon: "event",
    label: t('Cualquier día'),
    value: day,
    options: dayOptions,
    onChange: setDay
  })), panelField(t('Monto'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, ['min', 'max'].map(which => /*#__PURE__*/React.createElement("div", {
    key: which,
    style: {
      flex: 1,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 12px',
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontSize: 13,
      color: 'var(--fg-3)'
    }
  }, which === 'min' ? '≥ $' : '≤ $'), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: which === 'min' ? min : max,
    onChange: e => which === 'min' ? setMin(e.target.value) : setMax(e.target.value),
    placeholder: which === 'min' ? '0' : '∞',
    style: {
      border: 0,
      outline: 'none',
      background: 'transparent',
      width: '100%',
      minWidth: 0,
      fontFamily: 'var(--font-money)',
      fontSize: 13,
      color: 'var(--fg-1)'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, TX_AMOUNT_PRESETS.map(p => {
    const on = min === p.min && max === p.max;
    return /*#__PURE__*/React.createElement("button", {
      key: p.id,
      onClick: () => {
        setMin(p.min);
        setMax(p.max);
      },
      style: {
        border: 0,
        cursor: 'pointer',
        padding: '5px 11px',
        borderRadius: 'var(--radius-pill)',
        background: on ? 'color-mix(in srgb, var(--brand-primary) 14%, var(--surface-1))' : 'var(--surface-2)',
        color: on ? 'var(--brand-primary)' : 'var(--fg-2)',
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        fontWeight: on ? 600 : 500
      }
    }, t(p.label));
  }))))))), activeCount > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, chips.map(c => /*#__PURE__*/React.createElement("span", {
    key: c.k,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 8px 5px 11px',
      borderRadius: 'var(--radius-pill)',
      background: 'color-mix(in srgb, var(--brand-primary) 10%, var(--surface-1))',
      color: 'var(--brand-primary)',
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600
    }
  }, c.dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: c.dot
    }
  }) : c.icon ? /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 14
    }
  }, c.icon) : null, t(c.label), /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    onClick: c.clear,
    style: {
      fontSize: 15,
      cursor: 'pointer',
      opacity: .7
    }
  }, "close")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
      borderTop: '1px solid var(--border-hairline)',
      paddingTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12.5,
      color: 'var(--fg-2)'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--fg-1)',
      fontWeight: 700
    }
  }, filtered.length), " ", filtered.length === 1 ? t('movimiento') : t('movimientos'), activeCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--fg-3)'
    }
  }, " \xB7 ", t('neto'), " "), activeCount > 0 && /*#__PURE__*/React.createElement(Money, {
    value: total,
    sign: true,
    hidden: hidden,
    color: total >= 0 ? 'var(--income-fg)' : 'var(--expense-fg)',
    style: {
      fontSize: 13
    }
  })), activeCount > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: clearAll,
    style: {
      marginLeft: 'auto',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      border: 0,
      cursor: 'pointer',
      padding: '6px 12px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-2)',
      color: 'var(--fg-2)',
      fontFamily: 'var(--font-body)',
      fontSize: 12.5,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 16
    }
  }, "filter_alt_off"), t('Limpiar'), " (", activeCount, ")"))), filtered.length === 0 ? /*#__PURE__*/React.createElement(Card, {
    padding: 0
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '48px 20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 36,
      color: 'var(--fg-3)'
    }
  }, "search_off"), /*#__PURE__*/React.createElement("div", {
    className: "t-body",
    style: {
      color: 'var(--fg-2)',
      marginTop: 10
    }
  }, t('Ningún movimiento coincide con estos filtros.')))) : /*#__PURE__*/React.createElement(TransactionsLedger, {
    transactions: filtered,
    hidden: hidden
  }));
}
Object.assign(window, {
  TransactionsRoute,
  TxDropdown
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lite-desktop/templates/TransactionsRoute.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/Shell.jsx
try { (() => {
/* ─── Mobile Shell ───────────────────────────────────────────────────────
 * Root component: owns routing, balance-visible state, action sheet state.
 * Props: mode('lite'|'pro') — passed from external Lite/Pro toggle.
 *
 * RN MAPPING:
 *   Replace with a NavigationContainer + Stack.Navigator (for AI chat push)
 *   + bottom-tabs navigator (for the 4 main routes).
 *   QuickActionSheet → render inside the tab navigator's tabBar prop,
 *   or use a global modal via RN's Modal component.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const {
  useState: useShellMobileState
} = React;
function MobileShell({
  mode = 'lite'
}) {
  const [route, setRoute] = useShellMobileState('home');
  const [sheetOpen, setSheetOpen] = useShellMobileState(false);
  const [smartOpen, setSmartOpen] = useShellMobileState(false);
  const [smartType, setSmartType] = useShellMobileState('expense');
  const [smartTab, setSmartTab] = useShellMobileState('text');
  const [balVisible, setBal] = useShellMobileState(true);
  const hidden = !balVisible;
  const isNavRoute = route !== 'aichat';
  const goTo = r => {
    setSheetOpen(false);
    setSmartOpen(false);
    setRoute(r);
  };
  const openSmart = (type = 'expense', tab = 'text') => {
    setSmartType(type);
    setSmartTab(tab);
    setSmartOpen(true);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      background: 'var(--bg-canvas)'
    }
  }, /*#__PURE__*/React.createElement(MobileStatusBar, null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }
  }, route === 'home' && mode === 'lite' && /*#__PURE__*/React.createElement(HomeScreenLite, {
    hidden: hidden,
    onToggleVisible: () => setBal(v => !v),
    onGoTo: goTo
  }), route === 'home' && mode === 'pro' && /*#__PURE__*/React.createElement(HomeScreenPro, {
    hidden: hidden,
    onToggleVisible: () => setBal(v => !v),
    onGoTo: goTo
  }), route === 'transactions' && /*#__PURE__*/React.createElement(TransactionsScreen, {
    hidden: hidden,
    onBack: () => goTo('home')
  }), route === 'jars' && /*#__PURE__*/React.createElement(JarsScreen, {
    hidden: hidden,
    onBack: () => goTo('home')
  }), route === 'config' && /*#__PURE__*/React.createElement(SettingsScreen, {
    onBack: () => goTo('home')
  }), route === 'aichat' && /*#__PURE__*/React.createElement(AIAdvisorScreen, {
    onBack: () => goTo('home')
  }), isNavRoute && /*#__PURE__*/React.createElement(QuickActionSheet, {
    open: sheetOpen,
    onClose: () => setSheetOpen(false),
    onOpenAI: () => goTo('aichat'),
    onSelectAction: id => {
      const cfg = STS_ACTION_MAP[id];
      if (cfg) openSmart(cfg.type, cfg.tab);
    },
    mode: mode
  }), isNavRoute && /*#__PURE__*/React.createElement(SmartTransactionSheet, {
    open: smartOpen,
    onClose: () => setSmartOpen(false),
    initialType: smartType,
    initialTab: smartTab
  })), isNavRoute && /*#__PURE__*/React.createElement(BottomNav, {
    active: route,
    onChange: goTo,
    onAction: () => setSheetOpen(o => !o),
    actionOpen: sheetOpen,
    mode: mode
  }));
}
Object.assign(window, {
  MobileShell
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/components/Atoms.jsx
try { (() => {
/* ─── OW Finance Mobile — Atoms ──────────────────────────────────────────
 * Atomic building blocks used across all screens.
 *
 * RN MAPPING:
 *   <div style={flex}> → <View>
 *   <span>/<p>         → <Text>
 *   <button>           → <TouchableOpacity> wrapping <Text>
 *   inline styles      → StyleSheet.create() — all values are RN-compatible
 *   CSS vars           → import { OWColors, OWRadii } from './tokens'
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const {
  useState: useAtomState
} = React;

/* ── Avatar ─────────────────────────────────────────────────────────────
 * Props: initial(string), size(number), bg(cssColor), src(url|null)
 * RN: <View><Text> or <Image> */
function Avatar({
  initial = 'J',
  size = 40,
  bg = 'var(--brand-primary)',
  src = null
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: size / 2,
      background: src ? 'transparent' : bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      flexShrink: 0
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: size * 0.42,
      color: '#fff'
    }
  }, initial));
}

/* ── AIAvatar ────────────────────────────────────────────────────────────
 * Gradient purple sparkle circle — for the AI advisor. */
function AIAvatar({
  size = 40
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: size / 2,
      flexShrink: 0,
      background: 'linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: size * 0.5,
      color: '#fff'
    }
  }, "auto_awesome"));
}

/* ── StatusDot ───────────────────────────────────────────────────────────
 * Small presence indicator. active=true → green, false → gray. */
function StatusDot({
  active = true,
  size = 8
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      width: size,
      height: size,
      borderRadius: size / 2,
      background: active ? 'var(--income)' : 'var(--fg-3)'
    }
  });
}

/* ── Chip ────────────────────────────────────────────────────────────────
 * Small pill label.
 * RN: <View style={{ borderRadius: 999 }}><Text> */
function MobileChip({
  children,
  variant = 'default',
  size = 'sm'
}) {
  const pad = size === 'sm' ? '4px 10px' : '7px 14px';
  const fs = size === 'sm' ? 11 : 13;
  const palettes = {
    default: {
      bg: 'var(--surface-2)',
      color: 'var(--fg-1)'
    },
    brand: {
      bg: 'var(--brand-primary-soft)',
      color: 'var(--brand-primary-fg-soft)'
    },
    income: {
      bg: 'var(--income-soft)',
      color: 'var(--income-fg)'
    },
    expense: {
      bg: 'var(--expense-soft)',
      color: 'var(--expense-fg)'
    },
    warning: {
      bg: 'var(--warning-soft)',
      color: 'var(--warning-fg)'
    },
    info: {
      bg: 'var(--info-soft)',
      color: 'var(--info-fg)'
    },
    ai: {
      bg: 'rgba(139,92,246,0.15)',
      color: '#C4B5FD'
    }
  };
  const p = palettes[variant] || palettes.default;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: 'var(--font-body)',
      fontWeight: 500,
      fontSize: fs,
      padding: pad,
      borderRadius: 'var(--radius-pill)',
      background: p.bg,
      color: p.color
    }
  }, children);
}

/* ── PillButtonMobile ───────────────────────────────────────────────────
 * RN: <TouchableOpacity><Text> with Animated.spring for press feedback. */
function PillButtonMobile({
  children,
  icon,
  variant = 'primary',
  fullWidth = false,
  onPress,
  size = 'md'
}) {
  const [pressed, setPressed] = useAtomState(false);
  const pad = size === 'sm' ? '9px 16px' : '13px 22px';
  const fs = size === 'sm' ? 13 : 15;
  const palettes = {
    primary: {
      bg: 'var(--brand-primary)',
      color: '#fff',
      hov: 'var(--brand-primary-hover)'
    },
    secondary: {
      bg: 'var(--surface-1)',
      color: 'var(--fg-1)',
      hov: 'var(--surface-2)',
      shadow: 'var(--shadow-card)'
    },
    ghost: {
      bg: 'transparent',
      color: 'var(--fg-1)',
      hov: 'var(--surface-2)'
    },
    danger: {
      bg: 'var(--expense-soft)',
      color: 'var(--expense-fg)',
      hov: 'var(--expense-soft)'
    },
    aiGrad: {
      bg: 'linear-gradient(90deg, #7C3AED 0%, #0EA5E9 100%)',
      color: '#fff',
      hov: ''
    },
    proAccent: {
      bg: 'var(--info)',
      color: '#fff',
      hov: '#0284C7'
    }
  };
  const p = palettes[variant] || palettes.primary;
  return /*#__PURE__*/React.createElement("button", {
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    onMouseLeave: () => setPressed(false),
    onClick: onPress,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: fs,
      border: 0,
      borderRadius: 'var(--radius-pill)',
      cursor: 'pointer',
      padding: pad,
      width: fullWidth ? '100%' : 'auto',
      background: p.bg,
      color: p.color,
      boxShadow: p.shadow || 'none',
      transform: pressed ? 'scale(0.97)' : 'scale(1)',
      transition: 'transform 80ms, background 160ms'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: fs + 3
    }
  }, icon), children);
}

/* ── IconButtonMobile ───────────────────────────────────────────────────
 * Circular icon button. badge(number) shows a red badge count.
 * RN: <TouchableOpacity> with absolute-positioned badge <View>. */
function IconButtonMobile({
  icon,
  onPress,
  badge = 0,
  size = 40,
  bg = 'var(--surface-1)',
  color = 'var(--fg-1)'
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onPress,
    style: {
      width: size,
      height: size,
      border: 0,
      cursor: 'pointer',
      borderRadius: size / 2,
      background: bg,
      color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'var(--shadow-card)',
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 20
    }
  }, icon), badge > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      background: 'var(--expense)',
      boxShadow: '0 0 0 2px var(--bg-canvas)'
    }
  }));
}

/* ── Toggle ─────────────────────────────────────────────────────────────
 * RN: Use Switch component or custom Animated implementation. */
function MobileToggle({
  on,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onChange,
    style: {
      width: 46,
      height: 26,
      borderRadius: 13,
      background: on ? 'var(--brand-primary)' : 'var(--surface-3)',
      position: 'relative',
      cursor: 'pointer',
      flexShrink: 0,
      transition: 'background 180ms'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 3,
      left: on ? 23 : 3,
      width: 20,
      height: 20,
      borderRadius: 10,
      background: '#fff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
      transition: 'left 180ms var(--ease-out)'
    }
  }));
}

/* ── Divider ─────────────────────────────────────────────────────────────
 * RN: <View style={{ height: 1, backgroundColor: borderHairline }}> */
function Divider({
  mx = 20
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-hairline)',
      margin: `0 ${mx}px`
    }
  });
}

/* ── Money (mobile) ─────────────────────────────────────────────────────
 * Renders masked amount. RN: <Text style={{ fontVariant: ['tabular-nums'] }}> */
function MoneyMobile({
  value,
  className = 't-amount-md',
  sign = false,
  hidden = false,
  color
}) {
  const isNeg = value < 0;
  const abs = Math.abs(value);
  const fmt = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const prefix = sign ? isNeg ? '− ' : '+ ' : isNeg ? '− ' : '';
  return /*#__PURE__*/React.createElement("span", {
    className: className,
    style: {
      color: color || 'inherit',
      fontVariantNumeric: 'tabular-nums'
    }
  }, hidden ? '$ ••••••' : `${prefix}$ ${fmt}`);
}
Object.assign(window, {
  Avatar,
  AIAvatar,
  StatusDot,
  MobileChip,
  PillButtonMobile,
  IconButtonMobile,
  MobileToggle,
  Divider,
  MoneyMobile
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/components/Atoms.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/components/BalanceCard.jsx
try { (() => {
/* ─── OW Finance Mobile — Balance Card & KPI Strip ──────────────────────
 * RN: Use <View> + <Text>. Animate amount changes with LayoutAnimation
 *     or react-native-reanimated FadeInDown for the masked state.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

/* ── BalanceCard ────────────────────────────────────────────────────────
 * The hero card shown at the top of the Home screen.
 * Lite: shows only the total balance + currency chip.
 * Pro: shows total + income/expense/net row below. */
function BalanceCard({
  amount = 12480.50,
  currency = 'USD',
  hidden = false,
  mode = 'lite',
  delta
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 16px',
      background: 'var(--brand-primary)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px 22px 20px',
      boxShadow: '0 8px 28px rgba(30,58,138,0.35)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.65)'
    }
  }, "Disponible \xB7 ", currency), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.06em',
      padding: '4px 10px',
      borderRadius: 'var(--radius-pill)',
      background: 'rgba(255,255,255,0.15)',
      color: '#fff'
    }
  }, currency)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 44,
      lineHeight: 1,
      letterSpacing: -1,
      color: '#fff',
      fontVariantNumeric: 'tabular-nums'
    }
  }, hidden ? '$ ••••••' : `$ ${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2
  })}`)), delta && !hidden && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      background: delta.value >= 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)',
      color: delta.value >= 0 ? '#6EE7B7' : '#FCA5A5',
      padding: '4px 10px',
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 14
    }
  }, delta.value >= 0 ? 'arrow_upward' : 'arrow_downward'), delta.value >= 0 ? '+' : '', delta.value.toFixed(1), "% ", delta.label), mode === 'pro' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      paddingTop: 14,
      borderTop: '1px solid rgba(255,255,255,0.12)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 0
    }
  }, /*#__PURE__*/React.createElement(CardKPI, {
    label: "Ingresos",
    value: 4820,
    color: "#6EE7B7",
    hidden: hidden
  }), /*#__PURE__*/React.createElement(CardKPI, {
    label: "Gastos",
    value: -2360.50,
    color: "#FCA5A5",
    hidden: hidden
  }), /*#__PURE__*/React.createElement(CardKPI, {
    label: "Neto",
    value: 2459.50,
    color: "#fff",
    hidden: hidden
  })));
}
function CardKPI({
  label,
  value,
  color,
  hidden
}) {
  const isNeg = value < 0;
  const fmt = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      color: 'rgba(255,255,255,0.55)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontSize: 15,
      fontWeight: 600,
      color,
      fontVariantNumeric: 'tabular-nums'
    }
  }, hidden ? '••••' : `${isNeg ? '−' : '+'}$${fmt}`));
}

/* ── QuickStatRow ───────────────────────────────────────────────────────
 * Horizontal row of 3 stats. Used in Pro home below the balance card. */
function QuickStatRow({
  hidden
}) {
  const stats = [{
    label: 'Tasa ahorro',
    value: '42%',
    icon: 'trending_up',
    color: 'var(--income-fg)'
  }, {
    label: 'Jars activos',
    value: '6',
    icon: 'savings',
    color: 'var(--brand-primary-fg-soft)'
  }, {
    label: 'Próx. pago',
    value: '10 jun',
    icon: 'event',
    color: 'var(--warning-fg)'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '12px 16px 0',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 10
    }
  }, stats.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-md)',
      padding: '12px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      color: s.color
    }
  }, s.icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontSize: 16,
      fontWeight: 700,
      color: 'var(--fg-1)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, hidden && s.label === 'Tasa ahorro' ? '••%' : s.value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      color: 'var(--fg-2)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em'
    }
  }, s.label))));
}
Object.assign(window, {
  BalanceCard,
  QuickStatRow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/components/BalanceCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/components/ChatComponents.jsx
try { (() => {
/* ─── OW Finance Mobile — Chat Components ────────────────────────────────
 * Used by AIAdvisorScreen.
 *
 * RN MAPPING:
 *   ChatBubble     → <View> + <Text>. Style isUser vs isAI differently.
 *   RichText       → Compose <Text> with nested colored <Text> spans.
 *   TypingBubble   → Three dots animated with Animated.loop + sequence.
 *   QuickReplyChip → <TouchableOpacity> pill with <Text>.
 *   ChatInput      → <TextInput> + mic + send TouchableOpacity.
 *                    Use KeyboardAvoidingView behavior="padding".
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const {
  useRef: useChatRef,
  useEffect: useChatEffect,
  useState: useChatState
} = React;

/* ── RichText ────────────────────────────────────────────────────────────
 * Renders a message parts array: [{ text, plain?, color? }].
 * RN: nested <Text> spans — identical approach works in RN. */
function RichText({
  parts = [],
  style = {}
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      lineHeight: 1.5,
      whiteSpace: 'pre-wrap',
      ...style
    }
  }, parts.map((p, i) => p.color ? /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      color: p.color,
      fontWeight: 600
    }
  }, p.text) : /*#__PURE__*/React.createElement("span", {
    key: i
  }, p.text)));
}

/* ── ChatBubble ──────────────────────────────────────────────────────────
 * Props:
 *   message(object)  — { id, role, parts, ctas, time }
 *   onCta(fn)        — called with cta text when a CTA button is pressed */
function ChatBubble({
  message,
  onCta
}) {
  const isUser = message.role === 'user';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      gap: 8,
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-end',
      flexDirection: isUser ? 'row-reverse' : 'row'
    }
  }, !isUser && /*#__PURE__*/React.createElement(AIAvatar, {
    size: 28
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '78%',
      background: isUser ? 'var(--surface-2)' : 'var(--surface-1)',
      borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
      padding: '12px 14px',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement(RichText, {
    parts: message.parts || [{
      text: message.text || '',
      plain: true
    }],
    style: {
      color: 'var(--fg-1)'
    }
  }))), !isUser && message.ctas && message.ctas.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 38,
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, message.ctas.map((cta, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => onCta && onCta(cta),
    style: {
      border: 0,
      cursor: 'pointer',
      padding: '9px 18px',
      borderRadius: 'var(--radius-pill)',
      background: i === 0 ? 'var(--info)' : 'var(--surface-2)',
      color: i === 0 ? '#fff' : 'var(--fg-1)',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 14
    }
  }, cta))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      color: 'var(--fg-3)',
      marginLeft: isUser ? 0 : 38,
      marginRight: isUser ? 0 : 0
    }
  }, message.time));
}

/* ── TypingBubble ────────────────────────────────────────────────────────
 * Three animated dots indicating the AI is "thinking".
 * RN: Use Animated.loop with a staggered opacity animation per dot. */
function TypingBubble() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 10,
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement(AIAvatar, {
    size: 28
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-1)',
      borderRadius: '4px 18px 18px 18px',
      padding: '12px 18px',
      display: 'flex',
      gap: 5,
      alignItems: 'center',
      boxShadow: 'var(--shadow-card)'
    }
  }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 7,
      height: 7,
      borderRadius: 4,
      background: 'var(--fg-3)',
      animation: `dotPulse 1.2s ${i * 0.2}s ease-in-out infinite`
    }
  }))), /*#__PURE__*/React.createElement("style", null, `@keyframes dotPulse { 0%,80%,100%{opacity:0.3;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }`));
}

/* ── QuickReplyChip ─────────────────────────────────────────────────────
 * Tappable suggestion pill above the input area. */
function QuickReplyChip({
  label,
  onPress
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: () => onPress(label),
    style: {
      flexShrink: 0,
      border: '1px solid var(--border-hairline)',
      cursor: 'pointer',
      padding: '8px 14px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-1)',
      color: 'var(--fg-1)',
      fontFamily: 'var(--font-body)',
      fontWeight: 500,
      fontSize: 13,
      boxShadow: 'var(--shadow-card)'
    }
  }, label);
}

/* ── ChatInput ───────────────────────────────────────────────────────────
 * Composed input bar: mic · text field · send button.
 * RN: <View row> + <TouchableOpacity mic> + <TextInput> + <TouchableOpacity send>
 *     Wrap in <KeyboardAvoidingView behavior="padding">. */
function ChatInput({
  value,
  onChange,
  onSend,
  loading
}) {
  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      onSend();
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      borderTop: '1px solid var(--border-hairline)',
      background: 'var(--bg-canvas)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      scrollbarWidth: 'none',
      paddingBottom: 2
    }
  }, QUICK_REPLIES.map(q => /*#__PURE__*/React.createElement(QuickReplyChip, {
    key: q,
    label: q,
    onPress: onChange
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--fg-2)',
      padding: 4,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 24
    }
  }, "mic")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-pill)',
      padding: '0 16px',
      border: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: value,
    onChange: e => onChange(e.target.value),
    onKeyDown: handleKey,
    placeholder: "Escribe un mensaje...",
    disabled: loading,
    style: {
      flex: 1,
      border: 0,
      background: 'transparent',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--fg-1)',
      outline: 'none',
      padding: '11px 0'
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: onSend,
    disabled: loading || !value.trim(),
    style: {
      width: 44,
      height: 44,
      borderRadius: 22,
      border: 0,
      cursor: 'pointer',
      background: loading || !value.trim() ? 'var(--surface-2)' : 'var(--info)',
      color: loading || !value.trim() ? 'var(--fg-3)' : '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 180ms',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 20
    }
  }, loading ? 'hourglass_empty' : 'send'))));
}
Object.assign(window, {
  RichText,
  ChatBubble,
  TypingBubble,
  QuickReplyChip,
  ChatInput
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/components/ChatComponents.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/components/JarComponents.jsx
try { (() => {
/* ─── OW Finance Mobile — Jar Components ────────────────────────────────
 * RN: JarCard → <View> card. JarsRow → <ScrollView horizontal>
 *     Progress bar → <View> with width animated via Animated.Value
 *     or react-native-reanimated withTiming.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

const JAR_TONES = {
  brand: {
    bg: 'var(--brand-primary-soft)',
    icon: 'var(--brand-primary-fg-soft)',
    bar: 'var(--brand-primary)'
  },
  income: {
    bg: 'var(--income-soft)',
    icon: 'var(--income-fg)',
    bar: 'var(--income)'
  },
  warn: {
    bg: 'var(--warning-soft)',
    icon: 'var(--warning-fg)',
    bar: 'var(--warning)'
  }
};

/* ── JarCard ────────────────────────────────────────────────────────────
 * Single jar tile — used in horizontal scroll on Home,
 * and in a 2-col grid on the Jars screen.
 * Props: jar(object) hidden(bool) compact(bool) */
function JarCard({
  jar,
  hidden = false,
  compact = false
}) {
  const tone = JAR_TONES[jar.tone] || JAR_TONES.brand;
  const w = compact ? 140 : 160;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: w,
      flexShrink: 0,
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-lg)',
      padding: compact ? '14px 14px' : '16px 16px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 16,
      background: tone.bg,
      color: tone.icon,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 16
    }
  }, "savings")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 13,
      color: 'var(--fg-1)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, jar.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      color: 'var(--fg-2)'
    }
  }, jar.sub))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 18,
      color: 'var(--fg-1)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, hidden ? '$ ••••' : `$ ${jar.amount.toLocaleString('en-US', {
    minimumFractionDigits: 2
  })}`), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      borderRadius: 2,
      background: 'var(--surface-2)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${jar.progress}%`,
      background: tone.bar,
      borderRadius: 2
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      color: 'var(--fg-2)'
    }
  }, /*#__PURE__*/React.createElement("span", null, jar.progress, "%"), /*#__PURE__*/React.createElement("span", null, jar.progress >= 100 ? 'Completo' : `de $${(jar.goal / 1000).toFixed(1)}k`)));
}

/* ── JarsRow ────────────────────────────────────────────────────────────
 * Horizontal scroll row of JarCards.
 * RN: <ScrollView horizontal showsHorizontalScrollIndicator={false}> */
function JarsRow({
  jars,
  hidden = false,
  onViewAll
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 20px',
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 16,
      color: 'var(--fg-1)'
    }
  }, "Jars"), /*#__PURE__*/React.createElement("button", {
    onClick: onViewAll,
    style: {
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--brand-primary)',
      fontWeight: 500
    }
  }, "Ver todos")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      overflowX: 'auto',
      padding: '0 20px 4px',
      scrollbarWidth: 'none'
    }
  }, jars.map(jar => /*#__PURE__*/React.createElement(JarCard, {
    key: jar.id,
    jar: jar,
    hidden: hidden
  }))));
}

/* ── JarGrid ────────────────────────────────────────────────────────────
 * 2-column grid for the full Jars screen.
 * RN: <FlatList numColumns={2}> */
function JarGrid({
  jars,
  hidden = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, jars.map(jar => /*#__PURE__*/React.createElement("div", {
    key: jar.id,
    style: {
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 15,
      background: JAR_TONES[jar.tone]?.bg || 'var(--surface-2)',
      color: JAR_TONES[jar.tone]?.icon || 'var(--fg-1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 15
    }
  }, "savings")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 13,
      color: 'var(--fg-1)'
    }
  }, jar.name)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 17,
      color: 'var(--fg-1)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, hidden ? '$ ••••' : `$ ${jar.amount.toLocaleString('en-US', {
    minimumFractionDigits: 2
  })}`), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      borderRadius: 2,
      background: 'var(--surface-2)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${jar.progress}%`,
      background: JAR_TONES[jar.tone]?.bar || 'var(--brand-primary)',
      borderRadius: 2
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      color: 'var(--fg-2)',
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, jar.progress, "% completado"), jar.tone === 'warn' && /*#__PURE__*/React.createElement(MobileChip, {
    variant: "warning",
    size: "sm"
  }, "Mover")))));
}
Object.assign(window, {
  JarCard,
  JarsRow,
  JarGrid
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/components/JarComponents.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/components/Navigation.jsx
try { (() => {
/* ─── OW Finance Mobile — Navigation Components ─────────────────────────
 *
 * Components: StatusBar · MobileHeader · BottomNav
 *
 * RN MAPPING:
 *   StatusBar   → react-native StatusBar (or Expo's StatusBar)
 *   MobileHeader→ custom header inside Stack.Screen headerShown:false
 *   BottomNav   → @react-navigation/bottom-tabs with custom tabBar
 *
 * The center action button in BottomNav opens the QuickActionSheet;
 * in RN render it as a raised absolute-positioned TouchableOpacity.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

/* ── StatusBar ──────────────────────────────────────────────────────────
 * Simulated device status bar. In RN: use <StatusBar barStyle="light-content" />
 * and handle safe area via SafeAreaView. */
function MobileStatusBar({
  theme = 'dark'
}) {
  const light = theme === 'light';
  const fg = light ? 'var(--fg-1)' : '#E2E8F0';
  const d = new Date();
  const time = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 12,
      color: fg,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", null, time), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 14,
      color: fg
    }
  }, "signal_cellular_4_bar"), /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 14,
      color: fg
    }
  }, "wifi"), /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 16,
      color: fg
    }
  }, "battery_full")));
}

/* ── MobileHeader ───────────────────────────────────────────────────────
 * Flexible header for inner screens.
 * Props:
 *   title(string)         — main title
 *   subtitle(string?)     — small subtitle under title
 *   onBack(fn?)           — if provided, shows back arrow
 *   rightActions(array)   — [{ icon, onPress, badge }]
 *   variant               — 'default' | 'large' | 'ai'
 *   centerTitle(bool)     — centers title (used for modals)
 *
 * RN: Create as a custom component inside your Navigator's header slot. */
function MobileHeader({
  title,
  subtitle,
  onBack,
  rightActions = [],
  variant = 'default',
  centerTitle = false
}) {
  const isAI = variant === 'ai';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 20px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexShrink: 0
    }
  }, onBack && /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--fg-1)',
      padding: 4,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 24
    }
  }, "arrow_back")), isAI && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(AIAvatar, {
    size: 38
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 10,
      height: 10,
      borderRadius: 5,
      background: 'var(--income)',
      border: '2px solid var(--bg-canvas)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: centerTitle ? 'center' : 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: isAI ? 15 : 17,
      color: 'var(--fg-1)',
      lineHeight: 1.2
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      fontWeight: isAI ? 600 : 400,
      color: isAI ? 'var(--income-fg)' : 'var(--fg-2)',
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      marginTop: 1
    }
  }, isAI && /*#__PURE__*/React.createElement(StatusDot, {
    active: true,
    size: 7
  }), subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, rightActions.map((a, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: a.onPress,
    style: {
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--fg-2)',
      padding: 4,
      display: 'flex',
      alignItems: 'center',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 22
    }
  }, a.icon), a.badge > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      right: 2,
      width: 7,
      height: 7,
      borderRadius: 4,
      background: 'var(--expense)'
    }
  })))));
}

/* ── BottomNav ──────────────────────────────────────────────────────────
 * 4 tabs + center raised action button.
 * Props:
 *   active(string)        — current route id
 *   onChange(fn)          — route change handler
 *   onAction(fn)          — center + button handler (opens QuickActionSheet)
 *   actionOpen(bool)      — true → center shows X icon
 *   mode                  — 'lite' | 'pro' (changes accent color)
 *
 * RN: Implement as a custom tabBar with a raised center button.
 *     Use react-navigation's tabBarStyle to hide native tab bar,
 *     then render this as a screen footer via absolute positioning. */
function BottomNav({
  active,
  onChange,
  onAction,
  actionOpen,
  mode = 'lite'
}) {
  const accent = mode === 'pro' ? 'var(--info)' : 'var(--brand-primary)';
  const LEFT = [{
    id: 'home',
    icon: 'home',
    label: 'HOME'
  }, {
    id: 'transactions',
    icon: 'receipt_long',
    label: 'TRANS'
  }];
  const RIGHT = [{
    id: 'jars',
    icon: 'savings',
    label: 'JARS'
  }, {
    id: 'config',
    icon: 'settings',
    label: 'SETTINGS'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 82,
      flexShrink: 0,
      background: 'var(--surface-1)',
      borderTop: '1px solid var(--border-hairline)',
      display: 'flex',
      alignItems: 'flex-start',
      paddingTop: 8,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 6,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 120,
      height: 4,
      borderRadius: 2,
      background: 'var(--fg-3)',
      opacity: 0.4
    }
  }), LEFT.map(item => /*#__PURE__*/React.createElement(NavTabItem, {
    key: item.id,
    item: item,
    active: active === item.id,
    onClick: () => onChange(item.id),
    accent: accent
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onAction,
    style: {
      width: 56,
      height: 56,
      border: 0,
      cursor: 'pointer',
      borderRadius: 28,
      background: accent,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 4px 16px ${mode === 'pro' ? 'rgba(14,165,233,0.35)' : 'rgba(30,58,138,0.35)'}`,
      transform: actionOpen ? 'rotate(45deg)' : 'rotate(0deg)',
      transition: 'transform 240ms var(--ease-out), background 180ms',
      marginTop: -20
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 28
    }
  }, actionOpen ? 'close' : 'add'))), RIGHT.map(item => /*#__PURE__*/React.createElement(NavTabItem, {
    key: item.id,
    item: item,
    active: active === item.id,
    onClick: () => onChange(item.id),
    accent: accent
  })));
}
function NavTabItem({
  item,
  active,
  onClick,
  accent
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      flex: 1,
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      paddingTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 24,
      color: active ? accent : 'var(--fg-3)'
    }
  }, item.icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 9,
      fontWeight: 600,
      letterSpacing: '0.08em',
      color: active ? accent : 'var(--fg-3)',
      textTransform: 'uppercase'
    }
  }, item.label));
}

/* ── HomeHeader ─────────────────────────────────────────────────────────
 * Greeting + avatar + icon actions for the Home screen.
 * Separate from MobileHeader because Home is not a stack screen. */
function HomeHeader({
  name = 'José',
  balanceVisible,
  onToggle,
  onNotifications,
  mode
}) {
  const greeting = new Date().getHours() < 12 ? 'Buenos días,' : new Date().getHours() < 19 ? 'Buenas tardes,' : 'Buenas noches,';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 20px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--fg-2)'
    }
  }, greeting), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 22,
      color: 'var(--fg-1)'
    }
  }, name)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(IconButtonMobile, {
    icon: balanceVisible ? 'visibility' : 'visibility_off',
    onPress: onToggle,
    size: 38
  }), /*#__PURE__*/React.createElement(IconButtonMobile, {
    icon: "notifications",
    onPress: onNotifications,
    badge: 2,
    size: 38
  })));
}
Object.assign(window, {
  MobileStatusBar,
  MobileHeader,
  BottomNav,
  HomeHeader
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/components/Navigation.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/components/QuickActionSheet.jsx
try { (() => {
/* ─── OW Finance Mobile — Quick Action Sheet ─────────────────────────────
 * This is the "+" center button bottom sheet.
 * Shows 6 actions in a 3×2 grid + AI advisor CTA.
 *
 * RN MAPPING:
 *   Use react-native-bottom-sheet or @gorhom/bottom-sheet.
 *   The overlay backdrop → <Pressable> with absolute fill + opacity anim.
 *   The sheet itself → BottomSheetModal snapping to 65% screen height.
 *   Grid items → FlatList numColumns={3} inside the sheet.
 *   Gradient button → expo-linear-gradient or react-native-linear-gradient.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

const ACTIONS = [{
  id: 'expense',
  label: 'Gasto',
  icon: 'arrow_outward',
  color: '#EF4444',
  bg: 'rgba(239,68,68,0.14)'
}, {
  id: 'income',
  label: 'Ingreso',
  icon: 'arrow_downward',
  color: '#10B981',
  bg: 'rgba(16,185,129,0.14)'
}, {
  id: 'transfer',
  label: 'Transferir',
  icon: 'swap_horiz',
  color: '#8B5CF6',
  bg: 'rgba(139,92,246,0.14)'
}, {
  id: 'voice',
  label: 'Voz',
  icon: 'mic',
  color: '#0EA5E9',
  bg: 'rgba(14,165,233,0.14)'
}, {
  id: 'scan',
  label: 'Escanear',
  icon: 'qr_code_scanner',
  color: '#F59E0B',
  bg: 'rgba(245,158,11,0.14)'
}, {
  id: 'ai',
  label: 'Auto IA',
  icon: 'auto_awesome',
  color: '#fff',
  bg: '#0EA5E9',
  solid: true
}];

/* ── QuickActionSheet ───────────────────────────────────────────────────
 * Props:
 *   open(bool)       — whether the sheet is visible
 *   onClose(fn)      — dismisses the sheet
 *   onOpenAI(fn)     — opens the AI advisor chat
 *   onAction(fn)     — called with action id when a grid item is tapped
 *   mode             — 'lite' | 'pro' (pro shows all 6, lite shows 3+AI)
 */
function QuickActionSheet({
  open,
  onClose,
  onOpenAI,
  onSelectAction,
  mode = 'lite'
}) {
  const actions = mode === 'lite' ? [ACTIONS[0], ACTIONS[1], ACTIONS[2]] // Lite: Gasto · Ingreso · Transferir
  : ACTIONS; // Pro: full 6

  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 80,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(5,8,18,0.72)',
      animation: 'sheetFadeIn 220ms var(--ease-out)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      background: 'var(--surface-1)',
      borderRadius: '28px 28px 0 0',
      padding: '10px 20px 24px',
      boxShadow: '0 -8px 40px rgba(0,0,0,0.40)',
      animation: 'sheetSlideUp 280ms var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("style", null, `
          @keyframes sheetFadeIn  { from { opacity: 0 } to { opacity: 1 } }
          @keyframes sheetSlideUp { from { transform: translateY(60px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        `), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 4,
      borderRadius: 2,
      background: 'var(--surface-3)',
      margin: '6px auto 22px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${mode === 'lite' ? 3 : 3}, 1fr)`,
      gap: mode === 'lite' ? '20px 12px' : '20px 12px',
      marginBottom: 24
    }
  }, actions.map(a => /*#__PURE__*/React.createElement(ActionTile, {
    key: a.id,
    action: a,
    onPress: () => {
      if (a.id === 'ai') {
        onClose();
        onOpenAI && onOpenAI();
      } else {
        onClose();
        onSelectAction && onSelectAction(a.id);
      }
    }
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      onClose();
      onOpenAI && onOpenAI();
    },
    style: {
      width: '100%',
      border: 0,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: '16px',
      borderRadius: 'var(--radius-pill)',
      background: 'linear-gradient(90deg, #7C3AED 0%, #2563EB 50%, #0EA5E9 100%)',
      color: '#fff',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 16,
      boxShadow: '0 6px 24px rgba(124,58,237,0.35)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 22
    }
  }, "psychology"), "Hablar con Asesor IA")));
}

/* ── ActionTile ─────────────────────────────────────────────────────────
 * Individual grid item: large icon circle + label.
 * RN: <TouchableOpacity> → <View circle> + <Text> */
function ActionTile({
  action: a,
  onPress
}) {
  const [pressed, setPressed] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onPress,
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    onMouseLeave: () => setPressed(false),
    style: {
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      transform: pressed ? 'scale(0.93)' : 'scale(1)',
      transition: 'transform 80ms'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 72,
      height: 72,
      borderRadius: 36,
      background: a.solid ? a.bg : a.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: a.solid ? `0 4px 16px ${a.bg}66` : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 30,
      color: a.solid ? a.color : a.color
    }
  }, a.icon)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 500,
      fontSize: 13,
      color: 'var(--fg-1)'
    }
  }, a.label));
}
Object.assign(window, {
  QuickActionSheet,
  ActionTile,
  ACTIONS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/components/QuickActionSheet.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/components/SmartTransactionSheet.jsx
try { (() => {
/* ─── Smart Transaction Sheet — Mobile ──────────────────────────────────
 * Bottom sheet for transaction entry with text · voice · photo.
 * Claude parses the input into a structured transaction preview.
 * Props: open, onClose, initialType, initialTab
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const {
  useState: useSTSState,
  useEffect: useSTSEffect
} = React;
const STS_SYSTEM = `You are a financial transaction parser for OW Finance 2026.
Parse the user's description. Return ONLY valid JSON:
{
  "type": "expense"|"income"|"transfer",
  "amount": <positive number>,
  "currency": "USD"|"EUR"|"VES"|"COP"|"CLP",
  "merchant": "<name>",
  "category": "Vivienda"|"Supermercado"|"Transporte"|"Salud"|"Entretenimiento"|"Educación"|"Ingresos"|"Jar"|"Deuda"|"Otro",
  "account": "<account name or Cuenta principal>",
  "confidence": "high"|"medium"|"low",
  "suggestion": "<1 sentence in Spanish>"
}`;
const STS_TYPE_CFG = {
  expense: {
    label: 'Gasto',
    color: 'var(--expense)',
    icon: 'arrow_outward',
    placeholder: 'Ej: Gasté $45 en Whole Foods, cuenta BofA'
  },
  income: {
    label: 'Ingreso',
    color: 'var(--income)',
    icon: 'arrow_downward',
    placeholder: 'Ej: Recibí $1,200 de cliente, factura 043'
  },
  transfer: {
    label: 'Transferir',
    color: '#8B5CF6',
    icon: 'swap_horiz',
    placeholder: 'Ej: Moví $200 al jar de vacaciones'
  }
};
const STS_VOICE_MOCKS = {
  expense: 'Gasté $45 en Whole Foods, BofA corriente, supermercado',
  income: 'Recibí $1,200 de pago freelance, cuenta ahorros',
  transfer: 'Moví $200 al jar de vacaciones desde BofA'
};
function SmartTransactionSheet({
  open,
  onClose,
  initialType = 'expense',
  initialTab = 'text'
}) {
  const [type, setType] = useSTSState(initialType);
  const [tab, setTab] = useSTSState(initialTab);
  const [text, setText] = useSTSState('');
  const [loading, setLoading] = useSTSState(false);
  const [result, setResult] = useSTSState(null);
  const [error, setError] = useSTSState(null);
  const [recording, setRecording] = useSTSState(false);
  useSTSEffect(() => {
    if (open) {
      setType(initialType);
      setTab(initialTab);
      setText('');
      setResult(null);
      setError(null);
      setRecording(false);
    }
  }, [open, initialType, initialTab]);
  if (!open) return null;
  const cfg = STS_TYPE_CFG[type];
  const analyze = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const raw = await window.claude.complete({
        system: STS_SYSTEM,
        messages: [{
          role: 'user',
          content: text
        }]
      });
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('no json');
      setResult(JSON.parse(match[0]));
    } catch {
      setError('No pude interpretar. Sé más específico con monto y descripción.');
    }
    setLoading(false);
  };
  const startRecording = () => {
    setRecording(true);
    setTimeout(() => {
      setText(STS_VOICE_MOCKS[type]);
      setRecording(false);
      setTab('text');
    }, 2800);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 90
    }
  }, /*#__PURE__*/React.createElement("style", null, `@keyframes stsUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}} @keyframes stsBg{from{opacity:0}to{opacity:1}} @keyframes stsPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}`), /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(5,8,18,0.70)',
      animation: 'stsBg 200ms'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--surface-1)',
      borderRadius: '24px 24px 0 0',
      padding: '10px 0 24px',
      animation: 'stsUp 280ms var(--ease-out)',
      maxHeight: '90%',
      overflowY: 'auto',
      scrollbarWidth: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 4,
      borderRadius: 2,
      background: 'var(--surface-3)',
      margin: '6px auto 18px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 17,
      color: 'var(--fg-1)'
    }
  }, "Nuevo movimiento"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--fg-2)',
      padding: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 22
    }
  }, "close"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 16,
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-pill)',
      padding: 4
    }
  }, Object.entries(STS_TYPE_CFG).map(([k, v]) => {
    const active = type === k;
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      onClick: () => {
        setType(k);
        setResult(null);
        setError(null);
      },
      style: {
        flex: 1,
        border: 0,
        cursor: 'pointer',
        padding: '8px 4px',
        borderRadius: 'var(--radius-pill)',
        background: active ? 'var(--surface-1)' : 'transparent',
        color: active ? v.color : 'var(--fg-2)',
        fontFamily: 'var(--font-body)',
        fontWeight: active ? 700 : 500,
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        boxShadow: active ? 'var(--shadow-card)' : 'none',
        transition: 'all 160ms'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 15
      }
    }, v.icon), v.label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 14
    }
  }, [['text', 'edit', 'Texto'], ['voice', 'mic', 'Voz'], ['photo', 'photo_camera', 'Foto']].map(([t, icon, label]) => {
    const active = tab === t;
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      onClick: () => {
        setTab(t);
        setResult(null);
        setError(null);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '7px 12px',
        border: 0,
        cursor: 'pointer',
        borderRadius: 'var(--radius-pill)',
        background: active ? 'var(--brand-primary-soft)' : 'var(--surface-2)',
        color: active ? 'var(--brand-primary-fg-soft)' : 'var(--fg-2)',
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        transition: 'all 160ms'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "material-icons",
      style: {
        fontSize: 14
      }
    }, icon), label);
  })), tab === 'text' && /*#__PURE__*/React.createElement("textarea", {
    value: text,
    onChange: e => {
      setText(e.target.value);
      setResult(null);
      setError(null);
    },
    placeholder: cfg.placeholder,
    disabled: loading,
    rows: 3,
    style: {
      width: '100%',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 14px',
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      color: 'var(--fg-1)',
      background: 'var(--surface-2)',
      resize: 'none',
      outline: 'none',
      lineHeight: 1.5,
      boxSizing: 'border-box'
    },
    onFocus: e => e.target.style.borderColor = 'var(--brand-primary)',
    onBlur: e => e.target.style.borderColor = 'var(--border-hairline)'
  }), tab === 'voice' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 14,
      padding: '24px 16px',
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-md)'
    }
  }, recording ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: 32,
      background: 'rgba(239,68,68,.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'stsPulse 1s infinite'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 32,
      color: 'var(--expense)'
    }
  }, "mic")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--expense)'
    }
  }, "Escuchando...")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: startRecording,
    style: {
      width: 64,
      height: 64,
      borderRadius: 32,
      background: 'var(--brand-primary)',
      border: 0,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 20px rgba(30,58,138,.35)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 32,
      color: '#fff'
    }
  }, "mic")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--fg-1)'
    }
  }, "Toca para dictar"))), tab === 'photo' && /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      border: '2px dashed var(--border-hairline)',
      borderRadius: 'var(--radius-md)',
      padding: '28px 16px',
      cursor: 'pointer',
      background: 'var(--surface-2)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    style: {
      display: 'none'
    },
    onChange: e => {
      if (e.target.files[0]) {
        setText(`Recibo adjunto: ${e.target.files[0].name}`);
        setTab('text');
      }
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 40,
      color: 'var(--fg-3)'
    }
  }, "receipt_long"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--fg-1)'
    }
  }, "Sube un comprobante"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--fg-2)',
      textAlign: 'center'
    }
  }, "La IA extrae monto y comercio")), error && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      padding: '10px 14px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--expense-soft)',
      color: 'var(--expense-fg)',
      fontFamily: 'var(--font-body)',
      fontSize: 13
    }
  }, error), result && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      padding: '14px 16px',
      borderRadius: 'var(--radius-lg)',
      background: result.type === 'income' ? 'var(--income-soft)' : result.type === 'expense' ? 'var(--expense-soft)' : 'var(--brand-primary-soft)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 20,
      color: result.type === 'income' ? 'var(--income)' : result.type === 'expense' ? 'var(--expense)' : '#8B5CF6'
    }
  }, result.type === 'income' ? 'arrow_downward' : result.type === 'expense' ? 'arrow_outward' : 'swap_horiz'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 20,
      color: 'var(--fg-1)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, result.currency, " ", (+result.amount).toLocaleString('en-US', {
    minimumFractionDigits: 2
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--fg-2)'
    }
  }, result.merchant, " \xB7 ", result.category))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--fg-1)',
      fontStyle: 'italic'
    }
  }, "\"", result.suggestion, "\"")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 16
    }
  }, result && /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setResult(null);
      setTab('text');
    },
    style: {
      flex: 1,
      border: '1px solid var(--border-hairline)',
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-pill)',
      padding: '13px',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: 14,
      color: 'var(--fg-1)'
    }
  }, "Editar"), /*#__PURE__*/React.createElement("button", {
    onClick: result ? onClose : analyze,
    disabled: !result && (!text.trim() || loading),
    style: {
      flex: result ? 1 : 'auto',
      width: result ? 'auto' : '100%',
      border: 0,
      borderRadius: 'var(--radius-pill)',
      padding: '13px 20px',
      cursor: 'pointer',
      background: 'var(--brand-primary)',
      color: '#fff',
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      opacity: !result && (!text.trim() || loading) ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18
    }
  }, result ? 'check' : 'auto_awesome'), result ? 'Confirmar' : loading ? 'Analizando...' : 'Analizar con IA')))));
}
const STS_ACTION_MAP = {
  expense: {
    type: 'expense',
    tab: 'text'
  },
  income: {
    type: 'income',
    tab: 'text'
  },
  transfer: {
    type: 'transfer',
    tab: 'text'
  },
  voice: {
    type: 'expense',
    tab: 'voice'
  },
  scan: {
    type: 'expense',
    tab: 'photo'
  },
  autoai: {
    type: 'expense',
    tab: 'text'
  }
};
Object.assign(window, {
  SmartTransactionSheet,
  STS_ACTION_MAP
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/components/SmartTransactionSheet.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/components/TransactionComponents.jsx
try { (() => {
/* ─── OW Finance Mobile — Transaction Components ─────────────────────────
 * RN: TransactionRow → custom ListItem inside <FlatList>
 *     DayHeader → FlatList's renderSectionHeader (use SectionList)
 *     Use react-native-swipeable for swipe actions on rows.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

/* ── TransactionRow ─────────────────────────────────────────────────────
 * Single transaction list item.
 * Props: tx(object) hidden(bool) dense(bool) */
function TransactionRow({
  tx,
  hidden = false,
  dense = false
}) {
  const isIncome = tx.amount > 0;
  const amt = Math.abs(tx.amount);
  const fmt = amt.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: dense ? '10px 20px' : '13px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: dense ? 34 : 40,
      height: dense ? 34 : 40,
      borderRadius: dense ? 17 : 20,
      flexShrink: 0,
      background: isIncome ? 'var(--income-soft)' : 'var(--expense-soft)',
      color: isIncome ? 'var(--income-fg)' : 'var(--expense-fg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: dense ? 16 : 18
    }
  }, isIncome ? 'arrow_downward' : 'arrow_outward')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 500,
      fontSize: dense ? 13 : 14,
      color: 'var(--fg-1)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, tx.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--fg-2)'
    }
  }, tx.time ? `${tx.day} · ${tx.time}` : tx.day)), dense && /*#__PURE__*/React.createElement(MobileChip, {
    variant: isIncome ? 'income' : 'default',
    size: "sm"
  }, tx.category), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 600,
      fontSize: 14,
      fontVariantNumeric: 'tabular-nums',
      color: isIncome ? 'var(--income-fg)' : 'var(--expense-fg)',
      flexShrink: 0
    }
  }, hidden ? '••••' : `${isIncome ? '+' : '−'} $ ${fmt}`));
}

/* ── DayHeader ──────────────────────────────────────────────────────────
 * Section header for a grouped transactions list.
 * RN: renderSectionHeader in SectionList */
function DayHeader({
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 20px 6px',
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: 'var(--fg-2)',
      background: 'var(--bg-canvas)'
    }
  }, label);
}

/* ── TransactionList ────────────────────────────────────────────────────
 * Grouped list by day. Renders DayHeader + TransactionRows.
 * Props: transactions(array) hidden(bool) dense(bool) limit(number|null) */
function TransactionList({
  transactions,
  hidden = false,
  dense = false,
  limit
}) {
  const items = limit ? transactions.slice(0, limit) : transactions;
  // Group by day
  const groups = items.reduce((acc, tx) => {
    if (!acc[tx.day]) acc[tx.day] = [];
    acc[tx.day].push(tx);
    return acc;
  }, {});
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
      margin: '0 16px'
    }
  }, Object.entries(groups).map(([day, txs], gi) => /*#__PURE__*/React.createElement("div", {
    key: day
  }, gi > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-hairline)',
      margin: '0 20px'
    }
  }), /*#__PURE__*/React.createElement(DayHeader, {
    label: day
  }), txs.map((tx, i) => /*#__PURE__*/React.createElement("div", {
    key: tx.id
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-hairline)',
      margin: '0 20px'
    }
  }), /*#__PURE__*/React.createElement(TransactionRow, {
    tx: tx,
    hidden: hidden,
    dense: dense
  }))))));
}

/* ── SectionTitle ───────────────────────────────────────────────────────
 * Section header with optional CTA link. */
function SectionTitle({
  title,
  action,
  onAction,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 20px',
      marginBottom: 10,
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      fontSize: 16,
      color: 'var(--fg-1)'
    }
  }, title), action && /*#__PURE__*/React.createElement("button", {
    onClick: onAction,
    style: {
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--brand-primary)'
    }
  }, action));
}
Object.assign(window, {
  TransactionRow,
  DayHeader,
  TransactionList,
  SectionTitle
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/components/TransactionComponents.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/data.jsx
try { (() => {
/* ─── OW Finance Mobile — Data & Seeds ───────────────────────────────────
 * RN: Move to a dedicated /src/data/ folder or a mock API layer.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

const MOBILE_TX = [{
  id: 1,
  label: 'Nómina · Freelance',
  amount: 3200.00,
  day: 'Hoy · Mar 14',
  time: '09:02',
  category: 'Ingreso'
}, {
  id: 2,
  label: 'Whole Foods Market',
  amount: -84.12,
  day: 'Hoy · Mar 14',
  time: '14:42',
  category: 'Supermercado'
}, {
  id: 3,
  label: 'Uber · viaje aeropuerto',
  amount: -32.60,
  day: 'Hoy · Mar 14',
  time: '06:18',
  category: 'Transporte'
}, {
  id: 4,
  label: 'Spotify Family',
  amount: -16.99,
  day: 'Ayer · Mar 13',
  time: '',
  category: 'Suscripciones'
}, {
  id: 5,
  label: 'Transfer → Jar Vacaciones',
  amount: -200.00,
  day: 'Ayer · Mar 13',
  time: '',
  category: 'Jar'
}, {
  id: 6,
  label: 'Factura freelance #042',
  amount: 720.00,
  day: 'Dom · Mar 12',
  time: '',
  category: 'Ingreso'
}, {
  id: 7,
  label: 'Costco · compra mensual',
  amount: -184.30,
  day: 'Sáb · Mar 11',
  time: '',
  category: 'Supermercado'
}, {
  id: 8,
  label: 'Renta · Marzo',
  amount: -1450.00,
  day: 'Vie · Mar 10',
  time: '',
  category: 'Vivienda'
}];
const MOBILE_JARS = [{
  id: 1,
  name: 'Emergencia',
  amount: 4200.00,
  goal: 6800.00,
  progress: 62,
  tone: 'brand',
  sub: 'Seguridad'
}, {
  id: 2,
  name: 'Vacaciones',
  amount: 1820.00,
  goal: 2000.00,
  progress: 91,
  tone: 'income',
  sub: 'Lisboa · Verano'
}, {
  id: 3,
  name: 'Laptop',
  amount: 980.00,
  goal: 2000.00,
  progress: 49,
  tone: 'brand',
  sub: 'Compra Q3'
}, {
  id: 4,
  name: 'Salud',
  amount: 1240.00,
  goal: 1240.00,
  progress: 100,
  tone: 'income',
  sub: 'Seguro + meds'
}, {
  id: 5,
  name: 'Inactivo',
  amount: 540.20,
  goal: 2200.00,
  progress: 24,
  tone: 'warn',
  sub: 'Sugerido mover'
}, {
  id: 6,
  name: 'Regalos',
  amount: 180.00,
  goal: 500.00,
  progress: 36,
  tone: 'brand',
  sub: 'Fiestas'
}];

// AI chat seed conversation (matches screenshots)
const AI_SEED = [{
  id: 1,
  role: 'ai',
  time: '14:22',
  parts: [{
    text: '¡Hola! He revisado tus finanzas.\nTasa de ahorro: ',
    plain: true
  }, {
    text: '42%',
    color: '#10B981'
  }, {
    text: '. Sugiero redirigir ',
    plain: true
  }, {
    text: '$50',
    color: '#0EA5E9'
  }, {
    text: ' al jar de emergencia.',
    plain: true
  }],
  ctas: ['Asignar $50', 'Detalles']
}, {
  id: 2,
  role: 'user',
  time: '14:25',
  parts: [{
    text: '¿Cómo pago mi tarjeta más rápido?',
    plain: true
  }]
}, {
  id: 3,
  role: 'ai',
  time: '14:26',
  parts: [{
    text: 'Según tu perfil freelancer: Usa ',
    plain: true
  }, {
    text: 'método Avalancha',
    color: '#F59E0B'
  }, {
    text: '. Esto minimizará los intereses acumulados rápidamente.',
    plain: true
  }],
  ctas: ['Crear plan de pago']
}];
const QUICK_REPLIES = ['Analiza gastos', 'Consejos', 'Próximos pagos', '¿Cuánto ahorré?'];
Object.assign(window, {
  MOBILE_TX,
  MOBILE_JARS,
  AI_SEED,
  QUICK_REPLIES
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/screens/AIAdvisorScreen.jsx
try { (() => {
/* ─── AI Advisor Screen ──────────────────────────────────────────────────
 * Full-screen AI financial advisor chat with real Claude responses.
 * Seeds with the conversation from the reference screenshot.
 *
 * RN MAPPING:
 *   Message list → <FlatList inverted> for auto-scroll-to-bottom.
 *   Input area   → <KeyboardAvoidingView behavior="padding">.
 *   Typing bubble→ Animated 3-dot component.
 *   CTA buttons  → TouchableOpacity pills below AI bubbles.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const {
  useState: useAIState,
  useEffect: useAIEffect,
  useRef: useAIRef
} = React;
const AI_SYSTEM = `You are the AI Financial Advisor ("Asesor Financiero IA") for OW Finance 2026.
User: José Otero, 35, freelancer, Lima, Peru.
Finances: balance $12,480.50 USD · savings rate 42% · monthly income ~$4,820 · monthly expenses ~$2,360.
Jars: Emergency $4,200 (62%) · Vacation $1,820 (91%) · Laptop $980 (49%) · Health $1,240 (100%) · Idle $540 (24%) · Gifts $180 (36%).
Credit card: $850 at 17.9% APR. Next bill: Renta $1,450 on Jun 10.

Rules:
- Always respond in Spanish
- Be brief: 2-3 sentences max
- When you suggest a concrete action, end with exactly this on its own line: [CTA: button text here]
- Tone: calm, professional, empathetic
- No emojis or markdown bold/italic
- Never mention Claude, OpenAI, or any third-party AI — you are OW Finance's native advisor`;
function AIAdvisorScreen({
  onBack
}) {
  const [messages, setMessages] = useAIState([...AI_SEED]);
  const [input, setInput] = useAIState('');
  const [loading, setLoading] = useAIState(false);
  const bottomRef = useAIRef(null);
  useAIEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollTop = bottomRef.current.scrollHeight;
    }
  }, [messages, loading]);
  const sendMessage = async text => {
    const t = (text || input).trim();
    if (!t || loading) return;
    setInput('');
    const userMsg = {
      id: Date.now(),
      role: 'user',
      time: new Date().toTimeString().slice(0, 5),
      parts: [{
        text: t,
        plain: true
      }]
    };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    try {
      // Build conversation for Claude (flatten parts to plain text)
      const history = [...messages, userMsg].map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: (m.parts || []).map(p => p.text).join('')
      }));
      const raw = await window.claude.complete({
        messages: history,
        system: AI_SYSTEM
      });

      // Parse [CTA: ...] tags
      const ctaMatch = raw.match(/\[CTA:\s*(.+?)\]/);
      const cta = ctaMatch ? ctaMatch[1].trim() : null;
      const cleanText = raw.replace(/\[CTA:\s*.+?\]/g, '').trim();
      setMessages(m => [...m, {
        id: Date.now() + 1,
        role: 'ai',
        time: new Date().toTimeString().slice(0, 5),
        parts: [{
          text: cleanText,
          plain: true
        }],
        ctas: cta ? [cta] : []
      }]);
    } catch {
      setMessages(m => [...m, {
        id: Date.now() + 1,
        role: 'ai',
        time: new Date().toTimeString().slice(0, 5),
        parts: [{
          text: 'Lo siento, no pude conectar. Intenta de nuevo.',
          plain: true
        }],
        ctas: []
      }]);
    }
    setLoading(false);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(MobileHeader, {
    title: "Asesor Financiero IA",
    subtitle: "EN L\xCDNEA",
    onBack: onBack,
    variant: "ai",
    rightActions: [{
      icon: 'more_vert',
      onPress: () => {}
    }]
  }), /*#__PURE__*/React.createElement(Divider, {
    mx: 0
  }), /*#__PURE__*/React.createElement("div", {
    ref: bottomRef,
    style: {
      flex: 1,
      overflowY: 'auto',
      scrollbarWidth: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: '16px 0'
    }
  }, messages.map(msg => /*#__PURE__*/React.createElement(ChatBubble, {
    key: msg.id,
    message: msg,
    onCta: cta => sendMessage(cta)
  })), loading && /*#__PURE__*/React.createElement(TypingBubble, null), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8
    }
  })), /*#__PURE__*/React.createElement(ChatInput, {
    value: input,
    onChange: setInput,
    onSend: () => sendMessage(input),
    loading: loading
  }));
}
Object.assign(window, {
  AIAdvisorScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/screens/AIAdvisorScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/screens/HomeScreenLite.jsx
try { (() => {
/* ─── Home Screen — Lite ─────────────────────────────────────────────────
 * Calm, money-first layout. Balance + jars + 5 recent transactions.
 * No charts, no KPI grid, generous whitespace.
 *
 * RN: This entire screen is a <ScrollView> with a <View> for the sticky header.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

function HomeScreenLite({
  hidden,
  onToggleVisible,
  onGoTo,
  onOpenAI
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      scrollbarWidth: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 0 0'
    }
  }, /*#__PURE__*/React.createElement(HomeHeader, {
    balanceVisible: !hidden,
    onToggle: onToggleVisible,
    onNotifications: () => {},
    mode: "lite"
  })), /*#__PURE__*/React.createElement(BalanceCard, {
    amount: 12480.50,
    currency: "USD",
    hidden: hidden,
    mode: "lite",
    delta: {
      value: 4.2,
      label: 'MoM'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 24
    }
  }), /*#__PURE__*/React.createElement(JarsRow, {
    jars: MOBILE_JARS.slice(0, 4),
    hidden: hidden,
    onViewAll: () => onGoTo('jars')
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 24
    }
  }), /*#__PURE__*/React.createElement(SectionTitle, {
    title: "Recientes",
    action: "Ver todo",
    onAction: () => onGoTo('transactions')
  }), /*#__PURE__*/React.createElement(TransactionList, {
    transactions: MOBILE_TX,
    hidden: hidden,
    limit: 4
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 32
    }
  }));
}
Object.assign(window, {
  HomeScreenLite
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/screens/HomeScreenLite.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/screens/HomeScreenPro.jsx
try { (() => {
/* ─── Home Screen — Pro ──────────────────────────────────────────────────
 * Denser layout: balance with KPI strip + quick stats + more transactions.
 * Pro uses cyan as the primary accent on the balance card.
 *
 * RN: Same ScrollView structure, but use a SectionList to support
 *     sticky "quick stats" subheader.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

function HomeScreenPro({
  hidden,
  onToggleVisible,
  onGoTo
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      scrollbarWidth: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 0 0'
    }
  }, /*#__PURE__*/React.createElement(HomeHeader, {
    balanceVisible: !hidden,
    onToggle: onToggleVisible,
    onNotifications: () => {},
    mode: "pro"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 16px',
      background: 'linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px 22px 20px',
      boxShadow: '0 8px 28px rgba(14,165,233,0.35)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.65)'
    }
  }, "Disponible \xB7 USD"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.06em',
      padding: '4px 10px',
      borderRadius: 'var(--radius-pill)',
      background: 'rgba(255,255,255,0.15)',
      color: '#fff'
    }
  }, "PRO")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 44,
      lineHeight: 1,
      letterSpacing: -1,
      color: '#fff',
      fontVariantNumeric: 'tabular-nums'
    }
  }, hidden ? '$ ••••••' : '$ 12,480.50'), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 14,
      borderTop: '1px solid rgba(255,255,255,0.15)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 0
    }
  }, [['Ingresos', '+$4,820', '#6EE7B7'], ['Gastos', '−$2,361', '#FCA5A5'], ['Neto', '+$2,459', '#fff']].map(([l, v, c]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      color: 'rgba(255,255,255,0.55)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em'
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontSize: 15,
      fontWeight: 600,
      color: c,
      fontVariantNumeric: 'tabular-nums'
    }
  }, hidden ? '••••' : v))))), /*#__PURE__*/React.createElement(QuickStatRow, {
    hidden: hidden
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 22
    }
  }), /*#__PURE__*/React.createElement(SectionTitle, {
    title: "Gastos por categor\xEDa",
    action: "Ver an\xE1lisis",
    onAction: () => {}
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 16px 22px',
      background: 'var(--surface-1)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, [['Vivienda', 61, '#0EA5E9'], ['Supermercado', 23, '#10B981'], ['Transporte', 9, '#F59E0B'], ['Suscripciones', 7, '#8B5CF6']].map(([cat, pct, color]) => /*#__PURE__*/React.createElement("div", {
    key: cat,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--fg-1)',
      width: 100,
      flexShrink: 0
    }
  }, cat), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      background: 'var(--surface-2)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${pct}%`,
      background: color,
      borderRadius: 3
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--fg-2)',
      width: 28,
      textAlign: 'right'
    }
  }, pct, "%")))), /*#__PURE__*/React.createElement(JarsRow, {
    jars: MOBILE_JARS.slice(0, 4),
    hidden: hidden,
    onViewAll: () => onGoTo('jars')
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 22
    }
  }), /*#__PURE__*/React.createElement(SectionTitle, {
    title: "Movimientos",
    action: "Ver todo",
    onAction: () => onGoTo('transactions')
  }), /*#__PURE__*/React.createElement(TransactionList, {
    transactions: MOBILE_TX,
    hidden: hidden,
    dense: true,
    limit: 5
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 32
    }
  }));
}
Object.assign(window, {
  HomeScreenPro
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/screens/HomeScreenPro.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/screens/JarsScreen.jsx
try { (() => {
/* ─── Jars Screen ────────────────────────────────────────────────────────
 * RN: Header → Stack header. Summary → custom View card.
 *     Grid → FlatList numColumns={2}.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

function JarsScreen({
  hidden,
  onBack
}) {
  const total = MOBILE_JARS.reduce((s, j) => s + j.amount, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(MobileHeader, {
    title: "Jars",
    subtitle: "Dinero apartado",
    onBack: onBack,
    rightActions: [{
      icon: 'add',
      onPress: () => {}
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      scrollbarWidth: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '8px 16px 16px',
      background: 'var(--brand-primary)',
      borderRadius: 'var(--radius-xl)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.65)'
    }
  }, "Total en jars \xB7 USD"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontWeight: 700,
      fontSize: 38,
      color: '#fff',
      lineHeight: 1,
      letterSpacing: -0.8,
      fontVariantNumeric: 'tabular-nums'
    }
  }, hidden ? '$ ••••••' : `$ ${total.toLocaleString('en-US', {
    minimumFractionDigits: 2
  })}`), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      paddingTop: 10,
      borderTop: '1px solid rgba(255,255,255,0.15)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      color: 'rgba(255,255,255,0.55)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em'
    }
  }, "Jars activos"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontSize: 18,
      fontWeight: 700,
      color: '#fff'
    }
  }, MOBILE_JARS.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      color: 'rgba(255,255,255,0.55)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em'
    }
  }, "Necesita atenci\xF3n"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-money)',
      fontSize: 18,
      fontWeight: 700,
      color: '#FCD34D'
    }
  }, "1")))), /*#__PURE__*/React.createElement(JarGrid, {
    jars: MOBILE_JARS,
    hidden: hidden
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 24
    }
  })));
}
Object.assign(window, {
  JarsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/screens/JarsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/screens/SettingsScreen.jsx
try { (() => {
/* ─── Settings Screen ────────────────────────────────────────────────────
 * RN: Use SectionList for grouped settings.
 *     Toggle → RN Switch component.
 *     Row → TouchableOpacity with chevron.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const {
  useState: useCfgMobileState
} = React;
const SETTINGS_GROUPS = [{
  label: 'Cuenta',
  items: [{
    icon: 'person',
    label: 'Perfil',
    hint: 'José Otero',
    chevron: true
  }, {
    icon: 'savings',
    label: 'Cuentas vinculadas',
    hint: '3 tarjetas · 1 banco',
    chevron: true
  }, {
    icon: 'receipt_long',
    label: 'Exportar datos',
    hint: 'CSV, PDF',
    chevron: true
  }]
}, {
  label: 'Visualización',
  items: [{
    icon: 'visibility',
    label: 'Ocultar saldos por defecto',
    toggle: 'hideBal',
    value: false
  }, {
    icon: 'settings',
    label: 'Divisa predeterminada',
    hint: 'USD',
    chevron: true
  }]
}, {
  label: 'Notificaciones',
  items: [{
    icon: 'notifications',
    label: 'Resumen semanal',
    toggle: 'weekDigest',
    value: true
  }, {
    icon: 'notifications',
    label: 'Alertas de dinero ocioso',
    toggle: 'idleAlerts',
    value: true
  }, {
    icon: 'notifications',
    label: 'Alerta de sobrepresupuesto',
    toggle: 'overBudget',
    value: false
  }]
}, {
  label: '',
  items: [{
    icon: 'close',
    label: 'Cerrar sesión',
    destructive: true
  }]
}];
function SettingsScreen({
  onBack
}) {
  const initToggles = {};
  SETTINGS_GROUPS.forEach(g => g.items.forEach(it => {
    if (it.toggle) initToggles[it.toggle] = it.value;
  }));
  const [toggles, setToggles] = useCfgMobileState(initToggles);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(MobileHeader, {
    title: "Configuraci\xF3n",
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      scrollbarWidth: 'none',
      padding: '8px 0'
    }
  }, SETTINGS_GROUPS.map((group, gi) => /*#__PURE__*/React.createElement("div", {
    key: gi,
    style: {
      marginBottom: 20
    }
  }, group.label && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 20px 8px',
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: 'var(--fg-2)'
    }
  }, group.label), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-1)',
      margin: '0 16px',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)'
    }
  }, group.items.map((item, ii) => /*#__PURE__*/React.createElement("div", {
    key: ii
  }, ii > 0 && /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("button", {
    onClick: item.toggle ? () => setToggles(s => ({
      ...s,
      [item.toggle]: !s[item.toggle]
    })) : undefined,
    style: {
      width: '100%',
      border: 0,
      background: 'transparent',
      cursor: item.toggle || item.chevron ? 'pointer' : 'default',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 18px',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 20,
      color: item.destructive ? 'var(--expense)' : 'var(--fg-2)',
      flexShrink: 0
    }
  }, item.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 500,
      color: item.destructive ? 'var(--expense-fg)' : 'var(--fg-1)'
    }
  }, item.label), item.hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--fg-2)'
    }
  }, item.hint)), item.toggle && /*#__PURE__*/React.createElement(MobileToggle, {
    on: toggles[item.toggle]
  }), item.chevron && /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 18,
      color: 'var(--fg-3)'
    }
  }, "chevron_right"))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 24
    }
  })));
}
Object.assign(window, {
  SettingsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/screens/SettingsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/screens/TransactionsScreen.jsx
try { (() => {
/* ─── Transactions Screen ────────────────────────────────────────────────
 * RN: Header → Stack.Screen header. Filters → <ScrollView horizontal>.
 *     List → <SectionList> with filter state.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */
const {
  useState: useTxFilterState
} = React;
const TX_FILTERS = [{
  id: 'all',
  label: 'Todos'
}, {
  id: 'income',
  label: 'Ingresos'
}, {
  id: 'expense',
  label: 'Gastos'
}, {
  id: 'jars',
  label: 'Jars'
}];
function TransactionsScreen({
  hidden,
  onBack
}) {
  const [filter, setFilter] = useTxFilterState('all');
  const filtered = MOBILE_TX.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'income') return t.amount > 0;
    if (filter === 'expense') return t.amount < 0 && t.category !== 'Jar';
    if (filter === 'jars') return t.category === 'Jar';
    return true;
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(MobileHeader, {
    title: "Transacciones",
    subtitle: "Marzo 2026",
    onBack: onBack,
    rightActions: [{
      icon: 'search',
      onPress: () => {}
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      padding: '8px 20px 12px',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      flexShrink: 0
    }
  }, TX_FILTERS.map(f => /*#__PURE__*/React.createElement("button", {
    key: f.id,
    onClick: () => setFilter(f.id),
    style: {
      flexShrink: 0,
      border: 0,
      cursor: 'pointer',
      padding: '8px 16px',
      borderRadius: 'var(--radius-pill)',
      background: filter === f.id ? 'var(--brand-primary)' : 'var(--surface-1)',
      color: filter === f.id ? '#fff' : 'var(--fg-1)',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      fontWeight: filter === f.id ? 600 : 500,
      boxShadow: filter === f.id ? 'none' : 'var(--shadow-card)'
    }
  }, f.label))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      scrollbarWidth: 'none',
      paddingTop: 8
    }
  }, filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '40px 20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "material-icons",
    style: {
      fontSize: 40,
      color: 'var(--fg-3)'
    }
  }, "receipt_long"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--fg-2)',
      marginTop: 12
    }
  }, "Sin movimientos en esta categor\xEDa.")) : /*#__PURE__*/React.createElement(TransactionList, {
    transactions: filtered,
    hidden: hidden,
    dense: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 24
    }
  })));
}
Object.assign(window, {
  TransactionsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/screens/TransactionsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/tokens.js
try { (() => {
/* ─── OW Finance 2026 — Design Tokens (JavaScript) ───────────────────────
 * Use this file in React Native projects instead of colors_and_type.css.
 * All values map 1-to-1 with the CSS tokens in /colors_and_type.css.
 * 
 * Usage in RN:
 *   import { Colors, Radii, Spacing, Typography } from './tokens';
 *   const styles = StyleSheet.create({ card: { backgroundColor: Colors.surface1 } });
 * ──────────────────────────────────────────────────────────────────────── */

const OWColors = {
  // Brand
  brandPrimary: '#1E3A8A',
  brandPrimaryHover: '#16297A',
  brandPrimaryPress: '#0F1E4D',
  brandPrimarySoft: '#F1F4FB',
  brandPrimaryDark: '#4E6FC4',
  // for dark surfaces

  // Info accent (never primary CTA in Lite)
  info: '#0EA5E9',
  infoSoft: 'rgba(14,165,233,0.15)',
  // Semantic
  income: '#10B981',
  incomeSoft: '#D1FAE5',
  incomeFg: '#047857',
  incomeFgDark: '#6EE7B7',
  expense: '#EF4444',
  expenseSoft: '#FEE2E2',
  expenseFg: '#B91C1C',
  expenseFgDark: '#FCA5A5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  warningFg: '#B45309',
  warningFgDark: '#FCD34D',
  violet: '#8B5CF6',
  // AI / voice features only

  // Light surfaces
  bgCanvasLight: '#F8FAFC',
  surface1Light: '#FFFFFF',
  surface2Light: '#F1F5F9',
  surface3Light: '#E8EDF3',
  fg1Light: '#0F172A',
  fg2Light: '#64748B',
  fg3Light: '#94A3B8',
  // Dark surfaces
  bgCanvasDark: '#0F172A',
  surface1Dark: '#131B2E',
  surface2Dark: '#1A2238',
  surface3Dark: '#222A3D',
  fg1Dark: '#E2E8F0',
  fg2Dark: '#94A3B8',
  fg3Dark: '#64748B',
  // Always
  onBrand: '#FFFFFF'
};
const OWRadii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  // default card
  xl: 28,
  // hero card
  pill: 999
};
const OWSpacing = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s7: 32,
  s8: 40,
  s9: 48,
  s10: 64
};
const OWTypography = {
  // RN: fontFamily must match asset loaded in app.json / Info.plist
  familyDisplay: 'Satoshi-Bold',
  familyBody: 'DMSans-Regular',
  familyMoney: 'Satoshi-Bold',
  heroAmount: {
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: -1.04
  },
  amountLg: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.28
  },
  amountMd: {
    fontSize: 18,
    fontWeight: '600'
  },
  amountSm: {
    fontSize: 15,
    fontWeight: '500'
  },
  h1: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.48
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.22
  },
  h3: {
    fontSize: 17,
    fontWeight: '600'
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22
  },
  bodySm: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19
  },
  label: {
    fontSize: 13,
    fontWeight: '500'
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.88,
    textTransform: 'uppercase'
  }
  // Tabular nums in RN: fontVariant: ['tabular-nums']
};
const OWShadows = {
  // RN uses elevation (Android) or shadow* props (iOS)
  card: {
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3
  },
  float: {
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 8
    },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8
  },
  popover: {
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 16
    },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 16
  }
};

// Expose for web demo (window) — in RN, use ES module exports instead
if (typeof window !== 'undefined') {
  Object.assign(window, {
    OWColors,
    OWRadii,
    OWSpacing,
    OWTypography,
    OWShadows
  });
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/tokens.js", error: String((e && e.message) || e) }); }

})();
