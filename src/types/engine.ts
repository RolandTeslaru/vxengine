import { EffectComposer } from "three-stdlib";
import { AnimationEngine } from "vxengine/AnimationEngine/engine";

export interface EngineContextProps {
    onScreenTransform: boolean
    setOnScreenTransform: (value: boolean) => void
    mountEngineUI: boolean
    composer: React.MutableRefObject<EffectComposer | null>;
    animationEngine: AnimationEngine;
}

export interface VXEngineProviderProps {
    children: React.ReactNode;
    mount?: boolean;
    animations_json: any;
}