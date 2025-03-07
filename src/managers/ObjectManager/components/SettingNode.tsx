import { ISetting } from '@vxengine/AnimationEngine/types/engine'
import { Switch } from '@vxengine/components/shadcn/switch'
import React from 'react'
import { toggleSettingSTATIC } from '../stores/settingsStore'

interface Props {
    vxkey: string
    settingKey: string
    setting: ISetting
    title?: string
}

const SettingNode:React.FC<Props> = ({vxkey, settingKey, setting, title}) => {
    return (
        <div className='flex flex-row py-1'>
            <p className="text-xs font-light text-neutral-400">{title ?? setting.title}</p>
            <Switch
                onClick={() => toggleSettingSTATIC(vxkey, settingKey)}
                checked={setting.value}
                className="ml-auto my-auto"
            />
        </div>
    )
}

export default SettingNode
