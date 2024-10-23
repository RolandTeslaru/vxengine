import React, { useEffect, useState } from "react";
import { useObjectManagerAPI, useObjectPropertyAPI } from "../store";
import CollapsiblePanel from "@vxengine/components/ui/CollapsiblePanel";
import PropInput from "@vxengine/components/ui/PropInput";
import { Switch } from "@vxengine/components/shadcn/switch";
import { useObjectSettingsAPI } from "@vxengine/vxobject/ObjectSettingsStore";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@vxengine/components/shadcn/alertDialog";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/store";
import { IStaticProps, ITrack } from "@vxengine/AnimationEngine/types/track";
import { useSplineManagerAPI } from "@vxengine/managers/SplineManager/store";
import { Slider } from "@vxengine/components/shadcn/slider";
import { getNestedProperty } from "@vxengine/utils";

const NodeTransformProperties = () => {
    const firstObjectSelectedStored = useObjectManagerAPI((state) => state.selectedObjects[0]);
    const vxkey = firstObjectSelectedStored.vxkey
    const disabledParams = firstObjectSelectedStored.disabledParams;

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
