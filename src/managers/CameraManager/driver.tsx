// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { vx } from '@vxengine/vxobject'
import React, { useEffect, useMemo, useRef, useCallback } from 'react'
import CameraTarget from './components/CameraTarget'
import { useCameraManagerAPI } from './store'
import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from "three"
import { vxengine } from '@vxengine/singleton'
import { useUIManagerAPI } from '../UIManager/store'

const PREVIEW_WINDOW_ID = "cameraPreview"

const CameraManagerDriver = React.memo(() => {
    const mode = useCameraManagerAPI(state => state.mode)
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);

    const isPreviewWindowOpen = useUIManagerAPI(state => state.vxWindows[PREVIEW_WINDOW_ID]?.isOpen ?? false)

    return (
        <>
            <vx.perspectiveCamera
                vxkey='perspectiveCamera'
                makeDefault={mode === "attached"}
                name="Camera"
                ref={cameraRef} // This ref is crucial
            />
            <CameraTarget />
            {mode === "free" && (
                <OrbitControls makeDefault />
            )}

            {vxengine.isDevelopment && isPreviewWindowOpen &&
                <CanvasPreviewDriver cameraRef={cameraRef} mode={mode} />
            }
        </>
    )
})

export default CameraManagerDriver

interface CanvasPreviewDriverProps {
    cameraRef: React.RefObject<THREE.Camera>
    mode: "free" | "attached"
}


const CanvasPreviewDriver = ({ cameraRef, mode }: CanvasPreviewDriverProps) => {
    const cameraCanvasPreviewRef = useCameraManagerAPI(state => state.cameraCanvasPreviewRef)

    const pixelsRef = useRef<Uint8Array | null>(null);
    const imageDataRef = useRef<ImageData | null>(null);

    const { gl, scene, size } = useThree();

    const previewSizeRef = useRef({
        width: 150,
        height: 150
    })

    const renderTargetRef = useRef(
        new THREE.WebGLRenderTarget(previewSizeRef.current.width, previewSizeRef.current.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
        }
    ));

    const updateBuffers = useCallback((newWidth: number, newHeight: number) => {
        if (newWidth <= 0 || newHeight <= 0) {
            console.warn("CanvasPreviewDriver: Attempted to update buffers with zero/negative dimensions:", newWidth, newHeight);
            return;
        }
        previewSizeRef.current.width = newWidth;
        previewSizeRef.current.height = newHeight;

        renderTargetRef.current.setSize(newWidth, newHeight);

        pixelsRef.current = new Uint8Array(newWidth * newHeight * 4);

        imageDataRef.current = new ImageData(
            new Uint8ClampedArray(pixelsRef.current.buffer),
            newWidth,
            newHeight
        );
        console.log("CanvasPreviewDriver: Buffers updated to:", newWidth, "x", newHeight);
    }, []); // No external state/prop dependencies, only refs

    useEffect(() => {
        if (cameraCanvasPreviewRef.current) {
            const observer = new ResizeObserver((entries) => {
                const canvasEntry = entries[0];
                if (canvasEntry) {
                    const { width, height } = canvasEntry.contentRect;
                    console.log("CanvasPreviewDriver: ResizeObserver detected canvas contentRect change:", width, "x", height);
                    if (width > 0 && height > 0) {
                        if (cameraCanvasPreviewRef.current) {
                            // Update canvas drawing surface dimensions
                            cameraCanvasPreviewRef.current.width = width;
                            cameraCanvasPreviewRef.current.height = height;
                        }
                        updateBuffers(width, height);
                    } else {
                        console.log("CanvasPreviewDriver: ResizeObserver skipping updateBuffers due to zero dimensions.", width, height);
                    }
                }
            });
            observer.observe(cameraCanvasPreviewRef.current);
            return () => {
                // Check if ref still exists before unobserving
                if (cameraCanvasPreviewRef.current) {
                    observer.unobserve(cameraCanvasPreviewRef.current);
                }
            };
        }
    }, [cameraCanvasPreviewRef, updateBuffers]); // updateBuffers is now stable

    useEffect(() => {
        if (mode === "free" && cameraCanvasPreviewRef.current && size.width > 0 && size.height > 0) {
            const aspect = size.width / size.height;
            cameraCanvasPreviewRef.current.style.aspectRatio = String(aspect);

            // After setting aspect ratio, allow browser to calculate dimensions
            // then read them back to set canvas attributes and buffers.
            const newCanvasWidth = cameraCanvasPreviewRef.current.clientWidth;
            const newCanvasHeight = cameraCanvasPreviewRef.current.clientHeight;

            console.log("CanvasPreviewDriver: Initial setup/mode/size change. Canvas client dims:", newCanvasWidth, "x", newCanvasHeight, "Aspect:", aspect);

            if (newCanvasWidth > 0 && newCanvasHeight > 0) {
                // Update canvas drawing surface dimensions
                cameraCanvasPreviewRef.current.width = newCanvasWidth;
                cameraCanvasPreviewRef.current.height = newCanvasHeight;
                updateBuffers(newCanvasWidth, newCanvasHeight);
            } else {
                console.warn("CanvasPreviewDriver: Initial setup - canvas client dimensions are zero. ResizeObserver should pick up subsequent changes.");
            }
        }
    }, [cameraCanvasPreviewRef, mode, size, updateBuffers]); // Added size and updateBuffers

    useFrame(() => {
        if (mode === "free" && cameraCanvasPreviewRef.current && cameraRef.current) { // Added cameraRef.current check
            const canvas = cameraCanvasPreviewRef.current;
            // Ensure canvas has positive drawing buffer dimensions before attempting to use context
            if (canvas.width <= 0 || canvas.height <= 0) {
                return; // Skip frame if canvas isn't properly sized
            }
            const ctx = canvas.getContext('2d');

            if (ctx) {
                const currentRenderTarget = gl.getRenderTarget();

                const WIDTH = previewSizeRef.current.width;
                const HEIGHT = previewSizeRef.current.height;

                // Ensure render target is also positively sized
                if (WIDTH <= 0 || HEIGHT <= 0) return;

                gl.setRenderTarget(renderTargetRef.current);
                gl.render(scene, cameraRef.current); // cameraRef.current should be valid if we are here
                gl.setRenderTarget(currentRenderTarget);

                if (pixelsRef.current) { // Check pixelsRef is not null
                    gl.readRenderTargetPixels(
                        renderTargetRef.current,
                        0, 0,
                        WIDTH,
                        HEIGHT,
                        pixelsRef.current
                    );

                    if (imageDataRef.current) { // Check imageDataRef is not null
                        ctx.clearRect(0, 0, WIDTH, HEIGHT);
                        ctx.save();
                        ctx.scale(1, -1); // Flip Y for correct orientation
                        ctx.translate(0, -HEIGHT); // Adjust Y position after flipping
                        ctx.putImageData(imageDataRef.current, 0, 0);
                        ctx.restore();
                    }
                }
            }
        }
    }); // No specific dependencies for useFrame's callback, relies on refs and component scope

    return null;
}
