import React, { useCallback, useImperativeHandle, useRef } from "react";
import { VXElementPropsWithoutRef, VXElementParams, VXObjectSettings } from "../types"
import { PerspectiveCamera, PerspectiveCameraProps, useHelper } from "@react-three/drei";
import { useVXObjectStore } from "../../managers/ObjectManager/stores/objectStore";
import { useCameraManagerAPI } from "../../managers/CameraManager/store"

import { invalidate, ThreeElements, useFrame } from "@react-three/fiber";
import { CameraHelper } from "three";

import * as THREE from "three"
import { vxengine } from "@vxengine/singleton";
import { TrackSideEffectCallback } from "@vxengine/AnimationEngine/types/engine";
import { withVX } from "../withVX";
import { useObjectSetting } from "@vxengine/managers/ObjectManager/stores/settingsStore";

declare module 'three' {
    interface PerspectiveCamera {
        localRotationZ?: number;
        mouseInterference?: number;
    }
}

export type VXElementPerspectiveCameraProps = VXElementPropsWithoutRef<PerspectiveCameraProps> & {
    ref?: React.RefObject<THREE.PerspectiveCamera>
};

const recalculatePerspectiveMatrixSideEffect:TrackSideEffectCallback = (animationEngine) => {
    animationEngine.cameraRequiresProjectionMatrixRecalculation = true;
}

const perspectiveCameraParams: VXElementParams = [
    {propertyPath: "localRotationZ", type: "number"},
    {propertyPath: "far", type: "number", sideEffect: recalculatePerspectiveMatrixSideEffect},
    {propertyPath: "near", type: "number", sideEffect: recalculatePerspectiveMatrixSideEffect},
    {propertyPath: "fov", type: "number", sideEffect: recalculatePerspectiveMatrixSideEffect},
    {propertyPath: "zoom", type: "number", sideEffect: recalculatePerspectiveMatrixSideEffect},
    {propertyPath: "focus", type: "number"},
    {propertyPath: "filmGauge", type: "number"}, 
    {propertyPath: "filmOffset", type: "number"}
]

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
    showHelper: { title: "show helper", storage: "localStorage", value: false},
}

const BasePerspectiveCamera = ({ref, ...props}) => {
    const cameraTargetRef = useVXObjectStore(state => state.objects["cameraTarget"]?.ref)

    const cameraUpdate = useCallback(() => {
        if (!ref.current || !cameraTargetRef) 
            return

        const camera: THREE.PerspectiveCamera = ref.current
        const targetPosition: THREE.Vector3 = cameraTargetRef.current.position

        // Make the camera look at the target
        camera.lookAt(targetPosition);
        const localRotationZ = camera?.localRotationZ || 0;
        // Rotate the camera around its local Z-axis (forward axis)
        camera.rotateZ(localRotationZ); 
    }, [ref, cameraTargetRef])

    useFrame(cameraUpdate)

    const isHelperEnabled = useObjectSetting("perspectiveCamera", "showHelper");

    const mode = useCameraManagerAPI(state => state.mode)
    const showHelper = mode === "free" && vxengine.isDevelopment && isHelperEnabled
    useHelper(ref, showHelper && CameraHelper)

    invalidate();

    return <PerspectiveCamera ref={ref} {...props} />
}

export const EditablePerspectiveCamera = withVX<ThreeElements["perspectiveCamera"] & { makeDefault?: boolean  }>(BasePerspectiveCamera, {
    type: "entity",
    vxkey: "perspectiveCamera",
    name: "Perspective Camera",
    icon: "PerspectiveCamera",
    settings: defaultSettings,
    disabledParams: ["rotation", "scale"],
    params: perspectiveCameraParams
})