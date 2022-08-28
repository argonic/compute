# Compute.js

[![Build Status](https://travis-ci.org/argonic/compute.svg?branch=master)](https://travis-ci.org/argonic/compute) [![codecov](https://codecov.io/gh/argonic/compute/branch/master/graph/badge.svg)](https://codecov.io/gh/argonic/compute)  [![npm (scoped)](https://img.shields.io/npm/v/@argonic/compute.svg)](https://www.npmjs.com/package/@argonic/compute)  ![DUB](https://img.shields.io/dub/l/vibe-d.svg)   [![Prettier code style](https://img.shields.io/badge/code%20style-prettier-ff69b4.svg)](https://github.com/argonic/compute) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![Github All Releases](https://img.shields.io/github/downloads/argonic/compute/total.svg)]() [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/esta/issues)

### About the author
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
1. [Methods](#methods)
1. [Tensor-metadata](#tensor-metadata)
1. [API](#api)
1. [License](#license)
### Introduction
Compute.js is an open-source hardware accelerated Typescript library for tensor computation, it supports GPGPU (General purpose computing on GPUs) with fallback to regular javascript.

Compute.js allows you to parallelize computation on GPU and expose current thread tensor value and a bunch of helper methods, It also automaticallly computes tensor's metadata such as rank, stride, bytes length and texture matrix.

### Tensors
Tensors are multidimensional vector spaces that maps in a (multi-)linear manner to vectors, scalars, and other tensors to a resulting tensor.

### Features
- Zero dependency codebase
- Extermely lightweight, under 1000LOC 
- Compute tensor's metadata
- Parallelize output computations on GPU
- Efficient input compaction
- Fallback to CPU computation
- GPU kernel precompilation
- Smartly fallback to CPU if data size threshold is faster on CPU
- Expose current tensor value both on CPU and GPU backends
- Expose helper accessors both on CPU and GPU backends

### How does it work
Compute.js parallelize the work on gpu according the expected output shape.

A `thread` variable is exposed on both CPU and GPU compute programs, which refers to the current output index which is within `0` and `output.length - 1`.

We also expose input interpolates for every input on both CPU and GPU programs so you can write your custom logic.

### Installation
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
### Get started
Construct a Compute instance
```typescript
const instance = new Compute();
```
Define an input shape

You may add as many inputs as you want
```typescript
instance.shape("input", Uint8Array, 2, 5, 3); // this creates a tensor name "input" with a shape of [3, 5, 3] using an Uint8Array
```
Define the output shape
```typescript
instance.output(Uint8Array, 2, 5, 3); // this defines the output tensor with a shape of [3, 5, 3] using an Uint8Array
```
Define the CPU fallback compute function
```typescript
instance.fallback<{ readonly input: 3 }>(({ $input }) => {
    return $input;
});
```
Define the GPU fallback compute function
```typescript
instance.compute(`return float($input);`);
```
Supply the input values

input values is an object that maps name inputs to TypeArray
```typescript
const input = new Uint8Array(5 * 3 * 2).map((_, i) =>
    Math.floor(Math.random() * 100)
);
instance.inputs({ input });
```
Execute the computation
```typescript
const output = instance.run(); // output would be the same as input

```

### Example
```typescript
const input = new Uint8Array(5 * 3 * 2).map((_, i) =>
    Math.floor(Math.random() * 100)
);
const backend = new Backend();
const result = backend
    .shape("input", Uint8Array, 5, 3, 2)
    .output(Float32Array, 5, 3, 2)
    .fallback<{ readonly input: 3 }>(({ $input }) => {
    return $input;
    })
    .compute(`return float($input);`)
    .inputs({ input })
    .run("cpu"); // would return a Float32Array with the same values from input
```

### Input interpolates
| Interpolate | Explanation | Type |
|-----|----|----|
| $NAME | get value on current thread | `Int` or `Float` (Value) |
| $NAME_coords | get coordinates on current thread | `Vector` |
| $$NAME_index | input accessor helper using array index | `(index) => Value` |
| $$NAME_coords | input accessor helper using coordinates | `(coords) => Value` |
| $$$NAME_index | coordinates to index helper | `(coords) => Int` |
| $$$NAME_coords | index to coordinates helper | `(index) => Vector` |
### Methods
#### `Backend.prototype.shape`
____
###### `Backend.prototype.shape(name: string, type: TypedArray | TypedArrayConstructor, ...shape: number[]): Backend;`
Defines a input named `input` with a type `TypedArrayConstructor` with a shape of `shape`

* `name`: input name must be a compatible GLSL variable name.
* `type`: a typed array or a typed array constructor.
* `shape`: a 1D array of dimensions shapes

`return`: *this* object.

#### `Backend.prototype.output`
____
###### `Backend.prototype.output(type: TypedArray | TypedArrayConstructor, ...shape: number[]): Backend;`
Defines the output a type `TypedArrayConstructor` with a shape of `shape`

* `type`: a typed array or a typed array constructor.
* `shape`: a 1D array of dimensions shapes

`return`: *this* object.

#### `Backend.prototype.compute`
____
###### `Backend.prototype.compute(syntax: string): Backend;`
Defines the GLSL compute shader of the current thread

This shader must return a `float` if you were expecting a Float32Array output and must return an `int` value if otherwise.

* `syntax`: the compute shader syntax, interpolates *that starts with a dollar sign will be replaced automatically*

`return`: *this* object.
#### `Backend.prototype.compute`

____
###### `Backend.prototype.compute(syntax: string): Backend;`
Defines the GLSL compute shader of the current thread

This shader must return a `float` if you were expecting a Float32Array output and must return an `int` value if otherwise.

* `syntax`: the compute shader syntax, interpolates *that starts with a dollar sign will be replaced automatically*

`return`: *this* object.

____
###### `Backend.prototype.inputs(inputs: {[s: string]: TypedArray}): Backend;`
Supply the inputs map of `TypedArray`s

The keys of this map must match all expected inputs

* `inputs`: a map of `TypedArray`s

`return`: *this* object.

____
###### `Backend.prototype.run({runtime = "fastest", threshold = 4096 : { runtime?: "gpu" | "cpu" | "fallback" | "fastest"; threshold?: number; } = {}): TypedArray;`
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

____
###### `Backend.prototype.gpu(): TypedArray;`
Execute the compute kernel on the GPU exclusively and returns a TypedArray

`return`: TypedArray.

____
###### `Backend.prototype.cpu(): TypedArray;`
Execute the compute kernel on the CPU exclusively and returns a TypedArray

`return`: TypedArray.


```typescript
const tensor = new Tensor(Float64Array, 10)
tensor.fill(0); // fill with zeros
tensor.fill(Math.random); // fill with random values
```
### Tensor metadata
A call with `Compute.tensor(type: Float32, [2, 3, 5])` would compute the following values :
1. `rank`: number of dimensions
2. `shape`: depth of each dimension
3. `strides`: each dimension stride
4. `length`: total elements in tensor
5. `width`: tensor 2D width
6. `height`: tensor 2D width
7. `bytes`: bytes per element, `4` for floats, `2` for 16 bit numbers and `1` for 8 bits numbers

### API
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
export default class Compute {
    static tensor(type: TypedArray | TypedArrayConstructor, shape: number[]): TensorMetadata;
    output(type: TypedArray | TypedArrayConstructor, ...shape: number[]): this;
    shape(name: string, type: TypedArray | TypedArrayConstructor, ...shape: number[]): this;
    fallback<T extends {
        readonly [s: string]: number;
    } = {}>(closure: (map: IMethodsMap<T> & {
        thread: number;
    }) => number): this;
    compute(code: string): this;
    inputs(inputs: {
        [s: string]: TypedArray;
    }): this;
    run({ runtime, threshold, }?: {
        runtime?: "gpu" | "cpu" | "fallback" | "fastest";
        threshold?: number;
    }): any;
    gpu(): TypedArray;
    cpu(): TypedArray;
}
```

### Licence
_____
This code is released under the MIT license.
