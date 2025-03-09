import React from "react";
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
  {type: "number", propertyPath: "intensity"},
  {type: "number", propertyPath: "luminanceThreshold"},
  {type: "number", propertyPath: "luminanceSmoothing"},
];

export const EditableBloom: React.FC<EditableBloomProps> = (
    (props) => {
      const vxkey = "bloom"
      return (
        <VXEffectWrapper
          vxkey={vxkey}
          name="Bloom"
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