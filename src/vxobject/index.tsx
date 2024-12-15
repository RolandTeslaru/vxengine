'use client'

import React from 'react';
import { EditableAmbientLight, EditableDirectionalLight, EditableFog, EditableGroup, EditableHemisphereLight, EditableMesh, EditablePerspectiveCamera, EditablePointLight, EditablePoints, EditableSpotLight, EditableCubeCamera } from './editableObjects';
import { EditableFadeEffect } from './editableEffects/EditableFader';
import { EditableBloom } from './editableEffects/EditableBloom';
import { EditableLightFormer } from './editableDrei/editableLightFormer';
import { VXEnvironment, VXEnvironmentMap, VXEnvironmentPortal } from './editableDrei/EditableEnvironment/dreiImpl';
import { EditableLUT } from './editableEffects/EditableLUT';


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
    LUT: EditableLUT,

    lightFormer: EditableLightFormer,

    environment: VXEnvironment,
    environmentPortal: VXEnvironmentPortal,
    environmentMap: VXEnvironmentMap,
    cubeCamera: EditableCubeCamera
};

// Same as vx namespace but an be used with theatrejs and also save to VXStore
const vxe = {

}
