import React, { useEffect, useMemo, useRef, useState, FC, memo } from 'react'
import { useObjectManagerAPI, useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/store'
import { getNestedProperty, setNestedProperty } from '@vxengine/utils/nestedProperty'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/store'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@vxengine/components/shadcn/alertDialog';
import { Input, InputProps } from '@vxengine/components/shadcn/input'
import KeyframeControl from '../KeyframeControl'
import PropInputContextMenu from './contextMenu'
import { ContextMenu, ContextMenuTrigger } from '@vxengine/components/shadcn/contextMenu';
import { vxKeyframeNodeProps, vxSplineNodeProps } from '@vxengine/types/objectStore';
import { useSplineManagerAPI } from '@vxengine/managers/SplineManager/store';
import * as THREE from "three"

interface Props extends InputProps {
    propertyPath: string
    horizontal?: boolean
    disableTracking?: boolean
}
export const PropInput: FC<Props> = (props) => {
    const { propertyPath, className, horizontal, disableTracking = false, ...inputProps } = props
    const disabled = props.disabled ? props.disabled : false;
    const vxkey = useObjectManagerAPI(state => state.selectedObjects[0]?.vxkey);
    const trackKey = vxkey + "." + propertyPath

    const isPropertyTracked = useTimelineEditorAPI(state => !!state.tracks[trackKey])

    return (
        <ContextMenu>
            <ContextMenuTrigger className={className}>
                <div className={`flex ${horizontal ? "flex-col-reverse gap-1" : "flex-row gap-2"} `}>
                    <div className={(horizontal ? "w-auto mx-auto" : "h-auto my-auto")}>
                        <KeyframeControl
                            trackKey={trackKey}
                            disabled={disabled || disableTracking}
                        />
                    </div>
                    <ValueRenderer
                        propertyPath={propertyPath}
                        inputProps={inputProps}
                        isPropertyTracked={isPropertyTracked}
                    />
                </div>
            </ContextMenuTrigger>
            <PropInputContextMenu vxkey={vxkey} propertyPath={propertyPath} />
        </ContextMenu>
    )
}

export default PropInput

interface ValueRendererProps {
    propertyPath: string
    inputProps: React.InputHTMLAttributes<HTMLInputElement>
    isPropertyTracked: boolean
}

const ValueRenderer: FC<ValueRendererProps> = memo(
    ({ propertyPath, inputProps, isPropertyTracked }) => {
        const vxkey = useObjectManagerAPI((state) => state.selectedObjects[0].vxkey);
        const firstObjectSelected = useObjectManagerAPI((state) => state.selectedObjects[0]);
        const firstObjectSelectedRef = firstObjectSelected?.ref.current;

        const getDefaultValue = () => {
            const val =
                getNestedProperty(
                    useObjectPropertyAPI.getState().properties[vxkey],
                    propertyPath
                ) || getNestedProperty(firstObjectSelectedRef, propertyPath);

            return val;
        };

        const vxType = firstObjectSelected.type;
        const inputRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            if(!inputRef.current.value)
                inputRef.current.value = getDefaultValue();
            const unsubscribe = useObjectPropertyAPI.subscribe((state, prevState) => {
                const newValue = getNestedProperty(state.properties[vxkey], propertyPath);
                const prevValue = getNestedProperty(prevState.properties[vxkey], propertyPath);

                if (newValue !== prevValue && inputRef.current && inputRef.current.value !== newValue) {
                        inputRef.current.value = newValue;
                }
            });

            return () => unsubscribe();
        }, [vxkey, propertyPath, isPropertyTracked]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = parseFloat(e.target.value);
            switch (vxType) {
                case "entity": {
                    handleEntityChange(newValue);
                    break;
                }
                case "splineNode": {
                    handleSplineNodeChange(newValue);
                    break;
                }
            }
        };

        const handleEntityChange = (newValue: number) => {
            useTimelineEditorAPI
                .getState()
                .handlePropertyValueChange(vxkey, propertyPath, newValue);
        };

        const handleSplineNodeChange = (newValue: number) => {
            const axis = propertyPath.slice(-1); // Assuming propertyPath ends with 'x', 'y', or 'z'
            const nodeIndex = (firstObjectSelected as vxSplineNodeProps).index;
            const splineKey = (firstObjectSelected as vxSplineNodeProps).splineKey;

            useSplineManagerAPI
                .getState()
                .changeSplineNodeAxisValue(splineKey, nodeIndex, newValue, axis as "x" | "y" | "z");
        };

        
        return (
            <Input
                ref={inputRef}
                // value={getDefaultValue()} // Removed to make input uncontrolled
                onChange={handleChange}
                className="h-fit border-none text-[10px] bg-neutral-800 p-0.5 max-w-10"
                {...inputProps}
            />
        );
    }
);