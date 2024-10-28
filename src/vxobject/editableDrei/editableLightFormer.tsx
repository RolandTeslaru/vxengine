'use client'

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Lightformer, LightProps } from "@react-three/drei";
import { EditableObjectProps } from "../types";
import VXObjectWrapper from "../wrapper";

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
        <VXObjectWrapper 
            type="object"
            ref={internalRef} 
            defaultSettingsForObject={defaultSettingsForObject}
            defaultAdditionalSettings={defaultAdditionalSettings}
            {...props} 
        >
            <Lightformer />
        </VXObjectWrapper>
    )
})