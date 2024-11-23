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
import Search from "@vxengine/components/ui/Search";

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
                const isTrack = group.trackKey ? true : false;
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
                        {!isCollapsed && (
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
    const isTrack = Boolean(group.trackKey);
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
            <div className="h-[34px] flex flex-row">
                <Search 
                    className="w-36 px-2 bg-neutral-900 ml-auto my-auto"
                    searchQuery={searchQuery} 
                    setSearchQuery={setSearchQuery}
                />
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