// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { edObjectProps, IKeyframe, ITrack, PathGroup } from "@vxengine/AnimationEngine/types/track";
import KeyframeControl from "@vxengine/components/ui/KeyframeControl";
import { useRefStore } from "@vxengine/utils/useRefStore";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@vxengine/components/shadcn/contextMenu";
import { useTimelineEditorAPI } from "../..";
import FinalPropertyContextMenu from "./FinalPropertyContextMenu";
import { extractDataFromTrackKey } from "../../utils/trackDataProcessing";
import { useObjectManagerAPI } from "@vxengine/managers/ObjectManager";
import { Virtuoso } from "react-virtuoso";

import ChevronRight from "lucide-react/dist/esm/icons/chevron-right"
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down"
import { GroupedPaths } from "../../store";
import TopLevelContextMenu from "./TopLevelContextMenu";

const TRACK_HEIGHT = 34;

interface RenderNormalPropertyProps {
    propKey: string,
    isCollapsed: boolean,
    isCollapsible: boolean,
    groupKey: string
}


const RenderNormalProperty: React.FC<RenderNormalPropertyProps> = memo(
    ({ propKey, isCollapsed, isCollapsible, groupKey }) => {
        const { vxkey, propertyPath } = extractDataFromTrackKey(propKey)
        const setCollapsedGroups = useTimelineEditorAPI(state => state.setCollapsedGroups)
        const selectObjects = useObjectManagerAPI(state => state.selectObjects)

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
    })

interface RenderGroupedPathsProps {
    groupedPaths: Record<string, PathGroup>,
    depth: number,
    shouldIndent: boolean,
    parentPath: string
}


const RenderGroupedPaths: React.FC<RenderGroupedPathsProps> = memo(({
    groupedPaths,
    depth = 0,
    shouldIndent = false,
    parentPath = null,
}) => {
    const collapsedGroups = useTimelineEditorAPI((state) => state.collapsedGroups);
    const setCollapsedGroups = useTimelineEditorAPI((state) => state.setCollapsedGroups);

    return (
        <>
            {Object.entries(groupedPaths).map(([key, group]) => {
                const childrenKeys = Object.keys(group.children || {});
                const hasMultipleChildren = childrenKeys.length > 1;
                const isNestedToPreviousPath = !hasMultipleChildren;
                const isTrack = Boolean(group.trackKey);
                const isPath = !isTrack && hasMultipleChildren;
                const shouldIndentChildren = !isNestedToPreviousPath && !isTrack;

                const isCollapsible =
                    group.rowIndex !== group.prevRowIndex &&
                    group.rowIndex !== group.localFinalTrackIndex &&
                    !isTrack;

                const groupKey = parentPath ? `${parentPath}/${key}` : key;
                const isCollapsed = collapsedGroups[groupKey] || false;

                return (
                    <div
                        key={`level-${groupKey}`}
                        className={`w-full flex  ${isNestedToPreviousPath ? 'flex-row' : 'flex-col'}`}
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
                        {isPath && !isCollapsed && (
                            <RenderGroupedPaths
                                groupedPaths={group.children}
                                depth={depth + 1}
                                shouldIndent={shouldIndentChildren}
                                parentPath={groupKey}
                            />
                        )}
                    </div>
                );
            })}
        </>
    );
});




interface RenderFinalPropertyProps {
    propKey: string,
    isCollapsed: boolean,
    trackKey: string
}

const RenderFinalProperty: React.FC<RenderFinalPropertyProps> = memo(
    ({ propKey, isCollapsed, trackKey }) => {
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
                            propertyKey={trackKey}
                        />
                    }
                </ContextMenuTrigger>
                <FinalPropertyContextMenu vxkey={vxkey} propertyPath={propertyPath} />
            </ContextMenu>
        )
    })

const RenderTopLevelGroupedPaths = memo(({ propKey, group }: { propKey: string, group: PathGroup }
) => {
    const key = propKey;
    const collapsedGroups = useTimelineEditorAPI(state => state.collapsedGroups);

    const childrenAllKeys = Object.keys(group.children);
    const isNestedToPreviousPath = !(group.children && childrenAllKeys.length > 1);
    const isTrack = !!group.trackKey;
    const isPath = group.children && childrenAllKeys.length > 0 && !isTrack;
    const shouldIndentChildren = !isNestedToPreviousPath && !isTrack;



    const isCollapsible = (group.rowIndex !== group.prevRowIndex) &&
        (group.rowIndex !== group.localFinalTrackIndex) &&
        !isTrack;

    let groupKey = `${key}`;
    const isCollapsed = collapsedGroups[groupKey] || false;

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <div
                    key={`topLevel-${groupKey}`}
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
                    {isPath && !isCollapsed && <RenderGroupedPaths
                        groupedPaths={group.children}
                        depth={1}
                        shouldIndent={shouldIndentChildren}
                        parentPath={groupKey}
                    />}
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="min-w-[0]">
                <TopLevelContextMenu vxkey={propKey} />
            </ContextMenuContent>
        </ContextMenu>
    );
});


const TrackVerticalList = memo(() => {
    const groupedPaths = useTimelineEditorAPI(state => state.groupedPaths)
    const searchQuery = useTimelineEditorAPI(state => state.searchQuery)
    const setSearchQuery = useTimelineEditorAPI(state => state.setSearchQuery)

    const trackListRef = useRefStore(state => state.trackListRef)
    const editAreaRef = useRefStore(state => state.editAreaRef)

    const scrollSyncId = useRefStore(state => state.scrollSyncId)

    const handleOnScroll = useCallback((e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const scrollContainer = e.target;
        if (!editAreaRef.current) return

        if (scrollSyncId.current) cancelAnimationFrame(scrollSyncId.current);

        scrollSyncId.current = requestAnimationFrame(() => {
            // @ts-expect-error
            editAreaRef.current.scrollTop = scrollContainer.scrollTop;
        })
    }, [])

    // Filtered paths based on the search query
    const filteredGroupedPaths: GroupedPaths = useMemo(() => {
        if (!searchQuery) return groupedPaths;

        return Object.entries(groupedPaths).reduce((filteredPaths, [key, group]) => {
            if (key && key.toLowerCase().includes(searchQuery.toLowerCase())) {
                filteredPaths[key] = group;
            }
            return filteredPaths;
        }, {});
    }, [groupedPaths, searchQuery]);


    return (
        <div className="w-full h-full mr-2 px-4 flex flex-col bg-neutral-950 border border-neutral-800 border-opacity-70 rounded-2xl">

            {/* <div className="flex flex-row h-[26px]">
                <div className='flex flex-row gap-1 px-2 ml-auto mb-auto bg-neutral-950 border border-neutral-800 shadow-sm w-36 rounded-full'>
                    <input
                        className={`h-full py-[3px] w-full text-neutral-400 bg-transparent 
                            placeholder-neutral-400 font-normal focus:outline-none`}
                        type="text"
                        placeholder='search'
                        style={{ fontSize: "10px" }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg className="h-auto my-auto" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </div>
            </div> */}
            <div className="h-[34px] flex flex-row">
                <div className='flex flex-row gap-1 px-2 ml-auto my-auto bg-neutral-900 shadow-sm w-36 rounded-full'>
                    <input
                        className={`h-full py-[3px] w-full text-neutral-400 bg-transparent 
                            placeholder-neutral-400 font-normal focus:outline-none`}
                        type="text"
                        placeholder='search'
                        style={{ fontSize: "10px" }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg className="h-auto my-auto" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </div>
            </div>
            <div
                className="overflow-y-scroll w-full h-full text-xs"
                ref={trackListRef}
                onScroll={handleOnScroll}
            >
                {Object.entries(filteredGroupedPaths).map(([key, pathGroup]) => (
                    <RenderTopLevelGroupedPaths propKey={key} group={pathGroup} key={key} />
                ))}
            </div>
        </div>
    )
});


export default TrackVerticalList;