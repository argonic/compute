# Compute.js

[![codecov](https://codecov.io/gh/argonic/compute/branch/master/graph/badge.svg)](https://codecov.io/gh/argonic/compute)  [![npm (scoped)](https://img.shields.io/npm/v/compute.js.svg)](https://www.npmjs.com/package/compute.js)  ![DUB](https://img.shields.io/dub/l/vibe-d.svg)   [![Prettier code style](https://img.shields.io/badge/code%20style-prettier-ff69b4.svg)](https://github.com/argonic/compute) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) ![npm](https://img.shields.io/npm/dw/compute.js) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/esta/issues)

## About the author
Made with ❤️ by Zakaria Chabihi [![Build Status](https://img.shields.io/badge/patreon-%24-green)](https://www.patreon.com/argonic) [![Build Status](https://img.shields.io/badge/buy%20me%20coffee-%24-green)](https://www.buymeacoffee.com/argonic) 

## Table of contents
1. [Introduction](#introduction)
1. [Tensors](#tensors)
1. [Features](#features)
1. [How does it work](#how-does-it-work)
1. [Installation](#installation)
1. [Get started](#get-started)
1. [Example](#example)
1. [Input interpolates](#input-interpolates)
1. [Using the transpiler](#using-the-transpiler)
1. [Methods](#methods)
1. [Tensor metadata](#tensor-metadata)
1. [API](#api)
1. [License](#license)
## Introduction
Compute.js is an open-source hardware accelerated Typescript library for tensor computation, it supports GPGPU (General purpose computing on GPUs) with fallback to regular javascript.

Compute.js allows you to parallelize computation on GPU and expose current thread tensor value and a bunch of helper methods, It also automaticallly computes tensor's metadata such as rank, stride, bytes length and texture matrix.

## Tensors
Tensors are multidimensional vector spaces that maps in a (multi-)linear manner to vectors, scalars, and other tensors to a resulting tensor.

## Features
- Zero dependency codebase
- Extermely lightweight, under 2000LOC 
- Transpile shaders to WebGL and CPU code
- Compute tensor's metadata
- Parallelize output computations on GPU
- Efficient input compaction
- Fallback to CPU computation
- GPU kernel precompilation
- Smartly fallback to CPU if data size threshold is faster on CPU
- Expose current tensor value both on CPU and GPU backends
- Expose helper accessors both on CPU and GPU backends

## How does it work
Compute.js parallelize the work on gpu according the expected output shape.

A `thread` variable is exposed on both CPU and GPU compute programs, which refers to the current output index which is within `0` and `output.length - 1`.

We also expose input interpolates for every input on both CPU and GPU programs so you can write your custom logic.

## Installation
To get started using Compute.js first install it
```
$ npm install compute.js
```
Import Compute.js
```typescript
import Compute from "compute.js"; // ES6 style
const Compute = require("compute.js"); // RequireJS style
// or simply use Compute global on browser
Compute // same as window.Compute
```
## Get started
Construct a Compute instance
```typescript
const instance = new Compute();
```
Define an input shape

You may add as many inputs as you want
```typescript
instance.input("input", Uint8Array, 2, 5, 3]); // this creates a tensor name "input" with a shape of [3, 5, 3] using an Uint8Array
```
Define the output shape
```typescript
instance.output(Uint8Array, [2, 5, 3]); // this defines the output tensor with a shape of [3, 5, 3] using an Uint8Array
```
Define the CPU fallback compute function
```typescript
instance.cpu<{ input: 3 }>(({ $input }) => {
    return $input;
});
```
Define the GPU fallback compute function
```typescript
instance.gpu(`return float($input);`);
```
Supply the input values

input values is an object that maps name inputs to TypeArray
```typescript
const input = new Uint8Array(5 * 3 * 2).map((_, i) =>
    Math.floor(Math.random() * 100)
);
instance.input("input", input);
```
Execute the computation
```typescript
const output = instance.run(); // output would be the same as input

```

## Example
```typescript
const input = new Uint8Array(5 * 3 * 2).map((_, i) =>
    Math.floor(Math.random() * 100)
);
const backend = new Backend();
const result = backend
    .input("input", Uint8Array, [5, 3, 2])
    .output(Float32Array, [5, 3, 2])
    .cpu<{ input: 3 }>(({ $input }) => {
    return $input;
    })
    .gpu(`return float($input);`)
    .inputs({ input })
    .run(); // would return a Float32Array with the same values from input
```

## Input interpolates
| Interpolate | Explanation | Type |
|-----|----|----|
| $NAME | get value on current thread | `Int` or `Float` (Value) |
| $NAME__coords | get coordinates on current thread | `Vector` |
| $NAME__access_index | input accessor helper using array index | `(index) => Value` |
| $NAME__access_coords | input accessor helper using coordinates | `(coords) => Value` |
| $NAME__coords_index | coordinates to index helper | `(coords) => Int` |
| $NAME__index_coords | index to coordinates helper | `(index) => Vector` |
## Using the transpiler
Compute.js ships with a lightweight transpile-only code parser which returns a configure `Compute` instance with both CPU/GPU code and input/output shapes configured
```typescript
const instance = Compute.transpile(`
f32(3) (f32(3) input) {
    i8 acc = 0;
    for (i8 a=0; a < 10; a++) {
    acc = a % 2 < 1 ? 0 : acc + a;
    }
    return float(acc);
}
`);
// or
const instance = Compute.Transpile`
    Code goes here...
`;
```
### Using interpolates
Compute.js adopts a different sugar syntax on its transpiler, to refer to an interpolate simply remplace the `$` with an `@` and `__` with a `.` such as `$name_coords` will become `@name.coords`
### Supported primitives
| Primitive | Equivalent | WebGL |
|-----|----|----|
| f32 | Float32 | float |
| i32 | Int32 | int |
| i16 | Int16 | int |
| i8 | Int8 | int |
| bool | Boolean | bool |
| vecN<f32> | VecN | vecN |
| vecN<iN> | VecN | ivecN |
### Supported functions
Compute.js transpiler support the following funcions:
`not`, `length`, `normalize`, `distance`, `pow`, `exp`, `exp2`, `log`, `log2`, `sqrt`, `floor`, `ceil`, `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `mult`, `div`, `mod`, `plus`, `minus`, `lt`, `lte`, `gt`, `gte`, `eq`, `neq`, `and`, `or`, `float`, `int` in addition to `vecN` and `ivecN` constructors.
### Supported expressions
Compute.js transpiler support the following expressions:
- Comparison such as `<`, `<=`, `>` and `>=`
- Equality such as `==` and `!=`
- Binary such as `+`, `-`, `*`, `/`, `^` and `%`
- Logical such as `!` and ternary operator
### Supported declarations
Compute.js transpiler support the following declarations:
- For loops
- Conditions
- Break, continue and return statements
### Not supported yet
Compute.js transpiler support a subset of the GLSL syntax, yet it doesn't support:
- Comments
- Other builtin functions
- Arrays and structs

### Fully featured example
```c
f32 custom_add(f32 a, f32 b) {
    return a + b;
}
f32 custom_add_mult(f32 a, f32 b) {
    return custom_add(a, b) * custom(a, b);
}
f32(3) (f32(3) left, right i8[5,2,3]) {
    i8 acc = 0;
    f32 l = $left;
    vec3<i8> r = $right.coords;
    vec3<i8> r_s = r + ivec3(1);
    i8 r_v = $right.access_coords(r_s);
    for (i8 a=0; a < 10; a++) {
        if (a % 3 == 0) {
            continue;
        }
        if (a < 5) {
            break;
        }
        acc = a % 2 < 1 ? 0 : custom_add_mult(acc, a);
        acc += l + r;
    }
    return float(acc) + l + float(r_v);
}
```
## Methods
### `Backend.prototype.input`
____
#### `Backend.prototype.input(name: string, type: TypedArray | TypedArrayConstructor, shape: number | number[]): Backend;`
#### `Backend.prototype.input(name: string, shape: number | number[], type: TypedArray | TypedArrayConstructor): Backend;`
#### `Backend.prototype.input(name: string, shape: number | number[]): Backend;`
#### `Backend.prototype.input(name: string, type: TypedArray | TypedArrayConstructor): Backend;`

Defines a input named `input` with a type `TypedArrayConstructor` with a shape of `shape`.

If `type` is a `TypedArray` then its data will be uploaded otherwise it will be used to define the tensor type.

If `shape` is a `number` it will be used to infer tensor's dimensions otherwise it shape dimensions will be uploaded to the shader.

* `name`: input name must be a compatible GLSL variable name.
* `type`: a typed array or a typed array constructor.
* `shape`: a 1D array of dimensions shapes

`return`: *this* object.

### `Backend.prototype.output`
____
#### `Backend.prototype.output(type: TypedArray | TypedArrayConstructor, shape: number | number[]): Backend;`
#### `Backend.prototype.output(shape: number | number[], type: TypedArray | TypedArrayConstructor): Backend;`
#### `Backend.prototype.output(type: TypedArray | TypedArrayConstructor): Backend;`
#### `Backend.prototype.output(shape: number | number[]): Backend;`

Defines the output a type `TypedArrayConstructor` with a shape of `shape`

If `type` is a `TypedArray` then its data will be uploaded otherwise it will be used to define the tensor type.

If `shape` is a `number` it will be used to infer tensor's dimensions otherwise it shape dimensions will be uploaded to the shader.

* `type`: a typed array or a typed array constructor.
* `shape`: a 1D array of dimensions shapes

`return`: *this* object.

### `Backend.prototype.function`
____
#### `Backend.prototype.function(name: string, result: string, code: string): Backend;`

Defines a custom shader function with `name` and a return value of `result` and a function body of `code`

* `name`: input name must be a compatible GLSL variable name.
* `result`: a valid GLSL function return type
* `code`: a valid GLSL function body code

`return`: *this* object.



### `Backend.prototype.gpu`
____
#### `Backend.prototype.gpu(syntax: string): Backend;`

Defines the CPU compute shader of the current thread

This shader must return a `float` if you were expecting a Float32Array output and must return an `int` value if otherwise.

* `syntax`: the compute shader syntax, interpolates *that starts with a dollar sign will be replaced automatically*

`return`: *this* object.


### `Backend.prototype.cpu`
____
#### `Backend.prototype.cpu<T extends {[s: string]: number} = {}>(closure: (map: IMethodsMap<T> & {thread: number}) => number): Backend;`

Defines the CPU compute closure of the current thread


* `map`: this object supplies the current thread in addition to the current input interpolate values

`return`: *this* object.

____
#### `Backend.prototype.run({runtime = "fastest", threshold = 4096 : { runtime?: "gpu" | "cpu" | "fallback" | "fastest"; threshold?: number; } = {}): TypedArray;`

Execute the compute kernel and returns a TypedArray

* `runtime`: execution runtime
* `threshold`: slow GPU data size threshold

| runtime | explanation |
|---------|-------|
| `gpu`     | Runs the kernel on GPU exclusively |
| `cpu`     | Runs the kernel on CPU exclusively |
| `fallback`| Runs the kernel on GPU the on CPU if GPU fails |
| `fastest`| if the input data size is below threshold run the kernel on CPU otherwise run it on the GPU |

`return`: TypedArray.

## Tensor metadata
A call with `Compute.tensor(type: Float32, [2, 3, 5])` would compute the following values :
1. `rank`: number of dimensions
2. `shape`: depth of each dimension
3. `strides`: each dimension stride
4. `length`: total elements in tensor
5. `width`: tensor 2D width
6. `height`: tensor 2D width
7. `bytes`: bytes per element, `4` for floats, `2` for 16 bit numbers and `1` for 8 bits numbers

## API
```typescript
type TypedArray = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Float32Array;
type TypedArrayConstructor = Int8ArrayConstructor | Int16ArrayConstructor | Int32ArrayConstructor | Uint8Array | Uint16ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor;
type TensorMetadata = {
    constructor: TypedArrayConstructor;
    typed: "int8" | "uint8" | "int16" | "uint16" | "int32" | "float" | "uint31";
    native: "float" | "int" | "uint";
    precision: "low" | "medium" | "high";
    shader: "float" | "int";
    rank: number;
    bytes: number;
    shape: number[];
    length: number;
    width: number;
    height: number;
    strides: number[];
};

type IOutput = [type: TypedArray | TypedArrayConstructor]
    | [shape: number | number[]]
    | [type: TypedArray | TypedArrayConstructor, shape: number | number[]];

type IInput = [name: string, type: TypedArray | TypedArrayConstructor]
    | [name: string, shape: number | number[]]
    | [name: string, type: TypedArray | TypedArrayConstructor, shape: number | number[]]
    | [name: string, shape: number | number[], type: TypedArray | TypedArrayConstructor];

export default class Compute {
    static Transpile(string: TemplateStringsArray): Compute;
    static transpile(code: string): Compute;
    static tensor(type: TypedArray | TypedArrayConstructor, shape: number[]): TensorMetadata;

    output(...args: IOutput): this;
    input(...args: IInput): this;

    function(name: string, result: string, code: string): this;

    cpu<T extends {
        [s: string]: number;
    } = {}>(closure: (map: IMethodsMap<T> & {
        thread: number;
    }) => number): this;

    gpu(code: string): this;

    run({ runtime, threshold, safe, }?: {
        runtime?: "gpu" | "cpu" | "fallback" | "fastest";
        threshold?: number;
        safe?: boolean;
    }): TypedArray;
}
```

## Licence
_____
This code is released under the MIT license.
