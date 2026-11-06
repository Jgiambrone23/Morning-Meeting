/* Clean line icons (no emoji) for weather, temperature and feelings. All drawn in the current
   text colour, so they follow the board's theme. */
(function () {
  const wrap = (body, vb) => '<svg class="ico" viewBox="' + (vb || '0 0 64 64') + '" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  const sun = (cx, cy, r) => '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>' +
    [0, 45, 90, 135, 180, 225, 270, 315].map(a => { const k = a * Math.PI / 180; return '<line x1="' + (cx + Math.cos(k) * (r + 5)).toFixed(1) + '" y1="' + (cy + Math.sin(k) * (r + 5)).toFixed(1) + '" x2="' + (cx + Math.cos(k) * (r + 11)).toFixed(1) + '" y2="' + (cy + Math.sin(k) * (r + 11)).toFixed(1) + '"/>'; }).join('');
  const cloud = (dx, dy, s) => '<path transform="translate(' + dx + ' ' + dy + ') scale(' + s + ')" d="M18 44h28a10 10 0 0 0 0-20 14 14 0 0 0-27-3 11 11 0 0 0-1 23z"/>';
  const drops = (y) => [22, 32, 42].map(x => '<line x1="' + x + '" y1="' + y + '" x2="' + (x - 3) + '" y2="' + (y + 8) + '"/>').join('');
  const flakes = (y) => [22, 32, 42].map(x => '<circle cx="' + x + '" cy="' + (y + 4) + '" r="1.8" fill="currentColor"/>').join('');

  const WEATHER = {
    sunny: wrap(sun(32, 32, 11)),
    partly: wrap(sun(24, 22, 8) + cloud(6, 6, 0.9)),
    cloudy: wrap(cloud(2, 2, 1)),
    rainy: wrap(cloud(2, -6, 1) + drops(46)),
    stormy: wrap(cloud(2, -8, 1) + '<polyline points="34,38 27,50 34,50 29,62"/>'),
    snowy: wrap(cloud(2, -6, 1) + flakes(46)),
    windy: wrap('<path d="M10 24h30a6 6 0 1 0-6-6"/><path d="M10 34h40a6 6 0 1 1-6 6"/><path d="M10 44h22a5 5 0 1 1-5 5"/>'),
    foggy: wrap('<line x1="12" y1="22" x2="52" y2="22"/><line x1="8" y1="32" x2="56" y2="32"/><line x1="14" y1="42" x2="50" y2="42"/>'),
  };
  const thermo = (level) => wrap('<rect x="26" y="8" width="12" height="36" rx="6"/><circle cx="32" cy="50" r="7"/>' +
    '<rect x="29.5" y="' + (40 - level * 8) + '" width="5" height="' + (level * 8 + 4) + '" fill="currentColor" stroke="none"/><circle cx="32" cy="50" r="4" fill="currentColor" stroke="none"/>');
  const TEMP = { hot: thermo(4), warm: thermo(3), cool: thermo(2), cold: thermo(1) };

  // Faces: eyes, brows and mouth change per feeling.
  function face(o) {
    o = o || {};
    const eye = (x) => o.eyes === 'closed' ? '<path d="M' + (x - 4) + ' 28q4 3 8 0"/>' : o.eyes === 'wide' ? '<circle cx="' + x + '" cy="27" r="3.5"/>' :
      o.eyes === 'x' ? '<path d="M' + (x - 3) + ' 24l6 6M' + (x + 3) + ' 24l-6 6"/>' : o.eyes === 'low' ? '<path d="M' + (x - 4) + ' 29h8"/>' : '<circle cx="' + x + '" cy="27" r="2" fill="currentColor"/>';
    const brow = o.brows === 'down' ? '<path d="M18 19l8 3M46 19l-8 3"/>' : o.brows === 'up' ? '<path d="M18 22l8-3M46 22l-8-3"/>' : o.brows === 'worried' ? '<path d="M19 20q5-3 8 0M37 20q3-3 8 0"/>' : o.brows === 'flat' ? '<path d="M18 20h9M37 20h9"/>' : '';
    const mouth = { smile: '<path d="M22 40q10 9 20 0"/>', big: '<path d="M20 38q12 14 24 0z" fill="currentColor"/>', frown: '<path d="M22 44q10-8 20 0"/>', flat: '<path d="M24 42h16"/>',
      o: '<circle cx="32" cy="42" r="4"/>', wobble: '<path d="M22 42q5-4 10 0t10 0"/>', tongue: '<path d="M22 40q10 9 20 0"/><path d="M30 44q2 6 6 2"/>', small: '<path d="M27 42q5 4 10 0"/>', grit: '<path d="M22 41h20M27 41v4M32 41v4M37 41v4"/>' }[o.mouth || 'smile'];
    return wrap('<circle cx="32" cy="32" r="26"/>' + eye(23) + eye(41) + brow + mouth + (o.extra || ''));
  }
  const FEELINGS = {
    happy: face({ mouth: 'smile' }),
    calm: face({ eyes: 'closed', mouth: 'small' }),
    excited: face({ eyes: 'wide', brows: 'up', mouth: 'big' }),
    silly: face({ eyes: 'x', mouth: 'tongue' }),
    proud: face({ brows: 'flat', mouth: 'smile', extra: '<path d="M46 14l3-6 3 6-3 2z" fill="currentColor"/>' }),
    tired: face({ eyes: 'low', mouth: 'flat', extra: '<path d="M44 10h8l-8 8h8"/>' }),
    sad: face({ brows: 'worried', mouth: 'frown', extra: '<path d="M44 34q3 6 0 6-3 0 0-6z" fill="currentColor"/>' }),
    worried: face({ brows: 'worried', mouth: 'wobble' }),
    angry: face({ brows: 'down', mouth: 'frown' }),
    frustrated: face({ brows: 'down', mouth: 'grit' }),
    sick: face({ brows: 'worried', mouth: 'wobble', extra: '<path d="M8 50q6-4 12 0"/>' }),
    confused: face({ brows: 'up', mouth: 'wobble', extra: '<path d="M46 8a4 4 0 1 1 5 4q-2 1-2 4M49 20v1"/>' }),
    embarrassed: face({ brows: 'worried', mouth: 'small', extra: '<circle cx="18" cy="38" r="3" fill="currentColor"/><circle cx="46" cy="38" r="3" fill="currentColor"/>' }),
    okay: face({ mouth: 'flat' }),
    bored: face({ eyes: 'low', brows: 'flat', mouth: 'flat' }),
    scared: face({ eyes: 'wide', brows: 'worried', mouth: 'o' }),
    hungry: face({ mouth: 'o', extra: '<path d="M12 48q4-3 8 0"/>' }),
    lonely: face({ brows: 'worried', mouth: 'small' }),
    surprised: face({ eyes: 'wide', brows: 'up', mouth: 'o' }),
    loved: face({ mouth: 'smile', extra: '<path d="M48 10l2-2 2 2-2 3z" fill="currentColor"/>' }),
  };
  function feeling(word) {
    const k = String(word || '').toLowerCase().trim();
    return FEELINGS[k] || wrap('<circle cx="32" cy="32" r="26"/><text x="32" y="40" text-anchor="middle" font-size="22" font-weight="700" fill="currentColor" stroke="none">' + (k[0] || '?').toUpperCase() + '</text>');
  }
  const MISC = {
    breathe: wrap('<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="12"/>'),
    count: wrap('<text x="32" y="42" text-anchor="middle" font-size="28" font-weight="700" fill="currentColor" stroke="none">10</text>'),
    water: wrap('<path d="M32 8c-8 12-16 20-16 30a16 16 0 0 0 32 0c0-10-8-18-16-30z"/>'),
    stretch: wrap('<circle cx="32" cy="12" r="5"/><path d="M32 17v22M32 39l-10 16M32 39l10 16M12 20l20 8 20-8"/>'),
    pause: wrap('<rect x="18" y="14" width="10" height="36" rx="2"/><rect x="36" y="14" width="10" height="36" rx="2"/>'),
    talk: wrap('<path d="M10 14h44v30H30l-12 10V44h-8z"/>'),
    music: wrap('<path d="M24 46V16l26-6v30"/><circle cx="18" cy="46" r="6"/><circle cx="44" cy="40" r="6"/>'),
    squeeze: wrap('<path d="M14 36q0-20 18-20t18 20q0 14-18 14T14 36z"/><path d="M24 34h2M38 34h2"/>'),
    walk: wrap('<circle cx="34" cy="10" r="5"/><path d="M30 18l-6 16 8 6v16M30 18l10 8 8 2M24 34l-8 20"/>'),
    help: wrap('<circle cx="32" cy="32" r="26"/><path d="M24 24a8 8 0 1 1 11 7q-3 2-3 6M32 46v1"/>'),
    sun: WEATHER.sunny, cloud: WEATHER.cloudy,
    hat: wrap('<path d="M14 42h36M20 42l4-18h16l4 18"/><path d="M10 42q22 8 44 0"/>'),
    coat: wrap('<path d="M24 10h16l10 8v36H14V18z"/><path d="M32 10v44M20 30v-8M44 30v-8"/>'),
    shorts: wrap('<path d="M18 16h28l4 32H36l-4-16-4 16H14z"/>'),
    tshirt: wrap('<path d="M22 12h20l12 8-6 8-6-3v29H22V25l-6 3-6-8z"/>'),
    sunscreen: wrap('<rect x="22" y="20" width="20" height="34" rx="4"/><rect x="27" y="10" width="10" height="10"/>'),
    sunglasses: wrap('<circle cx="20" cy="34" r="9"/><circle cx="44" cy="34" r="9"/><path d="M29 34h6M11 32l-6-8M53 32l6-8"/>'),
    umbrella: wrap('<path d="M8 34a24 24 0 0 1 48 0z"/><path d="M32 34v20a5 5 0 0 1-10 0"/>'),
    boots: wrap('<path d="M22 10h16v26l12 8v8H18V10z"/><path d="M22 36h16"/>'),
    scarf: wrap('<path d="M20 18h24v12H20z"/><path d="M26 30l-4 24h10l2-24M38 30l6 22h-8"/>'),
    gloves: wrap('<path d="M20 54V30l-6-8 4-3 8 8V14h6v12h4V16h6v12l6-6 4 4-8 12v16z"/>'),
    socks: wrap('<path d="M24 10h16v24l10 10-8 8-10-8-8 8v-10l8-8z"/>'),
    pants: wrap('<path d="M18 10h28v44H38V32l-6 22H18z"/>'),
    sneakers: wrap('<path d="M8 44q0-8 10-10l10-14 10 6 20 6v12z"/><path d="M8 44h50"/>'),
    bottle: wrap('<rect x="24" y="22" width="16" height="34" rx="4"/><rect x="28" y="8" width="8" height="14"/>'),
    house: wrap('<path d="M10 32L32 12l22 20"/><path d="M16 28v26h32V28"/><rect x="28" y="40" width="8" height="14"/>'),
  };
  // Tab and activity icons.
  const TABS = {
    today: wrap('<rect x="10" y="14" width="44" height="40" rx="4"/><path d="M10 26h44M20 8v10M44 8v10"/><circle cx="32" cy="40" r="6" fill="currentColor" stroke="none"/>'),
    calendar: wrap('<rect x="10" y="14" width="44" height="40" rx="4"/><path d="M10 26h44M20 8v10M44 8v10M20 36h6M29 36h6M38 36h6M20 45h6M29 45h6"/>'),
    weather: WEATHER.partly,
    season: wrap('<path d="M32 8v48M12 20l40 24M12 44l40-24"/><circle cx="32" cy="32" r="8"/>'),
    feelings: face({ mouth: 'smile' }),
    schedule: wrap('<path d="M14 16h36M14 32h36M14 48h36"/><circle cx="8" cy="16" r="3" fill="currentColor" stroke="none"/><circle cx="8" cy="32" r="3" fill="currentColor" stroke="none"/><circle cx="8" cy="48" r="3"/>'),
    activity: wrap('<circle cx="32" cy="32" r="24"/><circle cx="32" cy="32" r="14"/><circle cx="32" cy="32" r="4" fill="currentColor" stroke="none"/>'),
    people: wrap('<circle cx="22" cy="20" r="8"/><circle cx="44" cy="22" r="6"/><path d="M8 54v-6a14 14 0 0 1 28 0v6M36 54v-6a10 10 0 0 1 20 0v6"/>'),
    video: wrap('<rect x="6" y="14" width="52" height="36" rx="6"/><path d="M27 23v18l14-9z" fill="currentColor" stroke="none"/>'),
    page: wrap('<path d="M16 8h22l10 10v38H16z"/><path d="M38 8v10h10M22 30h20M22 40h20"/>'),
    spot: wrap('<circle cx="26" cy="26" r="16"/><path d="M38 38l16 16"/>'),
    missing: wrap('<rect x="10" y="12" width="20" height="18" rx="3"/><rect x="34" y="12" width="20" height="18" rx="3"/><rect x="10" y="34" width="20" height="18" rx="3"/><path d="M38 38l12 12M50 38l-12 12"/>'),
    changed: wrap('<path d="M46 20a18 18 0 0 0-30 4M18 44a18 18 0 0 0 30-4"/><path d="M16 14v10h10M48 50V40H38"/>'),
    ispy: wrap('<path d="M6 32q26-28 52 0-26 28-52 0z"/><circle cx="32" cy="32" r="7"/>'),
    odd: wrap('<circle cx="18" cy="18" r="8"/><circle cx="46" cy="18" r="8"/><circle cx="18" cy="46" r="8"/><rect x="38" y="38" width="16" height="16" rx="2"/>'),
    talk: MISC.talk,
    rhyme: wrap('<path d="M22 46V18l24-6v28"/><circle cx="16" cy="46" r="6"/><circle cx="40" cy="40" r="6"/>'),
    riddle: MISC.help,
    name3: wrap('<text x="32" y="44" text-anchor="middle" font-size="36" font-weight="700" fill="currentColor" stroke="none">3</text>'),
    opposite: wrap('<path d="M10 24h40l-10-10M54 40H14l10 10"/>'),
    rather: wrap('<path d="M8 20h20v24H8zM36 20h20v24H36z"/><path d="M30 32h4"/>'),
    finish: wrap('<path d="M10 20h44M10 32h26M40 32h14M10 44h44"/>'),
    silly: face({ eyes: 'x', mouth: 'wobble' }),
    same: wrap('<circle cx="22" cy="32" r="14"/><circle cx="42" cy="32" r="14"/>'),
    listen: wrap('<path d="M18 26v12h8l12 10V16L26 26z"/><path d="M44 24q6 8 0 16M50 18q10 14 0 28"/>'),
    steps: wrap('<path d="M10 52h14V38h14V24h14V10"/>'),
    need: wrap('<rect x="8" y="22" width="48" height="30" rx="4"/><path d="M22 22v-8h20v8M8 36h48"/>'),
    clock: wrap('<circle cx="32" cy="32" r="24"/><path d="M32 16v16l10 6"/>'),
    money: wrap('<rect x="6" y="18" width="52" height="28" rx="4"/><circle cx="32" cy="32" r="7"/><path d="M14 26v12M50 26v12"/>'),
    signs: wrap('<polygon points="24,8 40,8 56,24 56,40 40,56 24,56 8,40 8,24"/><path d="M20 32h24"/>'),
    goodchoice: wrap('<path d="M14 30h8v24h-8zM22 32l10-20q6 2 4 12h16a4 4 0 0 1 4 5l-4 20a4 4 0 0 1-4 3H22"/>'),
    lifeskills: wrap('<path d="M12 54V24l20-14 20 14v30H38V38H26v16z"/>'),
    games: wrap('<circle cx="26" cy="26" r="16"/><path d="M38 38l16 16"/>'),
    extras: wrap('<path d="M22 46V18l24-6v28"/><circle cx="16" cy="46" r="6"/><circle cx="40" cy="40" r="6"/>'),
  };
  // Calendar stickers: flat two-colour icons.
  const st = (body) => '<svg class="ico sticker" viewBox="0 0 64 64" aria-hidden="true">' + body + '</svg>';
  const STICKERS = [
    { id: 'birthday', label: 'Birthday', svg: st('<rect x="10" y="30" width="44" height="26" rx="4" fill="#f48fb1"/><rect x="10" y="30" width="44" height="8" fill="#ec407a"/><rect x="30" y="14" width="4" height="16" fill="#fff"/><ellipse cx="32" cy="11" rx="4" ry="6" fill="#ffb300"/>') },
    { id: 'trip', label: 'Field trip', svg: st('<rect x="6" y="18" width="52" height="30" rx="6" fill="#ffca28"/><rect x="12" y="24" width="12" height="10" fill="#e3f2fd"/><rect x="28" y="24" width="12" height="10" fill="#e3f2fd"/><rect x="44" y="24" width="8" height="10" fill="#e3f2fd"/><circle cx="18" cy="50" r="6" fill="#333"/><circle cx="46" cy="50" r="6" fill="#333"/>') },
    { id: 'noschool', label: 'No school', svg: st('<path d="M8 32L32 12l24 20v24H8z" fill="#90a4ae"/><rect x="26" y="40" width="12" height="16" fill="#546e7a"/><circle cx="48" cy="18" r="11" fill="#e53935"/><path d="M43 13l10 10M53 13L43 23" stroke="#fff" stroke-width="3"/>') },
    { id: 'picture', label: 'Picture day', svg: st('<rect x="6" y="20" width="52" height="36" rx="6" fill="#5c6bc0"/><rect x="22" y="12" width="20" height="10" rx="3" fill="#3949ab"/><circle cx="32" cy="38" r="11" fill="#fff"/><circle cx="32" cy="38" r="6" fill="#283593"/>') },
    { id: 'party', label: 'Party', svg: st('<ellipse cx="22" cy="24" rx="12" ry="15" fill="#ef5350"/><ellipse cx="42" cy="20" rx="12" ry="15" fill="#42a5f5"/><path d="M22 39q-4 12 2 18M42 35q6 10 0 20" stroke="#333" stroke-width="2" fill="none"/>') },
    { id: 'doctor', label: 'Doctor / nurse', svg: st('<rect x="8" y="8" width="48" height="48" rx="8" fill="#fff" stroke="#e53935" stroke-width="3"/><rect x="26" y="16" width="12" height="32" fill="#e53935"/><rect x="16" y="26" width="32" height="12" fill="#e53935"/>') },
    { id: 'assembly', label: 'Assembly', svg: st('<circle cx="18" cy="22" r="7" fill="#8d6e63"/><circle cx="32" cy="18" r="7" fill="#ffb74d"/><circle cx="46" cy="22" r="7" fill="#4db6ac"/><path d="M6 52a12 12 0 0 1 24 0zM20 48a12 12 0 0 1 24 0zM34 52a12 12 0 0 1 24 0z" fill="#90a4ae"/>') },
    { id: 'library', label: 'Library', svg: st('<rect x="10" y="12" width="14" height="40" fill="#42a5f5"/><rect x="26" y="12" width="12" height="40" fill="#ef5350"/><rect x="40" y="16" width="14" height="36" fill="#66bb6a" transform="rotate(-8 47 34)"/>') },
    { id: 'test', label: 'Test', svg: st('<rect x="14" y="8" width="36" height="48" rx="4" fill="#fff" stroke="#607d8b" stroke-width="3"/><path d="M22 22h20M22 32h20M22 42h12" stroke="#90a4ae" stroke-width="3"/><path d="M36 42l4 4 8-8" stroke="#43a047" stroke-width="4" fill="none"/>') },
    { id: 'visitor', label: 'Special visitor', svg: st('<polygon points="32,6 39,24 58,25 43,37 48,56 32,45 16,56 21,37 6,25 25,24" fill="#ffca28"/>') },
    { id: 'early', label: 'Early dismissal', svg: st('<circle cx="32" cy="32" r="24" fill="#fff" stroke="#fb8c00" stroke-width="4"/><path d="M32 16v16l10 6" stroke="#fb8c00" stroke-width="4" fill="none"/>') },
    { id: 'pajama', label: 'Pajama day', svg: st('<path d="M40 8a22 22 0 1 0 16 36A18 18 0 0 1 40 8z" fill="#7e57c2"/><polygon points="14,14 16,20 22,22 16,24 14,30 12,24 6,22 12,20" fill="#ffca28"/>') },
    { id: 'sports', label: 'Sports', svg: st('<circle cx="32" cy="32" r="24" fill="#ff8f00"/><path d="M8 32h48M32 8v48M14 14q18 18 36 36M14 50q18-18 36-36" stroke="#5d4037" stroke-width="2.5" fill="none"/>') },
    { id: 'music', label: 'Music', svg: st('<path d="M24 46V14l26-6v30" stroke="#5e35b1" stroke-width="5" fill="none"/><circle cx="18" cy="46" r="7" fill="#5e35b1"/><circle cx="44" cy="40" r="7" fill="#5e35b1"/>') },
    { id: 'art', label: 'Art', svg: st('<path d="M32 8a24 22 0 1 0 0 44h6a6 6 0 0 0 0-12h-2a6 6 0 0 1 0-12h4a14 14 0 0 0-8-20z" fill="#ffe0b2"/><circle cx="18" cy="28" r="4" fill="#e53935"/><circle cx="26" cy="18" r="4" fill="#fdd835"/><circle cx="40" cy="18" r="4" fill="#43a047"/><circle cx="20" cy="40" r="4" fill="#1e88e5"/>') },
    { id: 'gift', label: 'Holiday', svg: st('<rect x="8" y="26" width="48" height="30" rx="3" fill="#e53935"/><rect x="28" y="26" width="8" height="30" fill="#fdd835"/><rect x="6" y="18" width="52" height="10" rx="2" fill="#c62828"/><rect x="28" y="18" width="8" height="10" fill="#fdd835"/>') },
    { id: 'bus', label: 'Bus change', svg: st('<rect x="6" y="18" width="52" height="30" rx="6" fill="#42a5f5"/><rect x="12" y="24" width="40" height="10" fill="#e3f2fd"/><circle cx="18" cy="50" r="6" fill="#333"/><circle cx="46" cy="50" r="6" fill="#333"/>') },
    { id: 'swim', label: 'Swimming', svg: st('<path d="M6 40q8-6 16 0t16 0 16 0 10 0" stroke="#29b6f6" stroke-width="5" fill="none"/><path d="M6 50q8-6 16 0t16 0 16 0 10 0" stroke="#0288d1" stroke-width="5" fill="none"/><circle cx="40" cy="22" r="6" fill="#ffb74d"/>') },
  ];
  MM.icons = { WEATHER, TEMP, FEELINGS, MISC, TABS, STICKERS, feeling, face, wrap, tab: k => TABS[k] || TABS.page, sticker: id => (STICKERS.find(x => x.id === id) || {}).svg || '' };
})();
