import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { useAnimationEngineAPI } from "../../AnimationEngine";
import { EditableObjectProps } from "../types";
import { useVXObjectStore } from "../ObjectStore";
import VXObjectWrapper from "../wrapper";

import { SelectiveBloomProps } from "@react-three/postprocessing";
import { Bloom } from "@react-three/postprocessing";
import { BloomEffect } from "postprocessing";
import { vxObjectProps } from "@vxengine/types/objectStore";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/store";
import { useVXEngine } from "@vxengine/engine";

export type EditableBloomProps = EditableObjectProps<typeof Bloom>;

export const EditableBloom = forwardRef<BloomEffect, EditableBloomProps>((props, ref) => {
  const { vxkey, ...rest } = props;
  const name = "Bloom";

  const params = [];

  const addObject = useVXObjectStore((state) => state.addObject);
  const removeObject = useVXObjectStore((state) => state.removeObject);
  const memoizedAddObject = useCallback(addObject, []);
  const memoizedRemoveObject = useCallback(removeObject, []);

  const internalRef = useRef<any>(null); // Use 'any' to bypass type mismatch
  useImperativeHandle(ref, () => internalRef.current);

  const animationEngine = useVXEngine((state) => state.animationEngine);

  useEffect(() => {
    const newVXObject: vxObjectProps = {
      type: "effect",
      ref: internalRef,
      vxkey: vxkey,
      name: name,
      params: params || [],
    };

    memoizedAddObject(newVXObject);
    animationEngine.initObjectOnMount(newVXObject);
    useTimelineEditorAPI.getState().addObjectToEditorData(newVXObject);
    return () => {
      memoizedRemoveObject(vxkey);
    };
  }, [memoizedAddObject, memoizedRemoveObject]);

  return <Bloom ref={internalRef as unknown as React.LegacyRef<typeof BloomEffect>} {...rest} />;
});