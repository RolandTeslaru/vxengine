import React, { memo, forwardRef, useEffect } from "react";
import { VXElementPropsWithoutRef, VXObjectSettings } from "../types"
import VXThreeElementWrapper from "../VXThreeElementWrapper";
import { Group } from "three";
import { ThreeElement, ThreeElements } from "@react-three/fiber";

export type VXElementGroupProps = VXElementPropsWithoutRef<ThreeElements["group"]> & {
    ref?: React.RefObject<Group>;
    overrideNodeTreeParentKey?: string
};

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
    useRotationDegrees: { title:"use rotation degrees", storage: "disk", value: false },
}

export const EditableGroup: React.FC<VXElementGroupProps> = (props) => {
    const { settings = {}, children: groupChildren, ref, ...rest } = props;

    // INITIALIZE Settings
    const mergedSettings = {
        ...defaultSettings,
        ...settings
    }

    return (
        <VXThreeElementWrapper
            ref={ref}
            {...rest}
            settings={mergedSettings}
        >
            <group {...rest} >
                {groupChildren}
            </group>
        </VXThreeElementWrapper>
    );
}