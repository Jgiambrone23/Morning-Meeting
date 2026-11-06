/* Station: Today — students build the date (day, month, number, year), read it,
   then say yesterday and tomorrow. The top-bar date stays hidden until they've built it. */
MM.register({
  id: 'today',
  title: 'Today',
  icon: '🗓',
  description: 'Students build today\'s date from choices, read it, then pick yesterday and tomorrow.',
  defaultOn: true,
  render(el, ctx) {
    const { esc, DAYS, MONTHS, DAY_COLORS, addDays, longDate, shuffle, celebrate } = MM.util;
    const s = ctx.settings, day = ctx.day;
    const d = ctx.date;
    const y = addDays(d, -1), t = addDays(d, 1);
    const greeting = s.greeting || 'Good morning';
    const interactive = s.mode !== 'show';
    day.got = day.got || {};            // which slots are solved today
    const answers = { dow: DAYS[d.getDay()], month: MONTHS[d.getMonth()], num: String(d.getDate()), year: String(d.getFullYear()), yest: DAYS[y.getDay()], tom: DAYS[t.getDay()] };
    const topLine = document.getElementById('dateLine');
    let open = null;                    // slot currently showing choices

    function built() { return ['dow', 'month', 'num', 'year'].every(k => day.got[k]); }
    function allDone() { return built() && day.got.yest && day.got.tom; }
    function choicesFor(k) {
      if (k === 'dow' || k === 'yest' || k === 'tom') return DAYS;
      if (k === 'month') return MONTHS;
      if (k === 'num') return Array.from({ length: 31 }, (_, i) => String(i + 1));
      const yr = d.getFullYear(); return [yr - 1, yr, yr + 1].map(String);
    }
    function slot(k, placeholder) {
      const got = day.got[k];
      return '<button class="slot' + (got ? ' got' : '') + (open === k ? ' open' : '') + '" data-slot="' + k + '">' + (got ? esc(answers[k]) : placeholder) + '</button>';
    }

    function draw() {
      if (interactive) topLine.hidden = !built();
      let html = '<h1 class="greet" data-say="' + esc(greeting + ', ' + ctx.app.className) + '">' + esc(greeting) + ', ' + esc(ctx.app.className) + '.</h1>';

      if (!interactive) {
        html += '<p class="sentence" data-say="Today is ' + esc(longDate(d)) + '">Today is <b>' + esc(longDate(d)) + '</b>. 🔊</p>';
      } else {
        html += '<p class="sub">What is today\'s date? Tap each blank and choose.</p>' +
          '<div class="datebuild">Today is ' + slot('dow', 'day') + ', ' + slot('month', 'month') + ' ' + slot('num', '#') + ', ' + slot('year', 'year') + '.</div>';
        if (built()) {
          html += '<p class="sentence" data-say="Today is ' + esc(longDate(d)) + '">' + esc(longDate(d)) + ' &nbsp;·&nbsp; ' + (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear() + ' 🔊</p>';
        }
        if (open && !day.got[open]) {
          const list = open === 'num' ? choicesFor('num') : shuffle(choicesFor(open));
          html += '<div class="choices' + (open === 'num' ? ' nums' : '') + '">' + list.map(c =>
            '<button class="choice' + (open === 'num' ? ' small' : '') + '" data-pick="' + esc(c) + '">' + esc(c) + '</button>').join('') + '</div>';
        }
      }

      if (!interactive || built()) {
        const card = (label, k, dayObj, cls, verb) => {
          const got = !interactive || day.got[k] || k === 'today';
          return '<div class="card ' + cls + '"' + (got ? ' data-say="' + esc(label + ' ' + verb + ' ' + DAYS[dayObj.getDay()]) + '"' : '') + '>' +
            '<div class="lbl">' + label + '</div>' +
            (got ? '<div class="daycard" style="background:' + DAY_COLORS[dayObj.getDay()] + '">' + DAYS[dayObj.getDay()] + '</div>'
              : '<button class="daycard ask" data-slot="' + k + '">?</button>') + '</div>';
        };
        html += '<div class="ytt">' + card('Yesterday', 'yest', y, 'yesterday', 'was') + card('Today', 'today', d, 'today', 'is') + card('Tomorrow', 'tom', t, 'tomorrow', 'will be') + '</div>';
        if (interactive && (open === 'yest' || open === 'tom') && !day.got[open]) {
          html += '<div class="choices">' + DAYS.map(c => '<button class="choice" data-pick="' + c + '" style="border-color:' + DAY_COLORS[DAYS.indexOf(c)] + '">' + c + '</button>').join('') + '</div>';
        }
        if (allDone() || !interactive) {
          html += '<div class="frame" data-say="' + esc('Yesterday was ' + answers.yest + '. Today is ' + answers.dow + '. Tomorrow will be ' + answers.tom + '.') + '">Yesterday was <b>' + answers.yest + '</b>. Today is <b>' + answers.dow + '</b>. Tomorrow will be <b>' + answers.tom + '</b>. 🔊</div>';
        }
      }
      if (s.message) html += '<div class="frame" data-say="' + esc(s.message) + '">' + esc(s.message) + '</div>';
      if (interactive && Object.keys(day.got).length) html += '<div class="row"><button class="btn" id="resetDate">Start again</button></div>';
      el.innerHTML = html;

      el.querySelectorAll('[data-slot]').forEach(b => b.onclick = () => {
        if (day.got[b.dataset.slot]) { ctx.speak(answers[b.dataset.slot]); return; }
        open = open === b.dataset.slot ? null : b.dataset.slot; draw();
      });
      el.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
        if (b.dataset.pick === answers[open]) {
          day.got[open] = true; ctx.saveDay();
          ctx.speak(answers[open]);
          const wasBuilt = built();
          open = null; draw();
          if (wasBuilt && !day.said) { day.said = true; ctx.saveDay(); setTimeout(() => ctx.speak('Today is ' + longDate(d)), 600); }
          if (allDone()) setTimeout(() => celebrate('Date complete'), 300);
        } else {
          b.classList.add('wrong'); ctx.speak('Try again'); setTimeout(() => b.classList.remove('wrong'), 500);
        }
      });
      const r = el.querySelector('#resetDate');
      if (r) r.onclick = () => { day.got = {}; day.said = false; open = null; ctx.saveDay(); draw(); };
    }
    draw();
  },
  settings(el, ctx) {
    const { esc } = MM.util;
    const s = ctx.settings;
    el.innerHTML =
      '<div class="field">Date ' +
      '<label class="field check"><input type="radio" name="todaymode" value="build" ' + (s.mode !== 'show' ? 'checked' : '') + '> Students build the date from choices (the top-bar date stays hidden until they do)</label>' +
      '<label class="field check"><input type="radio" name="todaymode" value="show" ' + (s.mode === 'show' ? 'checked' : '') + '> Just show the date</label></div>' +
      '<label class="field">Greeting <input data-k="greeting" placeholder="Good morning" value="' + esc(s.greeting || '') + '"></label>' +
      '<label class="field">Message for today (optional) <input data-k="message" placeholder="We have gym today." value="' + esc(s.message || '') + '"></label>';
    el.querySelectorAll('[name=todaymode]').forEach(r => r.onchange = () => { s.mode = r.value; ctx.saveSettings(); if (r.value === 'show') document.getElementById('dateLine').hidden = false; });
    el.querySelectorAll('[data-k]').forEach(i => i.oninput = () => { s[i.dataset.k] = i.value; ctx.saveSettings(); });
  },
});
