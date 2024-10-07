import React, { ForwardRefExoticComponent, PropsWithoutRef, Ref, RefAttributes, forwardRef } from 'react';
import { Mesh, SpotLight, LineSegments, LineLoop, Points, Group, PerspectiveCamera, OrthographicCamera, PointLight, HemisphereLight, DirectionalLight, AmbientLight, Fog, Object3D } from 'three';
import { FogProps, MeshProps, SpotLightProps, LineSegmentsProps, LineLoopProps, PointsProps, GroupProps, PerspectiveCameraProps, OrthographicCameraProps, PointLightProps, HemisphereLightProps, DirectionalLightProps, AmbientLightProps, ExtendedColors } from '@react-three/fiber';

export interface VXObjectWrapperProps {
    type: string;
    children: React.ReactNode;
    vxkey: string;
}

export type EditableObjectProps<T> = Omit<T, 'ref'> & {
    vxkey: string;
    ref?: React.Ref<unknown>;
};
export type EditableMeshProps = EditableObjectProps<MeshProps> & {
    ref?: React.Ref<Mesh>;
};

export type EditableSpotLightProps = EditableObjectProps<SpotLightProps> & {
    ref?: React.Ref<SpotLight>;
};

export type EditableLineSegmentsProps = EditableObjectProps<LineSegmentsProps> & {
    ref?: React.Ref<LineSegments>;
};

export type EditableLineLoopProps = EditableObjectProps<LineLoopProps> & {
    ref?: React.Ref<LineLoop>;
};

export type EditablePointsProps = EditableObjectProps<PointsProps> & {
    ref?: React.Ref<Points>;
};

export type EditableGroupProps = EditableObjectProps<GroupProps> & {
    ref?: React.Ref<Group>;
};

export type EditablePerspectiveCameraProps = EditableObjectProps<PerspectiveCameraProps> & {
    ref?: React.Ref<PerspectiveCamera>;
};

export type EditableOrthographicCameraProps = EditableObjectProps<OrthographicCameraProps> & {
    ref?: React.Ref<OrthographicCamera>;
};

export type EditablePointLightProps = EditableObjectProps<PointLightProps> & {
    ref?: React.Ref<PointLight>;
};

export type EditableHemisphereLightProps = EditableObjectProps<HemisphereLightProps> & {
    ref?: React.Ref<HemisphereLight>;
};

export type EditableDirectionalLightProps = EditableObjectProps<DirectionalLightProps> & {
    ref?: React.Ref<DirectionalLight>;
};

export type EditableAmbientLightProps = EditableObjectProps<AmbientLightProps> & {
    ref?: React.Ref<AmbientLight>;
};

export type EditableFogProps = EditableObjectProps<FogProps> & {
    ref?: React.Ref<Fog>;
};