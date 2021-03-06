const getPoints = n => {
  const theta = Math.PI * 2 / n;
  const offsetAngle = n % 2 === 0 ? theta / 2 : 0;

  return new Float32Array(
    Array
      .from({ length: n })
      .map((i, index) => {
        const alpha = offsetAngle + index * theta;
        return [Math.sin(alpha), Math.cos(alpha)]
      })
      .flat()
  );
};

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

// 顶点着色器
const vertex = `
  attribute vec2 position;
  varying vec3 color;

  void main() {
    gl_PointSize = 1.0;
    color = vec3(0.5 + position * 0.5, 0.0);
    gl_Position = vec4(position * 0.5, 1.0, 1.0);
  }
`;

// 图元着色器
const fragment = `
  precision mediump float;
  varying vec3 color;

  void main()
  {
    gl_FragColor = vec4(color, 1.0);
  }  
`;

// 创建 shader 对象
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertex);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragment);
gl.compileShader(fragmentShader);

// 创建 WebGLProgram 对象，并将这两个 shader 关联到这个 WebGL 程序上
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// 启用 WebGLProgram 对象
gl.useProgram(program);

const bufferId = gl.createBuffer(); // 创建一个缓存对象
gl.bindBuffer(gl.ARRAY_BUFFER, bufferId); //将它绑定为当前操作对象

const vPosition = gl.getAttribLocation(program, 'position'); // 获取顶点着色器中的position变量的地址
gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); //给变量设置长度和类型
gl.enableVertexAttribArray(vPosition); //激活这个变量

const draw = (gl => {
  return points => {
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
    gl.clear(gl.COLOR_BUFFER_BIT); //将当前画布的内容清除
    gl.drawArrays(gl.LINE_LOOP, 0, points.length / 2); // https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/drawArrays
  }
})(gl);

const $drawButton = document.querySelector('#draw');
const $countInput = document.querySelector('#count');
$drawButton.addEventListener('click', () => {
  const n = document.querySelector('#count').value;
  draw(getPoints(n));
})

$countInput.value = 5;
draw(getPoints(5));