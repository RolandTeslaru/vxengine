import React, { useEffect, useState } from "react";
import CollapsiblePanel from "@vxengine/core/components/CollapsiblePanel";
import ParamInput from "@vxengine/components/ui/ParamInput";
import { vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import { useObjectSettingsAPI } from "../stores/settingsStore";
import ValueRenderer from "@vxengine/components/ui/ValueRenderer";

interface Props {
    vxobject: vxObjectProps
}

const NodeTransformParams: React.FC<Props> = ({ vxobject }) => {
    return (
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
                        {['x', 'y', 'z'].map((axis) => (
                            <ValueRenderer
                                key={axis}
                                vxRefObj={vxobject.ref}
                                vxkey={vxobject.vxkey}
                                param={{ propertyPath: `position.${axis}`}}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </CollapsiblePanel>
    )
}

export default NodeTransformParams
