import React, { useEffect } from "react";
import { useObjectManagerStore, useObjectPropertyStore } from "../store";
import { shallow } from "zustand/shallow";
import CollapsiblePanel from "vxengine/components/ui/CollapsiblePanel";
import PropInput from "vxengine/components/ui/PropInput";
import { Switch } from "vxengine/components/shadcn/switch";
import { useVXObjectStore } from "vxengine/vxobject";

export const TransformProperties = () => {
    const firstObjectSelectedStored = useObjectManagerStore((state) => state.selectedObjects[0]);
    const vxkey = firstObjectSelectedStored.vxkey
    const settings = useVXObjectStore(state => state.objects[vxkey].settings)
    const toggleObjectSetting = useVXObjectStore(state => state.toggleObjectSetting)

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

    useEffect(() => {
        console.log("TransformProperties first obejct", firstObjectSelectedStored, "  with settings ", settings)
    }, [settings])

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
                        <p>Position</p>
                        <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                            {renderInputs('position')}
                        </div>
                    </div>

                    <div className='flex flex-row'>
                        <p>Scale</p>
                        <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                            {renderInputs('scale')}
                        </div>
                    </div>

                    <div className='flex flex-row gap-2'>
                        <p>Rotation</p>
                        <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                            {renderInputs('rotation')}
                        </div>
                    </div>
                    {settings && (
                        "showPositionPath" in settings && (
                            <div className="flex flex-row mb-1">
                                <p>Show postion path</p>
                                <Switch
                                    onClick={() => toggleObjectSetting(vxkey, "showPositionPath")}
                                    value={settings["showPositionPath"]}
                                    checked={settings["showPositionPath"]}
                                    className='ml-auto my-auto scale-[80%]'
                                />
                            </div>
                        )
                    )}
                </div>
            </CollapsiblePanel>
    );
};
