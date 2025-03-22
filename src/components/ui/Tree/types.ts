
export type TreeNodeDataType = {
    key: string
    children: Record<string, TreeNodeDataType>
    rawObject: Record<string, any>
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

export interface TreeNodeProps {
    node: TreeNodeDataType,
    level: number,
    siblings: number,
    indexToParent: number,
    size?: "sm" | "md",
    renderNodeContent?: RenderNodeContentProps
}

export interface TreeProps {
    tree: Record<string, TreeNodeDataType>
    renderNodeContent: RenderNodeContentProps
    size?: "sm" | "md",
    defaultExpandedKeys?: Record<string, any>
    className?: string
    createBranch?: (
        object: Record<string, any>, 
        sufix: string, 
        parentKey: string
    ) => Record<string, any>
}