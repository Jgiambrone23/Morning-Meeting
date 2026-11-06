/* Word games and more life skills, shown inside the Activity station.
   Rhyme Time, Riddles, Name 3, Opposites · Steps in Order, What Do You Need? */
(function () {
  const { esc, shuffle, pick, seeded, hash, dateKey, celebrate, parseLines, writePad } = MM.util;
  const L = MM.lib;

  const RHYMES = [
    ['cat', ['hat', 'bat', 'mat'], ['dog', 'sun', 'cup']], ['dog', ['log', 'frog', 'fog'], ['cat', 'bed', 'car']],
    ['sun', ['run', 'fun', 'bun'], ['moon', 'hat', 'ball']], ['car', ['star', 'jar', 'far'], ['bus', 'tree', 'pen']],
    ['bed', ['red', 'head', 'bread'], ['chair', 'dog', 'cup']], ['hat', ['cat', 'bat', 'sat'], ['shoe', 'sun', 'pig']],
    ['pig', ['big', 'dig', 'wig'], ['cow', 'hen', 'cat']], ['ball', ['tall', 'wall', 'fall'], ['bat', 'sock', 'tree']],
    ['book', ['look', 'cook', 'hook'], ['pen', 'bag', 'map']], ['tree', ['bee', 'see', 'key'], ['leaf', 'log', 'sun']],
    ['cup', ['up', 'pup'], ['plate', 'milk', 'fork']], ['fish', ['dish', 'wish'], ['boat', 'frog', 'sea']],
    ['key', ['bee', 'tree', 'three'], ['lock', 'door', 'car']], ['sock', ['rock', 'lock', 'clock'], ['shoe', 'foot', 'hat']],
    ['bread', ['bed', 'red', 'head'], ['jam', 'cup', 'egg']], ['train', ['rain', 'plane', 'chain'], ['bus', 'track', 'car']],
    ['clock', ['sock', 'rock', 'block'], ['time', 'watch', 'bell']], ['sheep', ['sleep', 'jeep', 'deep'], ['cow', 'farm', 'wool']],
    ['spoon', ['moon', 'noon', 'balloon'], ['fork', 'soup', 'bowl']], ['shoes', ['blues', 'news', 'twos'], ['feet', 'socks', 'run']],
  ];
  const RIDDLES = [
    ['I am red. I am round. You can eat me.', 'apple'], ['I am yellow. I am long. Monkeys like me.', 'banana'],
    ['I am big and yellow. I take kids to school.', 'school bus'], ['I have four legs. I bark. I like walks.', 'dog'],
    ['I keep you dry when it rains.', 'umbrella'], ['I tell you what time it is.', 'clock'],
    ['You use me to clean your teeth.', 'toothbrush'], ['I have pages. You read me.', 'book'],
    ['I carry your things to school on your back.', 'backpack'], ['I have two wheels. You pedal me.', 'bicycle'],
    ['I am orange. I am long. Rabbits love me.', 'carrot'], ['I say moo. I give milk.', 'cow'],
    ['I keep food cold.', 'refrigerator'], ['You sleep in me at night.', 'bed'],
    ['I cut paper. Be careful with me.', 'scissors'], ['You wear me on your feet inside your shoes.', 'socks'],
    ['I am hot. I am in the sky in the daytime.', 'sun'], ['I am white and cold. I fall in winter.', 'snowman'],
    ['You eat soup with me.', 'spoon'], ['I open a lock.', 'key'], ['You wash your hands with me.', 'soap'],
    ['I am round. You kick me.', 'soccer ball'], ['I make bread warm and crunchy.', 'toaster'], ['You sit on me.', 'chair'],
  ];
  const NAME3 = [
    'things that are red', 'things that are cold', 'things in a kitchen', 'things you wear on your feet', 'animals on a farm',
    'things you take to school', 'things that are round', 'things you can drink', 'things in the sky', 'things you do in the morning',
    'things that are loud', 'things that are soft', 'foods you eat for breakfast', 'things with wheels', 'things that are hot',
    'things in a bathroom', 'animals that live in water', 'things you can read', 'things that are green', 'places in a school',
    'things you do before bed', 'jobs people have', 'things you can buy at a store', 'ways to be kind', 'things that fly',
  ];
  const OPPOSITES = [
    ['hot', 'cold'], ['big', 'small'], ['up', 'down'], ['in', 'out'], ['wet', 'dry'], ['fast', 'slow'], ['happy', 'sad'], ['open', 'closed'],
    ['on', 'off'], ['day', 'night'], ['loud', 'quiet'], ['full', 'empty'], ['clean', 'dirty'], ['push', 'pull'], ['stop', 'go'], ['old', 'new'],
    ['hard', 'soft'], ['tall', 'short'], ['light', 'dark'], ['first', 'last'], ['over', 'under'], ['near', 'far'], ['early', 'late'], ['heavy', 'light'],
  ];
  const STEPS = [
    ['Wash your hands', ['Turn on the water', 'Get soap', 'Scrub for 20 seconds', 'Rinse', 'Dry your hands']],
    ['Brush your teeth', ['Put toothpaste on the brush', 'Brush all your teeth', 'Spit', 'Rinse your mouth', 'Put the brush away']],
    ['Make a sandwich', ['Get two slices of bread', 'Spread the filling', 'Put the slices together', 'Cut it in half', 'Eat it']],
    ['Get ready for bed', ['Put on pajamas', 'Brush your teeth', 'Use the bathroom', 'Get into bed', 'Turn off the light']],
    ['Cross the street', ['Stop at the curb', 'Look left', 'Look right', 'Look left again', 'Walk across']],
    ['Make cereal', ['Get a bowl', 'Pour the cereal', 'Pour the milk', 'Get a spoon', 'Eat']],
    ['Get ready for school', ['Get dressed', 'Eat breakfast', 'Pack your backpack', 'Put on shoes', 'Go to the bus']],
    ['Wash the dishes', ['Scrape the plate', 'Wash with soap', 'Rinse', 'Dry', 'Put away']],
    ['Do the laundry', ['Put clothes in the washer', 'Add soap', 'Start the washer', 'Move clothes to the dryer', 'Fold the clothes']],
    ['Buy something at a store', ['Pick what you want', 'Go to the checkout', 'Wait in line', 'Pay', 'Take your bag and receipt']],
  ];
  const NEED = [
    ['It is raining.', 'umbrella'], ['Your hands are dirty.', 'soap'], ['You want to write.', 'pencil'], ['Your teeth need cleaning.', 'toothbrush'],
    ['You want to eat soup.', 'spoon'], ['You want a drink of water.', 'cup'], ['The door is locked.', 'key'], ['You need to call someone.', 'phone'],
    ['You want to cut paper.', 'scissors'], ['You are going to school.', 'backpack'], ['It is cold outside.', 'jacket'], ['Your hands are cold.', 'gloves'],
    ['The sun is in your eyes.', 'hat'], ['You want to read a story.', 'book'], ['You want to stick paper together.', 'glue'],
    ['You want to eat dinner.', 'plate'], ['You want to know the time.', 'clock'], ['You want toast.', 'toaster'], ['Your feet are cold.', 'socks'],
    ['You want to ride somewhere.', 'bicycle'], ['You want to kick something.', 'soccer ball'], ['You want to sit down.', 'chair'],
  ];

  const RATHER = [
    ['be a cat', 'be a dog'], ['eat pizza every day', 'eat ice cream every day'], ['go to the beach', 'go to the snow'], ['be very tall', 'be very small'],
    ['fly like a bird', 'swim like a fish'], ['have a pet rabbit', 'have a pet turtle'], ['ride a bike', 'ride a scooter'], ['play outside', 'watch a movie'],
    ['be super strong', 'be super fast'], ['live in a treehouse', 'live on a boat'], ['eat only cold food', 'eat only hot food'], ['sing in front of the class', 'dance in front of the class'],
    ['have a day with no homework', 'have a day with extra recess'], ['visit a farm', 'visit a zoo'], ['wear a hat every day', 'wear boots every day'], ['drink juice', 'drink milk'],
  ];
  const FINISH = [
    'When I wake up, I ___.', 'My favorite food is ___ because ___.', 'If I had a dog, I would ___.', 'On the weekend, I like to ___.', 'I feel happy when ___.',
    'Something I am good at is ___.', 'When it rains, I ___.', 'I help at home by ___.', 'My friend is ___.', 'The best part of school is ___.',
    'If I were a teacher, I would ___.', 'When I grow up, I want to ___.', 'A good friend always ___.', 'Before I go to bed, I ___.', 'Today I will try to ___.',
    'My favorite place is ___ because ___.', 'When I am sad, I ___.', 'The weather today is ___, so I ___.',
  ];
  const SILLY = [
    ['The dog drove the bus to school.', false], ['The sun came up this morning.', true], ['I put my shoes on my ears.', false], ['We eat lunch at noon.', true],
    ['The fish climbed the tree.', false], ['My coat keeps me warm.', true], ['Snow is hot.', false], ['The cat said hello to me.', false],
    ['We brush our teeth before bed.', true], ['I ate a chair for breakfast.', false], ['Birds fly in the sky.', true], ['The car swam across the pool.', false],
    ['Apples grow on trees.', true], ['I wear my umbrella on my feet.', false], ['The teacher writes on the board.', true], ['The moon comes out at night.', true],
    ['My sandwich is reading a book.', false], ['We wash our hands with soap.', true], ['The bus has square wheels.', false], ['Ice is cold.', true],
  ];
  const LISTEN = [
    'Touch your head, then clap two times.', 'Stand up, then turn around.', 'Point to the door, then point to the window.', 'Clap three times, then sit down.',
    'Touch your nose, then touch your toes.', 'Put your hands up, then put your hands on your knees.', 'Stomp your feet, then say your name.', 'Wave to a friend, then fold your arms.',
    'Blink two times, then give a thumbs up.', 'Touch your shoulders, then touch your ears.', 'Jump one time, then freeze.', 'Pat your head, then rub your tummy.',
    'Look up, then look down.', 'Tap the table two times, then put your hands in your lap.', 'Say "good morning", then smile.', 'Hold up three fingers, then hold up one.',
  ];

  const TABS = [
    ['rhyme', 'Rhyme Time', '', 'word'], ['riddle', 'Riddles', '', 'word'], ['name3', 'Name 3', '', 'word'], ['opposite', 'Opposites', '', 'word'],
    ['rather', 'Would You Rather', '', 'word'], ['finish', 'Finish the Sentence', '', 'word'], ['silly', 'Does It Make Sense?', '', 'word'],
    ['same', 'Same or Different', '', 'word'], ['listen', 'Listen and Do', '', 'life'],
    ['steps', 'Steps in Order', '', 'life'], ['need', 'What Do You Need?', '', 'life'],
  ];
  const itemFor = name => L.ITEMS.find(i => i.name === name);
  const photoCard = (item, extra) => '<div class="pcard" ' + (extra || '') + '><div class="pimg"><img alt="" data-lib="' + item.key + '"></div><div class="plabel">' + esc(item.name) + '</div></div>';

  MM.register({
    id: 'extras',
    hidden: true,
    tabs: TABS,
    title: 'Word games',
    icon: '🔤',
    description: 'Rhyme Time, Riddles, Name 3, Opposites, Would You Rather, Finish the Sentence, Does It Make Sense?, Same or Different, Listen and Do, Steps in Order, What Do You Need?',
    render(el, ctx) {
      const s = ctx.settings, day = ctx.day;
      const tabs = TABS.filter(t => !(s.hide || []).includes(t[0]));
      let tab = day.tab && tabs.some(t => t[0] === day.tab) ? day.tab : tabs[hash(dateKey(ctx.date)) % tabs.length][0];
      let round = day.round || 0;
      const rnd = () => seeded(hash(dateKey(ctx.date) + tab + round));
      const name3 = s.name3 ? parseLines(s.name3, ['p']).map(x => x.p) : NAME3;
      const FINISH_L = s.finish ? parseLines(s.finish, ['p']).map(x => x.p) : FINISH;
      const LISTEN_L = s.listen ? parseLines(s.listen, ['p']).map(x => x.p) : LISTEN;

      function shell(title, body, frames) {
        return (ctx.embedded ? '<h1 class="station-title">' + esc(title) + '</h1>' : '<h1 class="station-title">Word games</h1><div class="pill-tabs">' +
          tabs.map(t => '<button data-tab="' + t[0] + '" class="' + (t[0] === tab ? 'on' : '') + '">' + t[1] + '</button>').join('') + '</div>') +
          body + (frames ? '<div class="frame-list">' + frames.map(f => '<div class="frame">' + f + '</div>').join('') + '</div>' : '') +
          '<div class="row"><button class="btn big" id="another">Another one</button></div>';
      }
      function fill() { el.querySelectorAll('img[data-lib]').forEach(im => L.get(im.dataset.lib).then(u => { if (u) im.src = u; })); }
      function right(b, msg) { b.classList.add('right'); celebrate(msg); }
      function wrong(b) { b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); ctx.speak('Try again'); }

      function draw() {
        const r = rnd();
        let html = '';
        if (tab === 'rhyme') {
          const q = pick(RHYMES, r); const answer = pick(q[1], r);
          const opts = shuffle([answer].concat(shuffle(q[2], r).slice(0, 2)), r);
          const it = itemFor(q[0]);
          html = shell('Rhyme Time', '<div class="frame" data-say="' + esc('Which word rhymes with ' + q[0] + '?') + '">Which word rhymes with <b>' + esc(q[0]) + '</b>? 🔊</div>' +
            (it && L.has(it.key) ? '<div class="single" style="max-width:420px">' + photoCard(it) + '</div>' : '<p class="sub" style="font-size:3em;font-weight:700">' + esc(q[0]) + '</p>') +
            '<div class="grid ans-grid">' + opts.map(o => '<button class="choice" data-ans="' + esc(o) + '" data-say="' + esc(o) + '">' + esc(o) + '</button>').join('') + '</div>',
            ['<span class="blank"></span> rhymes with <span class="blank"></span>.']);
          el.innerHTML = html; fill();
          el.querySelectorAll('[data-ans]').forEach(b => b.onclick = () => b.dataset.ans === answer ? right(b, answer + ' rhymes with ' + q[0]) : wrong(b));
        } else if (tab === 'riddle') {
          const ready = RIDDLES.filter(x => itemFor(x[1]) && L.has(itemFor(x[1]).key));
          if (!ready.length) { el.innerHTML = shell('Riddles', '<div class="empty">Riddles need the photo download first (Teacher → Warm Up → Change).</div>'); }
          else {
            const q = pick(ready, r); const ans = itemFor(q[1]);
            const opts = shuffle([ans].concat(shuffle(L.readyItems().filter(i => i !== ans && i.group !== ans.group), r).slice(0, 2)), r);
            html = shell('Riddles', '<div class="card prompt-card" data-say="' + esc(q[0] + ' What am I?') + '">' + esc(q[0]) + '<br><b>What am I?</b> 🔊</div>' +
              '<div class="pboard" style="--cols:3;max-width:900px;margin:0 auto;width:100%">' + opts.map(o => photoCard(o, 'data-ans="' + o.key + '"')).join('') + '</div>',
              ['It is a <span class="blank"></span> because <span class="blank"></span>.']);
            el.innerHTML = html; fill();
            el.querySelectorAll('[data-ans]').forEach(b => b.onclick = () => b.dataset.ans === ans.key ? (b.classList.add('found'), celebrate('Yes — a ' + ans.name)) : (b.classList.add('wrong'), setTimeout(() => b.classList.remove('wrong'), 400)));
          }
        } else if (tab === 'name3') {
          const q = pick(name3, r);
          day.n3 = day.n3 || {}; const got = [0, 1, 2].map(i => { const a = (day.n3[q] || [])[i]; return a && a.kind ? a : null; });
          const slot = (a, i) => '<button class="answer' + (a ? ' has' : '') + '" data-n="' + i + '">' +
            (a ? (a.kind === 'text' ? '<span class="answer-text">' + esc(a.text) + '</span>' : '<img src="' + a.url + '" alt="">') : '<span class="answer-n">' + (i + 1) + '</span><span class="answer-hint">write here</span>') + '</button>';
          html = shell('Name 3', '<div class="card prompt-card" data-say="' + esc('Tell me three ' + q) + '">Tell me three <b>' + esc(q) + '</b>. 🔊</div>' +
            '<div class="answers">' + got.map(slot).join('') + '</div>' +
            '<p class="hint" style="text-align:center">Tap a box to write the answer on the board (or type it).</p>',
            ['One thing that is <span class="blank"></span> is <span class="blank"></span>.']);
          el.innerHTML = html;
          el.querySelectorAll('[data-n]').forEach(b => b.onclick = async () => {
            const i = +b.dataset.n;
            const a = await writePad({ title: 'Answer ' + (i + 1) + ': three ' + q });
            if (!a) return;
            got[i] = a; day.n3[q] = got; ctx.saveDay(); draw();
            if (a.kind === 'text') ctx.speak(a.text);
            if (got.every(Boolean)) setTimeout(() => celebrate('Three things!'), 300);
          });
        } else if (tab === 'opposite') {
          const q = pick(OPPOSITES, r); const flip = r() < 0.5; const word = flip ? q[1] : q[0], answer = flip ? q[0] : q[1];
          const others = shuffle(OPPOSITES.filter(o => o !== q), r).slice(0, 2).map(o => o[Math.floor(r() * 2)]);
          const opts = shuffle([answer].concat(others), r);
          html = shell('Opposites', '<div class="frame" data-say="' + esc('What is the opposite of ' + word + '?') + '">What is the opposite of <b>' + esc(word) + '</b>? 🔊</div>' +
            '<div class="grid ans-grid">' + opts.map(o => '<button class="choice" data-ans="' + esc(o) + '" data-say="' + esc(o) + '">' + esc(o) + '</button>').join('') + '</div>',
            ['The opposite of <span class="blank"></span> is <span class="blank"></span>.']);
          el.innerHTML = html;
          el.querySelectorAll('[data-ans]').forEach(b => b.onclick = () => b.dataset.ans === answer ? right(b, 'The opposite of ' + word + ' is ' + answer) : wrong(b));
        } else if (tab === 'steps') {
          const q = pick(STEPS, r); const order = shuffle(q[1].map((t, i) => ({ t, i })), r);
          let next = 0;
          html = shell('Steps in Order', '<div class="frame" data-say="' + esc(q[0] + '. What do you do first?') + '"><b>' + esc(q[0]) + '</b> — tap the steps in order. 🔊</div>' +
            '<div class="steps-list">' + order.map(o => '<button class="choice step" data-i="' + o.i + '" data-say="' + esc(o.t) + '"><span class="step-n"></span>' + esc(o.t) + '</button>').join('') + '</div>',
            ['First, <span class="blank"></span>. Next, <span class="blank"></span>. Last, <span class="blank"></span>.']);
          el.innerHTML = html;
          el.querySelectorAll('[data-i]').forEach(b => b.onclick = () => {
            if (+b.dataset.i === next) { b.classList.add('right'); b.querySelector('.step-n').textContent = ++next; if (next === q[1].length) celebrate('All in order'); }
            else wrong(b);
          });
        } else if (tab === 'need') {
          const ready = NEED.filter(x => itemFor(x[1]) && L.has(itemFor(x[1]).key));
          if (!ready.length) { el.innerHTML = shell('What Do You Need?', '<div class="empty">This needs the photo download first (Teacher → Warm Up → Change).</div>'); }
          else {
            const q = pick(ready, r); const ans = itemFor(q[1]);
            const opts = shuffle([ans].concat(shuffle(L.readyItems().filter(i => i !== ans && !NEED.some(n => n[1] === i.name && n[0] === q[0])), r).slice(0, 2)), r);
            html = shell('What Do You Need?', '<div class="card prompt-card" data-say="' + esc(q[0] + ' What do you need?') + '">' + esc(q[0]) + '<br><b>What do you need?</b> 🔊</div>' +
              '<div class="pboard" style="--cols:3;max-width:900px;margin:0 auto;width:100%">' + opts.map(o => photoCard(o, 'data-ans="' + o.key + '"')).join('') + '</div>',
              ['I need a <span class="blank"></span> because <span class="blank"></span>.']);
            el.innerHTML = html; fill();
            el.querySelectorAll('[data-ans]').forEach(b => b.onclick = () => b.dataset.ans === ans.key ? (b.classList.add('found'), celebrate('Yes — a ' + ans.name)) : (b.classList.add('wrong'), setTimeout(() => b.classList.remove('wrong'), 400)));
          }
        }
        else if (tab === 'rather') {
          const q = pick(RATHER, r);
          day.rather = day.rather || {}; const t = day.rather[q[0]] || [0, 0];
          html = shell('Would You Rather', '<div class="card prompt-card" data-say="' + esc('Would you rather ' + q[0] + ' or ' + q[1] + '?') + '">Would you rather… 🔊</div>' +
            '<div class="grid ans-grid two">' + q.map((o, i) => '<button class="choice" data-r="' + i + '" data-say="' + esc(o) + '">' + esc(o) + '<small style="font-weight:400">' + t[i] + ' vote' + (t[i] === 1 ? '' : 's') + '</small></button>').join('') + '</div>' +
            '<p class="hint" style="text-align:center">Each student taps their choice, then says why.</p>',
            ['I would rather <span class="blank"></span> because <span class="blank"></span>.']);
          el.innerHTML = html;
          el.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { t[+b.dataset.r]++; day.rather[q[0]] = t; ctx.saveDay(); draw(); });
        } else if (tab === 'finish') {
          const q = pick(FINISH_L, r);
          day.fin = day.fin || {}; const ans = day.fin[q] || [];
          html = shell('Finish the Sentence', '<div class="card prompt-card" data-say="' + esc(q.replace(/___/g, 'blank')) + '">' + esc(q).replace(/___/g, '<span class="blank" style="display:inline-block;min-width:3em;border-bottom:3px solid var(--brand)"></span>') + ' 🔊</div>' +
            '<div class="answers">' + ans.map(a => '<div class="answer has">' + (a.kind === 'text' ? '<span class="answer-text">' + esc(a.text) + '</span>' : '<img src="' + a.url + '" alt="">') + '</div>').join('') +
            '<button class="answer" id="addAns"><span class="answer-n">+</span><span class="answer-hint">write an ending</span></button></div>' +
            '<p class="hint" style="text-align:center">One student at a time says the ending, then writes it on the board.</p>');
          el.innerHTML = html;
          el.querySelector('#addAns').onclick = async () => { const a = await writePad({ title: q }); if (!a) return; ans.push(a); day.fin[q] = ans; ctx.saveDay(); draw(); };
        } else if (tab === 'silly') {
          const q = pick(SILLY, r);
          html = shell('Does It Make Sense?', '<div class="card prompt-card" data-say="' + esc(q[0]) + '">' + esc(q[0]) + ' 🔊</div>' +
            '<div class="grid ans-grid two"><button class="choice" data-s="1">Makes sense</button><button class="choice" data-s="0">Silly — does not make sense</button></div>',
            ['That is silly because <span class="blank"></span>.', 'It should say <span class="blank"></span>.']);
          el.innerHTML = html;
          el.querySelectorAll('[data-s]').forEach(b => b.onclick = () => (b.dataset.s === '1') === q[1] ? right(b, q[1] ? 'Yes, that makes sense' : 'Yes, that is silly') : wrong(b));
        } else if (tab === 'same') {
          const ready = L.readyItems();
          if (ready.length < 4) { el.innerHTML = shell('Same or Different', '<div class="empty">This needs the photo download first (Teacher → Warm Up → Change).</div>'); }
          else {
            const a = pick(ready, r);
            const sameGroup = ready.filter(i => i !== a && i.group === a.group);
            const b = sameGroup.length && r() < 0.6 ? pick(sameGroup, r) : pick(ready.filter(i => i !== a), r);
            html = shell('Same or Different', '<div class="frame" data-say="How are these the same? How are they different?">How are these the <b>same</b>? How are they <b>different</b>? 🔊</div>' +
              '<div class="pboard" style="--cols:2;max-width:800px;margin:0 auto;width:100%">' + photoCard(a) + photoCard(b) + '</div>' +
              '<p class="hint" style="text-align:center">' + (a.group === b.group ? 'Both are ' + esc(a.group) + '.' : 'One is from ' + esc(a.group) + ', the other from ' + esc(b.group) + '.') + '</p>',
              ['They are the same because <span class="blank"></span>.', 'They are different because <span class="blank"></span>.']);
            el.innerHTML = html; fill();
          }
        } else if (tab === 'listen') {
          const q = pick(LISTEN_L, r);
          html = shell('Listen and Do', '<div class="card prompt-card" id="listenCard">Listen…</div>' +
            '<div class="row"><button class="btn big primary" id="sayIt">🔊 Say the direction</button><button class="btn big" id="showIt">Show the words</button></div>' +
            '<p class="hint" style="text-align:center">The board says a two-step direction. The student does both steps in order.</p>');
          el.innerHTML = html;
          el.querySelector('#sayIt').onclick = () => ctx.speak(q);
          el.querySelector('#showIt').onclick = () => { el.querySelector('#listenCard').textContent = q; };
          setTimeout(() => ctx.speak(q), 400);
        }
        el.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; day.tab = tab; round = 0; day.round = 0; ctx.saveDay(); draw(); });
        el.querySelector('#another').onclick = () => { round++; day.round = round; ctx.saveDay(); draw(); };
      }
      draw();
    },
    settings(el, ctx) {
      const s = ctx.settings; const hide = s.hide || [];
      el.innerHTML = '<div class="field">Word games and extra life skills to include ' + TABS.map(t =>
        '<label class="field check"><input type="checkbox" data-part="' + t[0] + '" ' + (hide.includes(t[0]) ? '' : 'checked') + '> ' + t[1] + '</label>').join('') + '</div>' +
        '<label class="field">"Name 3" prompts, one per line (after "Tell me three …")<textarea rows="5" data-k="name3">' + esc(s.name3 || NAME3.join('\n')) + '</textarea></label>' +
        '<label class="field">"Finish the Sentence" stems, one per line (use ___ for the blank)<textarea rows="5" data-k="finish">' + esc(s.finish || FINISH.join('\n')) + '</textarea></label>' +
        '<label class="field">"Listen and Do" directions, one per line<textarea rows="5" data-k="listen">' + esc(s.listen || LISTEN.join('\n')) + '</textarea></label>';
      el.querySelectorAll('[data-part]').forEach(c => c.onchange = () => { s.hide = [...el.querySelectorAll('[data-part]')].filter(x => !x.checked).map(x => x.dataset.part); ctx.saveSettings(); });
      el.querySelectorAll('[data-k]').forEach(i => i.oninput = () => { s[i.dataset.k] = i.value; ctx.saveSettings(); });
    },
  });
})();
