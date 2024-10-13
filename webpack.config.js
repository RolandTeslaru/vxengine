import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import JavaScriptObfuscator from 'webpack-obfuscator';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("WEBPACK DIR NAME ", __dirname)

export default {
    entry: {
        main: './src/index.ts', 
    },
    output: {
        filename: 'index.js',
        path: path.resolve('dist'),
        library: 'vxengine',
        libraryTarget: 'umd',
    },
    resolve: {
        alias: {
            '@vxengine': path.resolve(__dirname, 'src'),  // Map "@" to the "src" directory
        },
        modules: [path.resolve(__dirname, 'src'), 'node_modules'],
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
    externals: {
        'three': 'THREE', // Externalize Three.js
        'three-stdlib': 'THREE', // Externalize Three.js stdlib
        '@react-three/fiber': 'ReactThreeFiber', // Externalize React Three Fiber
        '@react-three/drei': 'ReactThreeDrei',  // Externalize Drei helpers
        '@react-three/postprocessing': 'ReactThreePostProcessing' // Externalize post-processing tools
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    process.env.NODE_ENV !== 'production'
                        ? 'style-loader' // Injects styles into DOM
                        : MiniCssExtractPlugin.loader, // Extracts CSS into files (production)
                    'css-loader', // Resolves CSS imports
                    'sass-loader' // Compiles Sass to CSS
                ],
            },
            {
                test: /\.(ts|tsx)$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
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
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    plugins: [
        new JavaScriptObfuscator({
            rotateStringArray: true,
            stringArray: true,
            stringArrayThreshold: 0.75,
        }, ['excluded_bundle.js']),
    ],
};