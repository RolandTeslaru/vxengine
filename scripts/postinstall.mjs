import { mkdir, readdir, copyFile } from 'fs/promises';
import { resolve, join } from 'path';

async function copyAssets() {
    console.log("Running VXEngine postinstall")
    const wasmSrc = resolve('dist/assets/wasm');
    const fontsSrc = resolve('dist/assets/fonts');
    const wasmDest = resolve('../../public/assets/wasm');
    const fontsDest = resolve('../../public/assets/fonts');

    try {
        // Ensure destination directories exist
        await mkdir(wasmDest, { recursive: true });
        await mkdir(fontsDest, { recursive: true });

        // Copy all files from the WASM directory
        const wasmFiles = await readdir(wasmSrc);
        await Promise.all(wasmFiles.map(file => 
            copyFile(join(wasmSrc, file), join(wasmDest, file))
        ));

        // Copy all files from the fonts directory
        const fontFiles = await readdir(fontsSrc);
        await Promise.all(fontFiles.map(file => 
            copyFile(join(fontsSrc, file), join(fontsDest, file))
        ));

        console.log('Assets copied successfully');
    } catch (error) {
        console.error('Error copying assets:', error);
    }
}

copyAssets();