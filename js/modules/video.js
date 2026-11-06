/* Station: Video Pickers — two students a day choose the end-of-meeting video, in a fair
   rotation (nobody picks twice until everyone has had a turn). Names come from the Who's Here
   station if it is on, otherwise from this station's own list. The teacher keeps a list of
   video links; students tap one to play it on the board. */
(function () {
  const { esc, parseLines, dateKey, celebrate } = MM.util;

  function videoId(url) {
    const m = String(url).match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  MM.register({
    id: 'video',
    title: 'Video Pickers',
    icon: '',
    iconKey: 'video',
    description: 'Two students a day choose the end-of-meeting video, taking fair turns. Keeps a list of your video links.',
    defaultOn: true,
    render(el, ctx) {
      const s = ctx.settings, day = ctx.day;
      const fromPeople = ctx.peopleNames();
      const names = fromPeople.length ? fromPeople : parseLines(s.names, ['n']).map(x => x.n);
      const videos = parseLines(s.videos, ['title', 'url']).filter(v => v.url || videoId(v.title)).map(v => videoId(v.url) ? v : { title: v.url || v.title, url: v.title });
      const count = +(s.count || 2);
      s.history = s.history || [];      // names who have had a turn this round, oldest first

      // Pick today's students once, then remember them for the day.
      if (!day.pickers && names.length) {
        const had = new Set(s.history);
        let pool = names.filter(n => !had.has(n));
        const chosen = [];
        while (chosen.length < Math.min(count, names.length)) {
          if (!pool.length) { s.history = []; pool = names.filter(n => !chosen.includes(n)); }   // new round
          const n = pool[Math.floor(Math.random() * pool.length)];
          chosen.push(n); pool = pool.filter(x => x !== n);
        }
        day.pickers = chosen; chosen.forEach(n => s.history.push(n));
        ctx.saveDay(); ctx.saveSettings();
      }
      const pickers = day.pickers || [];

      function draw() {
        const playing = day.playing ? videos.find(v => videoId(v.url) === day.playing) : null;
        let html = '<div class="title-row"><h1 class="station-title">' + esc(s.title || 'Who picks the video today?') + '</h1><button class="btn edit-btn" id="editVideo">Edit</button></div>';
        if (!names.length) {
          html += '<div class="empty">Tap <b>Edit</b> to add first names and video links (or turn on the Who\'s Here station for names).</div>';
        } else {
          html += '<div class="pickers">' + pickers.map(n => '<div class="card picker" data-say="' + esc(n + ' picks a video today') + '"><div class="lbl">Video picker</div><div class="big-name">' + esc(n) + '</div></div>').join('') + '</div>' +
            '<div class="frame" data-say="' + esc(pickers.join(' and ') + ' pick the video today') + '">' + esc(pickers.join(' and ')) + ' pick the video today. 🔊</div>';
          const left = names.filter(n => !s.history.includes(n));
          html += '<p class="hint" style="text-align:center">' + (left.length ? 'Still waiting for a turn: ' + esc(left.join(', ')) : 'Everyone has had a turn — a new round starts tomorrow.') + ' <button class="btn" id="redo">Pick again</button></p>';
        }
        if (playing) {
          html += '<div class="video-wrap"><iframe src="https://www.youtube-nocookie.com/embed/' + videoId(playing.url) + '?rel=0&modestbranding=1" title="' + esc(playing.title) + '" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe></div>' +
            '<div class="row"><button class="btn" id="stop">◀ Back to the list</button></div>';
        } else if (videos.length) {
          html += '<h2 class="sub">Tap a video</h2><div class="grid video-grid">' + videos.map(v => '<button class="choice vcard" data-v="' + videoId(v.url) + '">' +
            '<img alt="" src="https://i.ytimg.com/vi/' + videoId(v.url) + '/mqdefault.jpg"><span>' + esc(v.title) + '</span></button>').join('') + '</div>';
        } else {
          html += '<div class="row"><a class="btn big" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=' + encodeURIComponent(s.search || 'Danny Go') + '">Open YouTube: ' + esc(s.search || 'Danny Go') + ' ↗</a></div>' +
            '<p class="hint" style="text-align:center">Add your favourite video links in Teacher → Video Pickers → Change and they will show here as tap-to-play cards.</p>';
        }
        el.innerHTML = html;
        el.querySelector('#editVideo').onclick = () => MM.openTeacher('video');
        el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { day.playing = b.dataset.v; ctx.saveDay(); draw(); });
        const st = el.querySelector('#stop'); if (st) st.onclick = () => { day.playing = null; ctx.saveDay(); draw(); };
        const rd = el.querySelector('#redo'); if (rd) rd.onclick = () => {
          if (!confirm('Pick two different students for today?')) return;
          pickers.forEach(n => { const i = s.history.lastIndexOf(n); if (i >= 0) s.history.splice(i, 1); });
          day.pickers = null; ctx.saveDay(); ctx.saveSettings(); ctx.rerender();
        };
      }
      draw();
      if (pickers.length && !day.announced) { day.announced = true; ctx.saveDay(); setTimeout(() => celebrate(pickers.join(' & ')), 300); }
    },
    settings(el, ctx) {
      const s = ctx.settings;
      const people = (ctx.app.steps.find(x => x.id === 'people') || {}).on;
      el.innerHTML =
        '<label class="field">Title on the page <input data-k="title" placeholder="Who picks the video today?" value="' + esc(s.title || '') + '"></label>' +
        '<label class="field">How many pickers a day <select data-k="count"><option>1</option><option>2</option><option>3</option></select></label>' +
        (people ? '<p class="hint">Names come from the Who\'s Here station (students marked away are skipped).</p>' :
          '<label class="field">Students, one first name per line (saved on this computer only)<textarea rows="8" data-k="names">' + esc(s.names || '') + '</textarea></label>') +
        '<label class="field">Videos, one per line: <code>name | YouTube link</code><textarea rows="8" data-k="videos" placeholder="Banana Banana Meatball | https://www.youtube.com/watch?v=...">' + esc(s.videos || '') + '</textarea></label>' +
        '<label class="field">If there are no links yet, the page offers a YouTube search for <input data-k="search" class="short" style="width:12em" placeholder="Danny Go" value="' + esc(s.search || '') + '"></label>' +
        '<p class="hint">Turns so far this round: ' + esc((s.history || []).join(', ') || 'none') + '. <button class="btn" id="resetTurns">Start a new round</button></p>';
      el.querySelector('[data-k="count"]').value = String(s.count || 2);
      el.querySelectorAll('[data-k]').forEach(i => { const fn = () => { s[i.dataset.k] = i.value; ctx.saveSettings(); }; i.oninput = fn; i.onchange = fn; });
      el.querySelector('#resetTurns').onclick = () => { s.history = []; ctx.saveSettings(); ctx.rerender(); alert('New round started.'); };
    },
  });
})();
