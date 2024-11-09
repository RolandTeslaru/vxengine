import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import JavaScriptObfuscator from 'webpack-obfuscator';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { merge } from 'webpack-merge';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("WEBPACK DIR NAME ", __dirname)

const baseConfig = { 
    entry: {
        main: './src/index.tsx',
    },
    resolve: {
        alias: {
            '@vxengine': path.resolve(__dirname, 'src'),  // Map "@" to the "src" directory
        },
        modules: [path.resolve(__dirname, 'src'), 'node_modules'],
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
    target: 'web',
    externals: {
        react: 'react',
        'react-dom': 'react-dom',
        three: 'three',
        '@react-three/fiber': '@react-three/fiber',
        '@react-three/drei': '@react-three/drei',
        '@react-three/postprocessing': '@react-three/postprocessing',
        'three-stdlib': 'three-stdlib',
        zustand: 'zustand',
        howler: 'howler',
        'framer-motion': 'framer-motion',
        immer: 'immer',
        'next-themes': 'next-themes',
        classnames: 'classnames',
        clsx: 'clsx',
        'tailwind-merge': 'tailwind-merge',
        tailwindcss: 'tailwindcss',
        lodash: 'lodash',
        baffle: 'baffle',
        scss: 'scss',
        postprocessing: 'postprocessing',
    },
    plugins: [
        new JavaScriptObfuscator({
            rotateStringArray: true,
            stringArray: true,
            stringArrayThreshold: 0.75,
        }, ['excluded_bundle.js']),
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, 'scripts'), to: path.resolve(__dirname, 'dist/scripts') }
            ]
        }),
    ],
    module: {
        rules: [
               {
                test: /\.css$/i,
                use: [
                    'style-loader', // Injects CSS into the DOM via <style> tags
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            esModule: true,
                        },
                    },
                    {
                        loader: 'postcss-loader', // Applies PostCSS transformations
                        options: {
                            postcssOptions: {
                                plugins: [
                                    'tailwindcss',
                                    'autoprefixer',
                                ],
                            },
                        },
                    },
                ],
            },
            {
                test: /\.module\.css$/i,
                use: [
                    'style-loader', // Injects CSS into the DOM via <style> tags
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: '[name]_[local]_[hash:base64:5]',
                                exportLocalsConvention: 'camelCase',
                            },
                            importLoaders: 1,
                            esModule: false,
                        },
                    },
                    {
                        loader: 'postcss-loader', // Applies PostCSS transformations
                        options: {
                            postcssOptions: {
                                plugins: [
                                    'tailwindcss',
                                    'autoprefixer',
                                ],
                            },
                        },
                    },
                ],
            },

           
            // Rule for handling SCSS/SASS files
            {
                test: /\.s[ac]ss$/i,
                exclude: /\.module\.s[ac]ss$/i, // Exclude SCSS Modules
                use: [
                    'style-loader', // Injects CSS into the DOM via <style> tags
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            esModule: true,
                        },
                    },
                    {
                        loader: 'postcss-loader', // Applies PostCSS transformations
                        options: {
                            postcssOptions: {
                                plugins: [
                                    'tailwindcss',
                                    'autoprefixer',
                                ],
                            },
                        },
                    },
                    'sass-loader', // Compiles Sass to CSS
                ],
            },

            // Rule for handling SCSS/SASS Modules
            {
                test: /\.module\.s[ac]ss$/i,
                use: [
                    'style-loader', // Injects CSS into the DOM via <style> tags
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: '[name]_[local]_[hash:base64:5]',
                                exportLocalsConvention: 'camelCase',
                            },
                            importLoaders: 2,
                            esModule: false,
                        },
                    },
                    {
                        loader: 'postcss-loader', // Applies PostCSS transformations
                        options: {
                            postcssOptions: {
                                plugins: [
                                    'tailwindcss',
                                    'autoprefixer',
                                ],
                            },
                        },
                    },
                    'sass-loader', // Compiles Sass to CSS
                ],
            },


            // Rule for TypeScript/TSX files
            {
                test: /\.(ts|tsx)$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },

            // Rule for JavaScript/JSX files
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react'],
                    },
                },
            },

            // Rule for handling WebAssembly files
            {
                test: /\.wasm$/,
                type: 'asset/resource', // For Webpack 5, handles .wasm files as assets
                generator: {
                    filename: 'assets/wasm/[name][ext]', // Save the WASM file in a specific folder in your output directory
                },
            },

            // Rule for handling font files
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                type: 'asset/resource', // Tells Webpack to handle font files as static assets
                generator: {
                    filename: 'assets/fonts/[name][ext]', // Places font files in the specified folder
                },
            },
        ],
    },
    optimization: {
        minimizer: [new TerserPlugin()],
    },
}

// ESM Build config
const esmConfig = merge(baseConfig, {
    output: {
        filename: 'index.esm.js',
        path: path.resolve('dist'),
        publicPath: '/',
        library: {
            type: 'module', // Outputs as an ES module
        },
    },
    experiments: {
        asyncWebAssembly: true,
        outputModule: true, // Enable output as an ES module
    },
    mode: 'production',
})

// CJS build config
const cjsConfig = merge(baseConfig, {
    output: {
        filename: 'index.cjs.js',
        path: path.resolve('dist'),
        publicPath: '',
        library: {
            type: 'commonjs2', // Outputs as a CommonJS module
        },
        globalObject: 'typeof self !== "undefined" ? self : this',
    },
    experiments: {
        asyncWebAssembly: true,
        outputModule: false,
    },
    mode: 'production',
})

export default [esmConfig, cjsConfig];

// export default {
//     entry: {
//         main: './src/index.tsx',
//     },
//     output: {
//         filename: 'index.js',
//         publicPath: '/',
//         path: path.resolve('dist'),
//         library: {
//             type: 'module', // Outputs as an ES module
//         },
//         chunkFormat: 'module',
//         globalObject: 'typeof self !== "undefined" ? self : this', // For self usage in modules
//     },
//     experiments: {
//         asyncWebAssembly: true,
//         outputModule: true, // Enable output as an ES module
//     },
//     resolve: {
//         alias: {
//             '@vxengine': path.resolve(__dirname, 'src'),  // Map "@" to the "src" directory
//         },
//         modules: [path.resolve(__dirname, 'src'), 'node_modules'],
//         extensions: ['.tsx', '.ts', '.jsx', '.js'],
//     },
//     target: 'web',
//     externals: {
//         react: "react",
//         'react-dom': "react-dom",
//         'three': 'three',
//         '@react-three/fiber': '@react-three/fiber',
//         '@react-three/drei': '@react-three/drei',
//         '@react-three/postprocessing': '@react-three/postprocessing',
//         'three-stdlib': 'three-stdlib',
//         zustand: 'zustand',
//         howler: 'howler',
//         'framer-motion': 'framer-motion',
//         immer: 'immer',
//         'next-themes': 'next-themes',
//         classnames: 'classnames',
//         clsx: 'clsx',
//         'tailwind-merge': 'tailwind-merge',
//         tailwindcss: 'tailwindcss',
//         lodash: 'lodash',
//         baffle: 'baffle',
//         scss: 'scss',

//     },
//     module: {
//         rules: [
//             // Rule for handling global CSS (non-modular CSS files)
//             {
//                 test: /\.css$/i,
//                 use: [
//                     'style-loader', // Injects CSS into the DOM via <style> tags
//                     {
//                         loader: 'css-loader',
//                         options: {
//                             importLoaders: 1,
//                             esModule: true,
//                         },
//                     },
//                     {
//                         loader: 'postcss-loader', // Applies PostCSS transformations
//                         options: {
//                             postcssOptions: {
//                                 plugins: [
//                                     'tailwindcss',
//                                     'autoprefixer',
//                                 ],
//                             },
//                         },
//                     },
//                 ],
//             },
//             {
//                 test: /\.module\.css$/i,
//                 use: [
//                     'style-loader', // Injects CSS into the DOM via <style> tags
//                     {
//                         loader: 'css-loader',
//                         options: {
//                             modules: {
//                                 localIdentName: '[name]_[local]_[hash:base64:5]',
//                                 exportLocalsConvention: 'camelCase',
//                             },
//                             importLoaders: 1,
//                             esModule: false,
//                         },
//                     },
//                     {
//                         loader: 'postcss-loader', // Applies PostCSS transformations
//                         options: {
//                             postcssOptions: {
//                                 plugins: [
//                                     'tailwindcss',
//                                     'autoprefixer',
//                                 ],
//                             },
//                         },
//                     },
//                 ],
//             },

           
//             // Rule for handling SCSS/SASS files
//             {
//                 test: /\.s[ac]ss$/i,
//                 exclude: /\.module\.s[ac]ss$/i, // Exclude SCSS Modules
//                 use: [
//                     'style-loader', // Injects CSS into the DOM via <style> tags
//                     {
//                         loader: 'css-loader',
//                         options: {
//                             importLoaders: 2,
//                             esModule: true,
//                         },
//                     },
//                     {
//                         loader: 'postcss-loader', // Applies PostCSS transformations
//                         options: {
//                             postcssOptions: {
//                                 plugins: [
//                                     'tailwindcss',
//                                     'autoprefixer',
//                                 ],
//                             },
//                         },
//                     },
//                     'sass-loader', // Compiles Sass to CSS
//                 ],
//             },

//             // Rule for handling SCSS/SASS Modules
//             {
//                 test: /\.module\.s[ac]ss$/i,
//                 use: [
//                     'style-loader', // Injects CSS into the DOM via <style> tags
//                     {
//                         loader: 'css-loader',
//                         options: {
//                             modules: {
//                                 localIdentName: '[name]_[local]_[hash:base64:5]',
//                                 exportLocalsConvention: 'camelCase',
//                             },
//                             importLoaders: 2,
//                             esModule: false,
//                         },
//                     },
//                     {
//                         loader: 'postcss-loader', // Applies PostCSS transformations
//                         options: {
//                             postcssOptions: {
//                                 plugins: [
//                                     'tailwindcss',
//                                     'autoprefixer',
//                                 ],
//                             },
//                         },
//                     },
//                     'sass-loader', // Compiles Sass to CSS
//                 ],
//             },


//             // Rule for TypeScript/TSX files
//             {
//                 test: /\.(ts|tsx)$/,
//                 use: 'ts-loader',
//                 exclude: /node_modules/,
//             },

//             // Rule for JavaScript/JSX files
//             {
//                 test: /\.(js|jsx)$/,
//                 exclude: /node_modules/,
//                 use: {
//                     loader: 'babel-loader',
//                     options: {
//                         presets: ['@babel/preset-react'],
//                     },
//                 },
//             },

//             // Rule for handling WebAssembly files
//             {
//                 test: /\.wasm$/,
//                 type: 'asset/resource', // For Webpack 5, handles .wasm files as assets
//             },

//             // Rule for handling font files
//             {
//                 test: /\.(woff|woff2|eot|ttf|otf)$/,
//                 type: 'asset/resource', // Tells Webpack to handle font files as static assets
//                 generator: {
//                     filename: 'assets/fonts/[name][ext]', // Places font files in the specified folder
//                 },
//             },
//         ],
//     },
//     plugins: [
//         // new JavaScriptObfuscator({
//         //     rotateStringArray: true,
//         //     stringArray: true,
//         //     stringArrayThreshold: 0.75,
//         // }, ['excluded_bundle.js']),
//     ],

//     optimization: {
//         minimize: false,
//         minimizer: [new TerserPlugin()],
//     },
// };