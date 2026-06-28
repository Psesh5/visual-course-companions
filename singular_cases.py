"""
18.06 Lec 1-3 — When Ax=b goes wrong (singular A).
Singular matrix: col3 = col1 + col2, so the 3 columns lie in ONE plane.
    col1=(1,1,1)  col2=(1,2,3)  col3=(2,3,4)
Two right-hand sides:
  b not in that plane  -> NO solution      (planes form a triangular tunnel)
  b in that plane      -> INFINITELY MANY  (planes share a whole line)
"""
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots

A = np.array([[1., 1., 2.],
              [1., 2., 3.],
              [1., 3., 4.]])           # rank 2: col3 = col1 + col2
b_none = np.array([1., 0., 0.])        # not in column space -> no solution
b_many = np.array([1., 1., 1.])        # = col1, in column space -> infinitely many

fig = make_subplots(
    rows=1, cols=2,
    specs=[[{"type": "scene"}, {"type": "scene"}]],
    subplot_titles=("NO solution: planes meet pairwise but share no point",
                    "INFINITELY MANY: all 3 planes share a common LINE"),
)

g = np.linspace(-3, 3, 12)
P, Q = np.meshgrid(g, g)
colors = ["Blues", "Greens", "Oranges"]

def add_planes(b, col):
    for i in range(3):
        a1, a2, a3 = A[i]
        if abs(a3) >= max(abs(a1), abs(a2)):
            X, Y = P, Q; Z = (b[i] - a1*X - a2*Y) / a3
        elif abs(a2) >= abs(a1):
            X, Z = P, Q; Y = (b[i] - a1*X - a3*Z) / a2
        else:
            Y, Z = P, Q; X = (b[i] - a2*Y - a3*Z) / a1
        fig.add_trace(go.Surface(x=X, y=Y, z=Z, showscale=False,
                                 colorscale=colors[i], opacity=0.5),
                      row=1, col=col)

add_planes(b_none, 1)
add_planes(b_many, 2)

# For the "infinitely many" case, draw the shared line of solutions.
# Particular solution x=(1,0,0); null-space direction n with A n = 0:
# col3 = col1+col2  =>  n = (1, 1, -1)
xp = np.array([1., 0., 0.])
n = np.array([1., 1., -1.])
t = np.linspace(-2.5, 2.5, 2)
line = xp[:, None] + n[:, None] * t
fig.add_trace(go.Scatter3d(x=line[0], y=line[1], z=line[2],
                           mode="lines", line=dict(color="red", width=10),
                           name="line of solutions"), row=1, col=2)

scene = dict(xaxis_title="x", yaxis_title="y", zaxis_title="z", aspectmode="cube")
fig.update_layout(
    title="Singular A — drag to rotate. Left: no common point. Right: a whole red line of solutions.",
    scene=scene, scene2=scene, height=720, margin=dict(l=0, r=0, t=80, b=0),
    showlegend=False,
)
out = "/Users/ps/linalg-viz/singular_cases.html"
fig.write_html(out, include_plotlyjs="cdn")
print("wrote", out)
