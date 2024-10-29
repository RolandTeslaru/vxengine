'use client'

import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { useAnimationEngineAPI } from "../../AnimationEngine"
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
    }
}

export type EditablePerspectiveCameraProps = EditableObjectProps<PerspectiveCameraProps> & {
    ref?: React.Ref<typeof PerspectiveCamera>;
    settings?: {}
};

export const EditablePerspectiveCamera = forwardRef<typeof PerspectiveCamera, EditablePerspectiveCameraProps>((props, ref) => {
    const { settings = {}, ...rest } = props;
    const vxkey = rest.vxkey;
    const cameraRef = useRef(null)

    const cameraTarget = useVXObjectStore(state => state.objects["cameraTarget"]?.ref.current)

    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    };

    // useEffect(() => {
    //     cameraRef.current.localRotationZ = 0;
    // }, []);

    // useAnimationEngineEvent("timeSetManually", () => {
    //     if(cameraRef.current && targetPositionRef.current){
    //         console.log("TimeSetManually: cameraRef.current:", cameraRef.current, " targetPositionRef", targetPositionRef.current);    
    //         // Make the camera look at the target
    //         cameraRef.current.lookAt(targetPositionRef.current);
    
    //         const localRotationZ = cameraRef.current?.localRotationZ || 0;
    
    //         // Rotate the camera around its local Z-axis (forward axis)
    //         cameraRef.current.rotateZ(localRotationZ);
    //     }
    // })

    useFrame(() => {
        // cameraPositionRef.current = cameraRef.current?.position;
        // targetPositionRef.current = cameraTarget?.position;
        if (cameraRef.current && cameraTarget) {
            const camera: THREE.PerspectiveCamera = cameraRef.current
            const targetPosition: THREE.Vector3 = cameraTarget.position

            // Make the camera look at the target
            camera.lookAt(targetPosition);

            const localRotationZ = camera?.localRotationZ || 0;

            // Rotate the camera around its local Z-axis (forward axis)
            camera.rotateZ(localRotationZ);
        }
    })
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
});
