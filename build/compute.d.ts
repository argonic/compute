declare module "compute" {
    export type TypedArray = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Float32Array;
    export type TypedArrayConstructor = Int8ArrayConstructor | Int16ArrayConstructor | Int32ArrayConstructor | Uint8ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor;
    type AccessType = "value" | "coords" | "index_access" | "coords_access" | "index_to_coords" | "coords_to_index";
    export type Vector<C extends number> = C extends 1 ? {
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
    type IMethodName<T extends string, A extends AccessType> = A extends "value" ? `$${T}` : A extends "coords" ? `$${T}_coords` : A extends "index_access" ? `$$${T}_index` : A extends "coords_access" ? `$$${T}_access` : A extends "index_to_coords" ? `$$$${T}_coords` : A extends "coords_to_index" ? `$$$${T}_index` : never;
    type IMethodValue<A extends AccessType, C extends number> = A extends "value" ? number : A extends "coords" ? Vector<C> : A extends "index_access" ? (index: number) => number : A extends "coords_access" ? (vector: Vector<C>) => number : A extends "index_to_coords" ? (vector: number) => Vector<C> : A extends "coords_to_index" ? (vector: Vector<C>) => number : never;
    type IMethods<T extends string = string, C extends number = number> = {
        [P in AccessType as IMethodName<T, P>]: IMethodValue<P, C>;
    };
    type V = Vector<1> | Vector<2> | Vector<3> | Vector<4> | Vector<5> | Vector<6> | Vector<7> | Vector<number>;
    type Primitive = number | Function | V;
    type FlattenPairs<T> = {
        [K in keyof T]: T[K] extends Primitive ? [K, T[K]] : FlattenPairs<T[K]>;
    }[keyof T] & [PropertyKey, Primitive];
    type Flatten<T> = {
        [P in FlattenPairs<T> as P[0]]: P[1];
    };
    type IMethodsMap<T extends {
        readonly [s: string]: number;
    }> = Flatten<{
        [P in keyof T]: IMethods<P, T[P]>;
    }>;
    export function logShaderSourceAndInfoLog(shaderSource: string, shaderInfoLog: string): void;
    export default class Compute {
        static tensor(type: TypedArray | TypedArrayConstructor, shape: number[]): {
            constructor: TypedArrayConstructor;
            typed: "float" | "int8" | "uint8" | "int16" | "uint16" | "int32" | "uint31";
            native: "float" | "int" | "uint";
            precision: "high" | "low" | "medium";
            shader: "float" | "int";
            rank: number;
            bytes: number;
            shape: number[];
            length: number;
            width: number;
            height: number;
            strides: number[];
        };
        code: string;
        private context;
        private program;
        private vertex;
        private fragment;
        private textures;
        private shapes;
        private values;
        private result;
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
        gpu(): any;
        cpu(): Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array;
        private compile;
        private closure;
        private parse;
    }
    export type TensorMetadata = ReturnType<typeof Compute["tensor"]>;
}
