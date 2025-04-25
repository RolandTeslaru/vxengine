import React, { useEffect, useRef } from "react";
import { batchUpdateProperties, useObjectManagerAPI } from "./stores/managerStore";
import { useRefStore } from "@vxengine/utils/useRefStore";
import { useVXObjectStore } from "./stores/objectStore";

import * as THREE from "three";
import { useObjectSetting, useObjectSettingsAPI } from "./stores/settingsStore";
import { TransformControls } from "@react-three/drei";
import { AmmoPhysics, TransformControls as TransformControlsImpl } from "three-stdlib";

import animationEngineInstance from "@vxengine/singleton";
import { vxObjectProps, vxSplineNodeProps } from "./types/objectStore";
import { useTimelineManagerAPI } from "../TimelineManager";
import { dispatchVirtualEntityChangeEvent } from "./utils/driver";
import { shallow } from "zustand/shallow";

const excludedObjectTypes = ["effect"]

export const ObjectManagerDriver = () => {
    const { vxkey, transformSpace, transformMode, setTransformMode } = useObjectManagerAPI(state => {
        return {
            vxkey: state.selectedObjectKeys[0],
            transformSpace: state.transformSpace,
            transformMode: state.transformMode,
            setTransformMode: state.setTransformMode
        }
    } , shallow)
    
    const vxobject = useVXObjectStore(state => state.objects[vxkey]);

    const transformControlsRef = useRefStore(state => state.transformControlsRef)

    const isUsingSplinePath = useObjectSetting(vxkey, "useSplinePath", false)
    const isValid = !excludedObjectTypes.includes(vxobject?.type)

    const isTransformDisabled =
        (isUsingSplinePath && transformMode === "translate") ||
        vxobject?.disabledParams?.includes("position") ||
        !isValid;

    useEffect(() => {
        const controlsImpl = transformControlsRef.current
        if (!controlsImpl) return

        const handleDraggingChanged = (event: any) => {
            if(!event.value) {
                animationEngineInstance
                    .paramModifierService
                    .flushTimelineStateUpdates()
            }
        }

        // @ts-expect-error
        controlsImpl.addEventListener('dragging-changed', handleDraggingChanged)

        return () => {
            // @ts-expect-error
            controlsImpl.removeEventListener('dragging-changed', handleDraggingChanged)
        }
    }, [])

    useEffect(() => {
        if (!vxobject) return

        const controls = transformControlsRef?.current as any;
        if (!controls) return

        setTransformMode("translate");
        const vxobjectRef = vxobject.ref.current as THREE.Object3D
        if (transformSpace === "local") {
            vxobjectRef.getWorldPosition(oldProps.position)
            vxobjectRef.getWorldQuaternion(oldProps.rotation)
            vxobjectRef.getWorldScale(oldProps.scale)
        }

    }, [vxobject])

    return (
        <>
            {(!!vxobject?.ref?.current && !isTransformDisabled) &&
                <TransformControls
                    ref={transformControlsRef}
                    object={vxobject.ref.current}
                    mode={transformMode}
                    onObjectChange={(e) => handleOnVxObjectChange(e, vxobject, transformSpace, transformMode)}
                    space={transformSpace}
                />
            }
        </>
    )
}






const handleOnVxObjectChange = (e: any, vxobject: vxObjectProps, transformSpace: "world" | "local", transformMode: TransformModeType) => {
    const controls = e.target;
    const axis = controls.axis;
    if (!axis) return;

    const axes = axis.split('');

    // Additional logic can be added here if needed

    VXOBJECT_TYPE_CALLBACKS[vxobject.type](e, vxobject, axes, transformMode, transformSpace, "changing")

    animationEngineInstance.paramModifierService.flushUiUpdates();
}

const handleOnEntityChange: ChangeFnType = (
    e, vxobject, axes, transformMode, transformSpace, mode
) => {
    TRANSFORM_TYPE_CALLBACKS[transformMode](e, vxobject, axes, transformMode, transformSpace, mode)
}

const handleOnVirtualEntityChange: ChangeFnType = (
    e, vxobject, axes, transformMode, transformSpace, mode
) => {
    TRANSFORM_TYPE_CALLBACKS[transformMode](e, vxobject, axes, transformMode, transformSpace, mode)
    dispatchVirtualEntityChangeEvent(e, vxobject)
}

const handleOnSplineNodeChange: ChangeFnType = (
    e, vxobject, axes, transformMode, transformSpace, mode
) => {
    const { index, splineKey, ref } = vxobject as vxSplineNodeProps;
    const newPosition = ref.current.position as THREE.Vector3;

    useTimelineManagerAPI.getState().setSplineNodePosition(splineKey, index, newPosition)

    const vxNodeKey = `${splineKey}.node${index}`

    batchUpdateProperties([
        { vxkey: vxNodeKey, propertyPath: 'position.x', value: newPosition.x },
        { vxkey: vxNodeKey, propertyPath: 'position.y', value: newPosition.y },
        { vxkey: vxNodeKey, propertyPath: 'position.z', value: newPosition.z }
    ])
}

const handleOnKeyframeNodeChange: ChangeFnType = (
    e, vxobject, axes, transformMode, transformSpace, mode
) => {

}

const VXOBJECT_TYPE_CALLBACKS: Record<string, ChangeFnType> = {
    entity: handleOnEntityChange,
    virtualEntity: handleOnVirtualEntityChange,
    splineNode: handleOnSplineNodeChange,
    keyframeNode: handleOnKeyframeNodeChange
}



const oldProps = {
    position: new THREE.Vector3(),
    rotation: new THREE.Quaternion(),
    scale: new THREE.Vector3()
}

const currentProps = {
    position: new THREE.Vector3(),
    rotation: new THREE.Quaternion(),
    scale: new THREE.Vector3()
}

const accumulatedRotation = {
    current: {
        x: 0,
        y: 0,
        z: 0
    }
}

const handleOnTranslateChange: ChangeFnType = (
    e, vxobject, axes, transformMode, transformSpace, mode
) => {
    const objectRef = vxobject.ref.current as THREE.Object3D
    // axes only contains only the axis that changed
    if (transformSpace === "world") {
        axes.forEach((axis: string, index) => {
            axis = axis.toLowerCase()

            const propertyPath = `position.${axis}`
            const newValue = objectRef.position[axis];

            // dont rerender beause TransformControls moves the object itself
            animationEngineInstance
                .paramModifierService
                .modifyParamValue(vxobject.vxkey, propertyPath, newValue, false)
        })
    }
    // For local when need to change all axes if they have changed
    else if (transformSpace === "local") {
        currentProps.position = objectRef.position.clone()
        Array('x', 'y', 'z').forEach(axis => {
            const propertyPath = `position.${axis}`
            const oldValue = oldProps.position[axis]
            const newValue = currentProps.position[axis]

            if (oldValue !== newValue) {
                animationEngineInstance
                    .paramModifierService
                    .modifyParamValue(vxobject.vxkey, propertyPath, newValue, false)

                oldProps.position[axis] = newValue;
            }
        })
    }

}

const handleOnRotationChange: ChangeFnType = (
    e, vxobject, axes, transformMode, transformSpace, mode
) => {
    const objectRef = vxobject.ref.current as THREE.Object3D

    if (transformSpace === "world") {
        axes.forEach(axis => {
            axis = axis.toLowerCase();

            const propertyPath = `rotation.${axis}`
            const newValue = objectRef.rotation[axis];

            animationEngineInstance
                .paramModifierService
                .modifyParamValue(vxobject.vxkey, propertyPath, newValue, false)
        })
    }
    else if (transformSpace === "local") {
        objectRef.getWorldQuaternion(currentProps.rotation);

        const newEuler = new THREE.Euler().setFromQuaternion(currentProps.rotation)

        Array('x', 'y', 'z').forEach(axis => {
            const propertyPath = `rotation.${axis}`
            const oldValue = accumulatedRotation.current[axis]
            const newValue = newEuler[axis]

            // 1. Compute difference in the principal range
            let diff = newValue - oldValue;

            // 2. If crossing ±π boundary, fix it
            if (diff > Math.PI) diff -= 2 * Math.PI;
            if (diff < -Math.PI) diff += 2 * Math.PI;

            // 3. Accumulate
            const unwrappedValue = oldValue + diff;

            // 4. Save back into `accumulatedRotation`
            accumulatedRotation.current[axis] = unwrappedValue;

            // 4. This unwrappedVal is the actual continuous angle
            if (oldValue !== unwrappedValue)
                animationEngineInstance
                    .paramModifierService
                    .modifyParamValue(vxobject.vxkey, propertyPath, unwrappedValue, false)
        })
    }
}

const handleOnScaleChange: ChangeFnType = (
    e, vxobject, axes, transformMode, transformSpace, mode
) => {
    const objectRef = vxobject.ref.current as THREE.Object3D

    if (transformSpace === "world") {
        axes.forEach(axis => {
            axis = axis.toLowerCase();
            const propertyPath = `scale.${axis}`
            const newValue = objectRef.scale[axis]

            animationEngineInstance
                .paramModifierService
                .modifyParamValue(vxobject.vxkey, propertyPath, newValue, false)
        })
    }
    else if (transformSpace === "local") {
        objectRef.getWorldScale(currentProps.scale)

        Array('x', 'y', 'z').forEach(axis => {
            const propertyPath = `scale.${axis}`
            const oldValue = oldProps.scale[axis]
            const newValue = currentProps.scale[axis]

            if (oldValue !== newValue)
                animationEngineInstance
                    .paramModifierService
                    .modifyParamValue(vxobject.vxkey, propertyPath, newValue, false)
        })
    }
}


const TRANSFORM_TYPE_CALLBACKS = {
    translate: handleOnTranslateChange,
    rotate: handleOnRotationChange,
    scale: handleOnScaleChange
}


type DragModeType = "start" | "changing" | "end"
type TransformModeType = "translate" | "rotate" | "scale"


type ChangeFnType = (e: any,
    vxobject: vxObjectProps,
    axes: string[],
    transformMode: TransformModeType,
    transformSpace: string,
    mode: DragModeType) => void