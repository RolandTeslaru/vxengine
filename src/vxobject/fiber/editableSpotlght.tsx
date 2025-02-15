import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { EditableObjectProps, VXObjectParams, VXObjectSettings } from "../types"

import { SpotLightHelper } from "three";

import VXEntityWrapper from "../entityWrapper";

import { SpotLight } from "three";
import { SpotLightProps } from "@react-three/fiber";
import { useHelper } from "@react-three/drei";

export type EditableSpotLightProps = EditableObjectProps<SpotLightProps> & {
    ref?: React.Ref<SpotLight>;
};

const spotLightParams: VXObjectParams = {
    "color": { type: "color"},
    'intensity': { type: "number" },
    'distance': { type: "number" },
    'penumbra': { type: "number" },
    'decay': { type: "number" },
}

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
    useRotationDegrees: { title:"use rotation degrees", storage: "disk", value: false },
}

export const EditableSpotLight = forwardRef<SpotLight, EditableSpotLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;
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
        <VXEntityWrapper 
            ref={internalRef} 
            params={spotLightParams}
            settings={mergedSettings}
            {...props}
        >
            <spotLight/>
        </VXEntityWrapper>
    );
})
