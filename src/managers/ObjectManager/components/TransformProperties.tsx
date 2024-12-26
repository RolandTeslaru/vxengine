import React, { useEffect, useMemo, useRef, useState } from "react";
import { useObjectManagerAPI, useObjectPropertyAPI } from "../stores/managerStore";
import CollapsiblePanel from "@vxengine/core/components/CollapsiblePanel";
import PropInput from "@vxengine/components/ui/PropInput";
import { Switch } from "@vxengine/components/shadcn/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@vxengine/components/shadcn/alertDialog";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/store";
import { IStaticProps, ITrack } from "@vxengine/AnimationEngine/types/track";
import { Slider } from "@vxengine/components/shadcn/slider";
import { getNestedProperty } from "@vxengine/utils";
import { vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import { useObjectSettingsAPI } from "../stores/settingsStore";
import { invalidate } from "@react-three/fiber";
import { useUIManagerAPI } from "@vxengine/managers/UIManager/store";
import { DANGER_UseSplinePath } from "@vxengine/components/ui/DialogAlerts/Danger";

interface Props {
    vxobject: vxObjectProps
}

export const TransformProperties: React.FC<Props> = ({ vxobject }) => {
    const vxkey = vxobject.vxkey
    const disabledParams = vxobject.disabledParams;

    const settings = useObjectSettingsAPI(state => state.settings[vxkey])
    const additionalSettings = useObjectSettingsAPI(state => state.additionalSettings[vxkey])
    const toggleAdditionalSetting = useObjectSettingsAPI(state => state.toggleAdditionalSetting)

    const isUsingSplinePath = settings?.useSplinePath

    const isPositionDisabled = disabledParams?.includes("position") || isUsingSplinePath;
    const isRotationDisabled = disabledParams?.includes("rotation");
    const isScaleDisabled = disabledParams?.includes("scale");

    const isPanelDisabled = isPositionDisabled && isRotationDisabled && isScaleDisabled

    if (isPanelDisabled) return;

    const renderInputs = (property, disabled = false) => {
        return ['x', 'y', 'z'].map((axis) => (
            <PropInput
                vxkey={vxkey}
                key={`${property}-${axis}`}
                type="number"
                propertyPath={`${property}.${axis}`}
                horizontal={true}
                disabled={disabled}
            />
        ));
    };

    return (
        <CollapsiblePanel
            title="Transform"
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
                    <p className="text-xs font-light text-neutral-500" >position</p>
                    <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                        {renderInputs('position', isPositionDisabled)}
                    </div>
                </div>

                <div className='flex flex-row'>
                    <p className="text-xs font-light text-neutral-500">scale</p>
                    <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                        {renderInputs('scale', isScaleDisabled)}
                    </div>
                </div>

                <div className='flex flex-row gap-2'>
                    <p className="text-xs font-light text-neutral-500">rotation</p>
                    <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                        {renderInputs('rotation', isRotationDisabled)}
                    </div>
                </div>
                {additionalSettings && <>
                    {"showPositionPath" in additionalSettings && !isUsingSplinePath && (
                        <div className="flex flex-row mb-1">
                            <p className="text-xs font-light text-neutral-500">show postion path</p>
                            <Switch
                                onClick={() => toggleAdditionalSetting(vxkey, "showPositionPath")}
                                checked={additionalSettings["showPositionPath"]}
                                className='ml-auto my-auto scale-[80%]'
                            />
                        </div>
                    )}

                    {/* Other additional settings */}

                </>
                }
                {settings && <>
                    {"useSplinePath" in settings && <>
                        <BTN_useSplinePath vxkey={vxkey} />

                    </>}
                </>}
            </div>
        </CollapsiblePanel>
    );
}


const BTN_useSplinePath = React.memo(({ vxkey }: any) => {
    const settings = useObjectSettingsAPI(state => state.settings[vxkey])
    const pushDialog = useUIManagerAPI(state => state.pushDialog);

    const handleSwitchToggle = () => {
        pushDialog(<DANGER_UseSplinePath objVxKey={vxkey} isUsingSplinePath={settings["useSplinePath"]} /> , "danger")
    }

    return (
        <div className="flex flex-row mb-1">
            <p className="text-xs font-light text-neutral-500">use spline path</p>
            <Switch
                onClick={handleSwitchToggle}
                checked={settings["useSplinePath"]}
                className='ml-auto my-auto scale-[80%]'
            />
        </div>
    )
})


