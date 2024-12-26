import { useThree } from '@react-three/fiber'
import { useVXEngine } from '@vxengine/engine'
import { useObjectManagerAPI, useVXObjectStore } from '@vxengine/managers/ObjectManager'
import { vxEffectProps, vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'
import { LUT3DEffect, BlendFunction } from 'postprocessing'
import React, { forwardRef, Ref, useLayoutEffect, useMemo } from 'react'
import type { Texture } from 'three'

export type LUTProps = {
    lut: Texture
    blendFunction?: BlendFunction
    tetrahedralInterpolation?: boolean
}

declare module 'postprocessing' {
    interface LUT3DEffect {
        type: string
    }
}

export const EditableLUT = forwardRef(function LUT(
    { lut, tetrahedralInterpolation, ...props }: LUTProps,
    ref: Ref<LUT3DEffect>
) {
    const vxkey = "lut"
    const effect = useMemo(() => new LUT3DEffect(lut, props), [lut, props])
    const invalidate = useThree((state) => state.invalidate)

    const animationEngine = useVXEngine((state) => state.animationEngine);

    useLayoutEffect(() => {
        const addObject = useVXObjectStore.getState().addObject;
        const removeObject = useVXObjectStore.getState().removeObject;

        effect.type = "LUTEffect"
        
        const newVxObject: vxEffectProps = {
            type: "effect",
            name: "LUT",
            vxkey,
            ref: { current: effect },
            parentKey: "effects"
        }

        addObject(newVxObject)
        animationEngine.initObjectOnMount(newVxObject);

        return () => removeObject(vxkey);
    }, [])

    useLayoutEffect(() => {
        if (tetrahedralInterpolation) effect.tetrahedralInterpolation = tetrahedralInterpolation
        if (lut) effect.lut = lut
        invalidate()
    }, [effect, invalidate, lut, tetrahedralInterpolation])

    return <primitive ref={ref} object={effect} dispose={null} />
})