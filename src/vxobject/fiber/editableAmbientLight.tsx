import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps, VXObjectParams, VXObjectSettings } from "../types"
import VXEntityWrapper from "../entityWrapper";

import { AmbientLight } from "three";
import { ThreeElement } from "@react-three/fiber";

export type EditableAmbientLightProps = EditableObjectProps<ThreeElement<typeof AmbientLight>> & {
    ref?: React.Ref<AmbientLight>;
    settings?: {}
};

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
}

const ambientLightParams: VXObjectParams = [
    {propertyPath: 'intensity', type: "number"},
    {propertyPath: "color", type: "color"}
]

export const EditableAmbientLight = forwardRef<AmbientLight, EditableAmbientLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;
    
    const internalRef = useRef<any>(null); 
    useImperativeHandle(ref, () => internalRef.current);

    // INITIALIZE Settings
    const mergedSettings = {
        ...defaultSettings,
        ...settings
    }
    
    return (
        <VXEntityWrapper 
            ref={internalRef} 
            params={ambientLightParams}
            settings={mergedSettings}
            {...rest}
        >
            <ambientLight {...rest} />

        </VXEntityWrapper>
    )
})
