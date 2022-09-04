import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";


const config = [
  {
    input: "cache",
    output: {
      file: "build/compute.js",
      format: "cjs",
      sourcemap: true,
    },
    plugins: [
        resolve({
            extensions: [".js", ".ts"],
        }),
        commonjs(),
        typescript(),
    ],
  }
];
export default config;
