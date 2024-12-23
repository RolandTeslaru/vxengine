
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Lightformer, LightProps } from "@react-three/drei";
import { EditableObjectProps } from "@vxengine/vxobject/types";
import { VXEnvironment, VXEnvironmentPortal, VXEnvironmentMap } from "./dreiImpl";


export type EditableEnvironmentProps = EditableObjectProps<typeof VXEnvironment> & 
    React.ComponentProps<typeof VXEnvironment> & { // Inherit all Environment props
    ref?: React.Ref<any>;
    settings?: {};
}


export const EditableEnvironment = forwardRef<typeof VXEnvironment, EditableEnvironmentProps>((props, ref) => {
    const { children, ...rest} = props;
    return (
        <VXEnvironment {...rest}>
            {children}
        </VXEnvironment>
    )
})





export type EditableEnvironmentPortalProps = EditableObjectProps<typeof VXEnvironmentPortal> & 
    React.ComponentProps<typeof VXEnvironmentPortal> & { // Inherit all Environment props
    ref?: React.Ref<any>;
    settings?: {};
}


export const EditableEnvironmentPortal = forwardRef<typeof VXEnvironmentPortal, EditableEnvironmentPortalProps>((props, ref) => {
    const { children, ...rest} = props;
    return (
        <VXEnvironmentPortal {...rest}>
            {children}
        </VXEnvironmentPortal>
    )
})





export type EditableEnvironmentMapProps = EditableObjectProps<typeof VXEnvironmentMap> & 
    React.ComponentProps<typeof VXEnvironment> & { // Inherit all Environment props
    ref?: React.Ref<any>;
    settings?: {};
}


export const EditableEnvironmentMap = forwardRef<typeof VXEnvironmentMap, EditableEnvironmentMapProps>((props, ref) => {
    const { children, ...rest} = props;
    return (
        <VXEnvironment {...rest}>
            {children}
        </VXEnvironment>
    )
})
