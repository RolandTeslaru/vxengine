// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { enableMapSet } from "immer";
import { setAutoFreeze } from "immer";

import "./globals.css"
import VXThreeElementWrapper from "./vxobject/VXThreeElementWrapper";
enableMapSet();

export { VXEngineProvider } from "./engine"
export { useVXEngine } from "./engine"

export { VXRenderer, VXStudio } from "./core"
export { vx } from "./vxobject"

export { useAnimationEngineAPI } from "./AnimationEngine/store"

export { useCameraManagerAPI } from "./managers/CameraManager"
export { useVXObjectStore } from "./managers/ObjectManager/stores/objectStore"

export { useAnimationEngineEvent} from "./AnimationEngine"
export { useAnimationFrame } from "./AnimationEngine"

export { VXEngineWindow } from "./core/components/VXEngineWindow"

export { VXThreeElementWrapper}