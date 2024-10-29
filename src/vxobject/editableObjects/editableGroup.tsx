'use client'

import React, { forwardRef, useEffect } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"
import VXEntityWrapper from "../entityWrapper";

import { Group } from "three";
import { GroupProps } from "@react-three/fiber";

export type EditableGroupProps = EditableObjectProps<GroupProps> & {
    ref?: React.Ref<Group>;
    settings?: {},
};


export const EditableGroup = forwardRef<Group, EditableGroupProps>((props, ref) => {
    const {settings = {}, children: groupChildren, ...rest} = props;
    
    // INITIALIZE Settings
    const defaultSettingsForObject = {
        useSplinePath: false,
        ...settings
    }

    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }


    return (
        <VXEntityWrapper 
            ref={ref} 
            {...rest}
            defaultSettingsForObject={defaultSettingsForObject}
            defaultAdditionalSettings={defaultAdditionalSettings}
        >
            <group ref={ref} {...rest} >
                {groupChildren}
            </group>
        </VXEntityWrapper>
    );
})