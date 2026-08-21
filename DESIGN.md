# DESIGN.md — the design system for this repo

**Every UI change follows this file. Nobody has to ask for it.**

Two surfaces: `index.html` (the day) and `week.html` (the analysis). Both are single files,
no build step, no external assets — they have to work from a phone home screen, from GitHub
Pages, and from a double-clicked file with no network.

---

## Who it is for, and what that forces

One user, ADHD, reading on a phone, usually tired, often mid-task. That produces four hard
rules that outrank taste:

1. **Scannable beats complete.** Structure over prose. If a block cannot be skimmed in three
   seconds it gets cut or collapsed.
2. **One primary action per screen.** Everything else is visually subordinate. A menu of
   equal-weight choices is a decision, and decisions are where this fails.
3. **Bad news at the top, never softened.** Colour carries it, but never colour alone.
4. **Nothing moves under the thumb.** No layout shift on tap, no list reordering while
   reading, no auto-advancing content.

---

## Tokens

Semantic names only. **Never write a raw hex in a component.**

### Colour

Defined on `:root` for light, overridden under `html[data-theme="dark"]`. Both themes are
authored together and checked independently — dark is not an inversion.

| Token | Role |
|---|---|
| `--bg` | page ground |
| `--surface` | cards, the default raised plane |
| `--surface-2` | inputs, wells, pressed rows |
| `--fg` | primary text |
| `--fg-2` | secondary text, body copy in cards |
| `--fg-3` | labels, captions, disabled |
| `--line` | borders and dividers |
| `--focus` | focus ring only — never decorative |
| `--desk` / `--desk-bg` | desk-block accent |
| `--phone` / `--phone-bg` | phone-block accent |
| `--say` / `--say-bg` | say-it-out-loud + recap accent |
| `--ok` / `--ok-bg` | correct, done, on track |
| `--warn` / `--warn-bg` | partial, over budget, attention |
| `--bad` / `--bad-bg` | wrong, missed, overdue |
| `--accent` / `--accent-bg` | primary action, current day |

**Contrast floor: 4.5:1 for text, 3:1 for UI glyphs and borders, in both themes.** Accent
colours are used for *text and borders* on their own tinted background, never as white text
on a mid-tone fill.

**Colour never carries meaning alone.** Every state also has a glyph or a word: a graded
review shows *Got it* next to the green, an overdue item shows *6d late* next to the red.

### Spacing

4px rhythm: `4 · 8 · 12 · 16 · 20 · 24 · 32 · 48`. Section gaps step 16 → 24 → 32. No
arbitrary values.

### Type

Scale: `11 · 12 · 13 · 15 · 17 · 20 · 26`. Body is **15px minimum** (16px on inputs, so iOS
does not zoom on focus). Line height 1.5–1.6 for body, 1.25–1.35 for headings.

- 700–800 headings, 600 labels and buttons, 400 body.
- Labels are 11px, uppercase, `.1em` tracking, `--fg-3`.
- **Numbers that change in place use `font-variant-numeric: tabular-nums`** — timers,
  counts, scores. Otherwise the layout jitters every tick.

### Radius and elevation

`8` inputs and chips · `12` buttons and rows · `16` cards · `999` pills.
One elevation step: a 1px `--line` border plus the surface change. No shadow stacks — they
read as noise at phone size and cost contrast in dark mode.

### Motion

150–250ms, `ease-out` entering, `ease-in` leaving. `transform` and `opacity` only.
Everything is wrapped in `@media (prefers-reduced-motion: reduce)` which drops it to none.
Motion only ever explains a cause — a panel opening from the row that opened it. Never
decoration.

---

## Components

**Touch targets are 44px minimum**, 8px apart. This is not negotiable and it is the first
thing to check when a row feels cramped.

- **Task row** — tick box, text, optional pencil, optional chevron. The tick box is its own
  target; tapping the row body opens rather than ticks, so a mis-tap never marks work done.
- **Timer** — one row under an unticked task. Counts *down* against the stated minutes.
  Tabular figures. Amber past budget, red when capped, and it never blocks anything.
- **Review card** — prompt, then hint, then answer behind one more tap, then three grades.
  The extra tap is the retrieval mechanism and it stays.
- **Note entry** — a logged, timestamped line. The box clears on Log so the next thought has
  somewhere to go.
- **Recap** — collapsed behind one button carrying the tally, opened deliberately.

### Icons

**Inline SVG only. No emoji anywhere in the interface**, including as bullets or status
marks. One sprite at the top of each page, `currentColor`, 24×24 viewBox, 2px stroke, round
caps and joins. Icon-only controls carry an `aria-label`.

Emoji remain fine in *content* — the plan text and recap prose are markdown, not chrome.

---

## Accessibility floor

- `:focus-visible` ring on every interactive element, 2px `--focus` plus 2px offset. Never
  removed.
- Heading order runs h1 → h2 → h3, no skips.
- `aria-pressed` on every toggle, `aria-live="polite"` on the sync counter and toasts.
- The viewport meta never disables zoom. `viewport-fit=cover` plus `env(safe-area-inset-*)`
  padding, so nothing sits under the notch or the home indicator.
- `min-height: 100dvh`, never `100vh`.
- `touch-action: manipulation` to kill the 300ms tap delay.

---

## Layout

Mobile-first, single column, `max-width: 720px`, centred. Breakpoints `375 / 768 / 1024`.
Nothing scrolls horizontally except code blocks and wide tables, which scroll inside their
own container.

Navigation is a bottom bar, **two items, icon plus label** — Today and Analysis. Icon-only
navigation was the previous version's mistake: a single unlabelled hamburger that gave no
indication a second page existed.

---

## Working on this repo

- Read this file before any UI change. It is the source of truth over habit.
- Keep both themes correct in the same edit. Never ship a light-mode-only change.
- Check at **375px wide** and with **reduced motion on** before pushing.
- Behaviour lives in the logic functions and is covered by tests in the scratchpad suite;
  restyling must not change what those functions return.
