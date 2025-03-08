import React, { memo, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useLayoutEffect } from "react";
import { VXElementPropsWithoutRef, VXElementParams } from "../types";
import { useVXObjectStore } from "../../managers/ObjectManager/stores/objectStore";

import { SelectiveBloomProps } from "@react-three/postprocessing";
import { BloomEffect } from "postprocessing";
import { vxEffectProps, vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import { BloomEffectOptions } from "postprocessing";
import animationEngineInstance from "@vxengine/singleton";
import { useVXEngine } from "@vxengine/engine";
import { Bloom } from "./impl/BloomFiber";

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
      const { ref, vxkey = "bloom", name = "Bloom", ...rest } = props;

      const internalRef = useRef<typeof BloomEffect | null>(null); // Use 'any' to bypass type mismatch
      useImperativeHandle(ref, () => internalRef.current);

      const { IS_DEVELOPMENT } = useVXEngine()

      useLayoutEffect(() => {
        const addObject = useVXObjectStore.getState().addObject;
        const removeObject = useVXObjectStore.getState().removeObject;

        (internalRef.current as any).type = "BloomEffect"
                    
        const newVXObject: vxEffectProps = {
          type: "effect",
          ref: internalRef,
          vxkey,
          name,
          params: bloomParams,
          parentKey: "effects"
        };

        addObject(newVXObject, IS_DEVELOPMENT);
        animationEngineInstance.registerObject(newVXObject);

        return () => {
          removeObject(vxkey, IS_DEVELOPMENT)        
          animationEngineInstance.unregisterObject(vxkey)
        }  
      }, []);

      return <Bloom ref={internalRef} {...rest} />;

    }
  )