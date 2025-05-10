import React from "react";
import { VXElementPropsWithoutRef, VXElementParams, VXObjectSettings } from "../types"
import { SpotLightHelper } from "three";
import { SpotLight } from "three";
import { useHelper } from "@react-three/drei";
import { invalidate, ThreeElements } from "@react-three/fiber";
import { useObjectSetting } from "@vxengine/managers/ObjectManager/stores/settingsStore";
import { withVX } from "../withVX";

export type VXElementSpotLightProps = VXElementPropsWithoutRef<ThreeElements["spotLight"]> & {
    ref?: React.RefObject<SpotLight>;
};

const spotLightParams: VXElementParams = [
    { propertyPath: "color", type: "color"},
    { propertyPath: "intensity", type: "number" },
    { propertyPath: "distance", type: "number" },
    { propertyPath: "penumbra", type: "number" },
    { propertyPath: "decay", type: "number" },
]

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
    useRotationDegrees: { title:"use rotation degrees", storage: "disk", value: false },
    showHelper: { title: "show helper", storage: "localStorage", value: false},
}

const BaseSpotLight = ({ref, ...props}) => {
    const vxkey = props.vxkey;
    const isHelperEnabled = useObjectSetting(vxkey, "showHelper");
    useHelper(ref, isHelperEnabled && SpotLightHelper)
    
    invalidate();
    
    return <spotLight ref={ref} {...props} />
}

export const EditableSpotLight = withVX<ThreeElements["spotLight"]>(BaseSpotLight, {
    type: "entity",
    params: spotLightParams,
    settings: defaultSettings,
})