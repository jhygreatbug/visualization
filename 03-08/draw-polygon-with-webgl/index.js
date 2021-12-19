import { initShaderProgram } from '../../lib/webgl.js';
import { isPointInPath } from '../../lib/helper.js';
import Vector2D from '../../lib/vector2d.js';

const vertices = [
  [-0.7, 0.5],
  [-0.4, 0.3],
  [-0.25, 0.71],
  [-0.1, 0.56],
  [-0.1, 0.13],
  [0.4, 0.21],
  [0, -0.6],
  [-0.3, -0.3],
  [-0.6, -0.3],
  [-0.45, 0.0],
];
const verticesData = new Float32Array(vertices.flat());

const triangulations = earcut(vertices.flat())
const triangulationsData = new Uint16Array(triangulations);

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

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
gl.bufferData(gl.ARRAY_BUFFER, verticesData, gl.STATIC_DRAW)

const vPosition = gl.getAttribLocation(program, 'position'); // 获取顶点着色器中的position变量的地址
gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); //给变量设置长度和类型
gl.enableVertexAttribArray(vPosition); //激活这个变量

const triangulationsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangulationsBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangulationsData, gl.STATIC_DRAW);

const drawGl = (gl, mode, triangulations) => {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawElements(mode, triangulations.length, gl.UNSIGNED_SHORT, 0);
}

drawGl(gl, gl.LINE_STRIP, triangulations);

const canvasW = canvas.width;
const canvasH = canvas.height;
canvas.addEventListener('mousemove', function (e) {
  const { offsetX, offsetY } = e;
  const x = (offsetX * 2 - canvasW) / canvasW;
  const y = (canvasH - offsetY * 2) / canvasH;
  const inPath = isPointInPath(vertices, triangulations, new Vector2D(x, y));
  const mode = inPath ? gl.TRIANGLES : gl.LINE_STRIP;
  drawGl(gl, mode, triangulations);
})
