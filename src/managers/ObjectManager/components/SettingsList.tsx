import React, { useMemo } from 'react'
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import { Switch } from '@vxengine/components/shadcn/switch'
import { useObjectSettingsAPI } from '..'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'

const excludeSettingsKeys = [
    "useSplinePath",
    "showPositionPath"
]

interface Props {
    vxobject: vxObjectProps
}

const SettingsList: React.FC<Props> = ({ vxobject }) => {
    const vxkey = vxobject.vxkey

    const settings = useObjectSettingsAPI(state => state.settings[vxkey])
    const toggleSetting = useObjectSettingsAPI(state => state.toggleSetting)
    const additionalSettings = useObjectSettingsAPI(state => state.additionalSettings[vxkey])
    const toggleAdditionalSetting = useObjectSettingsAPI(state => state.toggleAdditionalSetting)

    const filteredSettings = useMemo(() => {
        if(!settings) return null;

        return Object.entries(settings)
            .filter(([key]) => !excludeSettingsKeys.includes(key))
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {} as Record<string, any>);
    }, [settings]);

    const filteredAdditionalSettings = useMemo(() => {
        if(!additionalSettings) return null;

        return Object.entries(additionalSettings)
            .filter(([key]) => !excludeSettingsKeys.includes(key))
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {} as Record<string, any>);
    }, [additionalSettings]);

    if (!filteredSettings || !filteredAdditionalSettings) return null


    const renderSettings = (settingsObj, toggleFunction) =>
        Object.entries(settingsObj).map(([settingKey, value]) => (
            !excludeSettingsKeys.includes(settingKey) && (
                <div key={settingKey} className="flex flex-row py-1">
                    <p className="text-xs font-light text-neutral-400">{settingKey}</p>
                    <Switch
                        onClick={() => toggleFunction(vxkey, settingKey)}
                        checked={value as any}
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
            {Object.values(filteredAdditionalSettings).length > 0 &&
                <CollapsiblePanel title="Temporary Settings">
                    <div className="flex flex-col">
                        {renderSettings(additionalSettings, toggleAdditionalSetting)}
                    </div>
                </CollapsiblePanel>
            }
        </>
    )
}

export default SettingsList