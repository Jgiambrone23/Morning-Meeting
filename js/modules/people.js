/* Station (off until the teacher turns it on): Who's here + classroom jobs.
   First names are typed by the teacher and stay on this computer only. */
(function () {
  const { esc, parseLines, toLines, hash, dateKey } = MM.util;
  const JOBS = [
    { job: 'Calendar leader' }, { job: 'Weather reporter' }, { job: 'Attendance' }, { job: 'Clean-up crew' }, { job: 'Plants' }, { job: 'Messenger' },
  ];
  MM.register({
    id: 'people',
    title: "Who's Here",
    icon: '🙋',
    description: 'Optional. Type first names to take attendance, share out jobs and pick whose turn it is in the games.',
    defaultOn: false,
    render(el, ctx) {
      const s = ctx.settings, day = ctx.day;
      day.absent = day.absent || [];
      const names = parseLines(s.names, ['name']).map(x => x.name);
      if (!names.length) {
        el.innerHTML = '<div class="empty">Add first names in ⚙️ Teacher → Who\'s Here → Change.</div>';
        return;
      }
      const jobs = s.jobs ? parseLines(s.jobs, ['job']) : JOBS;
      function draw() {
        const here = names.filter(n => !day.absent.includes(n));
        // Jobs move along by one person each school day.
        const offset = hash(dateKey(ctx.date)) % Math.max(here.length, 1);
        el.innerHTML =
          '<h1 class="station-title">Who is here today?</h1>' +
          '<div class="frame" data-say="' + here.length + ' students are here today">' + here.length + ' students are here today. 🔊</div>' +
          '<div class="grid people-grid">' + names.map(n =>
            '<button class="choice' + (day.absent.includes(n) ? ' away' : '') + '" data-n="' + esc(n) + '"><span class="emo">' + (day.absent.includes(n) ? 'away' : 'here') + '</span>' + esc(n) + '</button>').join('') + '</div>' +
          (s.showJobs !== false && here.length ? '<h2 class="sub">Today\'s jobs</h2><div class="grid jobs">' + jobs.map((j, i) => {
            const who = here[(i + offset) % here.length];
            return '<div class="card" data-say="' + esc(who + ' is the ' + j.job) + '"><b>' + esc(j.job) + '</b><div class="big-text">' + esc(who) + '</div></div>';
          }).join('') + '</div>' : '');
        el.querySelectorAll('[data-n]').forEach(b => b.onclick = () => {
          const n = b.dataset.n;
          day.absent = day.absent.includes(n) ? day.absent.filter(x => x !== n) : day.absent.concat(n);
          ctx.saveDay(); draw();
        });
      }
      draw();
    },
    settings(el, ctx) {
      const s = ctx.settings;
      el.innerHTML =
        '<p class="hint">First names only. They are saved on this computer and are never sent anywhere. They\'re included if you save a backup file, so keep that file private.</p>' +
        '<label class="field">Students, one first name per line<textarea rows="8" data-k="names">' + esc(s.names || '') + '</textarea></label>' +
        '<label class="field check"><input type="checkbox" data-k="showJobs" ' + (s.showJobs !== false ? 'checked' : '') + '> Show classroom jobs</label>' +
        '<label class="field">Jobs, one per line<textarea rows="6" data-k="jobs">' + esc(s.jobs || toLines(JOBS, ['job'])) + '</textarea></label>';
      el.querySelectorAll('[data-k]').forEach(i => {
        const k = i.dataset.k;
        if (i.type === 'checkbox') i.onchange = () => { s[k] = i.checked; ctx.saveSettings(); };
        else i.oninput = () => { s[k] = i.value; ctx.saveSettings(); };
      });
    },
  });
})();
