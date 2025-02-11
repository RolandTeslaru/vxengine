import * as THREE from "three";
import { TrackSideEffectCallback } from "./types/engine";

export const defaultSideEffects: Record<string, TrackSideEffectCallback> = {
  "splineProgress": (animationEngine, vxkey, propertyPath, object3DRef: THREE.Object3D, newValue) => {
    const splineKey = `${vxkey}.spline`;
    const spline =animationEngine.splineService.getSpline(splineKey);

    const interpolatedPosition = spline.get_point(newValue / 100);
    object3DRef.position.set(
      interpolatedPosition.x,
      interpolatedPosition.y,
      interpolatedPosition.z
    )
  },
  "splineTension": (animationEngine, vxkey, propertyPath, object3DRef: THREE.Object3D, newValue) => {
    const splineKey = `${vxkey}.spline`;
    const wasm_spline = animationEngine.splineService.getSpline(splineKey);

    wasm_spline.change_tension(newValue);
  }
}