import React, { memo, forwardRef, useEffect } from "react";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"
import { DirectionalLight } from "three";
import { DirectionalLightProps } from "@react-three/fiber";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";

export type EditableDirectionalLightProps = EditableObjectProps<DirectionalLightProps> & {
    ref?: React.Ref<DirectionalLight>;
    settings?: {}
};

const defaultSettings_DirectionalLight = {
    showPositionPath: false,
}

export const EditableDirectionalLight = memo(forwardRef<DirectionalLight, EditableDirectionalLightProps>((props, ref) => {
    const { settings = {}, ...rest } = props;
    const vxkey = rest.vxkey;
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);
    const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)
    const currentSettingsForObject = useAnimationEngineAPI(state => state.timelines[currentTimelineID]?.settings[vxkey])

    // INITIALIZE Settings
    const mergeddefaultSettings = {
        useSplinePath: false,
        ...settings
    }
    useEffect(() => {
        if (currentTimelineID === undefined) return
        const mergedSettingsForObject = {
            ...mergeddefaultSettings,
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
        <directionalLight ref={ref} {...props} />
    )
})
)
