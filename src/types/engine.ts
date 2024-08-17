import { EffectComposer } from "three-stdlib";

export interface EngineContextProps {
    onScreenTransform: boolean
    setOnScreenTransform: (value: boolean) => void
    mountEngineUI: boolean
    composer: React.MutableRefObject<EffectComposer | null>;
    transformMode: "translate" | "rotate" | "scale"
    setTransformMode: (value: "translate" | "rotate" | "scale") => void
}
