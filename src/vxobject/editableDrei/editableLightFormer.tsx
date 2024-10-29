'use client'

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Lightformer, LightProps } from "@react-three/drei";
import { EditableObjectProps } from "../types";
import VXEntityWrapper from "../entityWrapper";

export type EditableLightformerProps = EditableObjectProps<LightProps> & {
    ref?: React.Ref<LightProps>;
    settings?: {}
};

export const EditableLightFormer = forwardRef<typeof Lightformer, EditableLightformerProps>((props, ref) => {
    const { settings = {}, ...rest} = props;
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
        show: false,
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