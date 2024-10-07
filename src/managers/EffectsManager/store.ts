import { useRef } from "react";
import { EffectComposer } from "three-stdlib";
import { create } from "zustand";

interface EffectsManagerAPIProps {
    selectedEffect: any,
    setSelectedEffect: (effect: any) => void
}

export const useEffectsManagerAPI = create<EffectsManagerAPIProps>((set, get) => ({
    selectedEffect: null,
    setSelectedEffect: (effect) => set({ selectedEffect: effect }),
    composer: useRef<EffectComposer | null>(null),
}))