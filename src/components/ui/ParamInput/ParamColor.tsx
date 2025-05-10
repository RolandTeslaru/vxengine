import React, { useCallback, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/stores/managerStore';
import { Popover, PopoverContent, PopoverTrigger } from '@vxengine/components/shadcn/popover';
import { hslToRgb, rgbToHsl, getDefaultParamValue } from './utils';
import { invalidate } from '@react-three/fiber';
import ColorPicker from '../ColorPicker';
import { hsl } from "../ColorPicker/types"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import { useClipboardManagerAPI } from '@vxengine/managers/ClipboardManager/store';
import ParamInput from '.';
import animationEngineInstance from '@vxengine/singleton';
import { Button } from '@vxengine/components/shadcn/button';

interface ParamColorProps {
    vxkey: string
    vxRefObj: React.RefObject<any>
    param: { propertyPath: string }
}

// Helper function to convert a single 0-1 value to a 2-digit hex string
const toHex = (value: number): string => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
};

// Helper function to convert 0-1 RGB to hex string #RRGGBB
const rgbToHexString = (r: number, g: number, b: number): string => {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const ParamColor: React.FC<ParamColorProps> = ({ vxkey, vxRefObj, param }) => {
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
    const [buttonText, setButtonText] = useState("Get Hex");


    // Initialize
    useLayoutEffect(() => {
        const r = getDefaultParamValue(vxkey, rPropertyPath, vxRefObj.current);
        const g = getDefaultParamValue(vxkey, gPropertyPath, vxRefObj.current);
        const b = getDefaultParamValue(vxkey, bPropertyPath, vxRefObj.current);

        const hsl = rgbToHsl(r, g, b);
        colorRef.current = hsl
        const lighterLightness = Math.min(hsl.l + 10, 100);
        if (colorPreviewRef.current) {
            colorPreviewRef.current.style.backgroundColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
            colorPreviewRef.current.style.borderColor = `hsl(${hsl.h}, ${hsl.s}%, ${lighterLightness}%)`;
        }
    }, [vxkey, propertyPath, vxRefObj, rPropertyPath, gPropertyPath, bPropertyPath])

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
    }, [vxkey, rTrackKey, gTrackKey, bTrackKey]); // Added dependencies for track keys


    // Handle color changes from ColorPicker
    const handleColorChange = useCallback((hsl: hsl) => {
        colorRef.current = hsl
        const { r, g, b } = hslToRgb(hsl.h, hsl.s, hsl.l);

        animationEngineInstance
            .paramModifierService
            .modifyParamValue(vxkey, rPropertyPath, r, false)
            .modifyParamValue(vxkey, gPropertyPath, g, false)
            .modifyParamValue(vxkey, bPropertyPath, b, true) // Assuming last one flushes or invalidates implicitly

        colorPreviewRef.current.style.backgroundColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

        invalidate(); // Invalidate R3F
    }, [vxkey, rPropertyPath, gPropertyPath, bPropertyPath]) // Added dependencies

    const handleColorChangeEnd = useCallback((hsl: hsl) => {
        colorRef.current = hsl
        const { r, g, b } = hslToRgb(hsl.h, hsl.s, hsl.l);

        animationEngineInstance
            .paramModifierService
            .modifyParamValue(vxkey, rPropertyPath, r, false)
            .modifyParamValue(vxkey, gPropertyPath, g, false)
            .modifyParamValue(vxkey, bPropertyPath, b, true)
            .flushTimelineStateUpdates() // Finalize timeline state update

        if (colorPreviewRef.current) {
            colorPreviewRef.current.style.backgroundColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        }

        invalidate(); // Invalidate R3F
    }, [vxkey, rPropertyPath, gPropertyPath, bPropertyPath]) // Added dependencies

    const handleGetHexClick = useCallback(() => {
        const currentHsl = colorRef.current;
        const { r, g, b } = hslToRgb(currentHsl.h, currentHsl.s, currentHsl.l);
        const hexString = rgbToHexString(r, g, b);

        navigator.clipboard.writeText(hexString).then(() => {
            setButtonText("Copied!");
            setTimeout(() => setButtonText("Get Hex"), 1500); // Revert after 1.5s
        }).catch(err => {
            console.error('Failed to copy hex code: ', err);
            setButtonText("Copy Failed");
            setTimeout(() => setButtonText("Get Hex"), 1500);
        });
    }, []); // No dependencies needed as it reads from ref


    return (
        <>
            <Popover>
                <PopoverTrigger disableStyling>
                    <div
                        ref={colorPreviewRef}
                        className={`w-10 h-5 rounded-md border shadow-md`}
                    />
                </PopoverTrigger>
                <PopoverContent className='w-52' side="left">
                    <ColorPicker
                        ref={colorPickerRef}
                        colorRef={colorRef}
                        handleColorChange={handleColorChange}
                        handleColorChangeEnd={handleColorChangeEnd}
                    />

                    <div className='flex flex-col gap-2'>
                        <div className='flex gap-2 mt-2 justify-between'>
                            <ParamInput
                                vxkey={vxkey}
                                vxRefObj={vxRefObj}
                                param={{ title: "red", propertyPath: rPropertyPath, type: "slider", min: 0, max: 1, step: 0.005 }}
                                titleClassname=' !text-white font-medium'
                                paramSliderRangeClassname='!bg-red-500 border-red-400'
                            />
                        </div>
                        <div className='flex gap-2 justify-between'>
                            <ParamInput
                                vxkey={vxkey}
                                vxRefObj={vxRefObj}
                                param={{ title: "green", propertyPath: gPropertyPath, type: "slider", min: 0, max: 1, step: 0.005 }}
                                titleClassname=' !text-white font-medium'
                                paramSliderRangeClassname='!bg-green-500 border-green-400'
                            />
                        </div>
                        <div className='flex gap-2 justify-between'>
                            <ParamInput
                                vxkey={vxkey}
                                vxRefObj={vxRefObj}
                                param={{ title: "blue", propertyPath: bPropertyPath, type: "slider", min: 0, max: 1, step: 0.005 }}
                                titleClassname=' !text-white font-medium'
                                paramSliderRangeClassname='!bg-blue-500 border-blue-400'
                            />
                        </div>
                        {/* Get Hex Button */}
                        <Button variant="default" className='w-full' size="sm" onClick={handleGetHexClick}>
                            {buttonText}
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

        </>
    )
}

export default ParamColor
