import { ReactThreeFiber } from '@react-three/fiber'
import { useObjectManagerAPI } from '@vxengine/managers/ObjectManager'
import { vxObjectProps } from '@vxengine/types/objectStore'
import React, { isValidElement, useEffect, useMemo } from 'react'
import { useObjectSettingsAPI } from '../ObjectSettingsStore'
import { Edges } from '@react-three/drei'
import Spline from '@vxengine/managers/SplineManager/Spline'
import PositionPath from './positionPath'
import { useVXAnimationStore } from '@vxengine/AnimationEngine'
import { useSplineManagerAPI } from '@vxengine/managers/SplineManager/store'
import { useVXObjectStore } from '../ObjectStore'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/store'

interface ObjectUtils {
    vxObject: vxObjectProps
    children: React.ReactElement<ReactThreeFiber.Object3DNode<THREE.Object3D<THREE.Object3DEventMap>, any>, string | React.JSXElementConstructor<any>>
}

const supportedGeometries = ["boxGeometry", "sphereGeometry", "planeGeometry"]

const ObjectUtils: React.FC<ObjectUtils> = React.memo(({ vxObject, children }) => {
    if (!vxObject) return

    const vxkey = vxObject.vxkey;
    const hoveredObject = useObjectManagerAPI(state => state.hoveredObject)
    const selectedObjectKeys = useObjectManagerAPI(state => state.selectedObjectKeys)

    const addSpline = useSplineManagerAPI(state => state.addSpline)
    const removeSpline = useSplineManagerAPI(state => state.removeSpline);
    const createSpline = useSplineManagerAPI(state => state.createSpline)

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
    const currenetTimelineID = useVXAnimationStore(state => state.currentTimeline.id)


    // Initialize the slpine object in the record when mount ( meaning its not there yet so i have to get it from the currentTimeline) 
    // also when the current timeline changes the 
    // if use spline path gets deactivated then it gets deleted
    useEffect(() => {
        const animationEngine = useTimelineEditorAPI.getState().animationEngineRef.current
        const currenetTimeline = useVXAnimationStore.getState().currentTimeline
        const splineKey = `${vxkey}.spline`
        if (settings?.useSplinePath) {
            const splineObjFromTimeline = currenetTimeline.splines?.[splineKey];
            if (splineObjFromTimeline) {
                addSpline(splineObjFromTimeline);
            }
            else {
                const initialPosition = useVXObjectStore.getState().objects[vxkey].ref.current.position as THREE.Vector3;
                const initialNode = [initialPosition.x, initialPosition.y, initialPosition.z];
                const newNodes = [
                    initialNode,
                    [
                    (Math.random() * 10),
                    (Math.random() * 10),
                    (Math.random() * 10)
                    ],
                    [
                        (Math.random() * 10),
                        (Math.random() * 10),
                        (Math.random() * 10)
                    ]
                ]
                createSpline(vxkey, splineKey, newNodes) // create and add spline

                animationEngine.refreshSpline("create", splineKey, true)
            }
        }
    }, [currenetTimelineID, settings?.useSplinePath])


    return (
        <>
            <Edges lineWidth={1.5} scale={1.1} visible={hoveredObject?.vxkey === vxkey && !selectedObjectKeys.includes(vxkey)} renderOrder={1000}>
                <meshBasicMaterial transparent color="#2563eb" depthTest={false} />
            </Edges>
            <Edges lineWidth={1.5} scale={1.1} visible={containsSupportedGeometries && selectedObjectKeys.includes(vxkey)} renderOrder={1000} color="#949494">
            </Edges>

            {additionalSettings["showPositionPath"] && <>
                {settings.useSplinePath && (
                    <Spline splineKey={"spline1"} vxkey={vxkey} />
                )}
                <PositionPath vxkey={vxkey} />

            </>
            }
        </>
    )
})

export default ObjectUtils
