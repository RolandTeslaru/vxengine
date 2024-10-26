'use client'

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { Uniform } from 'three'
import { Effect } from 'postprocessing'
import { vxObjectProps } from '@vxengine/types/objectStore'
import { useVXObjectStore } from '../ObjectStore'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/store'
import { useVXEngine } from '@vxengine/engine'
import { useFrame } from '@react-three/fiber'

const fragmentShader = /* glsl */`
    precision mediump float;
    uniform float fadeIntensity;
    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        outputColor = inputColor * fadeIntensity;
    }
`;

const vertexShader = /* glsl */`
    void mainUv(inout vec2 uv) {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

class FadeShaderEffectImpl extends Effect {
    constructor({ fadeIntensity = 1.0 } = {}) {
        super("FadeShader", fragmentShader, {
            uniforms: new Map([['fadeIntensity', new Uniform(fadeIntensity)]]),
            vertexShader: vertexShader
        })
    }
}

export const EditableFadeEffect = forwardRef((props, ref) => {
    const vxkey = "fadeEffect"
    const name = "Fade Effect"

    const { fadeIntensity } = props as any

    const effect = useMemo(() => new FadeShaderEffectImpl({fadeIntensity}), [fadeIntensity])

    const addObject = useVXObjectStore((state) => state.addObject);
    const removeObject = useVXObjectStore((state) => state.removeObject);
    const memoizedAddObject = useCallback(addObject, []);
    const memoizedRemoveObject = useCallback(removeObject, []);

    const internalRef = useRef<any>(null); 
    useImperativeHandle(ref, () => internalRef.current);

    const animationEngine = useVXEngine((state) => state.animationEngine);

    const params = [
        "uniforms.fadeIntensity"
    ]

    useEffect(() => {
        const newVXObject: vxObjectProps = {
            type: "effect",
            ref: internalRef,
            vxkey: vxkey,
            name: name,
            params: params || [],
        }

        console.log("Editable Fade Effect internal Ref", internalRef)

        memoizedAddObject(newVXObject);
        animationEngine.initObjectOnMount(newVXObject);

        return () => memoizedRemoveObject(vxkey);
    }, [memoizedAddObject, memoizedRemoveObject])

    return <primitive ref={internalRef} object={effect} dispose={null} />
})