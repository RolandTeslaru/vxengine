// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { create } from 'zustand';
import { produce } from "immer"
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import animationEngineInstance from '@vxengine/singleton';
import { ISetting } from '@vxengine/AnimationEngine/types/engine';
import { logReportingService } from '@vxengine/AnimationEngine/services/LogReportingService';
import { splinePathToggleCallback } from '../utils/deufaltSettingsCallbacks';

export type IObjectSettings = Record<string, ISetting>

interface ObjectSettingsStoreProps {
    settings: Record<string, IObjectSettings>
    initialValues: Record<string, Record<string, boolean>>

    setSetting: (vxkey: string, settingKey: string, newValue: boolean) => void
    toggleSetting: (vxkey: string, settingKey: string) => void

    initSettingsForObject: (vxkey: string, settings: Record<string, ISetting>, initialSettings: Record<string, ISetting>) => void;
}

const MODULE = "ObjectSettingsAPI"

const SETTINGS_TOGGLE_CALLBACK = {
    "useSplinePath": splinePathToggleCallback
}

function setSettingLogic(state: ObjectSettingsStoreProps, vxkey: string, settingKey: string, settingValue: any) {   
    state.settings[vxkey][settingKey].value = settingValue;
}

export const useObjectSettingsAPI = create<ObjectSettingsStoreProps>((set, get) => {
    return ({
        initialValues: {},
        settings: {},
        setSetting: (vxkey, settingKey, newValue) => {
            const setting = get().settings[vxkey][settingKey];
            if(!setting){
                logReportingService.logError(
                    "Setting does not exist",{ module: MODULE, additionalData:{vxkey, settingKey}});
                return;
            }
            const initialValue = get().initialValues[vxkey][settingKey];
            const isDefaultValue = initialValue === newValue

            const isUsingDisk = setting.storage === "disk";

            set(produce((state: ObjectSettingsStoreProps) => setSettingLogic(state, vxkey, settingKey, newValue)));

            // Refresh the animation engine settings outside of the produce block
            if (isUsingDisk && isDefaultValue)
                animationEngineInstance.hydrationService.hydrateSetting({action: "remove", settingKey, vxkey});
            else
                animationEngineInstance.hydrationService.hydrateSetting({
                    action: "set", 
                    value: newValue,
                    settingKey, 
                    vxkey
                });

            // 7.36
            // Add change to the timelineEditorAPI so that it triggers the disk write
            useTimelineManagerAPI.getState().addChange();
        },

        toggleSetting: async (vxkey, settingKey) => {
            const setting = get().settings[vxkey]?.[settingKey];
            if(!setting){
                logReportingService.logError(
                    "Setting does not exist",{ module: MODULE, additionalData:{vxkey, settingKey}});
                return;
            }

            const onBeforeToggle = setting.onBeforeToggle || SETTINGS_TOGGLE_CALLBACK[settingKey];
            if(onBeforeToggle){
                const canToggle = await onBeforeToggle(vxkey, settingKey, setting);
                if(!canToggle)
                    return;
            }

            const initialValue = get().initialValues[vxkey][settingKey];
            const currentValue = setting.value
            const newValue = !currentValue;

            set(produce((state: ObjectSettingsStoreProps) => setSettingLogic(state, vxkey, settingKey, newValue)));

            // Notify the animation engine
            const isDefaultValue = initialValue === newValue;
            const isUsingDisk = setting.storage === "disk";

            if(isUsingDisk)
                if (isDefaultValue)
                    animationEngineInstance.hydrationService.hydrateSetting({action: "remove", settingKey, vxkey});
                else
                    animationEngineInstance.hydrationService.hydrateSetting({
                        action: "set", 
                        value: newValue,
                        settingKey, 
                        vxkey
                    });

            // Add change to the timelineEditorAPI so that it triggers the disk write
            useTimelineManagerAPI.getState().addChange();
        },
        
        initSettingsForObject: (vxkey, settings, initialSettings) => {
            set(produce((state: ObjectSettingsStoreProps) => {
                // Initialize the initialValues states;
                Object.entries(initialSettings).forEach(([settingKey, initialSetting]) => {
                    if(!state.initialValues[vxkey])
                        state.initialValues[vxkey] = {};

                    state.initialValues[vxkey][settingKey] = initialSetting.value;
                })

                state.settings[vxkey] = settings
            }))
        }
    })
})

export const useObjectSetting = (vxkey: string, settingKey: string) => {
    return useObjectSettingsAPI(state => state.settings[vxkey]?.[settingKey]?.value);
};