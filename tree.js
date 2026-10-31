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
          h('div', { class: 'small muted', text: 'уровень ' + lvl.n + ' из 6 · ' + s.contribution + ' очков вклада' })
        ])
      ]),
      progressBar(s.contribution, lvl.nextAt || Math.max(1, s.contribution), 'bar--gold'),
      h('div', { class: 'small muted', text: lvl.next ? 'До уровня «' + lvl.next + '» нужно ещё ' + lvl.toNext + ' очков вклада.' : 'Это высший уровень демо-контура.' }),
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
          chip(L.min + ' очков вклада', passed ? 'gold' : 'mint'),
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
  var svgNS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 360 320');
  svg.setAttribute('class', 'tree-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Дерево вклада: пять ветвей, толщина зависит от очков вклада');

  var defs = document.createElementNS(svgNS, 'defs');
  var grad = document.createElementNS(svgNS, 'linearGradient');
  grad.setAttribute('id', 'trunk');
  grad.setAttribute('x1', '0'); grad.setAttribute('y1', '1'); grad.setAttribute('x2', '0'); grad.setAttribute('y2', '0');
  [['0', '#6b5124'], ['1', '#E8C05A']].forEach(function (st) {
    var stop = document.createElementNS(svgNS, 'stop');
    stop.setAttribute('offset', st[0]); stop.setAttribute('stop-color', st[1]);
    grad.appendChild(stop);
  });
  defs.appendChild(grad);
  svg.appendChild(defs);

  var ground = document.createElementNS(svgNS, 'ellipse');
  ground.setAttribute('cx', '180'); ground.setAttribute('cy', '300');
  ground.setAttribute('rx', '96'); ground.setAttribute('ry', '10');
  ground.setAttribute('fill', 'rgba(232,192,90,.12)');
  svg.appendChild(ground);

  var trunk = document.createElementNS(svgNS, 'path');
  trunk.setAttribute('d', 'M180 300 C176 250 172 220 180 176');
  trunk.setAttribute('stroke', 'url(#trunk)');
  trunk.setAttribute('stroke-width', '10');
  trunk.setAttribute('fill', 'none');
  trunk.setAttribute('stroke-linecap', 'round');
  svg.appendChild(trunk);

  var maxB = Math.max.apply(null, BRANCHES.map(function (b) { return s.branch[b.key] || 0; }).concat([1]));
  var geo = [
    { x: 74, y: 118, cx: 62, cy: 96 },
    { x: 122, y: 82, cx: 112, cy: 58 },
    { x: 180, y: 62, cx: 180, cy: 36 },
    { x: 238, y: 86, cx: 250, cy: 60 },
    { x: 286, y: 126, cx: 300, cy: 104 }
  ];
  BRANCHES.forEach(function (b, i) {
    var g = geo[i];
    var v = s.branch[b.key] || 0;
    var w = 2 + (v / maxB) * 6;
    var path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M180 176 Q' + ((180 + g.x) / 2) + ' ' + (g.y + 14) + ' ' + g.x + ' ' + g.y);
    path.setAttribute('stroke', b.color);
    path.setAttribute('stroke-width', String(w));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('opacity', '.85');
    svg.appendChild(path);

    var crown = document.createElementNS(svgNS, 'circle');
    crown.setAttribute('cx', String(g.cx)); crown.setAttribute('cy', String(g.cy));
    crown.setAttribute('r', String(8 + (v / maxB) * 16));
    crown.setAttribute('fill', b.color);
    crown.setAttribute('opacity', '.18');
    svg.appendChild(crown);

    var dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('cx', String(g.cx)); dot.setAttribute('cy', String(g.cy));
    dot.setAttribute('r', '4');
    dot.setAttribute('fill', b.color);
    svg.appendChild(dot);

    var label = document.createElementNS(svgNS, 'text');
    label.setAttribute('x', String(g.cx));
    label.setAttribute('y', String(g.cy + 26));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '9.5');
    label.setAttribute('fill', '#C9D6F5');
    label.textContent = b.icon + ' ' + v;
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
