import { parametric2D } from '../lib/parametic2D.js';


function drawLines({ points, ctx, closePath }) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(-width / 2, -height / 2, width, height);

  // 画坐标轴
  ctx.save();
  ctx.strokeStyle = '#ccc';
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(-width / 2, 0);
  ctx.moveTo(0, height / 2);
  ctx.lineTo(0, -height / 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(...points[i])
  }
  if (closePath) {
    ctx.closePath();
  }
  ctx.stroke();
  ctx.restore();
}

function update(type) {
  const option = options.find(v => v.name === type);
  const params = option.defaultParams.split(',').map(v => parseFloat(v, 10));
  const points = option.parametric(...params);
  $select.value = type;
  $input.value = option.defaultParams;
  drawLines({ points, ctx, closePath: option.closePath });
}

const options = [
  {
    name: '椭圆',
    x: (t, x0, y0, a, b) => x0 + a * Math.cos(t),
    y: (t, x0, y0, a, b) => y0 + b * Math.sin(t),
    defaultParams: '0,6.284,100,50,25,125,75',
    closePath: true,
  },
  {
    name: '抛物线',
    x: (t, x0, y0, p) => x0 + 2 * p * t ** 2,
    y: (t, x0, y0, p) => y0 + 2 * p * t,
    defaultParams: '-10,10,100,0,0,5',
  },
  {
    name: '阿基米德螺旋线',
    x: (t, r) => r * t * Math.cos(t),
    y: (t, r) => r * t * Math.sin(t),
    defaultParams: '0,35,500,5',
  },
  {
    name: '星形线',
    x: (t, r) => r * Math.cos(t) ** 3,
    y: (t, r) => r * Math.sin(t) ** 3,
    defaultParams: '0,6.284,100,100',
    closePath: true,
  },
];
options.forEach(option => {
  option.parametric = parametric2D(option.x, option.y);
});

const defaultOption = '椭圆';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.scale(1, -1);

const $select = document.querySelector('#type');
const $input = document.querySelector('#params');
const $button = document.querySelector('#draw');

$select.innerHTML = options
  .map(i => `<option value="${i.name}">${i.name}</option>`)
  .join('');

$select.addEventListener('change', e => {
  const type = e.target.value;
  update(type);
});

$button.addEventListener('click', e => {
  const type = $select.value;
  const option = options.find(v => v.name === type);
  const params = $input.value.split(',').map(v => parseInt(v, 10));
  const points = option.parametric(...params);
  drawLines({ points, ctx, closePath: option.closePath });
})

update(defaultOption);
