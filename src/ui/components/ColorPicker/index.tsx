import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { hsl } from "./types";
import DraggableColorCanvas from "./DraggableColorCanvas";

const ColorPicker = forwardRef<ColorPickerHandle, ColorPickerProps>((props, ref) => {
    const {
        handleColorChange = () => { },
        handleColorChangeStart = () => { },
        handleColorChangeEnd = () => { },
        colorRef,
        default_value = "#1C9488"
    } = props;

    const hueSliderRef = useRef<HTMLInputElement>(null)
    // const colorPreviewRef = useRef<HTMLDivElement>()

    const draggableColorCanvasRef = useRef<{ updateCanvasRefs: (hsl: hsl) => void }>(null);

    const updateRefs = (newHsl: hsl) => {
        draggableColorCanvasRef.current.updateCanvasRefs(newHsl)
        hueSliderRef.current.value = newHsl.h as any
    }

    useImperativeHandle(ref, () => ({
        updateRefs: updateRefs
    }))

    // Initialize the hue slider on mount
    useEffect(() => {
        // @ts-expect-error
        hueSliderRef.current.value = colorRef.current.h
    }, [])

    return (
        <div
            style={
                {
                    "--thumb-border-color": "#000000",
                    "--thumb-ring-color": "#666666",
                } as React.CSSProperties
            }
            className="z-30 flex w-full max-w-[200px] select-none flex-col items-center gap-3 overscroll-none "
        >
            <DraggableColorCanvas
                ref={draggableColorCanvasRef}
                colorRef={colorRef}
                handleChange={(partial) => {
                    const updateHsl: hsl = { ...colorRef.current, ...partial }
                    handleColorChange(updateHsl); // Notify parent of the color change
                }}
                handleChangeStart={(partial) => {
                    const updateHsl: hsl = { ...colorRef.current, ...partial }
                    handleColorChangeStart(updateHsl); // Notify parent of the color change
                }}
                handleChangeEnd={(partial) => {
                    const updateHsl: hsl = { ...colorRef.current, ...partial }
                    handleColorChangeEnd(updateHsl); // Notify parent of the color change
                }}
            />
            <input
                type="range"
                min="0"
                max="360"
                ref={hueSliderRef}
                className="dark:border-zinc-7000 h-3 w-full cursor-pointer appearance-none rounded-full border border-neutral-200 shadow-md shadow-neutral-900 bg-white text-white placeholder:text-white dark:border-zinc-700"
                style={{
                    background: `linear-gradient(to right, 
                    hsl(0, 100%, 50%), 
                    hsl(60, 100%, 50%), 
                    hsl(120, 100%, 50%), 
                    hsl(180, 100%, 50%), 
                    hsl(240, 100%, 50%), 
                    hsl(300, 100%, 50%), 
                    hsl(360, 100%, 50%))`,
                }}
                onChange={(e) => {
                    const hue = e.target.valueAsNumber;
                    const updateHsl = { ...colorRef.current, h: hue, }
                    handleColorChange(updateHsl);
                }}
                onMouseDown={(e) => {
                    // @ts-expect-error
                    const hue = e.target.valueAsNumber;
                    const updateHsl = { ...colorRef.current, h: hue, }
                    handleColorChangeStart(updateHsl)
                }}
                onMouseUp={(e) => {
                    // @ts-expect-error
                    const hue = e.target.valueAsNumber;
                    const updateHsl = { ...colorRef.current, h: hue, }
                    handleColorChangeEnd(updateHsl)
                }}
            />
        </div>
    );
});

export default ColorPicker;


export type ColorPickerProps = {
    colorRef: {
        current: hsl
    }
    default_value?: string;

    handleColorChangeStart?: (hsl: hsl) => void
    handleColorChange?: (hsl: hsl) => void
    handleColorChangeEnd?: (hsl: hsl) => void
};

export interface ColorPickerHandle {
    updateRefs: (newHsl: hsl) => void;
}