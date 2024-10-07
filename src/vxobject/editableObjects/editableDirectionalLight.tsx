import React, { forwardRef, useEffect } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { useVXAnimationStore } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"
import VXObjectWrapper from "../wrapper";

import { DirectionalLight } from "three";
import { DirectionalLightProps } from "@react-three/fiber";
export type EditableDirectionalLightProps = EditableObjectProps<DirectionalLightProps> & {
    ref?: React.Ref<DirectionalLight>;
};

export const EditableDirectionalLight = forwardRef<DirectionalLight, EditableDirectionalLightProps>((props, ref) => {
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
        <directionalLight ref={ref} {...props} />
    )
})
