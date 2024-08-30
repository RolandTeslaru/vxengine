import React from "react";
import { useObjectManagerStore, useObjectPropertyStore } from "../store";
import { shallow } from "zustand/shallow";
import CollapsiblePanel from "vxengine/components/ui/CollapsiblePanel";
import PropInput from "vxengine/components/ui/PropInput";

export const TransformProperties = () => {
    const firstObjectSelectedStored = useObjectManagerStore((state) => state.selectedObjects[0]);

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
        firstObjectSelectedStored?.ref.current && (
            <CollapsiblePanel
                title="Transform"
            >
                <div className='flex flex-row py-2'>
                    <p>Position</p>
                    <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                        {renderInputs('position')}
                    </div>
                </div>

                <div className='flex flex-row py-1'>
                    <p>Scale</p>
                    <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                        {renderInputs('scale')}
                    </div>
                </div>

                <div className='flex flex-row gap-2 py-1'>
                    <p>Rotation</p>
                    <div className='flex flex-row gap-1 max-w-36 ml-auto'>
                        {renderInputs('rotation')}
                    </div>
                </div>
            </CollapsiblePanel>
        )
    );
};
