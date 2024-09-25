// In vxengine code
import wasmModuleUrl from '../../build/release.wasm';

export async function loadWasmModule() {
    try {  
      const response = await fetch(wasmModuleUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${wasmModuleUrl}: ${response.statusText}`);
      }
  
      const module = await WebAssembly.compileStreaming(response);
      const instance = await WebAssembly.instantiate(module);
  
      // Use the WebAssembly instance
      return instance;
    } catch (error) {
      console.error('Error loading WebAssembly module:', error);
      throw error;
    }
  }
  //# sourceMappingURL=../../build/release.wasm.map