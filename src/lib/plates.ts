/** Dimetric plate geometry shared by the hero stage, architecture diagram, mark, loaders and empty states.
 *  Computed, never hand-drawn. u,v are plate-local coordinates; z lifts a plate; yc is its centre on screen. */
export const KX = 0.9;
export const KY = 0.34;

export type Pt = [number, number];

export function project(u: number, v: number, z: number, cx: number, yc: number): Pt {
  return [cx + (u - v) * KX, yc + (u + v) * KY - z];
}

export function plate(hw: number, hd: number, cx: number, yc: number, thickness: number) {
  const A = project(-hw, -hd, 0, cx, yc);
  const B = project(hw, -hd, 0, cx, yc);
  const C = project(hw, hd, 0, cx, yc);
  const D = project(-hw, hd, 0, cx, yc);
  const pts = (...p: Pt[]) => p.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ");
  return {
    top: pts(A, B, C, D),
    left: pts(D, C, [C[0], C[1] + thickness], [D[0], D[1] + thickness]),
    right: pts(C, B, [B[0], B[1] + thickness], [C[0], C[1] + thickness]),
    center: project(0, 0, 0, cx, yc),
    corners: { A, B, C, D },
    /** matrix() that maps plate-local (u,v) drawing coordinates onto the top face */
    matrix: `matrix(${KX} ${KY} ${-KX} ${KY} ${cx} ${yc})`,
  };
}

/** A circle on a plate top face is an ellipse; this returns the transform-ready group matrix only. */
export function ring(n: number, r1: number, r2: number): { x1: number; y1: number; x2: number; y2: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return {
      x1: +(Math.cos(a) * r1).toFixed(1),
      y1: +(Math.sin(a) * r1).toFixed(1),
      x2: +(Math.cos(a) * r2).toFixed(1),
      y2: +(Math.sin(a) * r2).toFixed(1),
    };
  });
}
