/* ИП Куницкий А.А. — меню, комплект листов, фасад с отметками, заявка */
(function () {
  'use strict';
  var WA = 'https://wa.me/375333769876';
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- шапка ---------- */
  var head = document.querySelector('.head');
  function onScroll() {
    if (!head) return;
    head.classList.toggle('is-stuck', window.scrollY > 30 || head.classList.contains('head--solid'));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- меню ---------- */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  var closeBtn = document.getElementById('drawer-close');
  var lastFocus = null;
  function focusables() {
    if (!drawer) return [];
    return Array.prototype.slice.call(drawer.querySelectorAll('a[href],button:not([disabled]),input,select,textarea'))
      .filter(function (el) { return el.offsetParent !== null; });
  }
  function openDrawer() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.hidden = false;
    document.body.classList.add('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    var f = focusables(); if (f.length) f[0].focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.hidden = true;
    document.body.classList.remove('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (burger) burger.addEventListener('click', function () { (drawer && drawer.hidden) ? openDrawer() : closeDrawer(); });
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (drawer) {
    drawer.addEventListener('click', function (e) { if (e.target === drawer) closeDrawer(); });
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('is-locked');
        if (burger) burger.setAttribute('aria-expanded', 'false');
      });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && !drawer.hidden) closeDrawer();
  });

  /* ---------- появление ---------- */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && rv.length) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('is-in'); }); }

  function el(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }

  /* ---------- комплект листов ---------- */
  var needChips = document.querySelectorAll('[data-need]');
  if (needChips.length) {
    var haveChips = document.querySelectorAll('[data-have]');
    var kitTitle = document.getElementById('kit-title');
    var kitCount = document.getElementById('kit-count');
    var kitVerdict = document.getElementById('kit-verdict');
    var kitSend = document.getElementById('kit-send');
    var need = { house: true }, have = { old: true };

    var NEED_LABEL = { house: 'дом', out: 'баня или гараж', recon: 'реконструкция', plan: 'перепланировка', edit: 'правки в проект' };
    var HAVE_LABEL = { old: 'старый проект', model: 'типовой проект', topo: 'топосъёмка', none: 'ничего' };

    function pick(obj) {
      return Object.keys(obj).filter(function (k) { return obj[k]; });
    }

    function refreshKit() {
      var n = pick(need), h = pick(have);
      var title, text;

      if (n.indexOf('edit') >= 0) {
        if (have.model) title = 'Изменения в типовой проект';
        else if (have.old) title = 'Корректировка проекта';
        else title = 'Внесение изменений в проект';
      } else if (n.indexOf('recon') >= 0) title = 'Проект реконструкции';
      else if (n.indexOf('plan') >= 0) title = 'Проект перепланировки';
      else if (n.indexOf('out') >= 0 && n.indexOf('house') < 0) title = 'Проект постройки';
      else title = 'Проект жилого дома';

      kitTitle.textContent = title;
      kitCount.textContent = '6 листов';

      if (!n.length) {
        text = 'Выберите хотя бы один пункт в «что нужно» — покажу вид работ.';
      } else {
        var parts = [];
        parts.push('Нужно: ' + n.map(function (k) { return NEED_LABEL[k]; }).join(', ') + '.');
        parts.push('Есть: ' + (h.length ? h.map(function (k) { return HAVE_LABEL[k]; }).join(', ') : 'пока ничего не отмечено') + '.');
        if (have.none || !have.topo) {
          parts.push('Топосъёмки нет — её нужно заказать до посадки дома на участок: без границ и отметок генплан не сделать.');
        } else {
          parts.push('Топосъёмка есть — можно сразу делать схему генплана с привязками.');
        }
        if (need.plan && !need.recon) {
          parts.push('Если при перепланировке габариты и этажность не меняются, комплект обычно короче: планы с площадями и пояснительная записка. Уточним по требованиям вашего исполкома.');
        }
        if (need.recon) {
          parts.push('Реконструкция: к комплекту добавятся листы по существующему дому — обмерные планы и то, что меняется.');
        }
        text = parts.join(' ');
      }
      kitVerdict.innerHTML = text;

      kitSend.href = WA + '?text=' + encodeURIComponent(
        'Задача по проекту\nЧто нужно: ' + (n.length ? n.map(function (k) { return NEED_LABEL[k]; }).join(', ') : 'уточним в переписке') +
        '\nЧто есть: ' + (h.length ? h.map(function (k) { return HAVE_LABEL[k]; }).join(', ') : 'нет данных') +
        '\nПо разговору выходит: ' + title +
        '\nПодскажите стоимость и что нужно подготовить.');
    }

    Array.prototype.forEach.call(needChips, function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-need');
        need[k] = !need[k];
        b.setAttribute('aria-pressed', need[k] ? 'true' : 'false');
        refreshKit();
      });
    });
    Array.prototype.forEach.call(haveChips, function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-have');
        if (k === 'none') {
          have = { none: !have.none };
        } else {
          have.none = false;
          have[k] = !have[k];
        }
        Array.prototype.forEach.call(haveChips, function (o) {
          var key = o.getAttribute('data-have');
          o.setAttribute('aria-pressed', have[key] ? 'true' : 'false');
        });
        refreshKit();
      });
    });
    refreshKit();
  }

  /* ---------- фасад с отметками ---------- */
  var svg = document.getElementById('elevSvg');
  if (svg) {
    var eW = document.getElementById('eW'), eD = document.getElementById('eD'), eP = document.getElementById('eP');
    var oW = document.getElementById('eWOut'), oD = document.getElementById('eDOut'), oP = document.getElementById('ePOut');
    var oArea = document.getElementById('e-area'), oTotal = document.getElementById('e-total');
    var oRidge = document.getElementById('e-ridge'), oPitch = document.getElementById('e-pitch');
    var eSend = document.getElementById('elev-send');
    var flChips = document.querySelectorAll('[data-fl]');
    var floors = 1;

    function mark(v) { return (v >= 0 ? '+' : '') + v.toFixed(3); }

    function drawElev() {
      var W = parseFloat(eW.value), D = parseFloat(eD.value), P = parseFloat(eP.value);
      var wallH = floors === 2 ? 6.0 : 3.0;
      var roofH = (D / 2) * Math.tan(P * Math.PI / 180);
      var total = wallH + roofH;
      var availW = 430;
      var s = Math.min(availW / W, 320 / total);
      var w = W * s, h = wallH * s, rh = roofH * s;
      var x0 = 76 + (availW - w) / 2, y1 = 372, yWall = y1 - h, yRidge = yWall - rh;

      while (svg.firstChild) svg.removeChild(svg.firstChild);

      /* земля */
      svg.appendChild(el('line', { x1: 20, y1: y1, x2: 620, y2: y1, stroke: 'rgba(239,235,226,.4)', 'stroke-width': 1.3 }));
      for (var gx = 20; gx < 620; gx += 13) {
        svg.appendChild(el('line', { x1: gx, y1: y1 + 5, x2: gx + 6, y2: y1 - 1, stroke: 'rgba(239,235,226,.16)', 'stroke-width': 1 }));
      }

      /* стена */
      svg.appendChild(el('rect', { x: x0, y: yWall, width: w, height: h, fill: 'rgba(239,235,226,.07)', stroke: '#EFEBE2', 'stroke-width': 1.4 }));

      /* кровля с выносом */
      var ov = 0.45 * s;
      var eL = x0 - ov, eR = x0 + w + ov, mid = x0 + w / 2;
      var eY = yWall + 3;
      svg.appendChild(el('polygon', { points: [eL, eY, mid, yRidge, eR, eY].join(' '), fill: 'rgba(228,119,106,.14)', stroke: '#E4776A', 'stroke-width': 1.5 }));

      /* окна и дверь */
      var rows = floors === 2 ? [0.7, 3.7] : [0.9];
      var winW = Math.min(w / 5.2, 26), winH = 1.25 * s;
      rows.forEach(function (base) {
        var yTop = y1 - (base + 1.25) * s;
        [0.16, 0.42, 0.68].forEach(function (fx, idx) {
          if (idx === 1 || w > 150) {
            svg.appendChild(el('rect', { x: x0 + w * fx, y: yTop, width: winW, height: winH, fill: 'none', stroke: 'rgba(239,235,226,.7)', 'stroke-width': 1.1 }));
            svg.appendChild(el('line', { x1: x0 + w * fx + winW / 2, y1: yTop, x2: x0 + w * fx + winW / 2, y2: yTop + winH, stroke: 'rgba(239,235,226,.45)', 'stroke-width': .8 }));
          }
        });
      });

      /* отметки справа */
      var marks = [{ y: y1, v: 0, t: '0.000' }];
      if (floors === 2) marks.push({ y: y1 - 3 * s, v: 3, t: mark(3) });
      marks.push({ y: yWall, v: wallH, t: mark(wallH) });
      marks.push({ y: yRidge, v: total, t: mark(total) });
      marks.forEach(function (m) {
        svg.appendChild(el('line', { x1: x0 + w + ov + 6, y1: m.y, x2: x0 + w + ov + 46, y2: m.y, stroke: 'rgba(239,235,226,.35)', 'stroke-width': 1 }));
        svg.appendChild(el('circle', { cx: x0 + w + ov + 6, cy: m.y, r: 2.4, fill: '#E4776A' }));
        svg.appendChild(el('text', { x: x0 + w + ov + 50, y: m.y + 3 }, m.t));
      });

      /* размер ширины */
      var dy = y1 + 34;
      svg.appendChild(el('line', { x1: x0, y1: dy, x2: x0 + w, y2: dy, stroke: 'rgba(239,235,226,.45)', 'stroke-width': 1 }));
      [x0, x0 + w].forEach(function (x) {
        svg.appendChild(el('line', { x1: x, y1: dy - 6, x2: x, y2: dy + 6, stroke: '#E4776A', 'stroke-width': 1.2 }));
      });
      svg.appendChild(el('text', { x: x0 + w / 2, y: dy + 18, 'text-anchor': 'middle' }, W + ' м'));

      /* уклон */
      svg.appendChild(el('path', { d: 'M' + (x0 + w - 34) + ' ' + eY + ' a34 34 0 0 1 -16 -29', fill: 'none', stroke: '#E4776A', 'stroke-width': 1 }));
      svg.appendChild(el('text', { x: x0 + w - 78, y: eY - 12 }, P + '°'));

      /* размер высоты стены слева */
      svg.appendChild(el('line', { x1: 22, y1: yWall, x2: 22, y2: y1, stroke: 'rgba(239,235,226,.45)', 'stroke-width': 1 }));
      [yWall, y1].forEach(function (y) {
        svg.appendChild(el('line', { x1: 15, y1: y, x2: 29, y2: y, stroke: '#E4776A', 'stroke-width': 1.2 }));
      });
      var hv = el('text', { x: 14, y: (yWall + y1) / 2, 'text-anchor': 'middle' }, wallH.toFixed(2).replace('.', ','));
      hv.setAttribute('transform', 'rotate(-90 14 ' + ((yWall + y1) / 2) + ')');
      svg.appendChild(hv);

      /* цифры */
      var area = W * D;
      var totalArea = area * (floors === 2 ? 2 : floors === 1.5 ? 1.55 : 1);
      oW.textContent = W + ' м';
      oD.textContent = D + ' м';
      oP.textContent = P + '°';
      oArea.textContent = Math.round(area) + ' м²';
      oTotal.textContent = Math.round(totalArea) + ' м²';
      oRidge.textContent = mark(total);
      oPitch.textContent = P + '°';

      eSend.href = WA + '?text=' + encodeURIComponent(
        'Габариты с сайта\nШирина: ' + W + ' м\nГлубина: ' + D + ' м' +
        '\nЭтажность: ' + (floors === 2 ? '2 этажа' : floors === 1.5 ? '1 этаж + мансарда' : '1 этаж') +
        '\nУклон кровли: ' + P + '°' +
        '\nПлощадь застройки: ' + Math.round(area) + ' м², общая: ' + Math.round(totalArea) + ' м²' +
        '\nВысота конька: ' + mark(total) +
        '\nХочу проект под такие габариты.');
    }

    Array.prototype.forEach.call(flChips, function (b) {
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(flChips, function (o) { o.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        floors = parseFloat(b.getAttribute('data-fl'));
        drawElev();
      });
    });
    [eW, eD, eP].forEach(function (i) { i.addEventListener('input', drawElev); });
    drawElev();
  }

  /* ---------- заявка ---------- */
  var form = document.getElementById('lead');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (sel) { var f = form.querySelector(sel); return f ? f.value : ''; };
      var name = g('#f-name'), phone = g('#f-phone'), obj = g('#f-obj'), what = g('#f-what'), note = g('#f-note');
      var ok = form.querySelector('.form__ok');
      if (name.trim().length < 2 || phone.replace(/\D/g, '').length < 9) {
        if (ok) { ok.hidden = false; ok.textContent = 'Укажите имя и телефон, чтобы я мог ответить.'; }
        return;
      }
      var text = 'Заявка на проект\nИмя: ' + name.trim() + '\nТелефон: ' + phone.trim() +
        (obj ? '\nОбъект: ' + obj : '') + (what ? '\nЧто нужно: ' + what : '') +
        (note.trim() ? '\nКомментарий: ' + note.trim() : '');
      var url = WA + '?text=' + encodeURIComponent(text);
      if (ok) {
        ok.hidden = false;
        ok.innerHTML = 'Заявка собрана. Если WhatsApp не открылся, <a href="' + url + '" target="_blank" rel="noopener">нажмите здесь</a>.';
      }
      window.open(url, '_blank', 'noopener');
    });
  }
})();
