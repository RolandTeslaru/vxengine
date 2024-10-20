import React, { useEffect, useMemo, useState } from 'react'
import { useObjectManagerAPI, useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/store'
import { getNestedProperty, setNestedProperty } from '@vxengine/utils/nestedProperty'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/store'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@vxengine/components/shadcn/alertDialog';
import { Input, InputProps } from '@vxengine/components/shadcn/input'
import KeyframeControl from '../KeyframeControl'
import PropInputContextMenu from './contextMenu'
import { ContextMenu, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';


interface Props extends InputProps {
    propertyPath: string
    horizontal?: boolean
}
export const PropInput: React.FC<Props> = (props) => {
    const { propertyPath, className, horizontal, ...inputProps } = props
    const disabled = props.disabled ? props.disabled : false;
    const vxkey = useObjectManagerAPI(state => state.selectedObjects[0]?.vxkey);
    const trackKey = vxkey + "." + propertyPath

    const isPropertyTracked = useTimelineEditorAPI(state => !!state.tracks[trackKey])

    return (
        <ContextMenu>
            <ContextMenuTrigger className={className}>
                <div className={`flex ${horizontal ? "flex-col-reverse gap-1" : "flex-row gap-2"} `}>
                    <div className={horizontal ? "w-auto mx-auto" : "h-auto my-auto"}>
                        <KeyframeControl
                            trackKey={trackKey}
                            disabled={disabled}
                        />
                    </div>
                    <ValueRenderer
                        propertyPath={propertyPath}
                        inputProps={inputProps}
                        isPropertyTracked={isPropertyTracked}
                    />
                </div>
            </ContextMenuTrigger>
            <PropInputContextMenu vxkey={vxkey} propertyPath={propertyPath}/>
        </ContextMenu>
    )
}

export default PropInput

interface ValueRendererProps {
    propertyPath: string
    inputProps: React.InputHTMLAttributes<HTMLInputElement>
    isPropertyTracked: boolean
}

const ValueRenderer: React.FC<ValueRendererProps> = React.memo(({ propertyPath, inputProps, isPropertyTracked }) => {
    const vxkey = useObjectManagerAPI(state => state.selectedObjects[0].vxkey);
    const firstObjectSelectedStored = useObjectManagerAPI(state => state.selectedObjects[0]);
    const firstObjectSelected = firstObjectSelectedStored?.ref.current;

    const [value, setValue] = useState(
        getNestedProperty(useObjectPropertyAPI.getState().properties[vxkey], propertyPath)
        || getNestedProperty(firstObjectSelected, propertyPath)
    );

    // This trigger when the first object selected is changed
    useEffect(() => {
        setValue(
            getNestedProperty(useObjectPropertyAPI.getState().properties[vxkey], propertyPath)
            || getNestedProperty(firstObjectSelected, propertyPath)
        )
    }, [firstObjectSelectedStored.vxkey])

    useEffect(() => {
        const unsubscribe = useObjectPropertyAPI.subscribe((state, prevState) => {
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
})
