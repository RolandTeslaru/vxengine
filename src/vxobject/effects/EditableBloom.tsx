import React, { useEffect, useLayoutEffect, useImperativeHandle, useRef } from "react";
import { VXElementPropsWithoutRef, VXElementParams } from "../types";
import { BloomEffect } from "postprocessing";
import { BloomEffectOptions } from "postprocessing";
import { Bloom } from "./impl/BloomFiber";
import VXEffectWrapper from "../VXEffectWrapper";
import { useVXObjectStore } from "@vxengine/managers/ObjectManager/stores/objectStore";
import { vxEffectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import animationEngineInstance from "@vxengine/singleton";
import { cleanupEditorObject } from "../utils/handleObjectEditorData";
import { initTimelineEditorObject } from "../utils/handleObjectEditorData";
import { useVXEngine } from "@vxengine/engine";
import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
export type EditableBloomProps = Omit<VXElementPropsWithoutRef<BloomEffectOptions>, "vxkey"> & {
  ref?: React.RefObject<typeof BloomEffect>
  vxkey?: string
  name?: string
}

const bloomParams: VXElementParams = [
  { type: "number", propertyPath: "intensity" },
  { type: "number", propertyPath: "uniforms.intensity" },
  { type: "number", propertyPath: "luminanceThreshold" },
  { type: "number", propertyPath: "luminanceSmoothing" },
];


export const EditableBloom = (
    (props, ref) => {
      const { ...rest } = props;
      const vxkey = "bloom"
      const name = "Bloom";

      const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)

      const internalRef = useRef<any>(null); // Use 'any' to bypass type mismatch
      useImperativeHandle(ref, () => internalRef.current);

      useLayoutEffect(() => {

        initTimelineEditorObject(vxkey, {})

        return () => { cleanupEditorObject(vxkey) }
      }, [currentTimelineID])

      useLayoutEffect(() => {
        const addObject = useVXObjectStore.getState().addObject;
        const removeObject = useVXObjectStore.getState().removeObject;

        internalRef.current.type = "BloomEffect"

        const newVXObject: vxEffectProps = {
          type: "effect",
          ref: internalRef,
          vxkey,
          name,
          params: bloomParams,
          parentKey: "effects"
        };

        addObject(newVXObject, true);
        animationEngineInstance.handleObjectMount(newVXObject);

        return () => removeObject(vxkey, true)
      }, []);

      return <Bloom ref={internalRef as unknown as React.LegacyRef<typeof BloomEffect>} {...rest} />;
    }
  )
