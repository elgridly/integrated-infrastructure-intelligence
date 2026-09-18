# I³ Cinematic Entrance

A scroll-driven vertical reveal that reconstructs the city from darkness, connects it,
prioritises it, and then becomes the live I³ platform.

**Nothing outside this folder is modified.** The entrance adapts to the platform; the
platform is not adapted to the entrance.

Open `entrance/index.html`. Everything is vanilla HTML, CSS and JavaScript with no build
step and no rendering dependency, matching the rest of the project.

---

## Image sequence

Nine supplied states of one environment, played in reconstruction order. Filenames below
are the originals; the repo copies are renamed for legibility.

| # | File | Original | Reads as |
|---|---|---|---|
| 1 | `01-signals.webp` | `2ee60b87` | Scattered signals |
| 2 | `02-fragments.webp` | `c6693fa4` | Fragmented connections |
| 3 | `03-corridors.webp` | `2f6f2d8d` | Major corridors |
| 4 | `04-network.webp` | `88c2b9fc` | Infrastructure network |
| 5 | `05-skeleton.webp` | `76caa98d` | Infrastructure skeleton |
| 6 | `06-city-night.webp` | `6e725440` | Physical city |
| 7 | `07-city-dusk.webp` | `cefb2237` | Urban fabric |
| 8 | `08-city-dawn.webp` | `12b44c2e` | City at dawn |
| 9 | `09-connected.webp` | `a88715b7` | **Connected city — registration master** |

Order was confirmed numerically, not by eye. Ground luminance rises 1.91 → 71.42 and cyan
coverage rises 0.000% → 6.459% with no reversal at any step.

### Registration

All nine are 1672×941. Phase correlation against the master found a maximum drift of 2px
horizontally and 1px vertically, which is 0.12% of frame width. Corrections are declared
per frame as `dx`/`dy` in `entrance-config.js` and applied as a translation scaled to the
display, so nothing shifts when the boundary passes over it.

Every state uses one shared cover-fit mapping. Identical mapping for identical source
dimensions is what keeps the city stationary.

### The one discontinuity

Images 1–7 are night. Images 8–9 are dawn. The sky brightens **3.26×** across
`07 → 08` and 64.7% of the frame changes.

A tight boundary there would place a night sky beside a sunrise and read as a comparison
of two photographs rather than one environment being revealed. That step therefore uses a
much wider feather (0.30 of viewport width against 0.055 elsewhere), so the light sweeps
across the city the way dawn actually does. Feather width is per transition in
`transitions[]` and is the first thing to tune if that moment needs adjusting.

The most important transition, `08 → 09`, shares an identical sky. Its delta is almost
entirely ground-level connectivity, so it works as a tight reveal.

---

## How the reveal works

`LEFT of the boundary = previous state. RIGHT = next state.`

Forward progress moves the boundary **right → left**, so the next state progressively
takes the screen. **Neither image ever moves.** Only the boundary moves.

Each frame, during a transition:

1. The previous state is drawn full frame.
2. The region right of the feather is drawn straight to the canvas under a rect clip.
3. The feather band alone is composited through an offscreen gradient mask.
4. The next state is added back over the strip it just took, using `lighter`.
5. The boundary line, its bloom and its marker are drawn.

Step 3 uses a real gradient rather than stepped alpha slices. Slices banded visibly in the
sky, which is exactly the crossfade artefact to avoid.

Step 4 is the reveal glow, and it needs no difference masks. Additive compositing already
does the differencing: light that the next state *introduces* flares as the plane passes,
and unchanged areas are untouched. Precomputed difference masks were considered and
rejected because they add assets that can drift out of registration for no visual gain.

Steps 2–4 are confined to the boundary band, not the full frame width. That is the main
reason the sequence holds frame rate.

---

## Complexity → clarity

Past `dividerEnd` the boundary is gone and the mechanic changes.

The connected state is laid over the physical state through an alpha field. Letting that
field fall globally while holding it up at the priority anchors **is** the filtering: the
city stays, the noise recedes, and what matters keeps its emphasis. Relationships between
anchors carry travelling pulses, cyan for ordinary and amber for those touching a node
that needs attention.

The anchors in `priorityZones` are visual anchors in the cinematic image. They are not
claims about real infrastructure locations, and the sequence displays no names, dates,
capacities, readiness figures or probabilities anywhere.

---

## Becoming the platform

The platform loads in a same-origin iframe from the first frame, so the entrance is never
followed by a wait. If it is slow, the sequence holds at `holdP` for at most
`holdMaxMs` and then continues regardless. The executive is never trapped.

The handoff overlaps deliberately:

- The I³ wordmark drops away, leaving only the mark travelling.
- The mark scales to 36px and lands on the real header logo, whose position is declared
  per destination as `logoX`/`logoY`.
- The platform's existing chrome materialises in order: header, then main regions on a
  short stagger.
- The cinematic layer clears while the platform is still resolving, so the two genuinely
  cross rather than one replacing the other.

The UI stagger is injected as **transitions, not keyframe animations with a fill mode**.
An animation that never advances would leave `both` holding content at opacity 0 and blank
the live platform. A transition always lands on its end state. The injected style tag and
its classes are removed from both sides afterwards, so the live page returns to exactly
how it ships.

---

## Behaviour

| Mode | Trigger | Behaviour |
|---|---|---|
| Full | First visit in a session | The complete scroll journey |
| Short | Return visit in the same session | ~2.3s branded transition, no scrolling |
| Reduced | `prefers-reduced-motion: reduce` | Composed still, mark, quick dissolve. No scroll journey, no travelling boundary, no pulses |
| Off | `?intro=off` | Straight into the platform |

Session state is one `sessionStorage` key, `i3-entrance-seen`. There is no tracking.

**Skip** is available throughout, and on Escape, Enter or Space. It resolves the current
state forward through the climax and the transformation rather than tearing the cinematic
down, so skipping at any point still lands on a correct, interactive platform.

Reverse scroll reverses everything naturally, because progress is derived from scroll
position rather than accumulated.

### URL parameters

| Parameter | Purpose |
|---|---|
| `?to=overview \| hub \| scenarios \| supply` | Destination. A key whitelist, never a raw URL |
| `?intro=full` | Replay the whole entrance. Use this for demos |
| `?intro=short \| reduced \| off` | Force a mode |
| `?p=<0..1>` | **Dev/test.** Freeze at one progress value |
| `?p=<0..1>&skip=1` | **Dev/test.** Exercise skip from that moment |

---

## Performance

Images are WebP at two resolutions. The 1024 set is used on small viewports and on low-DPR
displays where the extra pixels would never resolve.

| Set | Size |
|---|---|
| Source PNG | 17.9 MB |
| Full WebP | 2.49 MB |
| Mobile WebP | 0.99 MB |

Quality tiers pick DPR cap, pulse count and whether the reveal glow runs. A rolling frame
timer drops one tier if the budget is missed. On completion the canvases are released, the
sequence is disposed, `ImageBitmap`s are closed, listeners are removed, the rAF loop is
stopped, and the stage and scroller are removed from the DOM.

Measured on 4 cores with software rendering and no GPU at 1600×900, scrolling the heaviest
stretch:

| Metric | Value |
|---|---|
| Median frame | 21.1 ms |
| p90 | 23.8 ms |
| p99 | 28.3 ms |
| Worst | 30.7 ms |

Real hardware with a GPU is considerably faster.

---

## Files

```
entrance/
  index.html              shell: gate, stage, live DOM text, skip, platform host
  css/entrance.css        the viewport is the canvas; no frames or panels
  js/entrance-config.js   timing, sequence, transitions, anchors, tiers
  js/sequence.js          responsive loader, decode, graceful per-frame fallback
  js/reveal.js            the renderer: boundary, feather, glow, filtering
  js/entrance.js          master progress, states, skip, handoff, teardown
  assets/sequence/*.webp  the nine states, two resolutions
  assets/i3-mark.webp     the platform's own mark, for exact header continuity
```

## Notes

The cinematic imagery is representative. Roads, bridges, buildings and water in it are not
identified as real Riyadh assets, and the live platform remains the source of actual
infrastructure information.
