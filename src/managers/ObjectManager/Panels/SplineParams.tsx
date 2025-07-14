import React from 'react'
import { vxSplineProps } from '../types/objectStore'
import CollapsiblePanel from '@vxengine/ui/components/CollapsiblePanel'
import ParamInput from '@vxengine/ui/components/ParamInput'
import { Switch } from '@vxengine/ui/foundations'
import { useObjectSettingsAPI } from '../stores/settingsStore'
import { VXElementParam } from '@vxengine/vxobject/types'
import { useVXObjectStore } from '../stores/objectStore'
import { invalidate } from '@react-three/fiber'
import { Button } from '@vxengine/ui/foundations/button'
import { splinePathToggleCallback } from '../utils/deufaltSettingsCallbacks'
import { ISetting } from '@vxengine/AnimationEngine/types/engine'

interface Props {
    vxobject: vxSplineProps
}

const handleShowSpline = (objectVxKey: string ) => {
    const toggleSetting = useObjectSettingsAPI.getState().toggleSetting;
    toggleSetting(objectVxKey, "showPositionPath")
    invalidate()
}

const progressParam: VXElementParam = {
    title: "progress",
    propertyPath: "splineProgress",
    type: "slider", min: 0, max: 100, step: 0.5 
}

const tensionParam: VXElementParam = {
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
                    vxRefObj={vxSpline.ref}
                    vxkey={vxSpline.objectVxKey}
                />
                <ParamInput
                    param={tensionParam}
                    vxRefObj={vxSpline.ref}
                    vxkey={vxSpline.objectVxKey}
                />
                <Button className='text-red-600' 
                    onClick={() => {
                        splinePathToggleCallback(targetObjectVXKey, "splinePath", {
                            value: true,
                            storage: "disk",
                            title: "Spline Path"
                        } as ISetting)
                    }}
                >
                    Delete Spline
                </Button>
            </CollapsiblePanel>
        </>
    )
}

export default SplineParams

