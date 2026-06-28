/* linalg.js — shared math + Plotly helpers for the 18.06 visualizer.
   Pure functions, no DOM. Loaded by every lecture page. */
(function (g) {
  const LA = {};

  LA.COLORS = ["Blues", "Greens", "Oranges"];   // plane colorscales
  LA.VEC    = ["#1f77b4", "#2ca02c", "#ff7f0e"]; // column vector colors
  LA.SCENE  = () => ({ xaxis:{title:"x"}, yaxis:{title:"y"}, zaxis:{title:"z"}, aspectmode:"cube" });

  LA.linspace = (a, b, n) => {
    const out = []; for (let i = 0; i < n; i++) out.push(a + (b - a) * i / (n - 1)); return out;
  };
  LA.round = (v) => { const r = Math.round(v * 1000) / 1000; return Object.is(r, -0) ? 0 : r; };

  LA.det3 = (m) =>
      m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])
    - m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])
    + m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);

  LA.replaceCol = (A, b, k) => A.map((row, i) => row.map((v, j) => (j === k ? b[i] : v)));

  /* Classify a 3x3 system: returns {type:'one'|'none'|'inf', sol?, rank, det?} */
  LA.analyze = (A, b) => {
    const eps = 1e-9;
    const M = [[...A[0], b[0]], [...A[1], b[1]], [...A[2], b[2]]];
    let rank = 0;
    for (let col = 0; col < 3 && rank < 3; col++) {
      let piv = -1, best = eps;
      for (let r = rank; r < 3; r++) if (Math.abs(M[r][col]) > best) { best = Math.abs(M[r][col]); piv = r; }
      if (piv < 0) continue;
      [M[rank], M[piv]] = [M[piv], M[rank]];
      for (let r = 0; r < 3; r++) if (r !== rank) {
        const f = M[r][col] / M[rank][col];
        for (let c = col; c < 4; c++) M[r][c] -= f * M[rank][c];
      }
      rank++;
    }
    let inconsistent = false;
    for (let r = 0; r < 3; r++) {
      const zeroRow = Math.abs(M[r][0]) < 1e-7 && Math.abs(M[r][1]) < 1e-7 && Math.abs(M[r][2]) < 1e-7;
      if (zeroRow && Math.abs(M[r][3]) > 1e-7) inconsistent = true;
    }
    if (rank === 3) {
      const det = LA.det3(A);
      const sol = [0, 1, 2].map((k) => LA.det3(LA.replaceCol(A, b, k)) / det);
      return { type: "one", sol, rank, det };
    }
    if (inconsistent) return { type: "none", rank, det: 0 };
    return { type: "inf", rank, det: 0 };
  };

  /* Plotly surface trace for the plane a1*x + a2*y + a3*z = d over [-R,R]^2. */
  LA.planeTrace = (a1, a2, a3, d, R, scale) => {
    if (Math.abs(a1) + Math.abs(a2) + Math.abs(a3) < 1e-12) return null;
    const n = 16, gr = LA.linspace(-R, R, n), X = [], Y = [], Z = [];
    const big = Math.max(Math.abs(a1), Math.abs(a2), Math.abs(a3));
    for (let i = 0; i < n; i++) {
      X.push([]); Y.push([]); Z.push([]);
      for (let j = 0; j < n; j++) {
        let x, y, z;
        if (Math.abs(a3) === big)      { x = gr[i]; y = gr[j]; z = (d - a1*x - a2*y) / a3; }
        else if (Math.abs(a2) === big) { x = gr[i]; z = gr[j]; y = (d - a1*x - a3*z) / a2; }
        else                           { y = gr[i]; z = gr[j]; x = (d - a2*y - a3*z) / a1; }
        X[i].push(x); Y[i].push(y); Z[i].push(z);
      }
    }
    return { type: "surface", x: X, y: Y, z: Z, showscale: false, opacity: 0.55, colorscale: scale };
  };

  /* Arrow = line segment + cone head. Returns an array of two traces. */
  LA.arrow = (p, q, color, width) => ([
    { type: "scatter3d", mode: "lines", x:[p[0],q[0]], y:[p[1],q[1]], z:[p[2],q[2]],
      line: { color, width: width || 7 }, showlegend: false },
    { type: "cone", x:[q[0]], y:[q[1]], z:[q[2]], u:[q[0]-p[0]], v:[q[1]-p[1]], w:[q[2]-p[2]],
      sizemode: "absolute", sizeref: 0.4, showscale: false, colorscale: [[0, color], [1, color]] },
  ]);

  g.LA = LA;
})(window);
