// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { create } from 'zustand';
import { produce } from "immer"
import { ISpline } from '@vxengine/AnimationEngine/types/track';
import { SplineNodeProps } from './components/SplineNode';
import { useTimelineEditorAPI } from '../TimelineManager/store';
import { extractVxKeyFromSplineKey } from './components/utils';
import { getVXEngineState, useVXEngine } from '@vxengine/engine';

import * as THREE from "three"

interface SplineStoreProps {
    splines: Record<string, ISpline>
    initSplines: (newSplines: Record<string, ISpline>) => void;
    addSpline: (spline: ISpline) => void;
    removeSpline: (splineKey: string) => void;
    setSplineNodePosition: (splineKey: string, nodeIndex: number, newPosition: THREE.Vector3) => void;
    selectedSpline: ISpline;
    setSelectedSpline: (splineKey: string) => void;
    changeSplineNodeAxisValue: (splineKey: string, nodeIndex, newValue: number, axis: "x" | "y" | "z") => void
    insertNode: (splineKey: string, index: number) => void;
    removeNode: (splineKey: string, index: number) => void;
    createSpline: (vxkey: string, splineKey: string, nodes: [number, number, number][]) => void
}

export const useSplineManagerAPI = create<SplineStoreProps>((set, get) => ({
    splines: {},
    createSpline: (vxkey, splineKey, nodes) => {
        const newSpline: ISpline = {
            splineKey,
            vxkey,
            nodes
        }
        get().addSpline(newSpline);

        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshSpline("create", splineKey, true)
        const createTrack = useTimelineEditorAPI.getState().createTrack;
        const createKeyframe = useTimelineEditorAPI.getState().createKeyframe;
        
        const trackKey = `${vxkey}.splineProgress`
        createTrack(trackKey);
        createKeyframe({trackKey, value: 0})
    },
    addSpline: (spline: ISpline) => {
        const { vxkey } = spline
        set(produce((state: SplineStoreProps) => {
            state.splines[spline.splineKey] = spline // Add to record
        }))
    },
    removeSpline: (splineKey) => {
        const vxkey = extractVxKeyFromSplineKey(splineKey)
        set(produce((state: SplineStoreProps) => {
            delete state.splines[splineKey];
        }))

        const trackKey = `${vxkey}.splineProgress`
        const removeTrack = useTimelineEditorAPI.getState().removeTrack;
        removeTrack({trackKey, reRender: true})

        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshSpline("remove", splineKey, true)
    },
    initSplines: (newSplines) => {
        const addSpline = get().addSpline;
        Object.entries(newSplines).forEach(([key, spline]) => {
            addSpline(spline)
        })
    },
    setSplineNodePosition: (splineKey: string, nodeIndex: number, newPosition: THREE.Vector3) => {
        set(produce((state: SplineStoreProps) => {
            state.splines[splineKey].nodes[nodeIndex] = [newPosition.x, newPosition.y, newPosition.z];
        }))

        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshSpline("update", splineKey, true)
    },
    changeSplineNodeAxisValue: (
        splineKey: string,
        nodeIndex: number, 
        newValue: number, 
        axis: "x" | "y" | "z"
    ) => {
        set(produce((state: SplineStoreProps) => {
            const newNode = state.splines[splineKey].nodes[nodeIndex];
    
            if (axis === "x") {
                newNode[0] = newValue;
            } else if (axis === "y") {
                newNode[1] = newValue; 
            } else if (axis === "z") {
                newNode[2] = newValue; 
            }
    
            state.splines[splineKey].nodes[nodeIndex] = [newNode[0], newNode[1], newNode[2]];
        }));
    
        // Call the animation engine to refresh the spline after the update
        const animationEngine = getVXEngineState().getState().animationEngine;
        animationEngine.refreshSpline("update", splineKey, true);
    },
    selectedSpline: undefined,
    setSelectedSpline: (splineKey) => {
        set(produce((state: SplineStoreProps) => {
            state.selectedSpline = state.splines[splineKey]
        }))
    },
    insertNode: (splineKey, index ) => {
        set(produce((state: SplineStoreProps) => {
            const spline = state.splines[splineKey];
            const nodes = spline.nodes;
            const prevNode = nodes[index];
            let nextNode = nodes[index + 1];
    
            if (!nextNode) {
                nextNode = [
                    (Math.random() * 10 - 5),
                    (Math.random() * 6 - 3),
                    (Math.random() * 8 - 4)
                ];
                nodes.splice(index + 1, 0, nextNode);
            } else {
                const interPoint: [number, number, number] = [
                    (prevNode[0] + nextNode[0]) / 2,
                    (prevNode[1] + nextNode[1]) / 2,
                    (prevNode[2] + nextNode[2]) / 2,
                ];
                nodes.splice(index + 1, 0, interPoint);
            }
    
            state.splines[splineKey] = { ...spline, nodes: [...nodes] };
    
            if (state.selectedSpline?.splineKey === splineKey) {
                state.selectedSpline = { ...spline, nodes: [...nodes] };
            }
        }));

        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshSpline("update", splineKey, true)
    },
    removeNode: (splineKey, index) => {
        set(produce((state: SplineStoreProps) => {
            const spline = state.splines[splineKey];
            
            if(spline.nodes.length === 2) return

            // Directly modify the nodes array
            spline.nodes.splice(index, 1);
    
            // Update selectedSpline if it's the one being modified
            if (state.selectedSpline?.splineKey === splineKey) {
                state.selectedSpline = spline;
            }
        }));

        const animationEngine = getVXEngineState().getState().animationEngine
        animationEngine.refreshSpline("update", splineKey, true)
    },
}))