import Vector2D from '../lib/vector2d.js'

const $dir1 = document.querySelector('.dir1');
const $dir2 = document.querySelector('.dir2');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const inRange = (n, left, right) => Math.max(Math.min(n, right), left);

function drawPoint(p, text) {
  ctx.save();
  ctx.font = '22px serif'
  ctx.fillText(text, p.x + 5, p.y + 18)
  ctx.beginPath();
  ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLine(a, b, dash, color = "black") {
  ctx.save();
  if (dash) {
    ctx.setLineDash([4, 4]);
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.restore();
}

function draw(Q, R, P) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 计算结果

  const QP = P.copy().minus(Q);
  const RP = P.copy().minus(R);
  const QR = R.copy().minus(Q);
  const QRLen = QR.length;
  const PNLen = QRLen === 0 ? -1 : Math.abs(QP.cross(RP)) / 2 / QRLen;
  $dir1.innerText = PNLen;

  const QNLen = QP.dot(QR) / QRLen;
  const k = QNLen / QRLen;
  const N = new Vector2D(
    Q.x + (R.x - Q.x) * k,
    Q.y + (R.y - Q.y) * k,
  )
  drawLine(N, P, true, 'green');
  
  let PLLen = -1;
  if (QP.dot(QR) <= 0) {
    PLLen = QP.length;
    drawLine(Q, P, false, 'red');
  } else if (RP.dot(QR.copy().scale(-1)) <= 0) {
    PLLen = RP.length;
    drawLine(R, P, false, 'red');
  } else {
    PLLen = PNLen;
    drawLine(N, P, false, 'red');
  }
  $dir2.innerText = PLLen;

  // 线
  const a = (Q.y - R.y) / (Q.x - R.x);
  const b = (Q.x * R.y - Q.y * R.x) / (Q.x - R.x);
  const edgeL = new Vector2D(0, b);
  const edgeR = new Vector2D(canvas.width, a * canvas.height + b);
  drawLine(edgeL, edgeR, true, '#666');
  drawLine(Q, R, false, 'black');

  // 点
  drawPoint(Q, 'Q');
  drawPoint(R, 'R');
  drawPoint(P, 'P');
  drawPoint(N, 'N');
}

(function init() {
  const getDirs = (points, x, y) => points.map(v => Math.hypot(Math.abs(v.x - x), Math.abs(v.y - y)));
  let points = [
    new Vector2D(100, 150),
    new Vector2D(200, 100),
    new Vector2D(300, 250),
  ]
  let activeIndex = 0;
  let cacheActivePoint = null;
  let startPoint = null;

  canvas.addEventListener('mousedown', e => {
    const { screenX, screenY, offsetX, offsetY } = e;
    const dirs = getDirs(points, offsetX, offsetY);
    const closestIndex = dirs.reduce(
      (prev, item, index) => (dirs[prev] > item ? index : prev),
      0
    );
    if (dirs[closestIndex] <= 20) {
      activeIndex = closestIndex;
      cacheActivePoint = points[closestIndex];
      startPoint = new Vector2D(screenX, screenY);
    }
  });

  document.addEventListener('mousemove', e => {
    const { screenX, screenY, offsetX, offsetY } = e;
    if (startPoint === null) {
      const dirs = getDirs(points, offsetX, offsetY);
      const closestDir = dirs.reduce((prev, item) => Math.min(prev, item), canvas.width + canvas.height);
      document.body.style.cursor = closestDir <= 10 ? 'move' : 'default';
      return;
    }
    points[activeIndex] = new Vector2D(
      inRange(cacheActivePoint.x + screenX - startPoint.x, 0, canvas.width),
      inRange(cacheActivePoint.y + screenY - startPoint.y, 0, canvas.height),
    );

    draw(...points);
  });

  document.addEventListener('mouseup', e => {
    cacheActivePoint = null;
    startPoint = null;
  })

  draw(...points);
})()

