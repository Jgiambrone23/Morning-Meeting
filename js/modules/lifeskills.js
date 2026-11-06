/* Station: Life Skills — clock, money, community signs and "what would you do?" talk prompts */
(function () {
  const { esc, shuffle, pick, parseLines, hash, dateKey } = MM.util;

  const SIGNS = [
    { html: '<svg viewBox="0 0 100 100" width="150"><polygon points="30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30" fill="#d32f2f" stroke="#fff" stroke-width="4"/><text x="50" y="62" font-size="28" font-weight="800" fill="#fff" text-anchor="middle" font-family="Arial">STOP</text></svg>', bg: '#fff', m: 'Stop and look before you go' },
    { html: '<b>EXIT</b>', bg: '#1b8a3a', fg: '#fff', m: 'This is the way out' },
    { html: '<span class="emo">🚻</span>RESTROOM', bg: '#1565c0', fg: '#fff', m: 'Bathroom' },
    { html: '<span class="emo">🚺</span>WOMEN', bg: '#1565c0', fg: '#fff', m: "Women's bathroom" },
    { html: '<span class="emo">🚹</span>MEN', bg: '#1565c0', fg: '#fff', m: "Men's bathroom" },
    { html: '<span class="emo">⚠️</span>DANGER', bg: '#111', fg: '#ff5252', m: 'Something here can hurt you. Stay away' },
    { html: '<span class="emo">☠️</span>POISON', bg: '#fff', fg: '#111', m: 'Do not eat or drink this' },
    { html: '<span class="emo">🚭</span>NO SMOKING', bg: '#fff', fg: '#c62828', m: 'Do not smoke here' },
    { html: '<span class="emo">✋</span>DON\'T WALK', bg: '#222', fg: '#ff7043', m: 'Wait. Do not cross the street yet' },
    { html: '<span class="emo">🚶</span>WALK', bg: '#222', fg: '#fff', m: 'It is safe to cross. Look both ways' },
    { html: '<span class="emo">🧹</span>CAUTION<br>WET FLOOR', bg: '#ffd600', fg: '#111', m: 'The floor is slippery. Walk carefully' },
    { html: 'PUSH', bg: '#eceff1', fg: '#263238', m: 'Push the door to open it' },
    { html: 'PULL', bg: '#eceff1', fg: '#263238', m: 'Pull the door to open it' },
    { html: 'OPEN', bg: '#2e7d32', fg: '#fff', m: 'The store is open. You can go in' },
    { html: 'CLOSED', bg: '#c62828', fg: '#fff', m: 'The store is closed. Come back later' },
    { html: '<span class="emo">🧯</span>FIRE EXTINGUISHER', bg: '#c62828', fg: '#fff', m: 'Use this to put out a small fire' },
    { html: '<span class="emo">🏥</span>HOSPITAL', bg: '#1565c0', fg: '#fff', m: 'Doctors help sick or hurt people here' },
    { html: 'EMPLOYEES<br>ONLY', bg: '#fff', fg: '#111', m: 'Only workers can go in here' },
    { html: '<span class="emo">♿</span>ACCESSIBLE', bg: '#1565c0', fg: '#fff', m: 'This is for people who use a wheelchair or need more help' },
    { html: '<span class="emo">🚌</span>BUS STOP', bg: '#fff', fg: '#1565c0', m: 'Wait here for the bus' },
  ];

  // "Good choice?" — a short situation and two choices; one is the good choice.
  const CHOICES = [
    ['Your friend says "Hi!"', 'Say "Hi!" back', 'Walk away'],
    ['You want a turn with the ball.', 'Ask: "Can I have a turn?"', 'Grab the ball'],
    ['You spill your drink.', 'Get a towel and wipe it', 'Leave it on the floor'],
    ['The teacher is talking.', 'Listen with a quiet mouth', 'Talk to a friend'],
    ['You need help with your work.', 'Raise your hand', 'Yell "HELP!"'],
    ['Someone bumps into you by accident.', 'Say "That\'s okay"', 'Push them back'],
    ['It is time to clean up.', 'Put things away', 'Keep playing'],
    ['You are going outside and it is cold.', 'Put on a coat', 'Wear shorts'],
    ['You finish eating lunch.', 'Throw away your trash', 'Leave it on the table'],
    ['A friend looks sad.', 'Ask: "Are you okay?"', 'Laugh at them'],
    ['You want to cross the street.', 'Stop and look both ways', 'Run across'],
    ['Your hands are dirty before eating.', 'Wash your hands', 'Eat anyway'],
    ['Someone is talking to you.', 'Look at them and listen', 'Look at your phone'],
    ['You made a mistake.', 'Say "Sorry" and fix it', 'Hide it'],
    ['You want to join a game.', 'Ask: "Can I play?"', 'Take the game pieces'],
    ['You feel angry.', 'Take deep breaths', 'Throw something'],
    ['The fire alarm rings.', 'Walk out with the class', 'Hide under a desk'],
    ['Your clothes are on the floor at night.', 'Put them in the laundry', 'Leave them there'],
    ['A stranger asks where you live.', 'Do not tell; find an adult', 'Tell them your address'],
    ['Dinner is ready.', 'Wash hands and come to the table', 'Keep watching TV'],
    ['You see a "WET FLOOR" sign.', 'Walk slowly and carefully', 'Run'],
    ['You want something at the store.', 'Ask politely', 'Take it without paying'],
    ['Someone says something kind to you.', 'Say "Thank you"', 'Say nothing'],
    ['Your friend is talking.', 'Wait for your turn to talk', 'Talk over them'],
    ['You are done brushing your teeth.', 'Rinse and put the brush away', 'Leave the water running'],
    ['It is bedtime.', 'Get into bed', 'Start a new game'],
  ];

  const COINS = [
    { v: 1, n: 'Penny', c: '#c98a4b', s: 3.6 }, { v: 5, n: 'Nickel', c: '#bdbdbd', s: 4.1 },
    { v: 10, n: 'Dime', c: '#d6d6d6', s: 3.3 }, { v: 25, n: 'Quarter', c: '#cfcfcf', s: 4.5 },
  ];
  function money(c) { return c < 100 ? c + '¢' : '$' + (c / 100).toFixed(2); }
  function moneyWords(c) {
    if (c < 100) return c + ' cents';
    const d = Math.floor(c / 100), r = c % 100;
    return d + ' dollar' + (d > 1 ? 's' : '') + (r ? ' and ' + r + ' cents' : '');
  }
  function timeStr(h, m) { return h + ':' + String(m).padStart(2, '0'); }
  function clockSvg(h, m) {
    const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
    let ticks = '';
    for (let i = 1; i <= 12; i++) {
      const a = i * 30 * Math.PI / 180;
      ticks += '<text x="' + (Math.sin(a) * 78).toFixed(1) + '" y="' + (-Math.cos(a) * 78 + 8).toFixed(1) + '" font-size="22" font-weight="700" text-anchor="middle" font-family="Arial">' + i + '</text>';
    }
    for (let i = 0; i < 60; i++) {
      const a = i * 6 * Math.PI / 180, r1 = i % 5 ? 94 : 89;
      ticks += '<line x1="' + (Math.sin(a) * r1).toFixed(1) + '" y1="' + (-Math.cos(a) * r1).toFixed(1) + '" x2="' + (Math.sin(a) * 98).toFixed(1) + '" y2="' + (-Math.cos(a) * 98).toFixed(1) + '" stroke="#333" stroke-width="' + (i % 5 ? 1 : 3) + '"/>';
    }
    return '<svg class="clock-face" viewBox="-110 -110 220 220"><circle r="105" fill="#fff" stroke="var(--brand)" stroke-width="8"/>' + ticks +
      '<line x1="0" y1="0" x2="0" y2="-50" stroke="#d32f2f" stroke-width="9" stroke-linecap="round" transform="rotate(' + ha + ')"/>' +
      '<line x1="0" y1="0" x2="0" y2="-80" stroke="#1d2433" stroke-width="5" stroke-linecap="round" transform="rotate(' + ma + ')"/>' +
      '<circle r="7" fill="#1d2433"/></svg>';
  }

  // Each quiz returns {html, answer, choices[], say}
  const QUIZ = {
    clock(level) {
      const h = 1 + Math.floor(Math.random() * 12);
      const steps = { hour: [0], half: [0, 30], quarter: [0, 15, 30, 45], five: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] }[level] || [0, 30];
      const m = pick(steps);
      const right = timeStr(h, m);
      const wrong = new Set();
      const swap = m % 5 === 0 && m > 0 ? timeStr(m / 5, h * 5 % 60) : null;
      if (swap && swap !== right) wrong.add(swap);
      while (wrong.size < 2) {
        const w = timeStr(1 + ((h + pick([-1, 1, 2, 6]) + 11) % 12), pick(steps));
        if (w !== right) wrong.add(w);
      }
      return { html: clockSvg(h, m), q: 'What time is it?', answer: right, choices: shuffle([right].concat([...wrong].slice(0, 2))), say: 'It is ' + right };
    },
    money(level, opts) {
      let total = 0, html = '';
      const n = 2 + Math.floor(Math.random() * (level === 'easy' ? 3 : 4));
      const pool = level === 'easy' ? [COINS[0], COINS[1], COINS[2]] : COINS;
      const items = [];
      if (level === 'bills') { const b = pick([1, 1, 5]); items.push({ bill: b }); total += b * 100; }
      for (let i = 0; i < n; i++) items.push(pick(pool));
      items.sort((a, b) => (b.bill || 0) * 100 + (b.v || 0) - ((a.bill || 0) * 100 + (a.v || 0)));
      items.forEach(it => {
        if (it.bill) { html += '<div class="bill">$' + it.bill + '</div>'; return; }
        total += it.v;
        html += '<div style="text-align:center"><div class="coin" style="width:' + it.s + 'rem;height:' + it.s + 'rem;background:' + it.c + '">' + it.v + '¢</div>' +
          (opts.coinNames !== false ? '<small><b>' + it.n + '</b></small>' : '') + '</div>';
      });
      const wrong = new Set();
      while (wrong.size < 2) { const w = total + pick([-10, -5, -1, 1, 5, 10, 25]); if (w > 0 && w !== total) wrong.add(w); }
      return { html: '<div class="money">' + html + '</div>', q: 'How much money is this?', answer: money(total), choices: shuffle([total].concat([...wrong])).map(money), say: 'It is ' + moneyWords(total) };
    },
    signs() {
      const s = pick(SIGNS);
      const others = shuffle(SIGNS.filter(x => x.m !== s.m)).slice(0, 2).map(x => x.m);
      return { html: '<div class="sign" style="background:' + s.bg + ';color:' + (s.fg || '#111') + '">' + s.html + '</div>', q: 'What does this sign mean?', answer: s.m, choices: shuffle([s.m].concat(others)), say: s.m, small: true };
    },
  };

  MM.register({
    tabs: [['clock', 'Clock'], ['money', 'Money'], ['signs', 'Community signs'], ['talk', 'Good choice?']],
    id: 'lifeskills',
    hidden: true,            // shown inside the Activity station
    title: 'Life skills',
    icon: '🕐',
    description: 'Tell time, count money, read community signs, and pick the good choice.',
    defaultOn: true,
    render(el, ctx) {
      const s = ctx.settings;
      const tabs = [['clock', 'Clock'], ['money', 'Money'], ['signs', 'Signs'], ['talk', 'Good choice?']]
        .filter(t => !(s.hide || []).includes(t[0]));
      // Default tab rotates by day so each morning feels a bit different.
      let tab = ctx.day.tab || tabs[hash(dateKey(ctx.date)) % tabs.length][0];
      const prompts = s.prompts ? parseLines(s.prompts, ['q', 'good', 'bad']).filter(x => x.q && x.good && x.bad).map(x => [x.q, x.good, x.bad]) : CHOICES;
      let promptIdx = hash(dateKey(ctx.date) + 'p') % prompts.length;
      let quiz = null;

      function newQuiz() {
        quiz = tab === 'clock' ? QUIZ.clock(s.clockLevel || 'half') : tab === 'money' ? QUIZ.money(s.moneyLevel || 'coins', s) : QUIZ.signs();
      }
      function draw() {
        let html = ctx.embedded ? '<h1 class="station-title">' + esc((tabs.find(t => t[0] === tab) || tabs[0])[1]) + '</h1>' : '<h1 class="station-title">Life Skills</h1><div class="pill-tabs">' +
          tabs.map(t => '<button data-tab="' + t[0] + '" class="' + (t[0] === tab ? 'on' : '') + '">' + t[1] + '</button>').join('') + '</div>';
        if (tab === 'talk') {
          const p = prompts[promptIdx];
          const opts = (hash(dateKey(ctx.date) + promptIdx) % 2) ? [p[1], p[2]] : [p[2], p[1]];
          html += '<div class="card prompt-card" data-say="' + esc(p[0]) + '">' + esc(p[0]) + ' 🔊</div>' +
            '<p class="sub big-text">What is the good choice?</p>' +
            '<div class="grid ans-grid two">' + opts.map(o => '<button class="choice" data-ans="' + esc(o) + '" data-say="' + esc(o) + '">' + esc(o) + '</button>').join('') + '</div>' +
            '<div class="frame-list"><div class="frame">The good choice is <span class="blank"></span> because <span class="blank"></span>.</div></div>' +
            '<div class="row"><button class="btn big" id="another">Another one</button></div>';
        } else {
          if (!quiz) newQuiz();
          html += '<p class="sub big-text" data-say="' + esc(quiz.q) + '">' + esc(quiz.q) + ' 🔊</p>' + quiz.html +
            '<div class="grid ans-grid"' + (quiz.small ? ' style="--f:1"' : '') + '>' + quiz.choices.map(c =>
              '<button class="choice" data-ans="' + esc(c) + '"' + (quiz.small ? ' style="font-size:1.2em"' : '') + '>' + esc(c) + '</button>').join('') + '</div>' +
            '<div class="row"><button class="btn big" id="another">Another one</button></div>';
        }
        el.innerHTML = html;
        el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; ctx.day.tab = tab; ctx.saveDay(); quiz = null; draw(); });
        el.querySelector('#another').onclick = () => {
          if (tab === 'talk') promptIdx = (promptIdx + 1) % prompts.length; else newQuiz();
          draw();
        };
        el.querySelectorAll('[data-ans]').forEach(b => b.onclick = () => {
          if (tab === 'talk') {
            if (b.dataset.ans === prompts[promptIdx][1]) { b.classList.add('right'); ctx.speak('Yes. ' + b.dataset.ans + '.'); }
            else { b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); ctx.speak('Hmm. Is that a good choice?'); }
            return;
          }
          if (b.dataset.ans === quiz.answer) {
            b.classList.add('right'); ctx.speak('Yes! ' + quiz.say);
          } else {
            b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); ctx.speak('Try again');
          }
        });
      }
      draw();
    },
    settings(el, ctx) {
      const s = ctx.settings;
      const hide = s.hide || [];
      el.innerHTML =
        '<div class="field">Parts to show ' + [['clock', 'Clock'], ['money', 'Money'], ['signs', 'Signs'], ['talk', 'Good choice?']].map(t =>
          '<label class="field check"><input type="checkbox" data-part="' + t[0] + '" ' + (hide.includes(t[0]) ? '' : 'checked') + '> ' + t[1] + '</label>').join('') + '</div>' +
        '<label class="field">Clock level <select data-k="clockLevel"><option value="hour">Hours (3:00)</option><option value="half">Half hours (3:30)</option><option value="quarter">Quarter hours (3:15)</option><option value="five">Every 5 minutes (3:25)</option></select></label>' +
        '<label class="field">Money level <select data-k="moneyLevel"><option value="easy">Pennies, nickels, dimes</option><option value="coins">All coins</option><option value="bills">Dollar bills and coins</option></select></label>' +
        '<label class="field check"><input type="checkbox" data-k="coinNames" ' + (s.coinNames !== false ? 'checked' : '') + '> Show coin names</label>' +
        '<label class="field">"Good choice?" situations, one per line: <code>situation | good choice | not-so-good choice</code>' +
        '<textarea rows="8" data-k="prompts">' + esc(s.prompts || CHOICES.map(c => c.join(' | ')).join('\n')) + '</textarea></label>';
      el.querySelector('[data-k="clockLevel"]').value = s.clockLevel || 'half';
      el.querySelector('[data-k="moneyLevel"]').value = s.moneyLevel || 'coins';
      el.querySelectorAll('[data-part]').forEach(c => c.onchange = () => {
        s.hide = [...el.querySelectorAll('[data-part]')].filter(x => !x.checked).map(x => x.dataset.part);
        ctx.saveSettings();
      });
      el.querySelectorAll('[data-k]').forEach(i => {
        const k = i.dataset.k;
        if (i.type === 'checkbox') i.onchange = () => { s[k] = i.checked; ctx.saveSettings(); };
        else { const fn = () => { s[k] = i.value; ctx.saveSettings(); }; i.oninput = fn; i.onchange = fn; }
      });
    },
  });
})();
