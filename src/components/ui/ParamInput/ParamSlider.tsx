import { invalidate } from '@react-three/fiber'
import { Slider } from '@vxengine/components/shadcn/slider'
import { getProperty, useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/stores/managerStore'
import { VXSliderInputType } from '@vxengine/vxobject/types'
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { modifyPropertyValue } from '@vxengine/managers/TimelineManager/store'
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from '@vxengine/utils'
import s from "./styles.module.scss"
import classNames from 'classnames'
import KeyframeControl from '../KeyframeControl'

interface Props {
    vxkey: string
    propertyPath: string
    className?: string
    param: VXSliderInputType
}

const getDefaultValue = (vxkey: string, propertyPath: string) => getProperty(vxkey, propertyPath) || 0

const ParamSlider: React.FC<Props> = ({ param, vxkey, className }) => {
    const { propertyPath } = param;
    const trackKey = `${vxkey}.${propertyPath}`

    const [value, setValue] = useState(getDefaultValue(vxkey, propertyPath))
    const [isDragging, setIsDragging] = useState(false);

    useLayoutEffect(() => {
        setValue(getDefaultValue(vxkey, propertyPath))
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

    useLayoutEffect(() => {

    }, [vxkey, propertyPath]);

    return (
        <div className='w-full h-[17px] my-auto rounded-full overflow-hidden'>
            <SliderPrimitive.Root
                className={cn(
                    "relative flex w-full touch-none select-none items-center ",
                    className
                )}
                value={[value]}
                onValueChange={(newValue) => {
                    handleChange(newValue[0])
                }}
                // onMouseDown={() => {
                //     setIsDragging(true);
                //     console.log("Starting Drag");
                //     modifyPropertyValue("start", vxkey, propertyPath, value)}}
                onValueCommit={() => {
                    modifyPropertyValue("end", vxkey, propertyPath, value)}}
                
                max={param.max}
                min={param.min}
                step={param.step ?? 0.1}
            >
                <div className='absolute left-0 z-10 flex w-full ml-1'>
                    <p className=' text-neutral-300/80 '>{param.title ?? param.propertyPath}</p>
                </div>
                <SliderPrimitive.Track className="relative bg-neutral-800/70 cursor-ew-resize h-[17px] w-full grow overflow-hidden rounded-full "
                >
                    <SliderPrimitive.Range className={`
                        absolute h-full bg-blue-700 
                        border-l border-t border-b rounded-l-full border-blue-600
                         `}
                    />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb
                    className="block h-[19px] w-[2px] bg-neutral-400"
                />
            </SliderPrimitive.Root>
        </div>
    )
}

export default ParamSlider
