// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { ChevronLeft, Square, ChevronRight, ChevronDown } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { edObjectProps, ITrack, PathGroup } from "vxengine/AnimationEngine/types/track";
import { useVXEngine } from "vxengine/engine";
import { useVXObjectStore } from "vxengine/store";
import { shallow } from "zustand/shallow";
import { useTimelineEditorStore } from "../store";
import { scale } from "../ui";
import { handleSetCursor } from "../utils/handleSetCursor";
import { vxObjectProps } from "vxengine/types/objectStore";
import { ScrollArea } from "vxengine/components/shadcn/scrollArea";

interface TimelineKeyframeControlProps {
    track?: ITrack,
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

const TrackVerticalList = () => {
    const { editorData, tracks, staticProps, groupedPaths, collapsedGroups, setCollapsedGroups, trackListRef } = useTimelineEditorStore(state => ({
        editorData: state.editorData,
        tracks: state.tracks,
        staticProps: state.staticProps,
        groupedPaths: state.groupedPaths,
        collapsedGroups: state.collapsedGroups,
        setCollapsedGroups: state.setCollapsedGroups,
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
        parentPath = ''
    ) => {
        return Object.entries(groupedPaths).map(([key, group]) => {
            const childrenAllKeys = Object.keys(group.children);
            const isNestedToPreviousPath = !(group.children && childrenAllKeys.length > 1)
            const isTrack = !!group.track;
            const isPath = group.children && childrenAllKeys.length > 0 && !isTrack
            const shouldIndentChildren = !isNestedToPreviousPath && !isTrack

            const isCollapsible = (group.rowIndex !== group.prevRowIndex) && (group.rowIndex !== group.localFinalTrackIndex) && !isTrack;

            const groupKey = `${parentPath}/${key}`;

            const isCollapsed = collapsedGroups[groupKey] || false;

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
                            <span className="font-bold !text-green-600 text-nowrap">&nbsp; {group.rowIndex}</span>
                        </p>
                        {/* Render KeyframeControl for collapsed groups */}
                        {/* TODO: Implement a keyframe controller for collapsed tracks  */}
                        {/* {isCollapsed && renderCollapsedKeyframeControl({edObject, group})} */}

                        {isTrack && !isCollapsed && (
                            <KeyframeControl
                                track={group.track}
                                propertyPath={group.track.propertyPath}
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
