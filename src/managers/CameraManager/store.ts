// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { create } from "zustand";

interface CameraManagerAPIProps {
    mode: "attached" | "free",
    setMode: (newMode: "attached" | "free") => void,
}

export const useCameraManagerAPI = create<CameraManagerAPIProps>((set, get) => ({
    mode: "attached",
    setMode: (newMode) => set({mode: newMode })
}))