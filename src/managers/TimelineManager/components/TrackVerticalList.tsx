// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { ChevronLeft, Square, ChevronRight, ChevronDown } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { edObjectProps, IKeyframe, ITrack, PathGroup } from "vxengine/AnimationEngine/types/track";
import { useVXEngine } from "vxengine/engine";
import { useVXObjectStore } from "vxengine/store";
import { shallow } from "zustand/shallow";
import { useTimelineEditorStore } from "../store";
import { scale } from "../ui";
import { handleSetCursor } from "../utils/handleSetCursor";
import { vxObjectProps } from "vxengine/types/objectStore";
import { ScrollArea } from "vxengine/components/shadcn/scrollArea";
import KeyframeControl from "vxengine/components/ui/KeyframeControl";

const TrackVerticalList = () => {
    const { setCollapsedGroups, groupedPaths, trackListRef } = useTimelineEditorStore(state => ({
        setCollapsedGroups: state.setCollapsedGroups,
        groupedPaths: state.groupedPaths,
        trackListRef: state.trackListRef
    }), shallow);

    // console.log("STATE editorData: ", editorData)
    // console.log("STATE tracks: ", tracks)

    // console.log("STATE staticProps: ", staticProps)

    // console.log("STATE groupedPaths: ", groupedPaths)



    const createCollapsedTracksList = (group: PathGroup) => {

    }

    const renderCollapsedKeyframeControl = ({edObject, group,}: {edObject: edObjectProps, group: PathGroup}) => {
        let collapsedKeyframes: ITrack | null = null;
        console.log("Attempting to render collapsed keyframe controls with group", group)
        if(collapsedKeyframes){
            return <>
                <KeyframeControl
                    track={collapsedKeyframes}
                    propertyPath={collapsedKeyframes.propertyPath}
                    edObject={edObject}
                />
            </>
        } else 
            return <></>
    }

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
                                trackKeys={[group.trackKey]}
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
        useTimelineEditorStore.setState({ scrollTop: e.currentTarget.scrollTop})
    }

    return (
        <ScrollArea ref={trackListRef} onScroll={handleOnScroll}  scrollbarPosition="left"  className="bg-neutral-950 mr-2 mt-[34px] w-full text-xs rounded-2xl py-2 px-4 border border-neutral-800 border-opacity-70">
             {renderGroupedPaths(groupedPaths, null, 0, false, )}
        </ScrollArea>
    );
};
export default TrackVerticalList;
8