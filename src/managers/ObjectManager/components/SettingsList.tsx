import React, { useMemo } from 'react'
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import { Switch } from '@vxengine/components/shadcn/switch'
import { useObjectSettingsAPI } from '..'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { ISetting } from '@vxengine/AnimationEngine/types/engine'
import { VXObjectSettings } from '@vxengine/vxobject/types'

const excludeSettingsKeys = [
    "showPositionPath"
]

interface Props {
    vxobject: vxObjectProps
}

const SettingsList: React.FC<Props> = ({ vxobject }) => {
    const vxkey = vxobject.vxkey

    const settings = useObjectSettingsAPI(state => state.settings[vxkey])
    const toggleSetting = useObjectSettingsAPI(state => state.toggleSetting)

    const filteredSettings = useMemo(() => {
        if(!settings) return null;

        return Object.entries(settings)
            .filter(([key]) => !excludeSettingsKeys.includes(key))
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {} as VXObjectSettings);
    }, [settings]);

    if (!filteredSettings) return null


    const renderSettings = (settingsObj, toggleFunction) =>
        Object.entries(settingsObj).map(([settingKey, setting]: [settingKey: string, value: ISetting]) => (
            !excludeSettingsKeys.includes(settingKey) && (
                <div key={settingKey} className="flex flex-row py-1">
                    <p className="text-xs font-light text-neutral-400">{setting.title}</p>
                    <Switch
                        onClick={() => toggleFunction(vxkey, settingKey)}
                        checked={setting.value}
                        className="ml-auto my-auto scale-[80%]"
                    />
                </div>
            )
        ))

    return (
        <>
            {Object.values(filteredSettings).length > 0 &&
                <CollapsiblePanel title="Settings">
                    <div className="flex flex-col">
                        {renderSettings(settings, toggleSetting)}
                    </div>
                </CollapsiblePanel>
            }
        </>
    )
}

export default SettingsList