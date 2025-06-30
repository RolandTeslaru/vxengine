import React, { useMemo } from 'react'
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import { Switch } from '@vxengine/components/shadcn/switch'
import { useObjectSettingsAPI } from '..'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { ISetting } from '@vxengine/AnimationEngine/types/engine'
import { VXObjectSettings } from '@vxengine/vxobject/types'
import SettingNode from '../components/SettingNode'
import ICON_MAP from '../components/ObjectTree/icons'

const excludeSettingsKeys = [
    "showPositionPath"
]

interface Props {
    vxobject: vxObjectProps
}

const SettingsList: React.FC<Props> = ({ vxobject }) => {
    const vxkey = vxobject.vxkey

    const settings = useObjectSettingsAPI(state => state.settings[vxkey])

    const [filteredSettingsArray, filteredSettingsLength] = useMemo(() => {
        if (!settings) return [null, 0];

        const filteredSettings = Object.entries(settings)
            .filter(([key]) => !excludeSettingsKeys.includes(key))
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {} as VXObjectSettings);

        const filteredSettingsArray = Object.entries(filteredSettings)

        return [filteredSettingsArray, filteredSettingsArray.length];
    }, [settings]);

    if (filteredSettingsLength === 0) return null

    return (
        <CollapsiblePanel 
        title="Settings"
        icon={ICON_MAP["Switch"]}
        iconClassName='text-cyan-400'
        >
            <div className="flex flex-col">
                {filteredSettingsArray.map(([settingKey, setting]) => (
                    <SettingNode key={settingKey} vxkey={vxkey} settingKey={settingKey} setting={setting} />
                ))}
            </div>
        </CollapsiblePanel>
    )
}

export default SettingsList