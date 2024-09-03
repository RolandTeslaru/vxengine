// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { ChevronLeft, Square, ChevronRight } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { edObjectProps, ITrack } from "vxengine/AnimationEngine/types/track";
import { useVXEngine } from "vxengine/engine";
import { useVXObjectStore } from "vxengine/store";
import { shallow } from "zustand/shallow";
import { useTimelineEditorStore } from "../store";
import { scale } from "../ui";
import { handleSetCursor } from "../utils/handleSetCursor";

const KeyframeControl = React.memo(({ track, propertyPath, edObject }: { track: ITrack, propertyPath: string, edObject: edObjectProps }) => {
    const { createNewKeyframe, moveToNextKeyframe, moveToPreviousKeyframe, cursorTimeRef } = useTimelineEditorStore(state => ({
        createNewKeyframe: state.createNewKeyframe,
        findTrackByPropertyPath: state.findTrackByPropertyPath,
        moveToNextKeyframe: state.moveToNextKeyframe,
        moveToPreviousKeyframe: state.moveToPreviousKeyframe,
        cursorTimeRef: state.cursorTimeRef
    }), shallow)
    const { animationEngine } = useVXEngine();

    const [isOnKeyframe, setIsOnKeyframe] = useState(false);

    const checkIfOnKeyframe = () => {
        if (track) {
            const isKeyframePresent = track.keyframes.some(kf => kf.time === cursorTimeRef.current);
            setIsOnKeyframe(isKeyframePresent);
        }
    };

    useEffect(() => {
        const unsubscribe = useTimelineEditorStore.subscribe(() => checkIfOnKeyframe());
        return () => unsubscribe();
    }, [track?.keyframes]);

    useEffect(() => {
        checkIfOnKeyframe()
    }, [track?.keyframes])

    return (
        <div className='flex flex-row'>
            <button onClick={() => moveToPreviousKeyframe(animationEngine, edObject.vxkey, propertyPath)} className='hover:*:stroke-[5] hover:*:stroke-white'>
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
    const editorData = useTimelineEditorStore(state => state.editorData)
    const objects = useVXObjectStore(state => state.objects)

    // Helper function to group tracks by their parent keys
    const groupTracksByParent = (tracks: ITrack[]) => {
        const groupedTracks: Record<string, any> = {};

        tracks.forEach((track) => {
            const pathSegments = track.propertyPath.split('.');

            let currentGroup = groupedTracks;

            pathSegments.forEach((key, index) => {
                if (!currentGroup[key]) {
                    currentGroup[key] = { children: {}, track: null, index: index + 1};
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

    const renderGroupedTracks = (
        groupedTracks: Record<string, any>,
        edObject: edObjectProps,
        depth = 1,
        shouldIndent = false,
        currentRowIndex,
        prevRowIndex,
    ) => {
        return Object.entries(groupedTracks).map(([key, group]) => {
            const hasChildren = group.children && Object.keys(group.children).length > 0;
            const hasMultipleChildren = group.children && Object.keys(group.children).length > 1;

            const isFinalGroup = hasChildren && Object.values(group.children).every(
                (child: any) => child.track && (!child.children || Object.keys(child.children).length === 0)
            );

            // Determine if padding should be added based on sibling relationships
            const shouldIndentChildren = hasMultipleChildren && !group.track && !isFinalGroup;

            const isFinalValue = hasChildren

            // Check if current group has children that are not just single tracks


            // Update rowIndex if there are children
            const nextRowIndex = hasMultipleChildren ? currentRowIndex + 1 : currentRowIndex;


       
            const isCollapsible = (currentRowIndex !== prevRowIndex) && isFinalValue
            // console.log("Rendering key:", key, " hasChildren:", hasChildren, "currentRowIndex:", currentRowIndex)

            return (
                <div
                    key={key}
                    className={`${key} w-full flex ${hasMultipleChildren ? "flex-col" : "flex-row"}`}
                    style={{ paddingLeft: shouldIndent && 16 }}
                >
                    <div className={`h-8 flex items-center`} style={{ marginLeft: group.track ? "auto" : undefined }}>
                        {/* Collapse Button Chvron */}

                        {isCollapsible &&
                            <div>
                                <ChevronRight />
                            </div>
                        }
                        <p className={`${group.track ? 'text-neutral-500' : 'font-bold'} mr-2`}>
                            {key}
                        </p>
                        {group.track && (
                            <KeyframeControl track={group.track} propertyPath={group.track.propertyPath} edObject={edObject} />
                        )}
                    </div>
                    {!group.track && hasChildren && renderGroupedTracks(group.children, edObject, depth + 1, shouldIndentChildren, nextRowIndex, currentRowIndex)}
                </div>
            );
        });
    };

    return (
        <div className="bg-neutral-950 mr-2 mt-[34px] w-fit text-xs rounded-2xl py-2 px-4 border border-neutral-800 border-opacity-70">
            {Object.values(editorData)?.map((edObject) => {
                const { vxkey, tracks } = edObject;
                const object = objects[vxkey];
                const groupedTracks = groupTracksByParent(tracks);

                console.log("Group TrackBy Parent ", groupedTracks)

                return (
                    <div key={vxkey} className="flex flex-col ">
                        <div className='h-8 bg-neutral-900 flex'>
                            <p className="font-bold h-auto my-auto text-white">{object?.name}</p>
                        </div>
                        <div className="flex flex-col rounded-md">
                            {renderGroupedTracks(groupedTracks, edObject, 0, true, 1, 0)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TrackVerticalList