import React from 'react'
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

    if (!settings || !additionalSettings) return null

    const RenderSetting = ({ settingKey, value, onClick }) => (
        <div key={settingKey} className="flex flex-row py-1">
            <p className="text-xs font-normal text-neutral-500">{settingKey}</p>
            <Switch
                onClick={onClick}
                checked={value}
                className="ml-auto my-auto scale-[80%]"
            />
        </div>
    )

    const renderSettings = (settingsObj, toggleFunction) =>
        Object.entries(settingsObj).map(([settingKey, value]) => (
            !excludeSettingsKeys.includes(settingKey) && (
                <RenderSetting
                    key={settingKey}
                    settingKey={settingKey}
                    value={value}
                    onClick={() => toggleFunction(vxkey, settingKey)}
                />
            )
        ))

    return (
        <>
            <CollapsiblePanel title="Settings">
                <div className="flex flex-col">
                    {renderSettings(settings, toggleSetting)}
                </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Temporary Settings">
                <div className="flex flex-col">
                    {renderSettings(additionalSettings, toggleAdditionalSetting)}
                </div>
            </CollapsiblePanel>
        </>
    )
}

export default SettingsList