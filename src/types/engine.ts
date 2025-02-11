import { EffectComposer } from "three-stdlib";
import { AnimationEngine } from "@vxengine/AnimationEngine/engine";
import { RawProject } from "./data/rawData";

export interface EngineContextProps {
    mountCoreUI: boolean
    composer: React.MutableRefObject<EffectComposer | null>;
    animationEngine: AnimationEngine;
}

export interface VXEngineProviderProps {
    children: React.ReactNode;
    mount?: boolean;
    projectName: string
    animations_json: RawProject;
    autoWriteToDisk?: boolean
    nodeEnv: 'development' | 'production' | 'test';
}

export interface VXEngineStoreProps {
    mountCoreRenderer: boolean;
    setMountCoreRenderer: (value: boolean) => void;

    composer: React.MutableRefObject<EffectComposer | null>;

    IS_DEVELOPMENT: boolean;
    IS_PRODUCTION: boolean;
}

