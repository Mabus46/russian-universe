/* ==========================================================================
   РУССКАЯ ВСЕЛЕННАЯ — Дерево жизни: вклад, уровни и проверяемый журнал
   ========================================================================== */
'use strict';

window.Views = window.Views || {};

var TYPE_LABELS = {
  system: 'система', edu: 'образование', kind: 'добро', market: 'маркетплейс',
  wishes: 'желания', charity: 'помощь', health: 'здоровье', appeal: 'обжалование', vote: 'голос'
};

function typeLabel(t) { return TYPE_LABELS[t] || t; }

var BRANCHES = [
  { key: 'edu', name: 'Образование', icon: '🎓', color: '#5B8DEF' },
  { key: 'health', name: 'Здоровье', icon: '💚', color: '#4FD1A5' },
  { key: 'create', name: 'Творчество', icon: '🎬', color: '#9A7BF0' },
  { key: 'career', name: 'Дело и карьера', icon: '🧭', color: '#E8C05A' },
  { key: 'kind', name: 'Добро', icon: '🕊️', color: '#D4453F' }
];

Views.tree = function () {
  var s = Store.get();
  var lvl = Store.levelInfo();
  var wrap = h('div', { class: 'view__inner' });

  wrap.appendChild(h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [chip('Идентичность', 'gold'), chip('Уровни за вклад, не за происхождение', 'mint')]),
    h('h1', { class: 'h1 mt-12', text: 'Дерево жизни' }),
    h('p', { class: 'lead mt-8', text: 'Профиль — не «рейтинг человека», а карта его дел. Ветки растут от конкретных действий: пройденных уроков, помощи соседям, волонтёрских выездов, творческих проектов. Ничего нельзя купить или получить «по статусу».' })
  ]));

  /* ---------- дерево + показатели ---------- */
  var treeCard = h('div', { class: 'card' });
  treeCard.appendChild(h('div', { class: 'grid grid--2' }, [
    h('div', { class: 'tree-wrap' }, [treeSvg(s)]),
    h('div', { class: 'col', style: { gap: '10px' } }, [
      h('div', { class: 'row' }, [
        h('div', { class: 'msg__ava', style: { width: '48px', height: '48px', fontSize: '22px' }, text: lvl.icon }),
        h('div', {}, [
          h('div', { class: 'h2', text: lvl.name }),
          h('div', { class: 'small muted', text: 'уровень ' + lvl.n + ' из 6 · ' + s.contribution + ' ' + plural(s.contribution, ['очко', 'очка', 'очков']) + ' вклада' })
        ])
      ]),
      progressBar(s.contribution, lvl.nextAt || Math.max(1, s.contribution), 'bar--gold'),
      h('div', { class: 'small muted', text: lvl.next ? 'До уровня «' + lvl.next + '» нужно ещё ' + lvl.toNext + ' ' + plural(lvl.toNext, ['очко', 'очка', 'очков']) + ' вклада.' : 'Это высший уровень демо-контура.' }),
      h('hr', { class: 'hr' }),
      h('div', { class: 'branch-legend' }, BRANCHES.map(function (b) {
        return h('span', { class: 'chip', style: { borderColor: b.color + '55', color: b.color } }, [
          h('span', { text: b.icon + ' ' + b.name + ' · ' + (s.branch[b.key] || 0) })
        ]);
      }))
    ])
  ]));
  treeCard.appendChild(h('p', { class: 'small dim mt-12', text: 'Толщина ветки в демо пропорциональна вкладу в направлении. Ветку нельзя «накрутить» покупкой — Лады и очки вклада считаются отдельно.' }));
  wrap.appendChild(treeCard);

  /* ---------- лестница уровней ---------- */
  var rail = h('div', { class: 'timeline mt-12' });
  var LEVELS_VIEW = [
    { n: 1, min: 0, name: 'Росток', icon: '🌱', text: 'Первые шаги: знакомство и один короткий урок.' },
    { n: 2, min: 40, name: 'Саженец', icon: '🌿', text: 'Есть регулярность: несколько дел и первый проект.' },
    { n: 3, min: 120, name: 'Ветвь', icon: '🌳', text: 'Одно направление стало заметным — например, учёба или добро.' },
    { n: 4, min: 260, name: 'Крона', icon: '🌲', text: 'Устойчивый вклад в два направления и помощь другим участникам.' },
    { n: 5, min: 480, name: 'Древо', icon: '🌳', text: 'Ведёте проект или наставничество, заметны в сообществе.' },
    { n: 6, min: 800, name: 'Легенда', icon: '⭐', text: 'Долгий вклад и передача опыта — уровень нельзя получить сразу.' }
  ];
  LEVELS_VIEW.forEach(function (L) {
    var passed = s.contribution >= L.min;
    var isNow = lvl.n === L.n;
    rail.appendChild(h('div', { class: 'tl-item' }, [
      h('div', { class: 'tl-rail' }, [
        h('div', { class: 'tl-ico', style: passed ? { borderColor: 'rgba(232,192,90,.5)', color: 'var(--gold)' } : null, text: L.icon }),
        L.n < LEVELS_VIEW.length ? h('div', { class: 'tl-line' }) : null
      ]),
      h('div', { class: 'tl-body' }, [
        h('div', { class: 'row row--wrap' }, [
          h('span', { class: 'strong', text: 'Уровень ' + L.n + ' · ' + L.name }),
          chip(L.min + ' ' + plural(L.min, ['очко', 'очка', 'очков']) + ' вклада', passed ? 'gold' : 'mint'),
          isNow ? chip('вы здесь', 'azure') : null
        ]),
        h('div', { class: 'small muted mt-4', text: L.text })
      ])
    ]));
  });
  wrap.appendChild(h('div', { class: 'card' }, [
    sectionHead('Как растут уровни', 'Пороговые значения демо-контура'),
    rail,
    h('p', { class: 'small dim mt-8', text: 'Очки вклада нельзя передать другому человеку и нельзя купить. Уровень влияет на доступ к ролям в сообществе, но не даёт власти над другими людьми.' })
  ]));

  /* ---------- журнал операций ---------- */
  var ledgerCard = h('div', { class: 'card' });
  var verifyBox = h('div', { class: 'mt-12' });

  function verify(showOk) {
    clear(verifyBox);
    var res = Store.verifyLedger();
    var row = h('div', { class: 'list-row', style: { borderColor: res.ok ? 'rgba(79,209,165,.35)' : 'rgba(212,69,63,.4)' } }, [
      h('span', { class: 'list-row__ico', text: res.ok ? '🛡️' : '⚠️' }),
      h('span', { class: 'list-row__main' }, [
        h('span', { class: 'list-row__title', text: res.ok ? 'Цепочка журнала сходится' : 'Обнаружено расхождение' }),
        h('span', { class: 'list-row__sub', text: res.ok ? ('проверено записей: ' + res.count + ' · каждый блок ссылается на предыдущий') : ('сломана запись № ' + (res.index + 1) + ' — демо показывает, что подмена данных обнаруживается') })
      ]),
      h('span', { class: 'list-row__side ' + (res.ok ? 'mint' : ''), text: res.ok ? 'OK' : '!' })
    ]);
    verifyBox.appendChild(row);
    if (showOk) toast(res.ok ? 'Журнал проверен: всё сходится' : 'Цепочка нарушена', res.ok ? 'ok' : 'err', res.ok ? '🛡️' : '⚠️');
  }

  var tableWrap = h('div', { class: 'table__scroll mt-12' });
  var table = h('table', { class: 'table' });
  table.appendChild(h('thead', {}, [h('tr', {}, [
    h('th', { text: '№' }), h('th', { text: 'Действие' }), h('th', { text: 'Тип' }), h('th', { text: 'Лад' }), h('th', { text: 'Хеш' })
  ])]));
  var tbody = h('tbody');
  s.ledger.slice().reverse().forEach(function (e) {
    tbody.appendChild(h('tr', {}, [
      h('td', { class: 'mono dim', text: e.id }),
      h('td', {}, [
        h('div', { class: 'strong', text: e.label }),
        h('div', { class: 'small dim', text: fmtDate(e.ts) })
      ]),
      h('td', {}, [chip(typeLabel(e.type), 'azure')]),
      h('td', { class: e.lad >= 0 ? 'mint nowrap' : 'nowrap', text: (e.lad >= 0 ? '+' : '') + e.lad }),
      h('td', { class: 'mono dim', style: { fontSize: '11px' }, text: e.hash })
    ]));
  });
  table.appendChild(tbody);
  tableWrap.appendChild(table);

  ledgerCard.appendChild(sectionHead('Журнал операций', 'Каждая запись содержит хеш предыдущей — подмену видно', (function () {
    var b = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '🛡️ Проверить целостность' });
    b.addEventListener('click', function () { verify(true); });
    return b;
  })()));
  ledgerCard.appendChild(verifyBox);
  ledgerCard.appendChild(tableWrap);
  ledgerCard.appendChild(h('div', { class: 'row mt-12 row--wrap' }, [
    (function () {
      var b = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '⬇️ Экспорт данных' });
      b.addEventListener('click', function () { exportData(); });
      return b;
    })(),
    (function () {
      var b = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '⚖️ Что мы храним' });
      b.addEventListener('click', function () { go('ethics'); });
      return b;
    })()
  ]));
  wrap.appendChild(ledgerCard);
  verify(false);

  /* ---------- вклад по направлениям ---------- */
  var barCard = h('div', { class: 'card' }, [sectionHead('Вклад по направлениям', 'Откуда растут ветки')]);
  var maxB = Math.max.apply(null, BRANCHES.map(function (b) { return s.branch[b.key] || 0; }).concat([1]));
  BRANCHES.forEach(function (b) {
    var v = s.branch[b.key] || 0;
    var bar = h('div', { class: 'bar mt-8', style: { '--c': b.color } });
    var fill = h('div', { class: 'bar__fill', style: { width: pct(v, maxB) + '%', background: b.color } });
    bar.appendChild(fill);
    barCard.appendChild(h('div', { class: 'mt-12' }, [
      h('div', { class: 'row row--between' }, [
        h('span', { class: 'small', text: b.icon + ' ' + b.name }),
        h('span', { class: 'small strong', text: String(v) })
      ]),
      bar
    ]));
  });
  wrap.appendChild(barCard);

  return wrap;
};

/* ---------- SVG-дерево ---------- */
function treeSvg(s) {
  var NS = 'http://www.w3.org/2000/svg';
  var W = 420, H = 384, baseX = 210, baseY = 344, forkY = 206;

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) { if (attrs.hasOwnProperty(k)) n.setAttribute(k, String(attrs[k])); }
    return n;
  }

  var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'tree-svg', role: 'img' });
  svg.setAttribute('aria-label', 'Дерево вклада: пять ветвей, толщина и размер кроны зависят от очков вклада');

  var defs = el('defs', {});
  var grad = el('linearGradient', { id: 'trunkGrad', x1: '0', y1: '1', x2: '0', y2: '0' });
  [['0', '#6a4f22'], ['0.55', '#a8813a'], ['1', '#E8C05A']].forEach(function (st) {
    grad.appendChild(el('stop', { offset: st[0], 'stop-color': st[1] }));
  });
  var glow = el('radialGradient', { id: 'canopyGlow' });
  glow.appendChild(el('stop', { offset: '0', 'stop-color': '#E8C05A', 'stop-opacity': '.20' }));
  glow.appendChild(el('stop', { offset: '1', 'stop-color': '#E8C05A', 'stop-opacity': '0' }));
  defs.appendChild(grad);
  defs.appendChild(glow);
  svg.appendChild(defs);

  /* мягкое свечение вокруг кроны */
  svg.appendChild(el('ellipse', { cx: baseX, cy: 176, rx: 178, ry: 132, fill: 'url(#canopyGlow)' }));

  /* земля */
  svg.appendChild(el('ellipse', { cx: baseX, cy: baseY - 2, rx: 104, ry: 12, fill: 'rgba(232,192,90,.10)' }));
  svg.appendChild(el('ellipse', { cx: baseX, cy: baseY - 2, rx: 62, ry: 7, fill: 'rgba(232,192,90,.10)' }));

  /* ствол — сужающийся книзу книзу==кверху */
  var trunk = el('path', {
    d: 'M' + (baseX - 11) + ' ' + baseY +
       ' C' + (baseX - 8) + ' ' + (baseY - 52) + ' ' + (baseX - 6) + ' ' + (forkY + 44) + ' ' + (baseX - 4) + ' ' + forkY +
       ' L' + (baseX + 4) + ' ' + forkY +
       ' C' + (baseX + 6) + ' ' + (forkY + 44) + ' ' + (baseX + 8) + ' ' + (baseY - 52) + ' ' + (baseX + 11) + ' ' + baseY + ' Z',
    fill: 'url(#trunkGrad)'
  });
  svg.appendChild(trunk);
  svg.appendChild(el('circle', { cx: baseX, cy: forkY, r: 4, fill: '#E8C05A' }));

  var maxV = Math.max.apply(null, BRANCHES.map(function (b) { return s.branch[b.key] || 0; }).concat([1]));

  /* угол от вертикали (град), длина, точка ответвления по стволу */
  var geo = [
    { a: -66, len: 118, from: 0.30 },
    { a: -34, len: 142, from: 0.62 },
    { a: -4,  len: 154, from: 0.95 },
    { a: 27,  len: 138, from: 0.66 },
    { a: 57,  len: 112, from: 0.33 }
  ];

  BRANCHES.forEach(function (b, i) {
    var g = geo[i];
    var rad = g.a * Math.PI / 180;
    var v = s.branch[b.key] || 0;
    var share = maxV > 0 ? v / maxV : 0;
    var sx = baseX;
    var sy = baseY - (baseY - forkY) * g.from;
    var ex = sx + Math.sin(rad) * g.len;
    var ey = sy - Math.cos(rad) * g.len;
    var cx1 = sx + Math.sin(rad) * g.len * 0.45;
    var cy1 = sy - Math.cos(rad) * g.len * 0.80;

    /* ветвь */
    svg.appendChild(el('path', {
      d: 'M' + sx + ' ' + sy + ' Q' + cx1 + ' ' + cy1 + ' ' + ex + ' ' + ey,
      stroke: b.color, 'stroke-width': (2.4 + share * 5.4).toFixed(1),
      'stroke-linecap': 'round', fill: 'none', opacity: '.9'
    }));

    /* крона: три перекрывающихся круга */
    var r0 = 17 + share * 19;
    [[0, 0, 1], [-r0 * 0.62, r0 * 0.30, 0.72], [r0 * 0.60, r0 * 0.34, 0.66]].forEach(function (o) {
      svg.appendChild(el('circle', {
        cx: (ex + o[0]).toFixed(1), cy: (ey + o[1]).toFixed(1), r: (r0 * o[2]).toFixed(1),
        fill: b.color, opacity: '.16'
      }));
    });
    svg.appendChild(el('circle', { cx: ex.toFixed(1), cy: ey.toFixed(1), r: '4.2', fill: b.color }));

    /* подпись-плашка снаружи кроны */
    var lx = baseX + Math.sin(rad) * (g.len + 24);
    var ly = baseY - (baseY - forkY) * g.from - Math.cos(rad) * (g.len + 24);
    var pw = 36, ph = 22;
    var rect = el('rect', {
      x: (lx - pw / 2).toFixed(1), y: (ly - ph / 2).toFixed(1), width: pw, height: ph,
      rx: 11, fill: 'rgba(10,15,30,.9)', stroke: b.color, 'stroke-opacity': '.55', 'stroke-width': '1.2'
    });
    svg.appendChild(rect);
    var label = el('text', {
      x: lx.toFixed(1), y: (ly + 4.2).toFixed(1), 'text-anchor': 'middle',
      'font-size': '11.5', 'fill': '#EAF0FF', 'font-weight': '700'
    });
    label.textContent = String(v);
    svg.appendChild(label);
  });

  return svg;
}

/* ---------- экспорт данных ---------- */
function exportData() {
  var json = Store.exportJSON();
  var body = h('div', { class: 'col' }, [
    h('p', { class: 'lead', text: 'Это все данные, которые прототип о вас знает. Скопируйте их или скачайте файлом — данные принадлежат вам.' }),
    h('textarea', { class: 'input mono', style: { minHeight: '180px', fontSize: '11.5px' }, readonly: 'readonly', text: json }),
    h('p', { class: 'small dim', text: 'Файл можно загрузить обратно кнопкой «Импорт» — это проверка переносимости профиля.' })
  ]);
  var ta = body.querySelector('textarea');
  Sheet.open({
    title: 'Экспорт данных',
    sub: 'Формат JSON · ' + json.length + ' символов',
    body: body,
    actions: [
      { label: 'Закрыть', variant: 'btn--ghost' },
      { label: 'Скопировать', variant: 'btn--primary', keepOpen: true, onClick: function () {
        try {
          ta.select();
          document.execCommand('copy');
          toast('Скопировано в буфер', 'ok', '📋');
        } catch (e) { toast('Выделите текст и скопируйте вручную', 'warn'); }
      } }
    ]
  });
}
