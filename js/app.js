/* Morning Meeting — the board itself: top bar, station tabs, and the teacher settings panel. */
(function () {
  'use strict';
  const { esc, dateKey, longDate, uid, speak, setSpeech, pickImage } = MM.util;
  const SETTINGS_KEY = 'mm.settings.v1';

  const THEMES = {
    blue: { brand: '#2f5d8a', brand2: '#f4c95d', bg: '#f3f5f8' },
    teal: { brand: '#2a7a74', brand2: '#f2b84b', bg: '#f1f6f5' },
    plum: { brand: '#5b4b8a', brand2: '#f0c060', bg: '#f4f2f8' },
    rust: { brand: '#a0522d', brand2: '#4d8fc9', bg: '#f8f4f0' },
    slate: { brand: '#44546a', brand2: '#e8b84a', bg: '#f2f4f7' },
  };

  // ---------- settings ----------
  function defaults() {
    return {
      className: 'Our Class',
      theme: 'blue',
      speech: true,
      rate: 0.9,
      steps: [],      // [{id, on}]
      mod: {},        // per-station settings
      custom: [],     // teacher-made pages [{id, emoji, title, text, image}]
    };
  }
  let S = Object.assign(defaults(), MM.store.get(SETTINGS_KEY, {}));

  function syncSteps() {
    const known = new Set(S.steps.map(s => s.id));
    MM.order.forEach(id => {
      if (!known.has(id) && !MM.modules[id].hidden) S.steps.push({ id, on: MM.modules[id].defaultOn !== false });
    });
    S.custom.forEach(c => { if (!known.has('custom:' + c.id)) S.steps.push({ id: 'custom:' + c.id, on: true }); });
    S.steps = S.steps.filter(s => (MM.modules[s.id] && !MM.modules[s.id].hidden) || (s.id.startsWith('custom:') && S.custom.some(c => 'custom:' + c.id === s.id)));
  }
  function save() { MM.store.set(SETTINGS_KEY, S); }

  // ---------- per-day memory (today's weather pick, schedule checks, ...) ----------
  function dayKey() { return 'mm.day.' + dateKey(new Date()); }
  let DAY = MM.store.get(dayKey(), {});
  function saveDay() { MM.store.set(dayKey(), DAY); }
  // Forget day records older than 2 weeks.
  try {
    const cutoff = dateKey(MM.util.addDays(new Date(), -14));
    Object.keys(localStorage).filter(k => k.startsWith('mm.day.') && k.slice(7) < cutoff)
      .forEach(k => localStorage.removeItem(k));
  } catch (e) { /* ignore */ }

  // ---------- station context ----------
  function ctxFor(id) {
    if (!S.mod[id]) S.mod[id] = {};
    if (!DAY[id]) DAY[id] = {};
    return {
      id,
      app: S,
      date: new Date(),
      settings: S.mod[id],
      saveSettings: save,
      day: DAY[id],
      saveDay,
      speak,
      rerender: () => { if (currentId() === id) showStep(current); },
      peopleNames: () => {
        const p = S.mod.people || {};
        const on = (S.steps.find(s => s.id === 'people') || {}).on;
        if (!on || !p.names) return [];
        const absent = (DAY.people && DAY.people.absent) || [];
        return MM.util.parseLines(p.names, ['name']).map(x => x.name).filter(n => !absent.includes(n));
      },
    };
  }

  MM.ctxFor = ctxFor;
  function stepDef(id) {
    if (MM.modules[id]) return MM.modules[id];
    const c = S.custom.find(x => 'custom:' + x.id === id);
    return c ? customDef(c) : null;
  }

  function customDef(c) {
    return {
      id: 'custom:' + c.id, title: c.title || 'My page', icon: c.emoji || '', iconKey: 'page',
      render(el) {
        el.innerHTML = '<div class="custom-page">' +
          '<h1 class="station-title">' + esc(c.title || '') + '</h1>' +
          '<div class="custom-img"></div>' +
          (c.text ? '<div class="custom-text big-text" data-say="' + esc(c.text) + '">' +
            esc(c.text).replace(/\n/g, '<br>') + ' <span class="say-icon">🔊</span></div>' : '') +
          '</div>';
        if (c.image) MM.img.get(c.image).then(url => {
          if (url) el.querySelector('.custom-img').innerHTML = '<img src="' + url + '" alt="">';
        });
      },
    };
  }

  // ---------- board ----------
  const stage = document.getElementById('stage');
  const tabs = document.getElementById('tabs');
  let current = 0;

  function activeSteps() { return S.steps.filter(s => s.on && stepDef(s.id)); }
  function currentId() { const a = activeSteps(); return a[current] && a[current].id; }

  function applyTheme() {
    const t = THEMES[S.theme] || THEMES.blue;
    const r = document.documentElement.style;
    r.setProperty('--brand', t.brand); r.setProperty('--brand2', t.brand2); r.setProperty('--bg', t.bg);
    document.getElementById('className').textContent = S.className;
    document.title = S.className + ' · Morning Meeting';
    setSpeech(S.speech, S.rate, S.voice);
  }

  function renderTabs() {
    const a = activeSteps();
    tabs.innerHTML = a.map((s, i) => {
      const d = stepDef(s.id);
      return '<button class="tab' + (i === current ? ' on' : '') + '" data-i="' + i + '">' +
        '<span class="tab-icon">' + MM.icons.tab(d.iconKey || s.id) + '</span><span class="tab-label">' + esc(d.title) + '</span></button>';
    }).join('');
  }

  function showStep(i) {
    const a = activeSteps();
    if (!a.length) { stage.innerHTML = '<div class="empty">Open ⚙️ Teacher to turn on some stations.</div>'; tabs.innerHTML = ''; return; }
    const wanted = Math.max(0, Math.min(i, a.length - 1));
    if (wanted !== current && MM.ink) MM.ink.clear();
    current = wanted;
    const id = a[current].id;
    const def = stepDef(id);
    stage.innerHTML = '';
    const el = document.createElement('section');
    el.className = 'station station-' + id.replace(':', '-');
    stage.appendChild(el);
    try { def.render(el, ctxFor(id)); }
    catch (e) { console.error(e); el.innerHTML = '<div class="empty">This station had a problem: ' + esc(e.message) + '</div>'; }
    renderTabs();
    document.getElementById('prevBtn').disabled = current === 0;
    document.getElementById('nextBtn').disabled = current === a.length - 1;
    try { sessionStorage.setItem('mm.step', id); } catch (e) { /* ignore */ }
  }

  tabs.addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) showStep(+b.dataset.i); });
  document.getElementById('prevBtn').onclick = () => showStep(current - 1);
  document.getElementById('nextBtn').onclick = () => showStep(current + 1);
  document.addEventListener('keydown', e => {
    if (document.querySelector('dialog[open]') || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') showStep(current + 1);
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') showStep(current - 1);
  });

  // Anything with data-say reads itself aloud when tapped.
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-say]');
    if (t) speak(t.getAttribute('data-say'));
  });

  // Live clock and date.
  function tick() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const dl = document.getElementById('dateLine');
    dl.textContent = longDate(now); dl.setAttribute('data-say', 'Today is ' + longDate(now));
    const k = dateKey(now);
    if (tick.last && tick.last !== k) { DAY = MM.store.get(dayKey(), {}); showStep(current); }
    tick.last = k;
  }
  setInterval(tick, 15000);

  document.getElementById('fsBtn').onclick = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  };

  // ---------- drawing pen ----------
  (function () {
    const canvas = document.getElementById('ink'), bar = document.getElementById('inkBar'), penBtn = document.getElementById('penBtn');
    const cx = canvas.getContext('2d');
    let on = false, color = '#1d2433', erasing = false, drawing = false, last = null;
    function size() {
      const r = stage.getBoundingClientRect();
      const keep = canvas.width ? cx.getImageData(0, 0, canvas.width, canvas.height) : null;
      canvas.style.top = r.top + 'px'; canvas.style.left = r.left + 'px';
      canvas.width = r.width; canvas.height = r.height;
      if (keep) cx.putImageData(keep, 0, 0);
    }
    function setOn(v) {
      on = v; canvas.hidden = !v; bar.hidden = !v; penBtn.classList.toggle('on', v); document.body.classList.toggle('inking', v);
      if (v) size();
    }
    penBtn.onclick = () => setOn(!on);
    window.addEventListener('resize', () => { if (on) size(); });
    const pos = e => ({ x: e.clientX - canvas.getBoundingClientRect().left, y: e.clientY - canvas.getBoundingClientRect().top });
    canvas.addEventListener('pointerdown', e => { drawing = true; last = pos(e); canvas.setPointerCapture(e.pointerId); e.preventDefault(); });
    canvas.addEventListener('pointermove', e => {
      if (!drawing) return;
      const p = pos(e);
      cx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
      cx.strokeStyle = color; cx.lineWidth = erasing ? 40 : 6; cx.lineCap = 'round'; cx.lineJoin = 'round';
      cx.beginPath(); cx.moveTo(last.x, last.y); cx.lineTo(p.x, p.y); cx.stroke(); last = p;
    });
    ['pointerup', 'pointercancel'].forEach(ev => canvas.addEventListener(ev, () => { drawing = false; }));
    bar.querySelectorAll('.ink-color').forEach(b => b.onclick = () => { color = b.dataset.color; erasing = false; bar.querySelectorAll('.on').forEach(x => x.classList.remove('on')); b.classList.add('on'); });
    document.getElementById('inkEraser').onclick = e => { erasing = true; bar.querySelectorAll('.on').forEach(x => x.classList.remove('on')); e.target.classList.add('on'); };
    document.getElementById('inkClear').onclick = () => cx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('inkDone').onclick = () => setOn(false);
    MM.ink = { clear: () => { cx.clearRect(0, 0, canvas.width, canvas.height); setOn(false); } };
  })();

  // ---------- teacher panel ----------
  // A tap on the gear opens Teacher settings. If "lock" is on (settings), it needs a press-and-hold
  // instead, so students don't open it by accident.
  const gear = document.getElementById('gearBtn');
  let holdTimer = null, held = false;
  gear.addEventListener('pointerdown', e => {
    e.preventDefault(); held = false;
    if (!S.lockGear) return;
    gear.classList.add('holding');
    holdTimer = setTimeout(() => { held = true; gear.classList.remove('holding'); openTeacher(); }, 700);
  });
  gear.addEventListener('pointerup', () => {
    clearTimeout(holdTimer); gear.classList.remove('holding');
    if (!S.lockGear) openTeacher();
    else if (!held) { gear.classList.add('nudge'); setTimeout(() => gear.classList.remove('nudge'), 600); speak('Press and hold'); }
  });
  ['pointerleave', 'pointercancel'].forEach(ev => gear.addEventListener(ev, () => { clearTimeout(holdTimer); gear.classList.remove('holding'); }));
  gear.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTeacher(); } });

  const dlg = document.getElementById('teacher');
  const body = document.getElementById('teacherBody');
  let openPanel = null;

  function openTeacher(panelId) {
    if (panelId) openPanel = panelId;
    renderTeacher(); dlg.showModal();
    if (panelId) { const h = body.querySelector('#panel-' + panelId.replace(':', '-')); if (h) h.scrollIntoView({ block: 'start' }); }
    else { const f = body.querySelector('input'); if (f) f.focus(); }
  }
  MM.openTeacher = openTeacher;
  document.getElementById('closeTeacher').onclick = () => { dlg.close(); };
  dlg.addEventListener('close', () => { save(); applyTheme(); showStep(current); });

  function renderTeacher() {
    const themeBtns = Object.keys(THEMES).map(k =>
      '<button class="swatch' + (S.theme === k ? ' on' : '') + '" data-theme="' + k + '" style="background:' +
      THEMES[k].brand + '" aria-label="' + k + ' colour"></button>').join('');

    const rows = S.steps.map((s, i) => {
      const d = stepDef(s.id); if (!d) return '';
      const isCustom = s.id.startsWith('custom:');
      const hasSettings = isCustom || typeof d.settings === 'function';
      return '<li class="step-row" data-i="' + i + '">' +
        '<label class="toggle"><input type="checkbox" data-act="on" ' + (s.on ? 'checked' : '') + '><span></span></label>' +
        '<span class="step-name"><span class="ico-box small">' + MM.icons.tab(d.iconKey || s.id) + '</span> ' + esc(d.title) +
        (d.description ? '<small>' + esc(d.description) + '</small>' : '') + '</span>' +
        '<span class="step-btns">' +
        '<button data-act="up" aria-label="Move up">▲</button><button data-act="down" aria-label="Move down">▼</button>' +
        (hasSettings ? '<button data-act="edit">' + (openPanel === s.id ? 'Done' : 'Change') + '</button>' : '') +
        '</span>' +
        (openPanel === s.id ? '<div class="step-settings" id="panel-' + esc(s.id.replace(':', '-')) + '"></div>' : '') +
        '</li>';
    }).join('');

    body.innerHTML =
      '<section class="t-sec"><h3>Our board</h3>' +
      '<label class="field">Class name <input id="tClass" value="' + esc(S.className) + '"></label>' +
      '<div class="field">Colour <span class="swatches">' + themeBtns + '</span></div>' +
      '<label class="field check"><input type="checkbox" id="tSpeech" ' + (S.speech ? 'checked' : '') + '> Read words aloud when tapped</label>' +
      '<label class="field check"><input type="checkbox" id="tLock" ' + (S.lockGear ? 'checked' : '') + '> Lock this panel: the gear needs a press-and-hold (so students can\'t open it)</label>' +
      '<label class="field">Reading speed <input type="range" id="tRate" min="0.6" max="1.2" step="0.05" value="' + S.rate + '"></label>' +
      '<div class="field">Voice <span class="row" style="justify-content:flex-start"><select id="tVoice"><option value="">Best available (automatic)</option>' +
      MM.util.voices().map(v => '<option value="' + esc(v.name) + '"' + (S.voice === v.name ? ' selected' : '') + '>' + esc(v.name) + '</option>').join('') + '</select>' +
      '<button class="btn" id="tryVoice">Try it</button></span><span class="hint">Voices come from this computer. On a Mac or iPad, "Samantha" or "Ava" sound natural; on Windows, pick one that says "Natural"; in Chrome, "Google US English".</span></div>' +
      '</section>' +
      '<section class="t-sec"><h3>Stations</h3><p class="hint">Turn stations on or off, put them in order, and tap <b>Change</b> to set one up.</p>' +
      '<ul class="step-list">' + rows + '</ul>' +
      '<button class="btn" id="addCustom">＋ Add my own page</button></section>' +
      '<section class="t-sec"><h3>Ideas to try</h3><ul class="ideas">' + IDEAS.map(x => '<li>' + x + '</li>').join('') + '</ul></section>' +
      '<section class="t-sec"><h3>Backup</h3><p class="hint">Everything is saved on this computer only. To move it to another computer (laptop to smartboard), save a backup file here and open it there.</p>' +
      '<button class="btn" id="exportBtn">⬇ Save a backup file</button> <button class="btn" id="importBtn">⬆ Open a backup file</button> ' +
      '<button class="btn danger" id="resetBtn">Start over</button></section>';

    if (openPanel) {
      const host = body.querySelector('#panel-' + openPanel.replace(':', '-'));
      if (host) {
        if (openPanel.startsWith('custom:')) customSettings(host, S.custom.find(c => 'custom:' + c.id === openPanel));
        else MM.modules[openPanel].settings(host, ctxFor(openPanel));
      }
    }

    body.querySelector('#tClass').oninput = e => { S.className = e.target.value || 'Our Class'; save(); applyTheme(); };
    body.querySelectorAll('.swatch').forEach(b => b.onclick = () => { S.theme = b.dataset.theme; save(); applyTheme(); renderTeacher(); });
    body.querySelector('#tSpeech').onchange = e => { S.speech = e.target.checked; save(); applyTheme(); };
    body.querySelector('#tLock').onchange = e => { S.lockGear = e.target.checked; save(); };
    body.querySelector('#tRate').onchange = e => { S.rate = +e.target.value; save(); applyTheme(); speak('This is how fast I will read.'); };
    body.querySelector('#tVoice').onchange = e => { S.voice = e.target.value; save(); applyTheme(); speak('Good morning. Today is ' + longDate(new Date()) + '.'); };
    body.querySelector('#tryVoice').onclick = () => speak('Good morning, ' + S.className + '. Today is ' + longDate(new Date()) + '.');

    body.querySelectorAll('.step-row').forEach(row => {
      const i = +row.dataset.i;
      row.querySelectorAll('[data-act]').forEach(ctrl => {
        const act = ctrl.dataset.act;
        const handler = () => {
          if (act === 'on') { S.steps[i].on = ctrl.checked; }
          if (act === 'up' && i > 0) { [S.steps[i - 1], S.steps[i]] = [S.steps[i], S.steps[i - 1]]; }
          if (act === 'down' && i < S.steps.length - 1) { [S.steps[i + 1], S.steps[i]] = [S.steps[i], S.steps[i + 1]]; }
          if (act === 'edit') { openPanel = openPanel === S.steps[i].id ? null : S.steps[i].id; }
          save(); renderTeacher();
        };
        if (act === 'on') ctrl.onchange = handler; else ctrl.onclick = handler;
      });
    });

    body.querySelector('#addCustom').onclick = () => {
      const c = { id: uid(), title: 'Question of the Day', text: '' };
      S.custom.push(c); S.steps.push({ id: 'custom:' + c.id, on: true });
      openPanel = 'custom:' + c.id; save(); renderTeacher();
    };
    body.querySelector('#exportBtn').onclick = exportBackup;
    body.querySelector('#importBtn').onclick = importBackup;
    body.querySelector('#resetBtn').onclick = () => {
      if (!confirm('Start over? This clears every setting and picture on this computer. Save a backup first if you might want them back.')) return;
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem('mm.library.v1');
      indexedDB.deleteDatabase('morning-meeting');
      location.reload();
    };
  }

  function customSettings(host, c) {
    host.innerHTML =
      '<label class="field">Title <input data-k="title" value="' + esc(c.title) + '"></label>' +
      '<label class="field">Words on the page <textarea rows="4" data-k="text">' + esc(c.text) + '</textarea></label>' +
      '<div class="field">Photo <button class="btn" data-a="img">' + (c.image ? 'Change photo' : 'Add a photo') + '</button>' +
      (c.image ? ' <button class="btn" data-a="noimg">Remove photo</button>' : '') + '</div>' +
      '<button class="btn danger" data-a="del">Delete this page</button>';
    host.querySelectorAll('[data-k]').forEach(inp => inp.oninput = () => { c[inp.dataset.k] = inp.value; save(); });
    host.querySelector('[data-a="img"]').onclick = async () => {
      const p = await pickImage(); if (!p) return;
      const id = 'custom-' + c.id; await MM.img.put(id, p.url); c.image = id; save(); renderTeacher();
    };
    const no = host.querySelector('[data-a="noimg"]');
    if (no) no.onclick = async () => { await MM.img.del(c.image); c.image = null; save(); renderTeacher(); };
    host.querySelector('[data-a="del"]').onclick = async () => {
      if (!confirm('Delete the page "' + c.title + '"?')) return;
      if (c.image) await MM.img.del(c.image);
      S.custom = S.custom.filter(x => x !== c); openPanel = null; syncSteps(); save(); renderTeacher();
    };
  }

  async function exportBackup() {
    const data = { app: 'morning-meeting', version: 1, saved: new Date().toISOString(), settings: S, library: MM.store.get('mm.library.v1', {}), images: await MM.img.all() };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'morning-meeting-backup-' + dateKey(new Date()) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function importBackup() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json,application/json';
    input.onchange = async () => {
      const f = input.files[0]; if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (data.app !== 'morning-meeting' || !data.settings) throw new Error('not a Morning Meeting backup');
        if (!confirm('Replace this computer\'s board with the one in the backup file?')) return;
        S = Object.assign(defaults(), data.settings);
        for (const [k, v] of Object.entries(data.images || {})) await MM.img.put(k, v);
        if (data.library) MM.store.set('mm.library.v1', data.library);
        syncSteps(); save(); applyTheme(); renderTeacher(); showStep(0);
        alert('Backup opened.');
      } catch (e) { alert('That file could not be opened: ' + e.message); }
    };
    input.click();
  }

  const IDEAS = [
    '<b>Question of the Day</b>: add your own page with a question and a photo.',
    '<b>Birthdays and trips</b>: add them to the Calendar so they show on the right day.',
    '<b>Word of the Day</b>: an own page with a word, a picture and a sentence to read together.',
    '<b>Class goal</b>: an own page with this week\'s goal ("I will use kind words").',
    '<b>Lunch menu</b>: snap a photo of the menu and add it as a page.',
    '<b>Helpers and attendance</b>: turn on the "Who\'s Here" station and type first names.',
    '<b>Different game each day</b>: in Warm-up Game, choose "a different game every day".',
  ];

  // ---------- start ----------
  syncSteps(); save(); applyTheme(); tick();
  let start = 0;
  try {
    const last = sessionStorage.getItem('mm.step');
    const idx = activeSteps().findIndex(s => s.id === last);
    if (idx >= 0) start = idx;
  } catch (e) { /* ignore */ }
  showStep(start);
})();
