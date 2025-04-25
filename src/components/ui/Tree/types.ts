
export interface TreeNodeType {
    key: string;
    currentPath: string;
    children: Record<string, TreeNodeType> | null;
    refObject: any
    data: null | any
}

export type CreateNodeDataFnType = (
    props: {
        key: string, 
        currentPath: string, 
        value: any, 
        parentNode: TreeNodeDataType,
    }
) => Record<string, any>

export type TreeNodeDataType = {
    key: string
    children: Record<string, TreeNodeDataType>
    refObject: Record<string, any>
    currentPath: string
}

export interface TreeNodeElementTemplateProps {
    NodeTemplate: React.FC<{
        children: React.ReactNode,
        className?: string,
        onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void,
        onContextMenu?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void,
        listClassNames?: string
    }>;
}

export type RenderNodeContentProps = (node: any, NodeTemplate: TreeNodeElementTemplateProps) => React.ReactNode;

export type CreateBranchFnType = (
    object: Record<string, any>,
    sufix: string,
    parentKey: string
) => Record<string, any>

export interface TreeNodeProps {
    node: TreeNodeDataType,
    level: number,
    siblings: number,
    indexToParent: number,
    size?: "sm" | "md",
    renderNodeContent?: RenderNodeContentProps,
    createNodeDataFn?: CreateNodeDataFnType
    defaultExpandedKeys?: Record<string, any>
}

export interface TreeProps {
    tree: Record<string, TreeNodeDataType>
    renderNodeContent: RenderNodeContentProps
    size?: "sm" | "md",
    defaultExpandedKeys?: Record<string, any>
    className?: string
    createNodeDataFn?: CreateNodeDataFnType
}