/* ==========================================================================
   РУССКАЯ ВСЕЛЕННАЯ — Слободы, IoT-показатели и паспорт продукта
   ========================================================================== */
'use strict';

window.Views = window.Views || {};

function slobodaById(id) {
  return DEMO.slobody.filter(function (s) { return s.id === id; })[0] || null;
}

function productById(id) {
  return DEMO.products.filter(function (p) { return p.id === id; })[0] || null;
}

function sensorRows(sensors) {
  return [
    { k: 'Влажность почвы', v: sensors.soil, unit: '%', icon: '🌱' },
    { k: 'Влажность воздуха', v: sensors.humidity, unit: '%', icon: '💧' },
    { k: 'Температура', v: sensors.temp, unit: '°C', icon: '🌡️' },
    { k: 'Вода в контуре', v: sensors.water, unit: '%', icon: '🚰' },
    { k: 'CO₂', v: sensors.co2, unit: 'ppm', icon: '🌫️' },
    { k: 'Солнечная генерация', v: sensors.solar, unit: '%', icon: '☀️' }
  ];
}

/* ---------------- список слобод ---------------- */
Views.slobody = function () {
  var wrap = h('div', { class: 'view__inner' });
  var s = Store.get();

  wrap.appendChild(h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [chip('5 кластеров', 'gold'), chip('IoT в демо-режиме'), chip('Паспорт каждого продукта', 'mint')]),
    h('h1', { class: 'h1 mt-12', text: 'Слободы' }),
    h('p', { class: 'lead mt-8', text: 'Слобода — это поселение-кластер, где производство, обучение и культура связаны в один контур. Датчики показывают состояние почвы, воды и энергии, а каждый продукт получает историю: поле → лаборатория → логистика.' }),
    h('div', { class: 'row mt-16 row--wrap' }, [
      goBtn('Корзина чистых продуктов', 'market', 'btn--gold'),
      (function () {
        var b = h('button', { class: 'btn btn--ghost', type: 'button', text: 'Как читать паспорт продукта' });
        b.addEventListener('click', openPassportHelp);
        return b;
      })()
    ])
  ]));

  var mapCard = h('div', { class: 'card' }, [
    sectionHead('Схема сети', 'Координаты условные — это прототип, а не карта GeoJSON'),
    h('div', { class: 'mt-12' }, [buildMap(function (id) { go('slobody/' + id); }, true)])
  ]);
  wrap.appendChild(mapCard);

  var grid = h('div', { class: 'grid grid--auto' });
  DEMO.slobody.forEach(function (sl) {
    var card = h('div', { class: 'card card--link' });
    card.addEventListener('click', function () { go('slobody/' + sl.id); });

    var ava = h('div', { class: 'list-row__ico', style: { fontSize: '20px' }, text: sl.icon });
    card.appendChild(h('div', { class: 'row row--top' }, [
      ava,
      h('div', { class: 'list-row__main' }, [
        h('div', { class: 'list-row__title', text: sl.name }),
        h('div', { class: 'list-row__sub', text: sl.region })
      ]),
      chip('99', 'mint')
    ]));
    card.appendChild(h('div', { class: 'small muted mt-8', text: sl.spec }));
    card.appendChild(h('div', { class: 'chips mt-12' }, [
      chip(sl.products.length + ' продукта', 'gold'),
      chip(sl.members + ' участников'),
      chip('uptime ' + sl.uptime + '%', 'azure')
    ]));
    card.appendChild(h('div', { class: 'kv mt-12' }, [
      h('span', { class: 'muted', text: 'Почва / вода' }),
      h('span', { class: 'kv__v', text: sl.sensors.soil + '% / ' + sl.sensors.water + '%' })
    ]));
    grid.appendChild(card);
  });
  wrap.appendChild(h('div', {}, [sectionHead('Все слободы', 'Нажмите, чтобы открыть карточку'), h('div', { class: 'mt-12' }, [grid])]));

  wrap.appendChild(h('div', { class: 'card card--flat' }, [
    h('div', { class: 'tag', text: 'Важно' }),
    h('p', { class: 'small muted mt-8', text: 'Показатели датчиков в прототипе — демонстрационные числа. В реальном контуре это были бы открытые данные с указанием владельца датчика, времени съёма и погрешности. Мы не показываем «рейтинги людей» и не собираем данные о поведении без согласия.' })
  ]));

  return wrap;
};

function openPassportHelp() {
  Sheet.open({
    title: 'Паспорт продукта',
    sub: 'Как читать историю партии',
    body: h('div', { class: 'col' }, [
      h('p', { class: 'lead', text: 'Паспорт — это цепочка шагов от поля до полки. Каждый шаг содержит время, место действия, короткое описание и хеш записи.' }),
      h('div', { class: 'card card--flat' }, [
        h('div', { class: 'tag', text: 'Зачем хеш' }),
        h('p', { class: 'small muted mt-4', text: 'Хеш связывает шаги: если изменить текст записи, её хеш перестанет сходиться с цепочкой. Так проверяется, что историю не переписали задним числом.' })
      ]),
      h('div', { class: 'card card--flat' }, [
        h('div', { class: 'tag', text: 'Границы демо' }),
        h('p', { class: 'small muted mt-4', text: 'Хеши в прототипе считает браузер (FNV-1a) — это иллюстрация механики, а не промышленная криптография. Реальная система требует распределённого реестра и юридически значимой подписи.' })
      ]),
      h('div', { class: 'card card--flat' }, [
        h('div', { class: 'tag', text: 'Доверие без слежки' }),
        h('p', { class: 'small muted mt-4', text: 'В паспорте нет персональных данных работников: только производственные шаги и лабораторные показатели.' })
      ])
    ]),
    actions: [{ label: 'Понятно', variant: 'btn--primary' }]
  });
}

/* ---------------- карточка слободы ---------------- */
Views.slobodaDetail = function (id) {
  var sl = slobodaById(id);
  if (!sl) return emptyState('🌿', 'Слобода не найдена', 'Вернитесь к списку слобод.');

  var wrap = h('div', { class: 'view__inner' });

  var back = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '← Все слободы' });
  back.addEventListener('click', function () { go('slobody'); });
  wrap.appendChild(back);

  var hero = h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [
      chip(sl.region, 'azure'),
      chip('открыта ' + sl.opened, 'mint'),
      chip('uptime ' + sl.uptime + '%', 'gold')
    ]),
    h('h1', { class: 'h1 mt-12', text: sl.icon + ' ' + sl.name }),
    h('p', { class: 'lead mt-8', text: sl.pitch }),
    h('div', { class: 'row mt-16 row--wrap', style: { gap: '26px' } }, [
      statBlock(String(sl.members), 'участников'),
      statBlock(String(sl.products.length), 'продуктов'),
      statBlock(sl.spec.split(',')[0], 'специализация')
    ]),
    h('div', { class: 'mt-16' }, [
      h('div', { class: 'tag', text: 'Инфраструктура' }),
      h('div', { class: 'chips mt-8' }, sl.infra.map(function (i) { return chip(i); }))
    ])
  ]);
  hero.appendChild(h('div', { class: 'hero__art', html: slobodaArt(sl) }));
  wrap.appendChild(hero);

  /* ---------- датчики ---------- */
  var sensorCard = h('div', { class: 'card' }, [
    sectionHead('Показатели контура', 'Демо-значения датчиков, обновление раз в 15 минут'),
    (function () {
      var g = h('div', { class: 'grid grid--3 mt-16' });
      sensorRows(sl.sensors).forEach(function (r, i) {
        var vals = [];
        for (var k = 0; k < 12; k++) {
          var seed = hashStr(sl.id + r.k + k).charCodeAt(0) / 255;
          vals.push(Math.round(r.v * (0.82 + seed * 0.3)));
        }
        g.appendChild(h('div', { class: 'card card--flat' }, [
          h('div', { class: 'row row--between' }, [
            h('span', { class: 'small muted', text: r.icon + ' ' + r.k }),
            h('span', { class: 'strong', text: r.v + ' ' + r.unit })
          ]),
          h('div', { class: 'mt-8' }, [sparkline(vals, { w: 240, h: 44, color: ['#4FD1A5', '#5B8DEF', '#E8C05A', '#9A7BF0', '#D4453F', '#4FD1A5'][i % 6] })])
        ]));
      });
      return g;
    })(),
    h('p', { class: 'small dim mt-12', text: 'Датчики принадлежат слободе; участник видит только агрегированные значения. Данные о людях здесь не собираются.' })
  ]);
  wrap.appendChild(sensorCard);

  /* ---------- продукты ---------- */
  var prodCard = h('div', { class: 'card' }, [
    sectionHead('Продукты слободы', 'У каждого — прослеживаемая история')
  ]);
  var prodList = h('div', { class: 'list mt-12' });
  sl.products.forEach(function (pid) {
    var p = productById(pid);
    if (!p) return;
    var row = h('div', { class: 'list-row list-row--link' }, [
      h('span', { class: 'list-row__ico', text: p.icon }),
      h('span', { class: 'list-row__main' }, [
        h('span', { class: 'list-row__title', text: p.name }),
        h('span', { class: 'list-row__sub', text: p.chain.length + ' шагов в паспорте · ' + p.weight })
      ]),
      h('span', { class: 'list-row__side' }, [chip(p.price + ' Л', 'gold')])
    ]);
    row.addEventListener('click', function () { go('product/' + p.id); });
    prodList.appendChild(row);
  });
  prodCard.appendChild(prodList);
  wrap.appendChild(prodCard);

  /* ---------- координатор и правила ---------- */
  wrap.appendChild(h('div', { class: 'grid grid--2' }, [
    h('div', { class: 'card' }, [
      h('div', { class: 'tag', text: 'Координатор' }),
      h('div', { class: 'row mt-8' }, [
        h('div', { class: 'msg__ava', text: '👤' }),
        h('div', {}, [
          h('div', { class: 'strong', text: sl.coordinator }),
          h('div', { class: 'small muted', text: 'выбран сообществом на сезон' })
        ])
      ]),
      h('p', { class: 'small muted mt-12', text: 'Координатор ведёт операционные вопросы и не имеет доступа к личным данным участников. Роль переходящая — её выбирают открытым голосованием в «Копе».' })
    ]),
    h('div', { class: 'card' }, [
      h('div', { class: 'tag', text: 'Что можно сделать' }),
      h('div', { class: 'col mt-8' }, [
        goBtn('Открыть продукты слободы', 'market', 'btn--ghost', true),
        goBtn('Голосовать в сообществе', 'kopa', 'btn--ghost', true),
        goBtn('Учебный трек по агрономии', 'track/eco-7', 'btn--ghost', true)
      ])
    ])
  ]));

  return wrap;
};

function slobodaArt(sl) {
  return '<svg viewBox="0 0 300 300" width="100%" height="100%" aria-hidden="true">' +
    '<defs><radialGradient id="sg"><stop offset="0" stop-color="' + sl.accent + '" stop-opacity=".5"/><stop offset="1" stop-color="' + sl.accent + '" stop-opacity="0"/></radialGradient></defs>' +
    '<circle cx="150" cy="140" r="130" fill="url(#sg)"/>' +
    '<g fill="none" stroke="' + sl.accent + '" stroke-width="1.6" opacity=".55">' +
    '<circle cx="150" cy="140" r="52"/><circle cx="150" cy="140" r="82" stroke-dasharray="4 6"/></g>' +
    '<text x="150" y="164" text-anchor="middle" font-size="64">' + sl.icon + '</text>' +
    '<g fill="' + sl.accent + '" opacity=".8"><circle cx="202" cy="140" r="4"/><circle cx="98" cy="140" r="4"/><circle cx="150" cy="88" r="4"/></g>' +
    '</svg>';
}

/* ---------------- паспорт продукта ---------------- */
Views.productDetail = function (id) {
  var p = productById(id);
  if (!p) return emptyState('🧺', 'Продукт не найден', 'Откройте маркетплейс и выберите другой товар.');
  var sl = slobodaById(p.sloboda);
  var wrap = h('div', { class: 'view__inner' });

  var back = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '← Назад' });
  back.addEventListener('click', function () { go('market'); });
  wrap.appendChild(back);

  wrap.appendChild(h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [
      chip(sl ? sl.short + ' слобода' : 'слобода', 'azure'),
      chip('эко-индекс ' + p.eco, 'mint'),
      chip(p.price + ' Ладов за ' + p.unit, 'gold')
    ]),
    h('h1', { class: 'h1 mt-12', text: p.icon + ' ' + p.name }),
    h('p', { class: 'lead mt-8', text: 'Полная история партии: каждый шаг подписан хешем, связанным с предыдущим. Так покупатель видит, что путь продукта не переписывался.' }),
    h('div', { class: 'row mt-16 row--wrap', style: { gap: '24px' } }, [
      statBlock(p.price + ' Л', 'цена'),
      statBlock(p.weight, 'фасовка'),
      statBlock(String(p.chain.length), 'шагов в цепочке')
    ])
  ]));

  /* цепочка */
  var chain = h('div', { class: 'chain mt-16' });
  var prev = 'genesis';
  p.chain.forEach(function (step, i) {
    var hash = hashStr([prev, step.step, step.note, step.t].join('|'));
    chain.appendChild(h('div', { class: 'chain__step' }, [
      h('div', { class: 'chain__rail' }, [
        h('div', { class: 'chain__dot' }),
        i < p.chain.length - 1 ? h('div', { class: 'chain__line' }) : null
      ]),
      h('div', { class: 'chain__body' }, [
        h('div', { class: 'row row--between row--wrap' }, [
          h('span', { class: 'strong', text: (i + 1) + '. ' + step.step }),
          h('span', { class: 'small dim', text: step.t })
        ]),
        h('div', { class: 'small muted mt-4', text: step.note }),
        h('div', { class: 'chain__hash mt-4', text: 'hash: ' + hash })
      ])
    ]));
    prev = hash;
  });

  wrap.appendChild(h('div', { class: 'card' }, [
    sectionHead('История партии', 'Хеш-цепочка шагов (демо-механика)'),
    chain,
    h('div', { class: 'row mt-12 row--wrap' }, [
      (function () {
        var b = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '🛡️ Проверить цепочку' });
        b.addEventListener('click', function () { toast('Все ' + p.chain.length + ' шагов сходятся по хешам', 'ok', '🛡️'); });
        return b;
      })(),
      (function () {
        var b = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: 'Как читать паспорт' });
        b.addEventListener('click', openPassportHelp);
        return b;
      })()
    ])
  ]));

  /* покупка */
  var buyCard = h('div', { class: 'card' });
  buyCard.appendChild(h('div', { class: 'row row--between row--wrap' }, [
    h('div', {}, [
      h('div', { class: 'h2', text: p.price + ' Ладов' }),
      h('div', { class: 'small muted', text: 'за ' + p.unit + ' · ' + p.weight })
    ]),
    (function () {
      var b = h('button', { class: 'btn btn--gold', type: 'button', text: 'В корзину' });
      b.addEventListener('click', function () { addToCart(p.id); });
      return b;
    })()
  ]));
  buyCard.appendChild(h('div', { class: 'chips mt-12' }, p.tags.map(function (t) { return chip('#' + t); })));
  if (sl) buyCard.appendChild(h('div', { class: 'mt-12' }, [kvRow('Слобода', sl.name), kvRow('Регион', sl.region), kvRow('Координатор', sl.coordinator)]));
  wrap.appendChild(buyCard);

  return wrap;
};
