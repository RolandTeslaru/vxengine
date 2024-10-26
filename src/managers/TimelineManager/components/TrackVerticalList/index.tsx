// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { ChevronLeft, Square, ChevronRight, ChevronDown } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { edObjectProps, IKeyframe, ITrack, PathGroup } from "@vxengine/AnimationEngine/types/track";
import { shallow } from "zustand/shallow";
import { ScrollArea } from "@vxengine/components/shadcn/scrollArea";
import KeyframeControl from "@vxengine/components/ui/KeyframeControl";
import { useRefStore } from "@vxengine/utils/useRefStore";
import { ContextMenu, ContextMenuTrigger } from "@vxengine/components/shadcn/contextMenu";
import { useTimelineEditorAPI } from "../..";
import FinalPropertyContextMenu from "./FinalPropertyContextMenu";
import { extractDataFromTrackKey } from "../../utils/trackDataProcessing";
import { useObjectManagerAPI } from "@vxengine/managers/ObjectManager";
import { Virtuoso } from "react-virtuoso";

const TRACK_HEIGHT = 34;

const TrackVerticalList = () => {
    const setCollapsedGroups = useTimelineEditorAPI(state => state.setCollapsedGroups)
    const groupedPaths = useTimelineEditorAPI(state => state.groupedPaths)
    const selectObjects = useObjectManagerAPI(state => state.selectObjects)

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

    const RenderNormalProperty = ({ propKey, isCollapsed, isCollapsible, groupKey }: { propKey: string, isCollapsed: boolean, isCollapsible: boolean, groupKey: string }) => {
        const { vxkey, propertyPath } = extractDataFromTrackKey(propKey)
        return (
            <div
                className={`h-[34px] flex items-center`}
            >
                {isCollapsible &&
                    <button onClick={() => setCollapsedGroups(groupKey)}>
                        {isCollapsed ? <ChevronRight /> : <ChevronDown />}
                    </button>
                }
                <p
                    className={`flex !flex-row mr-2`}
                    onClick={() => selectObjects([vxkey])}
                >
                    {propKey}
                    {/* Debug Row index */}
                    {/* <span className="font-bold !text-green-600 text-nowrap">&nbsp; {group.rowIndex}</span> */}
                </p>
            </div>
        )
    }

    const renderTopLevelGroupedPaths = (
        index: number
    ) => {
        const [key, group] = Object.entries(groupedPaths)[index] || []; 

        const childrenAllKeys = Object.keys(group.children);
        const isNestedToPreviousPath = !(group.children && childrenAllKeys.length > 1);
        const isTrack = !!group.trackKey;
        const isPath = group.children && childrenAllKeys.length > 0 && !isTrack;
        const shouldIndentChildren = !isNestedToPreviousPath && !isTrack;

        const isCollapsible = (group.rowIndex !== group.prevRowIndex) && 
                              (group.rowIndex !== group.localFinalTrackIndex) && 
                              !isTrack;

        let groupKey = `${key}`;
        const isCollapsed = group.isCollapsed || false;

        return (
            <div
                key={groupKey}
                className={`w-full flex ${isNestedToPreviousPath ? "flex-row" : "flex-col"}`}
            >
                {isTrack ? (
                    <RenderFinalProperty
                        propKey={key}
                        trackKey={group.trackKey}
                        isCollapsed={isCollapsed}
                    />
                ) : (
                    <RenderNormalProperty
                        propKey={key}
                        groupKey={groupKey}
                        isCollapsible={isCollapsible}
                        isCollapsed={isCollapsed}
                    />
                )}
                {isPath && !isCollapsed && renderGroupedPaths(
                    group.children,
                    null,
                    1,
                    shouldIndentChildren,
                    groupKey
                )}
            </div>
        );
    };
    
    const renderGroupedPaths = (
        groupedPaths: Record<string, PathGroup>,
        edObject: edObjectProps,
        depth = 1,
        shouldIndent = false,
        parentPath = null
    ) => {
        return Object.entries(groupedPaths).map(([key, group]) => {
            const childrenAllKeys = Object.keys(group.children);
            const isNestedToPreviousPath = !(group.children && childrenAllKeys.length > 1);
            const isTrack = !!group.trackKey;
            const isPath = group.children && childrenAllKeys.length > 0 && !isTrack;
            const shouldIndentChildren = !isNestedToPreviousPath && !isTrack;
    
            const isCollapsible = (group.rowIndex !== group.prevRowIndex) && 
                                  (group.rowIndex !== group.localFinalTrackIndex) && 
                                  !isTrack;
    
            let groupKey = parentPath === null ? `${key}` : `${parentPath}/${key}`;
            const isCollapsed = group.isCollapsed || false;
    
            return (
                <div
                    key={groupKey}
                    className={`w-full flex ${isNestedToPreviousPath ? "flex-row" : "flex-col"}`}
                    style={{ paddingLeft: shouldIndent ? 16 : 0 }}
                >
                    {isTrack ? (
                        <RenderFinalProperty
                            propKey={key}
                            trackKey={group.trackKey}
                            isCollapsed={isCollapsed}
                        />
                    ) : (
                        <RenderNormalProperty
                            propKey={key}
                            groupKey={groupKey}
                            isCollapsible={isCollapsible}
                            isCollapsed={isCollapsed}
                        />
                    )}
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

    const scrollSyncId = useRefStore(state => state.scrollSyncId)

    const handleOnScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const scrollContainer = e.target;
        if(!editAreaRef.current) return

        if(scrollSyncId.current) cancelAnimationFrame(scrollSyncId.current); 

        scrollSyncId.current = requestAnimationFrame(() => {
            // @ts-expect-error
            editAreaRef.current.scrollTop = scrollContainer.scrollTop;
        })

    }

    const scrollerRefCallback = useCallback((node) => {
        if (node) {
            trackListRef.current = node;
        }
    }, []);

    return (
        <div
            className="bg-neutral-950 mr-2 mt-[26px] w-full h-full text-xs rounded-2xl py-2 px-4 border border-neutral-800 border-opacity-70"
        >
            <Virtuoso
                style={{
                    position: "relative",
                    height: `100%`,
                }}
                totalCount={Object.entries(groupedPaths).length}
                itemContent={index => renderTopLevelGroupedPaths(index)}
                scrollerRef={scrollerRefCallback} 
                onScroll={handleOnScroll}
            />
        </div>
    )
};

const RenderFinalProperty = ({ propKey, isCollapsed, trackKey }: { propKey: string, isCollapsed: boolean, trackKey: string }) => {
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey)
    return (
        <ContextMenu>
            <ContextMenuTrigger className={`h-[34px] w-auto ml-auto flex !flex-row items-center`}>
                <p className={`flex !flex-row text-neutral-500 mr-2`}>
                    {propKey}
                    {/* Debug Row index */}
                    {/* <span className="font-bold !text-green-600 text-nowrap">&nbsp; {group.rowIndex}</span> */}
                </p>
                {!isCollapsed &&
                    <KeyframeControl
                        trackKey={trackKey}
                    />
                }
            </ContextMenuTrigger>
            <FinalPropertyContextMenu vxkey={vxkey} propertyPath={propertyPath} />
        </ContextMenu>
    )
}

export default TrackVerticalList;