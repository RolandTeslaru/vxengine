// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { ChevronLeft, Square, ChevronRight } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ITrack } from "vxengine/AnimationEngine/types/track";
import { useVXEngine } from "vxengine/engine";
import { useVXObjectStore } from "vxengine/store";
import { shallow } from "zustand/shallow";
import { useTimelineEditorStore } from "../store";
import { scale } from "../ui";
import { handleSetCursor } from "../utils/handleSetCursor";

const KeyframeControl = React.memo(({ track }: { track: ITrack }) => {
    const setCursorTime = useTimelineEditorStore.getState().setCursorTime; 
    const { animationEngine } = useVXEngine();

    const cursorTimeRef = useRef(useTimelineEditorStore.getState().cursorTime); 
    const [isOnKeyframe, setIsOnKeyframe] = useState(false);
     
    useEffect(() => {
        const unsubscribe = useTimelineEditorStore.subscribe(
            (state) => {
                cursorTimeRef.current = state.cursorTime;
                const keyframeExists = track.keyframes.some(kf => kf.time === state.cursorTime);
                setIsOnKeyframe(keyframeExists);
            },
        );
        return () => unsubscribe(); 
    }, [track.keyframes]);

    const moveToNextKeyframe = useCallback(() => {
        const nextKeyframe = track.keyframes.find(kf => kf.time > cursorTimeRef.current);
        if (nextKeyframe) {
            handleSetCursor({
                time: nextKeyframe.time,
                animationEngine,
                scale,
                setCursorTime
            });
        }
    }, [track, animationEngine, scale, setCursorTime]);

    const moveToPreviousKeyframe = useCallback(() => {
        const prevKeyframe = [...track.keyframes].reverse().find(kf => kf.time < cursorTimeRef.current);
        if (prevKeyframe) {
            handleSetCursor({
                time: prevKeyframe.time,
                animationEngine,
                scale,
                setCursorTime
            });
        }
    }, [track, animationEngine, scale, setCursorTime]);

    const createNewKeyframe = useCallback(() => {
        const newKeyframe = { id: `keyframe-${Date.now()}`, time: cursorTimeRef.current, value: 0 }; // Example structure
        track.keyframes.push(newKeyframe);

        handleSetCursor({
            time: cursorTimeRef.current,
            animationEngine,
            scale,
            setCursorTime
        });
    }, [track, animationEngine, scale, setCursorTime]);

    return (
        <div className='flex flex-row'>
            <button onClick={moveToPreviousKeyframe} className='hover:*:stroke-[5] hover:*:stroke-white'>
                <ChevronLeft className=' w-3 h-3' />
            </button>
            <button onClick={createNewKeyframe} className="hover:*:stroke-[5] hover:*:stroke-white ">
                <Square className={`rotate-45 w-2 h-2 ${isOnKeyframe ? "fill-blue-500 stroke-blue-400 scale-110" : ""}`} />
            </button>
            <button onClick={moveToNextKeyframe} className='hover:*:stroke-[5] hover:*:stroke-white'>
                <ChevronRight className='w-3 h-3 ' />
            </button>
        </div>
    )
});

const TrackVerticalList = () => {
    const { editorData } = useTimelineEditorStore(state => ({
        editorData: state.editorData
    }), shallow);
    const { objects } = useVXObjectStore(state => ({
        objects: state.objects
    }));

    console.log("Editor Data ", editorData)

    // Helper function to group tracks by their parent keys
    const groupTracksByParent = (tracks: ITrack[]) => {
        const groupedTracks: Record<string, any> = {};

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

        return groupedTracks;
    };

    const renderGroupedTracks = (groupedTracks: Record<string, any>, depth = 1, shouldIndent = false) => {
        return Object.entries(groupedTracks).map(([key, group]) => {
            const hasChildren = group.children && Object.keys(group.children).length > 0;

            // Determine if the group has multiple children
            const isColGroup = hasChildren && Object.keys(group.children).length > 1;

            const isFinalGroup = hasChildren && Object.values(group.children).every(
                (child: any) => child.track && (!child.children || Object.keys(child.children).length === 0)
            );

            // Determine if padding should be added based on sibling relationships
            const shouldIndentChildren = isColGroup && !group.track && !isFinalGroup;

            const isValueTrack = group.track;

            return (
                <div
                    key={key}
                    className={`${key} w-full flex ${isColGroup ? "flex-col" : "flex-row"}`}
                    style={{ paddingLeft: shouldIndent && 16 }}
                >
                    {/* Close button */}
                    {/* <div>
                        <ChevronRight />
                    </div> */}

                    <div className={`h-8 flex items-center`} style={{ marginLeft: group.track ? "auto" : undefined }}>
                        <p className={`${group.track ? 'text-neutral-500' : 'font-bold'} mr-2`}>
                            {key}
                        </p>
                        {group.track && (
                            <KeyframeControl track={group.track}/>
                        )}
                    </div>
                    {!group.track && hasChildren && renderGroupedTracks(group.children, depth + 1, shouldIndentChildren)}
                </div>
            );
        });
    };

    return (
        <div className="bg-neutral-950 mr-2 mt-[34px] w-fit text-xs rounded-2xl py-2 px-4 border border-neutral-800 border-opacity-70">
            {editorData?.map(({ vxkey, tracks }) => {
                const object = objects[vxkey];
                const groupedTracks = groupTracksByParent(tracks);

                return (
                    <div key={vxkey} className="flex flex-col ">
                        <div className='h-8 bg-neutral-900 flex'>
                            <p className="font-bold h-auto my-auto text-white">{object?.name}</p>
                        </div>
                        <div className="flex flex-col rounded-md">
                            {renderGroupedTracks(groupedTracks, 0, true)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TrackVerticalList