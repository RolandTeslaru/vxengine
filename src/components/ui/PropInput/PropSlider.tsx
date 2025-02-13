import { invalidate } from '@react-three/fiber'
import { Slider } from '@vxengine/components/shadcn/slider'
import { getProperty, useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/stores/managerStore'
import { VXSliderInputType } from '@vxengine/vxobject/types'
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { modifyPropertyValue } from '@vxengine/managers/TimelineManager/store'

interface Props {
    vxkey: string
    propertyPath: string
    className?: string
    param: VXSliderInputType
}

const getDefaultValue = (vxkey: string, propertyPath: string) => getProperty(vxkey,propertyPath) || 0

const PropSlider: React.FC<Props> = ({ param, vxkey, propertyPath, className }) => {
    const trackKey = `${vxkey}.${propertyPath}`

    const [value, setValue] = useState(getDefaultValue(vxkey, propertyPath))

    useLayoutEffect(() => {
        const unsubscribe = useObjectPropertyAPI.subscribe((state, prevState) => {
            const newValue = state.properties[trackKey]

            if (newValue !== undefined) {
                setValue(newValue);
            }
        })

        return () => unsubscribe();
    }, [vxkey, propertyPath])

    const handleChange = useCallback((newValue: number) => {
        modifyPropertyValue("changing", vxkey, propertyPath, newValue);
        invalidate();
    }, [vxkey, propertyPath]);

    return (
        <Slider
            max={param.max}
            min={param.min}
            step={param.step ?? 0.1}
            className={"w-24 " + className}
            value={[value]}
            onValueChange={(newValue) => handleChange(newValue[0])}
            onDragStart={() => {
                modifyPropertyValue("start", vxkey, propertyPath, value)
            }}
            onDragEnd={() => {
                modifyPropertyValue("end", vxkey, propertyPath, value)
            }}
        />
    )
}

export default PropSlider
