import { create } from 'zustand';
import { MIN_SCALE_COUNT, START_CURSOR_TIME } from 'vxengine/AnimationEngine/interface/const';
import { useVXEngine } from 'vxengine/engine';
import { IKeyframe, IStaticProps, ITrack, PathGroup, RawObjectProps, edObjectProps } from 'vxengine/AnimationEngine/types/track';
import { ScrollSync } from 'react-virtualized';
import { createWithEqualityFn } from 'zustand/traditional';
import React from 'react';
import { handleSetCursor } from './utils/handleSetCursor';
import { AnimationEngine } from 'vxengine/AnimationEngine/engine';
import vx, { useVXObjectStore } from 'vxengine/store';
import { keyframes } from 'leva/dist/declarations/src/styles';
import { produce } from 'immer';
import { computeGroupPathFromRawObject, computeGroupPaths, extractDatafromTrackKey } from './utils/trackDataProcessing';
import { useObjectManagerStore } from '../ObjectManager/store';
import { getNestedProperty } from 'vxengine/utils/nestedProperty';

export type GroupedPaths = Record<string, PathGroup>;

export interface TimelineEditorStoreProps {
    // Records of data used in the editor
    editorData: Record<string, edObjectProps>;
    tracks: Record<string, ITrack>,
    staticProps: Record<string, IStaticProps>
    keyframes: Record<string, IKeyframe>

    groupedPaths: GroupedPaths

    setCollapsedGroups: (groupKey: string) => void;

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
    trackListRef: React.MutableRefObject<HTMLDivElement | null>
    scaleWidth: number
    scaleSplitCount: number
    startLeft: number
    changes: number
    addChange: () => void
    editorRef: React.MutableRefObject<HTMLDivElement | null>

    scrollLeft: number;

    setEditorData: (rawObjects: RawObjectProps[]) => void;
    setScrollLeft: (scrollLeft: number) => void;
    scrollTop: number;
    setScrollTop: (scrollTop: number) => void;
    clientWidth: number;
    clientHeight: number;
    scrollHeight: number;

    // Keyframe Controls
    moveToNextKeyframe: (animationEngine: AnimationEngine, keyframes: IKeyframe[]) => void;
    moveToPreviousKeyframe: (animationEngine: AnimationEngine, keyframes: IKeyframe[]) => void;

    // Getter functions
    getTrack: (trackKey: string) => ITrack | undefined,
    getStaticProp: (vxkey: string, propertyPath: string) => IStaticProps | undefined
    getKeyframe: (keyframeId: string) => IKeyframe | undefined

    getTracksForObject: (vxkey: string) => ITrack[] | [],
    getStaticPropsForObject: (vxkey: string) => IStaticProps[] | [],
    getKeyframesForTrack: (trackKey: string) => IKeyframe[] | [],

    addKeyframeToTrack: (state: TimelineEditorStoreProps, keyframeKey: string, trackKey: string) => void
    
    // Maker functions
    createNewKeyframeOnTrack: (animationEngine: AnimationEngine, trackKey: string, value: number) => void;
    makePropertyTracked: (animationEngine: AnimationEngine, staticPropKey: string) => void
    makePropertyStatic: (animationEngine: AnimationEngine, trackKey: string) => void
}

function processRawData(
    rawObjects: RawObjectProps[]
) {
    const editorData: Record<string, { vxkey: string; trackKeys: string[]; staticPropKeys: string[] }> = {};
    const tracks: Record<string, ITrack> = {};
    const staticProps: Record<string, IStaticProps> = {};
    const keyframes: Record<string, IKeyframe> = {};

    // Generate Editor Data Record
    rawObjects.forEach((rawObj) => {
        const trackKeys: string[] = [];
        const staticPropKeys: string[] = [];

        // Generate Track Record for rawObj
        rawObj.tracks.forEach((track) => {
            const keyframeIds: string[] = [];
            const trackKey = `${rawObj.vxkey}.${track.propertyPath}`;

            // Generate Keyframe Record for rawObj
            track.keyframes.forEach((kf) => {
                const keyframeId = kf.id || `keyframe-${Date.now()}-${Math.random()}`;
                const newKeyframe: IKeyframe = {
                    id: keyframeId,
                    vxkey: rawObj.vxkey,
                    propertyPath: track.propertyPath,
                    time: kf.time,
                    value: kf.value,
                    handles: kf.handles
                }
                keyframes[keyframeId] = newKeyframe
                keyframeIds.push(keyframeId);
            });

            const newTrack: ITrack = {
                keyframes: keyframeIds,
                propertyPath: track.propertyPath,
                vxkey: rawObj.vxkey,
            };
            trackKeys.push(trackKey);
            tracks[trackKey] = newTrack;
        });

        // Generate StaticProp Record for rawObj
        rawObj.staticProps.forEach((prop) => {
            const staticPropKey = `${rawObj.vxkey}.${prop.propertyPath}`;
            staticPropKeys.push(staticPropKey);

            const newStaticProp: IStaticProps = {
                vxkey: rawObj.vxkey,
                value: prop.value,
                propertyPath: prop.propertyPath
            };
            staticProps[staticPropKey] = newStaticProp;
        });

        editorData[rawObj.vxkey] = {
            vxkey: rawObj.vxkey,
            trackKeys: trackKeys,
            staticPropKeys: staticPropKeys,
        };
    });
    const groupedPaths = computeGroupPaths(editorData)

    return { editorData, tracks, staticProps, groupedPaths, keyframes };
}


export const useTimelineEditorStore = createWithEqualityFn<TimelineEditorStoreProps>((set, get) => ({
    editorData: {},
    tracks: {},
    staticProps: {},
    groupedPaths: {},
    keyframes: {},

    setCollapsedGroups: (groupKey: string) => {
        set(produce((state: TimelineEditorStoreProps) => {
            const pathSegments = groupKey.split('/');
            let currentGroup: GroupedPaths | PathGroup = state.groupedPaths;

            // Bypass the root because currently currentGroup is of type GroupedPath
            const rootPath = pathSegments[0]
            // currentGroup is now PathGroup
            currentGroup = currentGroup[rootPath] as PathGroup;

            pathSegments.shift()
            pathSegments.forEach((segment) => {
                if(currentGroup.children[segment]){
                    currentGroup = currentGroup.children[segment]
                }
            });
    
            if (currentGroup) {
                currentGroup.isCollapsed = !currentGroup.isCollapsed;
            }
    
        }), false); 
    },

    setEditorData: (rawObjects: RawObjectProps[]) => {
        const { editorData, tracks, staticProps, groupedPaths, keyframes } = processRawData(rawObjects);
        set({
            editorData,
            tracks,
            staticProps,
            groupedPaths,
            keyframes
        });
    },

    scale: 1,
    scaleCount: MIN_SCALE_COUNT,
    cursorTime: START_CURSOR_TIME,
    width: Number.MAX_SAFE_INTEGER,

    activeTool: "mouse",
    snap: true,
    editAreaRef: React.createRef<HTMLDivElement>(),
    trackListRef: React.createRef<HTMLDivElement>(),
    scaleWidth: 160,
    scaleSplitCount: 10,
    startLeft: 20,
    changes: 0,
    
    clientHeight: 378,
    clientWidth: 490,
    scrollHeight: 270,


    selectedKeyframes: [],
    editorRef: React.createRef<HTMLDivElement>(),

    scrollLeft: 0,
    scrollTop: 0,


    setScale: (count) => set({ scale: count }),
    setScaleCount: (count) => set({ scaleCount: count }),
    setWidth: (width) => set({ width }),
    setScrollLeft: (value) => set({ scrollLeft: Math.max(value, 0) }),
    setScrollTop: (scrollTop) => set({ scrollTop }),
    setActiveTool: (tool) => set({ activeTool: tool }),
    setSnap: (value) => set({ snap: value }),
    addChange: () => set((state) => ({ ...state, changes: state.changes + 1 })),
    setCursorTime: (time: number) => {
        set({ cursorTime: time });
    },

    // Getter functions

    getTrack: (trackKey) => { return get().tracks[trackKey];},
    getStaticProp: (staticPropKey) => { return get().staticProps[staticPropKey];},
    getKeyframe: (keyframeId) => { return get().keyframes[keyframeId]; },
    
    getTracksForObject: (vxkey) => {
        const object = get().editorData[vxkey];
        if (object) {
            return object.trackKeys.map((trackKey: string) => get().tracks[trackKey]);
        }
        return [];
    },
    getStaticPropsForObject: (vxkey: string) => {
        const object = get().editorData[vxkey];
        if (object) {
            return object.staticPropKeys.map((staticPropKey: string) => get().staticProps[staticPropKey]);
        }
        return [];
    },
    getKeyframesForTrack: (trackKey) => {
        const track = get().tracks[trackKey];
        if (track) {
            return track.keyframes.map((id: string) => get().keyframes[id]);
        }
        return [];
    },

    addKeyframeToTrack: (state: TimelineEditorStoreProps, keyframeKey: string, trackKey: string ) => {
        console.log("Adding keyframe to track ", keyframeKey);
        const track = state.tracks[trackKey];
    
        if(track) {
            track.keyframes.push(keyframeKey); 
        } else {
            console.error(`Track with key "${trackKey}" not found.`);
        }
    },

    createNewKeyframeOnTrack: (animationEngine, trackKey, value) => {
        const { addChange, getTrack, addKeyframeToTrack, getKeyframesForTrack } = get();
        const { vxkey, propertyPath } = extractDatafromTrackKey(trackKey)

        const keyframeId = `keyframe-${Date.now()}-${Math.random()}`

        const newKeyframe: IKeyframe = {
            id: keyframeId,
            time: get().cursorTime,
            value: value,
            handles: [0,0,0,0],
            vxkey: vxkey,
            propertyPath: propertyPath
        };

        const keyframes = getKeyframesForTrack(trackKey)

        // Add the new keyframe to the keyframe Record
        
        set(produce((state: TimelineEditorStoreProps) => {
            state.keyframes[keyframeId] = newKeyframe;
            let track = getTrack(trackKey)

            const isPropertyTracked = !!track;
        
            if(isPropertyTracked) {
                // Check if the cursor is on a keyframe that already exists
                const isCursorOnKeyframe = keyframes.some(kf => kf.time === get().cursorTime)
                if(isCursorOnKeyframe === false) {
                    addKeyframeToTrack(state, keyframeId, trackKey);
                }
            } 
        }))

        // Refresh Raw Data and ReRender
        animationEngine.refreshCurrentTimeline(
            get().editorData,
            get().tracks,
            get().staticProps,
            get().keyframes
        )

        addChange();
    },

    makePropertyTracked: (animationEngine, staticPropKey ) => {
        const { vxkey, propertyPath } = extractDatafromTrackKey(staticPropKey);
        set(produce((state: TimelineEditorStoreProps) => {
            const edObject = state.editorData[vxkey];

            const staticPropsForObject = state.getStaticPropsForObject(vxkey); // this will be filtered
            const staticProp = staticPropsForObject.find(prop => prop.propertyPath === propertyPath)

            let value;
            // Check if the property is in the staticProp Records or else get the ref value from the VXObjectStore
            if(staticProp)
                value = staticProp.value
            else{
                value = getNestedProperty(useVXObjectStore.getState().objects[vxkey].ref.current, propertyPath)
            }
            
            // Remove the staticProp Key from the edObject staticPropKeys string array
            const filteredStaticPropsForObject = staticPropsForObject.filter(prop => prop.propertyPath !== propertyPath);
            edObject.staticPropKeys = filteredStaticPropsForObject.map(prop => `${vxkey}.${prop.propertyPath}`);
            
            delete state.staticProps[staticPropKey];

            // Handle Keyframe
            const keyframeId = `keyframe-${Date.now()}-${Math.random()}`
            const newKeyframe: IKeyframe = {
                id: keyframeId,
                time: get().cursorTime,
                value: value,
                handles: [0,0,0,0],
                vxkey: vxkey,
                propertyPath: propertyPath
            };
            state.keyframes[keyframeId] = newKeyframe

            // Handle Track 
            const trackKey = staticPropKey;
            const newTrack: ITrack = {
                vxkey: vxkey,
                propertyPath: propertyPath,
                keyframes: [newKeyframe.id]
            }
            state.tracks[trackKey] = newTrack;
            edObject.trackKeys.push(trackKey)

            // Recompute grouped Paths for Visual 
            state.groupedPaths = computeGroupPaths(state.editorData)
        }))

        // Refresh Raw Data and ReRender
        animationEngine.refreshCurrentTimeline(
            get().editorData,
            get().tracks,
            get().staticProps,
            get().keyframes
        )
    },

    makePropertyStatic: (animationEngine, trackKey) => {
        const { vxkey, propertyPath } = extractDatafromTrackKey(trackKey);
        set(produce((state: TimelineEditorStoreProps) => {
            const edObject = state.editorData[vxkey];

            const tracksForObject = state.getTracksForObject(vxkey); // this will be filtered
            const vxObject = useVXObjectStore.getState().objects[vxkey]
            const value = getNestedProperty(vxObject.ref.current, propertyPath)

            // Remove the track Key from the edObject trackKetys string array
            const filteredTracksForObject = tracksForObject.filter(track => track.propertyPath !== track.propertyPath)
            edObject.trackKeys = filteredTracksForObject.map(track => `${vxkey}.${track.propertyPath}`)

            delete state.tracks[trackKey];

            // Handle StaticProp
            const staticPropKey = trackKey;
            const newStaticProp: IStaticProps = {
                vxkey: vxkey,
                propertyPath: propertyPath,
                value: value
            }
            state.staticProps[staticPropKey] = newStaticProp;
            edObject.staticPropKeys.push(staticPropKey)

            // Recompute grouped Paths for Visual 
            state.groupedPaths = computeGroupPaths(state.editorData)
        }))

        // Refresh Raw Data and ReRender
        animationEngine.refreshCurrentTimeline(
            get().editorData,
            get().tracks,
            get().staticProps,
            get().keyframes
        )
    },

    moveToNextKeyframe: (animationEngine, keyframes) => {
        const { cursorTime } = get();
    
        const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);
    
        const nextKeyframe = sortedKeyframes.find(kf => kf.time > cursorTime);
    
        if (nextKeyframe) {
            handleSetCursor({
                time: nextKeyframe.time,
                animationEngine,
            });
        }
    },
    
    moveToPreviousKeyframe: (animationEngine, keyframes) => {
        const { cursorTime } = get();
    
        const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);
    
        const prevKeyframe = sortedKeyframes.reverse().find(kf => kf.time < cursorTime);
    
        if (prevKeyframe) {
            handleSetCursor({
                time: prevKeyframe.time,
                animationEngine,
            });
        }
    }
})
);