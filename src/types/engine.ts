import { EffectComposer } from "three-stdlib";
import { AnimationEngine } from "@vxengine/AnimationEngine/engine";
import { ThreeElements } from "@react-three/fiber";
import { Scene } from "three";
import { ITimeline } from "@vxengine/AnimationEngine/types/track";

export interface EngineContextProps {
    mountCoreUI: boolean
    composer: React.MutableRefObject<EffectComposer | null>;
    animationEngine: AnimationEngine;
}

export interface VXEngineProviderProps {
    children: React.ReactNode;
    mount?: boolean;
    projectName: string
    animations_json: DiskProjectProps;
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

export interface DiskProjectProps {
    projectName: string
    timelines: Record<string, ITimeline>
}