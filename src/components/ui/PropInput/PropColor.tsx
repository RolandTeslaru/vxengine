import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import ColorPicker, { Color, hsl, hslToHex } from '../ColorPicker';
import { getProperty, useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/stores/managerStore';
import { Popover, PopoverContent, PopoverTrigger } from '@vxengine/components/shadcn/popover';
import KeyframeControl from '../KeyframeControl';
import ValueRenderer from '../ValueRenderer';
import { handlePropertyValueChange } from '@vxengine/managers/TimelineManager/store';
import { getNestedProperty } from '@vxengine/utils';
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { hslToRgb } from './utils';
import { invalidate } from '@react-three/fiber';

interface PropColorProps {
    vxkey: string
    propertyPath: string
    vxObject: vxObjectProps
}

const getDefaultValue = (vxkey: string, propertyPath: string, ref: any) => getProperty(vxkey, propertyPath) || getNestedProperty(ref, propertyPath) || 0

const PropColor: React.FC<PropColorProps> = ({ vxObject, vxkey, propertyPath }) => {
    const rPropertyPath = propertyPath !== "_" ? `${propertyPath}.r` : "r"
    const gPropertyPath = propertyPath !== "_" ? `${propertyPath}.g` : "g"
    const bPropertyPath = propertyPath !== "_" ? `${propertyPath}.b` : "b"

    const rTrackKey = `${vxkey}.${rPropertyPath}`
    const gTrackKey = `${vxkey}.${gPropertyPath}`
    const bTrackKey = `${vxkey}.${bPropertyPath}`

    const colorRef = useRef({ h: 1, s: 1, l: 1 })
    const colorPreviewRef = useRef<HTMLDivElement>(null);
    const colorPickerRef = useRef<{ updateRefs: (hsl: hsl) => void}>(null)


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

            colorRef.current = hsl;

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

        handlePropertyValueChange(vxkey, rPropertyPath, r);
        handlePropertyValueChange(vxkey, gPropertyPath, g);
        handlePropertyValueChange(vxkey, bPropertyPath, b);

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
                        handleColorChange={handleColorChange}
                    />

                    <div className='flex flex-col gap-2'>
                        <div className='flex gap-2 mt-2 justify-between'>
                            <p className='text-xs my-auto'>red</p>
                            <div className='flex flex-row gap-2'>
                                <div className='my-auto'>
                                    <KeyframeControl trackKey={rTrackKey} disabled={false} />
                                </div>
                                <ValueRenderer vxObject={vxObject} vxkey={vxkey} propertyPath={rPropertyPath} inputProps={{ min: 0, max: 1, step: 0.005}} />
                            </div>
                        </div>
                        <div className='flex gap-2 justify-between'>
                            <p className='text-xs my-auto'>green</p>
                            <div className='flex flex-row gap-2'>
                                <div className='my-auto'>
                                    <KeyframeControl trackKey={gTrackKey} disabled={false} />
                                </div>
                                <ValueRenderer vxObject={vxObject} vxkey={vxkey} propertyPath={gPropertyPath} inputProps={{ min: 0, max: 1, step: 0.005}}/>
                            </div>
                        </div>
                        <div className='flex gap-2 justify-between'>
                            <p className='text-xs my-auto'>blue</p>
                            <div className='flex flex-row gap-2'>
                                <div className='my-auto'>
                                    <KeyframeControl trackKey={bTrackKey} disabled={false} />
                                </div>
                                <ValueRenderer vxObject={vxObject} vxkey={vxkey} propertyPath={bPropertyPath} inputProps={{ min: 0, max: 1, step: 0.005}}/>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

        </>
    )
}
export default PropColor



// Convert RGB to HSL and update color
const rgbToHsl = (r: number, g: number, b: number): hsl => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
};