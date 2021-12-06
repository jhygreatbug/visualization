export default class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  minus(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  cross(v) {
    return this.x * v.y - v.x * this.y;
  }

  get length() {
    return Math.hypot(this.x, this.y);
  }

  rotate(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const { x, y } = this;
    this.x = x * c - y * s;
    this.y = x * s + y * c;
    return this;
  }

  scale(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }

  copy() {
    return new Vector2D(this.x, this.y);
  }
}
