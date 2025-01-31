"use client";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { hsl } from "./types";

interface DraggableColorCanvasProps {
    colorRef: { current: hsl }
    handleChange: (e: Partial<hsl>) => void;
    handleChangeStart: (e: Partial<hsl>) => void
    handleChangeEnd: (e: Partial<hsl>) => void
}

// Define the type for the ref object
interface DraggableColorCanvasHandle {
    updateCanvasRefs: (newHsl: hsl) => void;
}

const DraggableColorCanvas = forwardRef<DraggableColorCanvasHandle, DraggableColorCanvasProps>((props, ref) => {
    const { colorRef, handleChange, handleChangeStart, handleChangeEnd } = props

    const [dragging, setDragging] = useState(false);
    const colorAreaRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);

    const updateCanvasRefs = (newHsl: hsl) => {
        colorAreaRef.current.style.background = `hsl(${newHsl.h}, ${newHsl.s}%, ${newHsl.l}%)`
        colorAreaRef.current.style.background = `linear-gradient(to top, #000, transparent, #fff), linear-gradient(to left, hsl(${newHsl.h}, 100%, 50%), #bbb)`

        cursorRef.current.style.background = `hsl(${newHsl.h}, ${newHsl.s}%, ${newHsl.l}%)`
        cursorRef.current.style.left = `${newHsl.s}%`
        cursorRef.current.style.top = `${100 - newHsl.l}%`

    }

    useImperativeHandle(ref, () => ({
        updateCanvasRefs: updateCanvasRefs
    }))

    const calculateSaturationAndLightness = (clientX: number, clientY: number) => {
        if (!colorAreaRef.current) return;
        const rect = colorAreaRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const xClamped = Math.max(0, Math.min(x, rect.width));
        const yClamped = Math.max(0, Math.min(y, rect.height));
        const newSaturation = Math.round((xClamped / rect.width) * 100);
        const newLightness = 100 - Math.round((yClamped / rect.height) * 100);

        return { s: newSaturation, l: newLightness }
    }
    // Mouse event handlers
    const handleMouseMove = (e:MouseEvent) => {
        e.preventDefault();
        const newHsl = calculateSaturationAndLightness(e.clientX, e.clientY);
        handleChange(newHsl)
    }

    const handleMouseUp = (e: MouseEvent) => {
        setDragging(false);
        const newHsl = calculateSaturationAndLightness(e.clientX, e.clientY)
        handleChangeEnd(newHsl)
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(true);
        const newHsl = calculateSaturationAndLightness(e.clientX, e.clientY);
        handleChangeStart(newHsl)
    };

    useEffect(() => {
        if (dragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [
        dragging,
    ]);

    return (
        <div
            ref={colorAreaRef}
            className="h-48 w-full touch-auto overscroll-none rounded-lg border border-neutral-600 dark:touch-auto dark:border-zinc-700 shadow-md shadow-neutral-900"
            style={{
                background: `linear-gradient(to top, #000, transparent, #fff), linear-gradient(to left, hsl(${colorRef.current.h}, 100%, 50%), #bbb)`,
                position: "relative",
                cursor: "crosshair",
            }}
            onMouseDown={handleMouseDown}
        >
            <div
                className="color-selector border-4 border-white ring-1 ring-zinc-200 dark:border-zinc-900 dark:ring-zinc-700"
                ref={cursorRef}
                style={{
                    position: "absolute",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: `hsl(${colorRef.current.h}, ${colorRef.current.s}%, ${colorRef.current.l}%)`,
                    transform: "translate(-50%, -50%)",
                    left: `${colorRef.current.s}%`,
                    top: `${100 - colorRef.current.l}%`,
                    cursor: dragging ? "grabbing" : "grab",
                }}
            ></div>
        </div>
    );
});

type ColorPickerProps = {
    colorRef: {
        current: hsl
    }
    default_value?: string;

    handleColorChangeStart: (hsl: hsl) => void
    handleColorChange: (hsl: hsl) => void
    handleColorChangeEnd: (hsl: hsl) => void
};

interface ColorPickerHandle {
    updateRefs: (newHsl: hsl) => void;
}

const ColorPicker = forwardRef<ColorPickerHandle, ColorPickerProps>((props, ref) => {
    const { handleColorChange, handleColorChangeStart, handleColorChangeEnd, colorRef, default_value = "#1C9488" } = props;

    const hueSliderRef = useRef<HTMLInputElement>()
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
