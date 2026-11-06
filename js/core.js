/* Morning Meeting — core helpers and the station registry.
   Every station (calendar, weather, ...) lives in js/modules/ and calls MM.register({...}).
   See README.md for how to add a new one. */
(function () {
  'use strict';

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (e) { console.warn('Could not save', key, e); return false; }
    },
  };

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'];
  // Colours per weekday, like the classic pocket chart.
  const DAY_COLORS = ['#e53935', '#2e9e4f', '#f57c00', '#7cb342', '#ec6fa6', '#29a3d9', '#7e57c2'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function sameDay(a, b) { return dateKey(a) === dateKey(b); }
  function longDate(d) { return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); }

  // Small, repeatable random numbers so "today's puzzle" is the same all day.
  function seeded(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function pick(arr, rnd) { return arr[Math.floor((rnd || Math.random)() * arr.length)]; }
  function shuffle(arr, rnd) {
    const a = arr.slice(); rnd = rnd || Math.random;
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function uid() { return Math.random().toString(36).slice(2, 10); }

  // "emoji | label | extra" lines <-> arrays, used by the teacher's list editors.
  function parseLines(text, fields) {
    return String(text || '').split('\n').map(l => l.trim()).filter(Boolean).map(line => {
      const parts = line.split('|').map(p => p.trim());
      const o = {};
      fields.forEach((f, i) => { o[f] = parts[i] || ''; });
      return o;
    });
  }
  function toLines(list, fields) {
    return (list || []).map(o => fields.map(f => o[f] || '').join(' | ')).join('\n');
  }

  // Read aloud, for students who are still learning to read. Picks the most natural English
  // voice the device has (the browser default is often the most robotic one).
  let speechOn = true, speechRate = 0.9, voiceName = '';
  const PREFERRED = [/Ava.*Premium/i, /Samantha/i, /Aria.*Natural/i, /Jenny.*Natural/i, /Guy.*Natural/i, /Natural/i, /Google US English/i, /Google UK English Female/i, /Karen/i, /Daniel/i, /Zira/i, /Microsoft .*English/i, /en[-_]US/i, /en/i];
  function voices() { try { return window.speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)); } catch (e) { return []; } }
  function bestVoice() {
    const list = voices();
    if (voiceName) { const v = list.find(x => x.name === voiceName); if (v) return v; }
    for (const re of PREFERRED) { const v = list.find(x => re.test(x.name) || re.test(x.lang)); if (v) return v; }
    return list[0] || null;
  }
  function speak(text) {
    if (!speechOn || !('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.rate = speechRate; u.pitch = 1;
      const v = bestVoice(); if (v) { u.voice = v; u.lang = v.lang; }
      window.speechSynthesis.speak(u);
    } catch (e) { /* no voice available */ }
  }
  function setSpeech(on, rate, voice) { speechOn = !!on; speechRate = rate || 0.9; voiceName = voice || ''; }
  if ('speechSynthesis' in window) { try { window.speechSynthesis.onvoiceschanged = () => {}; window.speechSynthesis.getVoices(); } catch (e) { /* ignore */ } }

  // Pictures the teacher adds are shrunk and stored on this computer (IndexedDB).
  const img = {
    _db: null,
    open() {
      if (this._db) return Promise.resolve(this._db);
      return new Promise((resolve, reject) => {
        const req = indexedDB.open('morning-meeting', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('images');
        req.onsuccess = () => { this._db = req.result; resolve(this._db); };
        req.onerror = () => reject(req.error);
      });
    },
    async _tx(mode, fn) {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('images', mode);
        const r = fn(tx.objectStore('images'));
        tx.oncomplete = () => resolve(r && r.result);
        tx.onerror = () => reject(tx.error);
      });
    },
    put(id, dataUrl) { return this._tx('readwrite', s => s.put(dataUrl, id)); },
    get(id) { return id ? this._tx('readonly', s => s.get(id)).catch(() => null) : Promise.resolve(null); },
    del(id) { return this._tx('readwrite', s => s.delete(id)); },
    async all() {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const out = {}; const tx = db.transaction('images', 'readonly');
        const req = tx.objectStore('images').openCursor();
        req.onsuccess = () => { const c = req.result; if (c) { out[c.key] = c.value; c.continue(); } };
        tx.oncomplete = () => resolve(out); tx.onerror = () => reject(tx.error);
      });
    },
  };

  // Ask for a picture file, shrink it to a sensible size, return a data URL.
  function pickImage(maxSide) {
    maxSide = maxSide || 1600;
    return new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      input.onchange = () => {
        const file = input.files && input.files[0];
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => {
          const im = new Image();
          im.onload = () => {
            const k = Math.min(1, maxSide / Math.max(im.width, im.height));
            const c = document.createElement('canvas');
            c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
            c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
            resolve({ url: c.toDataURL('image/jpeg', 0.86), w: c.width, h: c.height });
          };
          im.onerror = () => resolve(null);
          im.src = reader.result;
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });
  }

  function celebrate(message) {
    const box = document.createElement('div');
    box.className = 'celebrate';
    const colors = ['#e05252', '#f4c95d', '#4caf7d', '#3f7fc1', '#9b6bd6', '#ff8f3f'];
    let html = '<div class="celebrate-msg">' + esc(message) + '</div>';
    for (let i = 0; i < 40; i++) {
      const c = colors[i % colors.length];
      const shape = i % 3 === 0 ? 'border-radius:50%' : i % 3 === 1 ? 'border-radius:2px' : 'border-radius:2px;width:.6em;height:1.4em';
      html += '<span class="confetti" style="left:' + (Math.random() * 100) + '%;background:' + c + ';' + shape + ';animation-delay:' +
        (Math.random() * 0.5) + 's;animation-duration:' + (1.8 + Math.random() * 1.2) + 's;--spin:' + (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540) + 'deg"></span>';
    }
    box.innerHTML = html;
    document.body.appendChild(box);
    speak(message);
    box.addEventListener('click', () => box.remove());
    setTimeout(() => box.remove(), 2600);
  }

  // Writing pad: students write (finger or pen on the smartboard) or type. Resolves to
  // { kind: 'ink', url } or { kind: 'text', text } or null if cancelled.
  function writePad(opts) {
    opts = opts || {};
    return new Promise(resolve => {
      const dlg = document.createElement('div');
      dlg.className = 'pad';
      dlg.innerHTML =
        '<div class="pad-box">' +
        '<div class="pad-head"><b>' + esc(opts.title || 'Write your answer') + '</b>' +
        '<span><button class="btn" data-a="type">Type instead</button><button class="btn" data-a="clear">Clear</button><button class="btn" data-a="cancel">Cancel</button><button class="btn primary" data-a="done">Done</button></span></div>' +
        '<canvas class="pad-canvas"></canvas>' +
        '<textarea class="pad-text" hidden placeholder="Type here…"></textarea>' +
        '</div>';
      document.body.appendChild(dlg);
      const canvas = dlg.querySelector('canvas'), cx = canvas.getContext('2d'), ta = dlg.querySelector('textarea');
      const box = canvas.getBoundingClientRect();
      canvas.width = box.width * devicePixelRatio; canvas.height = box.height * devicePixelRatio;
      cx.scale(devicePixelRatio, devicePixelRatio);
      // ruled lines like writing paper
      function rule() {
        cx.clearRect(0, 0, box.width, box.height);
        cx.strokeStyle = '#d9dee7'; cx.lineWidth = 1;
        for (let y = box.height / 3; y < box.height; y += box.height / 3) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(box.width, y); cx.stroke(); }
      }
      rule();
      let drawing = false, last = null, inked = false, typing = false;
      const pos = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
      canvas.addEventListener('pointerdown', e => { drawing = true; last = pos(e); canvas.setPointerCapture(e.pointerId); e.preventDefault(); });
      canvas.addEventListener('pointermove', e => {
        if (!drawing) return; const p = pos(e);
        cx.strokeStyle = '#1d2433'; cx.lineWidth = 7; cx.lineCap = 'round'; cx.lineJoin = 'round';
        cx.beginPath(); cx.moveTo(last.x, last.y); cx.lineTo(p.x, p.y); cx.stroke(); last = p; inked = true;
      });
      ['pointerup', 'pointercancel'].forEach(ev => canvas.addEventListener(ev, () => { drawing = false; }));
      dlg.querySelector('[data-a="clear"]').onclick = () => { rule(); inked = false; ta.value = ''; };
      dlg.querySelector('[data-a="type"]').onclick = e => { typing = !typing; canvas.hidden = typing; ta.hidden = !typing; e.target.textContent = typing ? 'Write instead' : 'Type instead'; if (typing) ta.focus(); };
      dlg.querySelector('[data-a="cancel"]').onclick = () => { dlg.remove(); resolve(null); };
      dlg.querySelector('[data-a="done"]').onclick = () => {
        let out = null;
        if (typing && ta.value.trim()) out = { kind: 'text', text: ta.value.trim() };
        else if (inked) {
          // trim to the inked area so the answer shows big
          const c2 = document.createElement('canvas'); c2.width = canvas.width; c2.height = canvas.height;
          const g = c2.getContext('2d'); g.drawImage(canvas, 0, 0);
          out = { kind: 'ink', url: c2.toDataURL('image/png') };
        }
        dlg.remove(); resolve(out);
      };
    });
  }

  window.MM = {
    modules: {},
    order: [],
    register(def) {
      if (!def || !def.id) throw new Error('A station needs an id');
      this.modules[def.id] = def;
      if (!this.order.includes(def.id)) this.order.push(def.id);
    },
    store, img,
    util: {
      DAYS, MONTHS, DAY_COLORS, esc, pad, dateKey, addDays, sameDay, longDate, seeded, hash,
      pick, shuffle, uid, parseLines, toLines, speak, setSpeech, voices, bestVoice, pickImage, celebrate, writePad,
    },
  };
})();
