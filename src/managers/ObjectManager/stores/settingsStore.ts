// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { create } from 'zustand';
import { produce } from "immer"
import { IAdditionalSettingsProps, ISettings } from '@vxengine/AnimationEngine/types/track';
import { getVXEngineState } from '@vxengine/engine';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager';

interface ObjectSettingsStoreProps {

    defaultSettings: Record<string, ISettings>

    settings: Record<string, ISettings>
    setSetting: (vxkey: string, settingKey: string, settingValue: string | boolean) => void
    toggleSetting: (vxkey: string, settingKey: string) => void

    initSettingsForObject: (vxkey: string, newSettings: {}, defaultSettingsForObject: {}) => void;
    initAdditionalSettingsForObject: (vxkey: string, newSettings: {}) => void;

    additionalSettings: Record<string, IAdditionalSettingsProps>
    setAdditionalSetting: (vxkey: string, settingKey: string, settingValue: boolean | string) => void
    toggleAdditionalSetting: (vxkey: string, settingKey: string) => void;
}

function setSettingLogic(state: ObjectSettingsStoreProps, vxkey: string, settingKey: string, settingValue: any) {
    const defaultSettings = state.defaultSettings || {};
    const isDefaultValue = defaultSettings[settingKey] === settingValue

    if (isDefaultValue) {
        // Remove the setting from the currentTimeline sop it doesnt take up space 
        if (state.settings[vxkey]) {
            delete state.settings[vxkey][settingKey];
            // Remove The object if its empty
            if (Object.keys(state.settings[vxkey]).length === 0) {
                delete state.settings[vxkey];
            }
        }
    } else {
        // Set the difrent value from the default;
        if (!state.settings[vxkey])
            state.settings[vxkey] = {}

        state.settings[vxkey][settingKey] = settingValue;
    }
}

export const useObjectSettingsAPI = create<ObjectSettingsStoreProps>((set, get) => {
    return ({
        defaultSettings: {},
        settings: {},
        setSetting: (vxkey, settingKey, settingValue) => {
            const defaultSettings = get().defaultSettings || {};
            const isDefaultValue = defaultSettings[vxkey]?.[settingKey] === settingValue

            set(produce((state: ObjectSettingsStoreProps) => setSettingLogic(state, vxkey, settingKey, settingValue)));

            // Refresh the animation engine settings outside of the produce block
            const animationEngine = getVXEngineState().getState().animationEngine
            if (isDefaultValue) {
                animationEngine.hydrateSetting("remove", settingKey, vxkey);
            } else {
                animationEngine.hydrateSetting("set", settingKey, vxkey);
            }

            // Add change to the timelineEditorAPI so that it triggers the disk write
            useTimelineEditorAPI.getState().addChange();
        },

        toggleSetting: (vxkey, settingKey) => {
            const currentValue = get().settings[vxkey]?.[settingKey];
            const newValue = !currentValue;

            set(produce((state: ObjectSettingsStoreProps) => setSettingLogic(state, vxkey, settingKey, newValue)));

            // Notify the animation engine
            const defaultSettings = get().defaultSettings || {};
            const isDefaultValue = defaultSettings[vxkey]?.[settingKey] === newValue;
            const animationEngine = getVXEngineState().getState().animationEngine;

            if (isDefaultValue) {
                animationEngine.hydrateSetting("remove", settingKey, vxkey);
            } else {
                animationEngine.hydrateSetting("set", settingKey, vxkey);
            }

            // Add change to the timelineEditorAPI so that it triggers the disk write
            useTimelineEditorAPI.getState().addChange();
        },
        
        initSettingsForObject: (vxkey, newSettings, defaultSettingsForObject) => {
            set(produce((state: ObjectSettingsStoreProps) => {
                state.defaultSettings[vxkey] = defaultSettingsForObject;

                state.settings[vxkey] = newSettings;
            }))
        },
        initAdditionalSettingsForObject: (vxkey, newSettings) => {
            set(produce((state: ObjectSettingsStoreProps) => {
                state.additionalSettings[vxkey] = newSettings;
            }))
        }, 

        additionalSettings: {},
        setAdditionalSetting: (vxkey, settingKey, settingValue) => {
            set(produce((state: ObjectSettingsStoreProps) => {
                if (state.additionalSettings[vxkey] === undefined) state.additionalSettings[vxkey] = {}; // init the object 
                state.additionalSettings[vxkey][settingKey] = settingValue
            }))
        },

        toggleAdditionalSetting: (vxkey, settingKey) => {
            set(produce((state: ObjectSettingsStoreProps) => {
                if (state.additionalSettings[vxkey] === undefined) state.additionalSettings[vxkey] = {}; // init the object 
                state.additionalSettings[vxkey][settingKey] = !state.additionalSettings[vxkey][settingKey]
            }))
        },
    })
})