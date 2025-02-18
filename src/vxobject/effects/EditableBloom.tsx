import React, { memo, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useLayoutEffect } from "react";
import { EditableObjectProps, VXObjectParams } from "../types";
import { useVXObjectStore } from "../../managers/ObjectManager/stores/objectStore";

import { SelectiveBloomProps } from "@react-three/postprocessing";
import { Bloom } from "@react-three/postprocessing";
import { BloomEffect } from "postprocessing";
import { vxEffectProps, vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import { BloomEffectOptions } from "postprocessing";
import animationEngineInstance from "@vxengine/singleton";
import { useVXEngine } from "@vxengine/engine";

export type EditableBloomProps = EditableObjectProps<BloomEffectOptions>;

const bloomParams: VXObjectParams = [
  {type: "number", propertyPath: "intensity"},
  {type: "number", propertyPath: "luminanceThreshold"},
  {type: "number", propertyPath: "luminanceSmoothing"},
];

export const EditableBloom = memo(
  forwardRef<EditableBloomProps, BloomEffectOptions>(
    (props, ref) => {
      const { ...rest } = props;
      const vxkey = "bloom"
      const name = "Bloom";

      const internalRef = useRef<any>(null); // Use 'any' to bypass type mismatch
      useImperativeHandle(ref, () => internalRef.current);

      const { IS_DEVELOPMENT } = useVXEngine()

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

        addObject(newVXObject, IS_DEVELOPMENT);
        animationEngineInstance.initObjectOnMount(newVXObject);

        return () => removeObject(vxkey, IS_DEVELOPMENT)        
      }, []);

      return <Bloom ref={internalRef as unknown as React.LegacyRef<typeof BloomEffect>} {...rest} />;
    }
  )
);