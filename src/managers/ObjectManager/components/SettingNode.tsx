import { ISetting } from '@vxengine/AnimationEngine/types/engine'
import { Switch } from '@vxengine/components/shadcn/switch'
import React from 'react'
import { toggleSettingSTATIC } from '../stores/settingsStore'
import { HardDrive, Server } from "@vxengine/components/ui/icons";
interface Props {
    vxkey: string
    settingKey: string
    setting: ISetting
    title?: string
}

const SettingNode: React.FC<Props> = ({ vxkey, settingKey, setting, title }) => {
    return (
        <div className='flex flex-row py-1'>
            <p className="text-xs font-light text-label-quaternary">{title ?? setting.title}</p>
            <div className='flex gap-2 ml-auto'>
                <Switch
                    onClick={() => toggleSettingSTATIC(vxkey, settingKey)}
                    checked={setting.value}
                />
            </div>
        </div>
    )
}

export default SettingNode
