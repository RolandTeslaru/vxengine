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

interface ParamColorProps {
    vxkey: string
    vxRefObj: React.RefObject<any>
    param: { propertyPath: string }
}

const ParamColor: React.FC<ParamColorProps> = ({ vxkey, vxRefObj, param }) => {
    const isColorInClipboard = useClipboardManagerAPI(state => state.items.has("color"));

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
        const r = getDefaultParamValue(vxkey, rPropertyPath, vxRefObj.current);
        const g = getDefaultParamValue(vxkey, gPropertyPath, vxRefObj.current);
        const b = getDefaultParamValue(vxkey, bPropertyPath, vxRefObj.current);

        const hsl = rgbToHsl(r, g, b);
        colorRef.current = hsl
        const lighterLightness = Math.min(hsl.l + 10, 100);
        colorPreviewRef.current.style.backgroundColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        colorPreviewRef.current.style.borderColor = `hsl(${hsl.h}, ${hsl.s}%, ${lighterLightness}%)`;
    }, [vxkey, propertyPath])

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

        animationEngineInstance
            .paramModifierService
            .modifyParamValue(vxkey, rPropertyPath, r, false)
            .modifyParamValue(vxkey, gPropertyPath, g, false)
            .modifyParamValue(vxkey, bPropertyPath, b, true)

        colorPreviewRef.current.style.backgroundColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

        invalidate();
    }, [])
    const handleColorChangeEnd = useCallback((hsl: hsl) => {
        colorRef.current = hsl
        const { r, g, b } = hslToRgb(hsl.h, hsl.s, hsl.l);

        animationEngineInstance
            .paramModifierService
            .modifyParamValue(vxkey, rPropertyPath, r, false)
            .modifyParamValue(vxkey, gPropertyPath, g, false)
            .modifyParamValue(vxkey, bPropertyPath, b, true)
            .flushTimelineStateUpdates()

        colorPreviewRef.current.style.backgroundColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

        invalidate();
    }, [])

    return (
        <>
            <Popover>
                <ContextMenu>
                    <PopoverTrigger disableStyling>
                        <div
                            ref={colorPreviewRef}
                            className={`w-10 h-5 rounded-md border shadow-md`}
                        />
                    </PopoverTrigger>
                </ContextMenu>
                <PopoverContent className='w-52'>
                    <ColorPicker
                        ref={colorPickerRef}
                        colorRef={colorRef}
                        handleColorChange={handleColorChange}
                        handleColorChangeEnd={handleColorChangeEnd}
                    />

                    <div className='flex flex-col gap-2'>
                        <div className='flex gap-2 mt-2 justify-between'>
                            <p className='text-xs my-auto'>red</p>
                            <ParamInput
                                vxkey={vxkey}
                                vxRefObj={vxRefObj}
                                param={{ title: "red", propertyPath: rPropertyPath, type: "number", min: 0, max: 1, step: 0.005 }}
                            />
                        </div>
                        <div className='flex gap-2 justify-between'>
                            <p className='text-xs my-auto'>green</p>
                            <ParamInput
                                vxkey={vxkey}
                                vxRefObj={vxRefObj}
                                param={{ title: "green", propertyPath: gPropertyPath, type: "number", min: 0, max: 1, step: 0.005 }}
                            />
                        </div>
                        <div className='flex gap-2 justify-between'>
                            <p className='text-xs my-auto'>blue</p>
                            <ParamInput
                                vxkey={vxkey}
                                vxRefObj={vxRefObj}
                                param={{ title: "blue", propertyPath: bPropertyPath, type: "number", min: 0, max: 1, step: 0.005 }}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

        </>
    )
}

export default ParamColor
