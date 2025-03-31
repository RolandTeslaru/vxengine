import React from "react";
import { VXElementPropsWithoutRef, VXElementParams, VXObjectSettings } from "../types"
import { PointLightHelper } from "three";
import { PointLight } from "three";
import { useHelper } from "@react-three/drei";
import { useObjectSetting } from "@vxengine/managers/ObjectManager/stores/settingsStore";
import { invalidate, ThreeElements } from "@react-three/fiber";
import { withVX } from "../withVX";

export type VXElementPointLightProps = VXElementPropsWithoutRef<ThreeElements["pointLight"]> & {
    ref?: React.RefObject<PointLight>;
};

const pointLightParams: VXElementParams = [
    { propertyPath: "color", type: "color" },
    { propertyPath: "distance", type: "number" },
    { propertyPath: "intensity", type: "number" },
    { propertyPath: "decay", type: "number" },
]

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
    showHelper: { title: "show helper", storage: "localStorage", value: false},
}

const BasePointLight = ({ref, ...props}) => {
    const vxkey= props.vxkey;

    const isHelperEnabled = useObjectSetting(vxkey, "showHelper");
    useHelper(ref, isHelperEnabled && PointLightHelper)

    invalidate();

    return <pointLight ref={ref} {...props} />;
}

export const EditablePointLight = withVX<ThreeElements["pointLight"]>(BasePointLight, {
    type: "entity",
    params: pointLightParams,
    settings: defaultSettings,
    icon: "PointLight",
});