# Contributing

Thanks for your interest! This is a zero-build static site — no toolchain to install.
To work on it, clone the repo and open any `.html` file in a browser.

```bash
git clone https://github.com/Psesh5/visual-course-companions.git
cd visual-course-companions
open catalog.html      # macOS; or just double-click it
```

## Project shape

- `catalog.html` — top-level landing page listing the courses
- `index.html` — the Linear Algebra (18.06) hub
- `lib/` — shared assets: `style.css`, plus one domain JS lib per subject
  (`linalg.js` → `window.LA`, `prob.js` → `window.PR`). These are pure functions, no DOM.
- `lectures/` — Linear Algebra lecture pages
- `probability/` — the Probability (6.041) course: its own `index.html`, `course.json`, and `lectures/`

## Adding a lecture to an existing course

1. Copy an existing lecture page (e.g. `probability/lectures/clt.html`) as a starting point.
2. Keep the conventions: load Plotly from the CDN, link the shared `../../lib/style.css`,
   include the breadcrumb, and end with the shared domain lib + a single inline IIFE that
   wires the controls to a `Plotly.react` redraw.
3. Prefer reusing helpers from the domain lib (`LA.*` / `PR.*`); add small local helpers
   inline only when needed.
4. Add a card for it on the course hub (`index.html` / `probability/index.html`) and an
   entry in that course's `course.json`.

## Adding a whole course

A course is: a folder, a `course.json` manifest, a domain lib in `lib/`, and per-lecture
HTML pages. Add a card for it on `catalog.html`. Follow the `probability/` course as the template.

## Style

- Match the surrounding code: the existing comment density, naming, and structure.
- Each lecture should pair an **intuition** write-up with the **worked math** beside the figure.
- Use Unicode math (μ, σ, λ, √, ²) and `<code>` spans — no MathJax/build step.
- Keep it dependency-free beyond Plotly-from-CDN.

## Content & licensing

Code contributions are under the MIT License; educational content is under CC BY-NC-SA 4.0
(see `LICENSE` and `LICENSE-content`). By contributing you agree your contributions are
licensed the same way. Keep teaching content accurate and attributed to the underlying
MIT OpenCourseWare course.
