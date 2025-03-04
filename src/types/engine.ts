import { EffectComposer } from "three-stdlib";
import { AnimationEngine } from "@vxengine/AnimationEngine/engine";

export interface EngineContextProps {
    mountCoreUI: boolean
    composer: React.RefObject<EffectComposer | null>;
    animationEngine: AnimationEngine;
}

export interface VXEngineProviderProps {
    children: React.ReactNode;
    mount?: boolean;
    projectName: string
    animations_json: any;
    autoWriteToDisk?: boolean
    nodeEnv: 'development' | 'production' | 'test';
}

export interface VXEngineStoreProps {
    mountCoreRenderer: boolean;
    setMountCoreRenderer: (value: boolean) => void;

    composer: React.RefObject<EffectComposer | null>;

    IS_DEVELOPMENT: boolean;
    IS_PRODUCTION: boolean;
}

