import { create } from 'zustand';
import { AnimationEngine } from 'vxengine/AnimationEngine/engine';
import { EffectComposer } from 'three-stdlib';

interface VXEngineStoreState {
    onScreenTransform: boolean;
    setOnScreenTransform: (value: boolean) => void;
    mountEngineUI: boolean;
    setMountEngineUI: (value: boolean) => void;
    composer: EffectComposer | null;
    animationEngine: AnimationEngine | null;
}

export const useVXEngineStore = create<VXEngineStoreState>((set, get) => ({
    onScreenTransform: false,
    setOnScreenTransform: (value: boolean) => set({ onScreenTransform: value }),
    mountEngineUI: false,
    setMountEngineUI: (value: boolean) => set({ mountEngineUI: value }),
    composer: null,
    animationEngine: new AnimationEngine(),
}));