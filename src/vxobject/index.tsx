'use client'

import React from 'react';
import { EditableAmbientLight, EditableDirectionalLight, EditableFog, EditableGroup, EditableHemisphereLight, EditableMesh, EditablePerspectiveCamera, EditablePointLight, EditablePoints, EditableSpotLight } from './editableObjects';
import { EditableFadeEffect } from './editableEffects/EditableFader';
import { EditableBloom } from './editableEffects/EditableBloom';
import { EditableLightFormer } from './editableDrei/editableLightFormer';

export const vx = {
    mesh: EditableMesh,
    spotLight: EditableSpotLight,
    points: EditablePoints,
    group: EditableGroup,
    perspectiveCamera: EditablePerspectiveCamera,
    pointLight: EditablePointLight,
    hemisphereLight: EditableHemisphereLight,
    directionalLight: EditableDirectionalLight,
    ambientLight: EditableAmbientLight,
    fog: EditableFog,

    fadeEffect: EditableFadeEffect,
    bloom: EditableBloom,
    lightFormer: EditableLightFormer,
};

export { useVXObjectStore } from "./ObjectStore"

// Same as vx namespace but an be used with theatrejs and also save to VXStore
const vxe = {

}
