/* Picture library: one real photo per object, used by the warm-up games.
   Photos come from Wikimedia Commons (free, no account; "Quality images" only), are shrunk,
   and are stored on this computer so the board works offline afterwards. The teacher can
   swap any photo for the next candidate or use her own. */
(function () {
  const { esc } = MM.util;
  const KEY = 'mm.library.v1';

  // The Wikipedia article whose top picture shows the thing (first choice), by name.
  const WIKI = {"dog": "Dog","cat": "Cat","rabbit": "Rabbit","horse": "Horse","cow": "Cattle","pig": "Pig","sheep": "Sheep","chicken": "Chicken","duck": "Duck","bird": "Bird","butterfly": "Butterfly","turtle": "Turtle","fish": "Goldfish","dolphin": "Dolphin","crab": "Crab","shark": "Shark","octopus": "Octopus","whale": "Humpback whale","car": "Car","school bus": "School bus","bicycle": "Bicycle","truck": "Truck","airplane": "Airplane","train": "Train","boat": "Sailboat","fire truck": "Fire engine","tractor": "Tractor","apple": "Apple","banana": "Banana","orange": "Orange (fruit)","strawberry": "Strawberry","grapes": "Grape","watermelon": "Watermelon","pizza": "Pizza","sandwich": "Sandwich","bread": "Bread","carrot": "Carrot","broccoli": "Broccoli","tomato": "Tomato","shirt": "T-shirt","shoes": "Sneakers","hat": "Baseball cap","jacket": "Jacket","socks": "Sock","gloves": "Glove","pencil": "Pencil","book": "Hardcover","backpack": "Backpack","scissors": "Scissors","crayons": "Crayon","glue": "Glue stick","spoon": "Spoon","cup": "Mug","plate": "Plate (dishware)","pot": "Saucepan","refrigerator": "Refrigerator","toaster": "Toaster","chair": "Chair","table": "Table (furniture)","bed": "Bunk bed","lamp": "Lamp","sofa": "Couch","tree": "Tree","flower": "Flower","sun": "Sun","cloud": "Cloud","rainbow": "Rainbow","snowman": "Snowman","pumpkin": "Pumpkin","ball": "Ball","soccer ball": "Ball (association football)","basketball": "Basketball (ball)","teddy bear": "Teddy bear","kite": "Kite","umbrella": "Umbrella","clock": "Clock","key": "Key (lock)","phone": "Smartphone","toothbrush": "Toothbrush","soap": "Soap","classroom": "Classroom","playground": "Playground","grocery store": "Supermarket","kitchen": "Kitchen","bus stop": "Bus stop","park": "Park","birthday party": "Birthday","family dinner": "Dinner","library": "Library","beach": "Beach","farm": "Farm","doctor": "Doctor's office","restaurant": "Restaurant","street": "Pedestrian crossing","school hallway": "Hallway","bedroom": "Bedroom","bathroom": "Bathroom","laundry": "Laundry room","garden": "Garden","snow": "Snow"};

  // name | colour word for I Spy | group for Odd One Out | search words
  const ITEMS = [
    ['dog', 'brown', 'animals', 'dog pet'], ['cat', 'orange', 'animals', 'cat pet'], ['rabbit', 'white', 'animals', 'rabbit'],
    ['horse', 'brown', 'farm animals', 'horse'], ['cow', 'black and white', 'farm animals', 'cow'], ['pig', 'pink', 'farm animals', 'pig'],
    ['sheep', 'white', 'farm animals', 'sheep'], ['chicken', 'brown', 'farm animals', 'chicken hen'], ['duck', 'white', 'farm animals', 'duck'],
    ['bird', 'blue', 'animals', 'bird'], ['butterfly', 'orange', 'animals', 'butterfly'], ['turtle', 'green', 'animals', 'turtle'],
    ['fish', 'orange', 'sea animals', 'goldfish'], ['dolphin', 'gray', 'sea animals', 'dolphin'], ['crab', 'red', 'sea animals', 'crab'],
    ['shark', 'gray', 'sea animals', 'shark'], ['octopus', 'red', 'sea animals', 'octopus'], ['whale', 'blue', 'sea animals', 'whale'],
    ['car', 'red', 'vehicles', 'red car'], ['school bus', 'yellow', 'vehicles', 'school bus'], ['bicycle', 'blue', 'vehicles', 'bicycle'],
    ['truck', 'white', 'vehicles', 'truck'], ['airplane', 'white', 'vehicles', 'airplane'], ['train', 'red', 'vehicles', 'train'],
    ['boat', 'white', 'vehicles', 'sailboat'], ['fire truck', 'red', 'vehicles', 'fire truck'], ['tractor', 'green', 'vehicles', 'tractor'],
    ['apple', 'red', 'fruits', 'red apple'], ['banana', 'yellow', 'fruits', 'banana'], ['orange', 'orange', 'fruits', 'orange fruit'],
    ['strawberry', 'red', 'fruits', 'strawberry'], ['grapes', 'purple', 'fruits', 'grapes'], ['watermelon', 'green', 'fruits', 'watermelon'],
    ['pizza', 'red', 'foods', 'pizza'], ['sandwich', 'brown', 'foods', 'sandwich'], ['bread', 'brown', 'foods', 'bread loaf'],
    ['carrot', 'orange', 'vegetables', 'carrot'], ['broccoli', 'green', 'vegetables', 'broccoli'], ['tomato', 'red', 'vegetables', 'tomato'],
    ['shirt', 'blue', 'clothes', 't-shirt'], ['shoes', 'black', 'clothes', 'sneakers shoes'], ['hat', 'red', 'clothes', 'hat cap'],
    ['jacket', 'blue', 'clothes', 'jacket'], ['socks', 'white', 'clothes', 'socks'], ['gloves', 'black', 'clothes', 'gloves'],
    ['pencil', 'yellow', 'school things', 'pencil'], ['book', 'blue', 'school things', 'book'], ['backpack', 'red', 'school things', 'backpack'],
    ['scissors', 'gray', 'school things', 'scissors'], ['crayons', null, 'school things', 'crayons'], ['glue', 'white', 'school things', 'glue stick'],
    ['spoon', 'gray', 'kitchen things', 'spoon'], ['cup', 'white', 'kitchen things', 'coffee mug'], ['plate', 'white', 'kitchen things', 'plate dish'],
    ['pot', 'gray', 'kitchen things', 'cooking pot'], ['refrigerator', 'white', 'kitchen things', 'refrigerator'], ['toaster', 'gray', 'kitchen things', 'toaster'],
    ['chair', 'brown', 'furniture', 'wooden chair'], ['table', 'brown', 'furniture', 'table'], ['bed', 'white', 'furniture', 'bed'],
    ['lamp', 'white', 'furniture', 'lamp'], ['sofa', 'gray', 'furniture', 'sofa couch'],
    ['tree', 'green', 'outside', 'tree'], ['flower', 'pink', 'outside', 'flower'], ['sun', 'yellow', 'outside', 'sun sky'],
    ['cloud', 'white', 'outside', 'cloud'], ['rainbow', null, 'outside', 'rainbow'], ['snowman', 'white', 'outside', 'snowman'],
    ['pumpkin', 'orange', 'outside', 'pumpkin'], ['ball', 'red', 'toys', 'ball'], ['soccer ball', 'black and white', 'toys', 'soccer ball'],
    ['basketball', 'orange', 'toys', 'basketball'], ['teddy bear', 'brown', 'toys', 'teddy bear'], ['kite', 'red', 'toys', 'kite'],
    ['umbrella', 'red', 'things', 'umbrella'], ['clock', 'white', 'things', 'wall clock'], ['key', 'gray', 'things', 'key'],
    ['phone', 'black', 'things', 'mobile phone'], ['toothbrush', 'blue', 'things', 'toothbrush'], ['soap', 'white', 'things', 'soap bar'],
  ].map(r => ({ key: r[0].replace(/\s+/g, '-'), name: r[0], color: r[1], group: r[2], q: r[3], wiki: WIKI[r[0]] }));

  // Scene photos for Picture Talk (topic | search words)
  const SCENES = [
    ['classroom', 'classroom students'], ['playground', 'playground'], ['grocery store', 'supermarket aisle'], ['kitchen', 'kitchen'],
    ['bus stop', 'bus stop'], ['park', 'city park people'], ['birthday party', 'birthday party'], ['family dinner', 'family dinner table'],
    ['library', 'library reading'], ['beach', 'beach people'], ['farm', 'farm animals'], ['doctor', 'doctor office'],
    ['restaurant', 'restaurant'], ['street', 'street crossing pedestrians'], ['school hallway', 'school corridor'], ['bedroom', 'bedroom'],
    ['bathroom', 'bathroom sink'], ['laundry', 'laundry washing machine'], ['garden', 'vegetable garden'], ['snow', 'children snow'],
  ].map(r => ({ key: 'scene-' + r[0].replace(/\s+/g, '-'), name: r[0], q: r[1], wiki: WIKI[r[0]] }));
  // More photos: seasons (Season station) and feelings (real faces for the Feelings station).
  // [key, name, wikipedia article (or null), commons search words, word that must be in the title]
  const EXTRAS = [
    // Florida seasons: a beach day, hibiscus in bloom, a summer thunderstorm, orange season.
    ['season-winter', 'winter', 'Siesta Key, Florida', 'Florida beach', 'beach'], ['season-spring', 'spring', 'Hibiscus rosa-sinensis', 'hibiscus', 'hibiscus'],
    ['season-summer', 'summer', 'Thunderstorm', 'lightning storm', 'lightning'], ['season-fall', 'fall', 'Orange (fruit)', 'oranges', 'orange'],
    // Feelings: only the ones with a clearly good free photo; the rest show a line face until the
    // teacher adds her own photo (Teacher → Feelings → Change → Mine), which works best anyway.
    // Feelings: only photos that were checked by eye. Internet searches for the other feelings
    // return unsuitable pictures, so those show a line face until the teacher adds her own photo.
    ['feel-happy', 'happy', 'Smile', 'smiling child', 'smiling'], ['feel-excited', 'excited', 'Laughter', 'laughing child', 'laughing'],
    ['feel-sad', 'sad', 'Crying', 'crying child', 'crying'], ['feel-angry', 'angry', 'Anger', 'angry face', 'angry'],
    ['feel-embarrassed', 'embarrassed', 'Embarrassment', 'embarrassed face', 'embarrassed'], ['feel-bored', 'bored', 'Boredom', 'bored person', 'bored'],
  ].map(r => ({ key: r[0], name: r[1], wiki: r[2], q: r[3], intitle: r[4] }));

  let lib = MM.store.get(KEY, {});   // key -> { title, page, candidates:[...], at }
  function save() { MM.store.set(KEY, lib); }

  const BAD = /map|drawing|logo|diagram|seed|statue|sculpture|painting|coin|stamp|flag|museum|poster|sign\b|text|chart|cartoon|toy model|evolution|koala|cat\b|dog\b|monkey|animal|bird|mask/i;
  async function searchOnce(q, extra) {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=15' +
      '&gsrsearch=' + encodeURIComponent(q + ' ' + extra) + '&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=800';
    const r = await fetch(url);
    if (!r.ok) throw new Error('search failed');
    const d = await r.json();
    return Object.values((d.query || {}).pages || {})
      .map(p => ({ title: p.title, info: p.imageinfo && p.imageinfo[0] }))
      .filter(x => x.info && /jpeg|png/.test(x.info.mime) && !BAD.test(x.title))
      .map(x => ({ title: x.title, thumb: x.info.thumburl, w: x.info.width, h: x.info.height, landscape: x.info.width >= x.info.height }));
  }
  async function wikiImage(title) {
    if (!title) return [];
    const url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail|name&pithumbsize=900&redirects=1&titles=' + encodeURIComponent(title);
    const r = await fetch(url); if (!r.ok) return [];
    const d = await r.json();
    const p = Object.values((d.query || {}).pages || {})[0];
    if (!p || !p.thumbnail || /\.svg$/i.test(p.pageimage || '')) return [];
    return [{ title: 'Wikipedia: ' + title, thumb: p.thumbnail.source, w: p.thumbnail.width, h: p.thumbnail.height, landscape: true }];
  }
  // Wikipedia's article picture first, then Commons photos whose title contains the name.
  async function search(name, q, wiki, intitle) {
    const w = await wikiImage(wiki).catch(() => []);
    return w.concat(await searchCommons(intitle || name, q));
  }
  async function searchCommons(name, q) {
    const must = 'intitle:"' + name + '" filetype:bitmap fileres:>700';
    const a = await searchOnce(q, must + ' incategory:"Quality images"').catch(() => []);
    const b = await searchOnce(q, must).catch(() => []);
    const seen = new Set(); const out = [];
    a.concat(b).forEach(c => { if (!seen.has(c.title)) { seen.add(c.title); out.push(c); } });
    return out.sort((x, y) => (y.landscape - x.landscape));   // keep order, landscape first
  }

  async function fetchToDataUrl(url, maxSide) {
    const r = await fetch(url);
    if (!r.ok) throw new Error('image failed');
    const blob = await r.blob();
    const bmp = await createImageBitmap(blob);
    const k = Math.min(1, (maxSide || 800) / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.85);
  }

  // Get (or fetch) the photo for an item. idx picks the next candidate when swapping.
  async function load(item, idx) {
    const entry = lib[item.key] || {};
    if (!entry.candidates || !entry.candidates.length) entry.candidates = await search(item.name, item.q, item.wiki, item.intitle);
    if (!entry.candidates.length) throw new Error('no pictures found for ' + item.name);
    const i = idx == null ? (entry.idx || 0) : idx % entry.candidates.length;
    const c = entry.candidates[i];
    const data = await fetchToDataUrl(c.thumb, 800);
    await MM.img.put('lib-' + item.key, data);
    lib[item.key] = { idx: i, title: c.title, candidates: entry.candidates, own: false, at: Date.now() };
    save();
    return data;
  }

  const api = {
    ITEMS, SCENES, EXTRAS,
    has(key) { return !!lib[key]; },
    info(key) { return lib[key]; },
    readyItems() { return ITEMS.filter(it => lib[it.key]); },
    readyScenes() { return SCENES.filter(it => lib[it.key]); },
    get(key) { return MM.img.get('lib-' + key); },
    // HTML for a photo that falls back to a line icon until the photo is downloaded.
    pic(key, iconSvg, cls) { return '<span class="pic ' + (cls || '') + '"><img alt="" data-lib="' + key + '"><span class="fallback">' + (iconSvg || '') + '</span></span>'; },
    fill(el) { el.querySelectorAll('img[data-lib]').forEach(im => api.get(im.dataset.lib).then(u => { if (u) { im.src = u; im.parentElement.classList.add('has-photo'); } })); },
    async swap(item) { const e = lib[item.key] || {}; return load(item, (e.idx || 0) + 1); },
    async useOwn(item, dataUrl) {
      await MM.img.put('lib-' + item.key, dataUrl);
      lib[item.key] = { own: true, title: 'My photo', candidates: (lib[item.key] || {}).candidates || [], at: Date.now() };
      save();
    },
    async remove(item) { await MM.img.del('lib-' + item.key); delete lib[item.key]; save(); },
    // Fetch every missing picture; onProgress(done, total, name, error)
    async fetchAll(list, onProgress) {
      const todo = list.filter(it => !lib[it.key]);
      let done = 0;
      for (const it of todo) {
        try { await load(it); } catch (e) { onProgress && onProgress(done, todo.length, it.name, e.message); }
        done++;
        onProgress && onProgress(done, todo.length, it.name);
      }
    },
    // Teacher panel for the library (used by the games settings).
    panel(host, opts) {
      opts = opts || {};
      const list = opts.scenes ? SCENES.concat(EXTRAS) : ITEMS;
      const title = opts.scenes ? 'Scene, season and feelings photos' : 'Object photos (for the games)';
      const ready = list.filter(it => lib[it.key]).length;
      host.innerHTML =
        '<h4>' + title + ' — ' + ready + ' of ' + list.length + ' ready</h4>' +
        '<p class="hint">Photos come from Wikimedia Commons (free to use; the board keeps a note of each photo\'s name). Tap <b>Swap</b> on any photo you don\'t like, or <b>Mine</b> to use your own. Photos stay on this computer; download once per computer, or move them with a backup file.</p>' +
        '<div class="row" style="justify-content:flex-start"><button class="btn primary" data-a="fetchAll">⬇ Download the missing ' + (list.length - ready) + '</button> <span data-progress></span></div>' +
        '<div class="lib-grid">' + list.map(it => {
          const e = lib[it.key];
          return '<div class="lib-item" data-key="' + it.key + '"><div class="lib-thumb">' + (e ? '<img alt="">' : '<span>—</span>') + '</div>' +
            '<b>' + esc(it.name) + '</b><div class="lib-btns"><button data-a="swap" title="Next photo">Swap</button><button data-a="own">Mine</button>' + (e ? '<button data-a="del">✕</button>' : '') + '</div></div>';
        }).join('') + '</div>';
      list.forEach(it => { if (lib[it.key]) api.get(it.key).then(u => { const im = host.querySelector('[data-key="' + it.key + '"] img'); if (im && u) im.src = u; }); });
      const prog = host.querySelector('[data-progress]');
      host.querySelector('[data-a="fetchAll"]').onclick = async e => {
        e.target.disabled = true;
        await api.fetchAll(list, (d, t, name, err) => { prog.textContent = d + ' / ' + t + (err ? ' (could not get ' + name + ')' : ' · ' + name); });
        api.panel(host, opts);
      };
      host.querySelectorAll('.lib-item').forEach(row => {
        const it = list.find(x => x.key === row.dataset.key);
        row.querySelector('[data-a="swap"]').onclick = async e => {
          e.target.textContent = '…';
          try { await api.swap(it); } catch (err) { alert('Could not get another photo: ' + err.message); }
          api.panel(host, opts);
        };
        row.querySelector('[data-a="own"]').onclick = async () => {
          const p = await MM.util.pickImage(800); if (!p) return;
          await api.useOwn(it, p.url); api.panel(host, opts);
        };
        const del = row.querySelector('[data-a="del"]');
        if (del) del.onclick = async () => { await api.remove(it); api.panel(host, opts); };
      });
    },
  };
  MM.lib = api;
})();
