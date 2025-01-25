import React, { useEffect, useRef, useState } from 'react'
import { vxSplineProps } from '../types/objectStore'
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import { getProperty, useObjectPropertyAPI } from '../stores/managerStore'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager'
import { invalidate } from '@react-three/fiber'
import { Slider } from '@vxengine/components/shadcn/slider'
import PropInput from '@vxengine/components/ui/PropInput'
import { Switch } from '@vxengine/components/shadcn/switch'
import { useObjectSettingsAPI } from '../stores/settingsStore'
import { handlePropertyValueChange } from '@vxengine/managers/TimelineManager/store'

interface Props {
    vxobject: vxSplineProps
}

const handleShowSpline = (objectVxKey: string ) => {
    const toggleAdditionalSetting = useObjectSettingsAPI.getState().toggleAdditionalSetting;
    toggleAdditionalSetting(objectVxKey, "showPositionPath")
}

const SplineProperties: React.FC<Props> = ({ vxobject: vxSpline }) => {
    const additionalSettings = useObjectSettingsAPI(state => state.additionalSettings[vxSpline.objectVxKey])

    return (
        <CollapsiblePanel
            title='Spline'
            contentClassName='gap-2'
        >
            <div className='flex flex-row justify-between'>
                <p className="text-xs font-light my-auto text-neutral-400">show spline</p>
                <Switch
                    onClick={() => handleShowSpline(vxSpline.objectVxKey)}
                    checked={additionalSettings?.["showPositionPath"]}
                />
            </div>
            <div className="flex flex-col w-full gap-2 border-t-neutral-800 border-t">
                <p className="text-xs font-light my-auto text-neutral-400">progress</p>
                <PropInput
                    param={{ type: "slider", min: 0, max: 100, step: 0.5 }}
                    propertyPath={"splineProgress"}
                    vxObject={vxSpline}
                    vxkey={vxSpline.objectVxKey}
                />
            </div>
        </CollapsiblePanel>
    )
}

export default SplineProperties

