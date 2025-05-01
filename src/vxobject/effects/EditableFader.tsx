import React, {  useMemo } from 'react'
import { Uniform } from 'three'
import { Effect } from 'postprocessing'
import { VXElementPropsWithoutRef, VXElementParams } from '../types'
import {  ThreeElements } from '@react-three/fiber'
import { withVX } from '../withVX'

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
    { propertyPath: "uniforms.fadeIntensity", title: "fadeIntensity", type: "slider", min: 0, max: 1, step: 0.01 }
]

export type EditableFaderProps = Omit<VXElementPropsWithoutRef<ThreeElements["primitive"]>, "vxkey"> & {
    ref?: React.RefObject<FadeShaderEffectImpl>
    vxkey?: string
    name?: string
}

const BaseFadeEffect = ({fadeIntensity = 1.0, ...props}) => {
    const effect = useMemo(() => new FadeShaderEffectImpl({ fadeIntensity }), [fadeIntensity])
    return <primitive object={effect} dispose={null} {...props} />
}

export const EditableFadeEffect =  withVX(BaseFadeEffect, {
    type: "effect",
    params: fadeProps,
    vxkey: "fadeEffect",
    icon: "FadeEffect"
}) as React.ComponentType<EditableFaderProps>