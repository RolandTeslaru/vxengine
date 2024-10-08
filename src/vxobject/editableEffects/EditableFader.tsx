import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { Uniform } from 'three'
import { Effect } from 'postprocessing'
import { vxObjectProps } from '@vxengine/types/objectStore'
import { useVXObjectStore } from '../ObjectStore'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/store'
import { useVXEngine } from '@vxengine/engine'

const fragmentShader = /* glsl */`
    uniform float opacity;
    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        outputColor = inputColor * 0.1;
    }
`;

const vertexShader = /* glsl */`
    void mainUv(inout vec2 uv) {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

let _uParam

class FadeShaderEffectImpl extends Effect {
    constructor({ opacity = 0.5 } = {}) {
        super("FadeShader", fragmentShader, {
            uniforms: new Map([['opacity', new Uniform(opacity)]]),
            vertexShader: vertexShader
        })

        _uParam = opacity;
    }

    update(renderer, inputBuffer, deltaTime) {
        this.uniforms.get('opacity').value = _uParam;
    }
}

export const EditableFadeEffect = forwardRef(({ param }, ref) => {
    const vxkey = "fadeEffect"
    const name = "Fade Effect"
    const effect = useMemo(() => new FadeShaderEffectImpl(param), [param])

    const addObject = useVXObjectStore((state) => state.addObject);
    const removeObject = useVXObjectStore((state) => state.removeObject);
    const memoizedAddObject = useCallback(addObject, []);
    const memoizedRemoveObject = useCallback(removeObject, []);

    const internalRef = useRef<any>(null); // Use 'any' to bypass type mismatch
    useImperativeHandle(ref, () => internalRef.current);

    const animationEngine = useVXEngine((state) => state.animationEngine);

    useEffect(() => {
        const newVXObject: vxObjectProps = {
            type: "effect",
            ref: internalRef,
            vxkey: vxkey,
            name: name,
            params: param || [],
        }

        memoizedAddObject(newVXObject);
        animationEngine.initObjectOnMount(newVXObject);
        useTimelineEditorAPI.getState().addObjectToEditorData(newVXObject);

        console.log("Effect newVXObject ", newVXObject.ref.current.uniforms)
        return () => {
            memoizedRemoveObject(vxkey);
        };
    }, [memoizedAddObject, memoizedRemoveObject])



    return <primitive ref={internalRef} object={effect} dispose={null} />
})