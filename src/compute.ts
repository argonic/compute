export type TypedArray =
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Float32Array;

export type TypedArrayConstructor =
  | Int8ArrayConstructor
  | Int16ArrayConstructor
  | Int32ArrayConstructor
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | Float32ArrayConstructor;

type AccessType = "value" | "coords" | "index_access" | "coords_access" | "index_to_coords" | "coords_to_index";

export type Vector<C extends number> = C extends 1 ? { x: number }
  : C extends 2 ? { x: number, y: number }
  : C extends 3 ? { x: number, y: number, z: number }
  : C extends 4 ? { x: number, y: number, z: number, w: number }
  : C extends 5 ? { x: number, y: number, z: number, w: number, i: number }
  : C extends 6 ? { x: number, y: number, z: number, w: number, i: number, i1: number }
  : C extends 7 ? { x: number, y: number, z: number, w: number, i: number, i1: number, i2: number, i3: number }
  : { x: number, y: number, z: number, w: number, i: number, i1: number, i2: number, i3: number };

type IMethodName<T extends string, A extends AccessType> = A extends "value" ? `$${T}`
  : A extends "coords" ? `$${T}_coords`
  : A extends "index_access" ? `$$${T}_index`
  : A extends "coords_access" ? `$$${T}_access`
  : A extends "index_to_coords" ? `$$$${T}_coords`
  : A extends "coords_to_index" ? `$$$${T}_index`
  : never;

type IMethodValue<A extends AccessType, C extends number> = A extends "value" ? number
  : A extends "coords" ? Vector<C>
  : A extends "index_access" ? (index: number) => number
  : A extends "coords_access" ? (vector: Vector<C>) => number
  : A extends "index_to_coords" ? (vector: number) => Vector<C>
  : A extends "coords_to_index" ? (vector: Vector<C>) => number
  : never;

type IMethods<T extends string = string, C extends number = number> = {
  [P in AccessType as IMethodName<T, P>]: IMethodValue<P, C>;
};
type V = Vector<1> | Vector<2> | Vector<3> | Vector<4> | Vector<5> | Vector<6> | Vector<7> | Vector<number>;
// tslint:disable-next-line: ban-types
type Primitive = number | Function | V;
type FlattenPairs<T> = { [K in keyof T]: T[K] extends Primitive ? [K, T[K]]
  : FlattenPairs<T[K]> }[keyof T] & [PropertyKey, Primitive];
// @ts-ignore
type Flatten<T> = { [P in FlattenPairs<T> as P[0]]: P[1] };

type IMethodsMap<T extends { readonly [s: string]: number }> = Flatten<{
  // @ts-ignore
  [P in keyof T]: IMethods<P, T[P]>;
}>;
const littleEndian = (function machineIsLittleEndian() {
  const uint8Array = new Uint8Array([0xaa, 0xbb]);
  const uint16array = new Uint16Array(uint8Array.buffer);
  return uint16array[0] === 0xbbaa;
})();

function rightPad(a: string, size: number): string {
  if (size <= a.length) {
    return a;
  }
  return a + " ".repeat(size - a.length);
}
const lineNumberRegex = /ERROR: [0-9]+:([0-9]+):/g;
export function logShaderSourceAndInfoLog(
  shaderSource: string,
  shaderInfoLog: string,
) {
  const lineNumberRegexResult = lineNumberRegex.exec(shaderInfoLog);
  if (lineNumberRegexResult == null) {
    // tslint:disable-next-line: no-console
    console.log(`Couldn't parse line number in error: ${shaderInfoLog}`);
    // tslint:disable-next-line: no-console
    console.log(shaderSource);
    return;
  }

  const lineNumber = +lineNumberRegexResult[1];

  const shaderLines = shaderSource.split("\n");
  const pad = shaderLines.length.toString().length + 2;
  const linesWithLineNumbers = shaderLines.map(
    (line, LN) => rightPad((LN + 1).toString(), pad) + line,
  );
  let maxLineLength = 0;
  // tslint:disable-next-line
  for (let i = 0; i < linesWithLineNumbers.length; i++) {
    maxLineLength = Math.max(linesWithLineNumbers[i].length, maxLineLength);
  }

  const beforeErrorLines = linesWithLineNumbers.slice(0, lineNumber - 1);
  const errorLine = linesWithLineNumbers.slice(lineNumber - 1, lineNumber);
  const afterErrorLines = linesWithLineNumbers.slice(lineNumber);

  // tslint:disable-next-line: no-console
  console.log(beforeErrorLines.join("\n"));
  // tslint:disable-next-line: no-console
  console.log(shaderInfoLog.split("\n")[0]);
  // tslint:disable-next-line: no-console
  console.log(
    `%c ${rightPad(errorLine[0], maxLineLength)}`,
    "border:1px solid red; background-color:#e3d2d2; color:#a61717",
  );
  // tslint:disable-next-line: no-console
  console.log(afterErrorLines.join("\n"));
}

function createShader(
  gl: WebGLRenderingContext,
  type: "vertex" | "fragment",
  source: string,
) {
  const shader = gl.createShader(
    type === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER,
  );
  if (shader === null) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  // @ts-ignore
  logShaderSourceAndInfoLog(source, gl.getShaderInfoLog(shader) + "");
  gl.deleteShader(shader);
  return null;
}
function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) {
  const program = gl.createProgram();
  if (program === null) {
    return null;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  // tslint:disable-next-line: no-console
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
}
function initializeContext() {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl");
  return gl;
}
function bindProgram(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  output: TensorMetadata,
) {
  const width = (output.width * 4) / output.bytes;
  const height = (output.height * 4) / output.bytes;
  const positionBuffer = gl.createBuffer();
  gl.canvas.width = width;
  gl.canvas.height = height;
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution",
  );
  const littleEndianLocation = gl.getUniformLocation(program, "littleEndian");
  gl.viewport(0, 0, width, height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform1i(littleEndianLocation, littleEndian ? 1 : 0);
}
function readContext(gl: WebGLRenderingContext) {
  const canvas = gl.canvas;
  const pixels = new Uint8Array(canvas.width * canvas.height * 4);
  gl.readPixels(
    0,
    0,
    gl.drawingBufferWidth,
    gl.drawingBufferHeight,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixels,
  );
  return pixels;
}
function getCoord(i: number) {
  const coords = ["x", "y", "z", "w", "i"];
  if (i < coords.length) {
    return coords[i];
  }
  const last = coords.slice(-1)[0];
  return last + (coords.length - i + 1);
}
function generateStructs(count: number) {
  const structs: string[] = [];
  [...Array(count)].forEach((_, i) => {
    if (i >= 1 && i <= 3) {
      return;
    }
    structs.push(
      `struct ivec${i + 1} {${[...Array(i + 1)]
        .map((__, ii) => {
          return "int " + getCoord(ii);
        })
        .join("; ")};}`,
    );
  });
  return structs;
}
function convertPixels(pixels: Uint8Array, type: TensorMetadata) {
  if (type.constructor === Float32Array) {
    return new Float32Array(pixels.buffer);
  }
  if (type.constructor === Int8Array || type.constructor === Uint8Array) {
    // @ts-ignore
    return new type.constructor(type.length).map((value, i) => {
      return pixels[i * 4 + 3];
    });
  }
  if (type.constructor === Int16Array || type.constructor === Uint16Array) {
    // @ts-ignore
    return new type.constructor(type.length).map((value, i) => {
      const a = pixels[i * 4 + 3];
      const b = pixels[i * 4 + 2];
      // tslint:disable-next-line
      return a + (b << 8);
    });
  }
  if (type.constructor === Int32Array || type.constructor === Uint32Array) {
    // @ts-ignore
    return new type.constructor(type.length).map((value, i) => {
      const a = pixels[i * 4 + 3];
      const b = pixels[i * 4 + 2];
      const g = pixels[i * 4 + 1];
      const r = pixels[i * 4];
      // tslint:disable-next-line
      return a + (b << 8) + (g << 16) + (r << 16);
    });
  }
  return new type.constructor(pixels.buffer);
}
function initializeShape(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  name: string,
  output: TensorMetadata,
) {
  const widthLocation = gl.getUniformLocation(program, `u_${name}_width`);
  const heightLocation = gl.getUniformLocation(program, `u_${name}_height`);
  gl.uniform1i(widthLocation, output.width * output.bytes);
  gl.uniform1i(heightLocation, output.height * output.bytes);
  output.shape.forEach((v, i) => {
    const dimLocation = gl.getUniformLocation(
      program,
      `u_${name}_shape.${getCoord(i)}`,
    );
    const strideLocation = gl.getUniformLocation(
      program,
      `u_${name}_strides.${getCoord(i)}`,
    );
    gl.uniform1i(dimLocation, v);
    gl.uniform1i(strideLocation, output.strides[i]);
  });
}
function initializeTexture(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  name: string,
  output: TensorMetadata,
  index: number,
) {
  initializeShape(gl, program, name, output);
  const location = gl.getUniformLocation(program, `u_${name}`);
  gl.activeTexture(gl.TEXTURE0 + index);
  const texture = gl.createTexture();
  if (texture === null) {
    return null;
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    output.width,
    output.height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  );
  gl.uniform1i(location, index);
  return texture;
}
function uploadTexture(
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  data: TypedArray,
  output: TensorMetadata,
  index: number,
) {
  const length = output.width * output.height * 4;
  gl.activeTexture(gl.TEXTURE0 + index);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  let d =
    data instanceof Uint8Array ? data : new Uint8Array(data.buffer, 0, length);
  if (d.length < length) {
    d = new Uint8Array(length).map((_, i) => {
      if (i < d.length) {
        return d[i];
      }
      return 0;
    });
  }
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    output.width,
    output.height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    d,
  );
}
function textureShader(name: string, output: TensorMetadata) {
  const uniforms: string[] = [];
  const functions: string[] = [];
  uniforms.push(`uniform sampler2D u_${name}`);
  uniforms.push(`uniform int u_${name}_width`);
  uniforms.push(`uniform int u_${name}_height`);
  uniforms.push(`uniform ivec${output.shape.length} u_${name}_shape`);
  uniforms.push(`uniform ivec${output.shape.length} u_${name}_strides`);
  functions.push(`
    ${output.shader} ${name}SampleIndex(int index) {
      int d = ${output.bytes};
      float p = 4.0 / float(d);
      int i = int(float(index) / p);
      int z = index - int(float(i) * p);
      vec4 color = colorIndex(index, u_${name}, d, u_${name}_width, u_${name}_height);
      return ${output.shader === "float"
      ? `rgbaToFloat(color)`
      : output.precision === "high"
        ? "rgbaToHighInt(color)"
        : output.precision === "medium"
          ? "rgbaToMediumInt(color, z)"
          : `rgbaToLowInt(color, z)`
    };
    }`);
  functions.push(`
    ${output.shader} ${name}SampleCoords(ivec${output.shape.length} coords) {
      return ${name}SampleIndex(${name}CoordsToIndex(coords));
    }`);
  functions.push(`
    int ${name}CoordsToIndex(ivec${output.shape.length} coords) {
      return coordsToIndex(coords, u_${name}_strides);
    }`);
  functions.push(`
    ivec${output.shape.length} ${name}IndexToCoords(int index) {
      return indexToCoords(index, u_${name}_strides);
    }`);
  functions.push(`
    vec4 colorIndex(int index, sampler2D texture, int d, int width, int height) {
      float p = 4.0 / float(d);
      int i = int(float(index) / p);
      int z = index - int(float(i) * p);
      int w = width;
      int h = height;
      int y = i / w;
      int x = i - y * w;
      vec2 uv = vec2((float(x) + 0.5) / float(w), (float(y) + 0.5) / float(h));
      vec4 color = texture2D(texture, uv);
      return color;
    }`);
  functions.push(`
    vec4 colorCoords(ivec${output.shape.length} coords, ivec${output.shape.length} strides, sampler2D texture, int d, int width, int height) {
      int index = coordsToIndex(coords, strides);
      return colorIndex(index, texture, d, width, height);
    }`);
  functions.push(`
    int coordsToIndex(ivec${output.shape.length} coords, ivec${output.shape.length
    } strides) {
      if (${output.shape.length} == 1) {
        return coords.${getCoord(0)};
      }
      int index = 0;
      ${output.shape.map((_, i) => {
      return `index += coords.${getCoord(i)} * strides.${getCoord(i)};`;
    }).join(`
      `)}
      return index;
    }`);
  functions.push(`
    ivec${output.shape.length} indexToCoords(int index, ivec${output.shape.length
    } strides) {
      ${output.shape.length === 1
      ? `return ivec${output.shape.length}(index);`
      : `ivec${output.shape.length} coords = ivec${output.shape.length
      }(${output.shape.map(() => "0").join(", ")});
      int rest = index;
      int div = 0;
      ${output.shape.map((_: number, i: number) => {
        return `div = int(rest / strides.${getCoord(i)});
      rest -= div * strides.${getCoord(i)};
      coords.${getCoord(i)} = div;`;
      }).join(`
      `)}
      return coords;`
    }
    }`);
  return { uniforms, functions };
}

function getCoords(tensor: TensorMetadata, index: number) {
  // @ts-ignore
  const vector: Vector<number> = {};
  let rest = index;
  for (let i = 0; i < tensor.shape.length; i++) {
    const div = Math.floor(rest / tensor.strides[i]);
    rest -= div * tensor.strides[i];
    // @ts-ignore
    vector[getCoord(i)] = div;
  }
  return vector;
}
function getIndex(tensor: TensorMetadata, coords: Vector<number>): number {
  if (tensor.length === 1) {
    return coords.x;
  }

  let index = 0;
  for (let i = 0; i < tensor.length; i++) {
    // @ts-ignore
    const c = coords[getCoord(i)];
    index += c * tensor.strides[i];
  }
  return index;
}
function tensorMethods(name: string, value: TypedArray, tensor: TensorMetadata, thread: number) {
  // @ts-ignore
  const T: IMethods<typeof name, typeof tensor["rank"]> = {};
  // @ts-ignore
  T["$" + name] = value[thread];
  // @ts-ignore
  T["$" + name + "_coords"] = getCoords(tensor, thread);
  // @ts-ignore
  T["$$" + name + "_coords"] = (coords: Vector<number>) => value[getIndex(tensor, coords)];
  // @ts-ignore
  T["$$" + name + "_index"] = (index: number) => value[index];
  // @ts-ignore
  T["$$$" + name + "_coords"] = (index: number) => getCoords(tensor, index);
  // @ts-ignore
  T["$$$" + name + "_index"] = (coords: Vector<number>) => getIndex(tensor, coords);
  return T;
}

export default class Compute {
  public static tensor(
    type: TypedArray | TypedArrayConstructor,
    shape: number[],
  ) {
    let C = type.constructor as any;
    if (
      "name" in type &&
      // @ts-ignore
      typeof type.name === "string" &&
      // @ts-ignore
      type.name.endsWith("Array")
    ) {
      C = type as any;
    }
    const constructor = C as TypedArrayConstructor;

    const typed =
      constructor === Int8Array
        ? "int8"
        : constructor === Uint8Array
          ? "uint8"
          : constructor === Int16Array
            ? "int16"
            : constructor === Uint16Array
              ? "uint16"
              : constructor === Int32Array
                ? "int32"
                : constructor === Uint32Array
                  ? "uint32"
                  : ("float" as const);
    const native =
      constructor === Int8Array ||
        constructor === Int16Array ||
        constructor === Int32Array
        ? "int"
        : constructor === Uint8Array ||
          constructor === Uint16Array ||
          constructor === Uint32Array
          ? "uint"
          : ("float" as const);
    const precision =
      constructor === Int8Array || constructor === Uint8Array
        ? "low"
        : constructor === Int16Array || constructor === Uint16Array
          ? "medium"
          : ("high" as const);
    const bytes = precision === "low" ? 1 : precision === "medium" ? 2 : 4;
    const shader = native === "float" ? "float" : "int";
    const length = shape.reduce((p, c) => p * c, 1);
    const l = Math.ceil(length / (4 / bytes));
    const width = Math.floor(Math.sqrt(l));
    const height = Math.ceil(l / width);
    const strides: number[] = [];
    for (let i = shape.length - 1; i >= 0; i--) {
      let prev = strides[i + 1];
      const L = i === shape.length - 1 ? 1 : shape[i + 1];
      prev = prev === undefined ? 1 : prev;
      strides[i] = L * prev;
    }
    return {
      constructor,
      typed: typed as
        | "float"
        | "int8"
        | "uint8"
        | "int16"
        | "uint16"
        | "int32"
        | "uint31",
      // tslint:disable-next-line
      native: native as "int" | "uint" | "float",
      precision: precision as "low" | "medium" | "high",
      shader: shader as "float" | "int",
      rank: shape.length,
      bytes,
      shape,
      length,
      width,
      height,
      strides,
    };
  }
  public code = `return float(thread);`;
  private context: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private vertex: WebGLShader | null = null;
  private fragment: WebGLShader | null = null;
  private textures: Array<WebGLTexture | null> = [];
  private shapes: {
    [s: string]: TensorMetadata;
  } = {};
  private values: {
    [s: string]: TypedArray;
  } = {};
  private result: TensorMetadata = {
    constructor: Float32Array,
    precision: "high",
    // tslint:disable-next-line
    native: "float",
    typed: "float",
    shader: "float",
    bytes: 4,
    rank: 0,
    length: 0,
    width: 0,
    height: 0,
    strides: [],
    shape: [],
  };
  public output(type: TypedArray | TypedArrayConstructor, ...shape: number[]) {
    this.result = Compute.tensor(type, shape);
    return this;
  }
  public shape(
    name: string,
    type: TypedArray | TypedArrayConstructor,
    ...shape: number[]
  ) {
    this.shapes[name] = Compute.tensor(type, shape);
    return this;
  }
  public fallback<T extends { readonly [s: string]: number } = {}>(
    closure: (map: IMethodsMap<T> & { thread: number }) => number,
  ) {
    // @ts-ignore
    this.closure = closure;
    return this;
  }
  public compute(code: string) {
    this.code = this.parse(code);
    return this;
  }
  public inputs(inputs: { [s: string]: TypedArray }) {
    this.values = inputs;
    return this.compile();
  }
  public run({
    runtime = "fastest",
    threshold = 4096,
  }: {
    runtime?: "gpu" | "cpu" | "fallback" | "fastest";
    threshold?: number;
  } = {}) {
    if (runtime === "gpu") {
      return this.gpu();
    }
    if (runtime === "cpu") {
      return this.cpu();
    }
    if (runtime === "fallback") {
      try {
        return this.gpu();
      } catch (e) {
        return this.cpu();
      }
    }
    const T = threshold || 4096;
    let fastest: "cpu" | "gpu" = "cpu";
    Object.keys(this.shapes).forEach((name) => {
      const shape = this.shapes[name];
      if (shape.length * shape.bytes > T) {
        fastest = "gpu";
      }
    });
    if (this.result.length * this.result.bytes > T) {
      fastest = "gpu";
    }
    try {
      return this[fastest]();
    } catch (e) {
      return this[fastest === "gpu" ? "cpu" : "gpu"]();
    }
  }
  public gpu() {
    const context = this.context;
    const program = this.program;
    const vertex = this.vertex;
    const fragment = this.fragment;
    if (context && program && vertex && fragment) {
      Object.keys(this.shapes).forEach((name, i) => {
        if (!this.values.hasOwnProperty(name)) {
          return;
        }
        const texture = this.textures[i] as WebGLTexture;
        uploadTexture(
          // @ts-ignore
          this.context,
          texture,
          this.values[name],
          this.shapes[name],
          i,
        );
      });
      context.bufferData(
        context.ARRAY_BUFFER,
        new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
        context.STATIC_DRAW,
      );
      context.drawArrays(context.TRIANGLES, 0, 6);
      const pixels = readContext(context);
      const converted = convertPixels(pixels, this.result);
      return converted;
    }
    return new this.result.constructor(
      this.result.shape.reduce((p, c) => p * c, 1),
    );
  }
  public cpu() {
    const threads = this.result.length;
    const array = new this.result.constructor(threads);
    return array.map((_, i) => {
      let map: IMethodsMap<{ readonly [s: string]: number }> & { thread: number } = { thread: i };
      Object.keys(this.shapes).forEach((name) => {
        // @ts-ignore
        map = { ...map, ...tensorMethods(name, this.values[name], this.shapes[name], i) };
      });
      return this.closure(map);
    });
  }
  private compile() {
    const uniforms: string[] = [];
    const functions: string[] = [];
    const headers: string[] = [];
    const structs: string[] = generateStructs(6);
    Object.keys(this.values).forEach((name, i) => {
      const result = textureShader(name, this.shapes[name]);
      result.uniforms.forEach((u) => {
        const uu = u.trim();
        if (!uniforms.includes(uu)) {
          uniforms.push(uu);
        }
      });
      result.functions.forEach((f) => {
        const ff = f.trim();
        if (!functions.includes(ff)) {
          const first = ff.substring(0, ff.indexOf("\n"));
          const h = first.slice(0, -2);
          functions.push(ff);
          headers.push(h);
        }
      });
    });
    const vertexShaderCode = /* glsl */ `
      attribute vec2 a_position;
      void main() {
        vec2 zeroToTwo = a_position * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      }
    `;
    const type = this.result;
    const fragmentShaderCode = /* glsl */ `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform bool littleEndian;

    ${structs.join(`;
    `)};

    ${uniforms.join(`;
    `)};

    const vec2 halfV = vec2(0.5, 0.5);

    ${type.shader} userCode(int thread);
    vec4 getColor(int thread);
    ${headers.join(`;
    `)};
    vec4 lowIntToRgba(int result);
    vec4 mediumIntToRgba(int result);
    vec4 highIntToRgba(int result);
    int rgbaToHighInt(vec4 color);
    int rgbaToMediumInt(vec4 color, int z);
    int rgbaToLowInt(vec4 color, int z);
    float shiftRight(float v, float amt);
    float shiftLeft(float v, float amt);
    float maskLast(float v, float bits);
    float extractBits(float num, float from, float to);
    vec4 floatToRgba(float texelFloat);
    ivec4 floatsToBytes(vec4 inputFloats);
    void bytesToBits(const in ivec4 bytes, out bool bits[32]);
    float getExponent(bool bits[32]);
    float getMantissa(bool bits[32], bool subnormal);
    float bitsToFloat(bool bits[32]);
    float rgbaToFloat(vec4 texelRGBA);
    int imod(int x, int y);
    int idiv(int a, int b, float sign);

    void main() {
      vec2 resolution = u_resolution;
      float size = resolution.x * resolution.y;
      float width = resolution.x;
      vec2 uv = gl_FragCoord.xy - halfV;
      float x = uv.x;
      float y = uv.y;
      float thread = (x + y * width);
      float normalized_thread = thread / (255.0 * size);
      gl_FragColor = getColor(int(thread));
    }

    ${type.shader} userCode(int thread) {
      ${this.code}
    }
    vec4 getColor(int thread) {
      ${type.shader} result = userCode(thread);
      return ${type.shader === "float"
        ? `floatToRgba(result)`
        : type.precision === "low"
          ? `lowIntToRgba(result)`
          : type.precision === "medium"
            ? `mediumIntToRgba(result)`
            : `highIntToRgba(result)`
      };
    }
    ${functions.join(`
    `)}
    vec4 lowIntToRgba(int result) {
      return vec4(0.0, 0.0, 0.0, float(result)) / 255.0;
    }
    vec4 mediumIntToRgba(int result) {
      return vec4(
        0.0,
        0.0,
        extractBits(float(result), 8.0, 16.0),
        extractBits(float(result), 0.0, 8.0)
      ) / 255.0;
    }
    vec4 highIntToRgba(int result) {
      return vec4(
        extractBits(float(result), 24.0, 32.0),
        extractBits(float(result), 16.0, 24.0),
        extractBits(float(result), 8.0, 16.0),
        extractBits(float(result), 0.0, 8.0)
      ) / 255.0;
    }
    int rgbaToHighInt(vec4 color) {
      return int(color.a)
        + int(color.b * 255.0 * 255.0)
        + int(color.g * 255.0 * 255.0 * 255.0)
        + int(color.r * 255.0 * 255.0 * 255.0 * 255.0);
    }
    int rgbaToMediumInt(vec4 color, int z) {
      float a = z == 0 ? color.a : color.g;
      float b = z == 0 ? color.b : color.r;
      return int(a * 255.0)
        + int(b * 255.0 * 255.0);
    }
    int rgbaToLowInt(vec4 color, int z) {
      float a = z == 0 ? color.r : z == 1 ? color.g : z == 2 ? color.b : color.a;
      return int(a * 255.0);
    }
    float shiftRight(float v, float amt) {
      v = floor(v) + 0.5;
      return floor(v / exp2(amt));
    }
    float shiftLeft(float v, float amt) {
        return floor(v * exp2(amt) + 0.5);
    }
    float maskLast(float v, float bits) {
        return mod(v, shiftLeft(1.0, bits));
    }
    float extractBits(float num, float from, float to) {
        from = floor(from + 0.5); to = floor(to + 0.5);
        return maskLast(shiftRight(num, from), to - from);
    }
    vec4 floatToRgba(float texelFloat) {
        if (texelFloat == 0.0) return vec4(0, 0, 0, 0);
        float sign = texelFloat > 0.0 ? 0.0 : 1.0;
        texelFloat = abs(texelFloat);
        float exponent = floor(log2(texelFloat));
        float biased_exponent = exponent + 127.0;
        float fraction = ((texelFloat / exp2(exponent)) - 1.0) * 8388608.0;
        float t = biased_exponent / 2.0;
        float last_bit_of_biased_exponent = fract(t) * 2.0;
        float remaining_bits_of_biased_exponent = floor(t);
        float byte4 = extractBits(fraction, 0.0, 8.0) / 255.0;
        float byte3 = extractBits(fraction, 8.0, 16.0) / 255.0;
        float byte2 = (last_bit_of_biased_exponent * 128.0 + extractBits(fraction, 16.0, 23.0)) / 255.0;
        float byte1 = (sign * 128.0 + remaining_bits_of_biased_exponent) / 255.0;
        return (
          littleEndian
          ? vec4(byte4, byte3, byte2, byte1)
          : vec4(byte1, byte2, byte3, byte4)
        );
    }
    ivec4 floatsToBytes(vec4 inputFloats) {
      ivec4 bytes = ivec4(inputFloats * 255.0);
      return (
        littleEndian
        ? bytes.abgr
        : bytes
      );
    }
    void bytesToBits(const in ivec4 bytes, out bool bits[32]) {
      for (int channelIndex = 0; channelIndex < 4; ++channelIndex) {
        float acc = float(bytes[channelIndex]);
        for (int indexInByte = 7; indexInByte >= 0; --indexInByte) {
          float powerOfTwo = exp2(float(indexInByte));
          bool bit = acc >= powerOfTwo;
          bits[channelIndex * 8 + (7 - indexInByte)] = bit;
          acc = mod(acc, powerOfTwo);
        }
      }
    }
    float getExponent(bool bits[32]) {
      const int startIndex = 1;
      const int bitStringLength = 8;
      const int endBeforeIndex = startIndex + bitStringLength;
      float acc = 0.0;
      int pow2 = bitStringLength - 1;
      for (int bitIndex = startIndex; bitIndex < endBeforeIndex; ++bitIndex) {
        acc += float(bits[bitIndex]) * exp2(float(pow2--));
      }
      return acc;
    }
    float getMantissa(bool bits[32], bool subnormal) {
      const int startIndex = 9;
      const int bitStringLength = 23;
      const int endBeforeIndex = startIndex + bitStringLength;
      float acc = float(!subnormal) * exp2(float(bitStringLength));
      int pow2 = bitStringLength - 1;
      for (int bitIndex = startIndex; bitIndex < endBeforeIndex; ++bitIndex) {
        acc += float(bits[bitIndex]) * exp2(float(pow2--));
      }
      return acc;
    }
    float bitsToFloat(bool bits[32]) {
      float signBit = float(bits[0]) * -2.0 + 1.0;
      float exponent = getExponent(bits);
      bool subnormal = abs(exponent - 0.0) < 0.01;
      float mantissa = getMantissa(bits, subnormal);
      float exponentBias = 127.0;
      return signBit * mantissa * exp2(exponent - exponentBias - 23.0);
    }
    float rgbaToFloat(vec4 texelRGBA) {
      ivec4 rgbaBytes = floatsToBytes(texelRGBA);
      bool bits[32];
      bytesToBits(rgbaBytes, bits);
      return bitsToFloat(bits);
    }
    int imod(int x, int y) {
      return x - y * (x / y);
    }
    int idiv(int a, int b, float sign) {
      int res = a / b;
      int mod = imod(a, b);
      if (sign < 0. && mod != 0) {
        res -= 1;
      }
      return res;
    }
    `;
    this.context = initializeContext();
    if (this.context === null) {
      throw Error("WebGL context cannot be created");
    }
    this.vertex = createShader(this.context, "vertex", vertexShaderCode);
    this.fragment = createShader(this.context, "fragment", fragmentShaderCode);
    if (this.vertex === null) {
      throw Error("WebGL vertex shader cannot be created");
    }
    if (this.fragment === null) {
      throw Error("WebGL fragment shader cannot be created");
    }
    this.program = createProgram(this.context, this.vertex, this.fragment);
    if (this.program === null) {
      throw Error("WebGL program cannot be created");
    }
    bindProgram(this.context, this.program, this.result);
    Object.keys(this.shapes).forEach((name, i) => {
      this.textures[i] = initializeTexture(
        // @ts-ignore
        this.context,
        // @ts-ignore
        this.program,
        name,
        this.shapes[name],
        i,
      );
      if (this.textures[i] === null) {
        throw Error(`WebGL texture #${i} cannot be created`);
      }
    });
    return this;
  }
  private closure: <T extends { readonly [s: string]: number } = {}>(
    map: IMethodsMap<T> & { thread: number },
    // tslint:disable-next-line
  ) => number = () => 0;
  private parse(shader: string) {
    let syntax = shader;
    Object.keys(this.shapes).forEach((key) => {
      const valueRegex = new RegExp("(\\$" + key + ")", "g");
      const coordsRegex = new RegExp("(\\$" + key + "_coords)", "g");
      const indexAccessRegex = new RegExp("(\\$\\$" + key + "_index)", "g");
      const coordsAccessRegex = new RegExp("(\\$\\$" + key + "_coords)", "g");
      const indexCoordsRegex = new RegExp("(\\$\\$\\$" + key + "_coords)", "g");
      const coordsIndexRegex = new RegExp("(\\$\\$\\$" + key + "_index)", "g");

      syntax = syntax.replace(indexCoordsRegex, `${key}IndexToCoords`);
      syntax = syntax.replace(coordsIndexRegex, `${key}CoordsToIndex`);
      syntax = syntax.replace(coordsAccessRegex, `${key}SampleCoords`);
      syntax = syntax.replace(indexAccessRegex, `${key}SampleIndex`);
      syntax = syntax.replace(coordsRegex, `${key}IndexCoords(thread)`);
      syntax = syntax.replace(valueRegex, `${key}SampleIndex(thread)`);
    });
    return syntax;
  }
}

export type TensorMetadata = ReturnType<typeof Compute["tensor"]>;
