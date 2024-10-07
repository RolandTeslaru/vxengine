import React, { forwardRef, useEffect } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { useVXAnimationStore } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"
import VXObjectWrapper from "../wrapper";

import { Group } from "three";
import { GroupProps } from "@react-three/fiber";

export type EditableGroupProps = EditableObjectProps<GroupProps> & {
    ref?: React.Ref<Group>;
};


export const EditableGroup = forwardRef<Group, EditableGroupProps>((props, ref) => {
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);

    const { ...rest } = props;
    const vxkey = rest.vxkey;


    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }

    useEffect(() => {
        Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value)
        })
    }, [])

    return (
        <VXObjectWrapper type="object" ref={ref} {...props}>
            <group ref={ref} {...props} >
                {props.children}
            </group>
        </VXObjectWrapper>
    );
})