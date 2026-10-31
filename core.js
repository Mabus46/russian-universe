/* ==========================================================================
   РУССКАЯ ВСЕЛЕННАЯ — ядро прототипа
   Состояние, локальное хранилище, проверяемый журнал (хеш-цепочка),
   DOM-хелперы, тосты, шиты, мини-графики, QR, уровни вклада.
   ========================================================================== */
'use strict';

/* ---------------- DOM ---------------- */
function h(tag, attrs, children) {
  var node = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'style' && typeof v === 'object') {
        Object.keys(v).forEach(function (p) {
          if (p.slice(0, 2) === '--') node.style.setProperty(p, String(v[p]));
          else node.style[p] = v[p];
        });
      } else if (k.slice(0, 2) === 'on' && typeof v === 'function') {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (k === 'dataset' && typeof v === 'object') {
        Object.keys(v).forEach(function (d) { node.dataset[d] = v[d]; });
      } else if (v === true) {
        node.setAttribute(k, '');
      } else {
        node.setAttribute(k, String(v));
      }
    });
  }
  if (children !== null && children !== undefined) {
    (Array.isArray(children) ? children : [children]).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    });
  }
  return node;
}

function esc(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function clear(node) {
  while (node && node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/* ---------------- утилиты ---------------- */
function fmt(n) {
  var num = Number(n) || 0;
  return num.toLocaleString('ru-RU');
}

function fmtDate(ts) {
  var d = new Date(ts);
  var p = function (x) { return String(x).padStart(2, '0'); };
  return p(d.getDate()) + '.' + p(d.getMonth() + 1) + ' · ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function pct(a, b) { return b > 0 ? clamp(Math.round((a / b) * 100), 0, 100) : 0; }

/* FNV-1a → base36 */
function hashStr(str) {
  var h1 = 0x811c9dc5;
  for (var i = 0; i < str.length; i++) {
    h1 ^= str.charCodeAt(i);
    h1 = (h1 + ((h1 << 1) + (h1 << 4) + (h1 << 7) + (h1 << 8) + (h1 << 24))) >>> 0;
  }
  var h2 = 0x01000193;
  for (var j = str.length - 1; j >= 0; j--) {
    h2 ^= str.charCodeAt(j) * 31;
    h2 = (h2 * 16777619) >>> 0;
  }
  return (h1.toString(36) + h2.toString(36)).slice(0, 14);
}

/* ---------------- состояние ---------------- */
var Store = (function () {
  var KEY = 'ru:state:v1';

  function defaults() {
    return {
      version: 1,
      onboarded: false,
      name: '',
      mode: 'adult',            // adult | child
      assistant: 'bogatyr',
      lad: 420,
      contribution: 34,
      branch: { edu: 12, health: 8, create: 4, career: 6, kind: 4 },
      completedLessons: [],
      olympiadScore: null,
      cart: [],
      orders: [],
      votes: {},
      rentals: [],
      donated: 0,
      plan: { h1: true, h4: true },
      shield: { enabled: true, strict: true, reports: 214, blockedLast7: 37, allowedLast7: 812 },
      parentPin: '',
      ledger: [],
      lookups: {}
    };
  }

  var state = null;
  var storageOk = true;

  function detect() {
    try {
      window.localStorage.setItem('__ru_t', '1');
      window.localStorage.removeItem('__ru_t');
      storageOk = true;
    } catch (e) { storageOk = false; }
    return storageOk;
  }

  function merge(base, extra) {
    if (!extra || typeof extra !== 'object') return base;
    Object.keys(extra).forEach(function (k) {
      var v = extra[k];
      if (Array.isArray(v)) base[k] = v;
      else if (v && typeof v === 'object') {
        if (!base[k] || typeof base[k] !== 'object') base[k] = {};
        merge(base[k], v);
      } else if (v !== undefined) base[k] = v;
    });
    return base;
  }

  function load() {
    detect();
    var def = defaults();
    if (!storageOk) { state = def; return state; }
    try {
      var raw = window.localStorage.getItem(KEY);
      state = raw ? merge(def, JSON.parse(raw)) : def;
    } catch (e) { state = def; }
    if (!state.ledger || !state.ledger.length) seedLedger();
    return state;
  }

  function save() {
    if (!state || !storageOk) return false;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) { return false; }
  }

  function get() { if (!state) load(); return state; }

  /* ---------- проверяемый журнал ---------- */
  function seedLedger() {
    state.ledger = [];
    var seeds = [
      { type: 'system', label: 'Профиль создан в демо-контуре', lad: 0 },
      { type: 'edu', label: 'Приветственный квест «Знакомство»', lad: 50 },
      { type: 'kind', label: 'Помощь соседу: перенос вещей', lad: 20 },
      { type: 'market', label: 'Покупка: хлеб ржаной на закваске', lad: -12 }
    ];
    seeds.forEach(function (s) { pushLedger(s.type, s.label, s.lad, null, true); });
    state.lad = 420;
  }

  function pushLedger(type, label, lad, meta, silent) {
    var s = get();
    var prev = s.ledger.length ? s.ledger[s.ledger.length - 1].hash : 'genesis';
    var ts = Date.now();
    var body = [prev, type, label, lad, ts, JSON.stringify(meta || {})].join('|');
    var entry = {
      id: 'tx-' + (s.ledger.length + 1),
      ts: ts,
      type: type,
      label: label,
      lad: lad || 0,
      meta: meta || {},
      prevHash: prev,
      hash: hashStr(body)
    };
    s.ledger.push(entry);
    if (!silent) save();
    return entry;
  }

  function verifyLedger() {
    var s = get();
    var prev = 'genesis';
    for (var i = 0; i < s.ledger.length; i++) {
      var e = s.ledger[i];
      var body = [prev, e.type, e.label, e.lad, e.ts, JSON.stringify(e.meta || {})].join('|');
      if (e.prevHash !== prev || hashStr(body) !== e.hash) {
        return { ok: false, index: i, entry: e };
      }
      prev = e.hash;
    }
    return { ok: true, count: s.ledger.length };
  }

  /* ---------- уровни вклада ---------- */
  var LEVELS = [
    { min: 0, name: 'Росток', icon: '🌱' },
    { min: 40, name: 'Саженец', icon: '🌿' },
    { min: 120, name: 'Ветвь', icon: '🌳' },
    { min: 260, name: 'Крона', icon: '🌲' },
    { min: 480, name: 'Древо', icon: '🌳' },
    { min: 800, name: 'Легенда', icon: '⭐' }
  ];

  function levelInfo(contribution) {
    var pts = contribution === undefined ? get().contribution : contribution;
    var idx = 0;
    for (var i = 0; i < LEVELS.length; i++) if (pts >= LEVELS[i].min) idx = i;
    var next = LEVELS[idx + 1];
    return {
      index: idx,
      n: idx + 1,
      name: LEVELS[idx].name,
      icon: LEVELS[idx].icon,
      points: pts,
      next: next ? next.name : null,
      nextAt: next ? next.min : null,
      toNext: next ? Math.max(0, next.min - pts) : 0,
      progress: next ? pct(pts - LEVELS[idx].min, next.min - LEVELS[idx].min) : 100
    };
  }

  /* ---------- операции ---------- */
  function addLad(amount, label, type, meta) {
    var s = get();
    s.lad = Math.max(0, s.lad + amount);
    pushLedger(type || 'system', label, amount, meta);
    save();
    return s.lad;
  }

  function addContribution(points, branchKey) {
    var s = get();
    s.contribution = Math.max(0, s.contribution + points);
    if (branchKey && s.branch[branchKey] !== undefined) {
      s.branch[branchKey] = Math.max(0, s.branch[branchKey] + points);
    }
    save();
    return s.contribution;
  }

  function biz(fn) {
    var s = get();
    fn(s);
    save();
    return s;
  }

  function reset() {
    state = defaults();
    seedLedger();
    save();
    return state;
  }

  function exportJSON() {
    return JSON.stringify(get(), null, 2);
  }

  function importJSON(text) {
    try {
      var parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') return false;
      state = merge(defaults(), parsed);
      save();
      return true;
    } catch (e) { return false; }
  }

  return {
    KEY: KEY,
    get: get,
    load: load,
    save: save,
    reset: reset,
    addLad: addLad,
    addContribution: addContribution,
    levelInfo: levelInfo,
    pushLedger: pushLedger,
    verifyLedger: verifyLedger,
    exportJSON: exportJSON,
    importJSON: importJSON,
    biz: biz,
    storageOk: function () { return storageOk; }
  };
})();

/* ---------------- тосты ---------------- */
function toast(text, kind, icon) {
  var root = document.getElementById('toasts');
  if (!root) return;
  var t = h('div', { class: 'toast' + (kind ? ' toast--' + kind : '') }, [
    h('span', { text: icon || (kind === 'err' ? '⚠️' : kind === 'warn' ? '🔔' : '✓') }),
    h('span', { text: text })
  ]);
  root.appendChild(t);
  setTimeout(function () {
    t.classList.add('is-out');
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 260);
  }, 2900);
}

/* ---------------- шиты / модальные окна ---------------- */
var Sheet = (function () {
  var current = null;

  function open(opts) {
    opts = opts || {};
    var overlay = document.getElementById('overlay');
    clear(overlay);
    var sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' });

    var head = h('div', { class: 'sheet__head' });
    var titleWrap = h('div', { style: { flex: '1 1 auto', minWidth: '0' } });
    titleWrap.appendChild(h('div', { class: 'sheet__title', text: opts.title || '' }));
    if (opts.sub) titleWrap.appendChild(h('div', { class: 'small muted mt-4', text: opts.sub }));
    head.appendChild(titleWrap);
    var closeBtn = h('button', { class: 'icon-round', 'aria-label': 'Закрыть', type: 'button', text: '✕' });
    closeBtn.addEventListener('click', close);
    head.appendChild(closeBtn);
    sheet.appendChild(head);

    if (opts.body) sheet.appendChild(opts.body);

    if (opts.actions && opts.actions.length) {
      var actions = h('div', { class: 'sheet__actions' });
      opts.actions.forEach(function (a) {
        var b = h('button', { class: 'btn ' + (a.variant || 'btn--primary'), type: 'button' }, [a.icon ? h('span', { text: a.icon }) : null, h('span', { text: a.label })]);
        b.addEventListener('click', function () {
          if (a.keepOpen !== true) close();
          if (a.onClick) a.onClick();
        });
        actions.appendChild(b);
      });
      sheet.appendChild(actions);
    }

    overlay.appendChild(sheet);
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    current = { overlay: overlay, onClose: opts.onClose };

    overlay.onclick = function (e) {
      if (e.target === overlay) close();
    };
    document.addEventListener('keydown', onEsc);
    setTimeout(function () { closeBtn.focus(); }, 40);
    return { close: close };
  }

  function onEsc(e) { if (e.key === 'Escape') close(); }

  function close() {
    var overlay = document.getElementById('overlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onEsc);
    var cb = current && current.onClose;
    current = null;
    setTimeout(function () {
      if (!current) clear(overlay);
      if (cb) cb();
    }, 180);
  }

  function confirm(opts) {
    return new Promise(function (resolve) {
      open({
        title: opts.title,
        body: h('p', { class: 'lead', text: opts.text }),
        actions: [
          { label: opts.cancelLabel || 'Отмена', variant: 'btn--ghost', onClick: function () { resolve(false); } },
          { label: opts.okLabel || 'Подтвердить', variant: opts.danger ? 'btn--danger' : 'btn--primary', onClick: function () { resolve(true); } }
        ],
        onClose: function () { resolve(false); }
      });
    });
  }

  return { open: open, close: close, confirm: confirm };
})();

/* ---------------- мини-график (canvas) ---------------- */
function sparkline(values, opts) {
  opts = opts || {};
  var w = opts.w || 220, hgt = opts.h || 54;
  var canvas = h('canvas', { width: w * 2, height: hgt * 2, style: { width: '100%', height: hgt + 'px', display: 'block' } });
  var ctx = canvas.getContext('2d');
  ctx.scale(2, 2);
  var min = Math.min.apply(null, values), max = Math.max.apply(null, values);
  var span = max - min || 1;
  var color = opts.color || '#5B8DEF';
  var pad = 4;
  var pts = values.map(function (v, i) {
    return {
      x: pad + (i / Math.max(1, values.length - 1)) * (w - pad * 2),
      y: hgt - pad - ((v - min) / span) * (hgt - pad * 2)
    };
  });
  // область
  var grad = ctx.createLinearGradient(0, 0, 0, hgt);
  grad.addColorStop(0, color + '55');
  grad.addColorStop(1, color + '00');
  ctx.beginPath();
  ctx.moveTo(pts[0].x, hgt);
  pts.forEach(function (p) { ctx.lineTo(p.x, p.y); });
  ctx.lineTo(pts[pts.length - 1].x, hgt);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  // линия
  ctx.beginPath();
  pts.forEach(function (p, i) { i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();
  // последняя точка
  var last = pts[pts.length - 1];
  ctx.beginPath();
  ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  return canvas;
}

/* ---------------- QR-«плейсхолдер» (детерминированный рисунок) --------------- */
function qrBlock(seedStr, size) {
  size = size || 21;
  var grid = h('div', { class: 'qr', style: { gridTemplateColumns: 'repeat(' + size + ', 1fr)' } });
  var hash = hashStr(seedStr) + hashStr(seedStr.split('').reverse().join(''));
  var bits = [];
  for (var i = 0; i < hash.length; i++) {
    var code = hash.charCodeAt(i);
    for (var b = 0; b < 6; b++) bits.push((code >> b) & 1);
  }
  function finderAt(r, c) {
    return (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
  }
  function isFinderDark(r, c) {
    var rr = r, cc = c;
    if (r >= size - 7) rr = r - (size - 7);
    if (c >= size - 7) cc = c - (size - 7);
    if (rr <= 6 && cc <= 6) {
      var ring = Math.min(rr, cc, 6 - rr, 6 - cc);
      return ring === 0 || ring === 1 || ring >= 3;
    }
    return false;
  }
  var k = 0;
  for (var r = 0; r < size; r++) {
    for (var c = 0; c < size; c++) {
      var dark;
      if (finderAt(r, c)) dark = isFinderDark(r, c);
      else {
        dark = bits[k % bits.length] === 1;
        k++;
      }
      grid.appendChild(h('i', { style: { background: dark ? '#0B1020' : '#FFFFFF', aspectRatio: '1 / 1' } }));
    }
  }
  return grid;
}

/* ---------------- общие компоненты ---------------- */
function chip(text, kind) { return h('span', { class: 'chip' + (kind ? ' chip--' + kind : ''), text: text }); }

function cardShell(opts) {
  var cls = 'card' + (opts.link ? ' card--link' : '') + (opts.cls ? ' ' + opts.cls : '');
  var node = h(opts.tag || 'div', { class: cls, 'data-route': opts.route || null });
  if (opts.route) {
    node.addEventListener('click', function () { go(opts.route); });
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');
    node.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(opts.route); }
    });
  }
  return node;
}

function statBlock(value, label) {
  return h('div', { class: 'stat' }, [
    h('div', { class: 'stat__val', text: value }),
    h('div', { class: 'stat__lbl', text: label })
  ]);
}

function progressBar(value, max, extraClass) {
  var bar = h('div', { class: 'bar' + (extraClass ? ' ' + extraClass : '') });
  var fill = h('div', { class: 'bar__fill' });
  fill.style.width = pct(value, max) + '%';
  bar.appendChild(fill);
  return bar;
}

function kvRow(k, v) {
  return h('div', { class: 'kv' }, [h('span', { class: 'muted', text: k }), h('span', { class: 'kv__v', text: v })]);
}

function pageTitle(text, sub) {
  return h('div', {}, [
    h('h1', { class: 'h1', text: text }),
    sub ? h('p', { class: 'lead mt-8', text: sub }) : null
  ]);
}

function emptyState(icon, title, sub) {
  return h('div', { class: 'empty' }, [
    h('div', { class: 'empty__ico', text: icon }),
    h('div', { class: 'strong', text: title }),
    sub ? h('div', { class: 'small', text: sub }) : null
  ]);
}
