import { invalidate, ThreeElements } from '@react-three/fiber'
import { LUT3DEffect, BlendFunction } from 'postprocessing'
import React, { useLayoutEffect, useMemo } from 'react'
import type { Texture } from 'three'
import { VXElementPropsWithoutRef } from '../types'
import { withVX } from '../withVX'

declare module 'postprocessing' {
    interface LUT3DEffect {
        type: string
    }
}

export type VXElementLUT = Omit<VXElementPropsWithoutRef<ThreeElements["primitive"]>, "vxkey">  & {
    ref?: React.RefObject<LUT3DEffect>
    lut: Texture
    blendFunction?: BlendFunction
    tetrahedralInterpolation?: boolean
    vxkey?: string
}


const BaseLUT = ({ref, lut, tetrahedralInterpolation, ...props}) => {

    const effect = useMemo(() => {
        const instance = new LUT3DEffect(lut, props)
        ref.current = instance;
        return instance;
    }, [lut, props])

    useLayoutEffect(() => {
        if(tetrahedralInterpolation)
            effect.tetrahedralInterpolation = tetrahedralInterpolation
        if(lut)
            effect.lut = lut
        invalidate()
    }, [effect, lut])

    return <primitive object={effect} dispose={null} />
}

export const EditableLUT = withVX(BaseLUT, {
    type: "effect",
    vxkey: "lut",
    name: "LUT",
    icon: "LUTEffect",
})