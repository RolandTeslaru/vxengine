import React from 'react'
import { vxSplineProps } from '../types/objectStore'
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import ParamInput from '@vxengine/components/ui/ParamInput'
import { Switch } from '@vxengine/components/shadcn/switch'
import { useObjectSettingsAPI } from '../stores/settingsStore'
import { VXObjectParam } from '@vxengine/vxobject/types'
import { useVXObjectStore } from '../stores/objectStore'
import SettingsList from './SettingsList'

interface Props {
    vxobject: vxSplineProps
}

const handleShowSpline = (objectVxKey: string ) => {
    const toggleSetting = useObjectSettingsAPI.getState().toggleSetting;
    toggleSetting(objectVxKey, "showPositionPath")
}

const progressParam: VXObjectParam = {
    title: "progress",
    propertyPath: "splineProgress",
    type: "slider", min: 0, max: 100, step: 0.5 
}

const tensionParam: VXObjectParam = {
    title: "tension",
    propertyPath: "splineTension",
    type: "slider", min: 0, max: 1, step: 0.01
}

const SplineParams: React.FC<Props> = ({ vxobject: vxSpline }) => {
    const settings = useObjectSettingsAPI(state => state.settings[vxSpline?.objectVxKey])
    const targetObjectVXKey = vxSpline.objectVxKey;
    const targetVXObject = useVXObjectStore(state => state.objects[targetObjectVXKey]);
    
    return (
        <>
            <CollapsiblePanel
                title='Spline'
                contentClassName='gap-2'
            >
                <div className='flex flex-row justify-between'>
                    <p className="text-xs font-light my-auto text-neutral-400">show spline</p>
                    <Switch
                        onClick={() => handleShowSpline(vxSpline.objectVxKey)}
                        checked={settings?.["showPositionPath"].value}
                    />
                </div>
                <ParamInput
                    param={progressParam}
                    vxObject={vxSpline}
                    vxkey={vxSpline.objectVxKey}
                />
                <ParamInput
                    param={tensionParam}
                    vxObject={vxSpline}
                    vxkey={vxSpline.objectVxKey}
                />
            </CollapsiblePanel>

            <SettingsList vxobject={targetVXObject}/>
        </>
    )
}

export default SplineParams

