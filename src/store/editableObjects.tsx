// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { forwardRef, useCallback, useEffect, useRef, isValidElement, useMemo, useState } from 'react';
import { Mesh, SpotLight, LineSegments, LineLoop, Points, Group, PerspectiveCamera, OrthographicCamera, PointLight, HemisphereLight, DirectionalLight, AmbientLight, Fog, Object3D } from 'three';
import { EditableMeshProps, EditableSpotLightProps, EditableLineSegmentsProps, EditableLineLoopProps, EditableAmbientLightProps, EditableDirectionalLightProps, EditableFogProps, EditableGroupProps, EditableHemisphereLightProps, EditableOrthographicCameraProps, EditablePerspectiveCameraProps, EditablePointLightProps, EditablePointsProps, } from "../types/editableObject";
import { ReactThreeFiber, useFrame } from '@react-three/fiber';
import { useVXObjectStore } from './ObjectStore';
import { Edges } from '@react-three/drei';
import { vxObjectProps } from '../types/objectStore';
import { useObjectManagerStore } from 'vxengine/managers/ObjectManager/store';
import { useVXAnimationStore } from './AnimationStore';
import { useVXEngine } from 'vxengine/engine';
import { shallow } from 'zustand/shallow';

const dev = (fn: () => void) => {
    if (process.env.NODE_ENV === "development")
        fn;
}

const supportedGeometries = ["boxGeometry", "sphereGeometry", "planeGeometry"]

interface VXEditableWrapperProps<T extends Object3D> {
    type: string;
    vxkey: string;
    name?: string;
    children: React.ReactElement<ReactThreeFiber.Object3DNode<T, any>>;
}

const VXEditableWrapper = forwardRef<Object3D, VXEditableWrapperProps<Object3D>>(
    ({ type, children, vxkey, ...props }, forwardedRef) => {
        if (vxkey === undefined) {
            throw new Error(`No vxkey was passed to: ${type}`)
        }

        const { addObject, removeObject } = useVXObjectStore(state => ({
            addObject: state.addObject,
            removeObject: state.removeObject,
        }));

        const { selectObjects, setHoveredObject, hoveredObject, selectedObjectKeys } = useObjectManagerStore(state => ({
            selectObjects: state.selectObjects,
            setHoveredObject: state.setHoveredObject,
            hoveredObject: state.hoveredObject,
            selectedObjectKeys: state.selectedObjectKeys
        }), shallow)

        const { animationEngine } = useVXEngine();

        const internalRef = useRef<THREE.Object3D | null>(null);
        
        useEffect(() => {
            if (typeof forwardedRef === 'function') {
                forwardedRef(internalRef.current);
            } else if (forwardedRef) {
                forwardedRef.current = internalRef.current;
            }
        }, [forwardedRef]);

        const ref = internalRef;

        // Memoize handlers to prevent unnecessary updates
        const memoizedAddObject = useCallback(addObject, []);
        const memoizedRemoveObject = useCallback(removeObject, []);
        const memoizedSelectObjects = useCallback(selectObjects, []);

        const objectSelf: vxObjectProps = {
            type: type,
            ref: ref,
            vxkey: vxkey,
            name: props.name || type,
        }

        useEffect(() => {
            memoizedAddObject(objectSelf);
            animationEngine.initObjectOnMount(objectSelf)

            return () => {
                memoizedRemoveObject(vxkey);
            };
        }, [memoizedAddObject, memoizedRemoveObject]);

        const handlePointerOver = () => {
            setHoveredObject(objectSelf)
        }
        const handlePointerOut = () => {
            setHoveredObject(null);
        }

        const object3DInnerChildren = children.props.children

        const containsSupportedGeometries = useMemo(() => {
            if (Array.isArray(object3DInnerChildren)) {
                return object3DInnerChildren.some((element) =>
                    isValidElement(element) && supportedGeometries.includes(element.type as string)
                );
            } else if (isValidElement(object3DInnerChildren)) {
                return supportedGeometries.includes(object3DInnerChildren.type as string);
            }
            return false;
        }, [object3DInnerChildren]);

        const modifiedChildren = React.cloneElement(children, {
            ref: ref as React.MutableRefObject<Object3D>, // Allow ref to be a generic Object3D type
            onPointerOver: handlePointerOver,
            onPointerOut: handlePointerOut,
            onClick: () => memoizedSelectObjects([vxkey]),
            onPointerDown: (e) => e.stopPropagation(),
            ...props,
        },
            <>
                {children.props.children}
                <Edges lineWidth={1.5} scale={1.1} visible={hoveredObject?.vxkey === vxkey && !selectedObjectKeys.includes(vxkey)} renderOrder={1000}>
                    <meshBasicMaterial transparent color="#2563eb" depthTest={false} />
                </Edges>
                <Edges lineWidth={1.5} scale={1.1} visible={containsSupportedGeometries && selectedObjectKeys.includes(vxkey)} renderOrder={1000} color="#949494">
                </Edges>
            </>
        );

        return <>{modifiedChildren}</>;
    }
);

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

const EditableGroup = forwardRef<Object3D, VXEditableWrapperProps<THREE.Group>>((props, forwardedRef) => {
    if (props.vxkey === undefined) {
        throw new Error("<vx.group> wasn't provided a vxkey")
    }
    const { addObject, removeObject } = useVXObjectStore(state => ({
        addObject: state.addObject,
        removeObject: state.removeObject,
    }));
    const id = useMemo(() => { return `group-${Math.random()}`; }, [])

    const internalRef = useRef(null);
    const ref = forwardedRef || internalRef;


    // Memoize handlers to prevent unnecessary updates
    const memoizedAddObject = useCallback(addObject, []);
    const memoizedRemoveObject = useCallback(removeObject, []);

    const type = "group"

    useEffect(() => {
        // FIXME: idk
        // @ts-expect-error
        memoizedAddObject({ vxkey: props.vxkey, type: type, ref: ref, name: props.name || type });

        return () => {
            memoizedRemoveObject(id);
        };
    }, [memoizedAddObject, memoizedRemoveObject]);

    return (
        <group ref={ref} {...props} >
            {props.children}
            {/* <Edges lineWidth={3} visible={selectedObjectIds.includes(id)} scale={1.01} renderOrder={1000}>
                <meshBasicMaterial transparent color="#2563eb" depthTest={false} />
            </Edges> */}
        </group>
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

// Same as vx namespace but an be used with theatrejs and also save to VXStore
const vxe = {

}
