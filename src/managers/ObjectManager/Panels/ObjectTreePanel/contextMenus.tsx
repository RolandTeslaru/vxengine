import { ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger } from "@vxengine/ui/foundations";
import VxObjectData from "@vxengine/ui/components/DataContextContext/VxObject";
import { ArrowDown, ArrowUp, Info, X } from "@vxengine/ui/icons";
import { useTimelineManagerAPI } from "@vxengine/managers/TimelineManager";
import React from "react";
import { useObjectSettingsAPI } from "../../stores/settingsStore";
import { regeneratePropertySetters } from "./utils";
import { useVXObjectStore } from "../../stores/objectStore";
import { vxSplineNodeProps } from "../../types/objectStore";
import { ObjectTreeNodeProps } from "@vxengine/types/objectEditorStore";
import DataViewerWrapper from "@vxengine/ui/components/DataContextContext/DataViewerWrapper";
import { ObjectManagerService } from "../../service";
import { ContextMenuSeparator } from "@radix-ui/react-context-menu";
import { useVXEngine } from "@vxengine/engine";
import { vxengine } from "@vxengine/singleton";


const SplineContextMenu = ({ vxkey, node }: { vxkey: string, node: ObjectTreeNodeProps }) => {
    const splineKey = vxkey;
    const handleDeleteSpline = () => {
        const objVxKey = useTimelineManagerAPI.getState().splines[splineKey]?.vxkey
        const toggleSetting = useObjectSettingsAPI.getState().toggleSetting;
        toggleSetting(objVxKey, "useSplinePath");
    }
    return (
        <ContextMenuContent className='font-roboto-mono'>
            <ContextMenuSub>
                <ContextMenuSubTrigger icon={<Info size={17} />}>Show Data</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <VxObjectData vxkey={vxkey}/>
                </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem 
                className='text-xs antialiased font-medium gap-2 text-red-600'
                variant={"destructive"} 
                onClick={handleDeleteSpline} 
                icon={<X size={19} className='stroke-2'/>} 
            >
                Delete Spline
            </ContextMenuItem>
            <TreeDebugNode vxkey={vxkey} node={node}/>
        </ContextMenuContent>
    )
}

const SplineNodeContextMenuContent = ({ vxkey, node }: { vxkey: string, node: ObjectTreeNodeProps }) => {
    const nodeKey = vxkey;
    const insertNode = useTimelineManagerAPI(state => state.insertNode);
    const removeNode = useTimelineManagerAPI(state => state.removeNode);

    const vxSplineNode = useVXObjectStore(state => state.objects[nodeKey]) as vxSplineNodeProps;

    if (!vxSplineNode) return

    const nodeIndex = vxSplineNode.index

    const splineKey = nodeKey.includes('.node') ? nodeKey.split('.node')[0] : nodeKey;

    const handleInsertBefore = () => {
        insertNode({ splineKey, index: nodeIndex - 1 })
    }
    const handleDelete = () => {
        removeNode({ splineKey, index: nodeIndex })
    }
    const handleInsertAfter = () => {
        insertNode({ splineKey, index: nodeIndex })
    }

    return (
        <ContextMenuContent className='font-roboto-mono'>
            {/* <ContextMenuSub>
                <ContextMenuSubTrigger>Show Data</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <VxObjectData vxkey={nodeKey}/>
                </ContextMenuSubContent>
            </ContextMenuSub> */}
            {nodeIndex !== 0 &&
                <ContextMenuItem onClick={handleInsertBefore} className='text-xs antialiased font-medium gap-2'>
                    <ArrowUp size={15} className='stroke-2'/>
                    Insert Node Before
                </ContextMenuItem>
            }
            <ContextMenuItem onClick={handleDelete} className='text-xs antialiased font-medium gap-2 text-red-600'>
                <X size={15} className='stroke-2'/>
                Delete Node {nodeIndex}
            </ContextMenuItem>
            <ContextMenuItem onClick={handleInsertAfter} className='text-xs antialiased font-medium gap-2'>
                <ArrowDown size={15} className='stroke-2'/>
                Insert Node After
            </ContextMenuItem>
            <TreeDebugNode vxkey={vxkey} node={node}/>
        </ContextMenuContent>
    )
}

const DefaultContextMenu = ({ vxkey, node }) => {
    return (
        <ContextMenuContent className='text-xs font-roboto-mono'>
            <ContextMenuSub>
                <ContextMenuSubTrigger icon={<Info size={17} />}>Show Data</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <VxObjectData vxkey={vxkey}/>
                </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSub>
                <ContextMenuSubTrigger>Debug</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <ContextMenuItem onClick={() => regeneratePropertySetters(vxkey)}>
                        Regenerate Property Setters
                    </ContextMenuItem>
                </ContextMenuSubContent>
            </ContextMenuSub>
            <TreeDebugNode vxkey={vxkey} node={node}/>
        </ContextMenuContent>
    )
}


export const OBJECT_TREE_CONTEXT_MENUS = {
    "SplineNode": SplineNodeContextMenuContent,
    "Spline": SplineContextMenu,
    default: DefaultContextMenu
}

const TreeDebugNode = ({vxkey, node}) => {

    if(vxengine.isDevelopment){
        return (
            <ContextMenuSub>
                <ContextMenuSubTrigger>Debug Tree node</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <ContextMenuSub>
                        <ContextMenuSubTrigger> Data </ContextMenuSubTrigger>
                        <ContextMenuSubContent>
                            <DataViewerWrapper src={node} title={"Tree Node Data"}/>
                        </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuSeparator/>
                    <ContextMenuItem onClick={() => ObjectManagerService.objectManagerState.removeFromTree(vxkey)}>Remove Node</ContextMenuItem>
                    <ContextMenuItem onClick={() => ObjectManagerService.objectManagerState.reattachTreeNode(vxkey)}>Reattach Node</ContextMenuItem>
                </ContextMenuSubContent>
            </ContextMenuSub>
        )
    }
    else {
        return null;
    }

}

