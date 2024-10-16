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
            {
                test: /\.scss$/, use: [
                    { loader: "style-loader" },  // to inject the result into the DOM as a style block
                    { loader: "css-modules-typescript-loader" },  // to generate a .d.ts module next to the .scss file (also requires a declaration.d.ts with "declare modules '*.scss';" in it to tell TypeScript that "import styles from './styles.scss';" means to load the module "./styles.scss.d.td")
                    { loader: "css-loader", options: { modules: true } },  // to convert the resulting CSS to Javascript to be bundled (modules:true to rename CSS classes in output to cryptic identifiers, except if wrapped in a :global(...) pseudo class)
                    { loader: "sass-loader" },  // to convert SASS to CSS
                    // NOTE: The first build after adding/removing/renaming CSS classes fails, since the newly generated .d.ts typescript module is picked up only later
                ]
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
            {
                test: /\.wasm$/,
                type: 'asset/resource', // For Webpack 5
            }
        ],
    },
    optimization: {
        minimize: false,
        minimizer: [new TerserPlugin()],
    }
    // plugins: [
    //     new JavaScriptObfuscator({
    //         rotateStringArray: true,
    //         stringArray: true,
    //         stringArrayThreshold: 0.75,
    //     }, ['excluded_bundle.js']),
    // ],
};