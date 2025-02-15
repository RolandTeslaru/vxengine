import React, { memo, forwardRef, useEffect } from "react";
import { EditableObjectProps, VXObjectSettings } from "../types"
import VXEntityWrapper from "../entityWrapper";
import { Group } from "three";
import { GroupProps } from "@react-three/fiber";
import { splinePathToggleCallback } from "@vxengine/managers/ObjectManager/utils/deufaltSettingsCallbacks";

export type EditableGroupProps = EditableObjectProps<GroupProps> & {
    ref?: React.Ref<Group>;
    settings?: {},
    temporarySettings?: {},
    overrideNodeTreeParentKey?: string
};

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
    useRotationDegrees: { title:"use rotation degrees", storage: "disk", value: false },
}

export const EditableGroup = memo(forwardRef<Group, EditableGroupProps>((props, ref) => {
    const { settings = {}, temporarySettings = {}, children: groupChildren, ...rest } = props;

    // INITIALIZE Settings
    const mergedSettings = {
        ...defaultSettings,
        ...settings
    }

    return (
        <VXEntityWrapper
            ref={ref}
            {...rest}
            settings={mergedSettings}
        >
            <group ref={ref} {...rest} >
                {groupChildren}
            </group>
        </VXEntityWrapper>
    );
}))