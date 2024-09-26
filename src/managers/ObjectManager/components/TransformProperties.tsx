import React, { useEffect } from "react";
import { useObjectManagerStore, useObjectPropertyStore } from "../store";
import { shallow } from "zustand/shallow";
import CollapsiblePanel from "@vxengine/components/ui/CollapsiblePanel";
import PropInput from "@vxengine/components/ui/PropInput";
import { Switch } from "@vxengine/components/shadcn/switch";
import { useVXObjectStore } from "@vxengine/vxobject";
import { useObjectSettingsStore } from "@vxengine/vxobject/ObjectSettingsStore";

export const TransformProperties = () => {
    const firstObjectSelectedStored = useObjectManagerStore((state) => state.selectedObjects[0]);
    const vxkey = firstObjectSelectedStored.vxkey


    useEffect(() => {
        console.log("Transorm Properties first object selecte ", firstObjectSelectedStored)
    }, [firstObjectSelectedStored])

    const settings = useObjectSettingsStore(state => state.settings[vxkey])
    const toggleSetting = useObjectSettingsStore(state => state.toggleSetting)

    const additionalSettings = useObjectSettingsStore(state => state.additionalSettings[vxkey])
    const toggleAdditionalSetting = useObjectSettingsStore(state => state.toggleAdditionalSetting)

    const renderInputs = (property) => {
        return ['x', 'y', 'z'].map((axis) => (
            <PropInput
                key={`${property}-${axis}`}
                type="number"
                propertyPath={`${property}.${axis}`}
                horizontal={true}
            />
        ));
    };

    return (
        <CollapsiblePanel
            title="Transform"
        >
            <div className="w-full h-auto flex flex-col gap-2">
                <div className="flex gap-1 flex-row ml-auto">
                    <p className="mx-[16.5px] text-red-400">x</p>
                    <p className="mx-[16.5px] text-green-400">y</p>
                    <p className="mx-[16.5px] text-blue-400">z</p>
                </div>
                <div className='flex flex-row'>
                    <p className="text-xs font-light">Position</p>
                    <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                        {renderInputs('position')}
                    </div>
                </div>

                <div className='flex flex-row'>
                    <p className="text-xs font-light">Scale</p>
                    <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                        {renderInputs('scale')}
                    </div>
                </div>

                <div className='flex flex-row gap-2'>
                    <p className="text-xs font-light">Rotation</p>
                    <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                        {renderInputs('rotation')}
                    </div>
                </div>
                {settings && <>
                    {"useSplinePath" in settings && (
                        <div className="flex flex-row mb-1">
                            <p className="text-xs font-light">Use Spline Path</p>
                            <Switch
                                onClick={() => toggleSetting(vxkey, "useSplinePath")}
                                checked={settings["useSplinePath"]}
                                className='ml-auto my-auto scale-[80%]'
                            />
                        </div>
                    )}
                </>}
                {additionalSettings && <>
                    {"showPositionPath" in additionalSettings && (
                        <div className="flex flex-row mb-1">
                            <p className="text-xs font-light">Show postion path</p>
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
            </div>
        </CollapsiblePanel>
    );
};
