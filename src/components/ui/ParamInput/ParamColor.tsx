import React, { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { getProperty, useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/stores/managerStore';
import { Popover, PopoverContent, PopoverTrigger } from '@vxengine/components/shadcn/popover';
import KeyframeControl from '../KeyframeControl';
import ValueRenderer from '../ValueRenderer';
import { modifyPropertyValue } from '@vxengine/managers/TimelineManager/store';
import { getNestedProperty } from '@vxengine/utils';
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { hslToRgb, rgbToHsl } from './utils';
import { invalidate } from '@react-three/fiber';
import { RgbaColorPicker } from "react-colorful";
import ColorPicker from '../ColorPicker';
import { hsl } from "../ColorPicker/types"

interface ParamColorProps {
    vxkey: string
    param: { propertyPath: string }
    vxObject: vxObjectProps
}

const getDefaultValue = (vxkey: string, propertyPath: string, ref: any) => getProperty(vxkey, propertyPath) || getNestedProperty(ref, propertyPath) || 0

const ParamColor: React.FC<ParamColorProps> = ({ vxObject, vxkey, param }) => {
    const { propertyPath } = param;
    const rPropertyPath = propertyPath !== "" ? `${propertyPath}.r` : "r"
    const gPropertyPath = propertyPath !== "" ? `${propertyPath}.g` : "g"
    const bPropertyPath = propertyPath !== "" ? `${propertyPath}.b` : "b"

    const rTrackKey = `${vxkey}.${rPropertyPath}`
    const gTrackKey = `${vxkey}.${gPropertyPath}`
    const bTrackKey = `${vxkey}.${bPropertyPath}`

    const colorRef = useRef({ h: 1, s: 1, l: 1 })
    const colorPreviewRef = useRef<HTMLDivElement>(null);
    const colorPickerRef = useRef<{ updateRefs: (hsl: hsl) => void }>(null)


    // Initialize
    useLayoutEffect(() => {
        const r = getDefaultValue(vxkey, rPropertyPath, vxObject.ref.current);
        const g = getDefaultValue(vxkey, gPropertyPath, vxObject.ref.current);
        const b = getDefaultValue(vxkey, bPropertyPath, vxObject.ref.current);

        const hsl = rgbToHsl(r, g, b);
        colorRef.current = hsl
        const lighterLightness = Math.min(hsl.l + 10, 100);
        colorPreviewRef.current.style.backgroundColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        colorPreviewRef.current.style.borderColor = `hsl(${hsl.h}, ${hsl.s}%, ${lighterLightness}%)`;
    }, [vxkey])

    useLayoutEffect(() => {
        const unsubscribe = useObjectPropertyAPI.subscribe((state) => {
            const newRedValue = state.properties[rTrackKey] as number;
            const newGreenValue = state.properties[gTrackKey] as number;
            const newBlueValue = state.properties[bTrackKey] as number;

            const hsl = rgbToHsl(newRedValue, newGreenValue, newBlueValue);

            const lighterLightness = Math.min(hsl.l + 10, 100);

            colorPreviewRef.current.style.backgroundColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
            colorPreviewRef.current.style.borderColor = `hsl(${hsl.h}, ${hsl.s}%, ${lighterLightness}%)`;

            colorPickerRef.current?.updateRefs(hsl);
        });

        return () => unsubscribe();
    }, [vxkey]);

    // Handle color changes from ColorPicker

    const handleColorChange = useCallback((hsl: hsl) => {
        colorRef.current = hsl
        const { r, g, b } = hslToRgb(hsl.h, hsl.s, hsl.l);

        modifyPropertyValue("changing", vxkey, rPropertyPath, r, false);
        modifyPropertyValue("changing", vxkey, gPropertyPath, g, false);
        modifyPropertyValue("changing", vxkey, bPropertyPath, b, true);

        colorPreviewRef.current.style.backgroundColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

        invalidate();
    }, [])
    const handleColorChangeStart = useCallback((hsl: hsl) => {
        colorRef.current = hsl
        const { r, g, b } = hslToRgb(hsl.h, hsl.s, hsl.l);

        modifyPropertyValue("start", vxkey, rPropertyPath, r, false);
        modifyPropertyValue("start", vxkey, gPropertyPath, g, false);
        modifyPropertyValue("start", vxkey, bPropertyPath, b, true);

        colorPreviewRef.current.style.backgroundColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

        invalidate();
    }, [])
    const handleColorChangeEnd = useCallback((hsl: hsl) => {
        colorRef.current = hsl
        const { r, g, b } = hslToRgb(hsl.h, hsl.s, hsl.l);

        modifyPropertyValue("end", vxkey, rPropertyPath, r, false);
        modifyPropertyValue("end", vxkey, gPropertyPath, g, false);
        modifyPropertyValue("end", vxkey, bPropertyPath, b, true);

        colorPreviewRef.current.style.backgroundColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

        invalidate();
    }, [])


    return (
        <>
            <Popover>
                <PopoverTrigger disableStyling>
                    <div
                        ref={colorPreviewRef}
                        className={`w-10 h-5 rounded-md border shadow-md`}
                    />
                </PopoverTrigger>
                <PopoverContent className='w-52'>
                    <ColorPicker
                        ref={colorPickerRef}
                        colorRef={colorRef}
                        handleColorChangeStart={handleColorChangeStart}
                        handleColorChange={handleColorChange}
                        handleColorChangeEnd={handleColorChangeEnd}
                    />

                    <div className='flex flex-col gap-2'>
                        <div className='flex gap-2 mt-2 justify-between'>
                            <p className='text-xs my-auto'>red</p>
                            <div className='flex flex-row gap-2'>
                                <div className='my-auto'>
                                    <KeyframeControl 
                                        vxkey={vxkey}  
                                        param={{
                                            propertyPath: rPropertyPath
                                        }}
                                        disabled={false} 
                                    />
                                </div>
                                <ValueRenderer vxObject={vxObject} vxkey={vxkey} param={{propertyPath: rPropertyPath}} inputProps={{ min: 0, max: 1, step: 0.005 }} 
                                />
                            </div>
                        </div>
                        <div className='flex gap-2 justify-between'>
                            <p className='text-xs my-auto'>green</p>
                            <div className='flex flex-row gap-2'>
                                <div className='my-auto'>
                                    <KeyframeControl 
                                        vxkey={vxkey} 
                                        disabled={false} 
                                        param={{ propertyPath: gPropertyPath }}
                                    />
                                </div>
                                <ValueRenderer vxObject={vxObject} vxkey={vxkey} param={{ propertyPath: gPropertyPath }} inputProps={{ min: 0, max: 1, step: 0.005 }} />
                            </div>
                        </div>
                        <div className='flex gap-2 justify-between'>
                            <p className='text-xs my-auto'>blue</p>
                            <div className='flex flex-row gap-2'>
                                <div className='my-auto'>
                                    <KeyframeControl 
                                        vxkey={vxkey} 
                                        param={{ propertyPath: bPropertyPath }} 
                                        disabled={false} 
                                    />
                                </div>
                                <ValueRenderer vxObject={vxObject} vxkey={vxkey} param={{propertyPath: bPropertyPath}} inputProps={{ min: 0, max: 1, step: 0.005 }} />
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

        </>
    )
}

export default ParamColor    