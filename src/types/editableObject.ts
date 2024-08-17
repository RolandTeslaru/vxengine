import React, { ForwardRefExoticComponent, PropsWithoutRef, Ref, RefAttributes, forwardRef } from 'react';
import { Mesh, SpotLight, LineSegments, LineLoop, Points, Group, PerspectiveCamera, OrthographicCamera, PointLight, HemisphereLight, DirectionalLight, AmbientLight, Fog, Object3D } from 'three';
import { FogProps, MeshProps, SpotLightProps, LineSegmentsProps, LineLoopProps, PointsProps, GroupProps, PerspectiveCameraProps, OrthographicCameraProps, PointLightProps, HemisphereLightProps, DirectionalLightProps, AmbientLightProps, ExtendedColors } from '@react-three/fiber';

export interface VXEditableWrapperProps {
    id: string;
    type: string;
    children: React.ReactNode;
    [key: string]: any; // For any additional props
}

export type EditableProps<T> = Omit<T, 'visible'> & {
    visible?: boolean
    additionalProps?: any;
    objRef?: any;
};

export type PrimitiveProps = {
    object: Object3D;
    visible?: boolean
    additionalProps?: any;
    objRef?: any;
    editableType: keyof JSX.IntrinsicElements;
};

export type EditableMeshProps = EditableProps<MeshProps> & {
    ref?: Ref<Mesh>;
};

export type EditableSpotLightProps = EditableProps<SpotLightProps> & {
    ref?: Ref<SpotLight>;
};

export type EditableLineSegmentsProps = EditableProps<LineSegmentsProps> & {
    ref?: Ref<LineSegments>;
};

export type EditableLineLoopProps = EditableProps<LineLoopProps> & {
    ref?: Ref<LineLoop>;
};

export type EditablePointsProps = EditableProps<PointsProps> & {
    ref?: Ref<Points>;
};

export type EditableGroupProps = EditableProps<GroupProps> & {
    ref?: Ref<Group>;
};

export type EditablePerspectiveCameraProps = EditableProps<PerspectiveCameraProps> & {
    ref?: Ref<PerspectiveCamera>;
};

export type EditableOrthographicCameraProps = EditableProps<OrthographicCameraProps> & {
    ref?: Ref<OrthographicCamera>;
};

export type EditablePointLightProps = EditableProps<PointLightProps> & {
    ref?: Ref<PointLight>;
};

export type EditableHemisphereLightProps = EditableProps<HemisphereLightProps> & {
    ref?: Ref<HemisphereLight>;
};

export type EditableDirectionalLightProps = EditableProps<DirectionalLightProps> & {
    ref?: Ref<DirectionalLight>;
};

export type EditableAmbientLightProps = EditableProps<AmbientLightProps> & {
    ref?: Ref<AmbientLight>;
};

export type EditableFogProps = EditableProps<FogProps> & {
    ref?: Ref<Fog>;
};

