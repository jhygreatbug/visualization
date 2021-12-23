import { initShaderProgram } from '../lib/webgl.js';
import { parametric2D } from '../lib/parametic2D.js';

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');
const canvasW = canvas.width;

const getCircle = parametric2D(
  (t, x0, y0, r) => x0 + r * Math.cos(t),
  (t, x0, y0, r) => y0 + r * Math.sin(t),
);

const padding = 20 * 2 / canvasW;
const circleRadius = (1 - padding) / 2;
const circleCenter = circleRadius + padding;

let circleSPoints = getCircle(0, Math.PI * 2, 100, -circleCenter, 0, circleRadius);
let circleVPoints = getCircle(0, Math.PI * 2, 100, circleCenter, 0, circleRadius);

const circleSElements = circleSPoints.map((v, i, l) => [i, i + 1, l.length]).flat();
const circleVElements = circleVPoints.map((v, i, l) => [i, i + 1, l.length]).flat();

circleSPoints.push([-circleCenter, 0]);
circleVPoints.push([circleCenter, 0]);
circleSPoints = circleSPoints.flat();
circleVPoints = circleVPoints.flat();

const vertex = `
  attribute vec2 position;

  uniform float u_center_x;
  uniform float u_radius;

  varying vec3 color;

  vec3 hsv2rgb(vec3 c){
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0), 6.0)-3.0)-1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
  }

  void main() {
    gl_PointSize = 1.0;

    vec2 v = position - vec2(u_center_x, 0.0);
    float rad = atan(v.x / v.y);
    if (v.y < 0.0) {
      rad += 3.14159;
    }
    float hue = rad / 3.14159 / 2.0;
    float k = sqrt(v.x * v.x + v.y * v.y) / u_radius;
    if (u_center_x > 0.0) {
      color = hsv2rgb(vec3(hue, k, 1.0));
    } else {
      color = hsv2rgb(vec3(hue, 1.0, k));
    }

    gl_Position = vec4(position, 1.0, 1.0);
  }
`;

const fragment = `
  precision mediump float;

  varying vec3 color;

  void main()
  {
    gl_FragColor = vec4(color, 1.0);
  }  
`;

const program = initShaderProgram(gl, vertex, fragment);
gl.useProgram(program);

const draw = (gl, program, points, elements, radius, centerX) => {
  let loc = gl.createBuffer(); // 创建一个缓存对象
  gl.bindBuffer(gl.ARRAY_BUFFER, loc); //将它绑定为当前操作对象
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

  loc = gl.getAttribLocation(program, 'position'); // 获取顶点着色器中的position变量的地址
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0); //给变量设置长度和类型
  gl.enableVertexAttribArray(loc); //激活这个变量

  loc = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, loc);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(elements), gl.STATIC_DRAW);

  loc = gl.getUniformLocation(program, 'u_center_x'); // 获取顶点着色器中的position变量的地址
  gl.uniform1f(loc, centerX);

  loc = gl.getUniformLocation(program, 'u_radius'); // 获取顶点着色器中的position变量的地址
  gl.uniform1f(loc, radius);

  gl.drawElements(gl.TRIANGLES, elements.length, gl.UNSIGNED_SHORT, 0);
}

draw(gl, program, circleSPoints, circleSElements, circleRadius, -circleCenter);
draw(gl, program, circleVPoints, circleVElements, circleRadius, circleCenter);
