import React from 'react';
import { EditableAmbientLight, EditableDirectionalLight, EditableFog, EditableGroup, EditableHemisphereLight, EditableMesh, EditablePerspectiveCamera, EditablePointLight, EditablePoints, EditableSpotLight, EditableCubeCamera } from './fiber';
import { EditableFadeEffect } from './effects/EditableFader';
import { EditableBloom } from './effects/EditableBloom';
import { EditableLightFormer } from './drei/editableLightFormer';
import { VXEnvironment, VXEnvironmentMap, VXEnvironmentPortal } from './drei/EditableEnvironment/dreiImpl';
import { EditableLUT } from './effects/EditableLUT';
import {EditableColor} from './fiber/editableColor';
import EditableDiv from './html/editableDiv';
import EditableGrid from './drei/EditableGrid';
import editablePrimitive from './fiber/editablePrimitive';
import { EditableScene } from './fiber/EditableScene';


export const vx = {
    primitive: editablePrimitive,
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
    color: EditableColor,

    fadeEffect: EditableFadeEffect,
    bloom: EditableBloom,
    LUT: EditableLUT,

    grid: EditableGrid,
    lightFormer: EditableLightFormer,

    environment: VXEnvironment,
    environmentPortal: VXEnvironmentPortal,
    environmentMap: VXEnvironmentMap,
    cubeCamera: EditableCubeCamera,

    scene: EditableScene,


    div: EditableDiv
};