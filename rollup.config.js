import typescript from "@rollup/plugin-typescript";
import css from "rollup-plugin-import-css";

export default [
    {
        input: "src/index.ts",
        output: {file: "dist/index.js", format: "cjs", sourcemap: true},
        plugins: [css(), typescript()]
    },
    {
        input: "node_modules/react-grid-layout/css/styles.css",
        output: {
            file: "dist/rgl.min.css"
        },
        plugins: [css({minify: true, output: "dist/rgl.min.css"})]
    },
    {
        input: "node_modules/react-resizable/css/styles.css",
        output: {
            file: "dist/rszbl.min.css"
        },
        plugins: [css({minify: true, output: "dist/rszbl.min.css"})]
    }
];