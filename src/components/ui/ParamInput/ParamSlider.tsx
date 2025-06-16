import { invalidate } from '@react-three/fiber'
import { Slider } from '@vxengine/components/shadcn/slider'
import { getProperty, updateProperty, useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/stores/managerStore'
import { VXSliderInputType } from '@vxengine/vxobject/types'
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from '@vxengine/utils'
import s from "./styles.module.scss"
import classNames from 'classnames'
import KeyframeControl from '../KeyframeControl'
import animationEngineInstance from '@vxengine/singleton'
import { getDefaultParamValue } from './utils'

interface Props {
    vxkey: string
    propertyPath: string
    className?: string
    param: VXSliderInputType
    vxRefObj: React.RefObject<any>
    paramSliderRangeClassname?: string
    titleClassname?: string
}

const ParamSlider: React.FC<Props> = ({ param, vxkey, paramSliderRangeClassname, titleClassname, className, vxRefObj }) => {
    const { propertyPath } = param;
    const trackKey = `${vxkey}.${propertyPath}`

    const [value, setValue] = useState(getDefaultParamValue(vxkey, propertyPath, vxRefObj.current))

    useLayoutEffect(() => {
        setValue(getDefaultParamValue(vxkey, propertyPath, vxRefObj.current))
        const unsubscribe = useObjectPropertyAPI.subscribe((state, prevState) => {
            const newValue = state.properties[trackKey]

            if (newValue !== undefined) {
                setValue(newValue);
            }
        })

        return () => unsubscribe();
    }, [vxkey, propertyPath])

    const handleChange = useCallback((newValue: number) => {
        animationEngineInstance
            .paramModifierService
            .modifyParamValue(vxkey, propertyPath, newValue, true)
    }, [vxkey, propertyPath]);

    const valueRef = useRef(value);

    return (
        <div className='w-full h-[17px] my-auto rounded-full overflow-hidden'>
            <SliderPrimitive.Root
                className={cn(
                    "relative flex w-full touch-none select-none items-center ",
                )}
                value={[value]}
                onValueChange={(newValue) => {
                    valueRef.current = newValue[0]
                    handleChange(newValue[0])
                }}
                onValueCommit={() => {
                    updateProperty(vxkey, propertyPath, valueRef.current)

                    animationEngineInstance
                        .paramModifierService
                        .flushTimelineStateUpdates()
                }}
                max={param.max}
                min={param.min}
                step={param.step ?? 0.1}
            >
                <div className='absolute left-0 z-10 flex w-full ml-1'>
                    <p className={'font-medium antialiased text-neutral-300/80 text-xs ' + titleClassname}>{param.title ?? param.propertyPath}</p>
                </div>
                <SliderPrimitive.Track className="relative bg-neutral-800/70 cursor-ew-resize h-[17px] w-full grow overflow-hidden rounded-full "
                >
                    <SliderPrimitive.Range className={`
                        absolute h-full bg-blue-700 
                        border-l border-t border-b rounded-l-full border-blue-600
                        ${paramSliderRangeClassname}
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
