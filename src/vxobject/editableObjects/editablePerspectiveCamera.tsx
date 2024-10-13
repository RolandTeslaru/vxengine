import React, { forwardRef, useEffect, useRef } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"
import VXObjectWrapper from "../wrapper";
import { PerspectiveCamera, useHelper } from "@react-three/drei";
import { useVXObjectStore } from "../ObjectStore";
import { useCameraManagerAPI } from "../../managers/CameraManager/store"

import { PerspectiveCameraProps, useFrame } from "@react-three/fiber";
import { CameraHelper } from "three";

import * as THREE from "three"


export type EditablePerspectiveCameraProps = EditableObjectProps<PerspectiveCameraProps> & {
    ref?: React.Ref<typeof PerspectiveCamera>;
    settings?: {}
};

export const EditablePerspectiveCamera = forwardRef<typeof PerspectiveCamera, EditablePerspectiveCameraProps>((props, ref) => {
    const { settings = {}, ...rest } = props;
    const vxkey = rest.vxkey;

    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);
    const cameraTarget = useVXObjectStore(state => state.objects["cameraTarget"]?.ref.current)
    const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)
    const currentSettingsForObject = useAnimationEngineAPI(state => state.timelines[currentTimelineID]?.settings[vxkey])


    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    };

    useEffect(() => {
        Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value);
        });
    }, []);

    const cameraRef = useRef(null)

    useFrame(() => {
        if (cameraRef.current && cameraTarget) {
            const camera: THREE.PerspectiveCamera = cameraRef.current
            const targetPosition: THREE.Vector3 = cameraTarget.position

            // Make the camera look at the target
            camera.lookAt(targetPosition);

            // Define the desired roll angle in radians
            const rollAngle = 0.523599; // Replace with your desired angle

            // Rotate the camera around its local Z-axis (forward axis)
            camera.rotateZ(rollAngle);
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

    // Refresh settings when the current timeline changes
    useEffect(() => {
        if (currentTimelineID === undefined) return
        const mergedSettingsForObject = {
            ...defaultSettingsForObject,
            ...currentSettingsForObject
        }
        Object.entries(mergedSettingsForObject).forEach(([settingKey, value]: [string, any]) => {
            useObjectSettingsAPI.getState().setSetting(vxkey, settingKey, value)
        })
    }, [currentTimelineID])

    const params = [
        "far",
        "near",
        "fov",
        "zoom",
        "focus",
        "filmGauge",
        "filmOffset"
    ]

    return (
        <VXObjectWrapper vxkey={vxkey} ref={cameraRef} params={params} type="object" {...props}>
            <PerspectiveCamera name="VXPerspectiveCamera" />
        </VXObjectWrapper>
    );
});
