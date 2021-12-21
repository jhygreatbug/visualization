import { initShaderProgram } from '../../lib/webgl.js';

const PI = Math.PI;
const COUNT_PER_SECOND = 30;
const START_RADIUS = 10

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

const vi = {
  x: 1 / canvas.width,
  y: 1 / canvas.height,
};
const config = {
  scaleSpeed: [0.5, 1.5],
  rotationSpeed: [PI / 4, PI],
  startOpacity: [0.6, 1],
  opacitySpeed: [-0.2, -0.1],
  speed: [100 * vi.x, 200 * vi.x],
};
// 此处取值可优化
const duration = Math.hypot(1, 1) / config.speed[0] * 1000;

const getPoint = (radius, dir) => [
  radius * Math.cos(dir) * vi.x,
  radius * Math.sin(dir) * vi.y,
];

const centerTriangle = [
  ...getPoint(START_RADIUS, 0),
  ...getPoint(START_RADIUS, 2 / 3 * PI),
  ...getPoint(START_RADIUS, 4 / 3 * PI),
];

const getRandomInRange = ([start, end]) => Math.random() * (end - start) + start;

const generateTriangleParams = (config => {
  return () => {
    const dir = getRandomInRange([0, PI * 2]);
    const dirVector = [Math.cos(dir), Math.sin(dir)];
    return {
      scaleSpeed: getRandomInRange(config.scaleSpeed),
      rotationSpeed: getRandomInRange(config.rotationSpeed),
      rotationStart: getRandomInRange([0, PI * 2]),
      dir: dirVector,
      color: [Math.random(), Math.random(), Math.random(), getRandomInRange(config.startOpacity)],
      opacitySpeed: getRandomInRange(config.opacitySpeed),
      speed: getRandomInRange(config.speed),
      startTime: performance.now(),
    }
  };
})(config);

const vertex = `
  attribute vec2 position;

  uniform float u_time;
  uniform vec2 u_dir;
  uniform float u_speed;
  uniform float u_scale_speed;
  uniform float u_rotation_start;
  uniform float u_rotation_speed;
  uniform float u_opacity_speed;

  varying float vOpacityOffset;

  void main() {
    float scale = 1.0 + u_scale_speed * u_time;
    mat3 scaleMatrix = mat3(
      scale, 0.0, 0.0,
      0.0, scale, 0.0,
      0.0, 0.0, 1.0
    );

    float rad = u_rotation_start + u_rotation_speed * u_time;
    mat3 rotateMatrix = mat3(
      cos(rad), sin(rad), 0.0,
      -sin(rad), cos(rad), 0.0,
      0.0, 0.0, 1.0
    );

    vec2 move = u_dir * u_speed * u_time;
    mat3 moveMatrix = mat3(
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      move.x, move.y, 1.0
    );

    gl_PointSize = 1.0;
    vec3 pos = moveMatrix * rotateMatrix * scaleMatrix * vec3(position, 1.0);
    gl_Position = vec4(pos, 1.0);

    vOpacityOffset = u_opacity_speed * u_time;
  }
`;

const fragment = `
  precision mediump float;

  uniform vec4 u_color;

  varying float vOpacityOffset;

  void main()
  {
    vec4 color = u_color;
    color.a = max(0.0, u_color.a + vOpacityOffset);
    gl_FragColor = color;
  }
`;

const program = initShaderProgram(gl, vertex, fragment);
gl.useProgram(program);

const originalTriangleBuffer = gl.createBuffer(); // 创建一个缓存对象
gl.bindBuffer(gl.ARRAY_BUFFER, originalTriangleBuffer); //将它绑定为当前操作对象
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(centerTriangle), gl.STATIC_DRAW);

const vPosition = gl.getAttribLocation(program, 'position'); // 获取顶点着色器中的position变量的地址
gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); //给变量设置长度和类型
gl.enableVertexAttribArray(vPosition); //激活这个变量

function setUniform(gl, program, type, name, value) {
  const vPosition = gl.getUniformLocation(program, name); // 获取顶点着色器中的position变量的地址
  gl['uniform' + type](vPosition, value); //给变量设置长度和类型
}

function setUniforms(gl, program, params) {
  setUniform(gl, program, '4fv', 'u_color', params.color);
  setUniform(gl, program, '1f', 'u_time', params.time);
  setUniform(gl, program, '2fv', 'u_dir', params.dir);
  setUniform(gl, program, '1f', 'u_speed', params.speed);
  setUniform(gl, program, '1f', 'u_scale_speed', params.scaleSpeed);
  setUniform(gl, program, '1f', 'u_rotation_start', params.rotationStart);
  setUniform(gl, program, '1f', 'u_rotation_speed', params.rotationSpeed);
  setUniform(gl, program, '1f', 'u_opacity_speed', params.opacitySpeed);
}

let triangles = [];
const draw = lastTime => {
  window.requestAnimationFrame(() => {
    const currentTime = performance.now();
    const passTime = (currentTime - lastTime) / 1000;
    triangles = triangles.filter(v => currentTime - v.startTime <= duration);

    const triangleCount = COUNT_PER_SECOND * passTime;
    for (let i = 0; i < triangleCount; i++) {
      triangles.push({
        ...generateTriangleParams(),
        startTime: currentTime,
      });
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    triangles.forEach(v => {
      setUniforms(gl, program, {
        ...v,
        time: (currentTime - v.startTime) / 1000,
      })
      gl.drawArrays(gl.TRIANGLES, 0, centerTriangle.length)
    });

    draw(currentTime);
  })
};

draw(performance.now());
