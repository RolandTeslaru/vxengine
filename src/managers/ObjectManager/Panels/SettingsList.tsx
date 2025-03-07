import React, { useMemo } from 'react'
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import { Switch } from '@vxengine/components/shadcn/switch'
import { useObjectSettingsAPI } from '..'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { ISetting } from '@vxengine/AnimationEngine/types/engine'
import { VXObjectSettings } from '@vxengine/vxobject/types'
import SettingNode from '../components/SettingNode'

const excludeSettingsKeys = [
    "showPositionPath"
]

interface Props {
    vxobject: vxObjectProps
}

const SettingsList: React.FC<Props> = ({ vxobject }) => {
    const vxkey = vxobject.vxkey

    const settings = useObjectSettingsAPI(state => state.settings[vxkey])

    const filteredSettings = useMemo(() => {
        if(!settings) return {};

        return Object.entries(settings)
            .filter(([key]) => !excludeSettingsKeys.includes(key))
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {} as VXObjectSettings);
    }, [settings]);

    return (
        <>
            {Object.values(filteredSettings).length > 0 &&
                <CollapsiblePanel title="Settings">
                    <div className="flex flex-col">
                        {Object.entries(settings).map(([settingKey, setting]) => (
                            !excludeSettingsKeys.includes(settingKey) && 
                                <SettingNode key={settingKey} vxkey={vxkey} settingKey={settingKey} setting={setting}/>
                        ))}
                    </div>
                </CollapsiblePanel>
            }
        </>
    )
}

export default SettingsList