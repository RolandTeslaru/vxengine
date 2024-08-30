import React, { useEffect, useState } from 'react'
import { Input, InputProps } from '../shadcn/input'
import KeyframeControl from './KeyframeControl'
import { useObjectManagerStore, useObjectPropertyStore } from 'vxengine/managers/ObjectManager/store'
import { getNestedProperty, setNestedProperty } from 'vxengine/utils/nestedProperty'

interface Props extends InputProps {
    propertyPath: string
    horizontal?: boolean
}
export const PropInput: React.FC<Props> = (props) => {
    const { propertyPath, className, horizontal, ...restProps } = props
    const vxkey = useObjectManagerStore(state => state.selectedObjects[0].vxkey);
    const firstObjectSelectedStored = useObjectManagerStore(state => state.selectedObjects[0]);
    const firstObjectSelected = firstObjectSelectedStored?.ref.current;

    const [value, setValue] = useState(
        getNestedProperty(useObjectPropertyStore.getState().properties[vxkey], propertyPath)
        || getNestedProperty(firstObjectSelected, propertyPath)
    );

    useEffect(() => {
        const currentProperties = useObjectPropertyStore.getState().properties;

        // Check if the property is tracked before subscribing
        const isPropertyTracked = getNestedProperty(currentProperties[vxkey], propertyPath) !== undefined;

        if (!isPropertyTracked) {
            // Optionally, track the property here
            console.log(`Property ${propertyPath} is not tracked. Skipping subscription.`);
            return; // Exit early if the property isn't tracked
        }

        const unsubscribe = useObjectPropertyStore.subscribe((state, prevState) => {
            const newValue = getNestedProperty(state.properties[vxkey], propertyPath);
            const prevValue = getNestedProperty(prevState.properties[vxkey], propertyPath);

            if (newValue !== prevValue) {
                setValue(newValue);
            }
        });

        return () => unsubscribe();
    }, [vxkey, propertyPath]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value);
        const currentProperties = useObjectPropertyStore.getState().properties;
        const isPropertyTracked = getNestedProperty(currentProperties[vxkey], propertyPath) !== undefined;

        setNestedProperty(firstObjectSelected, propertyPath, newValue);
        useObjectPropertyStore.getState().updateProperty(vxkey, propertyPath, newValue);
        setValue(newValue);
    };

    return (
        <div className={`flex gap-1 ${horizontal ? "flex-col-reverse" : "flex-row"} ` + className}>
            <div className={horizontal ? "w-auto mx-auto" : "h-auto my-auto"}>
                <KeyframeControl propertyPath={propertyPath} value={value} />
            </div>
            <Input
                value={value}
                onChange={handleChange}
                className="h-fit border-none text-xs bg-neutral-800 p-0.5 max-w-10"
                {...restProps}
            />
        </div>
    )
}

export default PropInput
