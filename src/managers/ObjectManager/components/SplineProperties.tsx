import React, { useEffect, useRef, useState } from 'react'
import { vxSplineProps } from '../types/objectStore'
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import { useObjectPropertyAPI } from '../stores/managerStore'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager'
import { invalidate } from '@react-three/fiber'
import { Slider } from '@vxengine/components/shadcn/slider'
import PropInput from '@vxengine/components/ui/PropInput'
import { Switch } from '@vxengine/components/shadcn/switch'
import { useObjectSettingsAPI } from '../stores/settingsStore'

interface Props {
    vxobject: vxSplineProps
}

const SplineProperties: React.FC<Props> = ({ vxobject: vxSpline }) => {
    const additionalSettings = useObjectSettingsAPI(state => state.additionalSettings[vxSpline.objectVxKey])
    const toggleAdditionalSetting = useObjectSettingsAPI(state => state.toggleAdditionalSetting)

    return (
        <CollapsiblePanel
            title='Spline'
            contentClassName='gap-2'
        >
            <div className='flex flex-row justify-between'>
                <p className="text-xs font-light text-neutral-500">show spline</p>
                <Switch 
                    onClick={() => toggleAdditionalSetting(vxSpline.objectVxKey, "showPositionPath")}
                    checked={additionalSettings?.["showPositionPath"]}
                />
            </div>
            <SplineProgress vxSpline={vxSpline} />
        </CollapsiblePanel>
    )
}

export default SplineProperties



const getDefaultValue = ({ vxkey, propertyPath }: { vxkey: string, propertyPath: string }) => {
    const getProperty = useObjectPropertyAPI.getState().getProperty;
    const val = getProperty(vxkey, propertyPath)
    return val;
}

const SplineProgress = ({ vxSpline }: { vxSpline: vxSplineProps }) => {
    const objectVxKey = vxSpline.objectVxKey;
    const propertyPath = "splineProgress"

    const [value, setValue] = useState(getDefaultValue({ vxkey: objectVxKey, propertyPath }));
    const handlePropertyValueChange = useTimelineEditorAPI(state => state.handlePropertyValueChange)

    useEffect(() => {
        const unsubscribe = useObjectPropertyAPI.subscribe((state, prevState) => {
            const newValue = state.getProperty(objectVxKey, propertyPath);
            const prevValue = prevState.getProperty(objectVxKey, propertyPath);

            if (newValue !== undefined) {
                setValue(newValue);
            }
        })

        return () => unsubscribe();
    }, [])

    const handleChange = (newValue) => {
        handlePropertyValueChange(objectVxKey, propertyPath, newValue)
        setValue(newValue);
        invalidate();
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xs font-light text-neutral-500">progress</p>
            <div className="w-full flex flex-row">
                <Slider
                    max={100}
                    step={0.5}
                    min={0}
                    className='w-24 mr-auto'
                    value={[value]}
                    onValueChange={(newValue) => handleChange(newValue[0])}
                />
                <PropInput propertyPath={propertyPath} vxkey={objectVxKey} />
            </div>
        </div>
    )
}