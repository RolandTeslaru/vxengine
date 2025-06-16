import { EffectComposer } from "three-stdlib";
import { AnimationEngine } from "@vxengine/AnimationEngine/engine";

export interface EngineContextProps {
    mountCoreUI: boolean
    composer: React.RefObject<EffectComposer | null>;
    animationEngine: AnimationEngine;
}

export interface VXEngineProviderProps {
    children: React.ReactNode;
}

export interface VXEngineStoreProps {
    mountCoreRenderer: boolean;
    setMountCoreRenderer: (value: boolean) => void;

    composer: React.RefObject<EffectComposer | null>;
}

