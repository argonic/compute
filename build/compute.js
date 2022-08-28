"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logShaderSourceAndInfoLog = void 0;
var littleEndian = (function machineIsLittleEndian() {
    var uint8Array = new Uint8Array([0xaa, 0xbb]);
    var uint16array = new Uint16Array(uint8Array.buffer);
    return uint16array[0] === 0xbbaa;
})();
function rightPad(a, size) {
    if (size <= a.length) {
        return a;
    }
    return a + " ".repeat(size - a.length);
}
var lineNumberRegex = /ERROR: [0-9]+:([0-9]+):/g;
function logShaderSourceAndInfoLog(shaderSource, shaderInfoLog) {
    var lineNumberRegexResult = lineNumberRegex.exec(shaderInfoLog);
    if (lineNumberRegexResult == null) {
        console.log("Couldn't parse line number in error: " + shaderInfoLog);
        console.log(shaderSource);
        return;
    }
    var lineNumber = +lineNumberRegexResult[1];
    var shaderLines = shaderSource.split("\n");
    var pad = shaderLines.length.toString().length + 2;
    var linesWithLineNumbers = shaderLines.map(function (line, LN) { return rightPad((LN + 1).toString(), pad) + line; });
    var maxLineLength = 0;
    for (var i = 0; i < linesWithLineNumbers.length; i++) {
        maxLineLength = Math.max(linesWithLineNumbers[i].length, maxLineLength);
    }
    var beforeErrorLines = linesWithLineNumbers.slice(0, lineNumber - 1);
    var errorLine = linesWithLineNumbers.slice(lineNumber - 1, lineNumber);
    var afterErrorLines = linesWithLineNumbers.slice(lineNumber);
    console.log(beforeErrorLines.join("\n"));
    console.log(shaderInfoLog.split("\n")[0]);
    console.log("%c " + rightPad(errorLine[0], maxLineLength), "border:1px solid red; background-color:#e3d2d2; color:#a61717");
    console.log(afterErrorLines.join("\n"));
}
exports.logShaderSourceAndInfoLog = logShaderSourceAndInfoLog;
function createShader(gl, type, source) {
    var shader = gl.createShader(type === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
    if (shader === null) {
        return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    logShaderSourceAndInfoLog(source, gl.getShaderInfoLog(shader) + "");
    gl.deleteShader(shader);
    return null;
}
function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    if (program === null) {
        return null;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
}
function initializeContext() {
    var canvas = document.createElement("canvas");
    var gl = canvas.getContext("webgl");
    return gl;
}
function bindProgram(gl, program, output) {
    var width = (output.width * 4) / output.bytes;
    var height = (output.height * 4) / output.bytes;
    var positionBuffer = gl.createBuffer();
    gl.canvas.width = width;
    gl.canvas.height = height;
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    var littleEndianLocation = gl.getUniformLocation(program, "littleEndian");
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
function readContext(gl) {
    var canvas = gl.canvas;
    var pixels = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return pixels;
}
function getCoord(i) {
    var coords = ["x", "y", "z", "w", "i"];
    if (i < coords.length) {
        return coords[i];
    }
    var last = coords.slice(-1)[0];
    return last + (coords.length - i + 1);
}
function generateStructs(count) {
    var structs = [];
    __spreadArray([], Array(count), true).forEach(function (_, i) {
        if (i >= 1 && i <= 3) {
            return;
        }
        structs.push("struct ivec" + (i + 1) + " {" + __spreadArray([], Array(i + 1), true).map(function (__, ii) {
            return "int " + getCoord(ii);
        })
            .join("; ") + ";}");
    });
    return structs;
}
function convertPixels(pixels, type) {
    if (type.constructor === Float32Array) {
        return new Float32Array(pixels.buffer);
    }
    if (type.constructor === Int8Array || type.constructor === Uint8Array) {
        return new type.constructor(type.length).map(function (value, i) {
            return pixels[i * 4 + 3];
        });
    }
    if (type.constructor === Int16Array || type.constructor === Uint16Array) {
        return new type.constructor(type.length).map(function (value, i) {
            var a = pixels[i * 4 + 3];
            var b = pixels[i * 4 + 2];
            return a + (b << 8);
        });
    }
    if (type.constructor === Int32Array || type.constructor === Uint32Array) {
        return new type.constructor(type.length).map(function (value, i) {
            var a = pixels[i * 4 + 3];
            var b = pixels[i * 4 + 2];
            var g = pixels[i * 4 + 1];
            var r = pixels[i * 4];
            return a + (b << 8) + (g << 16) + (r << 16);
        });
    }
    return new type.constructor(pixels.buffer);
}
function initializeShape(gl, program, name, output) {
    var widthLocation = gl.getUniformLocation(program, "u_" + name + "_width");
    var heightLocation = gl.getUniformLocation(program, "u_" + name + "_height");
    gl.uniform1i(widthLocation, output.width * output.bytes);
    gl.uniform1i(heightLocation, output.height * output.bytes);
    output.shape.forEach(function (v, i) {
        var dimLocation = gl.getUniformLocation(program, "u_" + name + "_shape." + getCoord(i));
        var strideLocation = gl.getUniformLocation(program, "u_" + name + "_strides." + getCoord(i));
        gl.uniform1i(dimLocation, v);
        gl.uniform1i(strideLocation, output.strides[i]);
    });
}
function initializeTexture(gl, program, name, output, index) {
    initializeShape(gl, program, name, output);
    var location = gl.getUniformLocation(program, "u_" + name);
    gl.activeTexture(gl.TEXTURE0 + index);
    var texture = gl.createTexture();
    if (texture === null) {
        return null;
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, output.width, output.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.uniform1i(location, index);
    return texture;
}
function uploadTexture(gl, texture, data, output, index) {
    var length = output.width * output.height * 4;
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    var d = data instanceof Uint8Array ? data : new Uint8Array(data.buffer, 0, length);
    if (d.length < length) {
        d = new Uint8Array(length).map(function (_, i) {
            if (i < d.length) {
                return d[i];
            }
            return 0;
        });
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, output.width, output.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, d);
}
function textureShader(name, output) {
    var uniforms = [];
    var functions = [];
    uniforms.push("uniform sampler2D u_" + name);
    uniforms.push("uniform int u_" + name + "_width");
    uniforms.push("uniform int u_" + name + "_height");
    uniforms.push("uniform ivec" + output.shape.length + " u_" + name + "_shape");
    uniforms.push("uniform ivec" + output.shape.length + " u_" + name + "_strides");
    functions.push("\n    " + output.shader + " " + name + "SampleIndex(int index) {\n      int d = " + output.bytes + ";\n      float p = 4.0 / float(d);\n      int i = int(float(index) / p);\n      int z = index - int(float(i) * p);\n      vec4 color = colorIndex(index, u_" + name + ", d, u_" + name + "_width, u_" + name + "_height);\n      return " + (output.shader === "float"
        ? "rgbaToFloat(color)"
        : output.precision === "high"
            ? "rgbaToHighInt(color)"
            : output.precision === "medium"
                ? "rgbaToMediumInt(color, z)"
                : "rgbaToLowInt(color, z)") + ";\n    }");
    functions.push("\n    " + output.shader + " " + name + "SampleCoords(ivec" + output.shape.length + " coords) {\n      return " + name + "SampleIndex(" + name + "CoordsToIndex(coords));\n    }");
    functions.push("\n    int " + name + "CoordsToIndex(ivec" + output.shape.length + " coords) {\n      return coordsToIndex(coords, u_" + name + "_strides);\n    }");
    functions.push("\n    ivec" + output.shape.length + " " + name + "IndexToCoords(int index) {\n      return indexToCoords(index, u_" + name + "_strides);\n    }");
    functions.push("\n    vec4 colorIndex(int index, sampler2D texture, int d, int width, int height) {\n      float p = 4.0 / float(d);\n      int i = int(float(index) / p);\n      int z = index - int(float(i) * p);\n      int w = width;\n      int h = height;\n      int y = i / w;\n      int x = i - y * w;\n      vec2 uv = vec2((float(x) + 0.5) / float(w), (float(y) + 0.5) / float(h));\n      vec4 color = texture2D(texture, uv);\n      return color;\n    }");
    functions.push("\n    vec4 colorCoords(ivec" + output.shape.length + " coords, ivec" + output.shape.length + " strides, sampler2D texture, int d, int width, int height) {\n      int index = coordsToIndex(coords, strides);\n      return colorIndex(index, texture, d, width, height);\n    }");
    functions.push("\n    int coordsToIndex(ivec" + output.shape.length + " coords, ivec" + output.shape.length + " strides) {\n      if (" + output.shape.length + " == 1) {\n        return coords." + getCoord(0) + ";\n      }\n      int index = 0;\n      " + output.shape.map(function (_, i) {
        return "index += coords." + getCoord(i) + " * strides." + getCoord(i) + ";";
    }).join("\n      ") + "\n      return index;\n    }");
    functions.push("\n    ivec" + output.shape.length + " indexToCoords(int index, ivec" + output.shape.length + " strides) {\n      " + (output.shape.length === 1
        ? "return ivec" + output.shape.length + "(index);"
        : "ivec" + output.shape.length + " coords = ivec" + output.shape.length + "(" + output.shape.map(function () { return "0"; }).join(", ") + ");\n      int rest = index;\n      int div = 0;\n      " + output.shape.map(function (_, i) {
            return "div = int(rest / strides." + getCoord(i) + ");\n      rest -= div * strides." + getCoord(i) + ";\n      coords." + getCoord(i) + " = div;";
        }).join("\n      ") + "\n      return coords;") + "\n    }");
    return { uniforms: uniforms, functions: functions };
}
function getCoords(tensor, index) {
    var vector = {};
    var rest = index;
    for (var i = 0; i < tensor.shape.length; i++) {
        var div = Math.floor(rest / tensor.strides[i]);
        rest -= div * tensor.strides[i];
        vector[getCoord(i)] = div;
    }
    return vector;
}
function getIndex(tensor, coords) {
    if (tensor.length === 1) {
        return coords.x;
    }
    var index = 0;
    for (var i = 0; i < tensor.length; i++) {
        var c = coords[getCoord(i)];
        index += c * tensor.strides[i];
    }
    return index;
}
function tensorMethods(name, value, tensor, thread) {
    var T = {};
    T["$" + name] = value[thread];
    T["$" + name + "_coords"] = getCoords(tensor, thread);
    T["$$" + name + "_coords"] = function (coords) { return value[getIndex(tensor, coords)]; };
    T["$$" + name + "_index"] = function (index) { return value[index]; };
    T["$$$" + name + "_coords"] = function (index) { return getCoords(tensor, index); };
    T["$$$" + name + "_index"] = function (coords) { return getIndex(tensor, coords); };
    return T;
}
var Compute = (function () {
    function Compute() {
        this.code = "return float(thread);";
        this.context = null;
        this.program = null;
        this.vertex = null;
        this.fragment = null;
        this.textures = [];
        this.shapes = {};
        this.values = {};
        this.result = {
            constructor: Float32Array,
            precision: "high",
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
        this.closure = function () { return 0; };
    }
    Compute.tensor = function (type, shape) {
        var C = type.constructor;
        if ("name" in type &&
            typeof type.name === "string" &&
            type.name.endsWith("Array")) {
            C = type;
        }
        var constructor = C;
        var typed = constructor === Int8Array
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
                                : "float";
        var native = constructor === Int8Array ||
            constructor === Int16Array ||
            constructor === Int32Array
            ? "int"
            : constructor === Uint8Array ||
                constructor === Uint16Array ||
                constructor === Uint32Array
                ? "uint"
                : "float";
        var precision = constructor === Int8Array || constructor === Uint8Array
            ? "low"
            : constructor === Int16Array || constructor === Uint16Array
                ? "medium"
                : "high";
        var bytes = precision === "low" ? 1 : precision === "medium" ? 2 : 4;
        var shader = native === "float" ? "float" : "int";
        var length = shape.reduce(function (p, c) { return p * c; }, 1);
        var l = Math.ceil(length / (4 / bytes));
        var width = Math.floor(Math.sqrt(l));
        var height = Math.ceil(l / width);
        var strides = [];
        for (var i = shape.length - 1; i >= 0; i--) {
            var prev = strides[i + 1];
            var L = i === shape.length - 1 ? 1 : shape[i + 1];
            prev = prev === undefined ? 1 : prev;
            strides[i] = L * prev;
        }
        return {
            constructor: constructor,
            typed: typed,
            native: native,
            precision: precision,
            shader: shader,
            rank: shape.length,
            bytes: bytes,
            shape: shape,
            length: length,
            width: width,
            height: height,
            strides: strides,
        };
    };
    Compute.prototype.output = function (type) {
        var shape = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            shape[_i - 1] = arguments[_i];
        }
        this.result = Compute.tensor(type, shape);
        return this;
    };
    Compute.prototype.shape = function (name, type) {
        var shape = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            shape[_i - 2] = arguments[_i];
        }
        this.shapes[name] = Compute.tensor(type, shape);
        return this;
    };
    Compute.prototype.fallback = function (closure) {
        this.closure = closure;
        return this;
    };
    Compute.prototype.compute = function (code) {
        this.code = this.parse(code);
        return this;
    };
    Compute.prototype.inputs = function (inputs) {
        this.values = inputs;
        return this.compile();
    };
    Compute.prototype.run = function (_a) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, _c = _b.runtime, runtime = _c === void 0 ? "fastest" : _c, _d = _b.threshold, threshold = _d === void 0 ? 4096 : _d;
        if (runtime === "gpu") {
            return this.gpu();
        }
        if (runtime === "cpu") {
            return this.cpu();
        }
        if (runtime === "fallback") {
            try {
                return this.gpu();
            }
            catch (e) {
                return this.cpu();
            }
        }
        var T = threshold || 4096;
        var fastest = "cpu";
        Object.keys(this.shapes).forEach(function (name) {
            var shape = _this.shapes[name];
            if (shape.length * shape.bytes > T) {
                fastest = "gpu";
            }
        });
        if (this.result.length * this.result.bytes > T) {
            fastest = "gpu";
        }
        try {
            return this[fastest]();
        }
        catch (e) {
            return this[fastest === "gpu" ? "cpu" : "gpu"]();
        }
    };
    Compute.prototype.gpu = function () {
        var _this = this;
        var context = this.context;
        var program = this.program;
        var vertex = this.vertex;
        var fragment = this.fragment;
        if (context && program && vertex && fragment) {
            Object.keys(this.shapes).forEach(function (name, i) {
                if (!_this.values.hasOwnProperty(name)) {
                    return;
                }
                var texture = _this.textures[i];
                uploadTexture(_this.context, texture, _this.values[name], _this.shapes[name], i);
            });
            context.bufferData(context.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), context.STATIC_DRAW);
            context.drawArrays(context.TRIANGLES, 0, 6);
            var pixels = readContext(context);
            var converted = convertPixels(pixels, this.result);
            return converted;
        }
        return new this.result.constructor(this.result.shape.reduce(function (p, c) { return p * c; }, 1));
    };
    Compute.prototype.cpu = function () {
        var _this = this;
        var threads = this.result.length;
        var array = new this.result.constructor(threads);
        return array.map(function (_, i) {
            var map = { thread: i };
            Object.keys(_this.shapes).forEach(function (name) {
                map = __assign(__assign({}, map), tensorMethods(name, _this.values[name], _this.shapes[name], i));
            });
            return _this.closure(map);
        });
    };
    Compute.prototype.compile = function () {
        var _this = this;
        var uniforms = [];
        var functions = [];
        var headers = [];
        var structs = generateStructs(6);
        Object.keys(this.values).forEach(function (name, i) {
            var result = textureShader(name, _this.shapes[name]);
            result.uniforms.forEach(function (u) {
                var uu = u.trim();
                if (!uniforms.includes(uu)) {
                    uniforms.push(uu);
                }
            });
            result.functions.forEach(function (f) {
                var ff = f.trim();
                if (!functions.includes(ff)) {
                    var first = ff.substring(0, ff.indexOf("\n"));
                    var h = first.slice(0, -2);
                    functions.push(ff);
                    headers.push(h);
                }
            });
        });
        var vertexShaderCode = "\n      attribute vec2 a_position;\n      void main() {\n        vec2 zeroToTwo = a_position * 2.0;\n        vec2 clipSpace = zeroToTwo - 1.0;\n\n        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);\n      }\n    ";
        var type = this.result;
        var fragmentShaderCode = "\n    precision mediump float;\n    uniform vec2 u_resolution;\n    uniform bool littleEndian;\n\n    " + structs.join(";\n    ") + ";\n\n    " + uniforms.join(";\n    ") + ";\n\n    const vec2 halfV = vec2(0.5, 0.5);\n\n    " + type.shader + " userCode(int thread);\n    vec4 getColor(int thread);\n    " + headers.join(";\n    ") + ";\n    vec4 lowIntToRgba(int result);\n    vec4 mediumIntToRgba(int result);\n    vec4 highIntToRgba(int result);\n    int rgbaToHighInt(vec4 color);\n    int rgbaToMediumInt(vec4 color, int z);\n    int rgbaToLowInt(vec4 color, int z);\n    float shiftRight(float v, float amt);\n    float shiftLeft(float v, float amt);\n    float maskLast(float v, float bits);\n    float extractBits(float num, float from, float to);\n    vec4 floatToRgba(float texelFloat);\n    ivec4 floatsToBytes(vec4 inputFloats);\n    void bytesToBits(const in ivec4 bytes, out bool bits[32]);\n    float getExponent(bool bits[32]);\n    float getMantissa(bool bits[32], bool subnormal);\n    float bitsToFloat(bool bits[32]);\n    float rgbaToFloat(vec4 texelRGBA);\n    int imod(int x, int y);\n    int idiv(int a, int b, float sign);\n\n    void main() {\n      vec2 resolution = u_resolution;\n      float size = resolution.x * resolution.y;\n      float width = resolution.x;\n      vec2 uv = gl_FragCoord.xy - halfV;\n      float x = uv.x;\n      float y = uv.y;\n      float thread = (x + y * width);\n      float normalized_thread = thread / (255.0 * size);\n      gl_FragColor = getColor(int(thread));\n    }\n\n    " + type.shader + " userCode(int thread) {\n      " + this.code + "\n    }\n    vec4 getColor(int thread) {\n      " + type.shader + " result = userCode(thread);\n      return " + (type.shader === "float"
            ? "floatToRgba(result)"
            : type.precision === "low"
                ? "lowIntToRgba(result)"
                : type.precision === "medium"
                    ? "mediumIntToRgba(result)"
                    : "highIntToRgba(result)") + ";\n    }\n    " + functions.join("\n    ") + "\n    vec4 lowIntToRgba(int result) {\n      return vec4(0.0, 0.0, 0.0, float(result)) / 255.0;\n    }\n    vec4 mediumIntToRgba(int result) {\n      return vec4(\n        0.0,\n        0.0,\n        extractBits(float(result), 8.0, 16.0),\n        extractBits(float(result), 0.0, 8.0)\n      ) / 255.0;\n    }\n    vec4 highIntToRgba(int result) {\n      return vec4(\n        extractBits(float(result), 24.0, 32.0),\n        extractBits(float(result), 16.0, 24.0),\n        extractBits(float(result), 8.0, 16.0),\n        extractBits(float(result), 0.0, 8.0)\n      ) / 255.0;\n    }\n    int rgbaToHighInt(vec4 color) {\n      return int(color.a)\n        + int(color.b * 255.0 * 255.0)\n        + int(color.g * 255.0 * 255.0 * 255.0)\n        + int(color.r * 255.0 * 255.0 * 255.0 * 255.0);\n    }\n    int rgbaToMediumInt(vec4 color, int z) {\n      float a = z == 0 ? color.a : color.g;\n      float b = z == 0 ? color.b : color.r;\n      return int(a * 255.0)\n        + int(b * 255.0 * 255.0);\n    }\n    int rgbaToLowInt(vec4 color, int z) {\n      float a = z == 0 ? color.r : z == 1 ? color.g : z == 2 ? color.b : color.a;\n      return int(a * 255.0);\n    }\n    float shiftRight(float v, float amt) {\n      v = floor(v) + 0.5;\n      return floor(v / exp2(amt));\n    }\n    float shiftLeft(float v, float amt) {\n        return floor(v * exp2(amt) + 0.5);\n    }\n    float maskLast(float v, float bits) {\n        return mod(v, shiftLeft(1.0, bits));\n    }\n    float extractBits(float num, float from, float to) {\n        from = floor(from + 0.5); to = floor(to + 0.5);\n        return maskLast(shiftRight(num, from), to - from);\n    }\n    vec4 floatToRgba(float texelFloat) {\n        if (texelFloat == 0.0) return vec4(0, 0, 0, 0);\n        float sign = texelFloat > 0.0 ? 0.0 : 1.0;\n        texelFloat = abs(texelFloat);\n        float exponent = floor(log2(texelFloat));\n        float biased_exponent = exponent + 127.0;\n        float fraction = ((texelFloat / exp2(exponent)) - 1.0) * 8388608.0;\n        float t = biased_exponent / 2.0;\n        float last_bit_of_biased_exponent = fract(t) * 2.0;\n        float remaining_bits_of_biased_exponent = floor(t);\n        float byte4 = extractBits(fraction, 0.0, 8.0) / 255.0;\n        float byte3 = extractBits(fraction, 8.0, 16.0) / 255.0;\n        float byte2 = (last_bit_of_biased_exponent * 128.0 + extractBits(fraction, 16.0, 23.0)) / 255.0;\n        float byte1 = (sign * 128.0 + remaining_bits_of_biased_exponent) / 255.0;\n        return (\n          littleEndian\n          ? vec4(byte4, byte3, byte2, byte1)\n          : vec4(byte1, byte2, byte3, byte4)\n        );\n    }\n    ivec4 floatsToBytes(vec4 inputFloats) {\n      ivec4 bytes = ivec4(inputFloats * 255.0);\n      return (\n        littleEndian\n        ? bytes.abgr\n        : bytes\n      );\n    }\n    void bytesToBits(const in ivec4 bytes, out bool bits[32]) {\n      for (int channelIndex = 0; channelIndex < 4; ++channelIndex) {\n        float acc = float(bytes[channelIndex]);\n        for (int indexInByte = 7; indexInByte >= 0; --indexInByte) {\n          float powerOfTwo = exp2(float(indexInByte));\n          bool bit = acc >= powerOfTwo;\n          bits[channelIndex * 8 + (7 - indexInByte)] = bit;\n          acc = mod(acc, powerOfTwo);\n        }\n      }\n    }\n    float getExponent(bool bits[32]) {\n      const int startIndex = 1;\n      const int bitStringLength = 8;\n      const int endBeforeIndex = startIndex + bitStringLength;\n      float acc = 0.0;\n      int pow2 = bitStringLength - 1;\n      for (int bitIndex = startIndex; bitIndex < endBeforeIndex; ++bitIndex) {\n        acc += float(bits[bitIndex]) * exp2(float(pow2--));\n      }\n      return acc;\n    }\n    float getMantissa(bool bits[32], bool subnormal) {\n      const int startIndex = 9;\n      const int bitStringLength = 23;\n      const int endBeforeIndex = startIndex + bitStringLength;\n      float acc = float(!subnormal) * exp2(float(bitStringLength));\n      int pow2 = bitStringLength - 1;\n      for (int bitIndex = startIndex; bitIndex < endBeforeIndex; ++bitIndex) {\n        acc += float(bits[bitIndex]) * exp2(float(pow2--));\n      }\n      return acc;\n    }\n    float bitsToFloat(bool bits[32]) {\n      float signBit = float(bits[0]) * -2.0 + 1.0;\n      float exponent = getExponent(bits);\n      bool subnormal = abs(exponent - 0.0) < 0.01;\n      float mantissa = getMantissa(bits, subnormal);\n      float exponentBias = 127.0;\n      return signBit * mantissa * exp2(exponent - exponentBias - 23.0);\n    }\n    float rgbaToFloat(vec4 texelRGBA) {\n      ivec4 rgbaBytes = floatsToBytes(texelRGBA);\n      bool bits[32];\n      bytesToBits(rgbaBytes, bits);\n      return bitsToFloat(bits);\n    }\n    int imod(int x, int y) {\n      return x - y * (x / y);\n    }\n    int idiv(int a, int b, float sign) {\n      int res = a / b;\n      int mod = imod(a, b);\n      if (sign < 0. && mod != 0) {\n        res -= 1;\n      }\n      return res;\n    }\n    ";
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
        Object.keys(this.shapes).forEach(function (name, i) {
            _this.textures[i] = initializeTexture(_this.context, _this.program, name, _this.shapes[name], i);
            if (_this.textures[i] === null) {
                throw Error("WebGL texture #" + i + " cannot be created");
            }
        });
        return this;
    };
    Compute.prototype.parse = function (shader) {
        var syntax = shader;
        Object.keys(this.shapes).forEach(function (key) {
            var valueRegex = new RegExp("(\\$" + key + ")", "g");
            var coordsRegex = new RegExp("(\\$" + key + "_coords)", "g");
            var indexAccessRegex = new RegExp("(\\$\\$" + key + "_index)", "g");
            var coordsAccessRegex = new RegExp("(\\$\\$" + key + "_coords)", "g");
            var indexCoordsRegex = new RegExp("(\\$\\$\\$" + key + "_coords)", "g");
            var coordsIndexRegex = new RegExp("(\\$\\$\\$" + key + "_index)", "g");
            syntax = syntax.replace(indexCoordsRegex, key + "IndexToCoords");
            syntax = syntax.replace(coordsIndexRegex, key + "CoordsToIndex");
            syntax = syntax.replace(coordsAccessRegex, key + "SampleCoords");
            syntax = syntax.replace(indexAccessRegex, key + "SampleIndex");
            syntax = syntax.replace(coordsRegex, key + "IndexToCoords(thread)");
            syntax = syntax.replace(valueRegex, key + "SampleIndex(thread)");
        });
        return syntax;
    };
    return Compute;
}());
exports.default = Compute;
//# sourceMappingURL=compute.js.map