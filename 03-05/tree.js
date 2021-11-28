const pi = Math.PI;

class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  rotate(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const { x, y } = this;
    return new Vector2D(
      x * c - y * s,
      x * s + y * c
    );
  }

  scale(n) {
    return new Vector2D(this.x * n, this.y * n);
  }
}

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
ctx.translate(canvas.width / 2, canvas.height);
ctx.scale(1, -1);

const draw = (ctx, v, width) => {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.moveTo(0, 0);
  ctx.lineTo(v.x, v.y);
  ctx.stroke();
  ctx.translate(v.x, v.y);
}

const grow = (ctx, v, width, bias) => {
  if (width < 1) {
    return;
  }

  ctx.save();

  draw(ctx, v, width);

  grow(
    ctx,
    v
      .rotate(Math.random() * bias)
      .scale(Math.random() * 0.2 + 0.7),
    width * (Math.random() * 0.1 + 0.7),
    bias * 0.9
  );

  grow(
    ctx,
    v
      .rotate(-Math.random() * bias)
      .scale(Math.random() * 0.2 + 0.7),
    width * (Math.random() * 0.1 + 0.7),
    bias * 0.9
  );

  if (width < 5 && width > 1.5 && Math.random() > 0.8) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.arc(0, 0, Math.random() * 2 + 1, 0, pi * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
};

ctx.save();
grow(ctx, new Vector2D(0, 60), 8, pi / 4);
ctx.restore();

