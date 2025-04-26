import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import React, { useCallback } from 'react'
import { vxObjectProps, vxSplineNodeProps, vxSplineProps } from '../types/objectStore'
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager'
import ValueRenderer from '@vxengine/components/ui/ValueRenderer'
import { Button } from '@vxengine/components/shadcn/button'
import { useVXObjectStore } from '../stores/objectStore'
import { ArrowDown, ArrowUp, X } from '@vxengine/components/ui/icons'

interface Props {
    vxobject: vxSplineNodeProps
}

const handleInsertBefore = (splineKey: string, nodeIndex) => {
    const insertNode = useTimelineManagerAPI.getState().insertNode
    insertNode({ splineKey, index: nodeIndex })
}
const handleDelete = (splineKey: string, nodeIndex) => {
    const removeNode = useTimelineManagerAPI.getState().removeNode
    removeNode({ splineKey, index: nodeIndex })
}
const handleInsertAfter = (splineKey: string, nodeIndex) => {
    const insertNode = useTimelineManagerAPI.getState().insertNode
    insertNode({ splineKey, index: nodeIndex })
}


const SplineNodeParams: React.FC<Props> = ({ vxobject: vxSplineNode }) => {
    const nodeKey = vxSplineNode.vxkey
    const nodeIndex = vxSplineNode.index
    const splineKey = nodeKey.includes('.node') ? nodeKey.split('.node')[0] : nodeKey;

    const onPositionPropChange = useCallback((axis: "x" | "y" | "z", newValue: number) => {
        useTimelineManagerAPI
            .getState()
            .setSplineNodeAxisValue(splineKey, nodeIndex, axis, newValue, true);
    }, [nodeIndex, splineKey])
    
    return (
        <>
            <CollapsiblePanel
                title="Node Transform"
            >
                <div className="w-full h-auto flex flex-col gap-2">
                    <div className="flex gap-1 flex-row ml-auto">
                        <p className="mx-[16.5px] text-red-400"
                            style={{ textShadow: "#f87171 0px 0px 10px" }}
                        >x</p>
                        <p className="mx-[16.5px] text-green-400"
                            style={{ textShadow: "#4ade80 0px 0px 10px" }}
                        >y</p>
                        <p className="mx-[16.5px] text-blue-400"
                            style={{ textShadow: "#60a5fa 0px 0px 10px " }}
                        >z</p>
                    </div>
                    <div className='flex flex-row'>
                        <p className="text-xs font-light text-neutral-400">position</p>
                        <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                            {['x', 'y', 'z'].map((axis: "x" | "y" | "z") => (
                                <ValueRenderer
                                    key={axis}
                                    vxRefObj={vxSplineNode.ref}
                                    vxkey={vxSplineNode.vxkey}
                                    param={{ propertyPath: `position.${axis}`}}
                                    onChange={(newValue) => {
                                        onPositionPropChange(axis, newValue);
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </CollapsiblePanel>
            <CollapsiblePanel
                title={`Spline Node ${vxSplineNode.index}`}
                contentClassName='gap-2'
            >
                <div className=' antialiased  flex flex-col gap-1 w-auto px-auto *:bg-transparent *:p-1 *:rounded-lg'>
                    <Button
                        variant="default" size="sm" className='font-medium justify-start' 
                        onClick={() => handleInsertAfter(splineKey, vxSplineNode.index)}
                    >
                        <ArrowUp size={15} className='stroke-2'/>
                        Insert Node After
                    </Button>
                    <Button
                        variant="default" size="sm" className='font-medium justify-start text-red-600' 
                        onClick={() => handleDelete(splineKey, vxSplineNode.index)}
                    >
                        <X size={16} className='stroke-2'/>
                        Delete Node
                    </Button>
                    <Button 
                        variant="default" size="sm" className='font-medium justify-start ' 
                        onClick={() => handleInsertBefore(splineKey, vxSplineNode.index - 1)}
                    >
                        <ArrowDown size={15} className='stroke-2'/>
                        Insert Node Before
                    </Button>
                </div>
            </CollapsiblePanel>

            {/* {vxSpline &&<SplineParams vxobject={vxSpline}/>} */}
        </>
    )
}

export default SplineNodeParams

