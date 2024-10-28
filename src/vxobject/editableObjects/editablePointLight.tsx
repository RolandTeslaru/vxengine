'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { EditableObjectProps } from "../types"

import { PointLightHelper } from "three";

import VXObjectWrapper from "../wrapper";

import { PointLight } from "three";
import { PointLightProps } from "@react-three/fiber";
import { useHelper } from "@react-three/drei";

export type EditablePointLightProps = EditableObjectProps<PointLightProps> & {
    ref?: React.Ref<PointLight>;
    settings?: {}
};

export const EditablePointLight = forwardRef<PointLight, EditablePointLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;
    const vxkey = rest.vxkey;

    const internalRef = useRef<any>(null); 
    useImperativeHandle(ref, () => internalRef.current);

    // INITIALIZE Settings
    const defaultSettingsForObject = {
        useSplinePath: false,
        ...settings
    }
    
    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
        showHelper: false,
    }

    const isHelperEnabled = useObjectSettingsAPI(state => state.additionalSettings[vxkey]?.showHelper)
    useHelper(internalRef, isHelperEnabled && PointLightHelper)

    const params = [
        'distance',
        'intensity',
        'decay',
    ]

    return (
        <VXObjectWrapper 
            type="object" 
            ref={internalRef} 
            params={params}
            defaultSettingsForObject={defaultSettingsForObject}
            defaultAdditionalSettings={defaultAdditionalSettings}
            {...props}
        >
            <pointLight ref={internalRef} {...props} />
        </VXObjectWrapper>
    )
})