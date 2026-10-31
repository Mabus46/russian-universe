/* ==========================================================================
   РУССКАЯ ВСЕЛЕННАЯ — сообщество: Копа, Центр желаний, Путь добра
   ========================================================================== */
'use strict';

window.Views = window.Views || {};

function voteTotals(p, myVote) {
  var t = { yes: p.yes, no: p.no, abst: p.abst };
  if (myVote && t[myVote] !== undefined) t[myVote] += 1;
  return t;
}

function voteBar(view) {
  var total = view.yes + view.no + view.abst || 1;
  var bar = h('div', { class: 'vote-bar' });
  [['yes', '#4FD1A5'], ['no', '#D4453F'], ['abst', '#5B8DEF']].forEach(function (x) {
    var i = h('i', { style: { width: pct(view[x[0]], total) + '%', background: x[1] } });
    bar.appendChild(i);
  });
  return bar;
}

function voteLegend(view) {
  return h('div', { class: 'vote-legend' }, [
    h('span', {}, [h('i', { style: { background: '#4FD1A5' } }), h('span', { text: 'за — ' + view.yes })]),
    h('span', {}, [h('i', { style: { background: '#D4453F' } }), h('span', { text: 'против — ' + view.no })]),
    h('span', {}, [h('i', { style: { background: '#5B8DEF' } }), h('span', { text: 'воздержался — ' + view.abst })])
  ]);
}

/* ---------------- Копа ---------------- */
Views.kopa = function () {
  var s = Store.get();
  var wrap = h('div', { class: 'view__inner' });
  var mine = s.myProposals || [];

  wrap.appendChild(h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [chip('Сообщество', 'gold'), chip('Копа → Сотня → Тысяча', 'azure'), chip('Открытые повестки', 'mint')]),
    h('h1', { class: 'h1 mt-12', text: 'Копа и сообщество' }),
    h('p', { class: 'lead mt-8', text: 'Копа — ячейка из десяти соседей. Сотня объединяет десять коп, Тысяча — десять сотен. Решения принимаются голосованием, повестку собирает групповой ассистент, а итоги фиксируются в открытом журнале. Роли здесь — не власть: координатор лишь ведёт операционные вопросы.' }),
    h('div', { class: 'row mt-16 row--wrap' }, [
      (function () {
        var b = h('button', { class: 'btn btn--gold', type: 'button', text: 'Предложить идею' });
        b.addEventListener('click', function () { proposeIdea(); });
        return b;
      })(),
      (function () {
        var b = h('button', { class: 'btn btn--ghost', type: 'button', text: 'Как устроено голосование' });
        b.addEventListener('click', openVoteHelp);
        return b;
      })()
    ])
  ]));

  DEMO.communities.forEach(function (c) {
    var card = h('div', { class: 'card' });
    card.appendChild(h('div', { class: 'row row--between row--wrap' }, [
      h('div', { class: 'row' }, [
        h('div', { class: 'msg__ava', text: c.level === 'Копа' ? '🪴' : c.level === 'Сотня' ? '🏘️' : '🌆' }),
        h('div', {}, [
          h('div', { class: 'h3', text: c.name }),
          h('div', { class: 'small muted', text: c.geo + ' · ' + c.level + ' · ' + c.members + ' из ' + c.size + ' участников' })
        ])
      ]),
      chip(c.level, 'azure')
    ]));
    card.appendChild(h('div', { class: 'mt-8' }, [progressBar(c.members, c.size, 'bar--lg')]));
    card.appendChild(h('div', { class: 'small dim mt-8', text: '🤖 ' + c.assistant }));

    c.proposals.forEach(function (p) {
      var myVote = s.votes[p.id];
      var view = voteTotals(p, myVote);
      var closed = p.status === 'closed';

      var box = h('div', { class: 'card card--flat mt-12' }, [
        h('div', { class: 'row row--between row--wrap' }, [
          h('span', { class: 'strong', text: p.title }),
          closed ? chip('голосование закрыто', 'mint') : chip(p.deadline, 'gold')
        ]),
        h('p', { class: 'small muted mt-8', text: p.text }),
        h('div', { class: 'mt-12' }, [voteBar(view)]),
        h('div', { class: 'mt-8' }, [voteLegend(view)])
      ]);

      if (!closed) {
        var row = h('div', { class: 'row mt-12 row--wrap' });
        [['yes', 'За', 'btn--primary'], ['no', 'Против', 'btn--ghost'], ['abst', 'Воздержусь', 'btn--ghost']].forEach(function (v) {
          var b = h('button', { class: 'btn btn--sm ' + (myVote === v[0] ? 'btn--gold' : v[2]), type: 'button', text: myVote === v[0] ? v[1] + ' ✓' : v[1] });
          b.addEventListener('click', function () {
            Store.biz(function (st) { st.votes[p.id] = v[0]; });
            Store.addContribution(1, 'kind');
            toast('Голос учтён: ' + v[1] + ' · +1 очко вклада', 'ok', '🗳️');
            refresh();
          });
          row.appendChild(b);
        });
        box.appendChild(row);
      } else {
        box.appendChild(h('p', { class: 'small dim mt-12', text: 'Итоги зафиксированы в журнале сообщества. Изменить голос нельзя.' }));
      }
      card.appendChild(box);
    });
    wrap.appendChild(card);
  });

  if (mine.length) {
    var myCard = h('div', { class: 'card' }, [sectionHead('Мои предложения', 'Отправлены на согласование координатору')]);
    var list = h('div', { class: 'list mt-12' });
    mine.slice().reverse().forEach(function (p) {
      list.appendChild(h('div', { class: 'list-row' }, [
        h('span', { class: 'list-row__ico', text: '💡' }),
        h('span', { class: 'list-row__main' }, [
          h('span', { class: 'list-row__title', text: p.title }),
          h('span', { class: 'list-row__sub', text: fmtDate(p.ts) + ' · статус: на модерации (демо)' })
        ]),
        chip('ожидает', 'gold')
      ]));
    });
    myCard.appendChild(list);
    wrap.appendChild(myCard);
  }

  wrap.appendChild(h('div', { class: 'card card--flat' }, [
    h('div', { class: 'tag', text: 'Границы демо' }),
    h('p', { class: 'small muted mt-8', text: 'Голоса хранятся локально и не отправляются никуда. В реальном контуре нужны идентификация участника, защита от накрутки, кворум и правила пересмотра решений. Никаких «рейтингов влияния» людей здесь нет: вес голоса у всех равный.' })
  ]));

  return wrap;
};

function openVoteHelp() {
  Sheet.open({
    title: 'Как считается голос',
    body: h('div', { class: 'col' }, [
      h('p', { class: 'lead', text: 'Один участник — один голос. Вес не зависит от уровня вклада, количества Ладов или срока пребывания в сообществе.' }),
      h('div', { class: 'card card--flat' }, [h('div', { class: 'tag', text: 'Повестка' }), h('p', { class: 'small muted mt-4', text: 'Групповой ассистент собирает предложения, сводит дубли и готовит проект повестки. Любой участник может снять предложение или добавить своё.' })]),
      h('div', { class: 'card card--flat' }, [h('div', { class: 'tag', text: 'Ассистент не решает' }), h('p', { class: 'small muted mt-4', text: 'ИИ не голосует и не «взвешивает» мнения. Его задача — помочь сформулировать и не потерять заявки.' })]),
      h('div', { class: 'card card--flat' }, [h('div', { class: 'tag', text: 'Прозрачность' }), h('p', { class: 'small muted mt-4', text: 'Голос можно переголосовать до дедлайна. После закрытия итоги фиксируются и доступны для проверки.' })])
    ]),
    actions: [{ label: 'Понятно', variant: 'btn--primary' }]
  });
}

function proposeIdea() {
  var title = h('input', { class: 'input', type: 'text', maxlength: '70', placeholder: 'Например: субботник во дворе' });
  var text = h('textarea', { class: 'input', style: { minHeight: '90px' }, maxlength: '300', placeholder: 'Что предлагаете и что для этого нужно?' });
  Sheet.open({
    title: 'Новое предложение',
    sub: 'Демо: заявка останется в вашем профиле',
    body: h('div', { class: 'col' }, [
      h('p', { class: 'small muted', text: 'Предложение увидят соседи по Копе. Ассистент поможет оформить формулировку и напомнит о сроках.' }),
      h('div', { class: 'field' }, [h('span', { class: 'field__label', text: 'Коротко' }), title]),
      h('div', { class: 'field' }, [h('span', { class: 'field__label', text: 'Подробнее' }), text])
    ]),
    actions: [
      { label: 'Отмена', variant: 'btn--ghost' },
      { label: 'Отправить', variant: 'btn--primary', onClick: function () {
        var t = title.value.trim();
        if (t.length < 5) { toast('Нужно название хотя бы из 5 символов', 'warn'); return; }
        Store.biz(function (st) {
          st.myProposals = st.myProposals || [];
          st.myProposals.push({ id: 'mine-' + (st.myProposals.length + 1), title: t, text: text.value.trim(), ts: Date.now() });
        });
        Store.addContribution(2, 'kind');
        toast('Предложение отправлено · +2 очка вклада', 'ok', '💡');
        refresh();
      } }
    ]
  });
}

/* ---------------- Центр желаний ---------------- */
Views.wishes = function () {
  var s = Store.get();
  var wrap = h('div', { class: 'view__inner' });

  wrap.appendChild(h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [chip('Обмен и аренда', 'gold'), chip('Залог возвращается', 'mint'), chip('Навыки — бесплатно', 'azure')]),
    h('h1', { class: 'h1 mt-12', text: 'Центр желаний' }),
    h('p', { class: 'lead mt-8', text: 'Соседский обмен вещами и навыками: взять на время, а не покупать новое. Залог фиксируется смарт-контрактом и возвращается после возврата вещи.' })
  ]));

  var grid = h('div', { class: 'grid grid--2' });
  DEMO.wishes.forEach(function (w) {
    var rented = (s.rentals || []).filter(function (r) { return r.id === w.id; })[0];
    var card = h('div', { class: 'card' });
    card.appendChild(h('div', { class: 'row row--top' }, [
      h('div', { class: 'list-row__ico', style: { fontSize: '20px' }, text: w.icon }),
      h('div', { class: 'list-row__main' }, [
        h('div', { class: 'list-row__title', text: w.title }),
        h('div', { class: 'list-row__sub', text: w.owner + ' · ' + w.distance + ' · ' + w.period })
      ]),
      rented ? chip('у вас', 'mint') : null
    ]));
    card.appendChild(h('div', { class: 'chips mt-12' }, [
      chip(w.price ? w.price + ' Л за срок' : 'бесплатно', 'gold'),
      chip(w.deposit ? 'залог ' + w.deposit + ' Л' : 'без залога'),
      chip('★ ' + w.rating + ' · ' + w.deals + ' сделок')
    ]));
    card.appendChild(h('p', { class: 'small muted mt-8', text: w.terms }));

    var row = h('div', { class: 'row mt-12 row--wrap' });
    if (rented) {
      var back = h('button', { class: 'btn btn--primary btn--sm', type: 'button', text: 'Вернуть и получить залог' });
      back.addEventListener('click', function () {
        Store.biz(function (st) { st.rentals = st.rentals.filter(function (r) { return r.id !== w.id; }); });
        if (w.deposit) Store.addLad(w.deposit, 'Возврат залога: ' + w.title, 'wishes', { item: w.id });
        toast('Залог возвращён' + (w.deposit ? ' (' + w.deposit + ' Л)' : ''), 'ok', '🔁');
        refresh();
      });
      row.appendChild(back);
    } else {
      var take = h('button', { class: 'btn btn--gold btn--sm', type: 'button', text: w.price ? 'Забронировать' : 'Записаться' });
      take.addEventListener('click', function () { bookWish(w); });
      row.appendChild(take);
    }
    card.appendChild(row);
    grid.appendChild(card);
  });
  wrap.appendChild(grid);

  wrap.appendChild(h('div', { class: 'card' }, [
    sectionHead('Мои брони', 'Активные договорённости'),
    (function () {
      var rs = s.rentals || [];
      if (!rs.length) return emptyState('📭', 'Пока ничего не забронировано', 'Возьмите вещь на время — дешевле покупки и полезнее для соседей.');
      var list = h('div', { class: 'list mt-12' });
      rs.forEach(function (r) {
        list.appendChild(h('div', { class: 'list-row' }, [
          h('span', { class: 'list-row__ico', text: r.icon }),
          h('span', { class: 'list-row__main' }, [
            h('span', { class: 'list-row__title', text: r.title }),
            h('span', { class: 'list-row__sub', text: 'взято ' + fmtDate(r.ts) + ' · залог ' + r.deposit + ' Л' })
          ]),
          chip(r.status, 'azure')
        ]));
      });
      return list;
    })(),
    h('p', { class: 'small dim mt-12', text: 'Споры решаются через координатора Копы и фотофиксацию. В демо смарт-контракт заменён записью в журнале.' })
  ]));

  return wrap;
};

function bookWish(w) {
  var s = Store.get();
  Sheet.open({
    title: 'Бронирование',
    sub: w.title + ' · ' + w.owner,
    body: h('div', { class: 'col' }, [
      h('p', { class: 'lead', text: w.terms }),
      h('div', { class: 'mt-8' }, [
        kvRow('Срок', w.period),
        kvRow('Аренда', w.price ? w.price + ' Ладов' : 'бесплатно'),
        kvRow('Залог', w.deposit ? w.deposit + ' Ладов (возвратный)' : 'не требуется'),
        kvRow('Баланс', fmt(s.lad) + ' Ладов')
      ]),
      h('p', { class: 'small dim', text: 'Демо-операция: реальных платежей и передачи вещей не происходит.' })
    ]),
    actions: [
      { label: 'Отмена', variant: 'btn--ghost' },
      { label: 'Подтвердить', variant: 'btn--gold', onClick: function () {
        Store.biz(function (st) {
          st.rentals = st.rentals || [];
          st.rentals.push({ id: w.id, title: w.title, icon: w.icon, deposit: w.deposit, ts: Date.now(), status: 'у вас' });
        });
        if (w.price) Store.addLad(-w.price, 'Аренда: ' + w.title, 'wishes', { item: w.id });
        if (w.deposit) Store.addLad(-w.deposit, 'Залог: ' + w.title, 'wishes', { item: w.id });
        toast('Забронировано. Залог вернётся после возврата', 'ok', '🔁');
        refresh();
      } }
    ]
  });
}

/* ---------------- Путь добра ---------------- */
Views.kindness = function () {
  var s = Store.get();
  var wrap = h('div', { class: 'view__inner' });

  wrap.appendChild(h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [chip('Путь добра', 'gold'), chip('Открытая смета', 'mint'), chip('Каждый перевод в журнале', 'azure')]),
    h('h1', { class: 'h1 mt-12', text: 'Путь добра' }),
    h('p', { class: 'lead mt-8', text: 'Помощь без давления и без рейтингов «хорошести». Суммы и поступления видны всем, персональные истории — только с согласия. Вы можете помогать деньгами (в демо — Ладами), временем или навыком.' }),
    h('div', { class: 'row mt-16 row--wrap', style: { gap: '26px' } }, [
      statBlock(String(s.donated), 'Ладов переведено'),
      statBlock(String(DEMO.charity.length), 'активных проекта'),
      statBlock('100%', 'открытых отчётов')
    ])
  ]));

  DEMO.charity.forEach(function (c) {
    var p = pct(c.raised, c.goal);
    var card = h('div', { class: 'card' });
    card.appendChild(h('div', { class: 'row row--top' }, [
      h('div', { class: 'list-row__ico', style: { fontSize: '20px' }, text: c.icon }),
      h('div', { class: 'list-row__main' }, [
        h('div', { class: 'list-row__title', text: c.title }),
        h('div', { class: 'list-row__sub', text: c.org })
      ]),
      chip(p + '%', p >= 60 ? 'mint' : 'gold')
    ]));
    card.appendChild(h('p', { class: 'small muted mt-8', text: c.about }));
    card.appendChild(h('div', { class: 'mt-12' }, [progressBar(c.raised, c.goal, 'bar--lg')]));
    card.appendChild(h('div', { class: 'small dim mt-4', text: fmt(c.raised) + ' из ' + fmt(c.goal) + ' Ладов (демо-смета)' }));

    var txList = h('div', { class: 'list mt-12' });
    var prev = 'genesis';
    c.tx.slice(0, 3).forEach(function (t) {
      var hash = hashStr([prev, c.id, t.from, t.sum, t.t].join('|'));
      prev = hash;
      txList.appendChild(h('div', { class: 'list-row' }, [
        h('span', { class: 'list-row__ico', text: '💸' }),
        h('span', { class: 'list-row__main' }, [
          h('span', { class: 'list-row__title', text: t.from }),
          h('span', { class: 'list-row__sub mono', style: { fontSize: '11px' }, text: t.t + ' · ' + hash })
        ]),
        h('span', { class: 'list-row__side mint', text: '+' + t.sum })
      ]));
    });
    card.appendChild(txList);

    var row = h('div', { class: 'row mt-12 row--wrap' });
    var help = h('button', { class: 'btn btn--gold btn--sm', type: 'button', text: 'Помочь' });
    help.addEventListener('click', function () { donate(c); });
    row.appendChild(help);
    var vol = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: 'Помочь временем' });
    vol.addEventListener('click', function () { volunteer(c); });
    row.appendChild(vol);
    card.appendChild(row);

    wrap.appendChild(card);
  });

  wrap.appendChild(h('div', { class: 'card card--flat' }, [
    h('div', { class: 'tag', text: 'Этическая рамка' }),
    h('ul', { class: 'small muted', style: { margin: '8px 0 0 18px', padding: '0' } }, [
      h('li', { text: 'Помощь добровольна. Нет «обязательного минимума» и публичного списка «кто не помог».' }),
      h('li', { text: 'В демо нет реальных платежей: кнопки имитируют операцию и пишут запись в журнал.' }),
      h('li', { text: 'Фото и истории подопечных не используются без письменного согласия.' }),
      h('li', { text: 'Отчёт по каждому сбору доступен в виде цепочки операций с хешами.' })
    ])
  ]));

  return wrap;
};

function donate(c) {
  var s = Store.get();
  var amount = 50;
  var presets = h('div', { class: 'row row--wrap' });
  [20, 50, 100, 200].forEach(function (v, i) {
    var b = h('button', { class: 'btn btn--sm ' + (i === 1 ? 'btn--gold' : 'btn--ghost'), type: 'button', text: v + ' Л' });
    b.addEventListener('click', function () {
      amount = v;
      Array.prototype.forEach.call(presets.children, function (x) { x.classList.remove('btn--gold'); x.classList.add('btn--ghost'); });
      b.classList.remove('btn--ghost');
      b.classList.add('btn--gold');
    });
    presets.appendChild(b);
  });

  Sheet.open({
    title: 'Поддержать проект',
    sub: c.title,
    body: h('div', { class: 'col' }, [
      h('p', { class: 'lead', text: c.about }),
      h('div', { class: 'mt-8' }, [presets]),
      h('div', { class: 'mt-12' }, [
        kvRow('Сумма перевода', 'из выбора выше'),
        kvRow('Ваш баланс', fmt(s.lad) + ' Ладов'),
        kvRow('Отчётность', 'каждый перевод попадает в журнал')
      ]),
      h('p', { class: 'small dim', text: 'Демо-перевод: реальных денег не списывается. В продукте здесь были бы платёжный провайдер и акт отчёта фонда.' })
    ]),
    actions: [
      { label: 'Отмена', variant: 'btn--ghost' },
      { label: 'Перевести', variant: 'btn--gold', onClick: function () {
        Store.biz(function (st) { st.donated += amount; });
        Store.addContribution(4, 'kind');
        Store.addLad(-amount, 'Помощь: ' + c.title, 'charity', { project: c.id, amount: amount });
        toast('Спасибо! ' + amount + ' Ладов · +4 очка вклада', 'ok', '🕊️');
        refresh();
      } }
    ]
  });
}

function volunteer(c) {
  Sheet.open({
    title: 'Помочь временем',
    sub: c.title,
    body: h('div', { class: 'col' }, [
      h('p', { class: 'lead', text: 'Выберите формат участия — координатор свяжется и подберёт удобное время.' }),
      h('div', { class: 'col' }, [
        (function () {
          var b = h('button', { class: 'list-row list-row--link', type: 'button' }, [
            h('span', { class: 'list-row__ico', text: '🧤' }),
            h('span', { class: 'list-row__main' }, [h('span', { class: 'list-row__title', text: 'Выезд на 2 часа' }), h('span', { class: 'list-row__sub', text: 'суббота, работы на месте' })]),
            h('span', { class: 'list-row__side', text: '+8 вклада' })
          ]);
          b.addEventListener('click', function () {
            Store.addContribution(8, 'kind');
            Store.addLad(10, 'Волонтёрство: ' + c.title, 'charity', { project: c.id, kind: 'выезд' });
            Sheet.close();
            toast('Записались · +8 вклада, +10 Ладов', 'ok', '🧤');
            refresh();
          });
          return b;
        })(),
        (function () {
          var b = h('button', { class: 'list-row list-row--link', type: 'button' }, [
            h('span', { class: 'list-row__ico', text: '📦' }),
            h('span', { class: 'list-row__main' }, [h('span', { class: 'list-row__title', text: 'Передать вещи' }), h('span', { class: 'list-row__sub', text: 'пункт приёма в вашей Копе' })]),
            h('span', { class: 'list-row__side', text: '+5 вклада' })
          ]);
          b.addEventListener('click', function () {
            Store.addContribution(5, 'kind');
            Store.addLad(5, 'Передача вещей: ' + c.title, 'charity', { project: c.id, kind: 'вещи' });
            Sheet.close();
            toast('Спасибо · +5 вклада, +5 Ладов', 'ok', '📦');
            refresh();
          });
          return b;
        })(),
        (function () {
          var b = h('button', { class: 'list-row list-row--link', type: 'button' }, [
            h('span', { class: 'list-row__ico', text: '🧠' }),
            h('span', { class: 'list-row__main' }, [h('span', { class: 'list-row__title', text: 'Помочь навыком' }), h('span', { class: 'list-row__sub', text: 'онлайн, по договорённости' })]),
            h('span', { class: 'list-row__side', text: '+6 вклада' })
          ]);
          b.addEventListener('click', function () {
            Store.addContribution(6, 'kind');
            Store.addLad(8, 'Помощь навыком: ' + c.title, 'charity', { project: c.id, kind: 'навык' });
            Sheet.close();
            toast('Записались · +6 вклада, +8 Ладов', 'ok', '🧠');
            refresh();
          });
          return b;
        })()
      ])
    ]),
    actions: [{ label: 'Закрыть', variant: 'btn--ghost' }]
  });
}
