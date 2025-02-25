import { BloomEffect, BlendFunction } from 'postprocessing'
import { wrapEffectWithoutRef } from '@vxengine/vxobject/utils/wrapEffectWithoutRef'

export const Bloom = /* @__PURE__ */ wrapEffectWithoutRef(BloomEffect, {
  blendFunction: BlendFunction.ADD,
})