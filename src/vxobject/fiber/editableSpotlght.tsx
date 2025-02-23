import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { VXElementPropsWithoutRef, VXElementParams, VXObjectSettings } from "../types"

import { SpotLightHelper } from "three";

import VXThreeElementWrapper from "../VXThreeElementWrapper";

import { SpotLight } from "three";
import { useHelper } from "@react-three/drei";
import { ThreeElement, ThreeElements } from "@react-three/fiber";

export type VXElementSpotLightProps = VXElementPropsWithoutRef<ThreeElements["spotLight"]> & {
    ref?: React.RefObject<SpotLight>;
};

const spotLightParams: VXElementParams = [
    { propertyPath: "color", type: "color"},
    { propertyPath: "intensity", type: "number" },
    { propertyPath: "distance", type: "number" },
    { propertyPath: "penumbra", type: "number" },
    { propertyPath: "decay", type: "number" },
]

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
    useRotationDegrees: { title:"use rotation degrees", storage: "disk", value: false },
}

export const EditableSpotLight: React.FC<VXElementSpotLightProps> = (props) => {
    const {settings = {}, ref, ...rest} = props;
    const vxkey = rest.vxkey;
    
    const internalRef = useRef<any>(null); 
    useImperativeHandle(ref, () => internalRef.current);

    const isHelperEnabled = useObjectSettingsAPI(state => state.settings[vxkey]?.showHelper.value)
    useHelper(internalRef, isHelperEnabled && SpotLightHelper)

    const mergedSettings = {
        ...defaultSettings,
        ...settings
    }

    return (
        <VXThreeElementWrapper 
            ref={internalRef} 
            params={spotLightParams}
            settings={mergedSettings}
            {...props}
        >
            <spotLight/>
        </VXThreeElementWrapper>
    );
}
