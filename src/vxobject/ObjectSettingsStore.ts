// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { create } from 'zustand';
import { produce } from "immer"
import { IAdditionalSettingsProps, ISettings } from '@vxengine/AnimationEngine/types/track';

interface ObjectSettingsStoreProps {
    settings: Record<string, ISettings>
    setSetting: (vxkey: string, settingKey: string, settingValue: string) => void
    toggleSetting: (vxkey: string, settingKey: string) => void
    initSettings: (newSettings: Record<string, ISettings>) => void;

    additionalSettings: Record<string, IAdditionalSettingsProps>
    setAdditionalSetting: (vxkey: string, settingKey: string, settingValue: boolean | string) => void
    toggleAdditionalSetting: (vxkey: string, settingKey: string) => void;
}

export const useObjectSettingsStore = create<ObjectSettingsStoreProps>((set, get) => ({
    settings: {},
    setSetting: (vxkey, settingKey, settingValue) => {
        set(produce((state: ObjectSettingsStoreProps) => {
            state.settings[vxkey][settingKey] = settingValue
        }))
    },
    toggleSetting: (vxkey, settingKey) => {
        set(produce((state: ObjectSettingsStoreProps) => {
            state.settings[vxkey][settingKey] = !state.settings[vxkey][settingKey]
        }))
    },
    initSettings: (newSettings) => {
        set(produce((state: ObjectSettingsStoreProps) => {
            state.settings = newSettings
        }))
    },

    additionalSettings: {},
    setAdditionalSetting: (vxkey, settingKey, settingValue) => {
        set(produce((state: ObjectSettingsStoreProps) => {
            if(state.additionalSettings[vxkey] === undefined)
                state.additionalSettings[vxkey] = {};
            state.additionalSettings[vxkey][settingKey] = settingValue
        }))
    },
    toggleAdditionalSetting: (vxkey, settingKey) => {
        set(produce((state: ObjectSettingsStoreProps) => {
            if(state.additionalSettings[vxkey] === undefined)
                state.additionalSettings[vxkey] = {};
            state.additionalSettings[vxkey][settingKey] = !state.additionalSettings[vxkey][settingKey]
        }))
    },
}))