// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { ChevronLeft, Square, ChevronRight, ChevronDown } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { edObjectProps, ITrack } from "vxengine/AnimationEngine/types/track";
import { useVXEngine } from "vxengine/engine";
import { useVXObjectStore } from "vxengine/store";
import { shallow } from "zustand/shallow";
import { useTimelineEditorStore } from "../store";
import { scale } from "../ui";
import { handleSetCursor } from "../utils/handleSetCursor";
import { vxObjectProps } from "vxengine/types/objectStore";

interface TimelineKeyframeControlProps {
    track: ITrack,
    propertyPath: string,
    edObject: edObjectProps
}

const KeyframeControl: React.FC<TimelineKeyframeControlProps> = React.memo(({ track, propertyPath, edObject }) => {
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
            <button
                onClick={() => moveToPreviousKeyframe(animationEngine, edObject.vxkey, propertyPath)}
                className='hover:*:stroke-[5] hover:*:stroke-white'
            >
                <ChevronLeft className=' w-3 h-3' />
            </button>
            <button
                onClick={() => createNewKeyframe(animationEngine, edObject.vxkey, propertyPath, 0)}
                className="hover:*:stroke-[5] hover:*:stroke-white "
            >
                <Square className={`rotate-45 w-2 h-2 ${isOnKeyframe ? "fill-blue-500 stroke-blue-400 scale-110" : ""}`} />
            </button>
            <button
                onClick={() => moveToNextKeyframe(animationEngine, edObject.vxkey, propertyPath)}
                className='hover:*:stroke-[5] hover:*:stroke-white'
            >
                <ChevronRight className='w-3 h-3 ' />
            </button>
        </div>
    )
});

interface PathGroup {
    children: Record<string, PathGroup>;
    track: ITrack | null;
    rowIndex?: number;
    prevRowIndex?: number;
    nextRowIndex?: number;
    localFinalTrackIndex?: number;
}
interface TimelineData {
    vxkey: string;
    objectName: string;
    rowIndex: number;
    groupedTracks: Record<string, PathGroup>;
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
    const finalIndex = precomputeRowIndices(groupedTracks, trackRowIndex);

    return { groupedTracks, finalIndex };
};

const computeTimelineData = (
    editorData: Record<string, edObjectProps>, 
    vxObjects: Record<string, vxObjectProps>
): TimelineData[] => {
    let rowIndex = 0;
    const timelineData: TimelineData[] = [];

    Object.values(editorData).forEach((edObject) => {
        const { vxkey, tracks } = edObject;
        const vxObject = vxObjects[vxkey];

        edObject.rowIndex = rowIndex;

        rowIndex ++;
        const { groupedTracks, finalIndex } = groupTracksByParent(tracks, rowIndex);

        timelineData.push({
            vxkey,
            objectName: vxObject?.name,
            rowIndex: edObject.rowIndex,
            groupedTracks,
        });

        rowIndex = finalIndex + 1;
    });

    return timelineData;
};


const renderGroupedTracks = (
    groupedTracks: Record<string, PathGroup>,
    edObject: edObjectProps,
    depth = 1,
    shouldIndent = false,
    parentPath = ''
) => {
    return Object.entries(groupedTracks).map(([key, group]) => {
        const childrenAllKeys = Object.keys(group.children);
        const isNestedToPreviousPath = !(group.children && childrenAllKeys.length > 1)
        const isTrack = !!group.track;
        const isPath = group.children && childrenAllKeys.length > 0 && !isTrack

        const shouldIndentChildren = !isNestedToPreviousPath && !isTrack 

        const isCollapsible = (group.rowIndex !== group.prevRowIndex) && (group.rowIndex !== group.localFinalTrackIndex) && !isTrack;

        const groupKey = `${parentPath}/${key}`;

        const isCollapsed = useTimelineEditorStore.getState().collapsedGroups[groupKey] || false;

        // Create a combined track when the group is collapsed
        let combinedTrack: ITrack | null = null;
        if (isCollapsed && isPath) {
            const combinedKeyframes = [];
            const collectKeyframes = (trackGroup: Record<string, PathGroup>) => {
                Object.values(trackGroup).forEach(child => {
                    if (child.track) {
                        combinedKeyframes.push(...child.track.keyframes);
                    }
                    if (child.children) {
                        collectKeyframes(child.children);
                    }
                });
            };
            collectKeyframes(group.children);
            combinedTrack = { propertyPath: groupKey, keyframes: combinedKeyframes };
        }

        return (
            <div
                key={groupKey}
                className={`${key} w-full flex ${isNestedToPreviousPath ? "flex-row" : "flex-col"}`}
                style={{ paddingLeft: shouldIndent ? 16 : 0 }}
            >
                <div className={`h-8 flex items-center`} style={{ marginLeft: isTrack ? "auto" : undefined }}>
                    {isCollapsible &&
                        <div onClick={() => useTimelineEditorStore.getState().setCollapsedGroups(groupKey)}>
                            {isCollapsed ? <ChevronRight /> : <ChevronDown />}
                        </div>
                    }
                    <p className={`flex !flex-row ${isTrack ? 'text-neutral-500' : ' '} mr-2`}>
                        {key}
                        {/* Debug Row index */}
                        <span className="font-bold !text-green-700"> {group.rowIndex} </span>
                    </p>
                    {/* Render KeyframeControl for collapsed groups */}
                    {isCollapsed && combinedTrack && (
                        <div className="w-auto ml-auto">
                            <KeyframeControl
                                track={combinedTrack}
                                propertyPath={combinedTrack.propertyPath}
                                edObject={edObject}
                            />
                        </div>
                    )}
                    {group.track && !isCollapsed && (
                        <KeyframeControl
                            track={group.track}
                            propertyPath={group.track.propertyPath}
                            edObject={edObject}
                        />
                    )}
                </div>
                {!group.track && isPath && !isCollapsed && renderGroupedTracks(
                    group.children, 
                    edObject, 
                    depth + 1, 
                    shouldIndentChildren, 
                    groupKey
                )}
            </div>
        );
    });
};

const TrackVerticalList = () => {
    // const { collapsedGroups, setCollapsedGroups } = useTimelineEditorStore(state => ({
    //     collapsedGroups: state.collapsedGroups,
    //     setCollapsedGroups: state.setCollapsedGroups
    // }));

    const editorData = useTimelineEditorStore(state => state.editorData);
    const vxObjects = useVXObjectStore(state => state.objects);
    
    const timelineData = React.useMemo(() => {
        const data = computeTimelineData(editorData, vxObjects);
        return data;
    }, [editorData, vxObjects])

    return (
        <div className="bg-neutral-950 mr-2 mt-[34px] w-fit text-xs rounded-2xl py-2 px-4 border border-neutral-800 border-opacity-70">
            {timelineData.map((timelineObj)  => {
                const { vxkey, objectName, rowIndex, groupedTracks } = timelineObj;
                const edObject = editorData[vxkey];
                return (
                    <div key={vxkey} className="flex flex-col ">
                        <div className='h-8 flex'>
                            <p className="font-bold h-auto my-auto text-white">{objectName}
                                {/* Debug Row index */}
                                <span className="font-bold !text-green-700"> {rowIndex} </span>
                            </p>
                        </div>
                        <div className="flex flex-col rounded-md">
                            {renderGroupedTracks(groupedTracks, edObject, 0, true, vxkey)} {/* Start the path with the object's key */}
                        </div>
                    </div>
                );
            })}
         
        </div>
    );
};
export default TrackVerticalList;
