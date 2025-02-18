import React, { memo, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { Uniform } from 'three'
import { Effect } from 'postprocessing'
import { vxEffectProps, vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { useVXObjectStore } from '../../managers/ObjectManager/stores/objectStore'
import { useVXEngine } from '@vxengine/engine'
import { VXObjectParams } from '../types'
import animationEngineInstance from '@vxengine/singleton'

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

const fadeProps: VXObjectParams = [
    { propertyPath: "uniforms.fadeIntensity", type: "slider", min: 0, max: 1, step: 0.01}
]

export const EditableFadeEffect = memo(forwardRef((props, ref) => {
    const vxkey = "fadeEffect"
    const name = "Fade Effect"

    const { fadeIntensity } = props as any

    const effect = useMemo(() => new FadeShaderEffectImpl({ fadeIntensity }), [fadeIntensity])

    const internalRef = useRef<any>(null);
    useImperativeHandle(ref, () => internalRef.current);

    const { IS_DEVELOPMENT } = useVXEngine();

    useEffect(() => {
        const addObject = useVXObjectStore.getState().addObject;
        const removeObject = useVXObjectStore.getState().removeObject;
        
        internalRef.current.type = "FadeEffect"

        const newVXObject: vxEffectProps = {
            type: "effect",
            ref: internalRef,
            vxkey,
            name,
            params: fadeProps,
            parentKey: "effects"
        }

        addObject(newVXObject, IS_DEVELOPMENT);
        animationEngineInstance.initObjectOnMount(newVXObject);

        return () => removeObject(vxkey, IS_DEVELOPMENT);
    }, [])

    return <primitive ref={internalRef} object={effect} dispose={null} />
})
)