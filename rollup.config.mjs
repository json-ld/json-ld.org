import commonjs from "@rollup/plugin-commonjs"
import {nodeResolve} from "@rollup/plugin-node-resolve"
export default {
  input: "./playground/next/editor.mjs",
  output: {
    file: "./playground/next/editor.bundle.js",
    format: "iife"
  },
  plugins: [
    nodeResolve({browser: true}),
    commonjs()
  ]
}
