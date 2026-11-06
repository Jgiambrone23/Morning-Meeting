/* Station: Season and months of the year — with a real photo of each season from the library */
(function () {
  const { esc, MONTHS } = MM.util;
  const SEASONS = [
    { id: 'winter', l: 'Winter', m: 'December · January · February', t: 'Cooler mornings. Some days we need a jacket. No snow in Florida!' },
    { id: 'spring', l: 'Spring', m: 'March · April · May', t: 'Warm and sunny. Flowers bloom. Baby animals are born.' },
    { id: 'summer', l: 'Summer', m: 'June · July · August', t: 'Hot and humid. Afternoon thunderstorms. We drink lots of water.' },
    { id: 'fall', l: 'Fall', m: 'September · October · November', t: 'Still warm. Hurricane season ends in November. It slowly gets cooler.' },
  ];
  function seasonOf(d) {
    const md = d.getMonth() * 100 + d.getDate();
    if (md >= 220 && md < 521) return 'spring';
    if (md >= 521 && md < 822) return 'summer';
    if (md >= 822 && md < 1121) return 'fall';
    return 'winter';
  }
  MM.register({
    id: 'season',
    title: 'Season',
    icon: '🍂',
    description: 'The four seasons with today\'s season highlighted, and the month.',
    defaultOn: true,
    render(el, ctx) {
      const now = seasonOf(ctx.date);
      const s = SEASONS.find(x => x.id === now);
      const month = MONTHS[ctx.date.getMonth()];
      el.innerHTML =
        '<h1 class="station-title">What season is it?</h1>' +
        '<div class="frame" data-say="' + esc('The month is ' + month + '. The season is ' + s.l + '.') + '">The month is <b>' + month + '</b>. The season is <b>' + s.l + '</b>. 🔊</div>' +
        '<div class="grid season-grid">' + SEASONS.map(x =>
          '<div class="season-card' + (x.id === now ? ' on' : '') + '" data-say="' + esc(x.l + '. ' + x.t) + '">' +
          '<div class="season-photo"><img alt="" data-lib="season-' + x.id + '"></div><h2>' + x.l + '</h2><div class="months">' + x.m + '</div><p>' + esc(x.t) + '</p></div>').join('') +
        '</div>' +
        (MM.lib.has('season-winter') ? '' : '<p class="hint" style="text-align:center">Season photos appear after the picture download (Teacher → Warm Up → Change).</p>');
      el.querySelectorAll('img[data-lib]').forEach(im => MM.lib.get(im.dataset.lib).then(u => { if (u) im.src = u; else im.parentElement.remove(); }));
    },
  });
})();
