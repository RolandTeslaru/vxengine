import React, { forwardRef, useCallback, useEffect, useRef, isValidElement, useMemo, useState } from 'react';
import { Mesh, SpotLight, LineSegments, LineLoop, Points, Group, PerspectiveCamera, OrthographicCamera, PointLight, HemisphereLight, DirectionalLight, AmbientLight, Fog, Object3D } from 'three';
import { EditableMeshProps, EditableSpotLightProps, EditableLineSegmentsProps, EditableLineLoopProps, EditableAmbientLightProps, EditableDirectionalLightProps, EditableFogProps, EditableGroupProps, EditableHemisphereLightProps, EditableOrthographicCameraProps, EditablePerspectiveCameraProps, EditablePointLightProps, EditablePointsProps, VXEditableWrapperProps, } from "../types/editableObject";
import { useFrame } from '@react-three/fiber';
import { useVXObjectStore } from './ObjectStore';
import { Edges } from '@react-three/drei';
import { StoredObjectProps } from '../types/objectStore';
import { useObjectManagerStore } from 'vxengine/managers/ObjectManager/store';

const dev = (fn: () => void) => {
    if (process.env.NODE_ENV === "development")
        fn;
}

const VXEditableWrapper = forwardRef<unknown, VXEditableWrapperProps>(
    ({ type, children, vxkey, ...props }, forwardedRef) => {
        if (vxkey === undefined) {
            throw new Error(`No vxkey was passed to name: ${type}`)
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
        }))

        // Create an internal ref in case forwardedRef is null
        const internalRef = useRef(null);

        // Use forwardedRef if provided, otherwise fall back to internalRef
        const ref = forwardedRef || internalRef;

        // Memoize handlers to prevent unnecessary updates
        const memoizedAddObject = useCallback(addObject, []);
        const memoizedRemoveObject = useCallback(removeObject, []);
        const memoizedSelectObjects = useCallback(selectObjects, []);


        const objectSelf: StoredObjectProps = {
            type: type,
            ref: ref,
            vxkey: vxkey,
            name: props.name || type,
        }

        useEffect(() => {
            memoizedAddObject(objectSelf);

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

        // useEffect(() => {
        //     console.log("VCEditable Objects childrem ", object3DInnerChildren)
        // })

        const supportedGeometries = ["boxGeometry", "sphereGeometry", "planeGeometry"]
        const containsSupportedGeometries = useMemo(() => {
            return object3DInnerChildren?.some(element =>
                supportedGeometries.includes(element.type)
            )
        }, [children.props.children])


        // console.log("Contains Suppoertd Geometrys", containsSupportedGeometries)

        const modifiedChildren = isValidElement(children) ? (
            React.cloneElement(children, {
                ref: ref as React.MutableRefObject<THREE.Object3D>,
                onPointerOver: handlePointerOver,
                onPointerOut: handlePointerOut,
                onClick: () => memoizedSelectObjects([vxkey]),
                onPointerDown: (e) => e.stopPropagation(),
                ...props,

            },
                // Three Object 3d children 
                <>
                    {children.props.children}
                    {/* Only show the outline if the object is hovered and its not selected ( because it will already have a bounding box for modifying the geometry) */}
                    <Edges lineWidth={1.5} scale={1.1} visible={hoveredObject?.vxkey === vxkey && !selectedObjectKeys.includes(vxkey)} renderOrder={1000}>
                        <meshBasicMaterial transparent color="#2563eb" depthTest={false} />
                    </Edges>
                    <Edges lineWidth={1.5} scale={1.1} visible={containsSupportedGeometries && selectedObjectKeys.includes(vxkey)} renderOrder={1000} color="#949494">
                    </Edges>

                </>
            )
        ) : children;

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

const EditableGroup = forwardRef<Group, EditableGroupProps>((props, forwardedRef) => {
    if (props.vxkey === undefined) {
        throw new Error("<vx.group> wasn't provided a vxkey")
    }
    const { addObject, removeObject, selectObjects } = useVXObjectStore(state => ({
        addObject: state.addObject,
        removeObject: state.removeObject,
        selectObjects: state.selectObjects
    }));
    const id = useMemo(() => { return `group-${Math.random()}`; }, [])

    const internalRef = useRef(null);
    const ref = forwardedRef || internalRef;


    // Memoize handlers to prevent unnecessary updates
    const memoizedAddObject = useCallback(addObject, []);
    const memoizedRemoveObject = useCallback(removeObject, []);

    const type = "group"

    useEffect(() => {
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
