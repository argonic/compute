export declare type TypedArray = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Float32Array;
export declare type TypedArrayConstructor = Int8ArrayConstructor | Int16ArrayConstructor | Int32ArrayConstructor | Uint8ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor;
declare type AccessType = "value" | "coords" | "index_access" | "coords_access" | "index_to_coords" | "coords_to_index";
export declare type Vector<C extends number> = C extends 1 ? {
    x: number;
} : C extends 2 ? {
    x: number;
    y: number;
} : C extends 3 ? {
    x: number;
    y: number;
    z: number;
} : C extends 4 ? {
    x: number;
    y: number;
    z: number;
    w: number;
} : C extends 5 ? {
    x: number;
    y: number;
    z: number;
    w: number;
    i: number;
} : C extends 6 ? {
    x: number;
    y: number;
    z: number;
    w: number;
    i: number;
    i1: number;
} : C extends 7 ? {
    x: number;
    y: number;
    z: number;
    w: number;
    i: number;
    i1: number;
    i2: number;
    i3: number;
} : {
    x: number;
    y: number;
    z: number;
    w: number;
    i: number;
    i1: number;
    i2: number;
    i3: number;
};
declare type IMethodName<T extends string, A extends AccessType> = A extends "value" ? `$${T}` : A extends "coords" ? `$${T}__coords` : A extends "index_access" ? `$${T}__access_index` : A extends "coords_access" ? `$${T}__access_coords` : A extends "index_to_coords" ? `$${T}__index_coords` : A extends "coords_to_index" ? `$${T}__coords_index` : never;
declare type IMethodValue<A extends AccessType, C extends number> = A extends "value" ? number : A extends "coords" ? Vector<C> : A extends "index_access" ? (index: number) => number : A extends "coords_access" ? (vector: Vector<C>) => number : A extends "index_to_coords" ? (vector: number) => Vector<C> : A extends "coords_to_index" ? (vector: Vector<C>) => number : never;
declare type IMethods<T extends string = string, C extends number = number> = {
    [P in AccessType as IMethodName<T, P>]: IMethodValue<P, C>;
};
declare type V = Vector<1> | Vector<2> | Vector<3> | Vector<4> | Vector<5> | Vector<6> | Vector<7> | Vector<number>;
declare type Primitive = number | Function | V;
declare type FlattenPairs<T> = {
    [K in keyof T]: T[K] extends Primitive ? [K, T[K]] : FlattenPairs<T[K]>;
}[keyof T] & [PropertyKey, Primitive];
declare type Flatten<T> = {
    [P in FlattenPairs<T> as P[0]]: P[1];
};
declare type IMethodsMap<T extends {
    [s: string]: number;
}> = Flatten<{
    [P in keyof T]: IMethods<P, T[P]>;
}>;
export declare function logShaderSourceAndInfoLog(shaderSource: string, shaderInfoLog: string): void;
declare type IOutput = [type: TypedArray | TypedArrayConstructor] | [shape: number | number[]] | [type: TypedArray | TypedArrayConstructor, shape: number | number[]];
declare type IInput = [name: string, type: TypedArray | TypedArrayConstructor] | [name: string, shape: number | number[]] | [name: string, type: TypedArray | TypedArrayConstructor, shape: number | number[]] | [name: string, shape: number | number[], type: TypedArray | TypedArrayConstructor];
export default class Compute {
    static Transpile(string: TemplateStringsArray): Compute;
    static transpile(code: string): Compute;
    static tensor(type: TypedArray | TypedArrayConstructor, shape: number[]): {
        constructor: TypedArrayConstructor;
        typed: "float" | "int8" | "uint8" | "int16" | "uint16" | "int32" | "uint31";
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
    private code;
    private context;
    private program;
    private vertex;
    private fragment;
    private textures;
    private functions;
    private ranks;
    private values;
    private result;
    function(name: string, result: string, code: string): this;
    output(...args: IOutput): this;
    input(...args: IInput): this;
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
    private run_gpu;
    private run_cpu;
    private compile;
    private closure;
    private parse;
}
export declare type TensorMetadata = ReturnType<typeof Compute["tensor"]>;
export {};
