import { create } from 'zustand';
import { MIN_SCALE_COUNT, START_CURSOR_TIME } from 'vxengine/AnimationEngine/interface/const';
import { useVXEngine } from 'vxengine/engine';
import { IKeyframe, IStaticProps, ITrack, edObjectProps } from 'vxengine/AnimationEngine/types/track';
import { ScrollSync } from 'react-virtualized';
import { createWithEqualityFn } from 'zustand/traditional';
import React from 'react';
import { handleSetCursor } from './utils/handleSetCursor';
import { AnimationEngine } from 'vxengine/AnimationEngine/engine';
import vx, { useVXObjectStore } from 'vxengine/store';
import { keyframes } from 'leva/dist/declarations/src/styles';
import { produce } from 'immer';
import { PathGroup } from './types/data';


export interface TimelineEditorStoreProps {
    editorData: Record<string, edObjectProps>;
    scale: number;
    setScale: (count: number) => void;
    cursorTime: number;
    setCursorTime: (time: number) => void;
    width: number;
    setWidth: (width: number) => void;
    activeTool: string;
    setActiveTool: (tool: string) => void;
    snap: boolean;
    setSnap: (value: boolean) => void;
    scaleCount: number;
    setScaleCount: (count: number) => void;
    editAreaRef: React.MutableRefObject<HTMLDivElement | null>
    scaleWidth: number
    scaleSplitCount: number
    startLeft: number
    changes: number
    addChange: () => void
    editorRef: React.MutableRefObject<HTMLDivElement | null>
    cursorTimeRef: React.MutableRefObject<number>;

    scrollLeft: number;
    setScrollLeft: (scrollLeft: number) => void;
    scrollTop: number;
    setScrollTop: (scrollTop: number) => void;
    clientWidth: number;
    clientHeight: number;
    scrollHeight: number;

    collapsedGroups: Record<string, boolean>;
    setCollapsedGroups: (groupKey: string) => void;

    createNewKeyframe: (animationEngine: AnimationEngine, vxkey: string, propertyPath: string, value: number) => void;
    moveToNextKeyframe: (animationEngine: AnimationEngine, vxkey: string, propertyPath: string) => void;
    moveToPreviousKeyframe: (animationEngine: AnimationEngine, vxkey: string, propertyPath: string) => void;
    findTrackByPropertyPath: (vxkey: string, propertyPath: string) => ITrack | undefined;
    updateEditorDataProperty: (vxkey: string, propertyPath: string, value: number) => void

}

const precomputeRowIndices = (
    groupedTracks: Record<string, PathGroup>,
    currentRowIndex = 1,
    prevRowIndex = 0
): number => {
    Object.entries(groupedTracks).forEach(([key, group]) => {
        const childrenAllKeys = Object.keys(group.children);
        const isPath = group.children && childrenAllKeys.length > 0;
        const isNestedToPreviousPath = !(group.children && childrenAllKeys.length > 1)
        const isTrack = !isPath && group.track;

        group.prevRowIndex = prevRowIndex;
        group.rowIndex = currentRowIndex;
        // group.nextRowIndex = isNestedToPreviousPath ? 1 : currentRowIndex + 1;

        if (isPath) {
            if (isNestedToPreviousPath) {
                group.nextRowIndex = prevRowIndex;
            }
            else {
                currentRowIndex += 1;
                group.nextRowIndex = currentRowIndex;
            }
            const childFinalIndex = precomputeRowIndices(group.children, currentRowIndex, group.rowIndex);
            group.localFinalTrackIndex = childFinalIndex;
            currentRowIndex = childFinalIndex + 1;
        } else if (isTrack) {
            group.nextRowIndex = currentRowIndex + 1;
            group.localFinalTrackIndex = group.nextRowIndex - 1;
            currentRowIndex = group.nextRowIndex;
        }
    });

    const allKeys = Object.keys(groupedTracks);

    return groupedTracks[allKeys[allKeys.length - 1]]?.localFinalTrackIndex || currentRowIndex;
};

const groupTracksByParent = (tracks: ITrack[], trackRowIndex: number) => {
    const groupedTracks: Record<string, PathGroup> = {};

    tracks.forEach((track) => {
        const pathSegments = track.propertyPath.split('.');

        let currentGroup = groupedTracks;

        pathSegments.forEach((key, index) => {
            if (!currentGroup[key]) {
                currentGroup[key] = { children: {}, track: null };
            }

            if (index === pathSegments.length - 1) {
                currentGroup[key].track = track;
            } else {
                currentGroup = currentGroup[key].children;
            }
        });
    });
    // Call precomputeRowIndices and return both grouped tracks and the final index
    const finalIndex = precomputeRowIndices(groupedTracks, trackRowIndex);

    return { groupedTracks, finalIndex };
};

export const updateEditorDataProperty = (
    set: any,
    vxkey: string,
    propertyPath: string,
    value: any
  ) => {
    set(
      produce((state: TimelineEditorStoreProps) => {
        if (!state.editorData[vxkey]) {
          state.editorData[vxkey] = {
            vxkey: vxkey,
            tracks: [],
            staticProps: [],
          };
        }
  
        const keys = propertyPath.split(".");
        let target = state.editorData[vxkey];
  
        for (let i = 0; i < keys.length; i++) {
          if (!target[keys[i]]) target[keys[i]] = {};
          target = target[keys[i]];
        }
  
        target[keys[keys.length - 1]] = value;
      }),
      false
    );
  };
  

export const useTimelineEditorStore = createWithEqualityFn<TimelineEditorStoreProps>((set, get) => ({
    editorData: {},
    scale: 1,
    scaleCount: MIN_SCALE_COUNT,
    cursorTime: START_CURSOR_TIME,
    cursorTimeRef: (() => {
        const ref = React.createRef<number>();
        // @ts-expect-error
        ref.current = 0;
        return ref;
    })(),

    width: Number.MAX_SAFE_INTEGER,
    
    activeTool: "mouse",
    snap: true,
    editAreaRef: React.createRef<HTMLDivElement>(),
    scaleWidth: 160,
    scaleSplitCount: 10,
    startLeft: 20,
    changes: 0,

    scrollLeft: 0,
    scrollTop: 0,
    clientHeight: 378,
    clientWidth: 490,
    scrollHeight: 270,
    
    selectedKeyframes: [],
    editorRef: React.createRef<HTMLDivElement>(),

    setScale: (count) => set({ scale: count }),
    setScaleCount: (count) => set({ scaleCount: count }),
    setWidth: (width) => set({ width }),
    setScrollLeft: (value) => set({ scrollLeft: Math.max(value, 0)}),
    setScrollTop: (scrollTop) => set({ scrollTop }),
    setActiveTool: (tool) => set({ activeTool: tool }),
    setSnap: (value) => set({ snap: value }),
    addChange: () => set((state) => ({ ...state, changes: state.changes + 1 })),
    setCursorTime: (time: number) => {
        get().cursorTimeRef.current = time;
        set({ cursorTime: time });
    },

    collapsedGroups: {},
    setCollapsedGroups: (groupKey: string) => {
        set((state: TimelineEditorStoreProps) => {
            const collapsedGroups = { ...state.collapsedGroups };
            collapsedGroups[groupKey] = !collapsedGroups[groupKey];
            return { collapsedGroups };
        });
    },

    updateEditorDataProperty: (vxkey, propertyPath, value) => {
        updateEditorDataProperty(set, vxkey, propertyPath, value);
    },

    findTrackByPropertyPath: (vxkey, propertyPath) => {
        // console.log("Finding track by properties")
        const edObject = get().editorData[vxkey]
        // console.log("Data foun objdata ", edObject,  " and editorData:", editorData)
        return edObject?.tracks.find(track => track.propertyPath === propertyPath);
    },

    createNewKeyframe: (animationEngine, vxkey, propertyPath, value) => {
        console.log("TimelineEditor: Creating New keyframe for vxkey", vxkey, " with propertyPath", propertyPath);
        
        const { cursorTimeRef, addChange, findTrackByPropertyPath } = get();
        
        const newKeyframe: IKeyframe = {
            id: `keyframe-${Date.now()}`,
            time: cursorTimeRef.current,
            value: value
        };
    
        set(state => {
            // Create a new copy of editorData
            const updatedEditorData = produce(state.editorData, draft => {
                const edObject = draft[vxkey];
                let track = findTrackByPropertyPath(vxkey, propertyPath);
    
                const isPropertyTracked = track !== undefined;
                const isPropertyStatic = !isPropertyTracked;
    
                if (isPropertyTracked) {
                    // Check if the track object or keyframes array is frozen or sealed
                    if (Object.isFrozen(track) || Object.isSealed(track)) {
                        track = {
                            ...track,
                            keyframes: [...track.keyframes], // Shallow copy to make the array mutable
                        };
                        
                        // Update the draft with the new, mutable track
                        draft[vxkey].tracks = draft[vxkey].tracks.map(t => 
                            t.propertyPath === propertyPath ? track : t
                        );
                    }
                
                    const isCursorOnKeyframe = track.keyframes.some(kf => kf.time === cursorTimeRef.current);
                    if (!isCursorOnKeyframe) {
                        track.keyframes.push(newKeyframe); // This is where the error occurs
                    }
                } else if (isPropertyStatic) {
                    edObject.staticProps = edObject.staticProps.filter(prop => prop.propertyPath !== propertyPath);
                    track = {
                        propertyPath: propertyPath,
                        keyframes: [newKeyframe]
                    };
                    edObject.tracks.push(track);
                }
            });

            animationEngine.updateCurrentTimeline(updatedEditorData);
    
            return {
                ...state,
                editorData: updatedEditorData
            };
        });        
    
        addChange();
    },
    moveToNextKeyframe: (animationEngine, vxkey, propertyPath) => {
        const { findTrackByPropertyPath, cursorTime, setCursorTime, scale } = get();
        const track = findTrackByPropertyPath(vxkey, propertyPath);

        if (track) {
            const nextKeyframe = track.keyframes.find(kf => kf.time > cursorTime);
            if (nextKeyframe) {
                handleSetCursor({
                    time: nextKeyframe.time,
                    animationEngine,
                    scale,
                    setCursorTime,
                });
            }
        }
    },

    moveToPreviousKeyframe: (animationEngine, vxkey, propertyPath) => {
        const { findTrackByPropertyPath, cursorTime, setCursorTime, scale } = get();
        const track = findTrackByPropertyPath(vxkey, propertyPath);

        if (track) {
            const prevKeyframe = [...track.keyframes].reverse().find(kf => kf.time < cursorTime);
            if (prevKeyframe) {
                handleSetCursor({
                    time: prevKeyframe.time,
                    animationEngine,
                    scale,
                    setCursorTime,
                });
            }
        }
    },
})
);