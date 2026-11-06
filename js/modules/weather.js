/* Station: Weather — pick today's weather and temperature, then "what should we wear?" */
(function () {
  const { esc } = MM.util;
  const I = MM.icons;
  // Florida weather: no snow; thunderstorms, humidity and hurricane season instead.
  const SKY = [
    { id: 'sunny', l: 'Sunny' }, { id: 'partly', l: 'Partly cloudy' }, { id: 'cloudy', l: 'Cloudy' }, { id: 'rainy', l: 'Rainy' },
    { id: 'stormy', l: 'Thunderstorm' }, { id: 'humid', l: 'Humid' }, { id: 'windy', l: 'Windy' }, { id: 'hurricane', l: 'Hurricane watch' },
  ];
  const TEMP = [{ id: 'hot', l: 'Hot' }, { id: 'warm', l: 'Warm' }, { id: 'cool', l: 'Cool' }, { id: 'cold', l: 'Chilly' }];
  // [icon key, label, photo key]
  const WEAR = {
    hot: [['shorts', 'Shorts'], ['tshirt', 'T-shirt'], ['sunscreen', 'Sunscreen'], ['bottle', 'Water bottle']],
    warm: [['tshirt', 'T-shirt'], ['shorts', 'Shorts'], ['sneakers', 'Sneakers'], ['bottle', 'Water bottle']],
    cool: [['hoodie', 'Sweatshirt'], ['pants', 'Long pants'], ['sneakers', 'Sneakers']],
    cold: [['coat', 'Jacket'], ['pants', 'Long pants'], ['socks', 'Socks']],
    sunny: [['sunglasses', 'Sunglasses'], ['hat', 'Hat'], ['sunscreen', 'Sunscreen']],
    humid: [['bottle', 'Water bottle'], ['tshirt', 'Light shirt']],
    rainy: [['umbrella', 'Umbrella'], ['boots', 'Rain boots'], ['raincoat', 'Raincoat']],
    stormy: [['house', 'Stay inside — lightning'], ['umbrella', 'Umbrella']],
    hurricane: [['house', 'Stay safe inside'], ['bottle', 'Water and supplies']],
    windy: [['hoodie', 'Sweatshirt']],
  };
  function codeToSky(c) {
    if (c === 0 || c === 1) return 'sunny';
    if (c === 2) return 'partly';
    if (c === 3) return 'cloudy';
    if (c === 45 || c === 48) return 'foggy';
    if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return 'rainy';
    if ((c >= 71 && c <= 77) || c === 85 || c === 86) return 'snowy';
    if (c >= 95) return 'stormy';
    return 'cloudy';
  }

  MM.register({
    id: 'weather',
    title: 'Weather',
    icon: '🌦',
    description: 'Choose today\'s weather and what to wear. Can also check the real forecast.',
    defaultOn: true,
    render(el, ctx) {
      const day = ctx.day;
      day.sky = day.sky || [];
      function draw() {
        const sky = SKY.map(w => '<button class="choice' + (day.sky.includes(w.id) ? ' on' : '') + '" data-sky="' + w.id + '" data-say="' + w.l + '">' +
          '<span class="artbox">' + MM.art.WEATHER[w.id] + '</span>' + w.l + '</button>').join('');
        const temp = TEMP.map(w => '<button class="choice' + (day.temp === w.id ? ' on' : '') + '" data-temp="' + w.id + '" data-say="' + w.l + '">' +
          '<span class="artbox">' + MM.art.TEMP[w.id] + '</span>' + w.l + '</button>').join('');
        const wear = [];
        [day.temp].concat(day.sky).forEach(k => (WEAR[k] || []).forEach(x => { if (!wear.some(y => y[1] === x[1])) wear.push(x); }));
        const PHRASE = { stormy: 'stormy', hurricane: 'under a hurricane watch', humid: 'humid', partly: 'partly cloudy' };
        const skyWords = day.sky.map(id => PHRASE[id] || SKY.find(s => s.id === id).l.toLowerCase());
        const sentence = skyWords.length || day.temp
          ? 'Today it is ' + [day.temp, skyWords.join(' and ')].filter(Boolean).join(' and ') + '.'
          : 'What is the weather today?';
        el.innerHTML =
          '<h1 class="station-title">What is the weather today?</h1>' +
          '<div class="frame" data-say="' + esc(sentence) + '">' + esc(sentence) + ' 🔊</div>' +
          '<div class="grid w-grid">' + sky + '</div>' +
          '<div class="grid t-grid">' + temp + '</div>' +
          (wear.length ? '<h2 class="sub">What should we wear or bring?</h2><div class="grid wear">' +
            wear.map(w => '<div class="card" data-say="' + esc(w[1]) + '"><span class="artbox">' + (MM.art.WEAR[w[0]] || '') + '</span><b>' + esc(w[1]) + '</b></div>').join('') + '</div>' : '') +
          (ctx.settings.city ? '<div class="live-weather"><button class="btn" id="live">Check the real weather in ' + esc(ctx.settings.city) + '</button><div id="liveOut"></div></div>' : '');
        MM.lib.fill(el);
        el.querySelectorAll('[data-sky]').forEach(b => b.onclick = () => {
          const id = b.dataset.sky;
          day.sky = day.sky.includes(id) ? day.sky.filter(x => x !== id) : day.sky.concat(id);
          ctx.saveDay(); draw();
        });
        el.querySelectorAll('[data-temp]').forEach(b => b.onclick = () => { day.temp = day.temp === b.dataset.temp ? null : b.dataset.temp; ctx.saveDay(); draw(); });
        const live = el.querySelector('#live');
        if (live) live.onclick = () => checkLive(el.querySelector('#liveOut'), ctx);
      }
      draw();
    },
    settings(el, ctx) {
      el.innerHTML =
        '<label class="field">Town for the real forecast (optional) <input data-k="city" placeholder="Fort Lauderdale" value="' + esc(ctx.settings.city || '') + '"></label>' +
        '<p class="hint">If you type a town, a button appears that looks up the real weather from Open-Meteo, a free weather service. Only the town name is sent.</p>' +
        '<label class="field">Temperature in <select data-k="unit"><option value="fahrenheit">°F</option><option value="celsius">°C</option></select></label>';
      el.querySelector('[data-k="unit"]').value = ctx.settings.unit || 'fahrenheit';
      el.querySelectorAll('[data-k]').forEach(i => {
        const fn = () => { ctx.settings[i.dataset.k] = i.value.trim(); delete ctx.settings.geo; ctx.saveSettings(); };
        i.oninput = fn; i.onchange = fn;
      });
    },
  });

  async function checkLive(out, ctx) {
    out.textContent = 'Checking…';
    try {
      const s = ctx.settings;
      if (!s.geo) {
        const g = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&name=' + encodeURIComponent(s.city)).then(r => r.json());
        if (!g.results || !g.results.length) throw new Error('could not find that town');
        s.geo = { lat: g.results[0].latitude, lon: g.results[0].longitude };
        ctx.saveSettings();
      }
      const unit = s.unit || 'fahrenheit';
      const w = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + s.geo.lat + '&longitude=' + s.geo.lon +
        '&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto&temperature_unit=' + unit).then(r => r.json());
      const t = Math.round(w.current.temperature_2m);
      const sky = SKY.find(x => x.id === codeToSky(w.current.weather_code));
      const hi = Math.round(w.daily.temperature_2m_max[0]), lo = Math.round(w.daily.temperature_2m_min[0]);
      const deg = unit === 'celsius' ? '°C' : '°F';
      const msg = 'Right now it is ' + t + ' degrees and ' + sky.l.toLowerCase() + '. Today\'s high is ' + hi + ' and the low is ' + lo + '.';
      out.innerHTML = '<p><span class="artbox inline">' + MM.art.WEATHER[sky.id] + '</span> <b>' + t + deg + '</b> and ' + esc(sky.l.toLowerCase()) +
        ' · High ' + hi + deg + ' · Low ' + lo + deg + '</p><p class="hint">Did we guess right?</p>';
      ctx.speak(msg);
    } catch (e) { out.textContent = 'Could not get the weather right now (' + e.message + ').'; }
  }
})();
