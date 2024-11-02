'use client'

import React, { memo, forwardRef, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { EditableObjectProps } from "../types"
import VXEntityWrapper from "../entityWrapper";
import { PerspectiveCamera, useHelper } from "@react-three/drei";
import { useVXObjectStore } from "../ObjectStore";
import { useCameraManagerAPI } from "../../managers/CameraManager/store"

import { PerspectiveCameraProps, useFrame } from "@react-three/fiber";
import { CameraHelper } from "three";

import * as THREE from "three"
import useAnimationEngineEvent from "@vxengine/AnimationEngine/utils/useAnimationEngineEvent";

declare module 'three' {
    interface PerspectiveCamera {
        localRotationZ?: number;
        dummy_fov?: number
    }
}

export type EditablePerspectiveCameraProps = EditableObjectProps<PerspectiveCameraProps> & {
    ref?: React.Ref<typeof PerspectiveCamera>;
    settings?: {}
};

export const EditablePerspectiveCamera = memo(forwardRef<typeof PerspectiveCamera, EditablePerspectiveCameraProps>((props, ref) => {
    const { settings = {}, ...rest } = props;
    const vxkey = rest.vxkey;
    const cameraRef = useRef(null)

    const cameraTargetRef = useVXObjectStore(state => state.objects["cameraTarget"]?.ref.current)

    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    };

    // useEffect(() => {
    //     cameraRef.current.localRotationZ = 0;
    // }, []);

    const cameraUpdate = () => {
        if(!cameraRef.current || !cameraTargetRef) return

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
    useHelper(cameraRef, mode === "free" && CameraHelper)

    const defaultSettingsForObject = {
        useSplinePath: false,
        setingMeshProp1: true,
        ...settings
    }

    const params = [
        "localRotationZ",
        "far",
        "near",
        "fov",
        "zoom",
        "focus",
        "filmGauge",
        "filmOffset"
    ]

    const disabledParams = [
        "rotation",
        "scale"
    ]

    return (
        <VXEntityWrapper 
            vxkey={vxkey} 
            ref={cameraRef} 
            params={params} 
            disabledParams={disabledParams} 
            defaultSettingsForObject={defaultSettingsForObject}
            defaultAdditionalSettings={defaultAdditionalSettings}
            {...props}
        >
            <PerspectiveCamera name="VXPerspectiveCamera" />
        </VXEntityWrapper>
    );
}));
