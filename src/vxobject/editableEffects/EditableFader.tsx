import React, { forwardRef, useMemo } from 'react'
import { Uniform } from 'three'
import { Effect } from 'postprocessing'

const fragmentShader = /* glsl */`
uniform float opacity;
uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
  vec4 texel = texture2D( tDiffuse, vUv );
  gl_FragColor = opacity * texel;
}
`

const vertexShader = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

let _uParam

class FadeShaderEffectImpl extends Effect {
    constructor({ param = 0.1 } = {}) {
        super("FadeShader", fragmentShader, {
            uniforms: new Map([[ 'param', new Uniform(param)]]),
            vertexShader: vertexShader
        })

        _uParam = param;
    }

    update(renderer, inputBuffer, deltaTime){
        this.uniforms.get('param').value = _uParam;
    }
}

export const FadeEffect = forwardRef(({ param }, ref) => {
    const effect = useMemo(() => new FadeShaderEffectImpl(param), [param])

    return <primitive ref={ref} object={effect} dispose={null}/>
})