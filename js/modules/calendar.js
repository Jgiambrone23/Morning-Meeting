/* Station: Calendar — the month with holidays and the teacher's events, a countdown to the
   next event, and "calendar questions" students answer by tapping a day. */
(function () {
  const { esc, DAYS, MONTHS, DAY_COLORS, dateKey, pad, parseLines, addDays, seeded, hash, pick, celebrate } = MM.util;

  function nthWeekday(year, month, weekday, n) {
    if (n > 0) { const first = new Date(year, month, 1); return new Date(year, month, 1 + ((weekday - first.getDay() + 7) % 7) + (n - 1) * 7); }
    const last = new Date(year, month + 1, 0);
    return new Date(year, month, last.getDate() - ((last.getDay() - weekday + 7) % 7));
  }
  function holidays(year) {
    const h = {};
    const add = (d, l) => { h[dateKey(d)] = { l, holiday: true }; };
    add(new Date(year, 0, 1), "New Year's Day"); add(nthWeekday(year, 0, 1, 3), 'Martin Luther King Jr. Day');
    add(new Date(year, 1, 14), "Valentine's Day"); add(nthWeekday(year, 1, 1, 3), "Presidents' Day");
    add(new Date(year, 2, 17), "St. Patrick's Day"); add(new Date(year, 3, 22), 'Earth Day');
    add(nthWeekday(year, 4, 0, 2), "Mother's Day"); add(nthWeekday(year, 4, 1, -1), 'Memorial Day');
    add(nthWeekday(year, 5, 0, 3), "Father's Day"); add(new Date(year, 5, 19), 'Juneteenth');
    add(new Date(year, 6, 4), 'Independence Day'); add(nthWeekday(year, 8, 1, 1), 'Labor Day');
    add(new Date(year, 9, 31), 'Halloween'); add(new Date(year, 10, 11), 'Veterans Day');
    add(nthWeekday(year, 10, 4, 4), 'Thanksgiving'); add(new Date(year, 11, 25), 'Christmas'); add(new Date(year, 11, 31), "New Year's Eve");
    return h;
  }
  function parseDate(str, year) {
    let m = str.match(/^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{4}))?$/);
    if (m) return (m[3] || year) + '-' + pad(m[1]) + '-' + pad(m[2]);
    m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) return m[1] + '-' + pad(m[2]) + '-' + pad(m[3]);
    return null;
  }
  function eventsFor(s, year) {
    const map = s.holidays === false ? {} : holidays(year);
    parseLines(s.events, ['date', 'label', 'emoji']).forEach(ev => {
      const key = parseDate(ev.date, year);
      if (key && ev.label) map[key] = { l: ev.label, e: ev.emoji || '', own: true };
    });
    return map;
  }
  const nice = d => DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate();

  MM.register({
    id: 'calendar',
    title: 'Calendar',
    icon: '📅',
    description: 'The month, today, holidays and your own events, a countdown, and calendar questions to answer by tapping.',
    defaultOn: true,
    render(el, ctx) {
      const s = ctx.settings, day = ctx.day;
      const today = ctx.date;
      let view = new Date(today.getFullYear(), today.getMonth(), 1);
      let question = null, qRound = day.qRound || 0;
      let sticker = null;            // sticker id being placed, 'erase', or null
      s.stickers = s.stickers || {};  // dateKey -> [sticker ids]

      // Next event (own events first, then holidays) within 60 days.
      function nextEvent() {
        for (let i = 1; i <= 60; i++) {
          const d = addDays(today, i); const ev = eventsFor(s, d.getFullYear())[dateKey(d)];
          if (ev) return { d, ev, days: i };
        }
        return null;
      }
      function makeQuestion() {
        const rnd = seeded(hash(dateKey(today) + 'q' + qRound));
        const y = view.getFullYear(), m = view.getMonth();
        const days = new Date(y, m + 1, 0).getDate();
        const ev = eventsFor(s, y);
        const inMonth = Object.keys(ev).filter(k => k.startsWith(y + '-' + pad(m + 1)));
        const types = ['date', 'date', 'weekday', 'today', 'tomorrow', 'yesterday'];
        if (inMonth.length) types.push('event', 'event');
        const stuck = Object.keys(s.stickers).filter(k => k.startsWith(y + '-' + pad(m + 1)) && s.stickers[k].length);
        if (stuck.length) types.push('sticker', 'sticker');
        const t = pick(types, rnd);
        if (t === 'date') { const n = 1 + Math.floor(rnd() * days); return { text: 'Tap ' + MONTHS[m] + ' ' + n + '.', answer: y + '-' + pad(m + 1) + '-' + pad(n) }; }
        if (t === 'weekday') { const wd = Math.floor(rnd() * 7); const nth = 1 + Math.floor(rnd() * 3); const d = nthWeekday(y, m, wd, nth); return { text: 'Tap the ' + ['first', 'second', 'third'][nth - 1] + ' ' + DAYS[wd] + ' of ' + MONTHS[m] + '.', answer: dateKey(d) }; }
        if (t === 'sticker') { const k = pick(stuck, rnd); const o = s.stickers[k][0]; const id = typeof o === 'string' ? o : o.id; return { text: 'Tap the day with the ' + ((MM.art.STICKERS.find(x => x.id === id) || {}).label || 'sticker').toLowerCase() + ' sticker.', answer: k }; }
        if (t === 'event') { const k = pick(inMonth, rnd); return { text: 'Tap the day of ' + ev[k].l + '.', answer: k }; }
        if (t === 'tomorrow') return { text: 'Tap tomorrow.', answer: dateKey(addDays(today, 1)) };
        if (t === 'yesterday') return { text: 'Tap yesterday.', answer: dateKey(addDays(today, -1)) };
        return { text: 'Tap today.', answer: dateKey(today) };
      }

      function draw() {
        const y = view.getFullYear(), m = view.getMonth();
        const ev = eventsFor(s, y);
        const first = new Date(y, m, 1).getDay();
        const days = new Date(y, m + 1, 0).getDate();
        let cells = DAYS.map((d, i) => '<div class="dow' + (i === 0 || i === 6 ? ' weekend' : '') + '">' + d + '</div>').join('');
        for (let i = 0; i < first; i++) cells += '<div class="cell blank"></div>';
        for (let d = 1; d <= days; d++) {
          const date = new Date(y, m, d);
          const k = dateKey(date);
          const isToday = k === dateKey(today);
          const e = ev[k];
          const say = nice(date) + (e ? '. ' + e.l : '');
          const stk = (s.stickers[k] || []).map(x => typeof x === 'string' ? { id: x } : x);
          const wk = date.getDay() === 0 || date.getDay() === 6;
          cells += '<button class="cell' + (isToday ? ' today' : '') + (date > today && !isToday ? ' future' : '') + (wk ? ' weekend' : '') +
            (isToday && s.hideToday && !day.shown ? ' hidden' : '') + (e && e.own ? ' own' : '') + '" data-day="' + k + '" data-say="' + esc(say + stk.map(o => '. ' + ((MM.art.STICKERS.find(x => x.id === o.id) || {}).label || '') + (o.name ? ' for ' + o.name : '')).join('')) + '">' +
            '<span class="n" style="background:' + DAY_COLORS[date.getDay()] + '">' + d + '</span>' +
            (stk.length ? '<span class="stk">' + stk.map(o => '<span class="stk1">' + MM.art.sticker(o.id) + (o.name ? '<small>' + esc(o.name) + '</small>' : '') + '</span>').join('') + '</span>' : '') +
            (e ? '<span class="ev">' + (e.e ? '<span class="e">' + esc(e.e) + '</span> ' : '') + esc(e.l) + '</span>' : '') + '</button>';
        }
        const nx = nextEvent();
        el.innerHTML =
          '<div class="cal-head"><button class="btn" data-m="-1">◀</button><h1 data-say="' + MONTHS[m] + ' ' + y + '">' + MONTHS[m] + ' ' + y + '</h1><button class="btn" data-m="1">▶</button></div>' +
          (question ? '<div class="frame" data-say="' + esc(question.text) + '">❓ ' + esc(question.text) + ' 🔊</div>' :
            nx && s.countdown !== false ? '<div class="frame" data-say="' + esc(nx.days + ' days until ' + nx.ev.l) + '"><b>' + nx.days + '</b> day' + (nx.days === 1 ? '' : 's') + ' until <b>' + esc(nx.ev.l) + '</b> (' + esc(nice(nx.d)) + ') 🔊</div>' : '') +
          '<div class="cal">' + cells + '</div>' +
          '<div class="row"><button class="btn" id="ask">Ask a calendar question</button>' + (question ? '<button class="btn" id="noq">Done</button>' : '') +
          '<button class="btn' + (sticker ? ' primary' : '') + '" id="stkBtn">' + (sticker ? 'Done with stickers' : 'Add a sticker') + '</button></div>' +
          (sticker !== null ? '<div class="sticker-tray">' + MM.art.STICKERS.map(x => '<button class="stkpick' + (sticker === x.id ? ' on' : '') + '" data-stk="' + x.id + '" data-say="' + esc(x.label) + '">' + x.svg + '<span>' + esc(x.label) + '</span></button>').join('') +
            '<button class="stkpick erase' + (sticker === 'erase' ? ' on' : '') + '" data-stk="erase"><span class="x">✕</span><span>Take off</span></button></div>' : '');

        el.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { view = new Date(y, m + (+b.dataset.m), 1); question = null; draw(); });
        el.querySelector('#stkBtn').onclick = () => { sticker = sticker === null ? MM.art.STICKERS[0].id : null; question = null; draw(); };
        el.querySelectorAll('[data-stk]').forEach(b => b.onclick = () => { sticker = b.dataset.stk; draw(); });
        el.querySelector('#ask').onclick = () => { qRound++; day.qRound = qRound; ctx.saveDay(); question = makeQuestion(); draw(); ctx.speak(question.text); };
        const nq = el.querySelector('#noq'); if (nq) nq.onclick = () => { question = null; draw(); };
        el.querySelectorAll('[data-day]').forEach(c => c.addEventListener('click', () => {
          if (c.classList.contains('hidden')) { c.classList.remove('hidden'); day.shown = true; ctx.saveDay(); }
          if (sticker) {
            const k = c.dataset.day;
            if (sticker === 'erase') delete s.stickers[k];
            else {
              const def = MM.art.STICKERS.find(x => x.id === sticker) || {};
              let name = '';
              if (def.named) { name = (prompt('Whose ' + def.label.toLowerCase() + '? (first name)') || '').trim(); if (!name) return; }
              s.stickers[k] = (s.stickers[k] || []).concat({ id: sticker, name });
              ctx.speak(def.label + (name ? ' for ' + name : '') + ' on ' + nice(new Date(k + 'T12:00')));
            }
            ctx.saveSettings(); draw(); return;
          }
          if (!question) return;
          if (c.dataset.day === question.answer) { c.classList.add('right'); celebrate('Yes — ' + nice(new Date(question.answer + 'T12:00'))); question = null; setTimeout(draw, 1500); }
          else { c.classList.add('wrong'); setTimeout(() => c.classList.remove('wrong'), 400); }
        }));
      }
      draw();
    },
    settings(el, ctx) {
      const s = ctx.settings;
      el.innerHTML =
        '<label class="field check"><input type="checkbox" data-k="holidays" ' + (s.holidays !== false ? 'checked' : '') + '> Show holidays</label>' +
        '<label class="field check"><input type="checkbox" data-k="countdown" ' + (s.countdown !== false ? 'checked' : '') + '> Show "days until" the next event</label>' +
        '<label class="field check"><input type="checkbox" data-k="hideToday" ' + (s.hideToday ? 'checked' : '') + '> Hide today\'s number until a student taps it</label>' +
        '<p class="hint">Stickers: on the board, tap <b>Add a sticker</b>, pick one, then tap a day (any month). Students can do this themselves. ' + Object.values(s.stickers || {}).reduce((n, a) => n + a.length, 0) + ' stickers placed. <button class="btn" id="clearStk">Remove all stickers</button></p>' +
        '<label class="field">Our events, one per line: <code>date | name</code>. Use 11/20 for every year, or 11/20/2026 for one year. (Optional third part: a symbol.)' +
        '<textarea rows="8" data-k="events" placeholder="11/20 | Field trip&#10;3/14/2027 | Picture day&#10;5/2 | Maya\'s birthday">' + esc(s.events || '') + '</textarea></label>';
      el.querySelectorAll('[data-k]').forEach(i => {
        const k = i.dataset.k;
        if (i.type === 'checkbox') i.onchange = () => { s[k] = i.checked; ctx.saveSettings(); };
        else i.oninput = () => { s[k] = i.value; ctx.saveSettings(); };
      });
      el.querySelector('#clearStk').onclick = () => { if (confirm('Remove every sticker from the calendar?')) { s.stickers = {}; ctx.saveSettings(); ctx.rerender(); } };
    },
  });
})();
