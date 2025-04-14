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
import { LayerMaterial, DepthLayer, ColorLayer, NoiseLayer, FresnelLayer, GradientLayer, MatcapLayer, TextureLayer, DisplaceLayer, NormalLayer } from './layerMaterials';
import * as LAYERS from './layerMaterials/vanilla';

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

    div: EditableDiv,

    
    layerMaterialImpl: LAYERS.LayerMaterial,
    depthLayerImpl: LAYERS.Depth,
    colorLayerImpl: LAYERS.Color,
    noiseLayerImpl: LAYERS.Noise,
    fresnelLayerImpl: LAYERS.Fresnel,
    gradientLayerImpl: LAYERS.Gradient,
    matcapLayerImpl: LAYERS.Matcap,
    textureLayerImpl: LAYERS.Texture,
    displaceLayerImpl: LAYERS.Displace,
    normalLayerImpl: LAYERS.Normal,

    layerMaterial: LayerMaterial,
    depthLayer: DepthLayer,
    colorLayer: ColorLayer,
    noiseLayer: NoiseLayer,
    fresnelLayer: FresnelLayer,
    gradientLayer: GradientLayer,
    matcapLayer: MatcapLayer,
    textureLayer: TextureLayer,
    displaceLayer: DisplaceLayer,
    normalLayer: NormalLayer,
};