/* Station: Visual schedule with Now / Next — photo cards, tapped off as the day goes. */
(function () {
  const { esc, parseLines, toLines, dateKey, pickImage } = MM.util;
  const DEFAULT = [
    { time: '8:30', label: 'Morning Meeting' }, { time: '9:00', label: 'Reading' }, { time: '9:45', label: 'Math' },
    { time: '10:30', label: 'Snack' }, { time: '10:45', label: 'Recess' }, { time: '11:15', label: 'Life Skills' },
    { time: '12:00', label: 'Lunch' }, { time: '12:45', label: 'Art' }, { time: '1:45', label: 'Pack Up' },
  ];
  // Which library photo fits an activity name.
  const MATCH = [
    [/meeting|circle/i, 'meeting'], [/read|story|book/i, 'reading'], [/math|number|count/i, 'math'], [/snack/i, 'snack'],
    [/recess|break|play|outside/i, 'recess'], [/lunch/i, 'lunch'], [/art|paint|draw|craft/i, 'art'], [/music|sing/i, 'music'],
    [/gym|p\.?e\.?\b|exercise|movement/i, 'gym'], [/computer|ipad|tech/i, 'computer'], [/science/i, 'science'], [/writ|journal|spell/i, 'writing'],
    [/bus/i, 'bus'], [/library/i, 'library'], [/pack|dismiss|clean/i, 'packup'], [/rest|quiet|calm/i, 'rest'],
    [/life|cook|kitchen|chore/i, 'lifeskills'], [/speech/i, 'speech'], [/\bot\b|occupational/i, 'ot'], [/home/i, 'home'],
  ];
  const own = label => 'sched-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  function photoFor(label, photos) {
    if (photos[label]) return { own: true, key: own(label) };
    const m = MATCH.find(x => x[0].test(label));
    return m ? { key: m[1] } : null;
  }

  MM.register({
    id: 'schedule',
    title: 'Schedule',
    icon: '',
    description: 'Today\'s activities as photo cards with Now / Next. Tap one when it\'s finished.',
    defaultOn: true,
    render(el, ctx) {
      const s = ctx.settings, day = ctx.day;
      day.done = day.done || [];
      s.photos = s.photos || {};
      const items = s.items ? parseLines(s.items, ['time', 'label']).filter(x => x.label) : DEFAULT;
      const pic = (it, cls) => {
        const p = photoFor(it.label, s.photos);
        if (p && p.own) return '<span class="pic has-photo ' + cls + '"><img alt="" data-own="' + p.key + '"></span>';
        return '<span class="artbox ' + cls + '">' + (p ? MM.art.SCHEDULE[p.key] : MM.art.SCHEDULE.meeting) + '</span>';
      };
      function draw() {
        const nowIdx = items.findIndex((_, i) => !day.done.includes(i));
        const now = items[nowIdx], next = nowIdx >= 0 ? items.slice(nowIdx + 1).find((_, j) => !day.done.includes(nowIdx + 1 + j)) : null;
        const big = (lbl, it, cls) => '<div class="card ' + cls + '"' + (it ? ' data-say="' + esc(lbl + ' is ' + it.label) + '"' : '') + '><div class="lbl">' + lbl + '</div>' +
          (it ? pic(it, 'wide big') + '<b>' + esc(it.label) + '</b>' : '<b>All done</b>') + '</div>';
        el.innerHTML =
          '<div class="title-row"><h1 class="station-title">Our day</h1><button class="btn edit-btn" id="editSched">Edit</button></div>' +
          '<div class="nownext">' + big('Now', now, 'now') + big('Next', next, 'next') + '</div>' +
          (s.change && s.changeDate === dateKey(ctx.date) ? '<div class="frame" data-say="' + esc('Something is different today. ' + s.change) + '">Something is different today: ' + esc(s.change) + '</div>' : '') +
          '<div class="grid sched">' + items.map((it, i) =>
            '<button class="choice' + (day.done.includes(i) ? ' done' : '') + '" data-i="' + i + '" data-say="' + esc(it.label) + '">' +
            pic(it, 'wide') + esc(it.label) + (it.time ? '<span class="time">' + esc(it.time) + '</span>' : '') + '</button>').join('') +
          '</div>';
        el.querySelectorAll('img[data-own]').forEach(im => MM.img.get(im.dataset.own).then(u => { if (u) im.src = u; }));
        el.querySelector('#editSched').onclick = () => MM.openTeacher('schedule');
        el.querySelectorAll('[data-i]').forEach(b => b.onclick = () => {
          const i = +b.dataset.i;
          day.done = day.done.includes(i) ? day.done.filter(x => x !== i) : day.done.concat(i);
          ctx.saveDay(); draw();
        });
      }
      draw();
    },
    settings(el, ctx) {
      const s = ctx.settings; s.photos = s.photos || {};
      const items = s.items ? parseLines(s.items, ['time', 'label']).filter(x => x.label) : DEFAULT;
      function draw() {
        el.innerHTML =
          '<label class="field">Our day: one activity per line, <code>time | name</code>' +
          '<textarea rows="10" data-k="items">' + esc(s.items || toLines(DEFAULT, ['time', 'label'])) + '</textarea></label>' +
          '<p class="hint">Pictures are matched from the name (reading, math, snack, recess, lunch, art, music, gym, computer, science, writing, bus, library, pack up, rest, life skills, speech, OT, home). Tap <b>Mine</b> to use your own photo instead.</p>' +
          '<div class="lib-grid">' + items.map(it => {
            const p = photoFor(it.label, s.photos);
            return '<div class="lib-item" data-l="' + esc(it.label) + '"><div class="lib-thumb">' + (p && p.own ? '<img alt="" data-own="' + p.key + '">' : p ? MM.art.SCHEDULE[p.key] : '<span>—</span>') + '</div><b>' + esc(it.label) + '</b>' +
              '<div class="lib-btns"><button data-a="own">Mine</button>' + (s.photos[it.label] ? '<button data-a="del">✕</button>' : '') + '</div></div>';
          }).join('') + '</div>' +
          '<label class="field">Something different today? (optional, shows a "change" card) <input data-k="change" placeholder="Fire drill at 10:00" value="' + esc(s.changeDate === dateKey(new Date()) ? s.change || '' : '') + '"></label>' +
          '<p class="hint">The "different today" note clears itself tomorrow.</p>';
        el.querySelectorAll('img[data-own]').forEach(im => MM.img.get(im.dataset.own).then(u => { if (u) im.src = u; }));
        el.querySelectorAll('[data-k]').forEach(i => i.oninput = () => {
          s[i.dataset.k] = i.value;
          if (i.dataset.k === 'change') s.changeDate = dateKey(new Date());
          ctx.saveSettings();
        });
        el.querySelector('[data-k="items"]').onchange = draw;
        el.querySelectorAll('.lib-item').forEach(row => {
          const l = row.dataset.l;
          row.querySelector('[data-a="own"]').onclick = async () => { const p = await pickImage(800); if (!p) return; await MM.img.put(own(l), p.url); s.photos[l] = true; ctx.saveSettings(); draw(); };
          const d = row.querySelector('[data-a="del"]'); if (d) d.onclick = async () => { await MM.img.del(own(l)); delete s.photos[l]; ctx.saveSettings(); draw(); };
        });
      }
      draw();
    },
  });
})();
