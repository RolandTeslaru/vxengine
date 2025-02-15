import React from 'react'
import { vxSplineProps } from '../types/objectStore'
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import PropInput from '@vxengine/components/ui/PropInput'
import { Switch } from '@vxengine/components/shadcn/switch'
import { useObjectSettingsAPI } from '../stores/settingsStore'

interface Props {
    vxobject: vxSplineProps
}

const handleShowSpline = (objectVxKey: string ) => {
    const toggleSetting = useObjectSettingsAPI.getState().toggleSetting;
    toggleSetting(objectVxKey, "showPositionPath")
}

const SplineProperties: React.FC<Props> = ({ vxobject: vxSpline }) => {
    const settings = useObjectSettingsAPI(state => state.settings[vxSpline?.objectVxKey])
    
    return (
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
            <div className="flex flex-col w-full gap-1 ">
                <p className="text-xs font-light my-auto text-neutral-400">progress</p>
                <PropInput
                    param={{ type: "slider", min: 0, max: 100, step: 0.5 }}
                    propertyPath={"splineProgress"}
                    vxObject={vxSpline}
                    vxkey={vxSpline.objectVxKey}
                />
            </div>
            <div className="flex flex-col w-full gap-1 ">
                <p className="text-xs font-light my-auto text-neutral-400">tension</p>
                <PropInput
                    param={{ type: "slider", min: 0, max: 1, step: 0.01 }}
                    propertyPath={"splineTension"}
                    vxObject={vxSpline}
                    vxkey={vxSpline.objectVxKey}
                />
            </div>
        </CollapsiblePanel>
    )
}

export default SplineProperties

