import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import JavaScriptObfuscator from 'webpack-obfuscator';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("WEBPACK DIR NAME ", __dirname)

export default {
    entry: {
        main: './src/index.tsx',
    },
    output: {
        filename: 'index.js',
        publicPath: '/',
        path: path.resolve('dist'),
        library: {
            type: 'module', // Outputs as an ES module
        },
        chunkFormat: 'module',
        globalObject: 'typeof self !== "undefined" ? self : this', // For self usage in modules
    },
    experiments: {
        asyncWebAssembly: true,
        outputModule: true, // Enable output as an ES module
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
        react: "react",
        'react-dom': "react-dom",
        'three': 'three',
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
    },
    module: {
        rules: [
            // Rule for handling global CSS (non-modular CSS files)
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader, // Extracts the CSS into separate files
                    'css-loader', // Converts CSS into CommonJS
                    {
                        loader: 'postcss-loader', // Applies PostCSS transformations (like Tailwind CSS)
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
                test: /\.s?css$/,
                oneOf: [
                    {
                        test: /\.module\.s?css$/,
                        use: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: "css-loader",
                                options: {
                                    esModule: false, // Add this line
                                    modules: {
                                        localIdentName: "[name]_[local]_[hash:base64:5]",
                                        exportLocalsConvention: "camelCase", // Optional, depending on your convention
                                    },
                                }
                            },
                            "sass-loader"
                        ]
                    },
                    {
                        use: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: 'css-loader',
                                options: {
                                    esModule: true, // Add this line
                                },
                            },
                            "sass-loader"
                        ]
                    }
                ]
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
    plugins: [
        new BundleAnalyzerPlugin(),
        new MiniCssExtractPlugin({
            filename: 'mini.css',  // Specify the filename for the extracted CSS
        }),
        // new JavaScriptObfuscator({
        //     rotateStringArray: true,
        //     stringArray: true,
        //     stringArrayThreshold: 0.75,
        // }, ['excluded_bundle.js']),
    ],

    optimization: {
        minimize: false,
        minimizer: [new TerserPlugin()],
    },
};