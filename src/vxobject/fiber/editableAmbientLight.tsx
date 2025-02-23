import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { VXElementPropsWithoutRef, VXElementParams, VXObjectSettings } from "../types"
import VXThreeElementWrapper from "../VXThreeElementWrapper";

import { AmbientLight } from "three";
import { ThreeElement } from "@react-three/fiber";

export type VXElementAmbientLightProps = VXElementPropsWithoutRef<ThreeElement<typeof AmbientLight>> & {
    ref?: React.Ref<AmbientLight>;
};

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
}

const ambientLightParams: VXElementParams = [
    {propertyPath: 'intensity', type: "number"},
    {propertyPath: "color", type: "color"}
]

export const EditableAmbientLight = forwardRef<AmbientLight, VXElementAmbientLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;
    
    const internalRef = useRef<any>(null); 
    useImperativeHandle(ref, () => internalRef.current);

    // INITIALIZE Settings
    const mergedSettings = {
        ...defaultSettings,
        ...settings
    }
    
    return (
        <VXThreeElementWrapper 
            ref={internalRef} 
            params={ambientLightParams}
            settings={mergedSettings}
            {...rest}
        >
            <ambientLight {...rest} />

        </VXThreeElementWrapper>
    )
})
