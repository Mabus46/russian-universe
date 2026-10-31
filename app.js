/* ==========================================================================
   РУССКАЯ ВСЕЛЕННАЯ — приложение: маршрутизация, каркас, онбординг, профиль
   ========================================================================== */
'use strict';

var NAV = [
  { group: 'Платформа', items: [
    { route: 'home', icon: '🏠', label: 'Главная' },
    { route: 'assistant', icon: '🤖', label: 'Ассистент', tag: 'AI' },
    { route: 'tree', icon: '🌳', label: 'Дерево жизни' }
  ] },
  { group: 'Экосистема', items: [
    { route: 'slobody', icon: '🌿', label: 'Слободы' },
    { route: 'market', icon: '🧺', label: 'Маркетплейс' },
    { route: 'edu', icon: '🎓', label: 'Золото России' },
    { route: 'olympiad', icon: '🏅', label: 'Олимпиада' },
    { route: 'studio', icon: '🎬', label: 'Студия «Русь»' }
  ] },
  { group: 'Сообщество', items: [
    { route: 'kopa', icon: '🗳️', label: 'Копа' },
    { route: 'wishes', icon: '🔄', label: 'Центр желаний' },
    { route: 'kindness', icon: '🕊️', label: 'Путь добра' },
    { route: 'health', icon: '💚', label: 'Золотой век' }
  ] },
  { group: 'Доверие', items: [
    { route: 'shield', icon: '🛡️', label: 'Киберщит', tag: '6+' },
    { route: 'ethics', icon: '⚖️', label: 'Этика и данные' }
  ] }
];

/* детскому профилю недоступны разделы взрослой экономики и самоуправления */
var CHILD_BLOCKED = ['kopa', 'wishes'];

var TITLES = {
  home: 'Главная',
  assistant: 'ИИ-ассистент',
  tree: 'Дерево жизни',
  slobody: 'Слободы',
  market: 'Маркетплейс «Слободы»',
  edu: 'Золото России',
  olympiad: 'Олимпиада',
  studio: 'Студия «Русь»',
  kopa: 'Копа и сообщество',
  wishes: 'Центр желаний',
  kindness: 'Путь добра',
  health: 'Золотой век',
  shield: 'Киберщит',
  ethics: 'Этика и данные'
};

var currentRoute = 'home';
var PARENT_ACCESS_UNTIL = 0; /* временный доступ к 18+ разделам после ввода кода родителя */

/* ---------------- навигация ---------------- */
function allNavItems() {
  var out = [];
  NAV.forEach(function (g) { g.items.forEach(function (i) { out.push(i); }); });
  return out;
}

function navItemFor(route) {
  var items = allNavItems();
  for (var i = 0; i < items.length; i++) if (items[i].route === route) return items[i];
  return null;
}

function renderNav() {
  var s = Store.get();
  var desktop = document.getElementById('nav-desktop');
  clear(desktop);

  NAV.forEach(function (group) {
    desktop.appendChild(h('div', { class: 'nav__group', text: group.group }));
    group.items.forEach(function (item) {
      var locked = s.mode === 'child' && CHILD_BLOCKED.indexOf(item.route) >= 0;
      var btn = h('button', {
        class: 'nav__item' + (item.route === currentRoute ? ' is-active' : ''),
        type: 'button',
        'aria-current': item.route === currentRoute ? 'page' : null,
        'data-route': item.route
      }, [
        h('span', { class: 'nav__ico', text: item.icon }),
        h('span', { class: 'nav__label', text: item.label }),
        locked ? h('span', { class: 'nav__tag', text: '18+' }) : (item.tag ? h('span', { class: 'nav__tag', text: item.tag }) : null)
      ]);
      btn.addEventListener('click', function () { go(item.route); closeSidebar(); });
      desktop.appendChild(btn);
    });
  });

  /* нижнее меню: 5 ячеек */
  var tabbar = document.getElementById('tabbar');
  clear(tabbar);
  var tabs = [
    { route: 'home', icon: '🏠', label: 'Главная' },
    { route: 'assistant', icon: '🤖', label: 'Ассистент' },
    { route: 'slobody', icon: '🌿', label: 'Слободы' },
    { route: 'edu', icon: '🎓', label: 'Обучение' },
    { route: '__more', icon: '⋯', label: 'Ещё' }
  ];
  tabs.forEach(function (t) {
    var active = t.route === currentRoute || (t.route === '__more' && ['tree', 'market', 'olympiad', 'studio', 'kopa', 'wishes', 'kindness', 'health', 'shield', 'ethics'].indexOf(currentRoute) >= 0);
    var b = h('button', { class: 'tabbar__btn' + (active ? ' is-active' : ''), type: 'button' }, [
      h('span', { class: 't-ico', text: t.icon }),
      h('span', { text: t.label })
    ]);
    b.addEventListener('click', function () {
      if (t.route === '__more') openMoreSheet();
      else go(t.route);
    });
    tabbar.appendChild(b);
  });
}

function openMoreSheet() {
  var s = Store.get();
  var body = h('div', { class: 'col', style: { gap: '6px' } });
  NAV.forEach(function (group) {
    body.appendChild(h('div', { class: 'tag mt-8', text: group.group }));
    group.items.forEach(function (item) {
      var locked = s.mode === 'child' && CHILD_BLOCKED.indexOf(item.route) >= 0;
      var row = h('button', { class: 'list-row list-row--link', type: 'button' }, [
        h('span', { class: 'list-row__ico', text: item.icon }),
        h('span', { class: 'list-row__main' }, [
          h('span', { class: 'list-row__title', text: item.label })
        ]),
        h('span', { class: 'list-row__side muted', text: locked ? '18+' : (item.tag || '') })
      ]);
      row.addEventListener('click', function () { Sheet.close(); go(item.route); });
      body.appendChild(row);
    });
  });
  Sheet.open({ title: 'Все разделы', body: body });
}

function closeSidebar() {
  var sb = document.getElementById('sidebar');
  if (sb) sb.classList.remove('is-open');
}

function go(route, opts) {
  opts = opts || {};
  if (!route) route = 'home';
  var target = '#/' + route;
  if (location.hash === target) { renderView(); }
  else location.hash = target;
  if (!opts.keepScroll) {
    var v = document.getElementById('view');
    if (v) v.scrollTop = 0;
  }
}

/* ---------------- рендер ---------------- */
function parseHash() {
  var raw = (location.hash || '').replace(/^#\/?/, '');
  var parts = raw.split('/').filter(Boolean);
  return { route: parts[0] || 'home', param: parts[1] || null };
}

function renderView() {
  var s = Store.get();
  var view = document.getElementById('view');
  var parsed = parseHash();
  currentRoute = parsed.route;
  var parentOpen = Date.now() < PARENT_ACCESS_UNTIL;
  var block = ['kopa', 'wishes'].indexOf(currentRoute) >= 0 && s.mode === 'child' && !parentOpen;

  clear(view);
  var inner = h('div', { style: { display: 'block' } });
  view.appendChild(inner);

  var title = TITLES[parsed.route] || 'Русская вселенная';

  if (!s.onboarded) {
    document.getElementById('page-title').textContent = 'Знакомство';
    inner.appendChild(Views.onboarding());
    renderNav();
    updateChrome();
    return;
  }

  if (block) {
    document.getElementById('page-title').textContent = 'Доступ ограничен';
    inner.appendChild(h('div', { class: 'view__inner' }, [h('div', { class: 'card card--glow' }, [
      h('div', { class: 'h2', text: 'Этот раздел доступен с 18 лет' }),
      h('p', { class: 'lead mt-8', text: 'В детском профиле взрослые разделы экономики и самоуправления скрыты. Родитель может открыть их в настройках профиля.' }),
      h('div', { class: 'row mt-16' }, [
        (function () {
          var b = h('button', { class: 'btn btn--primary', type: 'button', text: 'Ввести код родителя' });
          b.addEventListener('click', function () { askParentPin(function () { go('home'); }); });
          return b;
        })(),
        (function () {
          var b = h('button', { class: 'btn btn--ghost', type: 'button', text: 'На главную' });
          b.addEventListener('click', function () { go('home'); });
          return b;
        })()
      ])
    ])]));
    renderNav();
    updateChrome();
    return;
  }

  var fn = null;
  if (parsed.route === 'slobody' && parsed.param) { fn = Views.slobodaDetail; title = 'Слобода'; }
  else if (parsed.route === 'product' && parsed.param) { fn = Views.productDetail; title = 'Паспорт продукта'; }
  else if (parsed.route === 'track' && parsed.param) { fn = Views.trackDetail; title = 'Образовательный трек'; }
  else if (parsed.route === 'lesson' && parsed.param) { fn = Views.lessonDetail; title = 'Урок'; }
  else if (Views[parsed.route]) { fn = Views[parsed.route]; }

  if (!fn) {
    inner.appendChild(h('div', { class: 'view__inner' }, [emptyState('🧭', 'Раздел не найден', 'Вернитесь на главную — или выберите раздел в меню.')]));
    fn = null;
  } else {
    var node = fn(parsed.param);
    if (node) inner.appendChild(node);
  }

  document.getElementById('page-title').textContent = title;
  renderNav();
  updateChrome();
}

function refresh() { renderView(); }

function updateChrome() {
  var s = Store.get();
  var lvl = Store.levelInfo();
  var wl = document.getElementById('wallet-lad');
  var wv = document.getElementById('wallet-lvl');
  if (wl) wl.textContent = fmt(s.lad);
  if (wv) wv.textContent = 'Ур. ' + lvl.n;
  var initial = document.getElementById('profile-initial');
  if (initial) initial.textContent = (s.name || 'Гость').trim().charAt(0).toUpperCase();
  var env = document.getElementById('env-label');
  if (env) env.textContent = Store.storageOk() ? 'Демо-контур · данные в браузере' : 'Демо-контур · без сохранения';
}

/* ---------------- PIN родителя ---------------- */
function askParentPin(onOk) {
  var s = Store.get();
  var pin = s.parentPin || '1234';
  var input = h('input', { class: 'input', type: 'password', inputmode: 'numeric', maxlength: '4', placeholder: '4 цифры', 'aria-label': 'Код родителя' });
  var hint = h('div', { class: 'small dim mt-8', text: 'В демо-контуре код родителя: ' + pin });
  var body = h('div', {}, [
    h('p', { class: 'lead', text: 'Введите код родителя, чтобы открыть взрослый раздел.' }),
    h('form', { class: 'field mt-12', onsubmit: function (e) { e.preventDefault(); } }, [h('span', { class: 'field__label', text: 'Код родителя' }), input]),
    hint
  ]);
  Sheet.open({
    title: 'Подтверждение родителя',
    body: body,
    actions: [
      { label: 'Отмена', variant: 'btn--ghost' },
      { label: 'Открыть', variant: 'btn--primary', keepOpen: true, onClick: function () {
        if (input.value.trim() === pin) {
          PARENT_ACCESS_UNTIL = Date.now() + 10 * 60 * 1000;
          Sheet.close();
          toast('Доступ открыт на 10 минут', 'ok', '🔓');
          if (onOk) onOk();
        } else {
          toast('Код не совпал. Попробуйте ещё раз.', 'err');
          input.focus();
        }
      } }
    ]
  });
  setTimeout(function () { input.focus(); }, 120);
}

/* ---------------- онбординг ---------------- */
window.Views = window.Views || {};
Views.onboarding = function () {
  var step = 0;
  var draft = { name: '', mode: 'adult', assistant: 'bogatyr' };
  var wrap = h('div', { class: 'view__inner', style: { maxWidth: '760px' } });

  function render() {
    clear(wrap);

    if (step === 0) {
      var hero = h('div', { class: 'hero' }, [
        h('div', { class: 'chips' }, [chip('Прототип MVP', 'gold'), chip('Офлайн · без сервера'), chip('Данные только в браузере')]),
        h('h1', { class: 'h1 mt-16', text: 'Русская вселенная' }),
        h('p', { class: 'lead mt-8', text: 'Цифровая экосистема: ИИ-ассистенты, слободы с паспортами продуктов, образование, экономика «Лад», сообщество, здоровье и защита детей. Всё, что вы увидите дальше, работает на демонстрационных данных.' }),
        h('div', { class: 'row mt-16 row--wrap' }, [
          (function () {
            var b = h('button', { class: 'btn btn--gold', type: 'button' }, [h('span', { text: 'Начать знакомство' }), h('span', { text: '→' })]);
            b.addEventListener('click', function () { step = 1; render(); });
            return b;
          })(),
          (function () {
            var b = h('button', { class: 'btn btn--ghost', type: 'button', text: 'Сначала посмотреть, как устроено' });
            b.addEventListener('click', function () { openArchitecture(); });
            return b;
          })()
        ])
      ]);
      hero.appendChild(h('div', { class: 'hero__art', html: starArt() }));
      wrap.appendChild(hero);

      wrap.appendChild(h('div', { class: 'grid grid--3' }, [
        featureCard('🤖', 'ИИ-ассистенты', 'Богатырь, Светлана и Илья — с объяснением каждой рекомендации и ссылкой на источник.'),
        featureCard('🌿', 'Слободы', 'Пять кластеров, IoT-датчики и паспорт продукта с проверяемой историей поставки.'),
        featureCard('🌳', 'Дерево вклада', 'Уровень растёт только от ваших дел: учёбы, помощи и проектов. Никаких статусов «по рождению».')
      ]));
      return;
    }

    if (step === 1) {
      var nameInput = h('input', { class: 'input', type: 'text', maxlength: '24', placeholder: 'Как к вам обращаться?', value: draft.name });
      nameInput.addEventListener('input', function () { draft.name = nameInput.value; });
      var body = h('div', { class: 'card card--glow', style: { maxWidth: '620px', margin: '0 auto' } }, [
        h('div', { class: 'tag', text: 'Шаг 1 из 2' }),
        h('h2', { class: 'h2 mt-8', text: 'Как вас зовут и в каком режиме играем?' }),
        h('div', { class: 'field mt-16' }, [h('span', { class: 'field__label', text: 'Имя' }), nameInput]),
        h('div', { class: 'field mt-16' }, [
          h('span', { class: 'field__label', text: 'Режим профиля' }),
          (function () {
            var group = h('div', { class: 'grid grid--2' });
            [['adult', '👤', 'Взрослый', 'Все разделы и экономика'], ['child', '🧒', 'Детский', 'Киберщит, обучение, без экономики']].forEach(function (m) {
              var b = h('button', { class: 'quiz-opt' + (draft.mode === m[0] ? ' is-right' : ''), type: 'button' }, [
                h('span', { class: 'quiz-opt__letter', text: m[1] }),
                h('span', {}, [h('div', { class: 'strong', text: m[2] }), h('div', { class: 'small muted', text: m[3] })])
              ]);
              b.addEventListener('click', function () {
                draft.mode = m[0];
                Array.prototype.forEach.call(group.children, function (c) { c.classList.remove('is-right'); });
                b.classList.add('is-right');
              });
              group.appendChild(b);
            });
            return group;
          })()
        ]),
        h('div', { class: 'row mt-24 row--wrap' }, [
          (function () {
            var b = h('button', { class: 'btn btn--ghost', type: 'button', text: '← Назад' });
            b.addEventListener('click', function () { step = 0; render(); });
            return b;
          })(),
          (function () {
            var b = h('button', { class: 'btn btn--primary', type: 'button', text: 'Дальше →' });
            b.addEventListener('click', function () {
              if (!draft.name.trim()) { toast('Напишите имя — так ассистенту будет проще', 'warn'); nameInput.focus(); return; }
              step = 2; render();
            });
            return b;
          })()
        ])
      ]);
      wrap.appendChild(body);
      return;
    }

    /* шаг 3: ассистент */
    var grid = h('div', { class: 'grid grid--3' });
    DEMO.assistants.forEach(function (a) {
      var b = h('button', { class: 'card card--link' + (draft.assistant === a.id ? ' card--glow' : ''), type: 'button', style: { textAlign: 'left' } }, [
        h('div', { class: 'msg__ava', style: { marginBottom: '10px' }, text: a.icon }),
        h('div', { class: 'h3', text: a.name }),
        h('div', { class: 'small muted mt-4', text: a.role }),
        h('div', { class: 'small mt-8', text: a.tone }),
        h('div', { class: 'chips mt-12' }, [chip(a.voice, 'azure')])
      ]);
      b.addEventListener('click', function () {
        draft.assistant = a.id;
        Array.prototype.forEach.call(grid.children, function (c) { c.classList.remove('card--glow'); });
        b.classList.add('card--glow');
      });
      grid.appendChild(b);
    });

    var body2 = h('div', {}, [
      h('div', { class: 'card card--glow' }, [
        h('div', { class: 'tag', text: 'Шаг 2 из 2' }),
        h('h2', { class: 'h2 mt-8', text: 'Выберите ассистента' }),
        h('p', { class: 'lead mt-8', text: 'Персону и голос можно сменить в любой момент — функции у ассистентов одинаковые.' }),
        h('div', { class: 'mt-16' }, [grid]),
        h('div', { class: 'row mt-24 row--wrap' }, [
          (function () {
            var b = h('button', { class: 'btn btn--ghost', type: 'button', text: '← Назад' });
            b.addEventListener('click', function () { step = 1; render(); });
            return b;
          })(),
          (function () {
            var b = h('button', { class: 'btn btn--gold', type: 'button' }, [h('span', { text: 'Войти в вселенную' }), h('span', { text: '✦' })]);
            b.addEventListener('click', function () {
              Store.biz(function (s) {
                s.name = draft.name.trim();
                s.mode = draft.mode;
                s.assistant = draft.assistant;
                s.onboarded = true;
              });
              toast('Профиль создан. Добро пожаловать, ' + draft.name.trim() + '!', 'ok', '✦');
              go('home');
            });
            return b;
          })()
        ])
      ]),
      h('p', { class: 'small dim center mt-16', text: 'В демо-контуре действуют демонстрационные правила: никакие данные не отправляются на сервер.' })
    ]);
    wrap.appendChild(body2);
  }

  render();
  return wrap;
};

function featureCard(icon, title, text) {
  return h('div', { class: 'card' }, [
    h('div', { class: 'list-row__ico', text: icon }),
    h('div', { class: 'h3 mt-12', text: title }),
    h('p', { class: 'small muted mt-8', text: text })
  ]);
}

function openArchitecture() {
  var body = h('div', { class: 'col' }, [
    h('p', { class: 'lead', text: 'Прототип отражает архитектуру из ТЗ: четыре слоя и набор модулей. В демо все сервисы заменены локальными симуляциями.' }),
    h('div', { class: 'card card--flat' }, [
      h('div', { class: 'tag', text: 'AI-Layer' }),
      h('div', { class: 'small muted mt-4', text: 'Богатырь · Светлана · Илья Муромец · ядро «Свет» (оркестратор рекомендаций)' })
    ]),
    h('div', { class: 'card card--flat' }, [
      h('div', { class: 'tag', text: 'Core Services' }),
      h('div', { class: 'small muted mt-4', text: 'Идентичность · дерево жизни · уровни вклада · здоровье · образование · репутация' })
    ]),
    h('div', { class: 'card card--flat' }, [
      h('div', { class: 'tag', text: 'Content Layer' }),
      h('div', { class: 'small muted mt-4', text: 'Студия «Русь»: VR/AR, фильмы, симуляторы, цифровые реконструкции' })
    ]),
    h('div', { class: 'card card--flat' }, [
      h('div', { class: 'tag', text: 'Economy & Data' }),
      h('div', { class: 'small muted mt-4', text: 'Токен «Лад» · маркетплейс · Центр желаний · журнал операций с хеш-цепочкой · IoT-дашборды' })
    ]),
    h('p', { class: 'small dim', text: 'Вне скоупа прототипа: реальные интеграции с ЕСИА/Госуслугами, платежи, VR-движок, промышленный блокчейн.' })
  ]);
  Sheet.open({ title: 'Архитектура прототипа', sub: 'Как ТЗ превращено в демонстрируемую систему', body: body, actions: [{ label: 'Понятно', variant: 'btn--primary' }] });
}

function starArt() {
  return '<svg viewBox="0 0 300 300" width="100%" height="100%" aria-hidden="true">' +
    '<defs><radialGradient id="hg"><stop offset="0" stop-color="#E8C05A" stop-opacity=".8"/><stop offset="1" stop-color="#E8C05A" stop-opacity="0"/></radialGradient></defs>' +
    '<circle cx="150" cy="150" r="140" fill="url(#hg)"/>' +
    '<g stroke="#E8C05A" stroke-width="1" opacity=".5">' +
    '<circle cx="150" cy="150" r="96" fill="none"/><circle cx="150" cy="150" r="64" fill="none"/><circle cx="150" cy="150" r="126" fill="none"/>' +
    '</g>' +
    '<path d="M150 60 L168 132 L240 150 L168 168 L150 240 L132 168 L60 150 L132 132 Z" fill="#E8C05A" opacity=".92"/>' +
    '<circle cx="150" cy="150" r="16" fill="#0B1020"/>' +
    '<g fill="#E8C05A" opacity=".8"><circle cx="228" cy="86" r="3"/><circle cx="76" cy="210" r="2.5"/><circle cx="236" cy="216" r="2"/><circle cx="66" cy="82" r="2"/></g>' +
    '</svg>';
}

/* ---------------- профиль ---------------- */
function openProfile() {
  var s = Store.get();
  var lvl = Store.levelInfo();
  var a = DEMO.assistants.filter(function (x) { return x.id === s.assistant; })[0] || DEMO.assistants[0];

  var body = h('div', { class: 'col' }, [
    h('div', { class: 'row' }, [
      h('div', { class: 'msg__ava', style: { width: '52px', height: '52px', fontSize: '22px' }, text: lvl.icon }),
      h('div', {}, [
        h('div', { class: 'h3', text: s.name || 'Гость' }),
        h('div', { class: 'small muted', text: 'Уровень ' + lvl.n + ' · ' + lvl.name + ' · ' + s.contribution + ' очков вклада' })
      ])
    ]),
    progressBar(s.contribution, lvl.nextAt || s.contribution + 1, 'bar--gold'),
    h('div', { class: 'small muted', text: lvl.next ? ('До уровня «' + lvl.next + '» — ' + lvl.toNext + ' очков вклада') : 'Максимальный уровень в демо-контуре' }),

    h('hr', { class: 'hr mt-16' }),
    kvRow('Режим профиля', s.mode === 'child' ? 'Детский (под контролем родителя)' : 'Взрослый'),
    kvRow('Ассистент', a.name),
    kvRow('Баланс «Лад»', fmt(s.lad) + ' Л'),
    kvRow('Записей в журнале', String(s.ledger.length)),
    kvRow('Хранилище', Store.storageOk() ? 'localStorage (браузер)' : 'недоступно'),

    h('div', { class: 'row mt-16 row--wrap' }, [
      (function () {
        var b = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '⚖️ Этика и данные' });
        b.addEventListener('click', function () { Sheet.close(); go('ethics'); });
        return b;
      })(),
      (function () {
        var b = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '🤖 Сменить ассистента' });
        b.addEventListener('click', function () { Sheet.close(); changeAssistant(); });
        return b;
      })(),
      (function () {
        var b = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '🔁 Сбросить демо' });
        b.addEventListener('click', function () {
          Sheet.confirm({ title: 'Сбросить демо-профиль?', text: 'Данные прототипа вернутся к начальному состоянию.', okLabel: 'Сбросить', danger: true })
            .then(function (ok) {
              if (!ok) return;
              Store.reset();
              Sheet.close();
              toast('Демо-профиль сброшен', 'ok', '🔁');
              go('home'); refresh();
            });
        });
        return b;
      })()
    ])
  ]);

  Sheet.open({ title: 'Профиль', sub: 'Данные хранятся только в вашем браузере', body: body, actions: [{ label: 'Закрыть', variant: 'btn--ghost' }] });
}

function changeAssistant() {
  var s = Store.get();
  var body = h('div', { class: 'col' });
  DEMO.assistants.forEach(function (a) {
    var row = h('button', { class: 'list-row list-row--link', type: 'button' }, [
      h('span', { class: 'list-row__ico', text: a.icon }),
      h('span', { class: 'list-row__main' }, [
        h('span', { class: 'list-row__title', text: a.name }),
        h('span', { class: 'list-row__sub', text: a.role + ' · голос: ' + a.voice })
      ]),
      h('span', { class: 'list-row__side' }, [s.assistant === a.id ? chip('выбран', 'gold') : null])
    ]);
    row.addEventListener('click', function () {
      Store.biz(function (st) { st.assistant = a.id; });
      Sheet.close();
      toast('Ассистент: ' + a.name, 'ok', a.icon);
      updateChrome();
      refresh();
    });
    body.appendChild(row);
  });
  Sheet.open({ title: 'Ассистент', sub: 'Персона и голос, функции одинаковые', body: body });
}

/* ---------------- старт ---------------- */
function boot() {
  Store.load();
  if (!location.hash) location.hash = '#/home';

  window.addEventListener('hashchange', function () {
    renderView();
    var v = document.getElementById('view');
    if (v) v.scrollTop = 0;
  });

  document.getElementById('menu-btn').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('is-open');
  });
  document.getElementById('profile-btn').addEventListener('click', openProfile);

  /* делегированные действия из разметки (например, «Этика и данные» в сайдбаре) */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');
    if (action === 'open-ethics') go('ethics');
    else if (action === 'open-profile') openProfile();
  });

  /* закрытие мобильного меню по клику на подложку */
  document.addEventListener('click', function (e) {
    var sb = document.getElementById('sidebar');
    if (sb && sb.classList.contains('is-open') && !sb.contains(e.target) && e.target.id !== 'menu-btn' && !e.target.closest('#menu-btn')) {
      sb.classList.remove('is-open');
    }
  });
  document.getElementById('wallet').addEventListener('click', function () {
    var s = Store.get();
    var lvl = Store.levelInfo();
    var body = h('div', { class: 'col' }, [
      h('div', { class: 'row row--between' }, [
        h('div', { class: 'stat' }, [h('div', { class: 'stat__val', text: fmt(s.lad) + ' Л' }), h('div', { class: 'stat__lbl', text: 'Токены «Лад»' })]),
        h('div', { class: 'stat' }, [h('div', { class: 'stat__val', text: lvl.name }), h('div', { class: 'stat__lbl', text: 'Уровень вклада' })])
      ]),
      progressBar(s.contribution, lvl.nextAt || s.contribution + 1, 'bar--gold'),
      h('p', { class: 'small muted', text: 'Лад начисляется за обучение, волонтёрство, помощь соседям и покупки эко-продуктов. Это бонусная единица, а не валюта и не ценная бумага.' }),
      h('div', { class: 'tag mt-8', text: 'Последние операции' }),
      h('div', { class: 'list' }, s.ledger.slice(-5).reverse().map(function (e) {
        return h('div', { class: 'list-row' }, [
          h('span', { class: 'list-row__ico', text: e.lad >= 0 ? '＋' : '−' }),
          h('span', { class: 'list-row__main' }, [
            h('span', { class: 'list-row__title', text: e.label }),
            h('span', { class: 'list-row__sub', text: fmtDate(e.ts) + ' · ' + e.hash })
          ]),
          h('span', { class: 'list-row__side ' + (e.lad >= 0 ? 'mint' : 'muted'), text: (e.lad >= 0 ? '+' : '') + e.lad })
        ]);
      }))
    ]);
    Sheet.open({ title: 'Кошелёк «Лад»', body: body, actions: [{ label: 'Закрыть', variant: 'btn--ghost' }] });
  });

  renderView();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
