'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { EditableObjectProps } from "../types"

import { SpotLightHelper } from "three";

import VXEntityWrapper from "../entityWrapper";

import { SpotLight } from "three";
import { SpotLightProps } from "@react-three/fiber";
import { useHelper } from "@react-three/drei";

export type EditableSpotLightProps = EditableObjectProps<SpotLightProps> & {
    ref?: React.Ref<SpotLight>;
    settings?: {}
};

export const defaultSettings_spotlight = {
    useSplinePath: false,
}

export const EditableSpotLight = forwardRef<SpotLight, EditableSpotLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;
    const vxkey = rest.vxkey;
    
    const internalRef = useRef<any>(null); 
    useImperativeHandle(ref, () => internalRef.current);

    //
    // Settings
    //
    const defaultSettings = {
        ...defaultSettings_spotlight,
        ...settings
    }

    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }

    const isHelperEnabled = useObjectSettingsAPI(state => state.additionalSettings[vxkey]?.showHelper)
    useHelper(internalRef, isHelperEnabled && SpotLightHelper)


    const params = [
        'intensity',
        'distance',
        'penumbra',
        'decay',
    ]

    return (
        <VXEntityWrapper 
            ref={internalRef} 
            params={params}
            defaultSettings={defaultSettings}
            defaultAdditionalSettings={defaultAdditionalSettings}
            {...props}
        >
            <spotLight/>
        </VXEntityWrapper>
    );
})
