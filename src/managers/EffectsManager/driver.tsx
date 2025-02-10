import type { TextureDataType } from 'three'
import { HalfFloatType } from 'three'
import React, {
  forwardRef,
  useMemo,
  useEffect,
  useLayoutEffect,
  createContext,
  useRef,
  useImperativeHandle,
} from 'react'
import { useThree, useFrame, useInstanceHandle } from '@react-three/fiber'
import {
  EffectComposer as EffectComposerImpl,
  RenderPass,
  EffectPass,
  NormalPass,
  // @ts-ignore
  DepthDownsamplingPass,
  Effect,
  Pass,
  EffectAttribute,
} from 'postprocessing'
import { isWebGL2Available } from 'three-stdlib'
import * as THREE from "three"
import { useVXEngine } from "@vxengine/engine"

import { EffectComposerProps } from "../../types/effectComposer"
import { useObjectManagerAPI, useVXObjectStore } from '../ObjectManager'
import { vxEffectProps, vxObjectProps } from '../ObjectManager/types/objectStore'

export const EffectComposerContext = createContext<{
  composer: EffectComposerImpl
  normalPass: NormalPass | null
  downSamplingPass: DepthDownsamplingPass | null
  camera: THREE.Camera
  scene: THREE.Scene
  resolutionScale?: number
}>(null!)


const isConvolution = (effect: Effect): boolean =>
  (effect.getAttributes() & EffectAttribute.CONVOLUTION) === EffectAttribute.CONVOLUTION

export const EffectsManagerDriver = React.memo(
  forwardRef(({
    children,
    camera: _camera,
    scene: _scene,
    resolutionScale,
    enabled = true,
    renderPriority = 1,
    autoClear = true,
    depthBuffer,
    disableNormalPass,
    stencilBuffer,
    multisampling = 8,
    frameBufferType = HalfFloatType,
  }: EffectComposerProps,
    ref
  ) => {
    const vxkey = "effects"
    const { gl, scene, camera, size } = useThree()
    const { composer } = useVXEngine()

    const { IS_DEVELOPMENT } = useVXEngine();

    const [normalPass, downSamplingPass] = useMemo(() => {
      const webGL2Available = isWebGL2Available()
      // Initialize composer
      const effectComposer = new EffectComposerImpl(gl, {
        depthBuffer,
        stencilBuffer,
        multisampling: multisampling > 0 && webGL2Available ? multisampling : 0,
        frameBufferType,
      })
      // @ts-expect-error FIXME:
      composer.current = effectComposer

      // Add render pass
      effectComposer.addPass(new RenderPass(scene, camera))

      // Create normal pass
      let downSamplingPass = null
      let normalPass = null
      if (!disableNormalPass) {
        normalPass = new NormalPass(scene, camera)
        normalPass.enabled = false
        effectComposer.addPass(normalPass)
        if (resolutionScale !== undefined && webGL2Available) {
          downSamplingPass = new DepthDownsamplingPass({ normalBuffer: normalPass.texture, resolutionScale })
          downSamplingPass.enabled = false
          effectComposer.addPass(downSamplingPass)
        }
      }

      return [effectComposer, normalPass, downSamplingPass]
    }, [
      camera,
    ])

    useEffect(() => composer?.current.setSize(size.width, size.height), [composer, size])

    useFrame((_, delta) => {
      if (enabled) {
        const currentAutoClear = gl.autoClear
        gl.autoClear = autoClear
        if (stencilBuffer && !autoClear) gl.clearStencil()
        composer.current.render(delta)
        gl.autoClear = currentAutoClear
      }
    },
      enabled ? renderPriority : 0
    )

    const group = useRef(null)
    const instance = useInstanceHandle(group)

    useLayoutEffect(() => {

      const addObject = useVXObjectStore.getState().addObject;
      const removeObject = useVXObjectStore.getState().removeObject;

      const newVXEntity: vxEffectProps = {
        type: "effect",
        ref: composer,
        vxkey,
        name: "Effects",
        params: {},
        disabledParams: [],
        parentKey: "global",
      };

      addObject(newVXEntity, IS_DEVELOPMENT, { icon: "Effects"});
    }, [])

    useLayoutEffect(() => {
      const passes: Pass[] = []

      if (group.current && instance.current && composer) {
        const children = instance.current.objects as unknown[]

        for (let i = 0; i < children.length; i++) {
          const child = children[i]

          if (child instanceof Effect) {
            const effects: Effect[] = [child]

            if (!isConvolution(child)) {
              let next: unknown = null
              while ((next = children[i + 1]) instanceof Effect) {
                if (isConvolution(next)) break
                effects.push(next)
                i++
              }
            }

            const pass = new EffectPass(camera, ...effects)
            passes.push(pass)
          } else if (child instanceof Pass) {
            passes.push(child)
          }
        }

        // @ts-expect-error FIXME
        for (const pass of passes) composer?.current.addPass(pass)

        // @ts-expect-error FIXME
        if (normalPass) normalPass.enabled = true
        if (downSamplingPass) downSamplingPass.enabled = true
      }

      return () => {
        // @ts-expect-error FIXME
        for (const pass of passes) composer?.current.removePass(pass)
        // @ts-expect-error FIXME
        if (normalPass) normalPass.enabled = false
        if (downSamplingPass) downSamplingPass.enabled = false
      }
    }, [composer, children, camera, normalPass, downSamplingPass, instance])

    // Memoize state, otherwise it would trigger all consumers on every render
    const state = useMemo(
      () => ({ composer, normalPass, downSamplingPass, resolutionScale, camera, scene }),
      [composer, normalPass, downSamplingPass, resolutionScale, camera, scene]
    )

    // Expose the composer
    useImperativeHandle(ref, () => composer, [composer])

    return (
      // @ts-expect-error FIXME
      <EffectComposerContext.Provider value={state}>
        <group ref={group}>{children}</group>
      </EffectComposerContext.Provider>
    )
  }
  )
)