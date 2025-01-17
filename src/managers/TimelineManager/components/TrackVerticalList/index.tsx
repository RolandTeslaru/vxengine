// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { edObjectProps, IKeyframe, ITrack, ITrackTreeNode, PathGroup } from "@vxengine/AnimationEngine/types/track";
import KeyframeControl from "@vxengine/components/ui/KeyframeControl";
import { cursorRef, useRefStore } from "@vxengine/utils/useRefStore";
import { useTimelineEditorAPI } from "../..";
import Search from "@vxengine/components/ui/Search";
import { DEFAULT_ROW_HEIGHT } from "@vxengine/AnimationEngine/interface/const";
import { ContextMenu, ContextMenuContent, ContextMenuSub, ContextMenuItem, ContextMenuTrigger, ContextMenuSubTrigger, ContextMenuSubContent } from "@vxengine/components/shadcn/contextMenu";
import PopoverShowTrackData from "@vxengine/components/ui/Popovers/PopoverShowTrackData";
import Box from '@geist-ui/icons/box'
import Maximize2 from "@geist-ui/icons/maximize2";
import { selectAllKeyframesOnObject, selectAllKeyframesOnTrack } from "../TimelineArea/EditArea/Keyframe/utils";
import s from "./entityList.module.scss"
import { useVXEngine } from "@vxengine/engine";

const TRACK_HEIGHT = 34;

const TrackVerticalList = memo(() => {
    const searchQuery = useTimelineEditorAPI(state => state.searchQuery)
    const setSearchQuery = useTimelineEditorAPI(state => state.setSearchQuery)

    const trackListRef = useRefStore(state => state.trackListRef)
    const timelineAreaRef = useRefStore(state => state.timelineAreaRef);
    const scrollSyncId = useRefStore(state => state.scrollSyncId)

    const trackTree = useTimelineEditorAPI(state => state.trackTree);

    const IS_PRODUCTION = useVXEngine(state => state.IS_PRODUCTION)

    const handleOnScroll = useCallback((e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const scrollContainer = e.target as HTMLDivElement;
        if (!timelineAreaRef.current) return
        
        if (scrollSyncId.current) cancelAnimationFrame(scrollSyncId.current);
        
        scrollSyncId.current = requestAnimationFrame(() => {
            const newScrollTop = scrollContainer.scrollTop;
            timelineAreaRef.current.scrollTop = newScrollTop;

        })
    }, [])

    const filteredTree: Record<string, ITrackTreeNode> = useMemo(() => {
        if (!searchQuery) return trackTree;

        return Object.entries(trackTree).reduce((filtredNode, [key, node]) => {
            if (key && key.toLowerCase().includes(searchQuery.toLowerCase())) {
                filtredNode[key] = node;
            }
            return filtredNode;
        }, {})
    }, [trackTree, searchQuery])

    return (
        <div className={`w-full h-full flex flex-col rounded-2xl relative overflow-hidden border border-neutral-800 bg-neutral-900`}>
            <div className={`h-[32px] flex flex-row px-2 `}>
                <Search
                    className="w-36 px-2 bg-neutral-800 ml-auto my-auto"
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </div>
            {IS_PRODUCTION && 
                <div className="absolute top-1/2 -translate-y-1/2">
                    <p className="text-xs font-sans-menlo text-center text-red-600 px-2">
                        TrackTree is not generated in Production Mode!
                    </p>
                </div>  
            }
            <div
                className="overflow-y-scroll w-full h-full text-xs pl-1"
                ref={trackListRef}
                onScroll={handleOnScroll}
            >
                {Object.values(filteredTree).map((node, index) =>
                    <TreeNode node={node} level={1} key={index} />
                )}
            </div>
        </div>
    )
});

const NODE_PADDING_INDENT = 30;

const TreeNode = React.memo(({ node, level }: { node: ITrackTreeNode, level: number }) => {
    const paths = React.useMemo(() => node.key.split("."), [node.key]);
    const hasChildren = !!node.children && Object.values(node.children).length > 0
    const isCollapsed = useTimelineEditorAPI(state => state.collapsedTrackNodes[node.key])

    const isLinearTrack = !!node.track && !hasChildren
    // (example) object1 > rotation > x
    //           object2 > scale > y

    return (
        <>
            <li className={`flex items-center hover:bg-blue-800 w-full`}
                style={{ height: DEFAULT_ROW_HEIGHT}}
            >
                <div className={`flex flex-row w-full`} style={{ marginLeft: `${(level - 1) * NODE_PADDING_INDENT + (!hasChildren && 20)}px` }}>
                    {hasChildren && <TreeCollapseButton nodeKey={node.key} isCollapsed={isCollapsed} />}
                    {renderPaths(paths, isLinearTrack, node.track)}
                </div>
            </li>
            {!isCollapsed && hasChildren && (
                <>
                    {Object.values(node.children).map((node, index) =>
                        <TreeNode node={node} level={level + 1} key={index} />
                    )}
                </>
            )}
        </>
    )
})

const renderPaths = (paths: string[], isLinearTrack: boolean, trackKey?: string) => {
    return paths.map((path, index) => {
        const isFinal = index === paths.length - 1;
        const showArrow = index < paths.length - (isLinearTrack ? 2 : 1);

        if (isLinearTrack && isFinal && trackKey) {
            return <FinalPath key={index} pathKey={path} trackKey={trackKey} />;
        }

        return <Path key={index} pathKey={path} showArrow={showArrow} />;
    });
};

const Path = ({ pathKey, showArrow }: { pathKey: string, showArrow: boolean }) => {
    return (
        <div className="flex items-center h-full">
            <p className="font-normal text-neutral-400" style={{ fontSize: "11px" }}>
                {pathKey}
            </p>
            {showArrow &&
                <svg className="mx-1 fill-neutral-500" width="15" height="15" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fillRule="evenodd" clipRule="evenodd"></path></svg>
            }
        </div>
    )
}

interface FinaNodeProps {
    pathKey: string
    trackKey: string
}

const FinalPath: React.FC<FinaNodeProps> = (props) => {
    const { pathKey, trackKey } = props;

    return (
        <ContextMenu>
            <ContextMenuTrigger className="h-full ml-auto flex items-center gap-2">
                <p className="font-semibold text-neutral-500" style={{ fontSize: "10px" }}>
                    {pathKey}
                </p>
                <div className="scale-90">
                    <KeyframeControl propertyKey={trackKey} />
                </div>
            </ContextMenuTrigger>
            <FinalPathContextMenu {...props} />
        </ContextMenu>
    )
}
const FinalPathContextMenu: React.FC<FinaNodeProps> = (props) => {
    const { pathKey, trackKey } = props;

    return (
        <ContextMenuContent>
            <PopoverShowTrackData trackKey={trackKey} side="right">
                <p className="text-xs font-sans-menlo">Show Data</p>
            </PopoverShowTrackData>
            <ContextMenuSub>
                <ContextMenuSubTrigger>
                    <p className="text-xs font-sans-menlo">Select...</p>
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <ContextMenuItem onClick={() => selectAllKeyframesOnTrack(trackKey)}>
                        <Maximize2 size={15} className='rotate-45' />
                        <p className="text-xs">All on Track</p>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => selectAllKeyframesOnObject(trackKey)}>
                        <Box size={15} />
                        <p>All on Object</p>
                    </ContextMenuItem>
                </ContextMenuSubContent>
            </ContextMenuSub>
        </ContextMenuContent>
    )
}


const TreeCollapseButton = ({ nodeKey, isCollapsed = false }: { nodeKey: string, isCollapsed: boolean }) => {
    return (
        <div className="mr-[3px]">
            <button
                type="button"
                aria-label="Toggle children"
                style={{
                    transform: !isCollapsed ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                }}
                onClick={() => {
                    useTimelineEditorAPI.getState().setCollapsedTrackNodes(nodeKey);
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m10 8 4 4-4 4" /></svg>
            </button>
        </div>
    )
}

export default TrackVerticalList;