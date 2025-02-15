import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { EditableObjectProps, VXObjectParams, VXObjectSettings } from "../types"

import { PointLightHelper } from "three";

import VXEntityWrapper from "../entityWrapper";

import { PointLight } from "three";
import { PointLightProps } from "@react-three/fiber";
import { useHelper } from "@react-three/drei";
import { useObjectSetting } from "@vxengine/managers/ObjectManager/stores/settingsStore";

export type EditablePointLightProps = EditableObjectProps<PointLightProps> & {
    ref?: React.Ref<PointLight>;
    settings?: {}
};

const pointLightParams: VXObjectParams= {
    "color": { type: "color" },
    'distance': { type: "number" },
    'intensity': { type: "number" },
    'decay': { type: "number" },
} 

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
}

export const EditablePointLight = forwardRef<PointLight, EditablePointLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;
    const vxkey = rest.vxkey;

    const internalRef = useRef<any>(null); 
    useImperativeHandle(ref, () => internalRef.current);

    // INITIALIZE Settings
    const mergedSettings = {
        ...defaultSettings,
        ...settings
    }

    const isHelperEnabled = useObjectSetting(vxkey, "showHelper");
    useHelper(internalRef, isHelperEnabled && PointLightHelper)

    

    return (
        <VXEntityWrapper 
            ref={internalRef} 
            params={pointLightParams}
            settings={mergedSettings}
            {...props}
        >
            <pointLight ref={internalRef} {...props} />
        </VXEntityWrapper>
    )
})