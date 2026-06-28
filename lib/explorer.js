/* explorer.js — reusable 3x3 system explorer widget.
   Usage:  LA.mountExplorer({ root: "#mount", example: { A, b } });
   Renders an editable system, a status box, and row + column 3D pictures. */
(function (LA) {
  LA.mountExplorer = function (opts) {
    const root = typeof opts.root === "string" ? document.querySelector(opts.root) : opts.root;
    const EX_A = opts.example.A, EX_B = opts.example.b;
    const uid = "ex" + Math.floor(performance.now() % 1e6);

    root.innerHTML = `
      <table class="sys" id="${uid}_grid"></table>
      <div class="controls">
        <button class="primary" id="${uid}_plot">Plot</button>
        <button id="${uid}_reset">Reset to this lecture's system</button>
        <label class="rng">axis range ±<input id="${uid}_rng" class="coef" type="number" value="4" style="width:48px"></label>
      </div>
      <div class="status" id="${uid}_status"></div>
      <div class="plots">
        <div id="${uid}_row" class="plot"></div>
        <div id="${uid}_col" class="plot"></div>
      </div>`;

    const $ = (s) => document.getElementById(`${uid}_${s}`);

    // build editable grid
    let html = "";
    for (let i = 0; i < 3; i++) {
      html += "<tr>";
      for (let j = 0; j < 3; j++) {
        html += `<td><input class="coef" id="${uid}_A${i}${j}" value="${EX_A[i][j]}"></td>`;
        html += `<td class="var">${["x","y","z"][j]}${j<2?" +":""}</td>`;
      }
      html += `<td class="var"> =</td><td><input class="coef" id="${uid}_b${i}" value="${EX_B[i]}"></td></tr>`;
    }
    $("grid").innerHTML = html;

    const read = () => {
      const A = [[0,0,0],[0,0,0],[0,0,0]], b = [0,0,0];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) A[i][j] = parseFloat(document.getElementById(`${uid}_A${i}${j}`).value) || 0;
        b[i] = parseFloat(document.getElementById(`${uid}_b${i}`).value) || 0;
      }
      return { A, b };
    };

    const reset = () => {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) document.getElementById(`${uid}_A${i}${j}`).value = EX_A[i][j];
        document.getElementById(`${uid}_b${i}`).value = EX_B[i];
      }
      draw();
    };

    function draw() {
      const { A, b } = read();
      const R = parseFloat($("rng").value) || 4;
      const res = LA.analyze(A, b);
      status(A, b, res);

      // row picture
      const rowData = [];
      for (let i = 0; i < 3; i++) {
        const t = LA.planeTrace(A[i][0], A[i][1], A[i][2], b[i], R, LA.COLORS[i]);
        if (t) rowData.push(t);
      }
      if (res.type === "one") rowData.push({
        type: "scatter3d", mode: "markers+text", x:[res.sol[0]], y:[res.sol[1]], z:[res.sol[2]],
        text: ["  (" + res.sol.map(LA.round).join(", ") + ")"], textposition: "top center",
        marker: { size: 7, color: "red" }, showlegend: false });
      Plotly.newPlot($("row"), rowData,
        { title: "ROW picture — each equation is a plane", scene: LA.SCENE(), margin:{l:0,r:0,t:34,b:0} },
        { responsive: true });

      // column picture
      const cols = [0,1,2].map((j) => [A[0][j], A[1][j], A[2][j]]);
      let colData = [];
      if (res.type === "one") {
        let run = [0,0,0];
        for (let j = 0; j < 3; j++) {
          const s = res.sol[j], v = cols[j].map((c) => c*s), start = [...run];
          run = run.map((r,k) => r + v[k]);
          colData = colData.concat(LA.arrow(start, run, LA.VEC[j], 8));
        }
        colData = colData.concat(LA.arrow([0,0,0], b, "red", 6));
      } else {
        for (let j = 0; j < 3; j++) colData = colData.concat(LA.arrow([0,0,0], cols[j], LA.VEC[j], 7));
        colData = colData.concat(LA.arrow([0,0,0], b, "red", 6));
      }
      Plotly.newPlot($("col"), colData,
        { title: "COLUMN picture — combine columns to reach b", scene: LA.SCENE(), margin:{l:0,r:0,t:34,b:0} },
        { responsive: true });
    }

    function status(A, b, res) {
      const r = LA.round;
      let head = "", body = "";
      if (res.type === "one") {
        head = `<span class="tag one">ONE solution</span> &nbsp; det(A) = ${r(res.det)} ≠ 0 → A is invertible.`;
        body = `Solution <code>(x, y, z) = (${res.sol.map(r).join(", ")})</code>.<br>`
             + `<b>Row:</b> the three planes meet at this single red point. &nbsp; `
             + `<b>Column:</b> ${r(res.sol[0])}·col1 + ${r(res.sol[1])}·col2 + ${r(res.sol[2])}·col3 chains onto <code>b</code>.`;
      } else if (res.type === "none") {
        head = `<span class="tag none">NO solution</span> &nbsp; det(A) = 0 (singular), rank = ${res.rank}.`;
        body = `Elimination hits a row <code>0 = (nonzero)</code>: the planes share no common point and `
             + `<code>b</code> lies outside the column space.`;
      } else {
        head = `<span class="tag inf">INFINITELY MANY</span> &nbsp; det(A) = 0 (singular), rank = ${res.rank}.`;
        body = `Columns are dependent but <code>b</code> is in their span — the planes share a whole line `
             + `(particular solution + null space).`;
      }
      $("status").innerHTML = head + "<br>" + body;
    }

    $("plot").onclick = draw;
    $("reset").onclick = reset;
    draw();
    return { draw, reset, read };
  };
})(window.LA);
