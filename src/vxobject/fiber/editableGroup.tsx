import React, { memo, forwardRef, useEffect } from "react";
import { VXElementPropsWithoutRef, VXObjectSettings } from "../types"
import { Group } from "three";
import { ThreeElements } from "@react-three/fiber";
import { withVX } from "../withVX";

export type VXElementGroupProps = VXElementPropsWithoutRef<ThreeElements["group"]> & {
    ref?: React.RefObject<Group>;
};

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
    useRotationDegrees: { title:"use rotation degrees", storage: "disk", value: false },
}

const BaseGroup = (props) => {
    return <group {...props} />;
}

export const EditableGroup = withVX<ThreeElements["group"]>(BaseGroup, {
    type: "entity",
    icon: "Group",
    settings: defaultSettings,
    vxkey: "group",
});