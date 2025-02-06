import { TrackSideEffectCallback } from "./types/track";
import * as THREE from "three";

export const defaultSideEffects: Record<string, TrackSideEffectCallback> = {
  "splineProgress": (animationEngine, vxkey, propertyPath, object3DRef: THREE.Object3D, newValue) => {
    const splineKey = `${vxkey}.spline`;
    const spline = animationEngine.getSpline(splineKey);

    console.log("Spline Progress SideEffect New value ", newValue)

    const interpolatedPosition = spline.get_point(newValue);
    object3DRef.position.set(
      interpolatedPosition.x,
      interpolatedPosition.y,
      interpolatedPosition.z
    )
  }
}