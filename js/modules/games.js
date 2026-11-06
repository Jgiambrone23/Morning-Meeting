/* Station: Warm-up Game — six looking-and-talking games built on real photos from the
   picture library (js/library.js). Every game ends with one student saying a full sentence. */
(function () {
  const { esc, pick, shuffle, seeded, hash, dateKey, celebrate, pickImage, uid } = MM.util;
  const L = MM.lib;

  const GAMES = [
    { id: 'spot', title: 'Spot the Difference', icon: '🔍', frames: ['In this picture <span class="blank"></span>, but in that picture <span class="blank"></span>.', 'The <span class="blank"></span> is <span class="blank"></span>.'] },
    { id: 'missing', title: "What's Missing?", icon: '🫥', frames: ['The <span class="blank"></span> is missing.', 'I think the <span class="blank"></span> is gone because <span class="blank"></span>.'] },
    { id: 'changed', title: 'What Changed?', icon: '🔄', frames: ['The <span class="blank"></span> changed. Now it is <span class="blank"></span>.', 'Before, <span class="blank"></span>. Now, <span class="blank"></span>.'] },
    { id: 'ispy', title: 'I Spy', icon: '👀', frames: ['I spy a <span class="blank"></span>. It is <span class="blank"></span>.', 'I found the <span class="blank"></span> next to the <span class="blank"></span>.'] },
    { id: 'odd', title: 'Odd One Out', icon: '🧩', frames: ['The <span class="blank"></span> does not belong because <span class="blank"></span>.', 'These are all <span class="blank"></span>, but this one is <span class="blank"></span>.'] },
    { id: 'talk', title: 'Picture Talk', icon: '💬', frames: ['I see <span class="blank"></span>.', 'The <span class="blank"></span> is <span class="blank"></span>.', 'I think <span class="blank"></span> because <span class="blank"></span>.'] },
  ];
  const COUNTS = { 3: 6, 4: 6, 5: 9 };   // level -> cards on the board

  // A puzzle picture with both halves in one image -> two images (left/right, or top/bottom).
  function splitHalves(dataUrl) {
    return new Promise(resolve => {
      const im = new Image();
      im.onload = () => {
        const lr = im.width >= im.height * 1.25;
        const w = lr ? Math.floor(im.width / 2) : im.width, h = lr ? im.height : Math.floor(im.height / 2);
        const cut = (sx, sy) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, sx, sy, w, h, 0, 0, w, h); return c.toDataURL('image/jpeg', 0.88); };
        resolve(lr ? [cut(0, 0), cut(im.width - w, 0)] : [cut(0, 0), cut(0, im.height - h)]);
      };
      im.src = dataUrl;
    });
  }

  MM.register({
    games: GAMES,
    id: 'games',
    hidden: true,            // shown inside the Activity station
    title: 'Looking games',
    icon: '🔍',
    description: 'Spot the difference, what\'s missing, what changed, I spy, odd one out, picture talk — with real photos. One student at a time says a full sentence.',
    defaultOn: true,
    render(el, ctx) {
      const s = ctx.settings, day = ctx.day;
      const enabled = GAMES.filter(g => !(s.hide || []).includes(g.id));
      const today = dateKey(ctx.date);
      const dayRnd = () => seeded(hash(today + (day.round || 0)));
      let game = day.game && enabled.some(g => g.id === day.game) ? day.game : null;
      if (!game) game = s.mode === 'pick' && enabled.some(g => g.id === s.pickGame) ? s.pickGame : enabled[hash(today) % enabled.length].id;
      const names = ctx.peopleNames();
      let turnIdx = day.turn || 0;
      const level = +(s.level || 4);
      const showLabels = s.labels !== false;

      function header(g) {
        const who = names.length ? names[turnIdx % names.length] : null;
        return '<div class="game-bar"><h1>' + esc(g.title) + '</h1>' +
          '<div class="turn">' + (who ? 'Whose turn? <span class="who" data-say="' + esc(who + ', it is your turn') + '">' + esc(who) + '</span><button class="btn" id="nextTurn">Next student ▶</button>' : '') +
          (ctx.embedded ? '' : '<select id="gamePick" aria-label="Choose a game">' + enabled.map(x => '<option value="' + x.id + '"' + (x.id === g.id ? ' selected' : '') + '>' + esc(x.title) + '</option>').join('') + '</select>') +
          '<button class="btn" id="newRound">New pictures</button></div></div>';
      }
      function frames(g) { return '<div class="frame-list">' + g.frames.map(f => '<div class="frame">' + f + '</div>').join('') + '</div>'; }
      function wire() {
        const nt = el.querySelector('#nextTurn'); if (nt) nt.onclick = () => { turnIdx++; day.turn = turnIdx; ctx.saveDay(); draw(); };
        const gp = el.querySelector('#gamePick'); if (gp) gp.onchange = e => { game = e.target.value; day.game = game; day.round = 0; ctx.saveDay(); draw(); };
        el.querySelector('#newRound').onclick = () => { day.round = (day.round || 0) + 1; ctx.saveDay(); draw(); };
      }
      function needPhotos(g, min) {
        if (L.readyItems().length >= (min || 6)) return false;
        el.innerHTML = header(g) + '<div class="empty">This game needs photos first.<br><small>Teacher → Warm Up → Change → <b>Download</b>. It takes a minute, once per computer.</small></div>';
        wire(); return true;
      }

      // ---- photo cards: a board is a list of {id, item, hidden, flip, gray, size} ----
      function makeBoard(rnd, n) {
        return shuffle(L.readyItems(), rnd).slice(0, n).map((item, i) => ({ id: 'c' + i, item, hidden: false, flip: false, gray: false, size: 1 }));
      }
      function cardHtml(c) {
        if (c.hidden) return '<div class="pcard blank" data-card="' + c.id + '"></div>';
        const style = 'transform:' + (c.flip ? 'scaleX(-1) ' : '') + (c.size !== 1 ? 'scale(' + c.size + ')' : '') + ';' + (c.gray ? 'filter:grayscale(1);' : '');
        return '<div class="pcard" data-card="' + c.id + '"><div class="pimg"><img alt="" data-lib="' + c.item.key + '" style="' + style + '"></div>' +
          (showLabels ? '<div class="plabel">' + esc(c.item.name) + '</div>' : '') + '</div>';
      }
      function boardHtml(board, id, cols) {
        return '<div class="pboard" id="' + id + '" style="--cols:' + cols + '">' + board.map(c => cardHtml(c)).join('') + '</div>';
      }
      function fillImages() {
        el.querySelectorAll('img[data-lib]').forEach(im => L.get(im.dataset.lib).then(u => { if (u) im.src = u; }));
      }
      function cols(n) { return n <= 6 ? 3 : n <= 8 ? 4 : 3; }
      function changeBoard(board, n, rnd) {
        const copy = board.map(c => Object.assign({}, c));
        const changes = [];
        const used = new Set(copy.map(c => c.item.key));
        for (const c of shuffle(copy, rnd)) {
          if (changes.length >= n) break;
          const a = 'the ' + c.item.name;
          const type = pick(['hide', 'flip', 'gray', 'size', 'swap', 'swap'], rnd);
          if (type === 'hide') { c.hidden = true; changes.push({ id: c.id, text: a + ' is missing' }); }
          else if (type === 'flip') { c.flip = true; changes.push({ id: c.id, text: a + ' is facing the other way' }); }
          else if (type === 'gray') { c.gray = true; changes.push({ id: c.id, text: a + ' lost its color' }); }
          else if (type === 'size') { c.size = rnd() < 0.5 ? 0.6 : 1.3; changes.push({ id: c.id, text: a + ' is ' + (c.size > 1 ? 'bigger' : 'smaller') }); }
          else {
            const other = pick(L.readyItems().filter(it => !used.has(it.key)), rnd); if (!other) continue;
            used.add(other.key); changes.push({ id: c.id, text: a + ' turned into a ' + other.name }); c.item = other;
          }
        }
        return { board: copy, changes };
      }
      function mark(cardEl, cls) { cardEl.classList.add(cls || 'found'); }
      function flashWrong(x) { x.classList.add('wrong'); setTimeout(() => x.classList.remove('wrong'), 400); }

      // ---------- Spot the Difference ----------
      async function drawSpot(g) {
        const rnd = dayRnd();
        if (s.ownPuzzles && s.ownPuzzles.length && (s.ownOnly || rnd() < 0.4)) return drawOwnSpot(g, rnd);
        if (needPhotos(g)) return;
        const n = COUNTS[level] || 6;
        const base = makeBoard(rnd, n);
        const { board: changed, changes } = changeBoard(base, level, rnd);
        const found = new Set();
        el.innerHTML = header(g) +
          '<p class="sub">Find <b>' + changes.length + '</b> differences. Tap one when you see it, then tell us in a sentence.</p>' +
          '<div class="pair">' + boardHtml(base, 'bA', cols(n)) + boardHtml(changed, 'bB', cols(n)) + '</div>' +
          '<div class="row"><div class="dots">' + changes.map(() => '<span></span>').join('') + '</div><button class="btn" id="reveal">Show answers</button></div>' + frames(g);
        wire(); fillImages();
        el.querySelectorAll('[data-card]').forEach(card => card.onclick = () => {
          const id = card.dataset.card;
          const c = changes.find(x => x.id === id);
          if (c && !found.has(id)) {
            found.add(id);
            el.querySelectorAll('[data-card="' + id + '"]').forEach(x => mark(x));
            el.querySelectorAll('.dots span')[found.size - 1].classList.add('on');
            ctx.speak('You found one. ' + c.text + '.');
            if (found.size === changes.length) setTimeout(() => celebrate('All found'), 500);
          } else if (!c) flashWrong(card);
        });
        el.querySelector('#reveal').onclick = () => changes.forEach(c => { if (!found.has(c.id)) el.querySelectorAll('[data-card="' + c.id + '"]').forEach(x => mark(x, 'answer')); });
      }

      async function drawOwnSpot(g, rnd) {
        const pz = pick(s.ownPuzzles, rnd);
        const [a, b] = await Promise.all([MM.img.get(pz.a), MM.img.get(pz.b)]);
        const found = new Set();
        el.innerHTML = header(g) +
          '<p class="sub">Find <b>' + pz.spots.length + '</b> differences in ' + esc(pz.name || 'this puzzle') + '.</p>' +
          '<div class="pair"><div class="pane" id="pA"><img src="' + a + '" alt=""></div><div class="pane" id="pB"><img src="' + b + '" alt=""></div></div>' +
          '<div class="row"><div class="dots">' + pz.spots.map(() => '<span></span>').join('') + '</div><button class="btn" id="reveal">Show answers</button></div>' + frames(g);
        wire();
        const panes = [el.querySelector('#pA'), el.querySelector('#pB')];
        const dot = (pane, sp, cls) => { const m = document.createElement('div'); m.className = 'mark ' + (cls || ''); m.style.left = sp.x + '%'; m.style.top = sp.y + '%'; m.style.width = '11%'; pane.appendChild(m); };
        panes.forEach(pane => pane.addEventListener('click', e => {
          const r = pane.getBoundingClientRect(); const p = { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 };
          const i = pz.spots.findIndex(sp => Math.hypot(sp.x - p.x, (sp.y - p.y) * 0.75) < 9);
          if (i >= 0 && !found.has(i)) {
            found.add(i); panes.forEach(pn => dot(pn, pz.spots[i]));
            el.querySelectorAll('.dots span')[found.size - 1].classList.add('on'); ctx.speak('You found one.');
            if (found.size === pz.spots.length) setTimeout(() => celebrate('All found'), 500);
          } else if (i < 0) { const m = document.createElement('div'); m.className = 'miss'; m.textContent = '✕'; m.style.left = p.x + '%'; m.style.top = p.y + '%'; pane.appendChild(m); setTimeout(() => m.remove(), 800); }
        }));
        el.querySelector('#reveal').onclick = () => pz.spots.forEach((sp, i) => { if (!found.has(i)) panes.forEach(pn => dot(pn, sp, 'answer')); });
      }

      // ---------- What's Missing / What Changed (look → eyes closed → guess) ----------
      function drawLookGame(g, kind) {
        if (needPhotos(g)) return;
        const rnd = dayRnd();
        const n = COUNTS[level] || 6;
        const base = makeBoard(rnd, n);
        let after, change;
        if (kind === 'missing') { const gone = pick(base, rnd); after = base.map(c => Object.assign({}, c, { hidden: c.id === gone.id })); change = { id: gone.id, text: 'the ' + gone.item.name + ' is missing' }; }
        else { const r = changeBoard(base, 1, rnd); after = r.board; change = r.changes[0]; }
        let phase = 'look';
        function show() {
          el.innerHTML = header(g) +
            '<p class="sub big-text">' + (phase === 'look' ? 'Look carefully at every picture.' : phase === 'cover' ? 'Close your eyes.' : kind === 'missing' ? 'What is missing?' : 'Something changed. Tap it.') + '</p>' +
            '<div class="single">' + boardHtml(phase === 'look' ? base : after, 'b1', cols(n)) + (phase === 'cover' ? '<div class="cover">Eyes closed</div>' : '') + '</div>' +
            (phase === 'guess' && kind === 'missing' ? '<div class="findlist">' + shuffle(base, rnd).map(c => '<button class="chip" data-name="' + c.id + '">' + esc(c.item.name) + '</button>').join('') + '</div>' : '') +
            '<div class="row">' + (phase === 'look' ? '<button class="btn big primary" id="go">Ready — close your eyes</button>' : phase === 'cover' ? '<button class="btn big primary" id="go">Open your eyes</button>' : '<button class="btn" id="reveal">Show answer</button>') + '</div>' +
            (phase === 'guess' ? frames(g) : '');
          wire(); fillImages();
          const go = el.querySelector('#go');
          if (go) go.onclick = () => { phase = phase === 'look' ? 'cover' : 'guess'; if (phase === 'cover') ctx.speak('Close your eyes'); show(); };
          if (phase === 'guess') {
            const right = () => { el.querySelectorAll('[data-card="' + change.id + '"]').forEach(x => mark(x)); celebrate('Yes — ' + change.text); };
            el.querySelectorAll('[data-name]').forEach(b => b.onclick = () => { if (b.dataset.name === change.id) { b.classList.add('done'); right(); } else { flashWrong(b); ctx.speak('Look again'); } });
            el.querySelectorAll('[data-card]').forEach(card => card.onclick = () => { if (card.dataset.card === change.id) right(); else flashWrong(card); });
            el.querySelector('#reveal').onclick = () => { el.querySelectorAll('[data-card="' + change.id + '"]').forEach(x => mark(x, 'answer')); ctx.speak(change.text); };
          }
        }
        show();
      }

      // ---------- I Spy ----------
      function drawISpy(g) {
        if (needPhotos(g)) return;
        const rnd = dayRnd();
        const n = COUNTS[level] || 6;
        const board = makeBoard(rnd, n);
        const targets = shuffle(board, rnd).slice(0, Math.min(level, board.length));
        let cur = 0;
        const clueFor = c => {
          const kind = s.spyClue || 'color';
          if (kind === 'name' || !c.item.color) return 'I spy a ' + c.item.name + '.';
          if (kind === 'group') return 'I spy something from the group: ' + c.item.group + '.';
          return 'I spy something ' + c.item.color + '.';
        };
        function show() {
          const t = targets[cur]; const clue = clueFor(t);
          el.innerHTML = header(g) +
            '<div class="frame" data-say="' + esc(clue) + '">' + esc(clue) + ' 🔊</div>' +
            '<div class="single">' + boardHtml(board, 'b1', cols(n)) + '</div>' +
            '<div class="row"><div class="dots">' + targets.map((_, i) => '<span class="' + (i < cur ? 'on' : '') + '"></span>').join('') + '</div><button class="btn" id="hint">Hint: say the name</button></div>' + frames(g);
          wire(); fillImages();
          ctx.speak(clue);
          el.querySelector('#hint').onclick = () => ctx.speak('It is the ' + t.item.name);
          el.querySelectorAll('[data-card]').forEach(card => card.onclick = () => {
            if (card.dataset.card === t.id) {
              mark(card); ctx.speak('Yes, the ' + t.item.name + '.'); cur++;
              if (cur >= targets.length) setTimeout(() => celebrate('All found'), 500); else setTimeout(show, 1200);
            } else flashWrong(card);
          });
        }
        show();
      }

      // ---------- Odd One Out ----------
      function drawOdd(g) {
        if (needPhotos(g, 8)) return;
        const rnd = dayRnd();
        const ready = L.readyItems();
        const groups = {};
        ready.forEach(it => { (groups[it.group] = groups[it.group] || []).push(it); });
        const good = Object.keys(groups).filter(k => groups[k].length >= 3);
        if (!good.length) return needPhotos(g, 999);
        const grp = pick(good, rnd);
        const items = shuffle(groups[grp], rnd).slice(0, 3);
        const odd = pick(ready.filter(it => it.group !== grp), rnd);
        const board = shuffle(items.concat(odd), rnd).map((item, i) => ({ id: 'c' + i, item, hidden: false, flip: false, gray: false, size: 1 }));
        el.innerHTML = header(g) + '<p class="sub big-text">Which one does not belong?</p>' +
          '<div class="single">' + boardHtml(board, 'b1', 4) + '</div>' + frames(g);
        wire(); fillImages();
        el.querySelectorAll('[data-card]').forEach(card => card.onclick = () => {
          const c = board.find(x => x.id === card.dataset.card);
          if (c.item === odd) { mark(card); celebrate('Yes. The others are all ' + grp + '.'); }
          else { flashWrong(card); ctx.speak('Look again.'); }
        });
      }

      // ---------- Picture Talk: one question at a time, with its own sentence starter ----------
      async function drawTalk(g) {
        const rnd = dayRnd();
        const own = s.talkPhotos || [];
        const scenes = L.readyScenes();
        let url = null;
        if (own.length && (s.talkOwnOnly || !scenes.length || rnd() < 0.4)) { const ph = pick(own, rnd); url = await MM.img.get(ph.id); }
        else if (scenes.length) { const sc = pick(scenes, rnd); url = await L.get(sc.key); }
        const QS = [
          ['What do you see?', 'I see <span class="blank"></span>.'],
          ['Where is this?', 'This is <span class="blank"></span>.'],
          ['What is happening?', 'The <span class="blank"></span> is <span class="blank"></span>.'],
          ['How do they feel?', 'They feel <span class="blank"></span> because <span class="blank"></span>.'],
          ['What might happen next?', 'Next, <span class="blank"></span>.'],
          ['What would you do there?', 'I would <span class="blank"></span>.'],
          ['What colors do you see?', 'I see something <span class="blank"></span>.'],
          ['Have you been somewhere like this?', 'I went to <span class="blank"></span>.'],
        ];
        const qs = shuffle(QS, rnd).slice(0, 4);
        day.talkQ = day.talkQ || 0;
        day.talkAns = day.talkAns || {};
        function show() {
          const i = day.talkQ % qs.length; const q = qs[i];
          const answers = day.talkAns[i] || [];
          el.innerHTML = header(g) +
            (url ? '<div class="single pane talk"><img src="' + url + '" alt=""></div>' : '<div class="empty">No scene photos yet.<br><small>Teacher → Warm Up → Change → scene photos → <b>Download</b>, or add your own photos.</small></div>') +
            '<div class="talk-q"><div class="talk-question" data-say="' + esc(q[0]) + '">' + esc(q[0]) + ' 🔊</div>' +
            '<div class="frame">' + q[1] + '</div>' +
            (answers.length ? '<div class="answers">' + answers.map(a => '<div class="answer has">' + (a.kind === 'text' ? '<span class="answer-text">' + esc(a.text) + '</span>' : '<img src="' + a.url + '" alt="">') + '</div>').join('') + '</div>' : '') +
            '<div class="row"><button class="btn" id="writeIt">Write the answer</button><div class="dots">' + qs.map((_, j) => '<span class="' + (j < i ? 'on' : j === i ? 'now' : '') + '"></span>').join('') + '</div>' +
            '<button class="btn big primary" id="nextQ">' + (i === qs.length - 1 ? 'Start over' : 'Next question ▶') + '</button></div></div>';
          wire();
          ctx.speak(q[0]);
          el.querySelector('#nextQ').onclick = () => { day.talkQ = i === qs.length - 1 ? 0 : i + 1; if (day.talkQ === 0) day.talkAns = {}; ctx.saveDay(); show(); };
          el.querySelector('#writeIt').onclick = async () => { const a = await MM.util.writePad({ title: q[0] }); if (!a) return; (day.talkAns[i] = day.talkAns[i] || []).push(a); ctx.saveDay(); show(); };
        }
        show();
      }

      function draw() {
        const g = GAMES.find(x => x.id === game) || GAMES[0];
        if (g.id === 'spot') drawSpot(g); else if (g.id === 'missing') drawLookGame(g, 'missing'); else if (g.id === 'changed') drawLookGame(g, 'changed');
        else if (g.id === 'ispy') drawISpy(g); else if (g.id === 'odd') drawOdd(g); else drawTalk(g);
      }
      draw();
    },

    settings(el, ctx) {
      const s = ctx.settings;
      const hide = s.hide || [];
      function draw() {
        el.innerHTML =
          '<div class="field">Looking games to include ' + GAMES.map(g => '<label class="field check"><input type="checkbox" data-g="' + g.id + '" ' + (hide.includes(g.id) ? '' : 'checked') + '> ' + esc(g.title) + '</label>').join('') + '</div>' +
          '<label class="field">How hard? <select id="level"><option value="3">Easy (6 pictures, 3 differences)</option><option value="4">Medium (6 pictures, 4 differences)</option><option value="5">Hard (9 pictures, 5 differences)</option></select></label>' +
          '<label class="field check"><input type="checkbox" id="labels" ' + (s.labels !== false ? 'checked' : '') + '> Show the word under each picture</label>' +
          '<label class="field">I Spy clues <select id="spyClue"><option value="color">By color ("I spy something red")</option><option value="name">By name ("I spy a dog")</option><option value="group">By group ("something from the group: animals")</option></select></label>' +
          '<div id="libObjects"></div><div id="libScenes"></div>' +
          '<h4>My own Spot the Difference puzzles</h4><p class="hint">Save a puzzle picture (the kind with both halves side by side, or two separate pictures), add it, then tap each difference once to mark it. From then on it is a tap-to-find game.</p>' +
          '<div class="upload-list">' + (s.ownPuzzles || []).map((p, i) => '<div class="item"><img data-thumb="' + p.b + '" alt=""><span><b>' + esc(p.name) + '</b> · ' + p.spots.length + ' marked</span><button class="btn" data-mark="' + i + '">Mark differences</button><button class="btn danger" data-del="' + i + '">Delete</button></div>').join('') + '</div>' +
          '<button class="btn" id="addPuzzle">＋ Add a puzzle (2 pictures)</button> ' +
          '<label class="field check"><input type="checkbox" id="ownOnly" ' + (s.ownOnly ? 'checked' : '') + '> Use only my own puzzles</label>' +
          '<h4>My own Picture Talk photos</h4><div class="upload-list">' + (s.talkPhotos || []).map((p, i) => '<div class="item"><img data-thumb="' + p.id + '" alt=""><span>' + esc(p.name) + '</span><button class="btn danger" data-delt="' + i + '">Delete</button></div>').join('') + '</div>' +
          '<button class="btn" id="addTalk">＋ Add a photo</button> ' +
          '<label class="field check"><input type="checkbox" id="talkOwnOnly" ' + (s.talkOwnOnly ? 'checked' : '') + '> Use only my photos</label>' +
          '<div id="marker"></div>';
        el.querySelector('#level').value = String(s.level || 4);
        el.querySelector('#spyClue').value = s.spyClue || 'color';
        L.panel(el.querySelector('#libObjects')); L.panel(el.querySelector('#libScenes'), { scenes: true });
        el.querySelectorAll('[data-thumb]').forEach(im => MM.img.get(im.dataset.thumb).then(u => { if (u) im.src = u; }));
        el.querySelectorAll('[data-g]').forEach(c => c.onchange = () => { s.hide = [...el.querySelectorAll('[data-g]')].filter(x => !x.checked).map(x => x.dataset.g); ctx.saveSettings(); });
        el.querySelector('#level').onchange = e => { s.level = +e.target.value; ctx.saveSettings(); };
        el.querySelector('#labels').onchange = e => { s.labels = e.target.checked; ctx.saveSettings(); };
        el.querySelector('#spyClue').onchange = e => { s.spyClue = e.target.value; ctx.saveSettings(); };
        el.querySelector('#ownOnly').onchange = e => { s.ownOnly = e.target.checked; ctx.saveSettings(); };
        el.querySelector('#talkOwnOnly').onchange = e => { s.talkOwnOnly = e.target.checked; ctx.saveSettings(); };
        el.querySelector('#addPuzzle').onclick = async () => {
          const one = confirm('Is the puzzle ONE picture with both halves side by side (OK), or TWO separate pictures (Cancel)?');
          let a, b;
          if (one) {
            const p = await pickImage(2400); if (!p) return;
            [a, b] = await splitHalves(p.url);
          } else {
            alert('First choose the ORIGINAL picture.');
            const pa = await pickImage(); if (!pa) return;
            alert('Now choose the CHANGED picture.');
            const pb = await pickImage(); if (!pb) return;
            a = pa.url; b = pb.url;
          }
          const id = uid();
          await MM.img.put('pz-' + id + '-a', a); await MM.img.put('pz-' + id + '-b', b);
          s.ownPuzzles = (s.ownPuzzles || []).concat({ id, name: 'Puzzle ' + ((s.ownPuzzles || []).length + 1), a: 'pz-' + id + '-a', b: 'pz-' + id + '-b', spots: [] });
          ctx.saveSettings(); draw(); mark(s.ownPuzzles.length - 1);
        };
        el.querySelector('#addTalk').onclick = async () => {
          const p = await pickImage(); if (!p) return;
          const id = 'talk-' + uid(); await MM.img.put(id, p.url);
          s.talkPhotos = (s.talkPhotos || []).concat({ id, name: 'Photo ' + ((s.talkPhotos || []).length + 1) });
          ctx.saveSettings(); draw();
        };
        el.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
          const p = s.ownPuzzles[+b.dataset.del];
          if (!confirm('Delete ' + p.name + '?')) return;
          await MM.img.del(p.a); await MM.img.del(p.b);
          s.ownPuzzles.splice(+b.dataset.del, 1); ctx.saveSettings(); draw();
        });
        el.querySelectorAll('[data-delt]').forEach(b => b.onclick = async () => {
          const p = s.talkPhotos[+b.dataset.delt];
          await MM.img.del(p.id); s.talkPhotos.splice(+b.dataset.delt, 1); ctx.saveSettings(); draw();
        });
        el.querySelectorAll('[data-mark]').forEach(b => b.onclick = () => mark(+b.dataset.mark));
      }
      async function mark(i) {
        const p = s.ownPuzzles[i];
        const url = await MM.img.get(p.b);
        const host = el.querySelector('#marker');
        host.innerHTML = '<h4>Mark the differences in "' + esc(p.name) + '"</h4><p class="hint">Tap each difference on the picture. Tap a circle to remove it.</p>' +
          '<label class="field">Name <input id="pzName" value="' + esc(p.name) + '"></label>' +
          '<div class="pane" style="cursor:crosshair"><img src="' + url + '" alt=""></div>' +
          '<p><b><span id="cnt">' + p.spots.length + '</span> marked</b> <button class="btn primary" id="markDone">Done marking</button></p>';
        host.scrollIntoView({ behavior: 'smooth' });
        const pane = host.querySelector('.pane');
        function redraw() {
          pane.querySelectorAll('.mark').forEach(m => m.remove());
          p.spots.forEach(sp => {
            const m = document.createElement('div'); m.className = 'mark'; m.style.left = sp.x + '%'; m.style.top = sp.y + '%'; m.style.width = '9%';
            m.style.pointerEvents = 'auto'; m.style.cursor = 'pointer';
            m.onclick = e => { e.stopPropagation(); p.spots.splice(p.spots.indexOf(sp), 1); ctx.saveSettings(); redraw(); };
            pane.appendChild(m);
          });
          host.querySelector('#cnt').textContent = p.spots.length;
        }
        pane.onclick = e => { const r = pane.getBoundingClientRect(); p.spots.push({ x: +((e.clientX - r.left) / r.width * 100).toFixed(1), y: +((e.clientY - r.top) / r.height * 100).toFixed(1) }); ctx.saveSettings(); redraw(); };
        host.querySelector('#pzName').oninput = e => { p.name = e.target.value; ctx.saveSettings(); };
        host.querySelector('#markDone').onclick = () => { host.innerHTML = ''; draw(); };
        redraw();
      }
      draw();
    },
  });
})();
