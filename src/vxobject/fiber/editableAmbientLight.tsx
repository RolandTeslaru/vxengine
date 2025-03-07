import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { VXElementPropsWithoutRef, VXElementParams, VXObjectSettings } from "../types"
import VXThreeElementWrapper from "../VXThreeElementWrapper";

import { AmbientLight } from "three";
import { ThreeElements } from "@react-three/fiber";

export type VXElementAmbientLightProps = VXElementPropsWithoutRef<ThreeElements["ambientLight"]> & {
    ref?: React.RefObject<AmbientLight>;
};

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
}

const ambientLightParams: VXElementParams = [
    {propertyPath: 'intensity', type: "number"},
    {propertyPath: "color", type: "color"}
]

export const EditableAmbientLight: React.FC<VXElementAmbientLightProps> = (props) => {
    const {settings = {}, ...rest} = props;

    const mergedSettings = {
        ...defaultSettings,
        ...settings
    }
    
    return (
        <VXThreeElementWrapper 
            params={ambientLightParams}
            settings={mergedSettings}
            {...rest}
        >
            <ambientLight/>

        </VXThreeElementWrapper>
    )
}
