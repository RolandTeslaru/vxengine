import React, { memo, forwardRef, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { EditableObjectProps, VXObjectParams, VXObjectSettings } from "../types"
import VXEntityWrapper from "../entityWrapper";
import { PerspectiveCamera, useHelper } from "@react-three/drei";
import { useVXObjectStore } from "../../managers/ObjectManager/stores/objectStore";
import { useCameraManagerAPI } from "../../managers/CameraManager/store"

import { PerspectiveCameraProps, useFrame } from "@react-three/fiber";
import { CameraHelper } from "three";

import * as THREE from "three"
import { useVXEngine } from "@vxengine/engine";
import { TrackSideEffectCallback } from "@vxengine/AnimationEngine/types/engine";

declare module 'three' {
    interface PerspectiveCamera {
        localRotationZ?: number;
        mouseInterference?: number;
    }
}

export type EditablePerspectiveCameraProps = EditableObjectProps<PerspectiveCameraProps> & {
    ref?: React.Ref<typeof PerspectiveCamera>;
    settings?: {}
};

const recalculatePerspectiveMatrixSideEffect:TrackSideEffectCallback = (animationEngine) => {
    animationEngine.cameraRequiresProjectionMatrixRecalculation = true;
}

const perspectiveCameraParams: VXObjectParams = [
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
}

export const EditablePerspectiveCamera = memo(forwardRef<typeof PerspectiveCamera, EditablePerspectiveCameraProps>((props, ref) => {
    const { settings = {}, ...rest } = props;
    const vxkey = rest.vxkey;
    const cameraRef = useRef(null)

    const cameraTargetRef = useVXObjectStore(state => state.objects["cameraTarget"]?.ref.current)

    const { IS_DEVELOPMENT } = useVXEngine();

    const cameraUpdate = () => {
        if (!cameraRef.current || !cameraTargetRef) return

        const camera: THREE.PerspectiveCamera = cameraRef.current
        const targetPosition: THREE.Vector3 = cameraTargetRef.position

        // Make the camera look at the target
        camera.lookAt(targetPosition);

        const localRotationZ = camera?.localRotationZ || 0;
        // Rotate the camera around its local Z-axis (forward axis)
        camera.rotateZ(localRotationZ);

    }

    useFrame(cameraUpdate)

    // Show the camera helper only in free mode
    const mode = useCameraManagerAPI(state => state.mode)
    const showHelper = mode === "free" && IS_DEVELOPMENT
    useHelper(cameraRef, showHelper && CameraHelper)

    const mergedSettings = {
        ...defaultSettings,
        ...settings
    }

    const disabledParams = [
        "rotation",
        "scale"
    ]

    return (
        <VXEntityWrapper
            vxkey={vxkey}
            ref={cameraRef}
            params={perspectiveCameraParams}
            disabledParams={disabledParams}
            settings={mergedSettings}
            {...props}
        >
            <PerspectiveCamera name="VXPerspectiveCamera" />
        </VXEntityWrapper>
    );
}));
