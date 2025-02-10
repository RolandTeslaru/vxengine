import { AnimationEngine } from "./AnimationEngine/engine";

declare global {
    var __animationEngineInstance: AnimationEngine | undefined;
}

// If the global instance doesn't exist, create it.
if (!globalThis.__animationEngineInstance) {
    globalThis.__animationEngineInstance = new AnimationEngine();
}

// Export the singleton instance.
const animationEngineInstance = globalThis.__animationEngineInstance;

export default animationEngineInstance;