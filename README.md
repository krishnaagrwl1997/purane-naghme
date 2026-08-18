# पुराने नग़्मे — Purane Naghme

A single-page nostalgia radio. Next.js (App Router, TypeScript) + Tailwind v4.
`app/` at the project root, no `src/`, no `tailwind.config` — tokens live in `@theme`
inside `app/globals.css`.

```bash
npm install
npm run dev
```

---

## The five things you'll want to edit

| What | Where |
|---|---|
| The songs | `app/lib/tracks.ts` |
| Title, credit, social hrefs, "how I made this" link, deck brand | `app/lib/site.ts` |
| Accent + the deck's plastic palette | `@theme` in `app/globals.css` |
| The scene | `public/bg/scene-wide.png`, `public/bg/scene-tall.png` |
| Fonts | `app/fonts.ts` + the woff2 files in `app/fonts/` |

---

## The music

Ten tracks across three tapes. Adding a song is one line inside a tape's `tracks` array.

**Every videoId shipped here was verified through YouTube's oEmbed endpoint before it was
added, and every one resolves to the rights holder's own channel** — Saregama (which owns
most pre-1990 HMV Hindi film music), Shemaroo, YRF, Rajshri. No fan re-uploads, no lyric
channels, no auto-generated "Topic" channels. The uploading channel is recorded on each
track as an audit trail.

These are still copyrighted recordings. Embedding a label's own upload is the licensed
path — the label chose to allow embeds and gets the play — but you're the one publishing
the site, so give the list a look before you ship.

To vet an id yourself:

```
https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json
```

Read `author_url`. If it isn't the label / studio / artist, don't use it. An error
response means the video is private, deleted, or has embedding switched off.

At runtime, `onError` skips the dead track automatically and fires a
`youtube_player_error` Vercel Analytics event with `code`, `reason`, `videoId`, `title`
and `channel` — because videos get pulled long after you ship, and you want to hear it
from your dashboard rather than from a listener. If every track on a tape fails, it stops
and says so instead of looping.

---

## The deck

`SOOR TAAL`, a stereo cassette recorder.

- **Tape window** — the live YouTube iframe, at 16:9, at the deck's own scale.
- **Scale** — the seek bar, printed with a tick every 30s and a numbered tick every
  minute. Drag the red needle.
- **Readout** — tape + track, a four-digit mechanical counter (which counts spool
  revolutions at ~1.7/sec, so it drifts from the timecode, exactly like the real thing),
  and elapsed / total.
- **Keys** — REW, PLAY, PAUSE, FF. PLAY latches down while the tape runs.
- **TAPE A / B / C** — the three playlists. A new cassette always starts at track 1.
- **VOLUME** — a real knob. Drag it, or focus it and use the arrow keys.
- **TUNE** — an *indicator*, not a control: it tracks how far through the side you are.
  It's `aria-hidden` and not focusable, so it never pretends to be something you can turn.

### The player is visible, on purpose

The iframe is the artwork. It is **never** hidden in a 1px or `opacity: 0` container, and
nothing is drawn on top of it — no chips, no scrims. That would breach YouTube's Developer
Policies (no background-only players, no separating audio from video) and, more concretely,
it would bury the **Skip Ad** button inside a player nobody can reach.

No YouTube thumbnails are downloaded or re-hosted. The video *is* the cover, at the 16:9
it's served in — square-cropping a 16:9 still throws away the sides and then crops it again.

### One iframe, two layouts

The brief calls for two separate blocks (`hidden sm:block` / `sm:hidden`), so there are two
tape windows in the DOM at once — and an iframe can only live in one.

Moving an `<iframe>` between parents reloads it and playback stops dead. So the iframe
**never moves**. It's mounted once inside a single fixed-position layer
(`app/components/deck/VideoStage.tsx`) that is measured onto whichever window is currently
visible, via a `ResizeObserver` plus resize/orientation/scroll listeners. Verified: after
six tape switches, six track skips and a viewport resize, the iframe host is still the same
DOM node and the layer is still pixel-aligned to the window.

---

## Things that are load-bearing

| | |
|---|---|
| **Sub-components at module scope** | Declared inside `<Deck />` they'd get a new function identity every render; React would remount the subtree — restarting every CSS animation four times a second and, far worse, tearing down and rebuilding the iframe, which stops the music. |
| **Animation *longhands*, not the shorthand** | React's partial style updates re-apply `animation` on its own, and the shorthand resets `animation-play-state` to `running`. Found this the hard way on the previous build — a paused record that kept spinning. |
| **`onPointerDown` for the scale and the knobs** | A `click` only lands on pointer*up*, so press-and-drag would do nothing until release. Pointer capture keeps the drag tracking when the finger leaves the control. |
| **`touch-none`** | Otherwise the browser steals a horizontal drag as a scroll / pull-to-refresh. |
| **Play is never gated on `canplay`** | iOS Safari doesn't fire it before a user gesture, so the button would be dead forever. The gesture *is* the cue; if the API hasn't landed, the intent is queued in a ref. |
| **Fonts are self-hosted, not `next/font/google`** | `next/font/google` fetches from Google at **build** time — a failed fetch is a hard build error, not a fallback. The woff2 files live in `app/fonts/` and load through `next/font/local`, which ships with Next, so this adds no dependency and no runtime third-party request. |
| **Devanagari needs line-height ≥ 1** | Sub-1 leading looks tight in Latin and *collides* in Devanagari — नग़्मे's nukta ran into पुराने's descenders at 0.88. |
| **Safe areas** | Every fixed edge uses `max(1rem, env(safe-area-inset-*))`, paired with `viewportFit: "cover"`. |
| **`overflow-x-hidden`, not `overflow-hidden`** | On a 360×640 phone the scene + masthead + deck exceed the viewport. Clipping would put the transport keys somewhere unreachable, so the page scrolls vertically instead. |
| **Two background files, not one crop** | `scene-tall.png` is separately composed, so orientation swaps the whole image rather than re-framing a landscape badly. |

The listener count in `app/components/OnlineCount.tsx` is **simulated** — a slow random walk
that dips overnight in IST. Swap the effect for a poll of your own endpoint and delete
`simulate`; nothing else reads it.

---

## Layout

```
app/
  layout.tsx              metadata, viewport (viewportFit: cover), fonts, Analytics
  page.tsx                server component: scene, grain, top row, masthead, deck
  globals.css             @theme tokens, .hero-bg, .grain, .deck-*, safe-area utils
  fonts.ts                next/font/local wiring
  fonts/*.woff2           the self-hosted faces
  lib/
    tracks.ts             ← the songs
    site.ts               ← title, credit, links
    youtube.ts            IFrame API loader + types
    format.ts
  components/
    Clock.tsx  OnlineCount.tsx  SocialLinks.tsx  Title.tsx  HowIMadeThis.tsx
    Deck.tsx              the engine + both layouts
    deck/
      VideoStage.tsx  Inlay.tsx  TapeScale.tsx  Window.tsx
      TransportKeys.tsx  TapeSelector.tsx  Knob.tsx
public/bg/
  scene-wide.png  scene-tall.png
```
