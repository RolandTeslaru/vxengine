'use client'

import React, { memo, forwardRef, useEffect } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"

import { DirectionalLight } from "three";
import { DirectionalLightProps } from "@react-three/fiber";
export type EditableDirectionalLightProps = EditableObjectProps<DirectionalLightProps> & {
    ref?: React.Ref<DirectionalLight>;
    settings?: {}
};

export const EditableDirectionalLight = memo(forwardRef<DirectionalLight, EditableDirectionalLightProps>((props, ref) => {
    const { settings = {}, ...rest } = props;
    const vxkey = rest.vxkey;
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);
    const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)
    const currentSettingsForObject = useAnimationEngineAPI(state => state.timelines[currentTimelineID]?.settings[vxkey])

    // INITIALIZE Settings
    const defaultSettingsForObject = {
        useSplinePath: false,
        ...settings
    }
    useEffect(() => {
        if (currentTimelineID === undefined) return
        const mergedSettingsForObject = {
            ...defaultSettingsForObject,
            ...currentSettingsForObject
        }
        Object.entries(mergedSettingsForObject).forEach(([settingKey, value]: [string, any]) => {
            useObjectSettingsAPI.getState().setSetting(vxkey, settingKey, value)
        })
    }, [currentTimelineID])

    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }
    useEffect(() => {
        Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value)
        })
    }, [])

    console.log("Ref DirectionalLight ", ref)

    return (
        <directionalLight ref={ref} {...props} />
    )
})
)
