export function parametric2D(sFunc, tFunc, rFunc) {
  return function (start, end, seg = 100, ...args) {
    const points = [];
    for(let i = 0; i <= seg; i++) {
      const p = i / seg;
      const t = start * (1 - p) + end * p;
      const x = sFunc(t, ...args);
      const y = tFunc(t, ...args);
      if(rFunc) {
        points.push(rFunc(x, y));
      } else {
        points.push([x, y]);
      }
    }
    return points;
  };
}
