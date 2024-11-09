// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { create } from 'zustand';
import { produce } from "immer"
import { IAdditionalSettingsProps, ISettings } from '@vxengine/AnimationEngine/types/track';
import { getVXEngineState } from '@vxengine/engine';

interface ObjectSettingsStoreProps {
    settings: Record<string, ISettings>
    setSetting: (vxkey: string, settingKey: string, settingValue: string | boolean) => void
    toggleSetting: (vxkey: string, settingKey: string) => void
    initSettings: (newSettings: Record<string, ISettings>) => void;

    additionalSettings: Record<string, IAdditionalSettingsProps>
    setAdditionalSetting: (vxkey: string, settingKey: string, settingValue: boolean | string) => void
    toggleAdditionalSetting: (vxkey: string, settingKey: string) => void;
}

export const useObjectSettingsAPI = create<ObjectSettingsStoreProps>((set, get) => {
    return ({
        settings: {},
        setSetting: (vxkey, settingKey, settingValue) => {
            set(produce((state: ObjectSettingsStoreProps) => {
                if (state.settings[vxkey] === undefined) state.settings[vxkey] = {} // init the object 
                state.settings[vxkey][settingKey] = settingValue
            }))

            const animationEngine = getVXEngineState().getState().animationEngine
            animationEngine.refreshSettings("set", settingKey, vxkey)
        },
        toggleSetting: (vxkey, settingKey) => {
            set(produce((state: ObjectSettingsStoreProps) => {
                if (state.settings[vxkey] === undefined) state.settings[vxkey] = {} // init the object 
                state.settings[vxkey][settingKey] = !state.settings[vxkey][settingKey]
            }))

            const animationEngine = getVXEngineState().getState().animationEngine
            animationEngine.refreshSettings("set", settingKey, vxkey)
        },
        initSettings: (newSettings) => {
            set(produce((state: ObjectSettingsStoreProps) => {
                state.settings = newSettings
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