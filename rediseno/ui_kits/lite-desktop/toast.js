/* ─── owToast — toast global "Deshacer" (parte B del híbrido 2.4) ────────
 * Vanilla JS, sin React: se inyecta en <body> y sobrevive al cierre del
 * modal de transacción, así el aviso aparece en el shell de la app.
 *
 *   window.owToast({
 *     message: 'Movimiento registrado',
 *     actionLabel: 'Deshacer',   // opcional
 *     onAction: () => {...},      // opcional
 *     icon: 'check_circle',       // material-icon, opcional
 *     accent: 'var(--income)',    // color de la barra/ícono, opcional
 *     duration: 4200,             // ms antes de auto-cerrar
 *   })
 *
 * Devuelve un handle { dismiss() }. Respeta prefers-reduced-motion.
 * ──────────────────────────────────────────────────────────────────────── */
(function () {
  if (window.owToast) return;

  var LAYER_ID = 'ow-toast-layer';

  function ensureLayer() {
    var layer = document.getElementById(LAYER_ID);
    if (layer) return layer;
    layer = document.createElement('div');
    layer.id = LAYER_ID;
    layer.style.cssText = [
      'position:fixed',
      'left:0', 'right:0', 'bottom:0',
      'z-index:2147483000',
      'display:flex', 'flex-direction:column', 'align-items:center', 'gap:10px',
      'padding:0 16px calc(22px + env(safe-area-inset-bottom))',
      'pointer-events:none',
    ].join(';');
    document.body.appendChild(layer);

    if (!document.getElementById('ow-toast-style')) {
      var st = document.createElement('style');
      st.id = 'ow-toast-style';
      st.textContent =
        '@keyframes owToastIn{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}' +
        '@keyframes owToastOut{from{opacity:1;transform:none}to{opacity:0;transform:translateY(10px) scale(.98)}}' +
        '@keyframes owToastBar{from{transform:scaleX(1)}to{transform:scaleX(0)}}' +
        '.ow-toast{pointer-events:auto;box-sizing:border-box;display:flex;align-items:center;gap:12px;' +
        'min-width:280px;max-width:440px;width:100%;padding:13px 14px 13px 16px;position:relative;overflow:hidden;' +
        'background:var(--ink-base,#0F1729);color:#fff;border-radius:14px;' +
        'box-shadow:0 12px 40px rgba(6,10,24,.36);font-family:var(--font-body,system-ui);' +
        'animation:owToastIn 260ms cubic-bezier(.16,1,.3,1)}' +
        '.ow-toast.--out{animation:owToastOut 200ms ease forwards}' +
        '.ow-toast__ico{font-size:20px;flex:0 0 auto;line-height:1}' +
        '.ow-toast__msg{flex:1;min-width:0;font-size:13.5px;font-weight:600;line-height:1.35}' +
        '.ow-toast__sub{display:block;font-weight:500;font-size:11.5px;opacity:.7;margin-top:1px}' +
        '.ow-toast__act{flex:0 0 auto;border:0;cursor:pointer;background:rgba(255,255,255,.12);color:#fff;' +
        'font-family:inherit;font-size:12.5px;font-weight:700;padding:8px 14px;border-radius:999px;' +
        'display:inline-flex;align-items:center;gap:6px;transition:background 140ms}' +
        '.ow-toast__act:hover{background:rgba(255,255,255,.22)}' +
        '.ow-toast__x{flex:0 0 auto;border:0;cursor:pointer;background:transparent;color:rgba(255,255,255,.55);' +
        'display:inline-flex;padding:4px;border-radius:8px;transition:color 140ms,background 140ms}' +
        '.ow-toast__x:hover{color:#fff;background:rgba(255,255,255,.1)}' +
        '.ow-toast__bar{position:absolute;left:0;bottom:0;height:3px;width:100%;transform-origin:left center;' +
        'background:currentColor;opacity:.9}' +
        '@media (prefers-reduced-motion:reduce){.ow-toast{animation:none}.ow-toast.--out{animation:none;opacity:0}.ow-toast__bar{display:none}}';
      document.head.appendChild(st);
    }
    return layer;
  }

  function mkIcon(name) {
    var s = document.createElement('span');
    s.className = 'material-icons ow-toast__ico';
    s.textContent = name;
    return s;
  }

  window.owToast = function (opts) {
    opts = opts || {};
    var layer = ensureLayer();
    var accent = opts.accent || 'var(--income, #16A34A)';
    var duration = opts.duration == null ? 4200 : opts.duration;

    var el = document.createElement('div');
    el.className = 'ow-toast';
    el.setAttribute('role', 'status');

    var ico = mkIcon(opts.icon || 'check_circle');
    ico.style.color = accent;
    el.appendChild(ico);

    var msg = document.createElement('div');
    msg.className = 'ow-toast__msg';
    msg.textContent = opts.message || 'Listo';
    if (opts.sub) {
      var sub = document.createElement('span');
      sub.className = 'ow-toast__sub';
      sub.textContent = opts.sub;
      msg.appendChild(sub);
    }
    el.appendChild(msg);

    var timer, killed = false;
    function dismiss() {
      if (killed) return;
      killed = true;
      clearTimeout(timer);
      el.classList.add('--out');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 220);
    }

    if (opts.actionLabel) {
      var act = document.createElement('button');
      act.className = 'ow-toast__act';
      act.type = 'button';
      act.appendChild(mkIcon('undo')).style.fontSize = '15px';
      act.appendChild(document.createTextNode(opts.actionLabel));
      act.addEventListener('click', function () {
        dismiss();
        if (typeof opts.onAction === 'function') opts.onAction();
      });
      el.appendChild(act);
    }

    var x = document.createElement('button');
    x.className = 'ow-toast__x';
    x.type = 'button';
    x.setAttribute('aria-label', 'Cerrar');
    x.appendChild(mkIcon('close')).style.fontSize = '17px';
    x.addEventListener('click', dismiss);
    el.appendChild(x);

    if (duration > 0) {
      var bar = document.createElement('span');
      bar.className = 'ow-toast__bar';
      bar.style.color = accent;
      bar.style.animation = 'owToastBar ' + duration + 'ms linear forwards';
      el.appendChild(bar);
      timer = setTimeout(dismiss, duration);
    }

    layer.appendChild(el);
    return { dismiss: dismiss };
  };
})();
