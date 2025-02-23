import React, { memo, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { Uniform } from 'three'
import { Effect } from 'postprocessing'
import { vxEffectProps, vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { useVXObjectStore } from '../../managers/ObjectManager/stores/objectStore'
import { useVXEngine } from '@vxengine/engine'
import { VXElementPropsWithoutRef, VXElementParams } from '../types'
import animationEngineInstance from '@vxengine/singleton'
import { ThreeElement, ThreeElements } from '@react-three/fiber'

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

const fadeProps: VXElementParams = [
    { propertyPath: "uniforms.fadeIntensity", title: "fadeIntensity", type: "slider", min: 0, max: 1, step: 0.01}
]

export type VXElementFadeEffect = VXElementPropsWithoutRef<ThreeElements["primitive"]> & {
    ref?: React.RefObject<FadeShaderEffectImpl>
}

export const EditableFadeEffect: React.FC<VXElementFadeEffect> = (props) => {
    const vxkey = "fadeEffect"
    const name = "Fade Effect"

    const { fadeIntensity, ref } = props as any

    const effect = useMemo(() => new FadeShaderEffectImpl({ fadeIntensity }), [fadeIntensity])

    const internalRef = useRef<FadeShaderEffectImpl>(null);
    useImperativeHandle(ref, () => internalRef.current);

    const { IS_DEVELOPMENT } = useVXEngine();

    useEffect(() => {
        const addObject = useVXObjectStore.getState().addObject;
        const removeObject = useVXObjectStore.getState().removeObject;
        
        (internalRef.current as any).type = "FadeEffect"

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
}