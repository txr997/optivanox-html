# CLAUDE.md — ThemeForest HTML template build rules

Portable rules file for themexriver HTML templates. Drop it in the root of any template
project, fill in **§1**, and the rest applies unchanged.

---



## 1. Per-project setup — fill this in first

| Key | Value |
| --- | --- |
| Template name | Optivanox — Business Consulting |
| Theme prefix | `on-` (Aigora was `ag-`, Optitech `ot-`) |
| Pages | `index.html`, `index-2.html` |
| Fonts | `--on-font-1: Inter` (body), `--on-font-2: Mona Sans` (headings) |
| Colors | `--on-clr-pr-1 #BEFF6B`, `--on-clr-h-1 #023D3F`, `--on-clr-p-1 #525D5D` |
| Home-2 colors | `--on-clr-pr-2 #2A5CFF`, `--on-clr-h-2 #050519` |
| Compiled CSS | `assets/scss/main.scss` → `assets/css/main.css` (watcher) |

Everything below is prefix-agnostic: wherever you see `on-`, read "the project's prefix".

---

## 2. What this project is

A **production HTML template for sale on ThemeForest**. Static HTML + SCSS + jQuery/GSAP.
No npm, no bundler, no framework. The buyer opens the folder and edits HTML directly, so
readability of the shipped markup matters as much as the visual result.

---

## 3. Workflow

### Deliver in one pass — no verification loops

The quality bar stays high: sections must match the design closely and the responsive
breakpoints must be written properly. Reach that quality in one careful pass, not through
repeated measure/render/compare cycles.

- Take the measurements needed (Figma/JPG/PSD, asset sizes, colors, spacing) **once**,
  up front, before writing code — not as a build-then-adjust loop.
- Write all breakpoints (`$xxl / $xl / $lg / $md / $xs`) correctly the first time from
  those numbers, instead of rendering at four widths to discover what breaks.
- At most **one** render/screenshot to confirm the result. Then stop.
- If something genuinely needs a second look, ask — don't start another loop.

### Stop when the task is done

Once the work works, stop. No bonus screenshots, no extra checks, no re-auditing what
already passed.

### Reporting

Report in 2–4 lines: what changed and in which files (as clickable paths). No long recaps,
no restating what the user already saw.

### Scope discipline

- Build **only** what was asked. Do not redesign, rename or "improve" nearby sections.
- Check whether the thing already exists before writing it — a component, a utility class,
  a `wa_` helper, a keyframe. Reuse beats re-creating.
- Do not touch unrelated files. Do not rename existing classes unless asked.
- If a fix requires touching something outside the ask, say so in one line and do it — do
  not silently expand or silently skip.

### Compiling — it is automatic, leave it alone

- Write styles in the **SCSS partials only** — never hand-edit `assets/css/main.css`.
- **Never run the sass compiler.** A watcher on the local machine compiles
  `main.scss` → `main.css` on every save. It is not a step in the task.
- **Don't check whether it compiled.** The write may land a beat after the save, so a
  freshly grepped `main.css` can still show the old rules — that is the watcher catching
  up, not a failure. Don't grep it, don't report it as stale, don't offer to compile it
  manually. Finish the SCSS and move on.
- The only thing worth reporting is an actual **Sass error** (a partial missing its
  `@use '../abstracts/variables' as *;` takes the whole stylesheet down).

---

## 4. File structure — canonical

```
project-root/
├── index.html, index-2.html, about-us.html, 404.html …   ← one file per page, flat
├── CLAUDE.md
└── assets/
    ├── css/         main.css, main.css.map (compiled) + vendor css (bootstrap, swiper…)
    ├── fonts/       flaticon / icon-font files
    ├── img/
    │   ├── <section>/   one folder per section: hero/, about/, services/, blog/ …
    │   ├── logo/        logo-1.svg, logo-1-black.svg
    │   └── favicon.png
    ├── js/
    │   ├── main-common.js   shared wa_* helper library — same across all templates
    │   ├── main.js          this template's own scripts
    │   └── <vendor>.min.js  jquery, gsap, swiper, wow, marquee …
    └── scss/
        ├── main.scss             registers every partial, in order
        ├── abstracts/
        │   ├── _variables.scss   font imports, :root custom properties, $breakpoints
        │   ├── _common.scss      template header comment + CSS INDEX + base resets
        │   └── _utility.scss     wa- utility classes, mt-/mb-/pt-/pb- spacing loops
        ├── components/           reusable across sections: button, typography, preloader,
        │                         offcanvas, search, back-to-top, elements, wow-plus
        ├── layout/               one partial per section: _hero, _about, _services …
        └── pages/                page-level overrides only (_home-page, _home-2-dark)
```

Rules:

- A new section gets a partial in `layout/`, registered in `main.scss`.
- A second variant of an existing section (home-2's hero) goes in the **same** partial as
  `.on-hero-2`, below the `hero-1-end` marker — not a new file.
- Section images go in `assets/img/<section>/` with a short prefix: `h1-`, `s2-`, `in2-`.
- Anything used by two or more sections belongs in `components/`, not `layout/`.

---

## 5. Naming conventions

```
.on-services-2-card          block:  .<prefix>-<section>-<variant>-<part>
  .icon-elm .title-elm       inner:  short, generic, always -elm suffixed
  .has-v2                    modifier (never .services-card--dark)
  .active                    state, set by JS
```

| Kind | Pattern | Example |
| --- | --- | --- |
| Section area | `.<prefix>-<section>-<n>-area` | `.on-hero-1-area` |
| Section part | `.<prefix>-<section>-<n>-<part>` | `.on-faqs-1-quote` |
| Inner element | `.<name>-elm` | `.title-elm`, `.img-elm`, `.text-elm`, `.body-elm` |
| Variant | `.has-v1`, `.has-v2`, `.has-<topic>` | `.on-subtitle-1.has-v2` |
| State | `.active` (matched as `&:is(.active)`) | |
| JS hook | `wa_snake_case` | `wa_marquee`, `wa_accordion_item` |
| CSS utility | `wa-kebab-case` | `wa-fix`, `wa-ul`, `wa-img-cover`, `wa-bg-default` |
| Keyframes | `<prefix>-<section>-<n>-<name>` | `on-choose-1-pin-drop` |

- The **number** in a class is the design variant, not a counter of instances:
  `.on-hero-1-*` is the home-1 hero, `.on-hero-2-*` is the home-2 hero.
- Use `&:is(.has-v2)` / `&:is(.active)` for modifiers — that is the house style, it keeps
  specificity flat and reads clearly in the compiled CSS.
- Never rename an existing class. Buyers' customizations depend on them.

### Shared elements — reuse them, never re-declare them

Typography, buttons and section titles are **components**, not per-section styles. Every
section builds its text and CTAs from the shared classes below — a new section adds *no*
new font-size/color/button rule for something these already cover.

| Class | Is | Lives in |
| --- | --- | --- |
| `.on-h-1`, `.on-h-2` | heading base (family, weight, color, line-height) | `components/_typography.scss` |
| `.on-p-1`, `.on-p-2` | body paragraph | `components/_typography.scss` |
| `.on-sec-title-1`, `.on-sec-title-2` | section headline + its full breakpoint ladder | `components/_typography.scss` |
| `.on-subtitle-1`, `.on-subtitle-2` | the small pill/label above a section title | `components/_typography.scss` |
| `.on-pr-btn-1`, `.on-pr-btn-2`, `.on-pr-btn-3` | primary buttons | `components/_button.scss` |

```html
<!-- section-title -->
<span class="on-subtitle-1 has-v2">Why Choose Us</span>
<h2 class="on-sec-title-1 wa-text-white">Built for teams that <br>ship fast</h2>
<p class="on-p-1 mt-16">Short supporting line.</p>
<!-- primary-btn -->
<a href="contact.html" class="on-pr-btn-1 has-v2">Get Started</a>
```

Rules:

- **Check the component partials before writing any type or button style.** If a rule you
  are about to write is "font + weight + size + color of a heading/paragraph/button",
  it already exists — use the class.
- A section may only **adjust** a shared class in context (a different size on one page,
  a white variant on a dark band), scoped under the section block or via a
  `&:is(.has-v2)` modifier **on the component itself**. Never copy its declarations.
- If a section needs a genuinely new text or button treatment that two or more sections
  will share, add it to the component partial as the next number (`.on-sec-title-3`),
  not to the layout partial.
- `-1` / `-2` here is the **design variant** (home-1 vs home-2 look), same as everywhere
  else — `.on-p-2` is not "the second paragraph".
- In a **new project** these same classes carry that project's prefix: `.ax-h-1`,
  `.ax-sec-title-1`, `.ax-pr-btn-1` … The set and its meaning stay identical; only the
  prefix from §1 changes. Never leave another template's prefix behind in the SCSS.

---

## 6. HTML rules

- 4-space indentation, no tabs.
- Every section is wrapped in markers, used by the whole team to splice sections:
  ```html
  <!-- services-start -->
  <section class="on-services-2-area wa-p-relative pt-130 pb-130"> … </section>
  <!-- services-end -->
  ```
- Inside a section, label sub-blocks with short comments: `<!-- section-title -->`,
  `<!-- primary-btn -->`, `<!-- bg-img -->`.
- Semantic HTML5: `<header> <section> <footer> <nav> <h1–h6> <button> <ul>`. One `<h1>`
  per page. Never `<div>` for something that is a button or a link.
- **No inline `style=""`. No inline `<script>`.** Zero exceptions.
- Images: always an `alt` (empty `alt=""` for decorative). Interactive elements get
  `aria-label`. Backgrounds use `data-background="path"` + `wa-bg-default`
  (`main-common.js` applies it), never inline `style="background-image:…"`.
- Section spacing uses the utility loops: `pt-130 pb-130`, `mt-50`, `mb-24`. Custom
  spacing goes in SCSS, not in new one-off utility classes.
- Keep the `<head>` CSS order and the bottom `<script>` order identical across all pages;
  `main-common.js` always loads **before** `main.js`.
- Match a line break in the design with an explicit `<br>` in the heading, so the buyer
  sees the same wrap the demo shows.

---

## 7. SCSS rules

- Every partial starts with `@use '../abstracts/variables' as *;` — without it `$md`,
  `$xs` etc. are undefined and **the whole stylesheet fails to compile**, not just that
  file. (Prefer `@use` over the legacy `@import` used in older templates.)
- `main.scss` order is meaningful: abstracts → components → layout → pages. Layout loads
  after components, so a section can re-color a component, and a component `:hover` of
  equal weight will *lose* to it (see §11).
- Wrap each section block in markers that mirror the HTML:
  ```scss
  /*
      services-2-start
  */
  .on-services-2 { … }
  /*
      services-2-end
  */
  ```
- Build the block with `&-` nesting so the compiled selector stays flat:
  ```scss
  .on-services-2 {
      &-area { … }      // → .on-services-2-area
      &-card {
          .title-elm { … }
          &:is(.active) { … }
      }
  }
  ```
- Colors, fonts and easings come from the `:root` custom properties. A one-off accent
  (a chip background, a divider tint) may be a literal hex; a theme color may not.
- Breakpoints are the shared variables, written **largest to smallest**, grouped where the
  values are shared:
  ```scss
  @media #{$xxl} { … }
  @media #{$lg,$md,$xs} { … }
  ```

  | Var | Range |
  | --- | --- |
  | `$over` | ≥ 1800 |
  | `$xxxl` | 1600–1799 |
  | `$xxl` | 1400–1599 |
  | `$xl` | 1200–1399 |
  | `$lg` | 992–1199 |
  | `$md` | 768–991 |
  | `$sm` | 576–767 |
  | `$xs` | ≤ 767 |

- `!important` only inside `abstracts/_utility.scss`. Never in a layout partial.
- Comments explain **why**, not what. Match the surrounding density — a tricky offset or a
  cascade workaround gets a sentence; `display: flex` gets nothing.
- Keep the CSS INDEX list at the top of `abstracts/_common.scss` in sync when adding a
  section.

---

## 8. JavaScript rules

- `main-common.js` is the **shared library** used by every themexriver template: sticky
  header, offcanvas, search popup, marquee, accordion, counters, parallax, `data-background`,
  back-to-top. Treat it as read-only. If a project needs a variant, add a new
  `wa_*` hook next to the original (e.g. `wa_x_accordion_item`) rather than changing the
  existing behavior other templates depend on.
- `main.js` holds this template's own code, all inside the existing IIFE:
  ```js
  (function ($) {
  "use strict";
      …
  })(jQuery);
  ```
- **Guard every block** so a page that lacks the section pays nothing and throws nothing:
  ```js
  if ($(".on-projects-1-area").length) { … }
  ```
- Name variables after the section: `on_projects1_cards`, `on_services2_fan`.
- Scroll-driven / pinned effects go through `gsap.matchMedia()` with the same breakpoint
  the SCSS uses, and **must return a cleanup** that clears what they set:
  ```js
  gsap.matchMedia().add("(min-width: 1400px)", function () {
      …
      return function () { gsap.set(cards, { clearProps: "all" }); };
  });
  ```
- Read geometry off the live DOM (`offsetLeft`, `offsetWidth`) instead of hardcoding
  pixel offsets, and recompute on `onRefresh` / `invalidateOnRefresh: true`.
- No `console.log`, no commented-out code, no dead blocks in what ships. When a section is
  removed from the HTML, remove its JS.

---

## 9. Animation conventions

| Need | Use |
| --- | --- |
| Simple on-scroll reveal | WOW.js: `class="wow fadeInUp2" data-wow-delay=".2s"` |
| Custom on-scroll reveal | own keyframe + a class scoped in the section partial |
| Scroll-scrubbed / pinned sequence | GSAP ScrollTrigger inside `gsap.matchMedia()` |
| Infinite ticker | `wa_marquee` + `data-speed` / `data-direction` |
| Split-line headline | `wa_title_ani_1` (SplitText, parked before the preloader lifts) |

- `animation-fill-mode: both` holds the **last** keyframe — so a reveal on an element that
  rests at `opacity: .08` or `rotate(-30deg)` must **end on that value**, not on 0/1.
- Marquee tracks fade at both ends with a `mask-image` gradient, never a hard clip.
- Decorative motion is desktop-only: gate at `min-width: 1400px` (pinned sequences) or
  `992px` (hero intros), and make sure the CSS resets the runway/pin below that gate, or
  the page keeps reserving empty scroll height.

---

## 10. Responsive rules

- Test the layout mentally at every breakpoint in §7 before writing, not after.
- Nothing may scroll horizontally at any width. Tables, diagrams and wide rows get their
  own `overflow-x: auto`.
- Grids step down deliberately: 4 → 2 → 1, not 4 → 1.
- Full-bleed negative margins (`margin-left: -70px`) must be zeroed below `$xl`.
- Purely decorative absolute elements (glows, shape images, collages) are `display: none`
  below `$lg` — they cost bandwidth and break layouts on phones.
- Font sizes, paddings and fixed heights all need their own step-downs; a fixed `height`
  at desktop almost always becomes `height: auto` at `$md,$xs`.

---

## 11. Known pitfalls — do not rediscover these

- **Accordion smoothness**: animate `flex-grow` (a number) or `grid-template-rows: 0fr→1fr`.
  Never `max-height` (guesses a ceiling, snaps) and never `flex-basis: auto` (not
  interpolable).
- **Collapsed grid rows**: a `border-box` element can never be shorter than its own
  padding — padding on the collapsing child keeps a "closed" row visible. Move the padding
  to the open state.
- **Closed panes still cost height** unless they are taken out of flow
  (`position: absolute`), even with `visibility: hidden`.
- **State vs topic**: size/background must key off `.active` or `:nth-child`, never off a
  topic class (`.has-mission`) — any item can be the open one.
- **Cascade**: a section re-coloring a component is `(0,2,0)` and loads *after* it, so a
  plain `.on-pr-btn-1:hover` ties and loses. Fix with a doubled class:
  `&#{&}:hover { … }`.
- **Two siblings crossing mid-transition** make the row dip — put a `min-height` floor on
  the container.
- **Figma `letterSpacing` is a percentage**, even though the MCP appends `px`. `8` means
  `.08em`. Writing `letter-spacing: 16%` is invalid CSS and is dropped silently.
- **Figma rotated nodes**: `x/y/width/height` are the *unrotated* box; the centre
  (`x + w/2`, `y + h/2`) is the rotation pivot and is safe to use for offsets.
- **SVG viewBox from Figma** can be wrong when paths extend past the frame — check the path
  extents before trusting it.

---

## 12. ThemeForest pre-submit checklist

- [ ] W3C-valid HTML on every page; no browser console errors or 404s.
- [ ] Every page opens, every nav link resolves, 404 page included.
- [ ] Responsive and visually correct 320 → 1920, and at every breakpoint between.
- [ ] No inline CSS, no inline JS, no `!important` outside utilities.
- [ ] No unused files, no commented-out blocks, no leftover `<br>` spacers or placeholder
      sections in shipped pages.
- [ ] Consistent 4-space indentation across HTML, SCSS and JS.
- [ ] `alt` on every image, `aria-label` on icon-only controls, visible focus states.
- [ ] Images compressed; nothing shipped larger than it renders.
- [ ] Only licensed/license-free assets; fonts loaded from Google Fonts or bundled with a
      license.
- [ ] `main.css` **and** `main.css.map` regenerated and shipped alongside the SCSS sources.
- [ ] Template header comment (name, description, author, version) and CSS INDEX at the
      top of `abstracts/_common.scss` current.
- [ ] Documentation folder updated if the section list changed.

---

## 13. Where this file goes

**This file is `AGENTS.md`, in the project root.** That is the filename Command Code reads
(it loads `<project>/AGENTS.md`, or `<project>/.commandcode/AGENTS.md` if the root one is
missing) — it does **not** read `CLAUDE.md`.

| Tool | Reads |
| --- | --- |
| Command Code | `AGENTS.md` ← this file |
| Codex / OpenCode | `AGENTS.md` |
| Claude Code | `CLAUDE.md` — kept in the root as a 3-line stub that imports `@AGENTS.md` |
| Cursor | `.cursor/rules/*.mdc` — copy this content there if you use Cursor |

One source of truth: edit **this** file. Copying it to a new project means copying
`AGENTS.md` + the `CLAUDE.md` stub, then filling in §1.

## Deliver in one pass — no verification loops

The quality bar stays high: sections must match the design closely and the responsive
breakpoints must be written properly. Reach that quality in one careful pass, not through
repeated measure/render/compare cycles.

- Take the measurements needed (design JPG/PSD, asset sizes, colors, spacing) **once**,
  up front, before writing code — not as a build-then-adjust loop.
- Write all breakpoints (`$xxl / $xl / $lg / $md / $xs`) correctly the first time from
  those numbers, instead of rendering at four widths to discover what breaks.
- At most **one** render/screenshot to confirm the result. Then stop.
- If something genuinely needs a second look, ask — don't start another loop.

## Stop when the task is done

Once the work works, stop. No bonus screenshots, no extra checks, no re-auditing what
already passed.

## Reporting

Report in 2–4 lines: what changed and in which files (as clickable paths). No long recaps,
no restating what the user already saw.
