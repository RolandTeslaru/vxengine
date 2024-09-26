import React, { useEffect, useMemo, useState } from 'react'
import { Input, InputProps } from '../shadcn/input'
import KeyframeControl from './KeyframeControl'
import { useObjectManagerStore, useObjectPropertyStore } from '@vxengine/managers/ObjectManager/store'
import { getNestedProperty, setNestedProperty } from '@vxengine/utils/nestedProperty'
import { shallow } from 'zustand/shallow'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/store'

interface Props extends InputProps {
    propertyPath: string
    horizontal?: boolean
}
export const PropInput: React.FC<Props> = (props) => {
    const { propertyPath, className, horizontal, ...inputProps } = props
    const vxkey = useObjectManagerStore(state => state.selectedObjects[0]?.vxkey, shallow);
    const trackKey = vxkey + "." + propertyPath
    
    const track = useTimelineEditorAPI(state => state.getTrack(trackKey))

    return (
        <div className={`flex ${horizontal ? "flex-col-reverse gap-1" : "flex-row gap-2"} ` + className}>
            <div className={horizontal ? "w-auto mx-auto" : "h-auto my-auto"}>
                <KeyframeControl 
                    trackKey={trackKey}
                />
            </div>
            <ValueRenderer 
                propertyPath={propertyPath} 
                inputProps={inputProps} 
                isPropertyTracked={!!track}
            />
        </div>
    )
}

interface ValueRendererProps {
    propertyPath: string
    inputProps: React.InputHTMLAttributes<HTMLInputElement>
    isPropertyTracked: boolean
}

const ValueRenderer: React.FC<ValueRendererProps> = ({ propertyPath, inputProps, isPropertyTracked }) => {
    const vxkey = useObjectManagerStore(state => state.selectedObjects[0].vxkey, shallow);
    const firstObjectSelectedStored = useObjectManagerStore(state => state.selectedObjects[0], shallow);
    const firstObjectSelected = firstObjectSelectedStored?.ref.current;
    const editorObjects = useTimelineEditorAPI(state => state.editorObjects, shallow);

    const [value, setValue] = useState(
        getNestedProperty(useObjectPropertyStore.getState().properties[vxkey], propertyPath)
        || getNestedProperty(firstObjectSelected, propertyPath)
    );

    useEffect(() => {
        if (!isPropertyTracked) {
            // console.log(`Property ${propertyPath} is not tracked. Skipping subscription.`);
            setValue(getNestedProperty(firstObjectSelected, propertyPath))
            return;
        }

        const unsubscribe = useObjectPropertyStore.subscribe((state, prevState) => {
            const newValue = getNestedProperty(state.properties[vxkey], propertyPath);
            const prevValue = getNestedProperty(prevState.properties[vxkey], propertyPath);

            if (newValue !== prevValue) {
                setValue(newValue);
            }
        });

        return () => unsubscribe();
    }, [vxkey, propertyPath, isPropertyTracked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value);
        useTimelineEditorAPI.getState().handlePropertyValueChange(vxkey, propertyPath, newValue)
        setValue(newValue);
    };

    return (
        <Input
            value={value}
            onChange={handleChange}
            className="h-fit border-none text-[10px] bg-neutral-800 p-0.5 max-w-10"
            {...inputProps}
        />
    )
}

export default PropInput