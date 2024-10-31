// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { create } from 'zustand';
import { AnimationEngine } from '@vxengine/AnimationEngine/engine';
import { EffectComposer } from 'three-stdlib';

interface VXEngineStoreState {
    onScreenTransform: boolean;
    setOnScreenTransform: (value: boolean) => void;
    mountCoreUI: boolean;
    setMountCoreUI: (value: boolean) => void;
    composer: EffectComposer | null;
    animationEngine: AnimationEngine | null;
}

export const useVXEngineStore = create<VXEngineStoreState>((set, get) => ({
    onScreenTransform: false,
    setOnScreenTransform: (value: boolean) => set({ onScreenTransform: value }),
    mountCoreUI: true,
    setMountCoreUI: (value: boolean) => set({ mountCoreUI: value }),
    composer: null,
    animationEngine: new AnimationEngine(),
}));