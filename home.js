/* ==========================================================================
   РУССКАЯ ВСЕЛЕННАЯ — главный экран
   ========================================================================== */
'use strict';

window.Views = window.Views || {};

/* ---------- общие мелкие конструкторы для всех экранов ---------- */
function sectionHead(title, sub, right) {
  return h('div', { class: 'row row--between row--wrap', style: { alignItems: 'flex-end' } }, [
    h('div', {}, [
      h('div', { class: 'h2', text: title }),
      sub ? h('div', { class: 'small muted mt-4', text: sub }) : null
    ]),
    right || null
  ]);
}

function goBtn(label, route, variant, small) {
  var b = h('button', {
    class: 'btn ' + (variant || 'btn--ghost') + (small ? ' btn--sm' : ''),
    type: 'button'
  }, [h('span', { text: label })]);
  b.addEventListener('click', function () { go(route); });
  return b;
}

function iconCard(icon, title, sub, route, chipText) {
  var node = cardShell({ link: true, route: route, cls: 'card--pad-sm' });
  node.appendChild(h('div', { class: 'row row--top' }, [
    h('div', { class: 'list-row__ico', text: icon }),
    h('div', { class: 'list-row__main' }, [
      h('div', { class: 'list-row__title', text: title }),
      h('div', { class: 'list-row__sub', text: sub })
    ]),
    chipText ? chip(chipText, 'gold') : null
  ]));
  return node;
}

/* имена ассистентов в винительном падеже — для «Спросить …» */
var ASSISTANT_ACC = { bogatyr: 'Богатыря', svetlana: 'Светлану', ilya: 'Илью Муромца' };

Views.home = function () {
  var s = Store.get();
  var lvl = Store.levelInfo();
  var wrap = h('div', { class: 'view__inner' });
  var assistant = DEMO.assistants.filter(function (a) { return a.id === s.assistant; })[0] || DEMO.assistants[0];
  var hour = new Date().getHours();
  var greet = hour < 6 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';

  /* ---------- приветствие ---------- */
  var hero = h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [
      chip('Демо-контур', 'gold'),
      chip(s.mode === 'child' ? 'Детский профиль · 6+' : 'Взрослый профиль · 18+', s.mode === 'child' ? 'mint' : 'azure'),
      chip('Офлайн · без сервера')
    ]),
    h('h1', { class: 'h1 mt-12', text: greet + ', ' + (s.name || 'друг') + '!' }),
    h('p', { class: 'lead mt-8', text: 'Сегодня в вашем дереве ' + s.contribution + ' очков вклада — это уровень «' + lvl.name + '». Ниже собрано то, что можно сделать прямо сейчас.' }),
    h('div', { class: 'row mt-16 row--wrap' }, [
      goBtn('Спросить ' + (ASSISTANT_ACC[assistant.id] || 'ассистента'), 'assistant', 'btn--gold'),
      goBtn('Открыть слободы', 'slobody', 'btn--ghost'),
      goBtn('Продолжить обучение', 'edu', 'btn--ghost')
    ]),
    h('div', { class: 'row mt-16 row--wrap', style: { gap: '26px' } }, [
      statBlock(fmt(s.lad) + ' Л', 'баланс «Лад»'),
      statBlock(lvl.name, 'уровень ' + lvl.n + ' из 6'),
      statBlock(String(DEMO.slobody.length), 'слобод в сети'),
      statBlock(String(s.completedLessons.length + (s.olympiadScore !== null ? 1 : 0)), 'учебных шагов')
    ])
  ]);
  hero.appendChild(h('div', { class: 'hero__art', html: treeArt() }));
  wrap.appendChild(hero);

  /* ---------- прогресс уровня ---------- */
  var progressCard = h('div', { class: 'card' }, [
    h('div', { class: 'row row--between row--wrap' }, [
      h('div', { class: 'row' }, [
        h('div', { class: 'ring', style: { '--p': String(lvl.progress), '--c': 'var(--gold)' } }, [
          h('span', { class: 'ring__val', text: lvl.progress + '%' })
        ]),
        h('div', {}, [
          h('div', { class: 'h3', text: lvl.icon + ' ' + lvl.name }),
          h('div', { class: 'small muted', text: lvl.next ? ('до «' + lvl.next + '»: ' + lvl.toNext + ' очков вклада') : 'высший уровень демо-контура' })
        ])
      ]),
      goBtn('Дерево жизни', 'tree', 'btn--ghost', true)
    ]),
    h('div', { class: 'mt-16' }, [progressBar(s.contribution, lvl.nextAt || Math.max(1, s.contribution), 'bar--gold')]),
    h('div', { class: 'chips mt-12' }, [
      chip('учёба ' + s.branch.edu, 'azure'),
      chip('здоровье ' + s.branch.health, 'mint'),
      chip('творчество ' + s.branch.create, 'violet'),
      chip('карьера ' + s.branch.career, 'gold'),
      chip('добро ' + s.branch.kind, 'crimson')
    ]),
    h('p', { class: 'small dim mt-12', text: 'Уровень зависит только от дел: уроки, помощь соседям, волонтёрство, проекты. В прототипе это демонстрационный расчёт.' })
  ]);
  wrap.appendChild(progressCard);

  /* ---------- быстрые действия ---------- */
  wrap.appendChild(sectionHead('Быстрые действия', 'Каждый раздел можно открыть и на телефоне'));
  wrap.appendChild(h('div', { class: 'grid grid--4' }, [
    iconCard('🤖', 'Ассистент', assistant.name + ' · с источниками', 'assistant'),
    iconCard('🌿', 'Слободы', '5 кластеров, IoT, паспорта', 'slobody'),
    iconCard('🧺', 'Маркетплейс', 'Корзина чистых продуктов', 'market', 'Лад'),
    iconCard('🎓', 'Золото России', '3 трека и олимпиада', 'edu'),
    iconCard('🗳️', 'Копа', 'Голосования и повестка', 'kopa'),
    iconCard('🔄', 'Центр желаний', 'Обмен вещами и навыками', 'wishes'),
    iconCard('🕊️', 'Путь добра', 'Проекты с открытой сметой', 'kindness'),
    iconCard('🛡️', 'Киберщит', 'Защита детей · 436-ФЗ', 'shield', '6+')
  ]));

  /* ---------- дела на сегодня ---------- */
  var planCard = h('div', { class: 'card' });
  planCard.appendChild(sectionHead('Дела на сегодня', 'Отметка выполняет демо-действие: +вклад и +Лад'));
  var planList = h('div', { class: 'list mt-12' });
  DEMO.health.plan.forEach(function (p) {
    var done = s.plan[p.id];
    var row = h('div', { class: 'list-row' }, [
      h('span', { class: 'list-row__ico', text: done ? '✓' : '○' }),
      h('span', { class: 'list-row__main' }, [
        h('span', { class: 'list-row__title', text: p.title }),
        h('span', { class: 'list-row__sub', text: p.note })
      ]),
      (function () {
        var b = h('button', { class: 'btn btn--xs ' + (done ? 'btn--ghost' : 'btn--primary'), type: 'button', text: done ? 'Выполнено' : 'Отметить' });
        b.addEventListener('click', function () {
          if (done) { toast('Это дело уже отмечено', 'warn'); return; }
          Store.biz(function (st) { st.plan[p.id] = true; });
          Store.addContribution(3, 'health');
          Store.addLad(5, 'Дело выполнено: ' + p.title, 'health');
          toast('+3 очка вклада, +5 Ладов', 'ok', '✓');
          refresh();
        });
        return b;
      })()
    ]);
    planList.appendChild(row);
  });
  planCard.appendChild(planList);
  planCard.appendChild(h('div', { class: 'row mt-12 row--wrap' }, [
    goBtn('Все рекомендации →', 'health', 'btn--ghost', true),
    h('span', { class: 'small dim', text: 'Рекомендации не медицинские. Куратор: ' + DEMO.health.curator.replace('Куратор: ', '') })
  ]));
  wrap.appendChild(planCard);

  /* ---------- карта слобод ---------- */
  var mapCard = h('div', { class: 'card' });
  mapCard.appendChild(sectionHead('Слободы на карте', 'Нажмите на точку, чтобы открыть карточку',
    goBtn('Все слободы →', 'slobody', 'btn--ghost', true)));
  mapCard.appendChild(h('div', { class: 'mt-12' }, [buildMap(function (id) { go('slobody/' + id); }, false)]));
  wrap.appendChild(mapCard);

  /* ---------- новости ---------- */
  var newsCard = h('div', { class: 'card' });
  newsCard.appendChild(sectionHead('Что нового', 'Лента демо-контура'));
  var newsList = h('div', { class: 'list mt-12' });
  DEMO.news.forEach(function (n) {
    newsList.appendChild(h('div', { class: 'list-row' }, [
      h('span', { class: 'list-row__ico', text: n.icon }),
      h('span', { class: 'list-row__main' }, [
        h('span', { class: 'list-row__title', text: n.title }),
        h('span', { class: 'list-row__sub', text: n.time })
      ]),
      chip(n.tag, 'azure')
    ]));
  });
  newsCard.appendChild(newsList);
  wrap.appendChild(newsCard);

  /* ---------- этика ---------- */
  wrap.appendChild(h('div', { class: 'card card--flat' }, [
    h('div', { class: 'tag', text: 'Правила контура' }),
    h('div', { class: 'small muted mt-8', text: 'Уровни — за вклад, а не за происхождение. Модули добровольные. Несовершеннолетним — маркировка 6+/12+/16+ и согласие родителя. Любую рекомендацию ИИ можно раскрыть и оспорить. Данные хранятся в вашем браузере, их можно экспортировать или удалить.' }),
    h('div', { class: 'row mt-12 row--wrap' }, [
      goBtn('Этика и данные →', 'ethics', 'btn--ghost', true),
      goBtn('Киберщит →', 'shield', 'btn--ghost', true)
    ])
  ]));

  return wrap;
};

/* ---------- декоративный знак для героя ---------- */
function treeArt() {
  return '<svg viewBox="0 0 300 300" width="100%" height="100%" aria-hidden="true">' +
    '<defs>' +
    '<radialGradient id="hg"><stop offset="0" stop-color="#E8C05A" stop-opacity=".55"/>' +
    '<stop offset="1" stop-color="#E8C05A" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="hs" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#F7E3AC"/><stop offset="1" stop-color="#C99A2E"/></linearGradient>' +
    '</defs>' +
    '<circle cx="150" cy="150" r="132" fill="url(#hg)" opacity=".8"/>' +
    '<g fill="none" stroke="#E8C05A" stroke-width="1.2" opacity=".45">' +
    '<circle cx="150" cy="150" r="104"/><circle cx="150" cy="150" r="72" stroke-dasharray="3 7"/>' +
    '</g>' +
    '<path d="M150 46 L168 132 L254 150 L168 168 L150 254 L132 168 L46 150 L132 132 Z" fill="url(#hs)" opacity=".9"/>' +
    '<circle cx="150" cy="150" r="15" fill="#0B1020"/>' +
    '<circle cx="150" cy="150" r="8" fill="none" stroke="#E8C05A" stroke-width="1.4" opacity=".8"/>' +
    '<g fill="#F7E3AC" opacity=".85">' +
    '<circle cx="232" cy="84" r="3"/><circle cx="70" cy="214" r="2.4"/>' +
    '<circle cx="238" cy="220" r="2"/><circle cx="62" cy="80" r="2.2"/>' +
    '</g>' +
    '</svg>';
}

/* ---------- карта слобод (общая для главной и раздела) ---------- */
function buildMap(onPick, withLabels) {
  var wrap = h('div', { class: 'map-wrap' });
  var svgNS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 80');
  svg.setAttribute('class', 'map-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Схематичная карта слобод');

  var grad = document.createElementNS(svgNS, 'linearGradient');
  grad.setAttribute('id', 'mapbg');
  grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0'); grad.setAttribute('x2', '1'); grad.setAttribute('y2', '1');
  [['0', '#101a33'], ['1', '#0a1024']].forEach(function (st) {
    var stop = document.createElementNS(svgNS, 'stop');
    stop.setAttribute('offset', st[0]); stop.setAttribute('stop-color', st[1]);
    grad.appendChild(stop);
  });
  var defs = document.createElementNS(svgNS, 'defs');
  defs.appendChild(grad);
  svg.appendChild(defs);

  var bg = document.createElementNS(svgNS, 'rect');
  bg.setAttribute('width', '100'); bg.setAttribute('height', '80');
  bg.setAttribute('fill', 'url(#mapbg)');
  svg.appendChild(bg);

  /* условные линии-«дороги» между слободами */
  var pairs = [[0, 1], [1, 2], [2, 3], [1, 4]];
  pairs.forEach(function (p) {
    var a = DEMO.slobody[p[0]], b = DEMO.slobody[p[1]];
    var line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    line.setAttribute('stroke', 'rgba(232,192,90,.22)');
    line.setAttribute('stroke-width', '.4');
    line.setAttribute('stroke-dasharray', '1.6 1.6');
    svg.appendChild(line);
  });

  DEMO.slobody.forEach(function (sl) {
    var g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', 'map-pin');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', sl.name + ', ' + sl.region);
    var halo = document.createElementNS(svgNS, 'circle');
    halo.setAttribute('cx', sl.x); halo.setAttribute('cy', sl.y); halo.setAttribute('r', 4.6);
    halo.setAttribute('fill', sl.accent); halo.setAttribute('opacity', '.18');
    var core = document.createElementNS(svgNS, 'circle');
    core.setAttribute('class', 'pin-core');
    core.setAttribute('cx', sl.x); core.setAttribute('cy', sl.y); core.setAttribute('r', 2.6);
    core.setAttribute('fill', sl.accent);
    core.setAttribute('stroke', '#0B1020'); core.setAttribute('stroke-width', '.5');
    g.appendChild(halo); g.appendChild(core);

    if (withLabels !== false) {
      var t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', sl.x + 4);
      t.setAttribute('y', sl.y + 1.4);
      t.textContent = sl.short;
      g.appendChild(t);
    }
    g.addEventListener('click', function () { onPick(sl.id); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(sl.id); } });
    svg.appendChild(g);
  });

  wrap.appendChild(svg);
  return wrap;
}
