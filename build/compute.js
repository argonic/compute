!function(t){var n={};function e(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:r})},e.r=function(t){Object.defineProperty(t,"__esModule",{value:!0})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},e.p="",e(e.s=2)}([function(t,n,e){"use strict";var r=this&&this.__assign||function(){return(r=Object.assign||function(t){for(var n,e=1,r=arguments.length;e<r;e++)for(var o in n=arguments[e])Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o]);return t}).apply(this,arguments)},o=this&&this.__spreadArray||function(t,n,e){if(e||2===arguments.length)for(var r,o=0,i=n.length;o<i;o++)!r&&o in n||(r||(r=Array.prototype.slice.call(n,0,o)),r[o]=n[o]);return t.concat(r||Array.prototype.slice.call(n))};Object.defineProperty(n,"__esModule",{value:!0}),n.logShaderSourceAndInfoLog=void 0;var i=function(){var t=new Uint8Array([170,187]);return 48042===new Uint16Array(t.buffer)[0]}();function a(t,n){return n<=t.length?t:t+" ".repeat(n-t.length)}var s=/ERROR: [0-9]+:([0-9]+):/g;function l(t,n){var e=s.exec(n);if(null==e)return console.log("Couldn't parse line number in error: "+n),void console.log(t);for(var r=+e[1],o=t.split("\n"),i=o.length.toString().length+2,l=o.map(function(t,n){return a((n+1).toString(),i)+t}),c=0,u=0;u<l.length;u++)c=Math.max(l[u].length,c);var h=l.slice(0,r-1),f=l.slice(r-1,r),d=l.slice(r);console.log(h.join("\n")),console.log(n.split("\n")[0]),console.log("%c "+a(f[0],c),"border:1px solid red; background-color:#e3d2d2; color:#a61717"),console.log(d.join("\n"))}function c(t,n,e){var r=t.createShader("vertex"===n?t.VERTEX_SHADER:t.FRAGMENT_SHADER);return null===r?null:(t.shaderSource(r,e),t.compileShader(r),t.getShaderParameter(r,t.COMPILE_STATUS)?r:(l(e,t.getShaderInfoLog(r)+""),t.deleteShader(r),null))}function u(t){var n=["x","y","z","w","i"];return t<n.length?n[t]:n.slice(-1)[0]+(n.length-t+1)}function h(t,n,e,r,o){!function(t,n,e,r){var o=t.getUniformLocation(n,"u_"+e+"_width"),i=t.getUniformLocation(n,"u_"+e+"_height");t.uniform1i(o,r.width*r.bytes),t.uniform1i(i,r.height*r.bytes),r.shape.forEach(function(o,i){var a=t.getUniformLocation(n,"u_"+e+"_shape."+u(i)),s=t.getUniformLocation(n,"u_"+e+"_strides."+u(i));t.uniform1i(a,o),t.uniform1i(s,r.strides[i])})}(t,n,e,r);var i=t.getUniformLocation(n,"u_"+e);t.activeTexture(t.TEXTURE0+o);var a=t.createTexture();return null===a?null:(t.bindTexture(t.TEXTURE_2D,a),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,r.width,r.height,0,t.RGBA,t.UNSIGNED_BYTE,null),t.uniform1i(i,o),a)}function f(t,n){for(var e={},r=n,o=0;o<t.shape.length;o++){var i=Math.floor(r/t.strides[o]);r-=i*t.strides[o],e[u(o)]=i}return e}function d(t,n){if(1===t.length)return n.x;for(var e=0,r=0;r<t.length;r++){e+=n[u(r)]*t.strides[r]}return e}n.logShaderSourceAndInfoLog=l;var p=function(){function t(){this.code="return float(thread);",this.context=null,this.program=null,this.vertex=null,this.fragment=null,this.textures=[],this.shapes={},this.values={},this.result={constructor:Float32Array,precision:"high",native:"float",typed:"float",shader:"float",bytes:4,rank:0,length:0,width:0,height:0,strides:[],shape:[]},this.closure=function(){return 0}}return t.tensor=function(t,n){var e=t.constructor;"name"in t&&"string"==typeof t.name&&t.name.endsWith("Array")&&(e=t);for(var r=e,o=r===Int8Array?"int8":r===Uint8Array?"uint8":r===Int16Array?"int16":r===Uint16Array?"uint16":r===Int32Array?"int32":r===Uint32Array?"uint32":"float",i=r===Int8Array||r===Int16Array||r===Int32Array?"int":r===Uint8Array||r===Uint16Array||r===Uint32Array?"uint":"float",a=r===Int8Array||r===Uint8Array?"low":r===Int16Array||r===Uint16Array?"medium":"high",s="low"===a?1:"medium"===a?2:4,l="float"===i?"float":"int",c=n.reduce(function(t,n){return t*n},1),u=Math.ceil(c/(4/s)),h=Math.floor(Math.sqrt(u)),f=Math.ceil(u/h),d=[],p=n.length-1;p>=0;p--){var g=d[p+1],x=p===n.length-1?1:n[p+1];g=void 0===g?1:g,d[p]=x*g}return{constructor:r,typed:o,native:i,precision:a,shader:l,rank:n.length,bytes:s,shape:n,length:c,width:h,height:f,strides:d}},t.prototype.output=function(n){for(var e=[],r=1;r<arguments.length;r++)e[r-1]=arguments[r];return this.result=t.tensor(n,e),this},t.prototype.shape=function(n,e){for(var r=[],o=2;o<arguments.length;o++)r[o-2]=arguments[o];return this.shapes[n]=t.tensor(e,r),this},t.prototype.fallback=function(t){return this.closure=t,this},t.prototype.compute=function(t){return this.code=this.parse(t),this},t.prototype.inputs=function(t){return this.values=t,this.compile()},t.prototype.run=function(t){var n=this,e=void 0===t?{}:t,r=e.runtime,o=void 0===r?"fastest":r,i=e.threshold,a=void 0===i?4096:i;if("gpu"===o)return this.gpu();if("cpu"===o)return this.cpu();if("fallback"===o)try{return this.gpu()}catch(t){return this.cpu()}var s=a||4096,l="cpu";Object.keys(this.shapes).forEach(function(t){var e=n.shapes[t];e.length*e.bytes>s&&(l="gpu")}),this.result.length*this.result.bytes>s&&(l="gpu");try{return this[l]()}catch(t){return this["gpu"===l?"cpu":"gpu"]()}},t.prototype.gpu=function(){var t=this,n=this.context,e=this.program,r=this.vertex,o=this.fragment;return n&&e&&r&&o?(Object.keys(this.shapes).forEach(function(n,e){if(t.values.hasOwnProperty(n)){var r=t.textures[e];!function(t,n,e,r,o){var i=r.width*r.height*4;t.activeTexture(t.TEXTURE0+o),t.bindTexture(t.TEXTURE_2D,n);var a=e instanceof Uint8Array?e:new Uint8Array(e.buffer,0,i);a.length<i&&(a=new Uint8Array(i).map(function(t,n){return n<a.length?a[n]:0})),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,r.width,r.height,0,t.RGBA,t.UNSIGNED_BYTE,a)}(t.context,r,t.values[n],t.shapes[n],e)}}),n.bufferData(n.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]),n.STATIC_DRAW),n.drawArrays(n.TRIANGLES,0,6),function(t,n){return n.constructor===Float32Array?new Float32Array(t.buffer):n.constructor===Int8Array||n.constructor===Uint8Array?new n.constructor(n.length).map(function(n,e){return t[4*e+3]}):n.constructor===Int16Array||n.constructor===Uint16Array?new n.constructor(n.length).map(function(n,e){return t[4*e+3]+(t[4*e+2]<<8)}):n.constructor===Int32Array||n.constructor===Uint32Array?new n.constructor(n.length).map(function(n,e){return t[4*e+3]+(t[4*e+2]<<8)+(t[4*e+1]<<16)+(t[4*e]<<16)}):new n.constructor(t.buffer)}(function(t){var n=t.canvas,e=new Uint8Array(n.width*n.height*4);return t.readPixels(0,0,t.drawingBufferWidth,t.drawingBufferHeight,t.RGBA,t.UNSIGNED_BYTE,e),e}(n),this.result)):new this.result.constructor(this.result.shape.reduce(function(t,n){return t*n},1))},t.prototype.cpu=function(){var t=this,n=this.result.length;return new this.result.constructor(n).map(function(n,e){var o={thread:e};return Object.keys(t.shapes).forEach(function(n){o=r(r({},o),function(t,n,e,r){var o={};return o["$"+t]=n[r],o["$"+t+"_coords"]=f(e,r),o["$$"+t+"_coords"]=function(t){return n[d(e,t)]},o["$$"+t+"_index"]=function(t){return n[t]},o["$$$"+t+"_coords"]=function(t){return f(e,t)},o["$$$"+t+"_index"]=function(t){return d(e,t)},o}(n,t.values[n],t.shapes[n],e))}),t.closure(o)})},t.prototype.compile=function(){var t=this,n=[],e=[],r=[],a=function(t){var n=[];return o([],Array(t),!0).forEach(function(t,e){e>=1&&e<=3||n.push("struct ivec"+(e+1)+" {"+o([],Array(e+1),!0).map(function(t,n){return"int "+u(n)}).join("; ")+";}")}),n}(6);Object.keys(this.values).forEach(function(o,i){var a=function(t,n){var e=[],r=[];return e.push("uniform sampler2D u_"+t),e.push("uniform int u_"+t+"_width"),e.push("uniform int u_"+t+"_height"),e.push("uniform ivec"+n.shape.length+" u_"+t+"_shape"),e.push("uniform ivec"+n.shape.length+" u_"+t+"_strides"),r.push("\n    "+n.shader+" "+t+"SampleIndex(int index) {\n      int d = "+n.bytes+";\n      float p = 4.0 / float(d);\n      int i = int(float(index) / p);\n      int z = index - int(float(i) * p);\n      vec4 color = colorIndex(index, u_"+t+", d, u_"+t+"_width, u_"+t+"_height);\n      return "+("float"===n.shader?"rgbaToFloat(color)":"high"===n.precision?"rgbaToHighInt(color)":"medium"===n.precision?"rgbaToMediumInt(color, z)":"rgbaToLowInt(color, z)")+";\n    }"),r.push("\n    "+n.shader+" "+t+"SampleCoords(ivec"+n.shape.length+" coords) {\n      return "+t+"SampleIndex("+t+"CoordsToIndex(coords));\n    }"),r.push("\n    int "+t+"CoordsToIndex(ivec"+n.shape.length+" coords) {\n      return coordsToIndex(coords, u_"+t+"_strides);\n    }"),r.push("\n    ivec"+n.shape.length+" "+t+"IndexToCoords(int index) {\n      return indexToCoords(index, u_"+t+"_strides);\n    }"),r.push("\n    vec4 colorIndex(int index, sampler2D texture, int d, int width, int height) {\n      float p = 4.0 / float(d);\n      int i = int(float(index) / p);\n      int z = index - int(float(i) * p);\n      int w = width;\n      int h = height;\n      int y = i / w;\n      int x = i - y * w;\n      vec2 uv = vec2((float(x) + 0.5) / float(w), (float(y) + 0.5) / float(h));\n      vec4 color = texture2D(texture, uv);\n      return color;\n    }"),r.push("\n    vec4 colorCoords(ivec"+n.shape.length+" coords, ivec"+n.shape.length+" strides, sampler2D texture, int d, int width, int height) {\n      int index = coordsToIndex(coords, strides);\n      return colorIndex(index, texture, d, width, height);\n    }"),r.push("\n    int coordsToIndex(ivec"+n.shape.length+" coords, ivec"+n.shape.length+" strides) {\n      if ("+n.shape.length+" == 1) {\n        return coords."+u(0)+";\n      }\n      int index = 0;\n      "+n.shape.map(function(t,n){return"index += coords."+u(n)+" * strides."+u(n)+";"}).join("\n      ")+"\n      return index;\n    }"),r.push("\n    ivec"+n.shape.length+" indexToCoords(int index, ivec"+n.shape.length+" strides) {\n      "+(1===n.shape.length?"return ivec"+n.shape.length+"(index);":"ivec"+n.shape.length+" coords = ivec"+n.shape.length+"("+n.shape.map(function(){return"0"}).join(", ")+");\n      int rest = index;\n      int div = 0;\n      "+n.shape.map(function(t,n){return"div = int(rest / strides."+u(n)+");\n      rest -= div * strides."+u(n)+";\n      coords."+u(n)+" = div;"}).join("\n      ")+"\n      return coords;")+"\n    }"),{uniforms:e,functions:r}}(o,t.shapes[o]);a.uniforms.forEach(function(t){var e=t.trim();n.includes(e)||n.push(e)}),a.functions.forEach(function(t){var n=t.trim();if(!e.includes(n)){var o=n.substring(0,n.indexOf("\n")).slice(0,-2);e.push(n),r.push(o)}})});var s=this.result,l="\n    precision mediump float;\n    uniform vec2 u_resolution;\n    uniform bool littleEndian;\n\n    "+a.join(";\n    ")+";\n\n    "+n.join(";\n    ")+";\n\n    const vec2 halfV = vec2(0.5, 0.5);\n\n    "+s.shader+" userCode(int thread);\n    vec4 getColor(int thread);\n    "+r.join(";\n    ")+";\n    vec4 lowIntToRgba(int result);\n    vec4 mediumIntToRgba(int result);\n    vec4 highIntToRgba(int result);\n    int rgbaToHighInt(vec4 color);\n    int rgbaToMediumInt(vec4 color, int z);\n    int rgbaToLowInt(vec4 color, int z);\n    float shiftRight(float v, float amt);\n    float shiftLeft(float v, float amt);\n    float maskLast(float v, float bits);\n    float extractBits(float num, float from, float to);\n    vec4 floatToRgba(float texelFloat);\n    ivec4 floatsToBytes(vec4 inputFloats);\n    void bytesToBits(const in ivec4 bytes, out bool bits[32]);\n    float getExponent(bool bits[32]);\n    float getMantissa(bool bits[32], bool subnormal);\n    float bitsToFloat(bool bits[32]);\n    float rgbaToFloat(vec4 texelRGBA);\n    int imod(int x, int y);\n    int idiv(int a, int b, float sign);\n\n    void main() {\n      vec2 resolution = u_resolution;\n      float size = resolution.x * resolution.y;\n      float width = resolution.x;\n      vec2 uv = gl_FragCoord.xy - halfV;\n      float x = uv.x;\n      float y = uv.y;\n      float thread = (x + y * width);\n      float normalized_thread = thread / (255.0 * size);\n      gl_FragColor = getColor(int(thread));\n    }\n\n    "+s.shader+" userCode(int thread) {\n      "+this.code+"\n    }\n    vec4 getColor(int thread) {\n      "+s.shader+" result = userCode(thread);\n      return "+("float"===s.shader?"floatToRgba(result)":"low"===s.precision?"lowIntToRgba(result)":"medium"===s.precision?"mediumIntToRgba(result)":"highIntToRgba(result)")+";\n    }\n    "+e.join("\n    ")+"\n    vec4 lowIntToRgba(int result) {\n      return vec4(0.0, 0.0, 0.0, float(result)) / 255.0;\n    }\n    vec4 mediumIntToRgba(int result) {\n      return vec4(\n        0.0,\n        0.0,\n        extractBits(float(result), 8.0, 16.0),\n        extractBits(float(result), 0.0, 8.0)\n      ) / 255.0;\n    }\n    vec4 highIntToRgba(int result) {\n      return vec4(\n        extractBits(float(result), 24.0, 32.0),\n        extractBits(float(result), 16.0, 24.0),\n        extractBits(float(result), 8.0, 16.0),\n        extractBits(float(result), 0.0, 8.0)\n      ) / 255.0;\n    }\n    int rgbaToHighInt(vec4 color) {\n      return int(color.a)\n        + int(color.b * 255.0 * 255.0)\n        + int(color.g * 255.0 * 255.0 * 255.0)\n        + int(color.r * 255.0 * 255.0 * 255.0 * 255.0);\n    }\n    int rgbaToMediumInt(vec4 color, int z) {\n      float a = z == 0 ? color.a : color.g;\n      float b = z == 0 ? color.b : color.r;\n      return int(a * 255.0)\n        + int(b * 255.0 * 255.0);\n    }\n    int rgbaToLowInt(vec4 color, int z) {\n      float a = z == 0 ? color.r : z == 1 ? color.g : z == 2 ? color.b : color.a;\n      return int(a * 255.0);\n    }\n    float shiftRight(float v, float amt) {\n      v = floor(v) + 0.5;\n      return floor(v / exp2(amt));\n    }\n    float shiftLeft(float v, float amt) {\n        return floor(v * exp2(amt) + 0.5);\n    }\n    float maskLast(float v, float bits) {\n        return mod(v, shiftLeft(1.0, bits));\n    }\n    float extractBits(float num, float from, float to) {\n        from = floor(from + 0.5); to = floor(to + 0.5);\n        return maskLast(shiftRight(num, from), to - from);\n    }\n    vec4 floatToRgba(float texelFloat) {\n        if (texelFloat == 0.0) return vec4(0, 0, 0, 0);\n        float sign = texelFloat > 0.0 ? 0.0 : 1.0;\n        texelFloat = abs(texelFloat);\n        float exponent = floor(log2(texelFloat));\n        float biased_exponent = exponent + 127.0;\n        float fraction = ((texelFloat / exp2(exponent)) - 1.0) * 8388608.0;\n        float t = biased_exponent / 2.0;\n        float last_bit_of_biased_exponent = fract(t) * 2.0;\n        float remaining_bits_of_biased_exponent = floor(t);\n        float byte4 = extractBits(fraction, 0.0, 8.0) / 255.0;\n        float byte3 = extractBits(fraction, 8.0, 16.0) / 255.0;\n        float byte2 = (last_bit_of_biased_exponent * 128.0 + extractBits(fraction, 16.0, 23.0)) / 255.0;\n        float byte1 = (sign * 128.0 + remaining_bits_of_biased_exponent) / 255.0;\n        return (\n          littleEndian\n          ? vec4(byte4, byte3, byte2, byte1)\n          : vec4(byte1, byte2, byte3, byte4)\n        );\n    }\n    ivec4 floatsToBytes(vec4 inputFloats) {\n      ivec4 bytes = ivec4(inputFloats * 255.0);\n      return (\n        littleEndian\n        ? bytes.abgr\n        : bytes\n      );\n    }\n    void bytesToBits(const in ivec4 bytes, out bool bits[32]) {\n      for (int channelIndex = 0; channelIndex < 4; ++channelIndex) {\n        float acc = float(bytes[channelIndex]);\n        for (int indexInByte = 7; indexInByte >= 0; --indexInByte) {\n          float powerOfTwo = exp2(float(indexInByte));\n          bool bit = acc >= powerOfTwo;\n          bits[channelIndex * 8 + (7 - indexInByte)] = bit;\n          acc = mod(acc, powerOfTwo);\n        }\n      }\n    }\n    float getExponent(bool bits[32]) {\n      const int startIndex = 1;\n      const int bitStringLength = 8;\n      const int endBeforeIndex = startIndex + bitStringLength;\n      float acc = 0.0;\n      int pow2 = bitStringLength - 1;\n      for (int bitIndex = startIndex; bitIndex < endBeforeIndex; ++bitIndex) {\n        acc += float(bits[bitIndex]) * exp2(float(pow2--));\n      }\n      return acc;\n    }\n    float getMantissa(bool bits[32], bool subnormal) {\n      const int startIndex = 9;\n      const int bitStringLength = 23;\n      const int endBeforeIndex = startIndex + bitStringLength;\n      float acc = float(!subnormal) * exp2(float(bitStringLength));\n      int pow2 = bitStringLength - 1;\n      for (int bitIndex = startIndex; bitIndex < endBeforeIndex; ++bitIndex) {\n        acc += float(bits[bitIndex]) * exp2(float(pow2--));\n      }\n      return acc;\n    }\n    float bitsToFloat(bool bits[32]) {\n      float signBit = float(bits[0]) * -2.0 + 1.0;\n      float exponent = getExponent(bits);\n      bool subnormal = abs(exponent - 0.0) < 0.01;\n      float mantissa = getMantissa(bits, subnormal);\n      float exponentBias = 127.0;\n      return signBit * mantissa * exp2(exponent - exponentBias - 23.0);\n    }\n    float rgbaToFloat(vec4 texelRGBA) {\n      ivec4 rgbaBytes = floatsToBytes(texelRGBA);\n      bool bits[32];\n      bytesToBits(rgbaBytes, bits);\n      return bitsToFloat(bits);\n    }\n    int imod(int x, int y) {\n      return x - y * (x / y);\n    }\n    int idiv(int a, int b, float sign) {\n      int res = a / b;\n      int mod = imod(a, b);\n      if (sign < 0. && mod != 0) {\n        res -= 1;\n      }\n      return res;\n    }\n    ";if(this.context=document.createElement("canvas").getContext("webgl"),null===this.context)throw Error("WebGL context cannot be created");if(this.vertex=c(this.context,"vertex","\n      attribute vec2 a_position;\n      void main() {\n        vec2 zeroToTwo = a_position * 2.0;\n        vec2 clipSpace = zeroToTwo - 1.0;\n\n        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);\n      }\n    "),this.fragment=c(this.context,"fragment",l),null===this.vertex)throw Error("WebGL vertex shader cannot be created");if(null===this.fragment)throw Error("WebGL fragment shader cannot be created");if(this.program=function(t,n,e){var r=t.createProgram();return null===r?null:(t.attachShader(r,n),t.attachShader(r,e),t.linkProgram(r),t.getProgramParameter(r,t.LINK_STATUS)?r:(console.log(t.getProgramInfoLog(r)),t.deleteProgram(r),null))}(this.context,this.vertex,this.fragment),null===this.program)throw Error("WebGL program cannot be created");return function(t,n,e){var r=4*e.width/e.bytes,o=4*e.height/e.bytes,a=t.createBuffer();t.canvas.width=r,t.canvas.height=o;var s=t.getAttribLocation(n,"a_position"),l=t.getUniformLocation(n,"u_resolution"),c=t.getUniformLocation(n,"littleEndian");t.viewport(0,0,r,o),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),t.useProgram(n),t.enableVertexAttribArray(s),t.bindBuffer(t.ARRAY_BUFFER,a),t.vertexAttribPointer(s,2,t.FLOAT,!1,0,0),t.uniform2f(l,t.canvas.width,t.canvas.height),t.uniform1i(c,i?1:0)}(this.context,this.program,this.result),Object.keys(this.shapes).forEach(function(n,e){if(t.textures[e]=h(t.context,t.program,n,t.shapes[n],e),null===t.textures[e])throw Error("WebGL texture #"+e+" cannot be created")}),this},t.prototype.parse=function(t){var n=t;return Object.keys(this.shapes).forEach(function(t){var e=new RegExp("(\\$"+t+")","g"),r=new RegExp("(\\$"+t+"_coords)","g"),o=new RegExp("(\\$\\$"+t+"_index)","g"),i=new RegExp("(\\$\\$"+t+"_coords)","g"),a=new RegExp("(\\$\\$\\$"+t+"_coords)","g"),s=new RegExp("(\\$\\$\\$"+t+"_index)","g");n=(n=(n=(n=(n=(n=n.replace(a,t+"IndexToCoords")).replace(s,t+"CoordsToIndex")).replace(i,t+"SampleCoords")).replace(o,t+"SampleIndex")).replace(r,t+"IndexCoords(thread)")).replace(e,t+"SampleIndex(thread)")}),n},t}();n.default=p},function(t,n){var e;e=function(){return this}();try{e=e||Function("return this")()||(0,eval)("this")}catch(t){"object"==typeof window&&(e=window)}t.exports=e},function(t,n,e){(function(n){t.exports=n.Compute=e(0)}).call(this,e(1))}]);