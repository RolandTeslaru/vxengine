import React, { useRef } from "react";
import { VXElementPropsWithoutRef, VXElementParams } from "../types";
import { BloomEffect } from "postprocessing";
import { BloomEffectOptions } from "postprocessing";
import { Bloom } from "./impl/BloomFiber";
import VXEffectWrapper from "../VXEffectWrapper";

export type EditableBloomProps = Omit<VXElementPropsWithoutRef<BloomEffectOptions>, "vxkey"> & {
  ref?: React.RefObject<typeof BloomEffect>
  vxkey?: string
  name?: string
}

const bloomParams: VXElementParams = [
  {type: "slider", propertyPath: "uniforms.intensity", title: "intensity", min: 0, max: 10, step: 0.1},
  {type: "number", propertyPath: "luminanceThreshold"},
  {type: "number", propertyPath: "luminanceSmoothing"},
];

export const EditableBloom: React.FC<EditableBloomProps> = (
    (props) => {
      const vxkey = "bloom"
      const ref = useRef<BloomEffect>(null)
      return (
        <VXEffectWrapper
          vxkey={vxkey}
          name="Bloom"
          ref={ref}
          params={bloomParams}
          icon="BloomEffect"
          {...props}
        >
          {/* 
          // @ts-ignore
          */}<Bloom/>
        </VXEffectWrapper>
      ) 

    }
  )