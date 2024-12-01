import { EffectComposer } from "three-stdlib";
import { AnimationEngine } from "@vxengine/AnimationEngine/engine";
import { ThreeElements } from "@react-three/fiber";
import { Scene } from "three";

export interface EngineContextProps {
    mountCoreUI: boolean
    composer: React.MutableRefObject<EffectComposer | null>;
    animationEngine: AnimationEngine;
}

export interface VXEngineProviderProps {
    children: React.ReactNode;
    mount?: boolean;
    scene: Scene;
    animations_json: any;
    nodeEnv: 'development' | 'production' | 'test';
}

export interface VXEngineStoreProps {
    mountCoreRenderer: boolean;
    setMountCoreRenderer: (value: boolean) => void;

    composer: React.MutableRefObject<EffectComposer | null>;
    animationEngine: AnimationEngine | null;

    IS_DEVELOPMENT: boolean;
    IS_PRODUCTION: boolean;
  }