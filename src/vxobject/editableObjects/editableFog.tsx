import React, { forwardRef, useEffect } from "react";
import { useObjectSettingsAPI } from "../ObjectSettingsStore";
import { useAnimationEngineAPI } from "../../AnimationEngine"
import { EditableObjectProps } from "../types"
import VXObjectWrapper from "../wrapper";

import { Fog } from "three";
import { FogProps } from "@react-three/fiber";
export type EditableFogProps = EditableObjectProps<FogProps> & {
    ref?: React.Ref<Fog>;
};

export const EditableFog = forwardRef<Fog, EditableFogProps>((props, ref) => (
    <fog ref={ref} {...props} />
))