import React, { memo, forwardRef, useEffect, useRef, useImperativeHandle } from "react";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { VXElementPropsWithoutRef, VXElementParams, VXObjectSettings } from "../types"
import { DirectionalLight } from "three";
import { ThreeElements } from "@react-three/fiber";
import { withVX } from "../withVX";
import { useObjectSetting } from "@vxengine/managers/ObjectManager/stores/settingsStore";
import { useHelper } from "@react-three/drei";
import { DirectionalLightHelper } from "three";

export type VXElementDirectionalLightProps = VXElementPropsWithoutRef<ThreeElements["directionalLight"]> & {
    ref?: React.RefObject<DirectionalLight>;
};

const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
}

const directionalLightParams: VXElementParams = []

export const BaseDirectionalLight = ({ref, ...props}) => {
    const vxkey = props.vxkey;

    const isHelperEnabled = useObjectSetting(vxkey, "showHelper");
    useHelper(ref, isHelperEnabled && DirectionalLightHelper);

    return <directionalLight ref={ref} {...props} />
}

export const EditableDirectionalLight = withVX(BaseDirectionalLight, {
    type: "virtualEntity",
    settings: defaultSettings,
    params: directionalLightParams
})