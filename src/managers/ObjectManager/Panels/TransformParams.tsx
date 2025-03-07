import React from "react";
import CollapsiblePanel from "@vxengine/core/components/CollapsiblePanel";
import ParamInput from "@vxengine/components/ui/ParamInput";
import { Switch } from "@vxengine/components/shadcn/switch";
import { vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import { useObjectSetting, useObjectSettingsAPI } from "../stores/settingsStore";
import SettingNode from "../components/SettingNode";

interface Props {
    vxobject: vxObjectProps
}

export const TransformParams: React.FC<Props> = ({ vxobject }) => {
    const vxkey = vxobject.vxkey
    const disabledParams = vxobject.disabledParams;

    const settings = useObjectSettingsAPI(state => state.settings[vxkey])
    const toggleSetting = useObjectSettingsAPI(state => state.toggleSetting);
    const isUsingSplinePath = useObjectSetting(vxkey, "useSplinePath")
    const isUsingRotationDegrees = useObjectSetting(vxkey, "useRotationDegrees");

    const isPositionDisabled = disabledParams?.includes("position") || isUsingSplinePath;
    const isRotationDisabled = disabledParams?.includes("rotation");
    const isScaleDisabled = disabledParams?.includes("scale");

    const isPanelDisabled = isPositionDisabled && isRotationDisabled && isScaleDisabled && !isUsingSplinePath

    if (isPanelDisabled) return;

    const renderInputs = (property, disabled = false) => {
        return ['x', 'y', 'z'].map((axis) => {
                const propertyPath = `${property}.${axis}`;
                if(vxobject.params.find(param => param.propertyPath === propertyPath))
                    return <ParamInput
                        vxObject={vxobject}
                        key={`${property}-${axis}`}
                        param={{ propertyPath: `${property}.${axis}`, type: "number" }}
                        horizontal={true}
                        disabled={disabled}
                    />
            
        })
    };

    return (
        <CollapsiblePanel
            title="Transform"
        >
            <div className="w-full h-auto flex flex-col gap-2">
                <div className="flex gap-1 flex-row ml-auto">
                    <p className="mx-[16.5px] font-semibold text-red-400"
                        style={{ textShadow: "#f87171 0px 0px 10px" }}
                    >x</p>
                    <p className="mx-[16.5px] font-semibold text-green-400"
                        style={{ textShadow: "#4ade80 0px 0px 10px" }}
                    >y</p>
                    <p className="mx-[16.5px] font-semibold text-blue-400"
                        style={{ textShadow: "#60a5fa 0px 0px 10px " }}
                    >z</p>
                </div>
                <div className='flex flex-row'>
                    <p className="text-xs font-light text-neutral-400" >position</p>
                    <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                        {renderInputs('position', isPositionDisabled)}
                    </div>
                </div>

                <div className='flex flex-row'>
                    <p className="text-xs font-light text-neutral-400">scale</p>
                    <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                        {renderInputs('scale', isScaleDisabled)}
                    </div>
                </div>

                {isUsingRotationDegrees ? 
                    <div className='flex flex-row gap-2'>
                        <p className="text-xs font-light text-neutral-400">rotation deg.</p>
                        <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                            {renderInputs('rotationDegrees', isRotationDisabled)}
                        </div>
                    </div>
                    :
                    <div className='flex flex-row gap-2'>
                        <p className="text-xs font-light text-neutral-400">rotation</p>
                        <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                            {renderInputs('rotation', isRotationDisabled)}
                        </div>
                    </div>
                }
                {"showPositionPath" in settings && (
                    <SettingNode 
                        vxkey={vxkey} 
                        settingKey="showPositionPath" 
                        setting={settings["showPositionPath"]} 
                        title={isUsingSplinePath ? "show spline path" : "show position path"}
                    />
                )}
            </div>
        </CollapsiblePanel>
    );
}