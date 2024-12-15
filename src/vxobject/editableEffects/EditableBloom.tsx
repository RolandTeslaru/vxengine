'use client'

import React, { memo, forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { useObjectManagerAPI, useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { useAnimationEngineAPI } from "../../AnimationEngine";
import { EditableObjectProps } from "../types";
import { useVXObjectStore } from "../../managers/ObjectManager/stores/objectStore";

import { SelectiveBloomProps } from "@react-three/postprocessing";
import { Bloom } from "@react-three/postprocessing";
import { BloomEffect } from "postprocessing";
import { vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/store";
import { useVXEngine } from "@vxengine/engine";
import { BloomEffectOptions } from "postprocessing";

export type EditableBloomProps = EditableObjectProps<BloomEffectOptions>;

export const EditableBloom = memo(
  forwardRef<EditableBloomProps, BloomEffectOptions>(
    (props, ref) => {
      const { ...rest } = props;
      const vxkey = "bloom"
      const name = "Bloom";

      const params = [
        "intensity",
        "luminanceThreshold",
        "luminanceSmoothing",
      ];

      const internalRef = useRef<any>(null); // Use 'any' to bypass type mismatch
      useImperativeHandle(ref, () => internalRef.current);

      const animationEngine = useVXEngine((state) => state.animationEngine);

      useEffect(() => {
        const addObject = useVXObjectStore.getState().addObject;
        const removeObject = useVXObjectStore.getState().removeObject;
        const addToTree = useObjectManagerAPI.getState().addToTree;

        internalRef.current.type = "BloomEffect"
                    
        const newVXObject: vxObjectProps = {
          type: "effect",
          ref: internalRef,
          vxkey: vxkey,
          name: name,
          params: params || [],
          parentKey: "effects"
        };

        addObject(newVXObject);
        animationEngine.initObjectOnMount(newVXObject);

        useTimelineEditorAPI.getState().addObjectToEditorData(newVXObject);

        addToTree(newVXObject)

        return () => {removeObject(vxkey);};
      }, []);

      return <Bloom ref={internalRef as unknown as React.LegacyRef<typeof BloomEffect>} {...rest} />;
    }
  )
);