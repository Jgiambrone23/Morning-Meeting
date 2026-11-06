/* Flat vector illustrations (clean, soft-gradient "clip-art" style) for weather, temperature,
   clothing, the schedule and calendar stickers. Drawn here as SVG so they look the same on
   every device and need no download. */
(function () {
  let n = 0;
  const uid = () => 'g' + (n++);
  // Card with a sky-blue gradient background (weather) or a soft tint (everything else).
  function card(body, opts) {
    opts = opts || {};
    const id = uid();
    const bg = opts.sky
      ? '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5aaef5"/><stop offset="1" stop-color="#bfe3ff"/></linearGradient>'
      : '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (opts.tint || '#eef3fb') + '"/><stop offset="1" stop-color="#ffffff"/></linearGradient>';
    return '<svg class="art" viewBox="0 0 160 120" aria-hidden="true"><defs>' + bg + (opts.defs || '') + '</defs>' +
      '<rect width="160" height="120" rx="14" fill="url(#' + id + ')"/>' + body + '</svg>';
  }
  const sunDefs = id => '<radialGradient id="' + id + '" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe066"/><stop offset="0.7" stop-color="#ffb300"/><stop offset="1" stop-color="#f28c00"/></radialGradient>';
  function sun(cx, cy, r, id) {
    let rays = '';
    for (let i = 0; i < 12; i++) {
      const a = i * 30 * Math.PI / 180, a1 = a - 0.13, a2 = a + 0.13;
      rays += '<polygon points="' + (cx + Math.cos(a1) * r * 1.15).toFixed(1) + ',' + (cy + Math.sin(a1) * r * 1.15).toFixed(1) + ' ' +
        (cx + Math.cos(a) * r * 1.6).toFixed(1) + ',' + (cy + Math.sin(a) * r * 1.6).toFixed(1) + ' ' +
        (cx + Math.cos(a2) * r * 1.15).toFixed(1) + ',' + (cy + Math.sin(a2) * r * 1.15).toFixed(1) + '" fill="#ffb300"/>';
    }
    return rays + '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#' + id + ')"/>';
  }
  const cloud = (x, y, s, fill, shade) =>
    '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><ellipse cx="30" cy="22" rx="30" ry="12" fill="' + (shade || '#dfeefc') + '"/>' +
    '<circle cx="14" cy="16" r="11" fill="' + (fill || '#fff') + '"/><circle cx="30" cy="10" r="15" fill="' + (fill || '#fff') + '"/><circle cx="46" cy="16" r="11" fill="' + (fill || '#fff') + '"/><rect x="8" y="16" width="44" height="10" fill="' + (fill || '#fff') + '"/></g>';
  const drop = (x, y) => '<path d="M' + x + ' ' + y + 'c-4 6-6 9-6 12a6 6 0 0 0 12 0c0-3-2-6-6-12z" fill="#4aa3df"/>';
  const flake = (x, y) => '<g stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M' + x + ' ' + (y - 7) + 'v14M' + (x - 6) + ' ' + (y - 3.5) + 'l12 7M' + (x - 6) + ' ' + (y + 3.5) + 'l12-7"/></g>';

  const WEATHER = {};
  (function () {
    let id = uid(); WEATHER.sunny = card(sun(80, 56, 24, id) + cloud(4, 86, 0.7) + cloud(104, 80, 0.8), { sky: true, defs: sunDefs(id) });
    id = uid(); WEATHER.partly = card(sun(62, 46, 20, id) + cloud(50, 50, 1.2) + cloud(0, 88, 0.6), { sky: true, defs: sunDefs(id) });
    WEATHER.cloudy = card(cloud(16, 34, 1.4, '#f4f8fc', '#c9d8e8') + cloud(78, 56, 1.1, '#e6eef8', '#b8c9dd'), { sky: true });
    WEATHER.rainy = card(cloud(30, 20, 1.5, '#e9eff6', '#b8c6d6') + drop(52, 76) + drop(78, 82) + drop(104, 76) + drop(65, 98) + drop(91, 102), { sky: true });
    WEATHER.stormy = card(cloud(28, 16, 1.5, '#cfd8e3', '#8fa2b8') + '<polygon points="84,54 66,84 80,84 70,112 98,74 84,74 94,54" fill="#ffd23f" stroke="#f29d00" stroke-width="2"/>', { sky: true });
    WEATHER.snowy = card(cloud(30, 18, 1.5, '#f4f8fc', '#c9d8e8') + flake(52, 84) + flake(80, 96) + flake(108, 84), { sky: true });
    WEATHER.windy = card('<g fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"><path d="M20 44h70a12 12 0 1 0-12-12"/><path d="M20 66h96a12 12 0 1 1-12 12"/><path d="M20 88h50a9 9 0 1 1-9 9"/></g>' + cloud(104, 14, 0.6), { sky: true });
    id = uid(); WEATHER.humid = card(sun(44, 40, 16, id) + '<g fill="#8ad0ff" opacity=".9">' + [96, 116, 136].map(x => '<path d="M' + x + ' 54c-5 7-7 10-7 14a7 7 0 0 0 14 0c0-4-2-7-7-14z"/>').join('') + '</g>' +
      '<g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"><path d="M20 84q12-8 24 0t24 0 24 0 24 0 24 0"/><path d="M20 100q12-8 24 0t24 0 24 0 24 0 24 0"/></g>', { sky: true, defs: sunDefs(id) });
    WEATHER.hurricane = card('<g fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"><path d="M80 60m-10 0a10 10 0 1 0 20 0a20 20 0 1 0-40 0a30 30 0 1 0 60 0a40 40 0 1 0-80 0"/></g><circle cx="80" cy="60" r="8" fill="#ffd23f"/>', { sky: true });
    WEATHER.foggy = card(cloud(40, 10, 1.3, '#e6eef8', '#c0cfe0') + '<g stroke="#f4f8fc" stroke-width="8" stroke-linecap="round" opacity=".95"><path d="M18 70h124M28 86h104M18 102h124"/></g>', { sky: true });
  })();

  function thermo(level, color, accent) {
    const h = 20 + level * 14;
    return card('<rect x="64" y="14" width="32" height="70" rx="16" fill="#fff" stroke="#9fb3c8" stroke-width="3"/>' +
      '<rect x="74" y="' + (78 - h) + '" width="12" height="' + (h + 6) + '" rx="6" fill="' + color + '"/>' +
      '<circle cx="80" cy="92" r="16" fill="#fff" stroke="#9fb3c8" stroke-width="3"/><circle cx="80" cy="92" r="10" fill="' + color + '"/>' +
      '<g stroke="#9fb3c8" stroke-width="3" stroke-linecap="round"><path d="M100 30h10M100 44h10M100 58h10M100 72h10"/></g>' + (accent || ''), { tint: '#f4f6fa' });
  }
  const TEMP = {
    hot: (() => { const id = uid(); return card(sun(32, 30, 14, id) + '<rect x="64" y="14" width="32" height="70" rx="16" fill="#fff" stroke="#9fb3c8" stroke-width="3"/><rect x="74" y="18" width="12" height="66" rx="6" fill="#e5443b"/><circle cx="80" cy="92" r="16" fill="#fff" stroke="#9fb3c8" stroke-width="3"/><circle cx="80" cy="92" r="10" fill="#e5443b"/>', { tint: '#fff1ea', defs: sunDefs(id) }); })(),
    warm: thermo(3, '#f29d3a', cloud(104, 20, 0.6, '#fff', '#ffe1b8')),
    cool: thermo(2, '#4aa3df', '<g fill="#e07b39"><path d="M30 30q10-14 20 0q-10 14-20 0z"/><path d="M118 60q10-14 20 0q-10 14-20 0z"/></g>'),
    cold: thermo(1, '#2f7fd1', '<g stroke="#8ccbff" stroke-width="3" stroke-linecap="round"><path d="M30 24v20M20 29l20 10M20 39l20-10"/><path d="M126 60v20M116 65l20 10M116 75l20-10"/></g>'),
  };

  const soft = (body, tint) => card(body, { tint: tint || '#eef3fb' });
  const WEAR = {
    shorts: soft('<path d="M44 26h72l6 60H88l-8-30-8 30H38z" fill="#3f8ed8"/><rect x="44" y="26" width="72" height="10" fill="#2f6fb0"/>'),
    tshirt: soft('<path d="M56 20h48l24 16-10 14-10-5v56H52V45l-10 5-10-14z" fill="#4caf7d"/><path d="M68 20q12 12 24 0" fill="#3a8f63"/>'),
    sunscreen: soft('<rect x="60" y="34" width="40" height="70" rx="8" fill="#ffb300"/><rect x="70" y="18" width="20" height="18" rx="3" fill="#f28c00"/><rect x="66" y="52" width="28" height="30" rx="4" fill="#fff"/>'),
    bottle: soft('<rect x="62" y="34" width="36" height="76" rx="10" fill="#4aa3df"/><rect x="70" y="14" width="20" height="22" rx="4" fill="#2f6fb0"/><rect x="68" y="56" width="24" height="26" rx="4" fill="#dff0fb"/>'),
    pants: soft('<path d="M50 14h60v96H88l-8-50-8 50H50z" fill="#3f5a8a"/><rect x="50" y="14" width="60" height="10" fill="#2a3f63"/>'),
    sneakers: soft('<path d="M20 86q0-14 16-18l18-26 18 10 50 14q18 4 18 20z" fill="#e5443b"/><path d="M20 86h120v10H20z" fill="#fff" stroke="#d9dee7" stroke-width="2"/><path d="M60 58l10 4M68 50l10 4" stroke="#fff" stroke-width="3"/>'),
    coat: soft('<path d="M48 22h64l20 14-8 14-8-4v62H44V46l-8 4-8-14z" fill="#2f6fb0"/><path d="M80 22v86" stroke="#1f4f86" stroke-width="4"/><circle cx="72" cy="50" r="3" fill="#fff"/><circle cx="72" cy="68" r="3" fill="#fff"/><circle cx="72" cy="86" r="3" fill="#fff"/><path d="M64 22l16 16 16-16" fill="#1f4f86"/>'),
    socks: soft('<path d="M54 14h40v44l24 24-20 20-28-22v-6l-16 16-20-20 20-20z" fill="#9b6bd6"/><rect x="54" y="14" width="40" height="14" fill="#fff"/>'),
    scarf: soft('<rect x="44" y="30" width="72" height="28" rx="6" fill="#e5443b"/><path d="M60 58l-10 50h24l2-50z" fill="#e5443b"/><path d="M96 58l10 50H86l-4-50z" fill="#c9372f"/><path d="M50 40h60M50 48h60" stroke="#fff" stroke-width="3" opacity=".6"/>'),
    gloves: soft('<path d="M56 108V62l-14-18 10-8 16 18V22h12v26h8V22h12v26l12-14 10 8-16 22v44z" fill="#f29d3a"/><rect x="56" y="92" width="50" height="16" fill="#e07b39"/>'),
    hat: soft('<path d="M38 72q42-62 84 0z" fill="#e5443b"/><rect x="34" y="70" width="92" height="18" rx="9" fill="#c9372f"/><circle cx="80" cy="28" r="8" fill="#fff"/>'),
    sunglasses: soft('<circle cx="52" cy="66" r="24" fill="#1d2433"/><circle cx="108" cy="66" r="24" fill="#1d2433"/><path d="M76 62h8M16 56l12-6M144 56l-12-6" stroke="#1d2433" stroke-width="5" stroke-linecap="round"/><path d="M40 54q8-6 16 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>'),
    umbrella: soft('<path d="M20 64a60 60 0 0 1 120 0z" fill="#e5443b"/><path d="M50 64a30 60 0 0 1 60 0z" fill="#ffd23f"/><path d="M80 64v36a8 8 0 0 1-16 0" stroke="#1d2433" stroke-width="5" fill="none" stroke-linecap="round"/>'),
    boots: soft('<path d="M48 14h40v50l36 16v26H48z" fill="#4caf7d"/><rect x="48" y="14" width="40" height="12" fill="#3a8f63"/><path d="M48 96h76v10H48z" fill="#2d6e4c"/>'),
    hoodie: soft('<path d="M48 30h64l20 14-8 14-8-4v56H44V54l-8 4-8-14z" fill="#7a8fb0"/><path d="M62 30q18-22 36 0q-18 10-36 0z" fill="#5c6f8f"/><rect x="60" y="70" width="40" height="22" rx="6" fill="#5c6f8f"/>'),
    raincoat: soft('<path d="M48 30h64l20 14-8 14-8-4v56H44V54l-8 4-8-14z" fill="#ffd23f"/><path d="M62 30q18-22 36 0q-18 10-36 0z" fill="#f2b700"/><path d="M80 30v80" stroke="#f2b700" stroke-width="4"/><circle cx="72" cy="56" r="3" fill="#1d2433"/><circle cx="72" cy="76" r="3" fill="#1d2433"/>'),
    house: soft('<path d="M24 62L80 18l56 44v46H24z" fill="#ffd9a8"/><path d="M16 64L80 14l64 50" fill="none" stroke="#c9372f" stroke-width="8" stroke-linejoin="round"/><rect x="66" y="74" width="28" height="34" fill="#8d5a3a"/><rect x="36" y="70" width="18" height="18" fill="#9fd8ff"/><rect x="106" y="70" width="18" height="18" fill="#9fd8ff"/>'),
  };

  const SCHEDULE = {
    meeting: soft('<circle cx="40" cy="48" r="12" fill="#f29d3a"/><circle cx="80" cy="36" r="12" fill="#4aa3df"/><circle cx="120" cy="48" r="12" fill="#9b6bd6"/><path d="M20 96a20 20 0 0 1 40 0zM60 84a20 20 0 0 1 40 0zM100 96a20 20 0 0 1 40 0z" fill="#dfeefc"/><path d="M20 96a20 20 0 0 1 40 0z" fill="#f7c58e"/><path d="M60 84a20 20 0 0 1 40 0z" fill="#9fd0f2"/><path d="M100 96a20 20 0 0 1 40 0z" fill="#c9b0ea"/>', '#fff4e6'),
    reading: soft('<path d="M24 32q28-10 56 4v62q-28-14-56-4z" fill="#4aa3df"/><path d="M136 32q-28-10-56 4v62q28-14 56-4z" fill="#3f8ed8"/><path d="M36 48q18-4 36 2M36 62q18-4 36 2M88 50q18-6 36-2M88 64q18-6 36-2" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/>', '#e8f2fc'),
    math: soft('<text x="30" y="60" font-size="44" font-weight="800" fill="#e5443b" font-family="Arial">2</text><text x="60" y="60" font-size="40" font-weight="800" fill="#1d2433" font-family="Arial">+</text><text x="88" y="60" font-size="44" font-weight="800" fill="#4aa3df" font-family="Arial">3</text><text x="40" y="104" font-size="40" font-weight="800" fill="#1d2433" font-family="Arial">=</text><text x="76" y="106" font-size="44" font-weight="800" fill="#4caf7d" font-family="Arial">5</text>', '#f3f0ff'),
    snack: soft('<circle cx="80" cy="68" r="34" fill="#e5443b"/><circle cx="68" cy="56" r="10" fill="#ff7b72" opacity=".7"/><rect x="77" y="22" width="6" height="18" rx="3" fill="#6b4a2b"/><path d="M84 34q14-14 26-2q-14 10-26 2z" fill="#4caf7d"/>', '#fdeeee'),
    recess: (() => { const id = uid(); return card(sun(30, 28, 12, id) + '<path d="M40 100L110 30" stroke="#4aa3df" stroke-width="14" stroke-linecap="round"/><path d="M40 100h80" stroke="#4caf7d" stroke-width="8" stroke-linecap="round"/><rect x="104" y="28" width="8" height="72" fill="#9fb3c8"/><rect x="116" y="40" width="8" height="60" fill="#9fb3c8"/>', { tint: '#eaf7ee', defs: sunDefs(id) }); })(),
    lunch: soft('<rect x="20" y="40" width="120" height="60" rx="8" fill="#9fb3c8"/><rect x="28" y="48" width="50" height="44" rx="4" fill="#fff"/><rect x="86" y="48" width="46" height="20" rx="4" fill="#fff"/><rect x="86" y="72" width="46" height="20" rx="4" fill="#fff"/><path d="M34 62l38-6v10l-38 6z" fill="#f7c58e"/><circle cx="60" cy="80" r="6" fill="#e5443b"/><circle cx="104" cy="58" r="6" fill="#4caf7d"/><rect x="92" y="76" width="34" height="12" fill="#ffd23f"/>', '#fff8e6'),
    art: soft('<path d="M80 18a46 42 0 1 0 0 84h10a9 9 0 0 0 0-18h-4a9 9 0 0 1 0-18h8a26 26 0 0 0-14-48z" fill="#fff" stroke="#d9dee7" stroke-width="3"/><circle cx="50" cy="50" r="8" fill="#e5443b"/><circle cx="64" cy="34" r="8" fill="#ffd23f"/><circle cx="90" cy="32" r="8" fill="#4caf7d"/><circle cx="52" cy="76" r="8" fill="#4aa3df"/>', '#f3f0ff'),
    music: soft('<path d="M64 92V30l48-10v56" stroke="#9b6bd6" stroke-width="8" fill="none" stroke-linecap="round"/><ellipse cx="52" cy="92" rx="16" ry="12" fill="#9b6bd6"/><ellipse cx="100" cy="78" rx="16" ry="12" fill="#9b6bd6"/>', '#f3f0ff'),
    gym: soft('<circle cx="80" cy="60" r="40" fill="#f29d3a"/><path d="M40 60h80M80 20v80M52 32q28 28 56 56M52 88q28-28 56-56" stroke="#8d5a3a" stroke-width="4" fill="none"/>', '#fff4e6'),
    computer: soft('<rect x="24" y="22" width="112" height="68" rx="8" fill="#3f5a8a"/><rect x="32" y="30" width="96" height="52" fill="#9fd8ff"/><rect x="64" y="90" width="32" height="8" fill="#3f5a8a"/><rect x="48" y="98" width="64" height="6" rx="3" fill="#9fb3c8"/>', '#e8f2fc'),
    science: soft('<path d="M66 20h28v30l26 44a8 8 0 0 1-7 12H47a8 8 0 0 1-7-12l26-44z" fill="#fff" stroke="#9fb3c8" stroke-width="3"/><path d="M52 86l18-30h20l18 30z" fill="#4caf7d"/><circle cx="70" cy="72" r="4" fill="#fff"/><circle cx="92" cy="80" r="3" fill="#fff"/>', '#eaf7ee'),
    writing: soft('<path d="M30 92l10-28 56-56 18 18-56 56z" fill="#ffd23f"/><path d="M96 8l18 18-8 8-18-18z" fill="#f29d3a"/><path d="M30 92l10-28 18 18z" fill="#f7c58e"/><path d="M30 92l6-16 10 10z" fill="#1d2433"/><path d="M28 108h104" stroke="#9fb3c8" stroke-width="4" stroke-linecap="round"/>', '#fff8e6'),
    bus: soft('<rect x="16" y="30" width="128" height="60" rx="12" fill="#ffd23f"/><rect x="26" y="40" width="26" height="22" rx="3" fill="#9fd8ff"/><rect x="60" y="40" width="26" height="22" rx="3" fill="#9fd8ff"/><rect x="94" y="40" width="26" height="22" rx="3" fill="#9fd8ff"/><rect x="16" y="68" width="128" height="8" fill="#1d2433"/><circle cx="44" cy="92" r="12" fill="#1d2433"/><circle cx="116" cy="92" r="12" fill="#1d2433"/>', '#fff8e6'),
    library: soft('<rect x="28" y="30" width="24" height="70" fill="#4aa3df"/><rect x="56" y="22" width="22" height="78" fill="#e5443b"/><rect x="82" y="34" width="22" height="66" fill="#4caf7d"/><rect x="108" y="26" width="24" height="74" fill="#ffd23f" transform="rotate(8 120 63)"/><rect x="20" y="100" width="120" height="8" fill="#8d5a3a"/>', '#e8f2fc'),
    packup: soft('<rect x="44" y="30" width="72" height="80" rx="18" fill="#e5443b"/><rect x="58" y="16" width="44" height="22" rx="11" fill="none" stroke="#c9372f" stroke-width="8"/><rect x="56" y="66" width="48" height="34" rx="8" fill="#ffd23f"/><rect x="72" y="66" width="16" height="8" fill="#c9372f"/>', '#fdeeee'),
    rest: soft('<path d="M98 16a40 40 0 1 0 36 56A32 32 0 0 1 98 16z" fill="#ffd23f"/><polygon points="40,30 44,42 56,46 44,50 40,62 36,50 24,46 36,42" fill="#fff"/><polygon points="130,90 132,96 138,98 132,100 130,106 128,100 122,98 128,96" fill="#fff"/>', '#2f3f6a'),
    lifeskills: soft('<rect x="34" y="56" width="92" height="44" rx="8" fill="#9fb3c8"/><rect x="34" y="56" width="92" height="10" fill="#7f94ac"/><path d="M126 70h14v10h-14z" fill="#7f94ac"/><path d="M50 44q10-18 0-30M80 44q10-18 0-30M110 44q10-18 0-30" stroke="#c0cfe0" stroke-width="4" fill="none" stroke-linecap="round"/>', '#fff4e6'),
    speech: soft('<path d="M24 24h112v56H76l-26 22V80H24z" fill="#4aa3df"/><circle cx="56" cy="52" r="6" fill="#fff"/><circle cx="80" cy="52" r="6" fill="#fff"/><circle cx="104" cy="52" r="6" fill="#fff"/>', '#e8f2fc'),
    ot: soft('<path d="M60 108V66l-14-18 10-8 16 18V26h12v30h8V22h12v34l12-14 10 8-16 22v36z" fill="#f7c58e"/><rect x="60" y="94" width="50" height="14" fill="#4aa3df"/>', '#fff4e6'),
    home: WEAR.house,
  };

  const st = (body) => '<svg class="art sticker" viewBox="0 0 64 64" aria-hidden="true">' + body + '</svg>';
  const STICKERS = [
    { id: 'trip', label: 'Field trip', svg: st('<rect x="6" y="16" width="52" height="32" rx="7" fill="#ffd23f"/><rect x="12" y="22" width="11" height="10" rx="2" fill="#9fd8ff"/><rect x="27" y="22" width="11" height="10" rx="2" fill="#9fd8ff"/><rect x="42" y="22" width="10" height="10" rx="2" fill="#9fd8ff"/><rect x="6" y="36" width="52" height="5" fill="#1d2433"/><circle cx="18" cy="50" r="6" fill="#1d2433"/><circle cx="46" cy="50" r="6" fill="#1d2433"/>') },
    { id: 'event', label: 'Class event', svg: st('<polygon points="32,6 39,24 58,25 43,37 48,56 32,45 16,56 21,37 6,25 25,24" fill="#ffd23f" stroke="#f29d00" stroke-width="2"/>') },
    { id: 'party', label: 'Party', svg: st('<ellipse cx="20" cy="22" rx="12" ry="15" fill="#e5443b"/><ellipse cx="44" cy="18" rx="12" ry="15" fill="#4aa3df"/><ellipse cx="32" cy="30" rx="10" ry="13" fill="#4caf7d"/><path d="M20 37q-2 12 4 18M44 33q4 10 0 20M32 43q0 8 2 12" stroke="#1d2433" stroke-width="2" fill="none"/>') },
    { id: 'noschool', label: 'No school', svg: st('<path d="M8 32L32 12l24 20v24H8z" fill="#ffd9a8"/><path d="M4 34L32 10l28 24" fill="none" stroke="#c9372f" stroke-width="5" stroke-linejoin="round"/><rect x="26" y="40" width="12" height="16" fill="#8d5a3a"/><circle cx="50" cy="16" r="11" fill="#e5443b"/><path d="M45 11l10 10M55 11L45 21" stroke="#fff" stroke-width="3"/>') },
    { id: 'holiday', label: 'Holiday', svg: st('<rect x="8" y="26" width="48" height="30" rx="3" fill="#e5443b"/><rect x="28" y="26" width="8" height="30" fill="#ffd23f"/><rect x="6" y="18" width="52" height="10" rx="2" fill="#c9372f"/><rect x="28" y="18" width="8" height="10" fill="#ffd23f"/><path d="M32 18q-12-14-14-4q-2 8 14 4zM32 18q12-14 14-4q2 8-14 4z" fill="#ffd23f"/>') },
    { id: 'early', label: 'Early release', svg: st('<circle cx="32" cy="32" r="25" fill="#fff" stroke="#f29d3a" stroke-width="4"/><path d="M32 14v18l12 7" stroke="#f29d3a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="32" cy="32" r="3" fill="#f29d3a"/>') },
    { id: 'birthday', label: 'Birthday', named: true, svg: st('<rect x="10" y="32" width="44" height="24" rx="4" fill="#f48fb1"/><path d="M10 36q6-6 11 0t11 0 11 0 11 0v6H10z" fill="#fff"/><rect x="30" y="16" width="4" height="16" fill="#4aa3df"/><ellipse cx="32" cy="13" rx="4" ry="6" fill="#ffd23f"/>') },
  ];

  MM.art = { WEATHER, TEMP, WEAR, SCHEDULE, STICKERS, sticker: id => (STICKERS.find(x => x.id === id) || {}).svg || '' };
})();
