import React, { useEffect, useState } from "react";
import CollapsiblePanel from "@vxengine/components/ui/CollapsiblePanel";
import PropInput from "@vxengine/components/ui/PropInput";
import { vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import { useObjectSettingsAPI } from "../stores/settingsStore";

interface Props {
    vxobject: vxObjectProps
}

const NodeTransformProperties: React.FC<Props> = ({ vxobject }) => {
    const vxkey = vxobject.vxkey

    const settings = useObjectSettingsAPI(state => state.settings[vxkey])
    const isUsingSplinePath = settings?.useSplinePath

    const renderInputs = (property, disabled = false) => {
        return ['x', 'y', 'z'].map((axis) => (
            <PropInput
                key={`${property}-${axis}`}
                type="number"
                propertyPath={`${property}.${axis}`}
                horizontal={true}
                disabled={disabled}
                disableTracking={true}
            />
        ));
    };

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
                    <p className="text-xs font-light text-neutral-500">position</p>
                    <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                        {renderInputs('position', isUsingSplinePath)}
                    </div>
                </div>

            </div>
        </CollapsiblePanel>
    )
}

export default NodeTransformProperties
