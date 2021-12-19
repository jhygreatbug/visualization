import { initShaderProgram } from '../../lib/webgl.js';
import { parametric2D } from '../../lib/parametic2D.js';

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');
const canvasW = canvas.width;
const canvasH = canvas.height;

const convert = points => points.map(([x, y]) => [
  x * 2 / canvasW,
  y * 2 / canvasH
]);

// 椭圆
const ellipse = convert(parametric2D(
  (t, x0, y0, a, b) => x0 + a * Math.cos(t),
  (t, x0, y0, a, b) => y0 + b * Math.sin(t),
)(0, 6.284, 100, 0, 0, 125, 75));

// 四角星
const starA = 150;
const starB = 50;
const star = convert([
  [0, starA],
  [starB, starB],
  [starA, 0],
  [starB, -starB],
  [0, -starA],
  [-starB, -starB],
  [-starA, 0],
  [-starB, starB],
]);

const contours = [ellipse.flat(), star.flat()];
const res = Tess2.tesselate({
  contours,
  windingRule: Tess2.WINDING_ODD,
  elementType: Tess2.POLYGONS,
  polySize: 3, // 这个参数什么意思？
  vertexSize: 2,
});
const verticesData = new Float32Array(res.vertices);
const triangulations = res.elements;
const triangulationsData = new Uint16Array(triangulations);

const vertex = `
  attribute vec2 position;

  void main() {
    gl_PointSize = 1.0;
    gl_Position = vec4(position, 1.0, 1.0);
  }
`;

const fragment = `
  precision mediump float;

  void main()
  {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }  
`;

const program = initShaderProgram(gl, vertex, fragment);
gl.useProgram(program);

const verticesBuffer = gl.createBuffer(); // 创建一个缓存对象
gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer); //将它绑定为当前操作对象
gl.bufferData(gl.ARRAY_BUFFER, verticesData, gl.STATIC_DRAW);

const vPosition = gl.getAttribLocation(program, 'position'); // 获取顶点着色器中的position变量的地址
gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); //给变量设置长度和类型
gl.enableVertexAttribArray(vPosition); //激活这个变量

const triangulationsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangulationsBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangulationsData, gl.STATIC_DRAW);

const drawGl = (gl, mode, triangulationsLen) => {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawElements(mode, triangulationsLen, gl.UNSIGNED_SHORT, 0);
}

drawGl(gl, gl.TRIANGLES, triangulations.length);

