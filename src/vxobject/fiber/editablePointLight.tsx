import React, { useImperativeHandle, useRef } from "react";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { VXElementPropsWithoutRef, VXElementParams, VXObjectSettings } from "../types"

import { PointLightHelper } from "three";

import VXThreeElementWrapper from "../VXThreeElementWrapper";

import { PointLight } from "three";
import { useHelper } from "@react-three/drei";
import { useObjectSetting } from "@vxengine/managers/ObjectManager/stores/settingsStore";
import { ThreeElements } from "@react-three/fiber";

export type VXElementPointLightProps = VXElementPropsWithoutRef<ThreeElements["pointLight"]> & {
    ref?: React.RefObject<PointLight>;
};

const pointLightParams: VXElementParams = [
    { propertyPath: "color", type: "color" },
    { propertyPath: "distance", type: "number" },
    { propertyPath: "intensity", type: "number" },
    { propertyPath: "decay", type: "number" },
]

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
    showHelper: { title: "show helper", storage: "localStorage", value: false},
}

export const EditablePointLight: React.FC<VXElementPointLightProps> = (props) => {
    const {settings = {}, ref, ...rest} = props;
    const vxkey = rest.vxkey;

    const internalRef = useRef<PointLight>(null); 
    useImperativeHandle(ref, () => internalRef.current);

    // INITIALIZE Settings
    const mergedSettings = {
        ...defaultSettings,
        ...settings
    }

    const isHelperEnabled = useObjectSetting(vxkey, "showHelper");
    useHelper(internalRef, isHelperEnabled && PointLightHelper)

    

    return (
        <VXThreeElementWrapper 
            ref={internalRef} 
            params={pointLightParams}
            settings={mergedSettings}
            {...props}
        >
            <pointLight {...props} />
        </VXThreeElementWrapper>
    )
}