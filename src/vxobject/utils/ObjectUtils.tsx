'use client'

import { ReactThreeFiber } from '@react-three/fiber'
import { useObjectManagerAPI } from '@vxengine/managers/ObjectManager'
import { vxObjectProps, vxSpline } from '@vxengine/managers/ObjectManager/types/objectStore'
import React, { isValidElement, useEffect, useLayoutEffect, useMemo } from 'react'
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import Spline from '@vxengine/managers/SplineManager/Spline'
import PositionPath from './positionPath'
import { useVXObjectStore } from '../../managers/ObjectManager/stores/objectStore'
import { getVXEngineState } from '@vxengine/engine'
import * as THREE from "three"
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager'
import { AnimationEngine } from '@vxengine/AnimationEngine/engine'
import { RawSpline } from '@vxengine/AnimationEngine/types/track'

interface ObjectUtils {
    vxkey: string
    children: React.ReactElement<ReactThreeFiber.Object3DNode<THREE.Object3D<THREE.Object3DEventMap>, any>, string | React.JSXElementConstructor<any>>
}

const supportedGeometries = ["boxGeometry", "sphereGeometry", "planeGeometry"]

const ObjectUtils: React.FC<ObjectUtils> = React.memo(({ vxkey, children }) => {

    const object3DInnerChildren = children.props.children;

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

    const settings = useObjectSettingsAPI(state => state.settings[vxkey])
    const additionalSettings = useObjectSettingsAPI(state => state.additionalSettings[vxkey])

    const showPositionPath = additionalSettings["showPositionPath"]

    return (
        <>
            {settings.useSplinePath && (
                <Spline splineKey={"spline1"} vxkey={vxkey} visible={showPositionPath} />
            )}
            {/* <Edges lineWidth={1.5} scale={1.1} visible={hoveredObject?.vxkey === vxkey && !selectedObjectKeys.includes(vxkey)} renderOrder={1000}>
                <meshBasicMaterial transparent color="#2563eb" depthTest={false} />
            </Edges>
            <Edges lineWidth={1.5} scale={1.1} visible={containsSupportedGeometries && selectedObjectKeys.includes(vxkey)} renderOrder={1000} color="#949494">
            </Edges> */}

            {additionalSettings["showPositionPath"] && <>
                    <PositionPath vxkey={vxkey} />
            </>
            }
        </>
    )
})

export default ObjectUtils





function createNewSpline(vxkey: string): RawSpline {
    const splineKey = `${vxkey}.spline`

    const animationEngine = getVXEngineState().getState().animationEngine

    const initialPosition = useVXObjectStore.getState().objects[vxkey].ref.current.position as THREE.Vector3;
    const initialNode = [
        AnimationEngine.truncateToDecimals(initialPosition.x),
        AnimationEngine.truncateToDecimals(initialPosition.y),
        AnimationEngine.truncateToDecimals(initialPosition.z)
    ];
    const nodes = [
        initialNode,
        [
            AnimationEngine.truncateToDecimals(Math.random() * 10),
            AnimationEngine.truncateToDecimals(Math.random() * 10),
            AnimationEngine.truncateToDecimals(Math.random() * 10)
        ],
        [
            AnimationEngine.truncateToDecimals(Math.random() * 10),
            AnimationEngine.truncateToDecimals(Math.random() * 10),
            AnimationEngine.truncateToDecimals(Math.random() * 10)
        ]
    ]

    animationEngine.refreshSpline("create", splineKey, true)

    return { splineKey, nodes, vxkey } as RawSpline
}

function initializeVXSpline(rawSpline: RawSpline) {
    const createTrack = useTimelineEditorAPI.getState().createTrack;
    const createKeyframe = useTimelineEditorAPI.getState().createKeyframe;
    
    const {vxkey} = rawSpline
    
    const splineKey = `${vxkey}.spline`
    const trackKey = `${vxkey}.splineProgress`
    createTrack(trackKey);
    createKeyframe({
        trackKey,
        value: 0
    })

    const spline: vxSpline = {
        objectVxKey: vxkey,
        vxkey: splineKey,
        ref: {
            current: {
                nodes: rawSpline.nodes,
                type: "Spline"
            }
        },
        type: "spline",
        name: `${vxkey} spline`,
        parentKey: "splines"
    }

    return spline;
}