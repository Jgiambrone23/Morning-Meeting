/* Station: Activity — one tab that holds every game and life-skill activity.
   Opens on a menu (with today's suggestion); each activity is drawn by its own module. */
(function () {
  const { esc, hash, dateKey } = MM.util;

  function catalogue(settings) {
    const G = MM.modules.games, LS = MM.modules.lifeskills, X = MM.modules.extras;
    const hidden = id => (settings[id] || {}).hide || [];
    const list = [];
    G.games.forEach(g => { if (!hidden('games').includes(g.id)) list.push({ mod: 'games', id: g.id, title: g.title, icon: g.icon, group: 'Looking games' }); });
    X.tabs.forEach(t => { if (!hidden('extras').includes(t[0]) && t[3] === 'word') list.push({ mod: 'extras', id: t[0], title: t[1], icon: t[2], group: 'Word games' }); });
    LS.tabs.forEach(t => { if (!hidden('lifeskills').includes(t[0])) list.push({ mod: 'lifeskills', id: t[0], title: t[1], icon: t[2], group: 'Life skills' }); });
    X.tabs.forEach(t => { if (!hidden('extras').includes(t[0]) && t[3] === 'life') list.push({ mod: 'extras', id: t[0], title: t[1], icon: t[2], group: 'Life skills' }); });
    return list;
  }

  MM.register({
    id: 'activity',
    title: 'Warm Up',
    icon: '🎯',
    description: 'Looking games, word games and life skills in one place. Opens on a menu with today\'s suggestion.',
    defaultOn: true,
    render(el, ctx) {
      const day = ctx.day, s = ctx.settings;
      const all = catalogue(ctx.app.mod);
      if (!all.length) { el.innerHTML = '<div class="empty">Every activity is turned off. Turn some on in Teacher → Warm Up → Change.</div>'; return; }
      const suggestion = all[hash(dateKey(ctx.date)) % all.length];
      const key = a => a.mod + ':' + a.id;
      let pick = day.pick && all.find(a => key(a) === day.pick) ? all.find(a => key(a) === day.pick) : null;
      if (!pick && s.start === 'suggest') pick = suggestion;

      function menu() {
        const groups = [];
        all.forEach(a => { let g = groups.find(x => x.name === a.group); if (!g) { g = { name: a.group, items: [] }; groups.push(g); } g.items.push(a); });
        el.innerHTML = '<h1 class="station-title">Warm up: what are we doing today?</h1>' +
          '<div class="frame" data-say="' + esc('Today\'s suggestion is ' + suggestion.title) + '">Today\'s suggestion: <b>' + esc(suggestion.title) + '</b></div>' +
          groups.map(g => '<h2 class="sub">' + esc(g.name) + '</h2><div class="grid act-grid">' + g.items.map(a =>
            '<button class="choice' + (a === suggestion ? ' on' : '') + '" data-pick="' + key(a) + '"><span class="ico-box">' + MM.icons.tab(a.id === 'talk' && a.mod === 'lifeskills' ? 'goodchoice' : a.id) + '</span>' + esc(a.title) + '</button>').join('') + '</div>').join('');
        el.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => { day.pick = b.dataset.pick; ctx.saveDay(); pick = all.find(a => key(a) === day.pick); show(); });
      }
      function show() {
        if (!pick) return menu();
        const sub = MM.ctxFor(pick.mod);
        sub.embedded = true;
        if (pick.mod === 'games') sub.day.game = pick.id; else sub.day.tab = pick.id;
        sub.saveDay();
        el.innerHTML = '<div class="row" style="justify-content:flex-start"><button class="btn" id="toMenu">◀ Activities</button></div><div id="actHost"></div>';
        el.querySelector('#toMenu').onclick = () => { day.pick = null; ctx.saveDay(); pick = null; menu(); };
        const host = el.querySelector('#actHost');
        try { MM.modules[pick.mod].render(host, sub); }
        catch (e) { console.error(e); host.innerHTML = '<div class="empty">This activity had a problem: ' + esc(e.message) + '</div>'; }
      }
      show();
    },
    settings(el, ctx) {
      const s = ctx.settings;
      el.innerHTML =
        '<div class="field">When the Warm Up tab opens ' +
        '<label class="field check"><input type="radio" name="actStart" value="menu" ' + (s.start !== 'suggest' ? 'checked' : '') + '> Show the menu, with today\'s suggestion highlighted</label>' +
        '<label class="field check"><input type="radio" name="actStart" value="suggest" ' + (s.start === 'suggest' ? 'checked' : '') + '> Go straight to today\'s suggested activity (a different one each day)</label></div>' +
        '<h4>Looking games</h4><div id="setGames"></div><h4>Word games and extra life skills</h4><div id="setExtras"></div><h4>Life skills</h4><div id="setLife"></div>';
      el.querySelectorAll('[name=actStart]').forEach(r => r.onchange = () => { s.start = r.value; ctx.saveSettings(); });
      MM.modules.games.settings(el.querySelector('#setGames'), MM.ctxFor('games'));
      MM.modules.extras.settings(el.querySelector('#setExtras'), MM.ctxFor('extras'));
      MM.modules.lifeskills.settings(el.querySelector('#setLife'), MM.ctxFor('lifeskills'));
    },
  });
})();
