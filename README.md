# Visual Course Companions

Interactive, zero-build visual companions to foundational math & statistics courses.
Each lecture turns a core idea into something you can drag, tune, and watch move.
Built with [Plotly.js](https://plotly.com/javascript/) loaded from a CDN — no install, no build step. Open any HTML file in a browser.

**Start here:** [`catalog.html`](catalog.html)

## Courses

### MIT 18.06 · Linear Algebra (Gilbert Strang)
25 interactive modules across 31 lectures — the geometry of `Ax = b`, elimination, the four
fundamental subspaces, projections & least squares, determinants, eigenvalues, SVD, and linear
transformations. Hub: [`index.html`](index.html).

### MIT 6.041 · Probability & Random Processes (John Tsitsiklis)
14 interactive modules across all 7 units — probability axioms & Bayes, PMFs & expectation,
PDFs/CDFs, joint densities & correlation, derived distributions, the inequalities & the Central
Limit Theorem, Bayesian inference, and the Bernoulli/Poisson/Markov processes.
Hub: [`probability/index.html`](probability/index.html).

## Structure

```
catalog.html              # multi-course landing page
index.html                # linear algebra hub
lib/
  style.css               # shared styles
  linalg.js               # linear-algebra math + Plotly helpers (window.LA)
  prob.js                 # probability/stats math + Plotly helpers (window.PR)
lectures/                 # linear algebra lecture pages
probability/
  index.html              # probability hub
  course.json             # probability manifest
  lectures/               # probability lecture pages
```

Adding a course = drop in a `course.json`, a domain JS lib under `lib/`, and per-lecture HTML pages
that load Plotly + the shared stylesheet + that domain lib.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) — adding a lecture or a whole course is a matter of
copying the established pattern. No build step.

## License

Dual-licensed by component:

- **Source code** — [MIT License](LICENSE) (interactive logic, Plotly helpers, scaffolding, tooling).
- **Educational content** — [CC BY-NC-SA 4.0](LICENSE-content) (lecture write-ups, intuition/worked-math
  narrative, choice of teaching examples), to stay compatible with the MIT OpenCourseWare materials it is
  built on and verified against.

Course materials © MIT OpenCourseWare, used under CC BY-NC-SA 4.0. This is an independent project and is
not endorsed by MIT, MIT OpenCourseWare, or the course instructors (Gilbert Strang, John Tsitsiklis).
