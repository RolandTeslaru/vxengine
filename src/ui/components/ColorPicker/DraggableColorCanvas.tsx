import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { hsl } from "./types";

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
        if (!colorAreaRef.current) 
            return;
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
    const handleMouseMove = (e: MouseEvent) => {
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

export default DraggableColorCanvas

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

