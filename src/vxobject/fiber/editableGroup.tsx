import React, { memo, forwardRef, useEffect } from "react";
import { VXElementPropsWithoutRef, VXObjectSettings } from "../types"
import VXThreeElementWrapper from "../VXThreeElementWrapper";
import { Group } from "three";
import { ThreeElements } from "@react-three/fiber";

export type VXElementGroupProps = VXElementPropsWithoutRef<ThreeElements["group"]> & {
    ref?: React.RefObject<Group>;
};

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
    useRotationDegrees: { title:"use rotation degrees", storage: "disk", value: false },
}

export const EditableGroup: React.FC<VXElementGroupProps> = (props) => {
    const { settings = {}, children: groupChildren, ...rest } = props;

    // INITIALIZE Settings
    const mergedSettings = {
        ...defaultSettings,
        ...settings
    }

    return (
        <VXThreeElementWrapper
            settings={mergedSettings}
            {...rest}
        >
            <group>
                {groupChildren}
            </group>
        </VXThreeElementWrapper>
    );
}