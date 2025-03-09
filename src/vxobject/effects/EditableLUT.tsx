import { ThreeElements, useThree } from '@react-three/fiber'
import { useVXEngine } from '@vxengine/engine'
import { useObjectManagerAPI, useVXObjectStore } from '@vxengine/managers/ObjectManager'
import { vxEffectProps, vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import animationEngineInstance from '@vxengine/singleton'
import { LUT3DEffect, BlendFunction } from 'postprocessing'
import React, { forwardRef, Ref, useLayoutEffect, useMemo } from 'react'
import type { Texture } from 'three'
import { VXElementPropsWithoutRef } from '../types'
import VXEffectWrapper from '../VXEffectWrapper'

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

export const EditableLUT: React.FC<VXElementLUT> = ({ 
    ref, lut, tetrahedralInterpolation, vxkey = "lut", params, ...props 
}) => {
    const effect = useMemo(() => new LUT3DEffect(lut, props), [lut, props])
    const invalidate = useThree((state) => state.invalidate)

    useLayoutEffect(() => {
        if (tetrahedralInterpolation) effect.tetrahedralInterpolation = tetrahedralInterpolation
        if (lut) effect.lut = lut
        invalidate()
    }, [effect, invalidate, lut, tetrahedralInterpolation])

    return (
        <VXEffectWrapper
            ref={ref}
            vxkey={vxkey}
            name="LUT"
            icon="LUTEffect"
        >
            <primitive object={effect} dispose={null} />
        </VXEffectWrapper>
    )
}