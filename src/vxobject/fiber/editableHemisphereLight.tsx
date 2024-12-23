'use client'

import React, { memo, forwardRef, useEffect } from "react";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"

import { HemisphereLight } from "three";
import { HemisphereLightProps } from "@react-three/fiber";

export type EditableHemisphereLightProps = EditableObjectProps<HemisphereLightProps> & {
    ref?: React.Ref<HemisphereLight>;
    settings?: {}
};

export const EditableHemisphereLight = memo(forwardRef<HemisphereLight, EditableHemisphereLightProps>((props, ref) => {
    const {settings = {}, ...rest} = props;
    const vxkey = rest.vxkey;
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);
    const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)
    const currentSettingsForObject = useAnimationEngineAPI(state => state.timelines[currentTimelineID]?.settings[vxkey])
    

    // INITIALIZE Settings
    const defaultSettings = {
        useSplinePath: false,
        ...settings
    }
    useEffect(() => {
        if(currentTimelineID === undefined) return 
        const mergedSettingsForObject = {
            ...defaultSettings,
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


    return (
        <hemisphereLight ref={ref} {...props} />
    )
}))