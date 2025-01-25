import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import React from 'react'
import { vxSplineNodeProps } from '../types/objectStore'
import ArrowUp from '@geist-ui/icons/arrowUp'
import ArrowDown from '@geist-ui/icons/arrowDown'
import X from '@geist-ui/icons/x'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager'

interface Props {
    vxobject: vxSplineNodeProps
}

const handleInsertBefore = (splineKey: string, nodeIndex) => {
    const insertNode = useTimelineEditorAPI.getState().insertNode
    insertNode({ splineKey, index: nodeIndex })
}
const handleDelete = (splineKey: string, nodeIndex) => {
    const removeNode = useTimelineEditorAPI.getState().removeNode
    removeNode({ splineKey, index: nodeIndex })
}
const handleInsertAfter = (splineKey: string, nodeIndex) => {
    const insertNode = useTimelineEditorAPI.getState().insertNode
    insertNode({ splineKey, index: nodeIndex })
}
const SplineNodePanel: React.FC<Props> = ({vxobject: vxSplineNode}) => {
    const nodeKey = vxSplineNode.vxkey
    const splineKey = nodeKey.includes('.node') ? nodeKey.split('.node')[0] : nodeKey;

    return (
        <CollapsiblePanel
            title={`Spline Node ${vxSplineNode.index}`}
            contentClassName='gap-2'
        >
         <div className='flex flex-col gap-2 w-auto px-auto [&>*]:bg-transparent [&>*]:p-1 [&>*]:rounded-lg'>
            <button 
                className='flex font-sans-menlo gap-2  hover:bg-neutral-800'
                onClick={() => handleInsertBefore(splineKey, vxSplineNode.index - 1)}
            >
                <ArrowUp size={15} />
                Insert Node Before
            </button>
            <button 
                className='flex font-sans-menlo gap-2  text-red-600 hover:bg-neutral-800'
                onClick={() => handleDelete(splineKey, vxSplineNode.index)}
            >
                <X size={15} />
                Delete Node
            </button>
            <button 
                onClick={() => handleInsertAfter(splineKey, vxSplineNode.index)}
                className='flex font-sans-menlo gap-2 hover:bg-neutral-800 '
            >
                <ArrowDown size={15} />
                Insert Node After
            </button>
         </div>
        </CollapsiblePanel>
    )
}

export default SplineNodePanel
