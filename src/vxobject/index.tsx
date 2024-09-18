import React, { useCallback, useEffect, useRef, isValidElement, useMemo, useState, forwardRef } from 'react';
import { Mesh, SpotLight, LineSegments, LineLoop, Points, Group, PerspectiveCamera, OrthographicCamera, PointLight, HemisphereLight, DirectionalLight, AmbientLight, Fog, Object3D } from 'three';
import { EditableMeshProps, EditableSpotLightProps, EditableLineSegmentsProps, EditableLineLoopProps, EditableAmbientLightProps, EditableDirectionalLightProps, EditableFogProps, EditableGroupProps, EditableHemisphereLightProps, EditableOrthographicCameraProps, EditablePerspectiveCameraProps, EditablePointLightProps, EditablePointsProps, } from "../types/editableObject";
import VXEditableWrapper, { VXEditableWrapperProps } from './wrapper';
import { useVXObjectStore } from "vxengine/vxobject";

const EditableMesh = forwardRef<Mesh, EditableMeshProps>((props, ref) => {
    const { children: meshChildren, ...rest } = props;

    return (
        <VXEditableWrapper type="mesh" ref={ref} {...rest}>
            <mesh>
                {meshChildren}
            </mesh>
        </VXEditableWrapper>
    );
});

const EditableSpotLight = forwardRef<SpotLight, EditableSpotLightProps>((props, ref) => {
    const id = useMemo(() => {
        return `spotlight-${Math.random()}`;
    }, [])
    return (
        <VXEditableWrapper type="spotlight" ref={ref} {...props}>
            <spotLight ref={ref} />
        </VXEditableWrapper>
    );
})

const EditableLineSegments = forwardRef<LineSegments, EditableLineSegmentsProps>((props, ref) => {
    const id = useMemo(() => {
        return `linesegments-${Math.random()}`;
    }, [])
    return (
        <VXEditableWrapper type="linesegments" ref={ref} {...props}>
            <lineSegments ref={ref} />
        </VXEditableWrapper>
    );
})

const EditableLineLoop = forwardRef<LineLoop, EditableLineLoopProps>((props, ref) => {
    const id = useMemo(() => {
        return `lineloop-${Math.random()}`;
    }, [])
    return (
        <VXEditableWrapper id={id} type="lineloop" ref={ref} {...props}>
            <lineLoop ref={ref} />
        </VXEditableWrapper>
    );
})

const EditablePoints = forwardRef<Points, EditablePointsProps>((props, ref) => {
    const id = useMemo(() => `points-${Math.random()}`, [])
    return (
        <VXEditableWrapper type="points" ref={ref} {...props}>
            <points ref={ref} />
        </VXEditableWrapper>
    );
})

const EditableGroup = forwardRef<Group, EditableGroupProps>((props, ref) => {
    return (
        <VXEditableWrapper type="group" ref={ref} {...props}>
            <group ref={ref} {...props} >
                {props.children}
            </group>
        </VXEditableWrapper>
    );
})

const EditablePerspectiveCamera = forwardRef<PerspectiveCamera, EditablePerspectiveCameraProps>((props, ref) => (
    <perspectiveCamera ref={ref} {...props} />
))

const EditableOrthographicCamera = forwardRef<OrthographicCamera, EditableOrthographicCameraProps>((props, ref) => (
    <orthographicCamera ref={ref} {...props} />
))

const EditablePointLight = forwardRef<PointLight, EditablePointLightProps>((props, ref) => {
    const id = useMemo(() => {
        return `pointlight-${Math.random()}`;
    }, [])
    return (
        <VXEditableWrapper type="pointlight" ref={ref} {...props}>
            <pointLight ref={ref} {...props} />
        </VXEditableWrapper>
    )
})

const EditableHemisphereLight = forwardRef<HemisphereLight, EditableHemisphereLightProps>((props, ref) => (
    <hemisphereLight ref={ref} {...props} />
))

const EditableDirectionalLight = forwardRef<DirectionalLight, EditableDirectionalLightProps>((props, ref) => (
    <directionalLight ref={ref} {...props} />
))

const EditableAmbientLight = forwardRef<AmbientLight, EditableAmbientLightProps>((props, ref) => (
    <ambientLight ref={ref} {...props} />
))

const EditableFog = forwardRef<Fog, EditableFogProps>((props, ref) => (
    <fog ref={ref} {...props} />
))

export const vx = {
    mesh: EditableMesh,
    spotLight: EditableSpotLight,
    // lineSegments: EditableLineSegments,
    // lineLoop: EditableLineLoop,
    points: EditablePoints,
    group: EditableGroup,
    perspectiveCamera: EditablePerspectiveCamera,
    orthographicCamera: EditableOrthographicCamera,
    pointLight: EditablePointLight,
    hemisphereLight: EditableHemisphereLight,
    directionalLight: EditableDirectionalLight,
    ambientLight: EditableAmbientLight,
    fog: EditableFog,
};

export { useVXObjectStore } from "./ObjectStore"

// Same as vx namespace but an be used with theatrejs and also save to VXStore
const vxe = {

}
