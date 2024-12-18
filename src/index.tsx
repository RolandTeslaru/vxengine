// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import "./globals.css";
import { enableMapSet } from "immer";

enableMapSet();

export { VXEngineProvider } from "./engine"
export { useVXEngine } from "./engine"

export { VXEngineCoreRenderer, VXEngineCoreUI } from "./core"
export { vx } from "./vxobject"

export { useAnimationEngineAPI } from "./AnimationEngine/store"

export { useCameraManagerAPI } from "./managers/CameraManager"
export { useVXObjectStore } from "./managers/ObjectManager/stores/objectStore"

export { useAnimationEngineEvent} from "./AnimationEngine"
export { useAnimationFrame } from "./AnimationEngine"

export { VXEngineWindow } from "./components/ui/VXEngineWindow"

