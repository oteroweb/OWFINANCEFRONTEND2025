/* ============================================================
   OW Finance — Period selector engine
   8 granularities + Todo + Personalizado.
   Anchored to the current date (June 7, 2026 in this system).
   ============================================================ */
(function () {
  'use strict';

  const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const MABBR  = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const DOW_SH = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const DOW_MN = ['L','M','M','J','V','S','D']; // Monday-first picker header

  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const d   = (y, m, day) => new Date(y, m, day);
  const clone = dt => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const lastDay = (y, m) => new Date(y, m + 1, 0).getDate();
  const addDays = (dt, n) => { const x = clone(dt); x.setDate(x.getDate() + n); return x; };
  const addMonths = (dt, n) => { const x = clone(dt); x.setMonth(x.getMonth() + n, 1); return x; };
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
    t.setDate(t.getDate() + 4 - ((t.getDay() + 6) % 7));
    const yStart = new Date(t.getFullYear(), 0, 1);
    return Math.ceil((((t - yStart) / 86400000) + 1) / 7);
  }

  /* ── Grain catalogue ─────────────────────────────────────── */
  const GRAINS = {
    dia:        { name: 'Día',        icon: 'today',                group: 'Cortos',     unit: 'día' },
    semana:     { name: 'Semana',     icon: 'date_range',           group: 'Cortos',     unit: 'semana' },
    quincena:   { name: 'Quincena',   icon: 'splitscreen',          group: 'Cortos',     unit: 'quincena' },
    mes:        { name: 'Mes',        icon: 'calendar_view_month',  group: 'Estándar',   unit: 'mes' },
    bimestre:   { name: 'Bimestre',   icon: 'calendar_view_week',   group: 'Estándar',   unit: '2 meses' },
    trimestre:  { name: 'Trimestre',  icon: 'event_note',           group: 'Estándar',   unit: '3 meses' },
    semestre:   { name: 'Semestre',   icon: 'calendar_month',       group: 'Estándar',   unit: '6 meses' },
    anio:       { name: 'Año',        icon: 'calendar_today',       group: 'Largos',     unit: 'año' },
    todo:       { name: 'Todo',       icon: 'all_inclusive',        group: 'Especiales', unit: '— histórico' },
    custom:     { name: 'Personalizado', icon: 'tune',              group: 'Especiales', unit: '— rango' },
  };
  const GROUP_ORDER = ['Cortos', 'Estándar', 'Largos', 'Especiales'];
  const QUICK = ['mes', 'trimestre', 'anio'];

  /* ── Period resolution: anchor + grain → {from, to, label, example} ── */
  function resolve(grain, anchor) {
    const a = clone(anchor);
    const y = a.getFullYear(), m = a.getMonth(), day = a.getDate();

    switch (grain) {
      case 'dia': {
        return { from: a, to: a, label: `${DOW_SH[a.getDay()]} ${day} ${MABBR[m]} ${y}` };
      }
      case 'semana': {
        const mon = mondayOf(a), sun = addDays(mon, 6);
        const wk = isoWeek(a);
        const span = sun.getMonth() === mon.getMonth()
          ? `${mon.getDate()}–${sun.getDate()} ${MABBR[mon.getMonth()]}`
          : `${mon.getDate()} ${MABBR[mon.getMonth()]}–${sun.getDate()} ${MABBR[sun.getMonth()]}`;
        return { from: mon, to: sun, label: `Sem ${wk} · ${span}` };
      }
      case 'quincena': {
        const first = day <= 15;
        const from = d(y, m, first ? 1 : 16);
        const to = d(y, m, first ? 15 : lastDay(y, m));
        return { from, to, label: `Q${first ? 1 : 2} ${MABBR[m]} · ${from.getDate()}–${to.getDate()}` };
      }
      case 'mes': {
        return { from: d(y, m, 1), to: d(y, m, lastDay(y, m)), label: `${cap(MONTHS[m])} ${y}` };
      }
      case 'bimestre': {
        const bStart = Math.floor(m / 2) * 2;
        return { from: d(y, bStart, 1), to: d(y, bStart + 1, lastDay(y, bStart + 1)),
                 label: `${cap(MABBR[bStart])}–${cap(MABBR[bStart + 1])} ${y}` };
      }
      case 'trimestre': {
        const qStart = Math.floor(m / 3) * 3, q = qStart / 3 + 1;
        return { from: d(y, qStart, 1), to: d(y, qStart + 2, lastDay(y, qStart + 2)),
                 label: `T${q} ${y} · ${MABBR[qStart]}–${MABBR[qStart + 2]}` };
      }
      case 'semestre': {
        const sStart = m < 6 ? 0 : 6, s = sStart === 0 ? 1 : 2;
        return { from: d(y, sStart, 1), to: d(y, sStart + 5, lastDay(y, sStart + 5)),
                 label: `S${s} ${y} · ${MABBR[sStart]}–${MABBR[sStart + 5]}` };
      }
      case 'anio': {
        return { from: d(y, 0, 1), to: d(y, 11, 31), label: `${y}` };
      }
      case 'todo': {
        return { from: null, to: null, label: 'Todo el histórico', noStep: true };
      }
      case 'custom': {
        const from = mondayOf(TODAY), to = clone(TODAY);
        return { from, to, label: `${from.getDate()} ${MABBR[from.getMonth()]} – ${to.getDate()} ${MABBR[to.getMonth()]}`, noStep: true };
      }
    }
  }

  // short example label for menus/ref grid (uses TODAY)
  function example(grain) { return resolve(grain, TODAY).label; }

  /* ── Stepping ── */
  function step(grain, anchor, dir) {
    switch (grain) {
      case 'dia':       return addDays(anchor, dir);
      case 'semana':    return addDays(anchor, dir * 7);
      case 'quincena': {
        const first = anchor.getDate() <= 15;
        if (dir > 0) return first ? d(anchor.getFullYear(), anchor.getMonth(), 16) : addMonths(anchor, 1);
        return first ? (() => { const p = addMonths(anchor, -1); return d(p.getFullYear(), p.getMonth(), 16); })()
                     : d(anchor.getFullYear(), anchor.getMonth(), 1);
      }
      case 'mes':       return addMonths(anchor, dir);
      case 'bimestre':  return addMonths(anchor, dir * 2);
      case 'trimestre': return addMonths(anchor, dir * 3);
      case 'semestre':  return addMonths(anchor, dir * 6);
      case 'anio':      return addMonths(anchor, dir * 12);
      default:          return anchor;
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
  const state = { grain: 'mes', anchor: clone(TODAY) };
  const listeners = [];
  const onChange = fn => listeners.push(fn);
  function setGrain(g) {
    state.grain = g;
    if (g === 'custom' || g === 'todo') { /* keep anchor */ }
    emit();
  }
  function setAnchor(dt) { state.anchor = clone(dt); emit(); }
  function doStep(dir) {
    const r = resolve(state.grain, state.anchor);
    if (r.noStep) return;
    state.anchor = step(state.grain, state.anchor, dir);
    emit();
  }
  function goToday() { state.anchor = clone(TODAY); emit(); }
  function emit() { const r = resolve(state.grain, state.anchor); listeners.forEach(fn => fn(state, r)); }

  /* ── DOM wiring ─────────────────────────────────────────── */
  function buildMenu(menuEl, onPick) {
    let html = '';
    let lastGroup = null;
    Object.keys(GRAINS).forEach(id => {
      const g = GRAINS[id];
      if (g.group !== lastGroup) { html += `<div class="grain-group">${g.group}</div>`; lastGroup = g.group; }
      html += `<button class="grain-item" data-grain="${id}">
        <span class="gi-ic"><span class="material-icons">${g.icon}</span></span>
        <span class="gi-tx"><span class="gi-nm">${g.name}</span><span class="gi-ex">${id === 'todo' || id === 'custom' ? g.unit.replace(/^—\s*/, '') : example(id)}</span></span>
        <span class="material-icons gi-chk">check</span>
      </button>`;
    });
    menuEl.innerHTML = html;
    menuEl.querySelectorAll('.grain-item').forEach(b => {
      b.addEventListener('click', e => { e.stopPropagation(); onPick(b.dataset.grain); });
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
      const y = a.getFullYear(), m = a.getMonth();
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
      const y = a.getFullYear(), base = y - 4;
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
      setAnchor(d(yy, mm, dd)); closeAll();
    }));
    pickerEl.querySelectorAll('[data-mo]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      setAnchor(d(a.getFullYear(), parseInt(b.dataset.mo, 10), 1)); closeAll();
    }));
    pickerEl.querySelectorAll('[data-yr]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      setAnchor(d(parseInt(b.dataset.yr, 10), a.getMonth(), 1)); closeAll();
    }));
  }

  let openEls = [];
  function closeAll() { openEls.forEach(el => el.classList.remove('open')); openEls = []; }
  function openOnly(el) { closeAll(); el.classList.add('open'); openEls = [el]; }

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
    buildMenu(grainMenu, g => { setGrain(g); closeAll(); });
    grainBtn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = grainMenu.classList.contains('open');
      if (isOpen) closeAll(); else { syncMenu(grainMenu); grainPill.classList.add('open'); openOnly(grainMenu); }
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
      if (picker.classList.contains('open')) closeAll();
      else { buildPicker(picker); openOnly(picker); }
    });

    // Pro pill
    const proPill = document.getElementById('proGrainPill');
    const proMenu = document.getElementById('proGrainMenu');
    buildMenu(proMenu, g => { setGrain(g); closeAll(); });
    document.getElementById('proGrainBtn').addEventListener('click', e => {
      e.stopPropagation();
      if (proMenu.classList.contains('open')) closeAll();
      else { syncMenu(proMenu); openOnly(proMenu); }
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
      if (grainMenu.classList.contains('open')) { closeAll(); return; }
      syncMenu(grainMenu);
      // anchor the menu near liteMore
      grainPill.classList.add('open'); openOnly(grainMenu);
      grainBtn.scrollIntoView ? null : null;
    });
    document.getElementById('litePrev').addEventListener('click', () => doStep(-1));
    document.getElementById('liteNext').addEventListener('click', () => doStep(1));

    // Grain reference grid
    const ref = document.getElementById('grainRef');
    ref.innerHTML = Object.keys(GRAINS).map(id => {
      const g = GRAINS[id];
      const ex = (id === 'todo' || id === 'custom') ? g.unit.replace(/^—\s*/, '') : example(id);
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
      syncMenu(grainMenu); syncMenu(proMenu);

      // pro
      document.getElementById('proGrainIc').textContent = g.icon;
      document.getElementById('proGrainLabel').textContent = g.name;
      document.getElementById('proLabel').textContent = r.label;

      // lite
      document.getElementById('liteLabel').textContent = r.label;
      const inQuick = QUICK.includes(st.grain);
      liteQuick.querySelectorAll('button[data-grain]').forEach(b => b.classList.toggle('on', b.dataset.grain === st.grain));
      // if advanced grain, show it as active chip in place of the "more" label
      liteMore.innerHTML = inQuick
        ? `Más<span class="material-icons">expand_more</span>`
        : `${g.name}<span class="material-icons">expand_more</span>`;
      liteMore.classList.toggle('on', !inQuick);
      if (!inQuick) { liteMore.style.background = 'var(--accent)'; liteMore.style.color = '#fff'; }
      else { liteMore.style.background = ''; liteMore.style.color = ''; }
      // disable lite stepper on no-step grains
      document.getElementById('litePrev').disabled = noStep;
      document.getElementById('liteNext').disabled = noStep;
    });

    emit();
  });
})();
