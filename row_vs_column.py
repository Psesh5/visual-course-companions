"""
18.06 Lecture 1 — Row picture vs. Column picture of Ax = b
System (Strang's beloved tridiagonal K):
    2x -  y       = 1
    -x + 2y -  z  = 0
        - y + 2z  = 1
Solution: x = y = z = 1.
"""
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots

A = np.array([[2., -1., 0.],
              [-1., 2., -1.],
              [0., -1., 2.]])
b = np.array([1., 0., 1.])
sol = np.linalg.solve(A, b)            # (1, 1, 1)

fig = make_subplots(
    rows=1, cols=2,
    specs=[[{"type": "scene"}, {"type": "scene"}]],
    subplot_titles=("ROW picture: 3 planes meet at the solution",
                    "COLUMN picture: columns combine to make b"),
)

# ---------- ROW PICTURE : each equation is a plane ----------
g = np.linspace(-2, 4, 12)
P, Q = np.meshgrid(g, g)
colors = ["Blues", "Greens", "Oranges"]
for i in range(3):
    a1, a2, a3 = A[i]
    # solve for the coordinate with the largest coefficient to avoid blow-ups
    if abs(a3) >= max(abs(a1), abs(a2)):
        X, Y = P, Q
        Z = (b[i] - a1 * X - a2 * Y) / a3
    elif abs(a2) >= abs(a1):
        X, Z = P, Q
        Y = (b[i] - a1 * X - a3 * Z) / a2
    else:
        Y, Z = P, Q
        X = (b[i] - a2 * Y - a3 * Z) / a1
    fig.add_trace(go.Surface(x=X, y=Y, z=Z, showscale=False,
                             colorscale=colors[i], opacity=0.55,
                             name=f"eq {i+1}"), row=1, col=1)

# the intersection point (the solution)
fig.add_trace(go.Scatter3d(x=[sol[0]], y=[sol[1]], z=[sol[2]],
                           mode="markers+text", text=["  solution (1,1,1)"],
                           textposition="top center",
                           marker=dict(size=7, color="red"),
                           name="solution"), row=1, col=1)

# ---------- COLUMN PICTURE : columns of A as vectors, summing to b ----------
def arrow(start, end, color, name, col):
    sx, sy, sz = start
    ex, ey, ez = end
    fig.add_trace(go.Scatter3d(x=[sx, ex], y=[sy, ey], z=[sz, ez],
                               mode="lines", line=dict(color=color, width=8),
                               name=name), row=1, col=col)
    fig.add_trace(go.Cone(x=[ex], y=[ey], z=[ez],
                          u=[ex - sx], v=[ey - sy], w=[ez - sz],
                          sizemode="absolute", sizeref=0.4,
                          colorscale=[[0, color], [1, color]], showscale=False),
                  row=1, col=2)

cols = A.T  # columns of A
cnames = ["1·col1", "1·col2", "1·col3"]
ccolor = ["#1f77b4", "#2ca02c", "#ff7f0e"]
# tip-to-tail sum: col1 -> col1+col2 -> col1+col2+col3 = b
running = np.zeros(3)
for i in range(3):
    start = running.copy()
    running = running + cols[i]
    arrow(start, running, ccolor[i], cnames[i], col=2)
# the resultant b
arrow([0, 0, 0], b, "red", "b = (1,0,1)", col=2)

scene = dict(xaxis_title="x", yaxis_title="y", zaxis_title="z",
             aspectmode="cube")
fig.update_layout(
    title="Ax = b  —  drag to rotate, scroll to zoom, hover for values",
    scene=scene, scene2=scene,
    height=720, margin=dict(l=0, r=0, t=80, b=0),
)
out = "/Users/ps/linalg-viz/row_vs_column.html"
fig.write_html(out, include_plotlyjs="cdn")
print("wrote", out)
