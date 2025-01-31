import React, { memo, forwardRef, useEffect } from "react";
import { EditableObjectProps } from "../types"
import VXEntityWrapper from "../entityWrapper";

import { Group } from "three";
import { GroupProps } from "@react-three/fiber";

export type EditableGroupProps = EditableObjectProps<GroupProps> & {
    ref?: React.Ref<Group>;
    settings?: {},
    temporarySettings?: {},
    overrideNodeTreeParentKey?: string
};

export const defaultSettings_group = {
    useSplinePath: false,
}

export const EditableGroup = memo(forwardRef<Group, EditableGroupProps>((props, ref) => {
    const { settings = {}, temporarySettings = {}, children: groupChildren, ...rest } = props;

    // INITIALIZE Settings
    const defaultSettings = {
        ...defaultSettings_group,
        ...settings
    }

    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
        ...temporarySettings
    }

    return (
        <VXEntityWrapper
            ref={ref}
            {...rest}
            defaultSettings={defaultSettings}
            defaultAdditionalSettings={defaultAdditionalSettings}
        >
            <group ref={ref} {...rest} >
                {groupChildren}
            </group>
        </VXEntityWrapper>
    );
}))