// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import React, { useState, useEffect, useCallback, useRef, useMemo, memo, ComponentProps } from "react";
import KeyframeControl from "@vxengine/components/ui/KeyframeControl";
import { cursorRef, useRefStore } from "@vxengine/utils/useRefStore";
import { useTimelineManagerAPI } from "../../..";
import Search from "@vxengine/components/ui/Search";
import { DEFAULT_ROW_HEIGHT } from "@vxengine/AnimationEngine/interface/const";
import { ContextMenu, ContextMenuContent, ContextMenuSub, ContextMenuItem, ContextMenuTrigger, ContextMenuSubTrigger, ContextMenuSubContent } from "@vxengine/components/shadcn/contextMenu";
import { selectAllKeyframesOnObject, selectAllKeyframesOnTrack } from "../TimelineArea/EditArea/Keyframe/utils";
import { useVXEngine } from "@vxengine/engine";
import { useTimelineEditorAPI } from "../../store";
import { EditorTrackTreeNode } from "@vxengine/types/data/editorData";
import { extractDataFromTrackKey } from "@vxengine/managers/TimelineManager/utils/trackDataProcessing";
import JsonView from "react18-json-view";
import { pushDialogStatic } from "@vxengine/managers/UIManager/store";
import { ALERT_MakePropertyStatic, ALERT_ResetProperty } from "@vxengine/components/ui/DialogAlerts/Alert";

const TRACK_HEIGHT = 34;

const TrackVerticalList = memo(() => {
    const { trackTree, searchQuery, setSearchQuery } = useTimelineEditorAPI(state => { return {
        trackTree: state.trackTree,
        searchQuery: state.searchQuery,
        setSearchQuery: state.setSearchQuery
    }})

    const { trackListRef, timelineAreaRef, scrollSyncId } = useRefStore(state => { return {
        trackListRef: state.trackListRef,
        timelineAreaRef: state.timelineAreaRef,
        scrollSyncId: state.scrollSyncId
    }})

    const handleOnScroll = useCallback((e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const scrollContainer = e.target as HTMLDivElement;
        if (!timelineAreaRef.current) return

        if (scrollSyncId.current) cancelAnimationFrame(scrollSyncId.current);

        scrollSyncId.current = requestAnimationFrame(() => {
            const newScrollTop = scrollContainer.scrollTop;
            timelineAreaRef.current.scrollTop = newScrollTop;

        })
    }, [])

    const filteredTree: Record<string, EditorTrackTreeNode> = useMemo(() => {
        if (!searchQuery) return trackTree;

        return Object.entries(trackTree).reduce((filtredNode, [key, node]) => {
            if (key && key.toLowerCase().includes(searchQuery.toLowerCase())) {
                filtredNode[key] = node;
            }
            return filtredNode;
        }, {})
    }, [trackTree, searchQuery])

    const { IS_PRODUCTION } = useVXEngine()

    return (
        <div
            className={`antialiased w-[29%] h-full flex flex-col rounded-2xl relative overflow-y-scroll 
                        border dark:border-neutral-800 dark:bg-neutral-900 border-neutral-300 bg-neutral-200`}
            ref={trackListRef}
            onScroll={handleOnScroll}
        >
            <div
                className={`sticky top-0 w-full min-h-[28px] z-10 flex flex-row px-2`}
            // style={{background: "linear-gradient(0deg, rgba(23,23,23,0) 0%, rgba(23,23,23,0.9) 71%)"}}
            >
                <Search
                    className="w-36 px-2 ml-auto my-auto "
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </div>
            {IS_PRODUCTION &&
                <div className="absolute top-1/2 -translate-y-1/2">
                    <p className="text-xs font-roboto-mono text-center text-red-600 px-2">
                        Track Tree is not generated in Production Mode!
                    </p>
                </div>
            }
            {filteredTree && (
                <div
                    className="h-fit text-xs"

                >
                    {Object.values(filteredTree).map((node, index) =>
                        <TreeNode node={node} level={1} key={index} />
                    )}
                </div>
            )}
        </div>
    )
});

const NODE_PADDING_INDENT = 30;

const TreeNode = React.memo(({ node, level }: { node: EditorTrackTreeNode, level: number }) => {
    const paths = React.useMemo(() => node.key.split("."), [node.key]);
    const hasChildren = !!node.children && Object.values(node.children).length > 0
    const isCollapsed = useTimelineEditorAPI(state => state.collapsedTrackNodes[node.key])

    const isLinearTrack = !!node.track && !hasChildren
    // (example) object1 > rotation > x
    //           object2 > scale > y

    return (
        <>
            <li className={`flex items-center ${isLinearTrack ? "bg-neutral-800/40 hover:bg-neutral-800/10" : " "} x-1`}
                style={{ height: DEFAULT_ROW_HEIGHT }}
            >
                <div className={`flex flex-row w-full`} style={{ marginLeft: `${(level - 1) * NODE_PADDING_INDENT + (!hasChildren && 20)}px` }}>
                    {hasChildren && <TreeCollapseButton nodeKey={node.key} isCollapsed={isCollapsed} />}
                    <RenderPaths paths={paths} isLinearTrack={isLinearTrack} trackKey={node.track} />
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

const RenderPaths = memo(({ paths, isLinearTrack, trackKey }: { paths: string[], isLinearTrack: boolean, trackKey: string }) => {
    return paths.map((path, index) => {
        const isFinal = index === paths.length - 1;
        const showArrow = index < paths.length - (isLinearTrack ? 2 : 1);

        if (isLinearTrack && isFinal && trackKey) {
            return <FinalPath key={index} pathKey={path} trackKey={trackKey} />;
        }

        return <Path key={index} pathKey={path} showArrow={showArrow} />;
    });
})

const Path = memo(({ pathKey, showArrow }: { pathKey: string, showArrow: boolean }) => {
    return (
        <div className="flex items-center h-full">
            <p className="antialiased font-medium text-label-quaternary" style={{ fontSize: "11px" }}>
                {pathKey}
            </p>
            {showArrow &&
                <svg className="mx-1 fill-neutral-500" width="15" height="15" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fillRule="evenodd" clipRule="evenodd"></path></svg>
            }
        </div>
    )
})

interface FinaNodeProps {
    pathKey: string
    trackKey: string
}

const FinalPath: React.FC<FinaNodeProps> = memo((props) => {
    const { pathKey, trackKey } = props;
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);

    return (
        <ContextMenu>
            <ContextMenuTrigger className="h-full w-full flex items-center">
                <div className="flex ml-auto gap-2">
                    <p className=" font-semibold text-label-quaternary" style={{ fontSize: "10px" }}>
                        {pathKey}
                    </p>
                    <div className="scale-90">
                        <KeyframeControl vxkey={vxkey} param={{ propertyPath }} />
                    </div>
                </div>
            </ContextMenuTrigger>
            <FinalPathContextMenu {...props} />
        </ContextMenu>
    )
})
const FinalPathContextMenu: React.FC<{trackKey: string}> = memo((props) => {
    const { trackKey } = props;
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey)

    return (
        <ContextMenuContent>
            <ContextMenuItem
                onClick={() => pushDialogStatic({ content: <ALERT_MakePropertyStatic vxkey={vxkey} propertyPath={propertyPath} />, type: "alert" })}
                variant="destructive"
            >
                Make Property Static
            </ContextMenuItem>
            <ContextMenuItem
                onClick={() => pushDialogStatic({ content: <ALERT_ResetProperty vxkey={vxkey} propertyPath={propertyPath} />, type: "alert" })}
                variant="destructive"
            >
                Erase Property
            </ContextMenuItem>
            <ContextMenuSub>
                <ContextMenuSubTrigger>
                    Select...
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <ContextMenuItem onClick={() => selectAllKeyframesOnTrack(trackKey)}>
                        <svg width="17" height="17" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.81812 4.68161C4.99386 4.85734 4.99386 5.14227 4.81812 5.318L3.08632 7.0498H11.9135L10.1817 5.318C10.006 5.14227 10.006 4.85734 10.1817 4.68161C10.3575 4.50587 10.6424 4.50587 10.8181 4.68161L13.3181 7.18161C13.4939 7.35734 13.4939 7.64227 13.3181 7.818L10.8181 10.318C10.6424 10.4937 10.3575 10.4937 10.1817 10.318C10.006 10.1423 10.006 9.85734 10.1817 9.68161L11.9135 7.9498H3.08632L4.81812 9.68161C4.99386 9.85734 4.99386 10.1423 4.81812 10.318C4.64239 10.4937 4.35746 10.4937 4.18173 10.318L1.68173 7.818C1.50599 7.64227 1.50599 7.35734 1.68173 7.18161L4.18173 4.68161C4.35746 4.50587 4.64239 4.50587 4.81812 4.68161Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        <p className="antialiased font-semibold text-xs">
                            All on Track
                        </p>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => selectAllKeyframesOnObject(trackKey)}>
                        <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.28856 0.796908C7.42258 0.734364 7.57742 0.734364 7.71144 0.796908L13.7114 3.59691C13.8875 3.67906 14 3.85574 14 4.05V10.95C14 11.1443 13.8875 11.3209 13.7114 11.4031L7.71144 14.2031C7.57742 14.2656 7.42258 14.2656 7.28856 14.2031L1.28856 11.4031C1.11252 11.3209 1 11.1443 1 10.95V4.05C1 3.85574 1.11252 3.67906 1.28856 3.59691L7.28856 0.796908ZM2 4.80578L7 6.93078V12.9649L2 10.6316V4.80578ZM8 12.9649L13 10.6316V4.80578L8 6.93078V12.9649ZM7.5 6.05672L12.2719 4.02866L7.5 1.80176L2.72809 4.02866L7.5 6.05672Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        <p className="antialiased font-semibold text-xs">
                            All on Object
                        </p>
                    </ContextMenuItem>
                </ContextMenuSubContent>
            </ContextMenuSub>
        </ContextMenuContent>
    )
})


const TreeCollapseButton = memo(({ nodeKey, isCollapsed = false }: { nodeKey: string, isCollapsed: boolean }) => {
    return (
        <div className="mr-[3px] h-[16px] my-auto">
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m10 8 4 4-4 4" />
                </svg>
            </button>
        </div>
    )
})

export default TrackVerticalList;

const TrackData = ({ trackKey }: { trackKey: string }) => {
    const track = useTimelineManagerAPI(state => state.tracks[trackKey]);

    return (
        <div>
            <p className='font-roboto-mono text-xs text-center mb-2'>Track Data</p>
            <div className='max-h-[70vh] overflow-y-scroll flex flex-col w-full mt-2 text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={track} collapsed={({ depth }) => depth > 1} />
            </div>
        </div>
    )
}