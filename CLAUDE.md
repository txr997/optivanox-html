# Working rules

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

## Markup / style conventions

- Follow the existing naming and nesting conventions of the file being edited.
- Write styles in the SCSS partials only — never hand-edit the compiled CSS.
- **Don't run the sass compiler.** A watcher already compiles
  `assets/scss/main.scss` → `assets/css/main.css` automatically on save; running
  `sass` manually is unnecessary work.
- Match the surrounding comment density and indentation (tabs where the file uses tabs).
