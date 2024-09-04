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
            <button onClick={() => createNewKeyframe(animationEngine, edObject.vxkey, propertyPath, 0)} className="hover:*:stroke-[5] hover:*:stroke-white ">
                <Square className={`rotate-45 w-2 h-2 ${isOnKeyframe ? "fill-blue-500 stroke-blue-400 scale-110" : ""}`} />
            </button>
            <button onClick={() => moveToNextKeyframe(animationEngine, edObject.vxkey, propertyPath)} className='hover:*:stroke-[5] hover:*:stroke-white'>
                <ChevronRight className='w-3 h-3 ' />
            </button>
        </div>
    )
});

interface TrackGroup {
    children: Record<string, TrackGroup>;
    track: ITrack | null;
    rowIndex?: number;
    prevRowIndex?: number;
    nextRowIndex?: number;
    finalRowIndex?: number;
}
const TrackVerticalList = () => {
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    const toggleCollapse = (groupKey: string) => {
        setCollapsedGroups(prevState => ({
            ...prevState,
            [groupKey]: !prevState[groupKey],
        }));
    };

    const editorData = useTimelineEditorStore(state => state.editorData);
    const objects = useVXObjectStore(state => state.objects);

    const precomputeRowIndices = (groupedTracks: Record<string, TrackGroup>, currentRowIndex = 1, prevRowIndex = 0): number => {
        Object.entries(groupedTracks).forEach(([key, group]) => {
            const hasChildren = group.children && Object.keys(group.children).length > 0;
            const hasMultipleChildren = group.children && Object.keys(group.children).length > 1;
            const isFinalValue = !hasChildren && group.track;
    
            group.prevRowIndex = prevRowIndex;
            group.rowIndex = currentRowIndex;
            group.nextRowIndex = hasMultipleChildren ? currentRowIndex + 1 : currentRowIndex;
    
            if (hasChildren) {
                const childFinalIndex = precomputeRowIndices(group.children, group.nextRowIndex, group.rowIndex);
                group.finalRowIndex = childFinalIndex;
            } else if (isFinalValue) {
                group.nextRowIndex = currentRowIndex + 1;
                group.finalRowIndex = group.nextRowIndex - 1;
            }
        });
    
        return groupedTracks[Object.keys(groupedTracks)[Object.keys(groupedTracks).length - 1]]?.finalRowIndex || currentRowIndex;
    };

    const groupTracksByParent = (tracks: ITrack[]) => {
        const groupedTracks: Record<string, TrackGroup> = {};

        tracks.forEach((track) => {
            const pathSegments = track.propertyPath.split('.');

            let currentGroup = groupedTracks;

            pathSegments.forEach((key, index) => {
                if (!currentGroup[key]) {
                    currentGroup[key] = { children: {}, track: null};
                }

                if (index === pathSegments.length - 1) {
                    currentGroup[key].track = track;
                } else {
                    currentGroup = currentGroup[key].children;
                }
            });
        });
        precomputeRowIndices(groupedTracks);

        return groupedTracks;
    };

    const renderGroupedTracks = (
        groupedTracks: Record<string, TrackGroup>,
        edObject: edObjectProps,
        depth = 1,
        shouldIndent = false,
        parentPath = ''
    ) => {
        return Object.entries(groupedTracks).map(([key, group]) => {
            const hasChildren = group.children && Object.keys(group.children).length > 0;
            const hasMultipleChildren = group.children && Object.keys(group.children).length > 1;
    
            const isFinalGroup = hasChildren && Object.values(group.children).every(
                (child: TrackGroup) => child.track && (!child.children || Object.keys(child.children).length === 0)
            );
    
            const shouldIndentChildren = hasMultipleChildren && !group.track && !isFinalGroup;
    
            const isFinalValue = !!group.track;
    
            const isCollapsible = (group.rowIndex !== group.prevRowIndex) && (group.rowIndex !== group.finalRowIndex) && !isFinalValue;
    
            const groupKey = `${parentPath}/${key}`;
    
            const isCollapsed = collapsedGroups[groupKey] || false;
    
            // Create a combined track when the group is collapsed
            let combinedTrack: ITrack | null = null;
            if (isCollapsed && hasChildren) {
                const combinedKeyframes = [];
                const collectKeyframes = (trackGroup: Record<string, TrackGroup>) => {
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
                    className={`${key} w-full flex ${hasMultipleChildren ? "flex-col" : "flex-row"}`}
                    style={{ paddingLeft: shouldIndent ? 16 : 0 }}
                >
                    <div className={`h-8 flex items-center`} style={{ marginLeft: isFinalValue ? "auto" : undefined }}>
                        {isCollapsible &&
                            <div onClick={() => toggleCollapse(groupKey)}>
                                {isCollapsed ? <ChevronRight /> : <ChevronDown />}
                            </div>
                        }
                        <p className={`${isFinalValue ? 'text-neutral-500' : ' '} mr-2`}>
                            {key}
                        </p>
                        {/* Render KeyframeControl for collapsed groups */}
                        {isCollapsed && combinedTrack && (
                            <div className="w-auto ml-auto">
                                <KeyframeControl track={combinedTrack} propertyPath={combinedTrack.propertyPath} edObject={edObject} />
                            </div>
                        )}
                        {group.track && !isCollapsed && (
                            <KeyframeControl track={group.track} propertyPath={group.track.propertyPath} edObject={edObject} />
                        )}
                    </div>
                    {!group.track && hasChildren && !isCollapsed && renderGroupedTracks(group.children, edObject, depth + 1, shouldIndentChildren, groupKey)}
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

                return (
                    <div key={vxkey} className="flex flex-col ">
                        <div className='h-8 flex'>
                            <p className="font-bold h-auto my-auto text-white">{object?.name}</p>
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
