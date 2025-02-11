import { AnimationEngine } from "./AnimationEngine/engine";

declare global {
  var __animationEngineInstance: AnimationEngine | undefined;
}

let animationEngineInstance: AnimationEngine | undefined;

// Only create the instance if we're in a browser environment.
if (typeof window !== "undefined") {
  if (!globalThis.__animationEngineInstance) {
    globalThis.__animationEngineInstance = new AnimationEngine();
  }
  animationEngineInstance = globalThis.__animationEngineInstance;
}

export default animationEngineInstance;