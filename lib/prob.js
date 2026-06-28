/* prob.js — shared probability / statistics + Plotly helpers for the visualizer.
   Pure functions, no DOM. Loaded by every probability lecture page.
   Sibling to linalg.js; exposed as window.PR. */
(function (g) {
  const PR = {};

  PR.round = (v, d) => {
    const p = Math.pow(10, d == null ? 3 : d);
    const r = Math.round(v * p) / p;
    return Object.is(r, -0) ? 0 : r;
  };
  PR.linspace = (a, b, n) => {
    const out = []; for (let i = 0; i < n; i++) out.push(a + (b - a) * i / (n - 1)); return out;
  };

  /* sample statistics */
  PR.mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
  PR.variance = (xs) => { const m = PR.mean(xs); return xs.reduce((s, x) => s + (x - m) * (x - m), 0) / xs.length; };
  PR.std = (xs) => Math.sqrt(PR.variance(xs));

  /* standard normal via Box–Muller */
  PR.randn = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  /* one-draw samplers */
  PR.uniform     = (a, b) => a + (b - a) * Math.random();
  PR.exponential = (lam)  => -Math.log(1 - Math.random()) / lam;
  PR.bernoulli   = (p)    => (Math.random() < p ? 1 : 0);
  PR.normal      = (mu, sig) => mu + sig * PR.randn();
  PR.dieRoll     = ()     => 1 + ((Math.random() * 6) | 0);
  PR.cauchy      = ()     => Math.tan(Math.PI * (Math.random() - 0.5));

  /* normal density */
  PR.normPdf = (x, mu, sig) =>
    Math.exp(-((x - mu) * (x - mu)) / (2 * sig * sig)) / (sig * Math.sqrt(2 * Math.PI));

  /* histogram of xs over [lo,hi] in `bins` buckets.
     Returns {centers, density, width} with density normalized so total area ≈ 1. */
  PR.histogram = (xs, lo, hi, bins) => {
    const w = (hi - lo) / bins, counts = new Array(bins).fill(0);
    let kept = 0;
    for (const x of xs) {
      if (x < lo || x > hi) continue;            // out-of-range (e.g. Cauchy tails) excluded from area
      let k = Math.floor((x - lo) / w);
      if (k < 0) k = 0; if (k >= bins) k = bins - 1;
      counts[k]++; kept++;
    }
    const centers = [], density = [];
    for (let i = 0; i < bins; i++) {
      centers.push(lo + w * (i + 0.5));
      density.push(kept ? counts[i] / (kept * w) : 0);
    }
    return { centers, density, width: w };
  };

  /* combinatorics */
  PR.factorial = (n) => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };
  PR.choose = (n, k) => {
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k); let num = 1, den = 1;
    for (let i = 0; i < k; i++) { num *= (n - i); den *= (i + 1); }
    return num / den;
  };

  /* discrete pmfs */
  PR.binomPmf  = (k, n, p) => PR.choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  PR.poissonPmf = (k, lam) => Math.exp(-lam + k * Math.log(lam) - PR.logGamma(k + 1));
  PR.geomPmf   = (k, p) => (k >= 1 ? Math.pow(1 - p, k - 1) * p : 0);   // k = 1,2,3,…

  /* error function (Abramowitz & Stegun 7.1.26) → normal CDF */
  PR.erf = (x) => {
    const s = x < 0 ? -1 : 1; x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  };
  PR.normCdf = (x, mu, sig) => 0.5 * (1 + PR.erf((x - mu) / (sig * Math.SQRT2)));

  /* log-gamma (Lanczos) → Beta density for Bayesian updating */
  PR.logGamma = (z) => {
    const g = 7, c = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - PR.logGamma(1 - z);
    z -= 1; let x = c[0];
    for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
    const t = z + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  };
  PR.betaPdf = (x, a, b) => {
    if (x <= 0 || x >= 1) return 0;
    const logB = PR.logGamma(a) + PR.logGamma(b) - PR.logGamma(a + b);
    return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - logB);
  };

  /* one draw from the standard bivariate normal with correlation rho → [x,y] */
  PR.bivariateNormal = (rho) => {
    const x = PR.randn();
    const y = rho * x + Math.sqrt(Math.max(0, 1 - rho * rho)) * PR.randn();
    return [x, y];
  };

  g.PR = PR;
})(window);
