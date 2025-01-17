import { invalidate } from '@react-three/fiber'
import { Input } from '@vxengine/components/shadcn/input'
import { Slider } from '@vxengine/components/shadcn/slider'
import { getProperty, useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/stores/managerStore'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { handlePropertyValueChange } from '@vxengine/managers/TimelineManager/store'
import { getNestedProperty } from '@vxengine/utils'
import { VXSliderInputType } from '@vxengine/vxobject/types'
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'

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
    }, [])

    const handleChange = useCallback((newValue: number) => {
        handlePropertyValueChange(vxkey, propertyPath, newValue);
        setValue(newValue)
        invalidate();
    }, [vxkey, propertyPath]);

    return (
        <Slider
            max={param.max}
            min={param.min}
            step={param.step ?? 0.1}
            className={"w-36 " + className}
            value={[value]}
            onValueChange={(newValue) => handleChange(newValue[0])}
        />
    )
}

export default PropSlider
