'use client'

import React, { memo, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { Uniform } from 'three'
import { Effect } from 'postprocessing'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { useVXObjectStore } from '../../managers/ObjectManager/stores/objectStore'
import { useVXEngine } from '@vxengine/engine'
import { useObjectManagerAPI } from '@vxengine/managers/ObjectManager'

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

export const EditableFadeEffect = memo(forwardRef((props, ref) => {
    const vxkey = "fadeEffect"
    const name = "Fade Effect"

    const { fadeIntensity } = props as any

    const effect = useMemo(() => new FadeShaderEffectImpl({ fadeIntensity }), [fadeIntensity])

    const internalRef = useRef<any>(null);
    useImperativeHandle(ref, () => internalRef.current);

    const animationEngine = useVXEngine((state) => state.animationEngine);

    const params = [
        "uniforms.fadeIntensity"
    ]

    useEffect(() => {
        const addObject = useVXObjectStore.getState().addObject;
        const removeObject = useVXObjectStore.getState().removeObject;
        
        const addToTree = useObjectManagerAPI.getState().addToTree;

        internalRef.current.type = "FadeEffect"

        const newVXObject: vxObjectProps = {
            type: "effect",
            ref: internalRef,
            vxkey: vxkey,
            name: name,
            params: params || [],
            parentKey: "effects"
        }

        addObject(newVXObject);
        animationEngine.initObjectOnMount(newVXObject);

        addToTree(newVXObject);

        return () => removeObject(vxkey);
    }, [])

    return <primitive ref={internalRef} object={effect} dispose={null} />
})
)