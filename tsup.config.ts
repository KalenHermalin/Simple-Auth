import { defineConfig } from "tsup";

export default defineConfig({
    format: ['cjs', 'esm'],
    entry: {
        index: './lib/index.ts',
        types: './lib/types.ts',
        'providers/index': './lib/providers/index.ts'
    },
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true,
});