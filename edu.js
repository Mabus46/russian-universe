/* ==========================================================================
   РУССКАЯ ВСЕЛЕННАЯ — «Золото России»: треки, уроки, олимпиада
   ========================================================================== */
'use strict';

window.Views = window.Views || {};

/* перемешивание вариантов ответа (детерминированно по тексту вопроса) */
function shuffleIdx(seed, n) {
  var arr = [];
  for (var i = 0; i < n; i++) arr.push(i);
  var hh = hashStr(seed);
  for (var j = arr.length - 1; j > 0; j--) {
    var code = hh.charCodeAt(j % hh.length) + j * 31;
    var k = code % (j + 1);
    var tmp = arr[j]; arr[j] = arr[k]; arr[k] = tmp;
  }
  return arr;
}

function trackById(id) {
  return DEMO.tracks.filter(function (t) { return t.id === id; })[0] || null;
}

function lessonDone(trackId, lessonId) {
  return Store.get().completedLessons.indexOf(trackId + ':' + lessonId) >= 0;
}

function trackProgress(t) {
  var done = t.lessons.filter(function (l) { return lessonDone(t.id, l.id); }).length;
  return { done: done, total: t.lessons.length, pct: pct(done, t.lessons.length) };
}

function ageChip(t) {
  return t.ages === 'child' ? chip('7–10 лет · 6+', 'mint') : t.ages === 'teen' ? chip('11–16 лет · 12+', 'azure') : chip('18+ · взрослым', 'gold');
}

/* ---------------- каталог треков ---------------- */
Views.edu = function () {
  var s = Store.get();
  var wrap = h('div', { class: 'view__inner' });

  wrap.appendChild(h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [chip('Образование', 'gold'), chip('Маркировка 436-ФЗ', 'mint'), chip('Источник у каждого урока', 'azure')]),
    h('h1', { class: 'h1 mt-12', text: '«Золото России»' }),
    h('p', { class: 'lead mt-8', text: 'Учебные треки о земле, данных и деле. Каждый урок — короткий текст, один вопрос на понимание и объяснение, почему ответ верный. За пройденные уроки начисляются очки вклада и Лады.' }),
    h('div', { class: 'row mt-16 row--wrap' }, [
      goBtn('Осенняя олимпиада', 'olympiad', 'btn--gold'),
      goBtn('Дерево вклада', 'tree', 'btn--ghost')
    ])
  ]));

  var grid = h('div', { class: 'grid grid--3' });
  DEMO.tracks.forEach(function (t) {
    var pr = trackProgress(t);
    var card = h('div', { class: 'card card--link' });
    card.addEventListener('click', function () { go('track/' + t.id); });
    card.appendChild(h('div', { class: 'row row--top' }, [
      h('div', { class: 'list-row__ico', style: { fontSize: '20px' }, text: t.icon }),
      h('div', { class: 'list-row__main' }, [
        h('div', { class: 'list-row__title', text: t.title }),
        h('div', { class: 'list-row__sub', text: t.lessons.length + ' уроков · ' + pr.done + ' пройдено' })
      ])
    ]));
    card.appendChild(h('div', { class: 'chips mt-12' }, [ageChip(t)]));
    card.appendChild(h('p', { class: 'small muted mt-8', text: t.about }));
    card.appendChild(h('div', { class: 'mt-12' }, [progressBar(pr.done, pr.total, 'bar--lg')]));
    grid.appendChild(card);
  });
  wrap.appendChild(grid);

  /* ---------- олимпиада-тизер ---------- */
  wrap.appendChild(h('div', { class: 'card card--glow' }, [
    h('div', { class: 'row row--between row--wrap' }, [
      h('div', {}, [
        h('div', { class: 'h2', text: '🏅 ' + DEMO.olympiad.title }),
        h('div', { class: 'small muted mt-4', text: DEMO.olympiad.status + ' · ' + DEMO.olympiad.tasks.length + ' заданий · диплом в демо-профиль' }),
        s.olympiadScore !== null ? h('div', { class: 'small mint mt-4', text: 'Ваш результат: ' + s.olympiadScore + ' из ' + DEMO.olympiad.tasks.length }) : null
      ]),
      goBtn(s.olympiadScore !== null ? 'Пройти заново' : 'Участвовать', 'olympiad', 'btn--gold')
    ])
  ]));

  wrap.appendChild(h('div', { class: 'card card--flat' }, [
    h('div', { class: 'tag', text: 'Как устроено обучение' }),
    h('ul', { class: 'small muted', style: { margin: '8px 0 0 18px', padding: '0' } }, [
      h('li', { text: 'Уроки открываются по порядку: сначала понимание, потом следующий шаг.' }),
      h('li', { text: 'Ошибка не наказывается: показываем объяснение и разрешаем попробовать снова.' }),
      h('li', { text: 'Ответы ассистента и разбор заданий всегда содержат источник.' }),
      h('li', { text: 'Прогресс хранится только в вашем браузере и доступен для экспорта.' })
    ])
  ]));

  return wrap;
};

/* ---------------- трек ---------------- */
Views.trackDetail = function (id) {
  var t = trackById(id);
  if (!t) return emptyState('🎓', 'Трек не найден', 'Выберите другой трек в разделе обучения.');
  var s = Store.get();
  var pr = trackProgress(t);
  var wrap = h('div', { class: 'view__inner' });

  var back = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '← Все треки' });
  back.addEventListener('click', function () { go('edu'); });
  wrap.appendChild(back);

  wrap.appendChild(h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [ageChip(t), chip(pr.done + ' из ' + pr.total + ' уроков', 'gold')]),
    h('h1', { class: 'h1 mt-12', text: t.icon + ' ' + t.title }),
    h('p', { class: 'lead mt-8', text: t.about }),
    h('div', { class: 'mt-16' }, [progressBar(pr.done, pr.total, 'bar--lg bar--gold')])
  ]));

  var list = h('div', { class: 'col', style: { gap: '10px' } });
  t.lessons.forEach(function (l, i) {
    var done = lessonDone(t.id, l.id);
    var prevDone = i === 0 || lessonDone(t.id, t.lessons[i - 1].id);
    var locked = !prevDone && !done;

    var row = h('div', { class: 'list-row' + (locked ? '' : ' list-row--link'), style: locked ? { opacity: '.55' } : null }, [
      h('span', { class: 'list-row__ico', text: done ? '✓' : locked ? '🔒' : String(i + 1) }),
      h('span', { class: 'list-row__main' }, [
        h('span', { class: 'list-row__title', text: l.title }),
        h('span', { class: 'list-row__sub', text: locked ? 'откроется после предыдущего урока' : (done ? 'пройдено · можно повторить' : 'текст + один вопрос на понимание') })
      ]),
      h('span', { class: 'list-row__side' }, [done ? chip('готово', 'mint') : chip('+5 вклада', 'gold')])
    ]);
    if (!locked) row.addEventListener('click', function () { go('lesson/' + t.id + '-' + l.id); });
    list.appendChild(row);
  });
  wrap.appendChild(h('div', { class: 'card' }, [sectionHead('Уроки трека', 'Порядок важен: следующий шаг опирается на предыдущий'), list]));

  wrap.appendChild(h('div', { class: 'card card--flat' }, [
    h('div', { class: 'tag', text: 'Родителям' }),
    h('p', { class: 'small muted mt-8', text: t.ages === 'adult' ? 'Трек для взрослых: содержит экономические понятия и договорные отношения.' : 'Материалы соответствуют возрасту 6+/12+: без сцен насилия, страха и соревновательного давления. Прогресс ребёнка виден родителю в детском профиле.' })
  ]));

  return wrap;
};

/* ---------------- урок ---------------- */
Views.lessonDetail = function (param) {
  /* param = "<trackId>-<lessonId>" */
  var idx = param.lastIndexOf('-l');
  var trackId = param.slice(0, idx);
  var lessonId = param.slice(idx + 1);
  var t = trackById(trackId);
  if (!t) return emptyState('📘', 'Урок не найден', 'Откройте трек заново.');
  var l = t.lessons.filter(function (x) { return x.id === lessonId; })[0];
  if (!l) return emptyState('📘', 'Урок не найден', 'Откройте трек заново.');

  var wrap = h('div', { class: 'view__inner' });
  var answered = false;
  var chosen = -1;

  var back = h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '← ' + t.title });
  back.addEventListener('click', function () { go('track/' + t.id); });
  wrap.appendChild(back);

  var already = lessonDone(t.id, l.id);

  wrap.appendChild(h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [chip(t.title, 'azure'), chip(l.id.toUpperCase(), 'gold'), already ? chip('пройдено', 'mint') : chip('новый урок')]),
    h('h1', { class: 'h1 mt-12', text: l.title })
  ]));

  var textCard = h('div', { class: 'card' }, [
    h('div', { class: 'tag', text: 'Материал' }),
    h('p', { class: 'lead mt-8', text: l.text }),
    h('hr', { class: 'hr mt-16' }),
    h('div', { class: 'small dim', text: 'Источник: ' + l.source })
  ]);
  wrap.appendChild(textCard);

  /* ---------- вопрос ---------- */
  var quizCard = h('div', { class: 'card' }, [
    sectionHead('Проверка понимания', 'Одна ошибка ничего не портит — разберём вместе'),
    h('div', { class: 'lesson-step mt-12' })
  ]);
  var step = quizCard.querySelector('.lesson-step');
  step.appendChild(h('div', { class: 'h3', text: l.quiz.q }));

  var opts = h('div', { class: 'col', style: { gap: '8px' } });
  var feedback = h('div', {});
  var finishRow = h('div', { class: 'row mt-12 row--wrap' });

  var lOrder = shuffleIdx(l.quiz.q, l.quiz.a.length);
  lOrder.forEach(function (i, pos) {
    var text = l.quiz.a[i];
    var b = h('button', { class: 'quiz-opt', type: 'button' }, [
      h('span', { class: 'quiz-opt__letter', text: 'АБВГ'[pos] || String(pos + 1) }),
      h('span', { text: text })
    ]);
    b.addEventListener('click', function () {
      if (answered) return;
      chosen = i;
      answered = true;
      var right = i === l.quiz.c;
      Array.prototype.forEach.call(opts.children, function (c, k) {
        if (lOrder[k] === l.quiz.c) c.classList.add('is-right');
        else if (lOrder[k] === i) c.classList.add('is-wrong');
      });
      clear(feedback);
      feedback.appendChild(h('div', { class: 'card card--flat mt-12' }, [
        h('div', { class: 'row' }, [
          h('span', { class: 'list-row__ico', text: right ? '✅' : '💡' }),
          h('span', { class: 'strong', text: right ? 'Верно!' : 'Почти — вот как устроено' })
        ]),
        h('p', { class: 'small muted mt-8', text: l.quiz.why }),
        h('div', { class: 'small dim mt-4', text: 'Источник: ' + l.source })
      ]));
      if (!right) {
        var retry = h('button', { class: 'btn btn--ghost btn--sm mt-8', type: 'button', text: 'Попробовать ещё раз' });
        retry.addEventListener('click', function () {
          answered = false;
          Array.prototype.forEach.call(opts.children, function (c) { c.classList.remove('is-right', 'is-wrong'); });
          clear(feedback);
          clear(finishRow);
        });
        feedback.appendChild(retry);
      } else {
        clear(finishRow);
        var done = h('button', { class: 'btn btn--gold', type: 'button', text: already ? 'Урок уже засчитан' : 'Завершить урок (+5 вклада, +10 Ладов)' });
        done.addEventListener('click', function () {
          if (already) { toast('Урок уже был засчитан ранее', 'warn'); return; }
          Store.biz(function (st) { st.completedLessons.push(t.id + ':' + l.id); });
          Store.addContribution(5, 'edu');
          Store.addLad(10, 'Урок: ' + l.title, 'edu', { track: t.id, lesson: l.id });
          toast('Урок засчитан: +5 вклада, +10 Ладов', 'ok', '🎓');
          var next = t.lessons[t.lessons.indexOf(l) + 1];
          refresh();
          if (next) go('lesson/' + t.id + '-' + next.id);
          else go('track/' + t.id);
        });
        finishRow.appendChild(done);
      }
    });
    opts.appendChild(b);
  });

  step.appendChild(opts);
  step.appendChild(feedback);
  step.appendChild(finishRow);
  wrap.appendChild(quizCard);

  /* ---------- связь с другими разделами ---------- */
  wrap.appendChild(h('div', { class: 'card card--flat' }, [
    h('div', { class: 'tag', text: 'Куда дальше' }),
    h('div', { class: 'row mt-8 row--wrap' }, [
      goBtn('Ассистент: объяснить подробнее', 'assistant', 'btn--ghost', true),
      goBtn('Слободы на практике', 'slobody', 'btn--ghost', true),
      goBtn('Олимпиада', 'olympiad', 'btn--ghost', true)
    ])
  ]));

  return wrap;
};

/* ---------------- олимпиада ---------------- */
Views.olympiad = function () {
  var s = Store.get();
  var wrap = h('div', { class: 'view__inner' });
  var tasks = DEMO.olympiad.tasks;
  var state = { i: 0, score: 0, answers: [] };

  wrap.appendChild(h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [chip('Олимпиада', 'gold'), chip(DEMO.olympiad.status, 'mint'), chip('Диплом в профиль', 'azure')]),
    h('h1', { class: 'h1 mt-12', text: '🏅 ' + DEMO.olympiad.title }),
    h('p', { class: 'lead mt-8', text: 'Пять заданий про землю, данные и безопасность. Ошибки разбираются сразу, а итог сохраняется в демо-профиле — это не экзамен и не рейтинг людей.' }),
    s.olympiadScore !== null ? h('div', { class: 'mt-12' }, [chip('прошлый результат: ' + s.olympiadScore + ' из ' + tasks.length, 'gold')]) : null
  ]));

  var host = h('div', { class: 'card card--glow' });
  wrap.appendChild(host);

  function renderStart() {
    clear(host);
    host.appendChild(h('div', { class: 'h2', text: 'Готовы начать?' }));
    host.appendChild(h('p', { class: 'lead mt-8', text: 'Заданий: ' + tasks.length + '. Время в демо не ограничено, подсказки — после ответа.' }));
    host.appendChild(h('div', { class: 'row mt-16 row--wrap' }, [
      (function () {
        var b = h('button', { class: 'btn btn--gold', type: 'button', text: 'Начать' });
        b.addEventListener('click', function () { state = { i: 0, score: 0, answers: [] }; renderTask(); });
        return b;
      })(),
      goBtn('Вернуться к трекам', 'edu', 'btn--ghost')
    ]));
    host.appendChild(h('div', { class: 'small dim mt-16', text: 'Маркировка: 6+ · вопросы без политики, насилия и соревнования между людьми.' }));
  }

  function renderTask() {
    clear(host);
    var task = tasks[state.i];
    host.appendChild(h('div', { class: 'row row--between' }, [
      h('div', { class: 'tag', text: 'Задание ' + (state.i + 1) + ' из ' + tasks.length }),
      chip('верных: ' + state.score, 'mint')
    ]));
    host.appendChild(h('div', { class: 'mt-8' }, [progressBar(state.i, tasks.length, 'bar--gold')]));
    host.appendChild(h('div', { class: 'h2 mt-16', text: task.q }));

    var opts = h('div', { class: 'col mt-12', style: { gap: '8px' } });
    var answered = false;
    var oOrder = shuffleIdx(task.q, task.a.length);
    oOrder.forEach(function (i, pos) {
      var text = task.a[i];
      var b = h('button', { class: 'quiz-opt', type: 'button' }, [
        h('span', { class: 'quiz-opt__letter', text: 'АБВГ'[pos] }),
        h('span', { text: text })
      ]);
      b.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        var right = i === task.c;
        if (right) state.score++;
        Array.prototype.forEach.call(opts.children, function (c, k) {
          if (oOrder[k] === task.c) c.classList.add('is-right');
          else if (oOrder[k] === i) c.classList.add('is-wrong');
        });
        host.appendChild(h('div', { class: 'card card--flat mt-12' }, [
          h('div', { class: 'row' }, [
            h('span', { class: 'list-row__ico', text: right ? '✅' : '💡' }),
            h('span', { class: 'strong', text: right ? 'Верно' : 'Разбор' })
          ]),
          h('p', { class: 'small muted mt-8', text: task.why })
        ]));
        var next = h('button', { class: 'btn btn--primary mt-12', type: 'button', text: state.i < tasks.length - 1 ? 'Следующее задание →' : 'Итог' });
        next.addEventListener('click', function () {
          state.i++;
          if (state.i >= tasks.length) renderFinish();
          else renderTask();
        });
        host.appendChild(next);
      });
      opts.appendChild(b);
    });
    host.appendChild(opts);
  }

  function renderFinish() {
    clear(host);
    var score = state.score;
    var verdict = score === tasks.length ? 'Блестяще: все задания верны.'
      : score >= 3 ? 'Хороший результат: база на месте, детали можно повторить.'
        : 'Начало положено: разборы выше — короткий путь к пониманию.';

    Store.biz(function (st) { st.olympiadScore = score; });
    Store.addContribution(score * 4, 'edu');
    Store.addLad(score * 6, 'Олимпиада «Золото России»: ' + score + ' из ' + tasks.length, 'edu', { score: score });

    host.appendChild(h('div', { class: 'empty' }, [
      h('div', { class: 'empty__ico', text: score >= 4 ? '🏆' : '🎖️' }),
      h('div', { class: 'h2', text: score + ' из ' + tasks.length }),
      h('div', { class: 'small', text: verdict })
    ]));
    host.appendChild(h('div', { class: 'mt-8' }, [
      kvRow('Очков вклада начислено', '+' + (score * 4)),
      kvRow('Ладов начислено', '+' + (score * 6)),
      kvRow('Результат сохранён в профиле', 'да')
    ]));
    var row = h('div', { class: 'row mt-16 row--wrap' });
    var again = h('button', { class: 'btn btn--gold', type: 'button', text: 'Пройти заново' });
    again.addEventListener('click', function () { state = { i: 0, score: 0, answers: [] }; renderTask(); });
    row.appendChild(again);
    row.appendChild(goBtn('В дерево вклада →', 'tree', 'btn--ghost'));
    host.appendChild(row);
    host.appendChild(h('div', { class: 'small dim mt-12', text: 'Запись о результате добавлена в журнал операций — его можно проверить в «Дереве жизни».' }));
  }

  if (s.olympiadScore === null) renderStart();
  else renderStart();

  return wrap;
};
