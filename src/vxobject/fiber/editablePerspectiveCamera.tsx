import React, { memo, forwardRef, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { EditableObjectProps, VXObjectParams } from "../types"
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

export const defaultSettings_perspectiveCamera = {
    useSplinePath: false,
}

const recalculatePerspectiveMatrixSideEffect:TrackSideEffectCallback = (animationEngine ) => {
    animationEngine.cameraRequiresProjectionMatrixRecalculation = true;
}

const perspectiveCameraParams: VXObjectParams = {
    "localRotationZ": {type: "number"},
    "far": {type: "number", sideEffect: recalculatePerspectiveMatrixSideEffect},
    "near": {type: "number", sideEffect: recalculatePerspectiveMatrixSideEffect},
    "fov": {type: "number", sideEffect: recalculatePerspectiveMatrixSideEffect},
    "zoom": {type: "number", sideEffect: recalculatePerspectiveMatrixSideEffect},
    "focus": {type: "number"},
    "filmGauge": {type: "number"}, 
    "filmOffset": {type: "number"}
}

export const EditablePerspectiveCamera = memo(forwardRef<typeof PerspectiveCamera, EditablePerspectiveCameraProps>((props, ref) => {
    const { settings = {}, ...rest } = props;
    const vxkey = rest.vxkey;
    const cameraRef = useRef(null)

    const cameraTargetRef = useVXObjectStore(state => state.objects["cameraTarget"]?.ref.current)

    const { IS_DEVELOPMENT } = useVXEngine();

    // useEffect(() => {
    //     cameraRef.current.localRotationZ = 0;
    // }, []);

    const mousePosition = useRef({ x: 0, y: 0 });


    const cameraOrientationState = useRef(
        {
            pitchAngle: 0,
            yawAngle: 0,
            startingPitchAngleForCurrentCoordinates: 0,
            startingYawAngleForCurrentCoordinates: 0,
            previousPitchAngle: 0,
            previousYawAngle: 0,
            lastMouseMoveTime: 0,
            movementDuration: 100,
        }
    )

    // const handleMouseMove = useCallback((e) => {
    //     console.log("CAmera Ref curret ", cameraRef.current)
    //     mousePosition.current.y = (e.clientX / window.innerWidth) * 2 - 1;  // Horizontal (yaw)
    //     mousePosition.current.x = (e.clientY / window.innerHeight) * -2 + 1;  // Vertical (pitch)
    // }, []);

    // useEffect(() => {
    //     window.addEventListener("mousemove", handleMouseMove);
    //     return () => window.removeEventListener("mousemove", handleMouseMove);
    // })

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

    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    };


    const defaultSettings = {
        ...defaultSettings_perspectiveCamera,
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
            defaultSettings={defaultSettings}
            defaultAdditionalSettings={defaultAdditionalSettings}
            {...props}
        >
            <PerspectiveCamera name="VXPerspectiveCamera" />
        </VXEntityWrapper>
    );
}));
