
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require('@vue/cli-service')

const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const webpack = require("webpack");
module.exports = defineConfig({
    publicPath: '/vpm',
    transpileDependencies: true,
    configureWebpack: {
        experiments: {
            asyncWebAssembly: true,
        },
    },
    chainWebpack: (config) => {
        // rust wasm bindgen https://github.com/rustwasm/wasm-bindgen
        config
            .plugin("wasm-pack")
            .use(WasmPackPlugin)
            .init(
                (Plugin) =>
                    new Plugin({
                        crateDirectory: path.resolve(__dirname, "../rust/wasm"),
                        outDir: path.resolve(__dirname, "./src/pkg"),
                        forceMode: "development",
                        // forceMode: "production",
                    })
            )
            .end()
            //  needed for Edge browser https://rustwasm.github.io/docs/wasm-bindgen/examples/hello-world.html
            .plugin("text-encoder")
            .use(webpack.ProvidePlugin)
            .init(
                (Plugin) =>
                    new Plugin({
                        TextDecoder: ["text-encoding", "TextDecoder"],
                        TextEncoder: ["text-encoding", "TextEncoder"],
                    })
            )
            .end();
        config.module.rule("js").exclude.add(/\.worker\.js$/);
        config.module
            .rule("worker")
            .test(/\.worker\.js$/)
            .use("worker-loader")
            .loader("worker-loader")
            .end();
        config.plugin('define').tap((definitions) => {
            Object.assign(definitions[0], {
                __VUE_OPTIONS_API__: 'true',
                __VUE_PROD_DEVTOOLS__: 'false',
                __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
            })
            return definitions
        })
    },
})
