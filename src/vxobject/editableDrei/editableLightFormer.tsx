'use client'

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Lightformer, LightProps, useHelper } from "@react-three/drei";
import { EditableObjectProps } from "../types";
import VXEntityWrapper from "../entityWrapper";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { BoxHelper } from "three";

export type EditableLightformerProps = EditableObjectProps<LightProps> & {
    ref?: React.Ref<LightProps>;
    settings?: {}
};

export const EditableLightFormer = forwardRef<typeof Lightformer, EditableLightformerProps>((props, ref) => {
    const { settings = {}, ...rest} = props;
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
    }

    return (
        <VXEntityWrapper 
            ref={internalRef} 
            isVirtual={true}
            defaultSettingsForObject={defaultSettingsForObject}
            defaultAdditionalSettings={defaultAdditionalSettings}
            {...props} 
        >
            <Lightformer />
        </VXEntityWrapper>
    )
})