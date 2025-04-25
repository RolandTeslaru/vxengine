import React, { useMemo } from "react";
import { VXElementPropsWithoutRef, VXElementParams } from "../types";
import { BloomEffectOptions } from "postprocessing";
import { withVX } from "../withVX";
import { BloomEffect } from "postprocessing";

export type EditableBloomProps = Omit<VXElementPropsWithoutRef<BloomEffectOptions>, "vxkey" | "ref"> & {
  ref?: React.RefObject<typeof BloomEffect>
  vxkey?: string
  name?: string
}

const bloomParams: VXElementParams = [
  {type: "slider", propertyPath: "uniforms.intensity", title: "intensity", min: 0, max: 10, step: 0.1},
  {type: "number", propertyPath: "luminanceThreshold"},
  {type: "number", propertyPath: "luminanceSmoothing"},
];

const BaseBloom = ({ref, ...props}) => {
  const effect = useMemo(() => {
    const impl = new BloomEffect(props);
    ref.current = impl;
    return impl;
  },
  [props]);
  return <primitive object={effect} {...props} />
}

export const EditableBloom = withVX(BaseBloom, {
  type: "effect",
  vxkey: "bloom",
  params: bloomParams,
  icon: "BloomEffect",
  name: "Bloom",
});
