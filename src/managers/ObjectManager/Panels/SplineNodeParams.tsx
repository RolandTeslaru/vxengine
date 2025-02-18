import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel'
import React, { useCallback } from 'react'
import { vxObjectProps, vxSplineNodeProps, vxSplineProps } from '../types/objectStore'
import ArrowUp from '@geist-ui/icons/arrowUp'
import ArrowDown from '@geist-ui/icons/arrowDown'
import X from '@geist-ui/icons/x'
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager'
import ParamInput from '@vxengine/components/ui/ParamInput'
import ValueRenderer from '@vxengine/components/ui/ValueRenderer'
import { Button } from '@vxengine/components/shadcn/button'
import { useObjectManagerAPI } from '../stores/managerStore'
import { useVXObjectStore } from '../stores/objectStore'
import SplineParams from './SplineParams'

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

    const setSplineNodeAxisValue = useTimelineManagerAPI(state => state.setSplineNodeAxisValue);

    const onPositionPropChange = useCallback((axis: "x" | "y" | "z", newValue: number) => {
        setSplineNodeAxisValue(splineKey, nodeIndex, axis, newValue, true);
    }, [vxSplineNode])
    
    const vxSpline = useVXObjectStore(state => state.objects[splineKey]) as vxSplineProps;

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
                                    vxObject={vxSplineNode}
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
                <div className='flex flex-col gap-1 w-auto px-auto [&>*]:bg-transparent [&>*]:p-1 [&>*]:rounded-lg'>
                    <Button 
                        variant="default" size="sm" className=' justify-start ' 
                        onClick={() => handleInsertBefore(splineKey, vxSplineNode.index - 1)}
                    >
                        <ArrowUp size={16} />
                        Insert Node Before
                    </Button>
                    <Button
                        variant="default" size="sm" className=' justify-start text-red-600' 
                        onClick={() => handleDelete(splineKey, vxSplineNode.index)}
                    >
                        <X size={16} />
                        Delete Node
                    </Button>
                    <Button
                        variant="default" size="sm" className=' justify-start' 
                        onClick={() => handleInsertAfter(splineKey, vxSplineNode.index)}
                    >
                        <ArrowDown size={15} />
                        Insert Node After
                    </Button>
                </div>
            </CollapsiblePanel>

            {/* {vxSpline &&<SplineParams vxobject={vxSpline}/>} */}
        </>
    )
}

export default SplineNodeParams

