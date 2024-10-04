// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { ChevronLeft, Square, ChevronRight, ChevronDown } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { edObjectProps, IKeyframe, ITrack, PathGroup } from "@vxengine/AnimationEngine/types/track";
import { shallow } from "zustand/shallow";
import { useTimelineEditorAPI } from "../store";
import { ScrollArea } from "@vxengine/components/shadcn/scrollArea";
import KeyframeControl from "@vxengine/components/ui/KeyframeControl";
import { useRefStore } from "@vxengine/utils/useRefStore";

const TrackVerticalList = () => {
    const setCollapsedGroups = useTimelineEditorAPI(state => state.setCollapsedGroups)
    const groupedPaths = useTimelineEditorAPI(state => state.groupedPaths)

    const trackListRef = useRefStore(state => state.trackListRef)
    const editAreaRef = useRefStore(state => state.editAreaRef)

    const createCollapsedTracksList = (group: PathGroup) => {

    }

    // const renderCollapsedKeyframeControl = ({edObject, group,}: {edObject: edObjectProps, group: PathGroup}) => {
    //     let collapsedKeyframes: ITrack | null = null;
    //     console.log("Attempting to render collapsed keyframe controls with group", group)
    //     if(collapsedKeyframes){
    //         return <>
    //             <KeyframeControl
    //                 track={collapsedKeyframes}
    //                 propertyPath={collapsedKeyframes.propertyPath}
    //                 edObject={edObject}
    //             />
    //         </>
    //     } else 
    //         return <></>
    // }

    const renderGroupedPaths = (
        groupedPaths: Record<string, PathGroup>,
        edObject: edObjectProps,
        depth = 1,
        shouldIndent = false,
        parentPath = null
    ) => {
        return Object.entries(groupedPaths).map(([key, group]) => {
            const childrenAllKeys = Object.keys(group.children);
            const isNestedToPreviousPath = !(group.children && childrenAllKeys.length > 1)
            const isTrack = !!group.trackKey;
            const isPath = group.children && childrenAllKeys.length > 0 && !isTrack
            const shouldIndentChildren = !isNestedToPreviousPath && !isTrack

            const isCollapsible = (group.rowIndex !== group.prevRowIndex) && (group.rowIndex !== group.localFinalTrackIndex) && !isTrack;

            let groupKey
            if(parentPath === null)
                groupKey = `${key}`;
            else
                groupKey = `${parentPath}/${key}`;

            const isCollapsed = group.isCollapsed || false

            

            return (
                <div
                    key={groupKey}
                    className={`${key} w-full flex ${isNestedToPreviousPath ? "flex-row" : "flex-col"}`}
                    style={{ paddingLeft: shouldIndent ? 16 : 0 }}
                >
                    <div className={`h-[32px] flex items-center`} style={{ marginLeft: isTrack ? "auto" : undefined }}>
                        {isCollapsible &&
                            <button onClick={() => setCollapsedGroups(groupKey)}>
                                {isCollapsed ? <ChevronRight /> : <ChevronDown />}
                            </button>
                        }
                        <p className={`flex !flex-row ${isTrack ? 'text-neutral-500' : ' '} mr-2`}>
                            {key}
                            {/* Debug Row index */}
                            {/* <span className="font-bold !text-green-600 text-nowrap">&nbsp; {group.rowIndex}</span> */}
                        </p>
                        {/* Render KeyframeControl for collapsed groups */}
                        {/* TODO: Implement a keyframe controller for collapsed tracks  */}
                        {/* {isCollapsed && renderCollapsedKeyframeControl({edObject, group})} */}

                        {isTrack && !isCollapsed && (
                            <KeyframeControl
                                trackKey={group.trackKey}
                                // track={group.track}
                                // propertyPath={group.track.propertyPath}
                                // edObject={edObject}
                            />
                        )}
                    </div>
                    {isPath && !isCollapsed && renderGroupedPaths(
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

    const handleOnScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const scrollContainer = e.target;
        // @ts-expect-error
        editAreaRef.current.scrollTop = scrollContainer.scrollTop;
    }

    return (
        <ScrollArea ref={trackListRef} onScroll={handleOnScroll}  scrollbarPosition="left"  className="bg-neutral-950 mr-2 mt-[34px] w-full text-xs rounded-2xl py-2 px-4 border border-neutral-800 border-opacity-70">
             {renderGroupedPaths(groupedPaths, null, 0, false, )}
        </ScrollArea>
    );
};
export default TrackVerticalList;
8