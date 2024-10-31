import { EffectComposer } from "three-stdlib";
import { AnimationEngine } from "@vxengine/AnimationEngine/engine";

export interface EngineContextProps {
    mountCoreUI: boolean
    composer: React.MutableRefObject<EffectComposer | null>;
    animationEngine: AnimationEngine;
}

export interface VXEngineProviderProps {
    children: React.ReactNode;
    mount?: boolean;
    animations_json: any;
}

export interface VXEngineStoreProps {
    mountCoreRenderer: boolean;
    setMountCoreRenderer: (value: boolean) => void;

    composer: React.MutableRefObject<EffectComposer | null>;
    animationEngine: AnimationEngine | null;
  }