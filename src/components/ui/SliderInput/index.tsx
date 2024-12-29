import { invalidate } from '@react-three/fiber'
import { Input } from '@vxengine/components/shadcn/input'
import { Slider } from '@vxengine/components/shadcn/slider'
import { getProperty, useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/stores/managerStore'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { handlePropertyValueChange } from '@vxengine/managers/TimelineManager/store'
import { getNestedProperty } from '@vxengine/utils'
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'

interface Props {
    vxObject: vxObjectProps
    propertyPath: string
    isPropertyTracked?: boolean
}

const getDefaultValue = (vxkey: string, propertyPath: string, ref: any) => getProperty(vxkey, propertyPath) || getNestedProperty(ref, propertyPath)

const SliderInput: React.FC<Props> = ({ vxObject, propertyPath, isPropertyTracked }) => {
    const vxkey = vxObject.vxkey;
    const trackKey = `${vxkey}.${propertyPath}`
    const ref = vxObject.ref.current;

    const inputRef = useRef<HTMLInputElement>(null)

    const [value, setValue] = useState();

    useLayoutEffect(() => {
        inputRef.current.value = getDefaultValue(vxObject.vxkey, propertyPath, ref);
    }, [vxkey, propertyPath, isPropertyTracked])

    useLayoutEffect(() => {
        const unsubscribe = useObjectPropertyAPI.subscribe((state, prevState) => {
            const newValue = state.properties[trackKey];

            if (inputRef.current && newValue) {
                if (newValue.toString() !== inputRef.current.value) {
                    inputRef.current.value = newValue.toString()
                    setValue(newValue);
                }
            }
        });

        return () => unsubscribe();
    }, [])

    const handleChange = useCallback((newValue: number ) => {
        handlePropertyValueChange(vxkey, propertyPath, newValue)


        invalidate();
    }, [vxObject])

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
                <Input
                    ref={inputRef}
                    value={value}
                    type='number'
                    onChange={(e) => handleChange(parseFloat(e.target.value)) }
                    className="h-fit text-[10px] bg-neutral-800 p-0.5 max-w-[40px] border border-neutral-700"
                    style={{ boxShadow: "1px 1px 5px 1px rgba(1,1,1,0.2)" }}
                />
            </div>
        </div>
    )
}

export default SliderInput