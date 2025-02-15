import { ReactThreeFiber } from '@react-three/fiber'
import React, { isValidElement, useEffect, useLayoutEffect, useMemo } from 'react'
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import Spline from '@vxengine/managers/SplineManager/Spline'
import PositionPath from './positionPath'
import * as THREE from "three"
import { useObjectSetting } from '@vxengine/managers/ObjectManager/stores/settingsStore';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';

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

    const showPositionPath = useObjectSetting(vxkey, "showPositionPath");
    const splineKey = `${vxkey}.spline`

    const edSpline = useTimelineManagerAPI(state => state.splines[splineKey]);

    return (
        <>
            {settings?.useSplinePath && edSpline && (
                <Spline splineKey={"spline1"} vxkey={vxkey} edSpline={edSpline} visible={showPositionPath} />
            )}
            {/* <Edges lineWidth={1.5} scale={1.1} visible={hoveredObject?.vxkey === vxkey && !selectedObjectKeys.includes(vxkey)} renderOrder={1000}>
                <meshBasicMaterial transparent color="#2563eb" depthTest={false} />
            </Edges>
            <Edges lineWidth={1.5} scale={1.1} visible={containsSupportedGeometries && selectedObjectKeys.includes(vxkey)} renderOrder={1000} color="#949494">
            </Edges> */}

            {showPositionPath && <>
                <PositionPath vxkey={vxkey} />
            </>
            }
        </>
    )
})

export default ObjectUtils