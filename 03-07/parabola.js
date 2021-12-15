const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.scale(1, -1);

const LINE_SEGMENTS = 60;
function parabola(x0, y0, p, min, max) {
  const ret = [];
  for(let i = 0; i <= LINE_SEGMENTS; i++) {
    const s = i / 60;
    const t = min * (1 - s) + max * s;
    const x = x0 + 2 * p * t ** 2;
    const y = y0 + 2 * p * t;
    ret.push([x, y]);
  }
  return ret;
}

function draw(ret) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo[ret[0]];
  for (let i = 1; i < ret.length; i++) {
    ctx.lineTo(...ret[i])
  }
  ctx.stroke();
  ctx.restore();
}

draw(parabola(0, 0, 5.5, -10, 10));
