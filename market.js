/* ==========================================================================
   РУССКАЯ ВСЕЛЕННАЯ — Маркетплейс «Слободы»: корзина, заказ, журнал
   ========================================================================== */
'use strict';

window.Views = window.Views || {};

var MARKET_FILTER = { sloboda: 'all', q: '' };

function cartCount(cart) {
  return cart.reduce(function (a, i) { return a + i.qty; }, 0);
}

function cartTotal(cart) {
  return cart.reduce(function (a, i) {
    var p = productById(i.id);
    return a + (p ? p.price * i.qty : 0);
  }, 0);
}

function addToCart(pid) {
  var p = productById(pid);
  if (!p) return;
  Store.biz(function (s) {
    var line = s.cart.filter(function (i) { return i.id === pid; })[0];
    if (line) line.qty += 1;
    else s.cart.push({ id: pid, qty: 1 });
  });
  toast('«' + p.name + '» в корзине', 'ok', p.icon);
  refresh();
  var fab = document.getElementById('cart-fab');
  if (fab) fab.classList.add('is-pop');
}

Views.market = function () {
  var s = Store.get();
  var wrap = h('div', { class: 'view__inner' });
  var childMode = s.mode === 'child';

  wrap.appendChild(h('div', { class: 'hero' }, [
    h('div', { class: 'chips' }, [chip('Корзина чистых продуктов', 'gold'), chip('Лады — бонусные единицы'), chip('Прослеживаемость', 'mint')]),
    h('h1', { class: 'h1 mt-12', text: 'Маркетплейс «Слободы»' }),
    h('p', { class: 'lead mt-8', text: 'Товары слобод с открытой историей партии. Оплата — токенами «Лад» в демо-контуре: реальных денег и платежей в прототипе нет. Заказ записывается в ваш журнал операций.' }),
    childMode ? h('div', { class: 'card card--flat mt-12' }, [
      h('div', { class: 'small', text: '🧒 В детском профиле покупки отключены: корзину собирает родитель из своего профиля. Каталог и паспорта продуктов доступны для изучения.' })
    ]) : null
  ]));

  /* ---------- фильтры ---------- */
  var tabsRow = h('div', { class: 'tabs' });
  var options = [{ id: 'all', label: 'Все' }].concat(DEMO.slobody.map(function (sl) { return { id: sl.id, label: sl.short }; }));
  options.forEach(function (o) {
    var b = h('button', { class: 'tabs__btn' + (MARKET_FILTER.sloboda === o.id ? ' is-active' : ''), type: 'button', text: o.label });
    b.addEventListener('click', function () { MARKET_FILTER.sloboda = o.id; refresh(); });
    tabsRow.appendChild(b);
  });

  var search = h('input', { class: 'input', type: 'search', placeholder: 'Найти продукт или тег…', value: MARKET_FILTER.q, 'aria-label': 'Поиск по каталогу' });
  search.addEventListener('input', function () {
    MARKET_FILTER.q = search.value;
    renderGrid();
  });

  wrap.appendChild(h('div', { class: 'card' }, [
    h('div', { class: 'row row--wrap row--between' }, [tabsRow, h('div', { style: { flex: '1 1 220px', minWidth: '200px' } }, [search])])
  ]));

  /* ---------- сетка товаров ---------- */
  var gridHost = h('div', {});
  wrap.appendChild(gridHost);

  function renderGrid() {
    clear(gridHost);
    var q = MARKET_FILTER.q.trim().toLowerCase();
    var items = DEMO.products.filter(function (p) {
      if (MARKET_FILTER.sloboda !== 'all' && p.sloboda !== MARKET_FILTER.sloboda) return false;
      if (!q) return true;
      return (p.name + ' ' + p.tags.join(' ')).toLowerCase().indexOf(q) >= 0;
    });

    gridHost.appendChild(sectionHead('Каталог', 'Найдено: ' + items.length,
      h('span', { class: 'small muted', text: 'эко-индекс — оценка демо-контура' })));

    if (!items.length) {
      gridHost.appendChild(emptyState('🔍', 'Ничего не нашлось', 'Попробуйте другой запрос или сбросьте фильтр по слободе.'));
      return;
    }

    var grid = h('div', { class: 'grid grid--auto mt-12' });
    items.forEach(function (p) {
      var sl = slobodaById(p.sloboda);
      var card = h('div', { class: 'card' });
      card.appendChild(h('div', { class: 'row row--top' }, [
        h('div', { class: 'list-row__ico', style: { fontSize: '20px' }, text: p.icon }),
        h('div', { class: 'list-row__main' }, [
          h('div', { class: 'list-row__title', text: p.name }),
          h('div', { class: 'list-row__sub', text: (sl ? sl.short + ' слобода' : '') + ' · ' + p.weight })
        ]),
        h('span', { class: 'list-row__side gold', text: p.price + ' Л' })
      ]));
      card.appendChild(h('div', { class: 'chips mt-12' }, [
        chip('эко ' + p.eco, 'mint'),
        chip(p.chain.length + ' ' + plural(p.chain.length, ['шаг', 'шага', 'шагов']), 'azure')
      ]));
      var actions = h('div', { class: 'row mt-12 row--wrap' });
      var openBtn = h('button', { class: 'btn btn--ghost btn--xs', type: 'button', text: 'Паспорт' });
      openBtn.addEventListener('click', function () { go('product/' + p.id); });
      actions.appendChild(openBtn);

      if (!childMode) {
        var inCart = s.cart.filter(function (i) { return i.id === p.id; })[0];
        var addBtn = h('button', { class: 'btn btn--gold btn--xs', type: 'button', text: inCart ? 'Ещё +1' : 'В корзину' });
        addBtn.addEventListener('click', function () { addToCart(p.id); });
        actions.appendChild(addBtn);
        if (inCart) actions.appendChild(chip('в корзине: ' + inCart.qty, 'gold'));
      }
      card.appendChild(actions);
      grid.appendChild(card);
    });
    gridHost.appendChild(grid);
  }

  renderGrid();

  /* ---------- корзина ---------- */
  if (!childMode) {
    var cartCard = h('div', { class: 'card card--glow', id: 'cart-card' });
    wrap.appendChild(cartCard);
    renderCart(cartCard);
  }

  /* ---------- заказы ---------- */
  var ordersCard = h('div', { class: 'card' }, [sectionHead('Мои заказы', 'Каждый заказ пишется в журнал операций')]);
  if (!s.orders.length) {
    ordersCard.appendChild(emptyState('📦', 'Заказов пока нет', 'Соберите корзину — оформление занимает один шаг.'));
  } else {
    var list = h('div', { class: 'list mt-12' });
    s.orders.slice().reverse().forEach(function (o) {
      list.appendChild(h('div', { class: 'list-row' }, [
        h('span', { class: 'list-row__ico', text: '📦' }),
        h('span', { class: 'list-row__main' }, [
          h('span', { class: 'list-row__title', text: 'Заказ ' + o.id + ' · ' + o.items + ' поз.' }),
          h('span', { class: 'list-row__sub', text: fmtDate(o.ts) + ' · ' + o.slot + ' · ' + o.pay })
        ]),
        h('span', { class: 'list-row__side gold', text: o.total + ' Л' })
      ]));
    });
    ordersCard.appendChild(list);
  }
  wrap.appendChild(ordersCard);

  wrap.appendChild(h('div', { class: 'card card--flat' }, [
    h('div', { class: 'tag', text: 'Правила экономики «Лад»' }),
    h('ul', { class: 'small muted', style: { margin: '8px 0 0 18px', padding: '0' } }, [
      h('li', { text: 'Лад — бонусная единица за полезные действия, а не валюта и не финансовый инструмент.' }),
      h('li', { text: 'Лады нельзя обменять на деньги, передать другому человеку или купить.' }),
      h('li', { text: 'Цены в демо-контуре фиксированные; скидки за «статус» не применяются.' }),
      h('li', { text: 'Возврат в прототипе имитируется записью в журнал, платежи не проводятся.' })
    ])
  ]));

  return wrap;
};

function renderCart(host) {
  var s = Store.get();
  clear(host);
  var total = cartTotal(s.cart);

  host.appendChild(sectionHead('Корзина', s.cart.length ? ('позиции: ' + s.cart.length + ' · сумма: ' + total + ' Ладов') : 'пока пусто'));

  if (!s.cart.length) {
    host.appendChild(emptyState('🧺', 'Корзина пуста', 'Добавьте продукты из каталога — паспорт каждого доступен до покупки.'));
    return;
  }

  var list = h('div', { class: 'list mt-12' });
  s.cart.forEach(function (line) {
    var p = productById(line.id);
    if (!p) return;
    var minus = h('button', { class: 'btn btn--xs btn--ghost', type: 'button', 'aria-label': 'Убрать одну единицу', text: '−' });
    minus.addEventListener('click', function () {
      Store.biz(function (st) {
        var l = st.cart.filter(function (i) { return i.id === p.id; })[0];
        if (!l) return;
        l.qty -= 1;
        if (l.qty <= 0) st.cart = st.cart.filter(function (i) { return i.id !== p.id; });
      });
      refresh();
    });
    var plus = h('button', { class: 'btn btn--xs btn--ghost', type: 'button', 'aria-label': 'Добавить одну единицу', text: '+' });
    plus.addEventListener('click', function () { addToCart(p.id); });

    list.appendChild(h('div', { class: 'list-row' }, [
      h('span', { class: 'list-row__ico', text: p.icon }),
      h('span', { class: 'list-row__main' }, [
        h('span', { class: 'list-row__title', text: p.name }),
        h('span', { class: 'list-row__sub', text: p.price + ' Л × ' + line.qty + ' = ' + (p.price * line.qty) + ' Л' })
      ]),
      h('span', { class: 'list-row__side' }, [h('span', { class: 'row', style: { gap: '4px' } }, [minus, h('span', { class: 'strong', text: String(line.qty) }), plus])])
    ]));
  });
  host.appendChild(list);

  host.appendChild(h('div', { class: 'mt-16' }, [
    kvRow('Товары', total + ' Ладов'),
    kvRow('Доставка слободой', 'бесплатно в демо'),
    kvRow('Ваш баланс', fmt(s.lad) + ' Ладов')
  ]));

  var row = h('div', { class: 'row mt-16 row--wrap' });
  var checkout = h('button', { class: 'btn btn--gold', type: 'button', text: 'Оформить заказ' });
  checkout.addEventListener('click', openCheckout);
  row.appendChild(checkout);
  var clearBtn = h('button', { class: 'btn btn--ghost', type: 'button', text: 'Очистить корзину' });
  clearBtn.addEventListener('click', function () {
    Sheet.confirm({ title: 'Очистить корзину?', text: 'Позиции будут удалены, баланс не изменится.', okLabel: 'Очистить' })
      .then(function (ok) {
        if (!ok) return;
        Store.biz(function (st) { st.cart = []; });
        Sheet.close();
        toast('Корзина очищена', 'ok', '🧺');
        refresh();
      });
  });
  row.appendChild(clearBtn);
  host.appendChild(row);
}

function openCheckout() {
  var s = Store.get();
  var total = cartTotal(s.cart);
  if (!s.cart.length) { toast('Корзина пуста', 'warn'); return; }

  var slot = 'сегодня, 18:00–20:00';
  var slotTabs = h('div', { class: 'tabs' });
  ['сегодня, 18:00–20:00', 'завтра, 08:00–10:00', 'завтра, 18:00–20:00'].forEach(function (t, i) {
    var b = h('button', { class: 'tabs__btn' + (i === 0 ? ' is-active' : ''), type: 'button', text: t });
    b.addEventListener('click', function () {
      slot = t;
      Array.prototype.forEach.call(slotTabs.children, function (c) { c.classList.remove('is-active'); });
      b.classList.add('is-active');
    });
    slotTabs.appendChild(b);
  });

  var body = h('div', { class: 'col' }, [
    h('p', { class: 'lead', text: 'Демо-оформление: списание Ладов, запись в журнал и «доставка» без реальной оплаты.' }),
    h('div', { class: 'card card--flat' }, [
      h('div', { class: 'tag', text: 'Состав заказа' }),
      h('div', { class: 'list mt-8' }, s.cart.map(function (line) {
        var p = productById(line.id);
        return h('div', { class: 'list-row' }, [
          h('span', { class: 'list-row__ico', text: p ? p.icon : '•' }),
          h('span', { class: 'list-row__main' }, [h('span', { class: 'list-row__title', text: p ? p.name : line.id })]),
          h('span', { class: 'list-row__side', text: (p ? p.price * line.qty : 0) + ' Л' })
        ]);
      }))
    ]),
    h('div', { class: 'field mt-12' }, [h('span', { class: 'field__label', text: 'Окно доставки' }), slotTabs]),
    h('div', { class: 'mt-12' }, [
      kvRow('Итого', total + ' Ладов'),
      kvRow('Баланс', fmt(s.lad) + ' Ладов'),
      kvRow('Остаток после заказа', fmt(s.lad - total) + ' Ладов')
    ]),
    s.lad < total ? h('div', { class: 'small', style: { color: '#FF9C97' }, text: 'Ладов не хватает — в демо можно всё равно оформить, но баланс не станет отрицательным.' }) : null,
    h('p', { class: 'small dim', text: 'Продолжая, вы подтверждаете, что это демо-операция без реальной оплаты и доставки.' })
  ]);

  Sheet.open({
    title: 'Оформление заказа',
    sub: 'Демо-контур · реальные платежи отключены',
    body: body,
    actions: [
      { label: 'Отмена', variant: 'btn--ghost' },
      { label: 'Подтвердить', variant: 'btn--gold', onClick: function () {
        var items = cartCount(s.cart);
        var orderId = 'RU-' + String(1000 + s.orders.length + 1);
        Store.biz(function (st) {
          st.orders.push({ id: orderId, ts: Date.now(), items: items, total: total, slot: slot, pay: 'Лады (демо)' });
          st.cart = [];
        });
        Store.addLad(-total, 'Заказ ' + orderId + ' · ' + items + ' поз.', 'market', { orderId: orderId, slot: slot });
        toast('Заказ ' + orderId + ' оформлен', 'ok', '📦');
        refresh();
      } }
    ]
  });
}
