import { create } from 'zustand';
import { AnimationEngine } from 'vxengine/AnimationEngine/engine';
import { EffectComposer } from 'three-stdlib';

interface VXEngineStoreState {
    onScreenTransform: boolean;
    setOnScreenTransform: (value: boolean) => void;
    mountEngineUI: boolean;
    setMountEngineUI: (value: boolean) => void;
    composer: EffectComposer | null;
    transformMode: "translate" | "scale" | "rotate";
    setTransformMode: (mode: "translate" | "scale" | "rotate") => void;
    animationEngine: AnimationEngine | null;
}

export const useVXEngineStore = create<VXEngineStoreState>((set, get) => ({
    onScreenTransform: false,
    setOnScreenTransform: (value: boolean) => set({ onScreenTransform: value }),
    mountEngineUI: false,
    setMountEngineUI: (value: boolean) => set({ mountEngineUI: value }),
    composer: null,
    transformMode: "translate",
    setTransformMode: (mode: "translate" | "scale" | "rotate") => set({ transformMode: mode }),
    animationEngine: new AnimationEngine(),
}));