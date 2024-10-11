import React from 'react'
import CollapsiblePanel from '@vxengine/components/ui/CollapsiblePanel'
import { useObjectSettingsAPI } from '@vxengine/vxobject/ObjectSettingsStore'
import { Switch } from '@vxengine/components/shadcn/switch'
import { useObjectManagerAPI } from '..'

const excludeSettingsKeys = [
    "useSplinePath",
    "showPositionPath"
]

const SettingsList = () => {
    const vxkey = useObjectManagerAPI(state => state.selectedObjects[0]?.vxkey)
    const settings = useObjectSettingsAPI(state => state.settings[vxkey])
    const toggleSetting = useObjectSettingsAPI(state => state.toggleSetting)

    if (settings === null || settings === undefined) return

    return (
        <>
            {Object.entries(settings).length > 0 && (
                <CollapsiblePanel title={"Settings"}>
                    <div className='flex flex-col'>
                        {Object.entries(settings).map(([settingKey, value]) => {
                            if (!excludeSettingsKeys.includes(settingKey)) {
                                return (
                                    <>
                                        <div key={settingKey} className="flex flex-row py-1">
                                            <p className="text-xs font-light text-neutral-500">{settingKey}</p>
                                            <Switch
                                                onClick={() => toggleSetting(vxkey, settingKey)}
                                                checked={value}
                                                className='ml-auto my-auto scale-[80%]'
                                            />
                                        </div>
                                    </>
                                )
                            }
                            else return <></>
                        }
                        )}
                    </div>
                </CollapsiblePanel>
            )}
        </>
    )
}

export default SettingsList