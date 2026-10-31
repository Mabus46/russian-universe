/* ==========================================================================
   РУССКАЯ ВСЕЛЕННАЯ — ИИ-ассистенты (демо-диалог с объяснениями)
   Ответы собираются локально по демо-базе знаний: без сети и без сервера.
   ========================================================================== */
'use strict';

window.Views = window.Views || {};

var ASSISTANT_MEMO = {}; /* история диалога живёт в памяти вкладки */

var SUGGESTIONS = [
  'Что такое слободы?',
  'Как начисляется токен «Лад»?',
  'Как растёт уровень в дереве?',
  'Какие есть курсы для детей?',
  'Как защищены дети в Киберщите?',
  'Что с моими данными?'
];

function pickAnswer(text) {
  var q = text.toLowerCase();
  var best = null, bestScore = 0;
  DEMO.kb.forEach(function (item) {
    var score = 0;
    item.keys.forEach(function (k) {
      if (q.indexOf(k) >= 0) score += k.length;
    });
    if (score > bestScore) { bestScore = score; best = item; }
  });
  return bestScore > 0 ? best : null;
}

function genericAnswer(text) {
  var hint = text.trim().slice(0, 40);
  return {
    answer: 'В демо-контуре я отвечаю по девяти темам: слободы, «Лад», дерево вклада, обучение, Киберщит, сообщество, здоровье, добро и данные. Про «' + hint + '…» у меня нет проверенного материала — и я не буду выдумывать. Попробуйте один из вопросов ниже или откройте нужный раздел.',
    why: ['вопрос не совпал с базой знаний демо', 'правило: не выдумывать факты, которых нет в источниках'],
    sources: ['Правила ассистентов, разд. 2.1 (запрет на домысливание)'],
    chips: [{ label: 'Все разделы', route: 'home' }]
  };
}

Views.assistant = function () {
  var s = Store.get();
  var wrap = h('div', { class: 'view__inner' });
  var me = DEMO.assistants.filter(function (a) { return a.id === s.assistant; })[0] || DEMO.assistants[0];

  if (!ASSISTANT_MEMO[s.assistant]) {
    ASSISTANT_MEMO[s.assistant] = [{ who: 'ai', text: me.greet, chips: SUGGESTIONS.slice(0, 3).map(function (t) { return { label: t, ask: t }; }) }];
  }

  /* ---------- шапка ---------- */
  var head = h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [chip('Демо-диалог', 'gold'), chip('Без сети и сервера'), chip('Объяснение каждого ответа', 'mint')]),
    h('h1', { class: 'h1 mt-12', text: 'ИИ-ассистент «' + me.name + '»' }),
    h('p', { class: 'lead mt-8', text: me.role + '. ' + me.tone }),
    h('div', { class: 'row mt-12 row--wrap' }, [
      chip('голос: ' + me.voice, 'azure'),
      (function () {
        var b = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: 'Сменить ассистента' });
        b.addEventListener('click', function () { changeAssistant(); });
        return b;
      })(),
      (function () {
        var b = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: 'Очистить диалог' });
        b.addEventListener('click', function () {
          ASSISTANT_MEMO[s.assistant] = null;
          toast('Диалог очищен', 'ok', '🧹');
          refresh();
        });
        return b;
      })()
    ])
  ]);
  head.appendChild(h('div', { class: 'hero__art', html: bubbleArt(me.icon) }));
  wrap.appendChild(head);

  /* ---------- чат ---------- */
  var chatCard = h('div', { class: 'card' });
  var chat = h('div', { class: 'chat' });
  chatCard.appendChild(chat);
  wrap.appendChild(chatCard);

  var composer = h('div', { class: 'composer mt-12' });
  var input = h('input', { class: 'input', type: 'text', placeholder: 'Спросите про слободы, «Лад», обучение…', 'aria-label': 'Вопрос ассистенту', maxlength: '300' });
  var send = h('button', { class: 'btn btn--gold', type: 'button', text: 'Отправить' });
  composer.appendChild(input);
  composer.appendChild(send);
  chatCard.appendChild(composer);

  var sugg = h('div', { class: 'chips mt-12' });
  SUGGESTIONS.forEach(function (q) {
    var b = h('button', { class: 'chip chip--azure', type: 'button', style: { cursor: 'pointer' }, text: q });
    b.addEventListener('click', function () { ask(q); });
    sugg.appendChild(b);
  });
  chatCard.appendChild(h('div', { class: 'tag mt-16', text: 'Частые вопросы' }));
  chatCard.appendChild(sugg);

  /* ---------- карточка «как выглядит манипуляция» ---------- */
  wrap.appendChild(h('div', { class: 'card card--flat' }, [
    h('div', { class: 'row row--top' }, [
      h('div', { class: 'list-row__ico', text: '🌑' }),
      h('div', { class: 'list-row__main' }, [
        h('div', { class: 'list-row__title', text: 'Персона «' + DEMO.antagonist.name + '» — только как учебный пример' }),
        h('div', { class: 'list-row__sub', text: DEMO.antagonist.note }),
        h('div', { class: 'small muted mt-8', text: DEMO.antagonist.role })
      ])
    ])
  ]));

  function scrollDown() {
    var v = document.getElementById('view');
    if (v) v.scrollTop = v.scrollHeight;
  }

  function renderMsg(m) {
    if (m.typing) {
      return h('div', { class: 'msg' }, [
        h('div', { class: 'msg__ava', text: me.icon }),
        h('div', { class: 'msg__body' }, [
          h('div', { class: 'msg__bubble' }, [h('div', { class: 'typing' }, [h('i'), h('i'), h('i')])])
        ])
      ]);
    }
    if (m.who === 'me') {
      return h('div', { class: 'msg msg--me' }, [
        h('div', { class: 'msg__ava', text: (s.name || 'Вы').charAt(0).toUpperCase() }),
        h('div', { class: 'msg__body' }, [h('div', { class: 'msg__bubble', text: m.text })])
      ]);
    }
    var body = h('div', { class: 'msg__body' });
    body.appendChild(h('div', { class: 'msg__bubble', text: m.text }));

    if (m.why && m.why.length) {
      var why = h('div', { class: 'msg__meta' }, [chip('почему так', 'mint')]);
      var details = h('div', { class: 'small dim mt-8 hide' }, [
        h('div', { class: 'strong small', text: 'Почему такой ответ' }),
        h('ul', { style: { margin: '4px 0 0 16px', padding: '0' } }, m.why.map(function (w) { return h('li', { text: w }); })),
        m.sources && m.sources.length ? h('div', { class: 'mt-8' }, [
          h('div', { class: 'strong small', text: 'Источники' }),
          h('ul', { style: { margin: '4px 0 0 16px', padding: '0' } }, m.sources.map(function (w) { return h('li', { text: w }); }))
        ]) : null
      ]);
      var toggle = h('button', { class: 'btn btn--xs btn--ghost', type: 'button', text: 'Показать' });
      toggle.addEventListener('click', function () {
        var hidden = details.classList.toggle('hide');
        toggle.textContent = hidden ? 'Показать' : 'Скрыть';
      });
      why.appendChild(toggle);
      body.appendChild(why);
      body.appendChild(details);
    }

    if (m.chips && m.chips.length) {
      var chips = h('div', { class: 'chips' });
      m.chips.forEach(function (c) {
        var b = h('button', { class: 'chip chip--gold', type: 'button', style: { cursor: 'pointer' }, text: c.label });
        b.addEventListener('click', function () {
          if (c.ask) ask(c.ask);
          else if (c.route) go(c.route);
        });
        chips.appendChild(b);
      });
      body.appendChild(chips);
    }
    body.appendChild(h('div', { class: 'small dim', text: 'Демо-ответ · ' + me.name }));
    return h('div', { class: 'msg' }, [h('div', { class: 'msg__ava', text: me.icon }), body]);
  }

  function paint() {
    clear(chat);
    ASSISTANT_MEMO[s.assistant].forEach(function (m) { chat.appendChild(renderMsg(m)); });
    scrollDown();
  }

  function ask(text) {
    text = (text || '').trim();
    if (!text) return;
    var list = ASSISTANT_MEMO[s.assistant];
    list.push({ who: 'me', text: text });
    list.push({ typing: true });
    paint();
    setTimeout(function () {
      list.pop();
      var found = pickAnswer(text);
      var a = found || genericAnswer(text);
      list.push({
        who: 'ai',
        text: a.answer,
        why: a.why,
        sources: a.sources,
        chips: a.chips
      });
      paint();
    }, 520);
  }

  send.addEventListener('click', function () { var v = input.value; input.value = ''; ask(v); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var v = input.value; input.value = ''; ask(v); } });

  paint();
  return wrap;
};

function bubbleArt(icon) {
  return '<svg viewBox="0 0 300 300" width="100%" height="100%" aria-hidden="true">' +
    '<defs><radialGradient id="ag"><stop offset="0" stop-color="#5B8DEF" stop-opacity=".55"/><stop offset="1" stop-color="#5B8DEF" stop-opacity="0"/></radialGradient></defs>' +
    '<circle cx="150" cy="150" r="140" fill="url(#ag)"/>' +
    '<rect x="70" y="96" width="160" height="86" rx="20" fill="none" stroke="#A9C2FF" stroke-width="2" opacity=".8"/>' +
    '<path d="M104 182 l-6 26 l30 -26 z" fill="none" stroke="#A9C2FF" stroke-width="2" opacity=".8"/>' +
    '<g fill="#A9C2FF" opacity=".7"><circle cx="116" cy="139" r="5"/><circle cx="150" cy="139" r="5"/><circle cx="184" cy="139" r="5"/></g>' +
    '<text x="150" y="243" text-anchor="middle" font-size="34" opacity=".9">' + icon + '</text>' +
    '</svg>';
}
