/* ─── Organism · ContextBar (Fase 2) ──────────────────────────────────────
 * La pieza central de la Fase 2: el selector único de contabilidad.
 * Fuente de las decisiones: DECISIONS.md D-009 (elegida sobre 3 candidatos
 * construidos, `candidatos/contexto-*.html`).
 *
 * Reglas que la barra implementa, y por qué:
 *   · UN solo selector. El modo (Lite/Pro) dejó de ser global: es una
 *     preferencia de cada contabilidad, así que aparece como subtítulo de
 *     cada opción, no como un segundo control compitiendo por el header.
 *   · Barra teñida con el color del contexto, que SE SUMA por encima del
 *     header actual. Colapsa con el scroll hasta quedar una línea de color.
 *   · Tocar la línea colapsada la expande: el color es también el botón.
 *     Sin eso, con la barra encogida no habría forma de cambiar de
 *     contabilidad sin volver arriba.
 *   · Personal también lleva color — el color significa "en qué contabilidad
 *     estás", no "esto es una empresa". Personal arranca en el azul de marca
 *     para que los usuarios actuales no vean la app cambiar sin pedirlo.
 *   · La paleta es cerrada y ninguno de sus colores se parece al verde de
 *     ingreso, al rojo de gasto ni al ámbar de alerta. Un contexto que pinta
 *     sus botones de rojo haría que todo parezca un gasto.
 *
 * Props:
 *   contexts   [{ id, name, kind:'personal'|'business', color, mode }]
 *   activeId   id del contexto activo
 *   onSwitch(id) · onCreate() · onGoConfig(id)
 * (`scroller` ya no hace falta: la barra escucha el scroll en captura, así que
 *  cualquier panel que se mueva la colapsa.)
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

/* Paleta cerrada de contexto. Vive a propósito en azules y violetas más dos
 * neutros desaturados: así ningún color de contabilidad puede caer en la
 * vecindad del verde de ingreso (~160°), el rojo de gasto (~0°) ni el ámbar de
 * alerta (~38°). Un petróleo o un terracota sí caerían cerca — por eso no están. */
const OWF_CONTEXT_COLORS = [
  { id: 'navy',   value: '#3B5BDB', label: 'Azul de marca' },
  { id: 'sky',    value: '#0EA5E9', label: 'Celeste' },
  { id: 'indigo', value: '#4338CA', label: 'Índigo' },
  { id: 'violet', value: '#8B5CF6', label: 'Violeta' },
  { id: 'purple', value: '#7E22CE', label: 'Púrpura' },
  { id: 'plum',   value: '#A21CAF', label: 'Ciruela' },
  { id: 'slate',  value: '#475569', label: 'Grafito' },
  { id: 'taupe',  value: '#78716C', label: 'Topo' },
];

/* Siguiente color libre — la asignación es automática al crear y editable
 * después, así que nadie tiene que elegir un color para empezar a trabajar. */
function owfNextContextColor(used = []) {
  const free = OWF_CONTEXT_COLORS.find(c => !used.includes(c.value));
  return (free || OWF_CONTEXT_COLORS[0]).value;
}

function ContextBar({ contexts = [], activeId, onSwitch, onCreate, onGoConfig }) {
  const [ui, setUi] = React.useState({ open: false, collapsed: false, manual: false });
  const active = contexts.find(c => c.id === activeId) || contexts[0];
  const rootRef = React.useRef(null);

  /* Colapsa con el primer scroll que se mueva — no distingue panel. En Pro los
   * paneles scrollean por separado y no existe "el" scroll de la página, así
   * que se escucha en captura sobre el documento y sirve cualquiera.
   *
   * `manual` existe por un bucle real: expandir estando scrolleado devuelve la
   * barra a 49 px, eso reflowea 43 px, el reflow dispara un scroll y el scroll
   * la volvía a colapsar en el mismo instante — el usuario tocaba la línea y no
   * pasaba nada. Con `manual` la barra queda abierta hasta que se elige una
   * contabilidad o se vuelve arriba. */
  React.useEffect(() => {
    const read = (e) => {
      const el = e && e.target && e.target.scrollTop !== undefined ? e.target : null;
      const top = el ? el.scrollTop : (window.scrollY || 0);
      setUi(u => {
        if (top <= 12) return u.collapsed || u.manual ? { ...u, collapsed: false, manual: false } : u;
        if (u.manual || u.collapsed) return u;
        return { ...u, collapsed: true, open: false };
      });
    };
    document.addEventListener('scroll', read, { passive: true, capture: true });
    window.addEventListener('scroll', read, { passive: true });
    return () => { document.removeEventListener('scroll', read, { capture: true }); window.removeEventListener('scroll', read); };
  }, []);

  React.useEffect(() => {
    if (!ui.open) return;
    const onDoc = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setUi(u => ({ ...u, open: false })); };
    const onKey = (e) => { if (e.key === 'Escape') setUi(u => ({ ...u, open: false })); };
    const tmo = setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); clearTimeout(tmo); };
  }, [ui.open]);

  if (!active) return null;
  const tint = active.color || OWF_CONTEXT_COLORS[0].value;

  /* Geometría: la barra va `sticky top:0` como hija directa del shell, no
   * envuelta en una caja de su alto. Ese detalle importa: un sticky solo viaja
   * dentro de su bloque contenedor, así que envolverla en 49 px la desprende en
   * cuanto el wrapper sale de pantalla — y entonces la línea colapsada nunca
   * se puede tocar, que es lo único que la hace útil.
   * El precio es un reflow de 43 px una vez, al cruzar el umbral: es el mismo
   * comportamiento de cualquier header que se encoge, y es preferible a dejar
   * un hueco vacío permanente reservando el alto expandido. */
  const stick = { position: 'sticky', top: 0, zIndex: 'var(--z-sticky, 60)', flexShrink: 0 };

  /* ── Colapsada: una línea de color que además es el botón ──────────────── */
  if (ui.collapsed) {
    return (
      <div ref={rootRef} onClick={() => setUi({ open: true, collapsed: false, manual: true })}
        title={`${active.name} — tocar para cambiar de contabilidad`}
        style={{ ...stick, height: 6, background: tint, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 12 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.9)', lineHeight: 1 }}>{active.name}</span>
      </div>
    );
  }

  const onTint = { color: '#fff' };
  const softBtn = { display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, cursor: 'pointer', background: 'rgba(255,255,255,.18)', borderRadius: 'var(--radius-pill)', padding: '7px 14px', whiteSpace: 'nowrap' };

  return (
    <div ref={rootRef} style={{ ...stick, background: tint }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px' }}>
        <button onClick={() => setUi(u => ({ ...u, open: !u.open }))} aria-haspopup="listbox" aria-expanded={ui.open} style={softBtn}>
          <span style={{ ...onTint, fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600 }}>{active.name}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,.72)' }}>{active.mode === 'pro' ? 'Pro' : 'Lite'}</span>
          <span className="material-icons" style={{ fontSize: 17, color: 'rgba(255,255,255,.75)' }}>expand_more</span>
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={() => onGoConfig && onGoConfig(active.id)} style={{ ...softBtn, background: 'transparent', padding: '7px 10px' }}>
          <span className="material-icons" style={{ fontSize: 17, color: 'rgba(255,255,255,.85)' }}>tune</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>Configuración</span>
        </button>
      </div>

      {ui.open && (
        <div role="listbox" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 20, width: 300, background: 'var(--surface-1)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-popover)', padding: 6, zIndex: 'var(--z-popover, 80)' }}>          <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', padding: '9px 11px 5px' }}>Contabilidad</div>
          {contexts.map(c => {
            const on = c.id === activeId;
            return (
              <button key={c.id} role="option" aria-selected={on} onClick={() => { setUi(u => ({ ...u, open: false, manual: false })); onSwitch && onSwitch(c.id); }}
                style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', border: 0, cursor: 'pointer', textAlign: 'left', padding: '10px 11px', borderRadius: 'var(--radius-sm)', background: on ? 'var(--surface-2)' : 'transparent' }}
                onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: c.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12 }}>
                  {c.kind === 'personal' ? <span className="material-icons" style={{ fontSize: 15 }}>person</span> : c.name.charAt(0)}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--fg-2)', marginTop: 1 }}>{c.mode === 'pro' ? 'Pro' : 'Lite'}</span>
                </span>
                {on && <span className="material-icons" style={{ fontSize: 18, color: c.color }}>check</span>}
              </button>
            );
          })}
          <button onClick={() => { setUi(u => ({ ...u, open: false, manual: false })); onCreate && onCreate(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', border: 0, borderTop: '1px solid var(--border-hairline)', cursor: 'pointer', textAlign: 'left', padding: '12px 11px 10px', marginTop: 5, background: 'transparent' }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: 'var(--surface-3)', color: 'var(--fg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ fontSize: 16 }}>add</span>
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)' }}>Crear una empresa</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* Contabilidades de muestra — las usan los dos shells para que el selector sea
 * el mismo en Lite y en Pro. El modo vive en cada contabilidad (D-009).
 *
 * Las empresas creadas en la sesión viven en `window.__owCtxExtra`, no en este
 * array: crear una empresa en Pro desde Lite cambia de shell, el harness del
 * demo vuelve a evaluar los scripts y un push acá se perdería en el remonte.
 * Ese fuera del array es lo que hace que la empresa recién creada sobreviva al
 * cambio de modo. */
const OWF_CONTEXTS = [
  { id: 'personal', name: 'Personal',            kind: 'personal', color: '#3B5BDB', mode: 'lite' },
  { id: 'b1',       name: 'Distribuidora Otero', kind: 'business', color: '#0EA5E9', mode: 'pro'  },
  { id: 'b2',       name: 'Consultora MG',       kind: 'business', color: '#8B5CF6', mode: 'lite' },
  ...(window.__owCtxExtra || []),
];

function owfAddContext(ctx) {
  window.__owCtxExtra = (window.__owCtxExtra || []).concat([ctx]);
  OWF_CONTEXTS.push(ctx);
  return ctx;
}

/* ── Acentos por contexto ─────────────────────────────────────────────────
 * En vez de pasar `accent` a mano por cada vista, se reescribe la familia
 * `--brand-primary` en la raíz del shell: todo lo que ya usa el token —
 * botones, chips activos, barras de cántaro, gráficos — sigue el color del
 * contexto sin tocar cada archivo. Los semánticos no están en esta familia,
 * así que ingreso/gasto/alerta quedan intactos por construcción.
 *
 * Los derivados salen de `color-mix`, no de valores a mano: la paleta es
 * cerrada, pero los 8 colores no comparten luminosidad, y un hover fijo
 * quedaría invisible en unos y estridente en otros.
 *
 * Cuándo se tiñe (D-009):
 *   · empresa → siempre, en Lite y en Pro. Saber en qué contabilidad estás
 *     importa más en Lite, que es donde alguien entra sin pensar.
 *   · personal → solo en Pro. En Lite queda con el azul de marca: teñir la app
 *     de alguien que solo tiene su contabilidad personal no le dice nada que
 *     no sepa. */
function owfContextVars(ctx, mode) {
  const tinted = ctx && ctx.color && (ctx.kind === 'business' || mode === 'pro');
  if (!tinted) return null;
  const c = ctx.color;
  return {
    '--brand-primary': c,
    '--brand-primary-hover': `color-mix(in oklab, ${c} 82%, white)`,
    '--brand-primary-press': `color-mix(in oklab, ${c} 78%, black)`,
    '--brand-primary-soft': `color-mix(in oklab, ${c} 16%, transparent)`,
    '--brand-primary-fg-soft': `color-mix(in oklab, ${c} 70%, white)`,
  };
}

Object.assign(window, { ContextBar, OWF_CONTEXT_COLORS, OWF_CONTEXTS, owfNextContextColor, owfAddContext, owfContextVars });
