import Vector2D from '../lib/vector2d.js'

const CANVAS_WIDTH = 400;
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

function drawPoint(p) {
  ctx.save();
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
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
  // 计算结果

  const QP = P.copy().minus(Q);
  const RP = P.copy().minus(R);
  const QR = R.copy().minus(Q);
  const QRLen = QR.length;
  const PNLen = QRLen === 0 ? -1 : Math.abs(QP.cross(RP)) / 2 / QRLen;

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
    PLLen = QR.length;
    drawLine(R, P, false, 'red');
  } else {
    PLLen = PNLen;
    drawLine(N, P, false, 'red');
  }

  // 线
  const a = (Q.y - R.y) / (Q.x - R.x);
  const b = (Q.x * R.y - Q.y * R.x) / (Q.x - R.x);
  const edgeL = new Vector2D(0, b);
  const edgeR = new Vector2D(CANVAS_WIDTH, a * 400 + b);
  drawLine(edgeL, edgeR, true, '#666');
  drawLine(Q, R, false, 'black');

  // 点
  drawPoint(Q, 'Q');
  drawPoint(R, 'R');
  drawPoint(P, 'P');
  drawPoint(N, 'N');
}

draw(
  new Vector2D(100, 150),
  new Vector2D(200, 100),
  new Vector2D(300, 250)
);
