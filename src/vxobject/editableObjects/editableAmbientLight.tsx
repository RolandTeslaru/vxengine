'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"
import VXEntityWrapper from "../entityWrapper";

import { AmbientLight } from "three";
import { AmbientLightProps } from "@react-three/fiber";

export type EditableAmbientLightProps = EditableObjectProps<AmbientLightProps> & {
    ref?: React.Ref<AmbientLight>;
    settings?: {}
};

export const EditableAmbientLight = forwardRef<AmbientLight, EditableAmbientLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;
    
    
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
    }

    const params = [
        'intensity'
    ]

    return (
        <VXEntityWrapper 
            ref={internalRef} 
            params={params}
            defaultSettingsForObject={defaultSettingsForObject}
            defaultAdditionalSettings={defaultAdditionalSettings}
            {...rest}
        >
            <ambientLight {...rest} />

        </VXEntityWrapper>
    )
})
