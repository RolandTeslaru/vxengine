import { create } from 'zustand';
import { MIN_SCALE_COUNT, START_CURSOR_TIME } from 'vxengine/AnimationEngine/interface/const';
import { useVXEngine } from 'vxengine/engine';
import { IObjectEditorData, IKeyframe, IStaticProps, ITrack } from 'vxengine/AnimationEngine/types/track';
import { ScrollSync } from 'react-virtualized';
import { createWithEqualityFn } from 'zustand/traditional';
import React from 'react';
import { handleSetCursor } from './utils/handleSetCursor';
import { AnimationEngine } from 'vxengine/AnimationEngine/engine';
import { useVXObjectStore } from 'vxengine/store';
import { keyframes } from 'leva/dist/declarations/src/styles';


export interface TimelineEditorStoreProps {
    editorData: IObjectEditorData[];
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
}

export const useTimelineEditorStore = createWithEqualityFn<TimelineEditorStoreProps>((set, get) => ({
        editorData: [],
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

        findTrackByPropertyPath: (vxkey, propertyPath) => {
            const editorData = get().editorData;
            const objData = editorData.find(data => data.vxkey === vxkey);
            return objData?.tracks.find(track => track.propertyPath === propertyPath);
        },

        createNewKeyframe: (animationEngine, vxkey, propertyPath, value) => {
            console.log("TimelineEditor: Creating New keyframe for vxkey",vxkey, "  with propertyPath", propertyPath)
            const { editorData, cursorTimeRef, addChange, findTrackByPropertyPath } = get();
            const objIndex = editorData.findIndex(data => data.vxkey === vxkey);
            // Object exists in editor data
            if(objIndex !== -1){
                const object = editorData[objIndex]
                let track = findTrackByPropertyPath(vxkey, propertyPath);
                
                const isPropertyTracked = track === undefined ? false : true
                const isPropertyStatic = !isPropertyTracked;
                
                const newKeyframe: IKeyframe = {
                    id: `keyframe-${Date.now()}`,
                    time: cursorTimeRef.current,
                    value: value
                }

                if(isPropertyTracked){  
                    // Check if cursor is already on a keyframe
                    const isCursorOnKeyframe = track.keyframes.some(kf => kf.time === cursorTimeRef.current);
                    if(isCursorOnKeyframe)
                        return;

                    track.keyframes.push(newKeyframe);
                }
                if(isPropertyStatic){
                    // Static Property will be deleted and a new track with the property path will be created
                    // Remove static property from the staticProps array
                    object.staticProps = object.staticProps.filter(prop => prop.propertyPath !== propertyPath);
                    track = {
                        propertyPath: propertyPath,
                        keyframes: [newKeyframe]
                    }
                    object.tracks.push(track);
                }
                const updatedEditorData = [... editorData];
                animationEngine.setEditorData(updatedEditorData);
                addChange();
            }
        
            // if (objIndex !== -1) {
        
            //     const newKeyframe: IKeyframe = {
            //         id: `keyframe-${Date.now()}`,
            //         time: cursorTime,
            //         value: value, 
            //     };

            //     if (!track) {
            //         track = {
            //             propertyPath,
            //             keyframes: [
            //                 newKeyframe
            //             ]
            //         };
            //         editorData[objIndex].tracks.push(track);
            //     }
        
            //     track.keyframes.push(newKeyframe);
        
            //     // Update the editor data with the new keyframe added
            //     const updatedEditorData = [...editorData];
            //     animationEngine.setEditorData(updatedEditorData);
            //     addChange();
            // }
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