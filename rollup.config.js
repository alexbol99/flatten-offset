import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: 'index.js',
    output: [
        {
            file: 'dist/main.cjs.js',
            format: 'cjs',
            exports: 'named'
        },
        {
            file: 'dist/main.esm.js',
            format: 'esm',
            exports: 'named'
        },
        {
            file: 'dist/main.umd.js',
            format: 'umd',
            name: 'polygon-offset',
            exports: 'named',
            globals: {"@flatten-js/core": "Flatten"}
        },
    ],
    plugins: [nodeResolve()],
    external: ['@flatten-js/core']
};
