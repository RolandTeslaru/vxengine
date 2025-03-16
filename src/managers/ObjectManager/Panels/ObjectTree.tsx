import React, { useCallback, useMemo, useState } from 'react'
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import { useObjectManagerAPI } from '../stores/managerStore';
import { vxElementProps, vxObjectProps, vxSplineNodeProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { useObjectSettingsAPI, useVXObjectStore } from '@vxengine/managers/ObjectManager';
import Search from '@vxengine/components/ui/Search';
import { ObjectTreeNodeProps } from '@vxengine/types/objectEditorStore';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager';
import Tree, { RenderNodeContentProps } from '@vxengine/components/ui/Tree';
import classNames from 'classnames';
import { useVXEngine } from '@vxengine/engine';
import { ArrowDown, ArrowUp, Info, Sun, Video, X } from '@vxengine/components/ui/icons';
import VxObjectData from '@vxengine/components/ui/DataContextContext/VxObject';

interface ObjectTreeNode {
    vxkey: string
    name: string
    type: string
    children: Record<string, ObjectTreeNode>
    isSelectable: boolean
}

const defaultExpandedKeys = {
    scene: {},
    splines: {},
    effects: {},
    environment: {}
}

const ObjectTree = () => {
    const objectsLength = useVXObjectStore(state => Object.entries(state.objects).length)
    const tree = useObjectManagerAPI(state => state.tree);

    const { IS_PRODUCTION } = useVXEngine();

    const [searchQuery, setSearchQuery] = useState("");

    const filteredTree = useMemo(() => filterTree(tree, searchQuery), [tree, searchQuery]);

    const renderNodeContent: RenderNodeContentProps = (node, { NodeTemplate }) => <ObjectTreeNode node={node} NodeTemplate={NodeTemplate} />

    return (
        <CollapsiblePanel
            title="Object Tree"
            noPadding={true}
            contentClassName='pb-0 px-0! gap-2'
        >
            {/* Head */}
            <div className='text-xs flex flex-row px-2 text-label-quaternary w-full'>
                <p className='mr-auto text-xs font-light' style={{ fontSize: "10px" }}>
                    {objectsLength} objects
                </p>
                <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
            {/* Content */}
            <div className='max-h-[550px] rounded-b-xl overflow-y-scroll text-sm'>
                <Tree 
                    defaultExpandedKeys={defaultExpandedKeys} 
                    tree={filteredTree as any} 
                    renderNodeContent={renderNodeContent} 
                    size='md' 
                />
            </div>
            {IS_PRODUCTION &&
                <div>
                    <p className='text-xs text-center font-roboto-mono text-red-600'>
                        Object Tree is not generated in Production Mode!
                    </p>
                </div>
            }
        </CollapsiblePanel>
    )
}

export default ObjectTree


const ObjectTreeNode = ({ node, NodeTemplate }: { node: ObjectTreeNodeProps, NodeTemplate: React.FC<any> }) => {
    const vxkey = node.key
    const isSelected = useObjectManagerAPI(state => state.selectedObjectKeys.includes(vxkey));

    const ContextMenuContentComponent = 
        contextMenuMapping[node.type] || contextMenuMapping.default

    return (
        <ContextMenu>
            <ContextMenuTrigger className='w-full'>
                <NodeTemplate className={
                    classNames(
                        "text-label-tertiary ",
                        { "bg-blue-600! !text-neutral-200": isSelected === true },
                        { "hover:bg-blue-800": node.isSelectable }
                    )}
                    listClassNames={classNames(
                        {"bg-neutral-800 text-white":isSelected === true}
                    )}
                    onClick={(e) => handleNodeObjectClick(e,vxkey)}
                    onContextMenu={(e) => handleObjectContext(e, vxkey)}
                >
                    <div className='flex flex-row w-full gap-2 &:hover:text-neutral-200 '>
                        <span> {iconMapping[node.type]} </span>
                        <p className={`text-xs font-medium antialiased text-nowrap`}>
                            {node.name}
                        </p>
                    </div>
                </NodeTemplate>
            </ContextMenuTrigger>
            <ContextMenuContentComponent vxkey={vxkey}/>
        </ContextMenu>
    )
}


const handleObjectContext = (e: any, vxkey: string) => {
    const selectObjects = useObjectManagerAPI.getState().selectObjects
    selectObjects([vxkey])
}

const handleNodeObjectClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, vxkey: string) => {
    const state = useObjectManagerAPI.getState();
    const {selectObjects, selectedObjectKeys} = state;

    event.preventDefault();

    if(event.metaKey || event.ctrlKey){
        let newSelectedKeys: string[] = [];
        if (selectedObjectKeys.includes(vxkey)) {
            newSelectedKeys = selectedObjectKeys.filter(key => key !== vxkey);
        } else {
            newSelectedKeys = [...selectedObjectKeys, vxkey];
        }
        selectObjects(newSelectedKeys);
    }
    else
        selectObjects([vxkey]);
}

const filterTree = (tree: Record<string, ObjectTreeNodeProps>, query: string): Record<string, ObjectTreeNodeProps> => {
    const result: Record<string, ObjectTreeNodeProps> = {};

    Object.entries(tree).forEach(([vxkey, node]) => {
        const isMatch = node.name.toLowerCase().includes(query.toLowerCase());
        const filteredChildren = filterTree(node.children, query);

        if (isMatch || Object.keys(filteredChildren).length > 0) {
            result[vxkey] = {
                ...node,
                children: filteredChildren,
            };
        }
    });

    return result;
};

const iconMapping = {
    PerspectiveCamera: <Video size={16} />,
    CubeCamera: <Video size={16} />,
    PointLight: <Sun size={16} />,
    SpotLight: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cone"><path d="m20.9 18.55-8-15.98a1 1 0 0 0-1.8 0l-8 15.98" /><ellipse cx="12" cy="19" rx="9" ry="3" /></svg>,
    AmbientLight: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sunset"><path d="M12 10V2" /><path d="m4.93 10.93 1.41 1.41" /><path d="M2 18h2" /><path d="M20 18h2" /><path d="m19.07 10.93-1.41 1.41" /><path d="M22 22H2" /><path d="m16 6-4 4-4-4" /><path d="M16 18a4 4 0 0 0-8 0" /></svg>,
    DirectionalLight: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-down-left"><path d="M17 7 7 17" /><path d="M17 17H7V7" /></svg>,
    Group: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 2C3.11929 2 2 3.11929 2 4.5C2 5.88072 3.11929 7 4.5 7C5.88072 7 7 5.88072 7 4.5C7 3.11929 5.88072 2 4.5 2ZM3 4.5C3 3.67157 3.67157 3 4.5 3C5.32843 3 6 3.67157 6 4.5C6 5.32843 5.32843 6 4.5 6C3.67157 6 3 5.32843 3 4.5ZM10.5 2C9.11929 2 8 3.11929 8 4.5C8 5.88072 9.11929 7 10.5 7C11.8807 7 13 5.88072 13 4.5C13 3.11929 11.8807 2 10.5 2ZM9 4.5C9 3.67157 9.67157 3 10.5 3C11.3284 3 12 3.67157 12 4.5C12 5.32843 11.3284 6 10.5 6C9.67157 6 9 5.32843 9 4.5ZM2 10.5C2 9.11929 3.11929 8 4.5 8C5.88072 8 7 9.11929 7 10.5C7 11.8807 5.88072 13 4.5 13C3.11929 13 2 11.8807 2 10.5ZM4.5 9C3.67157 9 3 9.67157 3 10.5C3 11.3284 3.67157 12 4.5 12C5.32843 12 6 11.3284 6 10.5C6 9.67157 5.32843 9 4.5 9ZM10.5 8C9.11929 8 8 9.11929 8 10.5C8 11.8807 9.11929 13 10.5 13C11.8807 13 13 11.8807 13 10.5C13 9.11929 11.8807 8 10.5 8ZM9 10.5C9 9.67157 9.67157 9 10.5 9C11.3284 9 12 9.67157 12 10.5C12 11.3284 11.3284 12 10.5 12C9.67157 12 9 11.3284 9 10.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>,
    Mesh: <svg className="text-label-primary stroke-label-primary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 4m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M3 17m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M17 17m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M6.5 17.1l5 -9.1" /><path d="M17.5 17.1l-5 -9.1" /><path d="M7 19l10 0" /></svg>,
    Effects: <svg className='dark:text-yellow-300 text-yellow-400 ' xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z" /></svg>,
    Environment: <svg className="dark:text-green-300 text-green-500" width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 1H12.5C13.3284 1 14 1.67157 14 2.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V2.5C1 1.67157 1.67157 1 2.5 1ZM2.5 2C2.22386 2 2 2.22386 2 2.5V8.3636L3.6818 6.6818C3.76809 6.59551 3.88572 6.54797 4.00774 6.55007C4.12975 6.55216 4.24568 6.60372 4.32895 6.69293L7.87355 10.4901L10.6818 7.6818C10.8575 7.50607 11.1425 7.50607 11.3182 7.6818L13 9.3636V2.5C13 2.22386 12.7761 2 12.5 2H2.5ZM2 12.5V9.6364L3.98887 7.64753L7.5311 11.4421L8.94113 13H2.5C2.22386 13 2 12.7761 2 12.5ZM12.5 13H10.155L8.48336 11.153L11 8.6364L13 10.6364V12.5C13 12.7761 12.7761 13 12.5 13ZM6.64922 5.5C6.64922 5.03013 7.03013 4.64922 7.5 4.64922C7.96987 4.64922 8.35078 5.03013 8.35078 5.5C8.35078 5.96987 7.96987 6.35078 7.5 6.35078C7.03013 6.35078 6.64922 5.96987 6.64922 5.5ZM7.5 3.74922C6.53307 3.74922 5.74922 4.53307 5.74922 5.5C5.74922 6.46693 6.53307 7.25078 7.5 7.25078C8.46693 7.25078 9.25078 6.46693 9.25078 5.5C9.25078 4.53307 8.46693 3.74922 7.5 3.74922Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>,
    Scene: <svg className='dark:text-blue-300 text-blue-500' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 3.5C2 3.22386 2.22386 3 2.5 3H12.5C12.7761 3 13 3.22386 13 3.5V9.5C13 9.77614 12.7761 10 12.5 10H2.5C2.22386 10 2 9.77614 2 9.5V3.5ZM2 10.9146C1.4174 10.7087 1 10.1531 1 9.5V3.5C1 2.67157 1.67157 2 2.5 2H12.5C13.3284 2 14 2.67157 14 3.5V9.5C14 10.1531 13.5826 10.7087 13 10.9146V11.5C13 12.3284 12.3284 13 11.5 13H3.5C2.67157 13 2 12.3284 2 11.5V10.9146ZM12 11V11.5C12 11.7761 11.7761 12 11.5 12H3.5C3.22386 12 3 11.7761 3 11.5V11H12Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>,
    FadeEffect: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><defs><linearGradient id="opacityGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="white" stopOpacity="0" /><stop offset="100%" stopColor="white" stopOpacity="1" /></linearGradient></defs><rect x="0" y="0" width="16" height="16" rx="3" ry="3" fill="url(#opacityGradient)" /></svg>,
    BloomEffect: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><defs><radialGradient id="bloomGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" stopColor="white" stopOpacity="1" /><stop offset="70%" stopColor="white" stopOpacity="0.4" /><stop offset="100%" stopColor="white" stopOpacity="0" /></radialGradient></defs><circle cx="8" cy="8" r="2" fill="white" /><circle cx="8" cy="8" r="7" fill="url(#bloomGradient)" /></svg>,
    LUTEffect: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" fill="#60a5fa" /><rect x="9" y="1" width="6" height="6" fill="#FA6767FF" /><rect x="1" y="9" width="6" height="6" fill="#4ade80" /><rect x="9" y="9" width="6" height="6" fill="white" /></svg>,
    Splines: <svg className='dark:text-red-400 text-red-600' width="16" height="16" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path id="Path" fill="currentColor" stroke="none" d="M 3.374073 7.547915 C 3.239028 8.353275 2.538744 8.966934 1.695041 8.966934 C 0.75477 8.966934 -0.007484 8.204681 -0.007484 7.264408 C -0.007484 6.324139 0.75477 5.561882 1.695041 5.561882 C 2.497135 5.561882 3.169633 6.116497 3.350033 6.863159 L 21.513258 4.200409 C 24.821333 3.086685 27.856798 2.524509 28.594948 2.397568 L 28.594948 1.716558 L 32 1.716558 L 32 5.121611 L 28.594948 5.121611 L 28.594948 4.440599 C 26.940365 4.761627 13.782974 7.507191 13.782974 12.612724 C 13.782974 17.379795 22.465855 16.017775 22.465855 20.784845 C 22.465855 23.797569 16.426521 26.393852 11.027266 28.112926 L 27.933344 25.634457 C 28.057697 24.816563 28.763908 24.189898 29.616461 24.189898 C 30.556734 24.189898 31.318989 24.952152 31.318989 25.892424 C 31.318989 26.832695 30.556734 27.594948 29.616461 27.594948 C 28.823015 27.594948 28.156376 27.052183 27.967466 26.317715 L 6.064471 29.528746 C 4.068293 30.039299 2.716557 30.318991 2.716557 30.318991 L 2.716557 31 L -0.688495 31 L -0.688495 27.594948 L 2.716557 27.594948 L 2.716557 28.275959 C 5.440598 27.594948 20.082317 23.508888 20.082317 20.784845 C 20.082317 18.060806 11.569692 18.741817 11.569692 12.612724 C 11.569692 9.322216 14.887505 6.945217 18.608475 5.314541 L 3.374073 7.547915 Z M 1.695041 8.285925 C 2.25919 8.285925 2.716557 7.828558 2.716557 7.264408 C 2.716557 6.70026 2.25919 6.242893 1.695041 6.242893 C 1.130893 6.242893 0.673525 6.70026 0.673525 7.264408 C 0.673525 7.828558 1.130893 8.285925 1.695041 8.285925 Z M 29.275957 2.397568 L 29.275957 4.440599 L 31.318989 4.440599 L 31.318989 2.397568 L 29.275957 2.397568 Z M -0.007484 28.275959 L -0.007484 30.318991 L 2.035546 30.318991 L 2.035546 28.275959 L -0.007484 28.275959 Z M 29.616461 24.870907 C 29.052315 24.870907 28.594948 25.328274 28.594948 25.892424 C 28.594948 26.456572 29.052315 26.913939 29.616461 26.913939 C 30.180613 26.913939 30.63798 26.456572 30.63798 25.892424 C 30.63798 25.328274 30.180613 24.870907 29.616461 24.870907 Z" /></svg>,
    Spline: <svg className='text-label-primary' width="16" height="16" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path id="Path" fill="currentColor" stroke="none" d="M 3.374073 7.547915 C 3.239028 8.353275 2.538744 8.966934 1.695041 8.966934 C 0.75477 8.966934 -0.007484 8.204681 -0.007484 7.264408 C -0.007484 6.324139 0.75477 5.561882 1.695041 5.561882 C 2.497135 5.561882 3.169633 6.116497 3.350033 6.863159 L 21.513258 4.200409 C 24.821333 3.086685 27.856798 2.524509 28.594948 2.397568 L 28.594948 1.716558 L 32 1.716558 L 32 5.121611 L 28.594948 5.121611 L 28.594948 4.440599 C 26.940365 4.761627 13.782974 7.507191 13.782974 12.612724 C 13.782974 17.379795 22.465855 16.017775 22.465855 20.784845 C 22.465855 23.797569 16.426521 26.393852 11.027266 28.112926 L 27.933344 25.634457 C 28.057697 24.816563 28.763908 24.189898 29.616461 24.189898 C 30.556734 24.189898 31.318989 24.952152 31.318989 25.892424 C 31.318989 26.832695 30.556734 27.594948 29.616461 27.594948 C 28.823015 27.594948 28.156376 27.052183 27.967466 26.317715 L 6.064471 29.528746 C 4.068293 30.039299 2.716557 30.318991 2.716557 30.318991 L 2.716557 31 L -0.688495 31 L -0.688495 27.594948 L 2.716557 27.594948 L 2.716557 28.275959 C 5.440598 27.594948 20.082317 23.508888 20.082317 20.784845 C 20.082317 18.060806 11.569692 18.741817 11.569692 12.612724 C 11.569692 9.322216 14.887505 6.945217 18.608475 5.314541 L 3.374073 7.547915 Z M 1.695041 8.285925 C 2.25919 8.285925 2.716557 7.828558 2.716557 7.264408 C 2.716557 6.70026 2.25919 6.242893 1.695041 6.242893 C 1.130893 6.242893 0.673525 6.70026 0.673525 7.264408 C 0.673525 7.828558 1.130893 8.285925 1.695041 8.285925 Z M 29.275957 2.397568 L 29.275957 4.440599 L 31.318989 4.440599 L 31.318989 2.397568 L 29.275957 2.397568 Z M -0.007484 28.275959 L -0.007484 30.318991 L 2.035546 30.318991 L 2.035546 28.275959 L -0.007484 28.275959 Z M 29.616461 24.870907 C 29.052315 24.870907 28.594948 25.328274 28.594948 25.892424 C 28.594948 26.456572 29.052315 26.913939 29.616461 26.913939 C 30.180613 26.913939 30.63798 26.456572 30.63798 25.892424 C 30.63798 25.328274 30.180613 24.870907 29.616461 24.870907 Z" /></svg>,
    CameraTarget: <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 0C7.77614 0 8 0.223858 8 0.5V1.80687C10.6922 2.0935 12.8167 4.28012 13.0068 7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H12.9888C12.7094 10.6244 10.6244 12.7094 8 12.9888V14.5C8 14.7761 7.77614 15 7.5 15C7.22386 15 7 14.7761 7 14.5V13.0068C4.28012 12.8167 2.0935 10.6922 1.80687 8H0.5C0.223858 8 0 7.77614 0 7.5C0 7.22386 0.223858 7 0.5 7H1.78886C1.98376 4.21166 4.21166 1.98376 7 1.78886V0.5C7 0.223858 7.22386 0 7.5 0ZM8 12.0322V9.5C8 9.22386 7.77614 9 7.5 9C7.22386 9 7 9.22386 7 9.5V12.054C4.80517 11.8689 3.04222 10.1668 2.76344 8H5.5C5.77614 8 6 7.77614 6 7.5C6 7.22386 5.77614 7 5.5 7H2.7417C2.93252 4.73662 4.73662 2.93252 7 2.7417V5.5C7 5.77614 7.22386 6 7.5 6C7.77614 6 8 5.77614 8 5.5V2.76344C10.1668 3.04222 11.8689 4.80517 12.054 7H9.5C9.22386 7 9 7.22386 9 7.5C9 7.77614 9.22386 8 9.5 8H12.0322C11.7621 10.0991 10.0991 11.7621 8 12.0322Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>,
    Color: <svg width={16} height={16} className='fill-label-primary' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M512 256c0 .9 0 1.8 0 2.7c-.4 36.5-33.6 61.3-70.1 61.3L344 320c-26.5 0-48 21.5-48 48c0 3.4 .4 6.7 1 9.9c2.1 10.2 6.5 20 10.8 29.9c6.1 13.8 12.1 27.5 12.1 42c0 31.8-21.6 60.7-53.4 62c-3.5 .1-7 .2-10.6 .2C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm0-96a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM288 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 96a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" /></svg>,
    Keyframe: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12" className='ml-[3px]'><polygon points="8,1 15,8 8,15 1,8" fill="none" stroke="currentColor" strokeWidth="1.8" /> </svg>,
    SplineNode: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="19" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><path d="M5 17A12 12 0 0 1 17 5" /></svg>,
    HTML: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.325 3.05011L8.66741 20.4323L10.5993 20.9499L15.2568 3.56775L13.325 3.05011Z" fill="currentColor" /> <path d="M7.61197 18.3608L8.97136 16.9124L8.97086 16.8933L3.87657 12.1121L8.66699 7.00798L7.20868 5.63928L1.04956 12.2017L7.61197 18.3608Z" fill="currentColor" /> <path d="M16.388 18.3608L15.0286 16.9124L15.0291 16.8933L20.1234 12.1121L15.333 7.00798L16.7913 5.63928L22.9504 12.2017L16.388 18.3608Z" fill="currentColor" /> </svg>,
    div: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" ><path d="M9.95263 16.9123L8.59323 18.3608L2.03082 12.2016L8.18994 5.63922L9.64826 7.00791L4.85783 12.112L9.95212 16.8932L9.95263 16.9123Z" fill="currentColor" /> <path d="M14.0474 16.9123L15.4068 18.3608L21.9692 12.2016L15.8101 5.63922L14.3517 7.00791L19.1422 12.112L14.0479 16.8932L14.0474 16.9123Z" fill="currentColor" /> </svg>,
}


const SplineContextMenu = ({ vxkey }: { vxkey: string }) => {
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
        </ContextMenuContent>
    )
}

const SplineNodeContextMenuContent = ({ vxkey }: { vxkey: string }) => {
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
            <ContextMenuSub>
                <ContextMenuSubTrigger>Show Data</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <VxObjectData vxkey={nodeKey}/>
                </ContextMenuSubContent>
            </ContextMenuSub>
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
        </ContextMenuContent>
    )
}

const DefaultContextMenu = ({ vxkey }) => {
    return (
        <ContextMenuContent className='text-xs font-roboto-mono'>
            <ContextMenuSub>
                <ContextMenuSubTrigger icon={<Info size={17} />}>Show Data</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                    <VxObjectData vxkey={vxkey}/>
                </ContextMenuSubContent>
            </ContextMenuSub>
        </ContextMenuContent>
    )
}


const contextMenuMapping = {
    "SplineNode": SplineNodeContextMenuContent,
    "Spline": SplineContextMenu,
    default: DefaultContextMenu
}