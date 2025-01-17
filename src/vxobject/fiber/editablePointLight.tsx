'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { EditableObjectProps, VXObjectParams } from "../types"

import { PointLightHelper } from "three";

import VXEntityWrapper from "../entityWrapper";

import { PointLight } from "three";
import { PointLightProps } from "@react-three/fiber";
import { useHelper } from "@react-three/drei";

export type EditablePointLightProps = EditableObjectProps<PointLightProps> & {
    ref?: React.Ref<PointLight>;
    settings?: {}
};

export const defaultSettings_pointLight = {
    useSplinePath: false,
}

const pointLightParams: VXObjectParams= {
    'distance': { type: "number" },
    'intensity': { type: "number" },
    'decay': { type: "number" },
}

export const EditablePointLight = forwardRef<PointLight, EditablePointLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;
    const vxkey = rest.vxkey;

    const internalRef = useRef<any>(null); 
    useImperativeHandle(ref, () => internalRef.current);

    // INITIALIZE Settings
    const defaultSettings = {
        ...defaultSettings_pointLight,
        ...settings
    }
    
    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
        showHelper: false,
    }

    const isHelperEnabled = useObjectSettingsAPI(state => state.additionalSettings[vxkey]?.showHelper)
    useHelper(internalRef, isHelperEnabled && PointLightHelper)

    

    return (
        <VXEntityWrapper 
            ref={internalRef} 
            params={pointLightParams}
            defaultSettings={defaultSettings}
            defaultAdditionalSettings={defaultAdditionalSettings}
            {...props}
        >
            <pointLight ref={internalRef} {...props} />
        </VXEntityWrapper>
    )
})