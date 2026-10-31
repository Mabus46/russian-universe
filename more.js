/* ==========================================================================
   РУССКАЯ ВСЕЛЕННАЯ — здоровье, студия, Киберщит, этика и данные
   ========================================================================== */
'use strict';

window.Views = window.Views || {};

/* ---------------- Золотой век ---------------- */
Views.health = function () {
  var s = Store.get();
  var wrap = h('div', { class: 'view__inner' });

  wrap.appendChild(h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [chip('Здоровье', 'gold'), chip('Не медицина', 'crimson'), chip('Данные не уходят из браузера', 'mint')]),
    h('h1', { class: 'h1 mt-12', text: 'Золотой век' }),
    h('p', { class: 'lead mt-8', text: 'Мягкий трекер привычек и рекомендаций от куратора-терапевта. Это не медицинский сервис и не диагностика: только подсказки, которые можно принять или отклонить. Все значения в демо — пример.' }),
    h('div', { class: 'mt-12' }, [chip(DEMO.health.curator, 'azure')])
  ]));

  /* ---------- показатели ---------- */
  var metricsGrid = h('div', { class: 'grid grid--4' });
  DEMO.health.metrics.forEach(function (m) {
    var p = pct(m.value, m.target);
    metricsGrid.appendChild(h('div', { class: 'card card--flat' }, [
      h('div', { class: 'ring', style: { '--p': String(p), '--c': p >= 90 ? 'var(--mint)' : p >= 70 ? 'var(--gold)' : 'var(--azure)' } }, [
        h('span', { class: 'ring__val', text: p + '%' })
      ]),
      h('div', { class: 'mt-8' }, [
        h('div', { class: 'strong', text: m.value + ' ' + m.unit }),
        h('div', { class: 'small muted', text: m.label + ' · цель ' + m.target })
      ])
    ]));
  });
  wrap.appendChild(h('div', {}, [
    sectionHead('Показатели недели', 'Демо-значения, не медицинские данные'),
    h('div', { class: 'mt-12' }, [metricsGrid])
  ]));

  /* ---------- план ---------- */
  var planCard = h('div', { class: 'card' }, [sectionHead('План на сегодня', 'Отметка — демо-действие с начислением вклада')]);
  var planList = h('div', { class: 'col mt-12', style: { gap: '8px' } });
  DEMO.health.plan.forEach(function (p) {
    var done = !!s.plan[p.id];
    var row = h('div', { class: 'list-row' }, [
      h('span', { class: 'list-row__ico', text: done ? '✓' : '○' }),
      h('span', { class: 'list-row__main' }, [
        h('span', { class: 'list-row__title', text: p.title }),
        h('span', { class: 'list-row__sub', text: p.note })
      ]),
      (function () {
        var b = h('button', { class: 'btn btn--xs ' + (done ? 'btn--ghost' : 'btn--primary'), type: 'button', text: done ? 'Снять отметку' : 'Отметить' });
        b.addEventListener('click', function () {
          Store.biz(function (st) { st.plan[p.id] = !done; });
          if (!done) {
            Store.addContribution(3, 'health');
            Store.addLad(5, 'Дело выполнено: ' + p.title, 'health');
            toast('+3 очка вклада, +5 Ладов', 'ok', '✓');
          } else {
            toast('Отметка снята', 'warn');
          }
          refresh();
        });
        return b;
      })()
    ]);
    planList.appendChild(row);
  });
  planCard.appendChild(planList);
  planCard.appendChild(h('div', { class: 'row mt-12 row--wrap' }, [
    (function () {
      var b = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '🤖 Попросить ассистента о плане' });
      b.addEventListener('click', function () {
        go('assistant');
        setTimeout(function () { toast('Спросите: «Как спланировать день?»', 'ok', '🌤️'); }, 300);
      });
      return b;
    })()
  ]));
  wrap.appendChild(planCard);

  /* ---------- протоколы ---------- */
  var protCard = h('div', { class: 'card' }, [sectionHead('Проверенные практики', 'Эффект указан по данным демо-контура')]);
  var protList = h('div', { class: 'col mt-12', style: { gap: '10px' } });
  DEMO.health.protocols.forEach(function (p) {
    protList.appendChild(h('div', { class: 'card card--flat' }, [
      h('div', { class: 'row row--between row--wrap' }, [
        h('span', { class: 'strong', text: p.title }),
        p.verified ? chip('проверено', 'mint') : chip('на проверке', 'gold')
      ]),
      h('div', { class: 'small muted mt-4', text: p.effect }),
      h('div', { class: 'small dim mt-4', text: 'применили участников: ' + p.applied })
    ]));
  });
  protCard.appendChild(protList);
  wrap.appendChild(protCard);

  wrap.appendChild(h('div', { class: 'card card--flat' }, [
    h('div', { class: 'tag', text: 'Ограничения и уважение' }),
    h('ul', { class: 'small muted', style: { margin: '8px 0 0 18px', padding: '0' } }, [
      h('li', { text: 'Рекомендации не заменяют врача. При жалобах — к специалисту.' }),
      h('li', { text: 'Нет публичных рейтингов «здоровья», нет сравнения с другими людьми.' }),
      h('li', { text: 'Данные о здоровье в демо не собираются и не передаются: показатели зашиты в код прототипа.' }),
      h('li', { text: 'Любую рекомендацию можно отключить; отказ не влияет на уровень вклада.' })
    ])
  ]));

  return wrap;
};

/* ---------------- Студия «Русь» ---------------- */
Views.studio = function () {
  var s = Store.get();
  var wrap = h('div', { class: 'view__inner' });

  wrap.appendChild(h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [chip('Контент', 'gold'), chip('Маркировка 436-ФЗ', 'mint'), chip('У каждого материала источник', 'azure')]),
    h('h1', { class: 'h1 mt-12', text: 'Студия «Русь»' }),
    h('p', { class: 'lead mt-8', text: 'VR-прогулки, AR-слои, фильмы и цифровые реконструкции. В прототипе плеер — заглушка: показаны карточки контента, маркировка возраста и перечень источников.' }),
    h('div', { class: 'mt-12' }, [
      h('div', { class: 'chips' }, [
        chip(s.mode === 'child' ? 'детский профиль: доступны материалы 6+' : 'взрослый профиль: доступны все материалы', s.mode === 'child' ? 'mint' : 'azure')
      ])
    ])
  ]));

  var grid = h('div', { class: 'grid grid--3' });
  DEMO.studio.forEach(function (item) {
    var card = h('div', { class: 'card card--link' });
    card.addEventListener('click', function () { openStudioItem(item); });
    var poster = h('div', {
      class: 'card--flat',
      style: {
        position: 'relative', display: 'grid', placeItems: 'center', borderRadius: '14px',
        padding: '26px 10px', fontSize: '34px',
        background: 'radial-gradient(320px 160px at 50% 20%, rgba(232,192,90,.12), transparent 70%), rgba(255,255,255,.03)'
      }
    }, [h('div', { text: item.icon })]);
    card.appendChild(poster);
    card.appendChild(h('div', { class: 'row row--between mt-12' }, [
      h('span', { class: 'strong', text: item.title }),
      chip(item.kind, 'gold')
    ]));
    card.appendChild(h('p', { class: 'small muted mt-8', text: item.about }));
    card.appendChild(h('div', { class: 'row row--between mt-12' }, [
      h('span', { class: 'small dim', text: item.dur }),
      chip('6+', 'mint')
    ]));
    grid.appendChild(card);
  });
  wrap.appendChild(grid);

  wrap.appendChild(h('div', { class: 'card card--flat' }, [
    h('div', { class: 'tag', text: 'Что вне прототипа' }),
    h('p', { class: 'small muted mt-8', text: 'Реальный VR-движок, потоковое видео и библиотека архивов не входят в демо: вместо них — карточки с описанием, длительностью, маркировкой и источниками. Так проверяется сценарий, а не инфраструктура доставки контента.' })
  ]));

  return wrap;
};

function openStudioItem(item) {
  var playing = false;
  var canvasHost = h('div', {
    style: {
      position: 'relative', display: 'grid', placeItems: 'center', minHeight: '180px',
      borderRadius: '14px', border: '1px solid var(--line)',
      background: 'radial-gradient(400px 200px at 50% 30%, rgba(91,141,239,.16), transparent 70%), rgba(255,255,255,.03)'
    }
  }, [h('div', { style: { fontSize: '46px' }, text: item.icon })]);

  var body = h('div', { class: 'col' }, [
    canvasHost,
    h('p', { class: 'lead', text: item.about }),
    h('div', { class: 'mt-8' }, [
      kvRow('Формат', item.kind),
      kvRow('Длительность', item.dur),
      kvRow('Возрастная маркировка', '6+ (без сцен насилия и страха)'),
      kvRow('Плеер', 'заглушка демо-контура')
    ]),
    h('div', { class: 'card card--flat' }, [
      h('div', { class: 'tag', text: 'Источники' }),
      h('ul', { class: 'small muted', style: { margin: '6px 0 0 18px', padding: '0' } }, item.sources.map(function (src) { return h('li', { text: src }); }))
    ]),
    h('p', { class: 'small dim', text: 'Демо-материал: видео и 3D не загружаются, чтобы прототип оставался полностью офлайн.' })
  ]);

  Sheet.open({
    title: item.title,
    sub: item.kind + ' · ' + item.dur,
    body: body,
    actions: [
      { label: 'Закрыть', variant: 'btn--ghost' },
      { label: '▶ Демо-запуск', variant: 'btn--gold', keepOpen: true, onClick: function () {
        if (playing) return;
        playing = true;
        var bar = h('div', { class: 'bar mt-12' });
        var fill = h('div', { class: 'bar__fill', style: { width: '0%' } });
        bar.appendChild(fill);
        canvasHost.appendChild(h('div', { style: { position: 'absolute', left: '16px', right: '16px', bottom: '10px' }, text: 'воспроизведение (демо)' }));
        canvasHost.appendChild(h('div', { style: { position: 'absolute', left: '16px', right: '16px', bottom: '0px' } }, [bar]));
        var v = 0;
        var timer = setInterval(function () {
          v += 7;
          fill.style.width = Math.min(100, v) + '%';
          if (v >= 100) {
            clearInterval(timer);
            toast('Демо-фрагмент завершён', 'ok', '🎬');
          }
        }, 120);
      } }
    ]
  });
}

/* ---------------- Киберщит ---------------- */
Views.shield = function () {
  var s = Store.get();
  var wrap = h('div', { class: 'view__inner' });

  wrap.appendChild(h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [chip('Защита детей', 'gold'), chip('436-ФЗ', 'mint'), chip('Без слежки за ребёнком', 'azure')]),
    h('h1', { class: 'h1 mt-12', text: 'Киберщит' }),
    h('p', { class: 'lead mt-8', text: 'Фильтрация контента по возрастным критериям, родительский контроль и понятные отчёты. Мы не читаем переписку ребёнка и не отслеживаем геолокацию — только отмечаем категории контента, который был отфильтрован.' })
  ]));

  /* ---------- состояние ---------- */
  var stateCard = h('div', { class: 'card' }, [sectionHead('Защита включена', 'Настройки меняются только с кодом родителя')]);
  var switches = h('div', { class: 'mt-8' });

  function makeSwitch(label, sub, key, onChange) {
    var input = h('input', { type: 'checkbox' });
    input.checked = !!s.shield[key];
    input.addEventListener('change', function () {
      var next = input.checked;                 /* что хотел сделать родитель */
      input.checked = !!Store.get().shield[key]; /* до подтверждения показываем текущее значение */
      askParentPin(function () {
        Store.biz(function (st) { st.shield[key] = next; });
        toast(label + ': ' + (next ? 'включено' : 'выключено'), 'ok', '🛡️');
        onChange && onChange(next);
        refresh();
      });
    });
    return h('label', { class: 'switch' }, [
      h('span', { class: 'switch__text' }, [h('span', { class: 'strong', text: label }), h('span', { class: 'small muted', text: sub })]),
      h('span', { class: 'row' }, [input, h('span', { class: 'switch__track' }, [h('span', { class: 'switch__knob' })])])
    ]);
  }

  switches.appendChild(makeSwitch('Фильтрация контента', 'по возрастным критериям 436-ФЗ', 'enabled'));
  switches.appendChild(makeSwitch('Строгий режим', 'скрывать материалы без маркировки', 'strict'));
  switches.appendChild(h('hr', { class: 'hr' }));
  switches.appendChild(kvRow('Отфильтровано за 7 дней', String(s.shield.blockedLast7)));
  switches.appendChild(kvRow('Разрешено материалов за 7 дней', String(s.shield.allowedLast7)));
  switches.appendChild(kvRow('Обращений от родителя', String(s.shield.reports)));
  stateCard.appendChild(switches);
  wrap.appendChild(stateCard);

  /* ---------- категории ---------- */
  var cats = [
    ['Насилие и жестокость', 'скрывается полностью', 'crimson'],
    ['Алкоголь, табак, вещества', 'скрывается в детском профиле', 'crimson'],
    ['Азартные игры и ставки', 'скрывается полностью', 'crimson'],
    ['Страх и тревожный контент', 'снижается приоритет', 'gold'],
    ['Нецензурная лексика', 'заменяется или скрывается', 'gold'],
    ['Политика и конфликты', 'не показывается в детском профиле', 'gold']
  ];
  var catCard = h('div', { class: 'card' }, [sectionHead('Что фильтруется', 'Критерии соответствуют ТЗ §13')]);
  var catList = h('div', { class: 'list mt-12' });
  cats.forEach(function (c) {
    catList.appendChild(h('div', { class: 'list-row' }, [
      h('span', { class: 'list-row__ico', text: c[2] === 'crimson' ? '🚫' : '⚖️' }),
      h('span', { class: 'list-row__main' }, [
        h('span', { class: 'list-row__title', text: c[0] }),
        h('span', { class: 'list-row__sub', text: c[1] })
      ]),
      chip(c[2] === 'crimson' ? 'скрыто' : 'мягкий фильтр', c[2])
    ]));
  });
  catCard.appendChild(catList);
  wrap.appendChild(catCard);

  /* ---------- маркировка ---------- */
  var markCard = h('div', { class: 'card' }, [sectionHead('Возрастная маркировка', 'Каждый материал в прототипе имеет метку')]);
  var table = h('table', { class: 'table mt-12' });
  table.appendChild(h('thead', {}, [h('tr', {}, [h('th', { text: 'Метка' }), h('th', { text: 'Что означает' }), h('th', { text: 'Пример в демо' })])]));
  var tb = h('tbody');
  [
    ['6+', 'спокойный контент о природе и труде', 'Урок «Что такое почва», VR-тур по пасеке'],
    ['12+', 'технические темы, данные и безопасность', 'Трек «Данные и безопасность»'],
    ['16+', 'взрослые темы без натуралистичности', 'Проекты сообщества'],
    ['18+', 'экономика и самоуправление', 'Маркетплейс, Центр желаний, Копа']
  ].forEach(function (r) {
    tb.appendChild(h('tr', {}, [h('td', {}, [chip(r[0], 'gold')]), h('td', { class: 'small', text: r[1] }), h('td', { class: 'small dim', text: r[2] })]));
  });
  table.appendChild(tb);
  markCard.appendChild(h('div', { class: 'table__scroll' }, [table]));
  wrap.appendChild(markCard);

  /* ---------- действия ---------- */
  wrap.appendChild(h('div', { class: 'card' }, [
    sectionHead('Действия родителя', 'Все изменения требуют кода родителя'),
    h('div', { class: 'row mt-12 row--wrap' }, [
      (function () {
        var b = h('button', { class: 'btn btn--primary btn--sm', type: 'button', text: '📨 Отправить отчёт о проблеме' });
        b.addEventListener('click', reportProblem);
        return b;
      })(),
      (function () {
        var b = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '🧒 Переключить на детский профиль' });
        b.addEventListener('click', function () {
          Store.biz(function (st) { st.mode = 'child'; });
          toast('Включён детский профиль', 'ok', '🧒');
          refresh();
          go('home');
        });
        return b;
      })(),
      (function () {
        var b = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '👤 Взрослый профиль' });
        b.addEventListener('click', function () {
          askParentPin(function () {
            Store.biz(function (st) { st.mode = 'adult'; });
            toast('Включён взрослый профиль', 'ok', '👤');
            go('home');
          });
        });
        return b;
      })()
    ]),
    h('p', { class: 'small dim mt-12', text: 'Код родителя в демо: 1234. В продукте — отдельный родительский аккаунт с подтверждением по документу, без хранения кода в открытом виде.' })
  ]));

  return wrap;
};

function reportProblem() {
  var text = h('textarea', { class: 'input', style: { minHeight: '80px' }, maxlength: '400', placeholder: 'Опишите, что произошло' });
  Sheet.open({
    title: 'Отчёт о проблеме',
    sub: 'Демо: обращение остаётся в браузере',
    body: h('div', { class: 'col' }, [
      h('p', { class: 'small muted', text: 'Обращение получает модерация. Ребёнок не обязан объяснять произошедшее подробно — достаточно короткого описания.' }),
      text,
      h('p', { class: 'small dim', text: 'История фильтрации не прикладывается автоматически: данные о ребёнке не собираются без согласия.' })
    ]),
    actions: [
      { label: 'Отмена', variant: 'btn--ghost' },
      { label: 'Отправить', variant: 'btn--primary', onClick: function () {
        if (text.value.trim().length < 5) { toast('Добавьте пару слов описания', 'warn'); return; }
        Store.biz(function (st) { st.shield.reports += 1; });
        toast('Обращение отправлено модерации (демо)', 'ok', '📨');
        refresh();
      } }
    ]
  });
}

/* ---------------- Этика и данные ---------------- */
Views.ethics = function () {
  var s = Store.get();
  var wrap = h('div', { class: 'view__inner' });

  wrap.appendChild(h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [chip('Этика', 'gold'), chip('Права пользователя', 'mint'), chip('ТЗ §0 и §13')]),
    h('h1', { class: 'h1 mt-12', text: 'Этика и данные' }),
    h('p', { class: 'lead mt-8', text: 'Правила, по которым работает прототип. Их можно проверить прямо здесь: посмотреть, какие данные хранятся, выгрузить их и удалить одной кнопкой.' })
  ]));

  /* ---------- принципы ---------- */
  var principles = [
    ['🌱', 'Уровни — за вклад, не за происхождение', 'Статус нельзя купить, получить по рождению или передать другому. Растёт только от дел.'],
    ['🙋', 'Добровольность', 'Все модули подключаются по желанию. Отказ от рекомендаций и трекеров не влияет на доступ к основному.'],
    ['🔍', 'Объяснимость ИИ', 'У каждого ответа ассистента есть блок «почему так» и список источников. Ответ можно оспорить.'],
    ['🚫', 'Нет слежки', 'Нет геолокации, чтения переписки, скрытого профилирования. Отчёты Киберщита — по категориям, не по людям.'],
    ['🧒', 'Защита несовершеннолетних', 'Маркировка 6+/12+/16+/18+, детский профиль и согласие родителя.'],
    ['⚖️', 'Один человек — один голос', 'В сообществе вес голоса не зависит от уровня и баланса.'],
    ['💬', 'Нет «свои/чужие»', 'Мы говорим о делах и местах, а не о противопоставлении групп. Без политики и агрессии.'],
    ['🗂️', 'Данные принадлежат человеку', 'Экспорт, импорт и удаление доступны в любой момент, бесплатно и без объяснений.'],
    ['🧾', 'Прозрачные операции', 'Журнал действий с хеш-цепочкой: подмена записи обнаруживается.'],
    ['🤝', 'Человеческое решение последним', 'ИИ предлагает, но не наказывает и не блокирует людей. Спорные случаи решает человек.']
  ];
  var pgrid = h('div', { class: 'grid grid--2' });
  principles.forEach(function (p) {
    pgrid.appendChild(h('div', { class: 'card card--flat' }, [
      h('div', { class: 'list-row__ico', text: p[0] }),
      h('div', { class: 'strong mt-8', text: p[1] }),
      h('p', { class: 'small muted mt-4', text: p[2] })
    ]));
  });
  wrap.appendChild(h('div', {}, [sectionHead('Десять правил контура', 'Из ТЗ: разделы 0 и 13'), h('div', { class: 'mt-12' }, [pgrid])]));

  /* ---------- какие данные хранятся ---------- */
  var dataTable = h('table', { class: 'table' });
  dataTable.appendChild(h('thead', {}, [h('tr', {}, [
    h('th', { text: 'Что' }), h('th', { text: 'Где' }), h('th', { text: 'Зачем' }), h('th', { text: 'Можно удалить' })
  ])]));
  var dbody = h('tbody');
  [
    ['Имя и режим профиля', 'localStorage браузера', 'обращение и возрастные ограничения', 'да'],
    ['Баланс Ладов, вклад, журнал', 'localStorage браузера', 'работа экономики демо и проверка целостности', 'да'],
    ['Корзина и заказы', 'localStorage браузера', 'демонстрация сценария покупки', 'да'],
    ['Голоса и брони', 'localStorage браузера', 'работа сообщества в демо', 'да'],
    ['Настройки Киберщита', 'localStorage браузера', 'фильтрация контента в демо', 'да'],
    ['Данные о здоровье', 'не собираются', 'показатели зашиты в код прототипа', '—'],
    ['Биометрия, геолокация, переписка', 'не собираются', 'не используются принципиально', '—']
  ].forEach(function (r) {
    dbody.appendChild(h('tr', {}, [
      h('td', { class: 'strong', text: r[0] }),
      h('td', { class: 'small', text: r[1] }),
      h('td', { class: 'small dim', text: r[2] }),
      h('td', {}, r[3] === 'да' ? chip('да', 'mint') : chip('нет данных', 'azure'))
    ]));
  });
  dataTable.appendChild(dbody);
  wrap.appendChild(h('div', { class: 'card' }, [
    sectionHead('Какие данные хранятся', 'Всё — только в этом браузере. Сервера нет.'),
    h('div', { class: 'table__scroll mt-12' }, [dataTable])
  ]));

  /* ---------- права ---------- */
  var rights = h('div', { class: 'card' }, [sectionHead('Ваши права в один клик', 'Работает без запросов в поддержку')]);
  var row = h('div', { class: 'row mt-12 row--wrap' });

  var exportBtn = h('button', { class: 'btn btn--primary btn--sm', type: 'button', text: '⬇️ Экспорт всех данных' });
  exportBtn.addEventListener('click', function () { exportData(); });
  row.appendChild(exportBtn);

  var importBtn = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '⬆️ Импорт из JSON' });
  importBtn.addEventListener('click', function () { importData(); });
  row.appendChild(importBtn);

  var deleteBtn = h('button', { class: 'btn btn--danger btn--sm', type: 'button', text: '🗑️ Удалить все данные' });
  deleteBtn.addEventListener('click', function () {
    Sheet.confirm({
      title: 'Удалить все данные?',
      text: 'Профиль, журнал, корзина и настройки будут стёрты из этого браузера. Действие необратимо — при желании сначала сделайте экспорт.',
      okLabel: 'Удалить навсегда',
      danger: true
    }).then(function (ok) {
      if (!ok) return;
      Store.reset();
      Sheet.close();
      toast('Данные удалены. Профиль сброшен к началу', 'ok', '🗑️');
      go('home');
    });
  });
  row.appendChild(deleteBtn);

  rights.appendChild(row);
  rights.appendChild(h('p', { class: 'small dim mt-12', text: 'Удаление в демо стирает локальную запись и возвращает стартовое состояние. В продукте здесь был бы полный и необратимый сброс с подтверждением по e-mail.' }));
  wrap.appendChild(rights);

  /* ---------- согласия ---------- */
  wrap.appendChild(h('div', { class: 'card' }, [
    sectionHead('Согласия', 'Что и на каких условиях вы принимаете'),
    h('div', { class: 'mt-8' }, [
      kvRow('Обработка данных прототипа', 'локально, без передачи'),
      kvRow('Версия правил', 'демо-1.0'),
      kvRow('Возрастные ограничения', '6+ контент · 18+ экономика и самоуправление'),
      kvRow('Код родителя', s.parentPin || '1234'),
      kvRow('Хранилище', Store.storageOk() ? 'доступно (localStorage)' : 'недоступно — состояние только в памяти')
    ]),
    h('p', { class: 'small dim mt-12', text: 'В продукте согласия фиксируются в отдельном журнале с датой и возможностью отзыва. В прототипе согласие считается данным при старте.' })
  ]));

  /* ---------- оспорить ---------- */
  wrap.appendChild(h('div', { class: 'card card--glow' }, [
    h('div', { class: 'row row--between row--wrap' }, [
      h('div', {}, [
        h('div', { class: 'h3', text: 'Не согласны с рекомендацией или ответом ИИ?' }),
        h('div', { class: 'small muted mt-4', text: 'Напишите — прототип покажет, как работал бы канал обжалования.' })
      ]),
      (function () {
        var b = h('button', { class: 'btn btn--gold btn--sm', type: 'button', text: 'Обжаловать' });
        b.addEventListener('click', appeal);
        return b;
      })()
    ])
  ]));

  return wrap;
};

function appeal() {
  var text = h('textarea', { class: 'input', style: { minHeight: '80px' }, maxlength: '400', placeholder: 'Что предлагаете пересмотреть?' });
  var kind = h('select', { class: 'select' });
  ['Ответ ассистента', 'Рекомендация', 'Модерация контента', 'Другое'].forEach(function (k) {
    kind.appendChild(h('option', { text: k }));
  });
  Sheet.open({
    title: 'Обжалование',
    body: h('div', { class: 'col' }, [
      h('p', { class: 'lead', text: 'Обращение уходит человеку, а не автоматике. Вы получите ответ и объяснение, как было принято решение.' }),
      h('div', { class: 'field' }, [h('span', { class: 'field__label', text: 'Что обжалуете' }), kind]),
      h('div', { class: 'field' }, [h('span', { class: 'field__label', text: 'Описание' }), text])
    ]),
    actions: [
      { label: 'Отмена', variant: 'btn--ghost' },
      { label: 'Отправить', variant: 'btn--primary', onClick: function () {
        if (text.value.trim().length < 5) { toast('Добавьте описание', 'warn'); return; }
        Store.pushLedger('appeal', 'Обжалование: ' + kind.value, 0, { kind: kind.value });
        toast('Обращение зарегистрировано в журнале', 'ok', '⚖️');
        refresh();
      } }
    ]
  });
}

function importData() {
  var ta = h('textarea', { class: 'input mono', style: { minHeight: '160px', fontSize: '11.5px' }, placeholder: 'Вставьте JSON, полученный при экспорте' });
  Sheet.open({
    title: 'Импорт данных',
    sub: 'Проверка переносимости профиля',
    body: h('div', { class: 'col' }, [
      h('p', { class: 'small muted', text: 'Вставьте ранее экспортированный JSON. Текущие данные будут заменены.' }),
      ta
    ]),
    actions: [
      { label: 'Отмена', variant: 'btn--ghost' },
      { label: 'Импортировать', variant: 'btn--primary', onClick: function () {
        var ok = Store.importJSON(ta.value);
        if (!ok) { toast('Не удалось прочитать JSON', 'err'); return; }
        toast('Данные импортированы', 'ok', '⬆️');
        go('home');
      } }
    ]
  });
}
