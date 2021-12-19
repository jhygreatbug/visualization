import Vector2D from "./vector2d.js";

function inTriangle(p1, p2, p3, point) {
  const v1 = p1.copy().minus(point);
  const v2 = p2.copy().minus(point);
  const v3 = p3.copy().minus(point);

  const e1 = p1.copy().minus(p2);
  const e2 = p2.copy().minus(p3);
  const e3 = p3.copy().minus(p1);

  const s1 = Math.sign(v1.copy().cross(e1));
  const s2 = Math.sign(v2.copy().cross(e2));
  const s3 = Math.sign(v3.copy().cross(e3));

  if (isPointOnVector(v1, e1)) {
    return true;
  }
  if (isPointOnVector(v2, e2)) {
    return true;
  }
  if (isPointOnVector(v3, e3)) {
    return true;
  }

  return s1 === s2 && s2 == s3;
}

export function isPointOnVector(p, v) {
  const sign = Math.sign(p.copy().cross(v));
  const ratioLen = p.copy().dot(v) / v.length ** 2;
  if (sign === 0 && 0 <= ratioLen && ratioLen <= 1) {
    return true;
  }
}

export function isPointInPath(vertices, triangulations, point) {
  for (let i = 0; i < triangulations.length; i += 3) {
    const inTran = inTriangle(
      new Vector2D(...vertices[triangulations[i]]),
      new Vector2D(...vertices[triangulations[i + 1]]),
      new Vector2D(...vertices[triangulations[i + 2]]),
      point,
    )
    if (inTran) {
      return true;
    }
  }
  return false;
}
