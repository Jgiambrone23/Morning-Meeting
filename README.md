# Morning Meeting board

An interactive morning-meeting board for a smartboard: build-the-date, calendar, weather,
season, feelings check-in, visual schedule, an Activity tab (looking games, word games and
life skills), the teacher's own pages, Video Pickers, and a drawing pen over any screen. Schedule and Video Pickers have an Edit button right on the page. Everything is saved on the computer that opens it; nothing is
sent anywhere and there is no sign-in.

It is plain HTML, CSS and JavaScript with no build step. Open `index.html` in a browser, or
host the folder on any static web host (GitHub Pages, Firebase Hosting, Netlify).

## For the teacher

- Tap the ⚙️ gear (top right) to open Teacher settings. (In settings, "Lock this panel" makes it
  need a press-and-hold instead, so students can't open it.)
- Turn stations on and off, drag their order with ▲ ▼, and tap **Change** to set one up.
- **Add my own page** makes a page with a title, words and a photo (question of the day,
  word of the day, class goal, lunch menu...).
- **Backup**: save a backup file on one computer and open it on another to copy the board over.
- Tap any word on the board and it is read aloud. The board picks the most natural voice the device has; change it (and try it) in Teacher settings.
- ✎ turns on a drawing pen over whatever is on screen (colours, eraser, clear). Drawings go
  away when you move to another station.
- Calendar: events in settings (`11/20 | Field trip`), a "days until" countdown, **stickers** students
  place on any day (birthday, field trip, no school, picture day...; weekends are shaded), and **Ask a
  calendar question** ("Tap the second Tuesday", "Tap the day with the field trip sticker").
- Name 3 and Finish the Sentence open a **writing pad**: students write on the smartboard with a
  finger or pen (or type), and the answer stays on the board.
- ◀ ▶ or the arrow keys move between stations. ⛶ makes it full screen.

Each station keeps "today" separate (today's weather picks, finished schedule cards, who is
absent) and forgets it after two weeks.

## Activity tab

One tab holds every game and life-skill activity. It opens on a menu with today's suggestion
(or straight into the suggestion, in settings). The teacher can turn any activity off.

### Looking games

All six end the same way: one student comes up, finds something, and says a full sentence.
Sentence starters sit under each game.

| Game | What happens |
|---|---|
| Spot the Difference | Two boards of photos, 3–5 differences; tap them. Or the teacher's own puzzle pictures (one side-by-side picture, tap the differences once to mark them). |
| What's Missing? | Look, close your eyes, one thing disappears. |
| What Changed? | Look, close your eyes, one thing moves, changes colour, flips or grows. |
| I Spy | "I spy something red" (or by name / by group) — tap the photo. |
| Odd One Out | Four pictures, one doesn't belong — say why. |
| Picture Talk | A scene or the teacher's photo and three talking questions. |

### Word games
Rhyme Time (which word rhymes?), Riddles ("I am red and round. What am I?" with photo
answers), Name 3 ("tell me three things that are cold"), Opposites.

### Life skills
Clock, Money, Community signs, Good choice? (a situation and two choices), Steps in Order
(tap the steps of washing hands, making a sandwich... in order), What Do You Need? (it's
raining → the umbrella).

The games use a **picture library of real photos**: one photo per object (dog, school bus,
toothbrush, ...) and one per scene (classroom, grocery store, ...). The first time, the teacher
opens Teacher → Warm-up Game → Change and taps **Download** (about a minute). Each photo is the
picture from that object's Wikipedia article, with Wikimedia Commons photos as the **Swap**
alternatives; **Mine** uses the teacher's own photo. Photos are stored on that computer and work
offline afterwards (a backup file carries them to another computer).

Boards are picked from the date, so the same puzzle shows all day on every screen, and
"New pictures" gives another one.

**Video Pickers** (off by default): two students a day, in a fair rotation, choose the end-of-meeting
video from the teacher's list of YouTube links; it plays on the board. Names come from Who's Here if
that station is on, otherwise from its own list.

## For whoever maintains it

```
index.html          page shell; lists the station scripts in starting order
css/style.css       all styling
js/core.js          MM.register, storage (localStorage + IndexedDB for photos), speech, helpers
js/library.js       picture library: Wikipedia/Commons lookups, caching, the teacher's photo panel
js/art.js           flat vector illustrations (weather, temperature, clothing, schedule, calendar stickers)
js/icons.js         line icons for tabs, menus and placeholders
js/app.js           top bar, tabs, teacher panel, custom pages, backup/restore
js/modules/*.js     one file per station
```

### Adding a station

Create `js/modules/mystation.js`:

```js
MM.register({
  id: 'mystation',            // unique, no spaces
  title: 'My Station',
  icon: '🎯',
  description: 'Shown in the teacher panel.',
  defaultOn: true,            // false = off until the teacher turns it on
  render(el, ctx) {           // draw the station into `el`
    el.innerHTML = '<h1 class="station-title">Hello</h1>';
  },
  settings(el, ctx) {         // optional: the "Change" panel in teacher settings
  },
});
```

and add `<script src="js/modules/mystation.js"></script>` to `index.html` before `app.js`.

`ctx` gives you: `settings` (saved object for this station; call `ctx.saveSettings()`),
`day` (today-only object; `ctx.saveDay()`), `date`, `speak(text)`, `peopleNames()` (first
names of students marked present, empty unless the Who's Here station is on), and
`rerender()`. Any element with `data-say="..."` is read aloud when tapped. `MM.util` has the
shared helpers (seeded random, date keys, emoji list parsing, `celebrate()`, `pickImage()`).

### Privacy

Student first names (optional) and photos are stored only in the browser that entered them,
and inside backup files the teacher saves. Nothing is uploaded. The photo download sends only
object names (e.g. "dog") to Wikipedia / Wikimedia Commons; the optional real-weather lookup
sends only the town name to Open-Meteo.
