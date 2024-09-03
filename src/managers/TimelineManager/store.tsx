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
    scrollLeft: number;
    setScrollLeft: (scrollLeft: number) => void;
    scrollTop: number;
    setScrollTop: (scrollTop: number) => void;
    editAreaRef: React.MutableRefObject<HTMLDivElement | null>
    scrollSyncRef: React.MutableRefObject<ScrollSync | null>
    scaleWidth: number
    scaleSplitCount: number
    startLeft: number
    changes: number
    addChange: () => void
    editorRef: React.MutableRefObject<HTMLDivElement | null>
    cursorTimeRef: React.MutableRefObject<number>;

    createNewKeyframe: (animationEngine: AnimationEngine, vxkey: string, propertyPath: string, value: number) => void;
    moveToNextKeyframe: (animationEngine: AnimationEngine, vxkey: string, propertyPath: string) => void;
    moveToPreviousKeyframe: (animationEngine: AnimationEngine, vxkey: string, propertyPath: string) => void;
    findTrackByPropertyPath: (vxkey: string, propertyPath: string) => ITrack | undefined;
    updateEditorDataProperty: (vxkey: string, propertyPath: string, value: number) => void
}

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
    scrollLeft: 0,
    scrollTop: 0,
    activeTool: "mouse",
    snap: true,
    editAreaRef: React.createRef<HTMLDivElement>(),
    scrollSyncRef: React.createRef<ScrollSync | null>(),
    scaleWidth: 160,
    scaleSplitCount: 10,
    startLeft: 20,
    changes: 0,
    selectedKeyframes: [],
    editorRef: React.createRef<HTMLDivElement>(),

    setScale: (count) => set({ scale: count }),
    setScaleCount: (count) => set({ scaleCount: count }),
    setWidth: (width) => set({ width }),
    setScrollLeft: (scrollLeft) => set({ scrollLeft }),
    setScrollTop: (scrollTop) => set({ scrollTop }),
    setActiveTool: (tool) => set({ activeTool: tool }),
    setSnap: (value) => set({ snap: value }),
    addChange: () => set((state) => ({ ...state, changes: state.changes + 1 })),
    setCursorTime: (time: number) => {
        get().cursorTimeRef.current = time;
        set({ cursorTime: time });
    },

    updateEditorDataProperty: (vxkey, propertyPath, value) => {
        set(
            produce((state: TimelineEditorStoreProps) => {
                if(!state.editorData[vxkey]){
                    state.editorData[vxkey] = {
                        vxkey: vxkey,
                        tracks: [],
                        staticProps: []
                    };
                }

                const keys = propertyPath.split('.');
                let target = state.editorData[vxkey];

                for(let i = 0; i < keys.length; i++){
                    if(!target[keys[i]])
                        target[keys[i]] = {}
                    target = target[keys[i]];
                }

                target[keys[keys.length - 1]] = value;
            }),
            false
        )
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