/* Station: How do I feel? — check-in, calming choices and a breathing circle.
   Faces are simple line icons; the teacher can replace any with her own photo (e.g. of herself
   making the face), which is often clearer for students. */
(function () {
  const { esc, parseLines, pickImage } = MM.util;
  const I = MM.icons;
  const FEELINGS = [
    ['Happy', 0], ['Calm', 0], ['Excited', 0], ['Silly', 0], ['Proud', 0],
    ['Tired', 1], ['Sad', 1], ['Worried', 1], ['Angry', 1], ['Frustrated', 1],
    ['Sick', 1], ['Confused', 1], ['Embarrassed', 1], ['Okay', 0], ['Bored', 1], ['Scared', 1], ['Surprised', 0], ['Lonely', 1],
  ];
  const COPE = [
    { icon: 'breathe', label: 'Take 5 deep breaths' }, { icon: 'count', label: 'Count to 10' },
    { icon: 'water', label: 'Get a drink of water' }, { icon: 'stretch', label: 'Stretch my body' },
    { icon: 'pause', label: 'Take a break' }, { icon: 'talk', label: 'Talk to a teacher' },
    { icon: 'music', label: 'Listen to music' }, { icon: 'squeeze', label: 'Squeeze something soft' },
  ];
  const photoKey = word => 'feel-' + word.toLowerCase().replace(/\s+/g, '-');

  MM.register({
    id: 'feelings',
    title: 'Feelings',
    icon: '😐',
    description: 'Each student taps how they feel. Hard feelings show calming choices.',
    defaultOn: true,
    render(el, ctx) {
      const s = ctx.settings, day = ctx.day;
      day.tally = day.tally || {};
      const shown = s.feelings ? parseLines(s.feelings, ['label', 'hard']).map(f => [f.label, f.hard === 'hard' ? 1 : 0]) : FEELINGS.slice(0, 10);
      const cope = s.cope ? parseLines(s.cope, ['icon', 'label']) : COPE;
      const photos = s.photos || {};
      let chosen = null, breathing = false;

      const faceHtml = (word, big) => photos[word] ? '<span class="pic has-photo face' + (big ? ' big' : '') + '"><img alt="" data-img="' + photoKey(word) + '"></span>'
        : MM.lib.pic('feel-' + word.toLowerCase(), I.feeling(word), 'face' + (big ? ' big' : ''));

      function draw() {
        let html = '<h1 class="station-title">How do you feel today?</h1>';
        if (breathing) {
          html += '<div class="breathe"><div class="breathe-ball" id="ball">Breathe in</div><button class="btn big" id="stopBreathe">I feel better</button></div>';
        } else if (chosen) {
          html += '<div class="feel-now" data-say="' + esc('I feel ' + chosen[0].toLowerCase()) + '">' + faceHtml(chosen[0], true) + ' I feel ' + esc(chosen[0].toLowerCase()) + '. 🔊</div>';
          html += '<div class="frame-list"><div class="frame">I feel <b>' + esc(chosen[0].toLowerCase()) + '</b> because <span class="blank"></span>.</div></div>';
          if (chosen[1]) {
            html += '<h2 class="sub">What can help?</h2><div class="grid cope">' + cope.map((c, i) =>
              '<button class="choice" data-cope="' + i + '" data-say="' + esc(c.label) + '"><span class="ico-box">' + (I.MISC[c.icon] || I.MISC.help) + '</span>' + esc(c.label) + '</button>').join('') + '</div>';
          } else html += '<p class="sub" style="font-size:1.6em">Good to hear.</p>';
          html += '<div class="row"><button class="btn big primary" id="nextFriend">Next student ▶</button></div>';
        } else {
          html += '<div class="frame">I feel <span class="blank"></span>.</div>';
          html += '<div class="grid f-grid">' + shown.map((f, i) => '<button class="choice" data-f="' + i + '">' + faceHtml(f[0]) + esc(f[0]) + '</button>').join('') + '</div>';
          if (s.showTally !== false) {
            const t = Object.entries(day.tally).filter(([, n]) => n > 0);
            if (t.length) html += '<div class="tally">Class check-in: ' + t.map(([k, n]) => '<span>' + esc(k) + ' <b>' + n + '</b></span>').join('') + ' <button class="btn" id="clearTally">Clear</button></div>';
          }
        }
        el.innerHTML = html;
        MM.lib.fill(el);
        el.querySelectorAll('img[data-img]').forEach(im => MM.img.get(im.dataset.img).then(u => { if (u) im.src = u; }));
        el.querySelectorAll('[data-f]').forEach(b => b.onclick = () => {
          chosen = shown[+b.dataset.f];
          day.tally[chosen[0]] = (day.tally[chosen[0]] || 0) + 1; ctx.saveDay();
          ctx.speak('I feel ' + chosen[0].toLowerCase()); draw();
        });
        el.querySelectorAll('[data-cope]').forEach(b => b.addEventListener('click', () => { if (/breath/i.test(cope[+b.dataset.cope].label)) { breathing = true; draw(); } }));
        const nf = el.querySelector('#nextFriend'); if (nf) nf.onclick = () => { chosen = null; draw(); };
        const ct = el.querySelector('#clearTally'); if (ct) ct.onclick = () => { day.tally = {}; ctx.saveDay(); draw(); };
        const sb = el.querySelector('#stopBreathe');
        if (sb) {
          const ball = el.querySelector('#ball'); let inhale = true;
          const iv = setInterval(() => { if (!document.body.contains(ball)) return clearInterval(iv); inhale = !inhale; ball.textContent = inhale ? 'Breathe in' : 'Breathe out'; }, 4000);
          sb.onclick = () => { clearInterval(iv); breathing = false; chosen = null; draw(); };
        }
      }
      draw();
    },
    settings(el, ctx) {
      const s = ctx.settings;
      s.photos = s.photos || {};
      const shown = s.feelings ? parseLines(s.feelings, ['label', 'hard']).map(f => f.label) : FEELINGS.slice(0, 10).map(f => f[0]);
      function draw() {
        el.innerHTML =
          '<label class="field check"><input type="checkbox" data-k="showTally" ' + (s.showTally !== false ? 'checked' : '') + '> Show how many students picked each feeling (no names)</label>' +
          '<label class="field">Feelings to show, one per line: <code>word | hard</code> ("hard" shows the calming choices)' +
          '<textarea rows="8" data-k="feelings">' + esc(s.feelings || FEELINGS.slice(0, 10).map(f => f[0] + (f[1] ? ' | hard' : '')).join('\n')) + '</textarea></label>' +
          '<p class="hint">Real photos for these feelings come with the picture download (Teacher → Warm Up → Change → Download; use <b>Swap</b> there for a different one). Or add your own below — a photo of you making the face works best.</p>' +
          '<div class="field">My own photos for feelings' +
          '<div class="lib-grid">' + shown.map(w => '<div class="lib-item" data-w="' + esc(w) + '"><div class="lib-thumb">' + (s.photos[w] ? '<img alt="">' : I.feeling(w)) + '</div><b>' + esc(w) + '</b>' +
            '<div class="lib-btns"><button data-a="own">Mine</button>' + (s.photos[w] ? '<button data-a="del">✕</button>' : '') + '</div></div>').join('') + '</div></div>' +
          '<label class="field">Calming choices: <code>icon | words</code> (icons: ' + Object.keys(I.MISC).slice(0, 10).join(', ') + ')' +
          '<textarea rows="6" data-k="cope">' + esc(s.cope || COPE.map(c => c.icon + ' | ' + c.label).join('\n')) + '</textarea></label>';
        shown.forEach(w => { if (s.photos[w]) MM.img.get(photoKey(w)).then(u => { const im = el.querySelector('[data-w="' + CSS.escape(w) + '"] img'); if (im && u) im.src = u; }); });
        el.querySelectorAll('[data-k]').forEach(i => {
          const k = i.dataset.k;
          if (i.type === 'checkbox') i.onchange = () => { s[k] = i.checked; ctx.saveSettings(); };
          else i.oninput = () => { s[k] = i.value; ctx.saveSettings(); };
        });
        el.querySelectorAll('.lib-item').forEach(row => {
          const w = row.dataset.w;
          row.querySelector('[data-a="own"]').onclick = async () => { const p = await pickImage(600); if (!p) return; await MM.img.put(photoKey(w), p.url); s.photos[w] = true; ctx.saveSettings(); draw(); };
          const d = row.querySelector('[data-a="del"]'); if (d) d.onclick = async () => { await MM.img.del(photoKey(w)); delete s.photos[w]; ctx.saveSettings(); draw(); };
        });
      }
      draw();
    },
  });
})();
