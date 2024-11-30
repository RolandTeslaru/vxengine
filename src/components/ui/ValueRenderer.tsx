import React, { useEffect, useMemo, useRef, useState, FC, memo } from 'react'
import { useObjectManagerAPI, useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/stores/managerStore'
import { getNestedProperty } from '@vxengine/utils/nestedProperty'
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/store'
import { Input, InputProps } from '@vxengine/components/shadcn/input'
import { vxKeyframeNodeProps, vxSplineNodeProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { useSplineManagerAPI } from '@vxengine/managers/SplineManager/store';
import { invalidate } from '@react-three/fiber'


interface ValueRendererProps {
    propertyPath: string
    inputProps: React.InputHTMLAttributes<HTMLInputElement>
    isPropertyTracked: boolean
}

const ValueRenderer: FC<ValueRendererProps> = memo(
    ({ propertyPath, inputProps, isPropertyTracked }) => {
        const vxkey = useObjectManagerAPI((state) => state.selectedObjects[0].vxkey);
        const firstObjectSelected = useObjectManagerAPI((state) => state.selectedObjects[0]);
        const ref = firstObjectSelected?.ref.current;

        const getProperty = useObjectPropertyAPI((state) => state.getProperty);

        const getDefaultValue = () => {
            const val = getProperty(vxkey, propertyPath) || getNestedProperty(ref, propertyPath);

            return val;
        };

        const vxType = firstObjectSelected.type;
        const isEntity = vxType === "entity" || vxType === "virtualEntity"
        const inputRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            inputRef.current.value = getDefaultValue();
        }, [vxkey, propertyPath, isPropertyTracked])

        useEffect(() => {
            const unsubscribe = useObjectPropertyAPI.subscribe((state, prevState) => {
                const newValue = state.getProperty(vxkey, propertyPath);

                if(inputRef.current && newValue){
                    if(newValue.toString() !== inputRef.current.value){
                        inputRef.current.value = newValue.toString()
                    }
                }
            });

            return () => unsubscribe();
        }, [vxkey, propertyPath, isPropertyTracked]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = parseFloat(e.target.value);
            if (isEntity || vxType === "effect") {
                handleEntityChange(newValue);
            }
            else if (vxType === "splineNode") {
                handleSplineNodeChange(newValue);
            }

            invalidate();
        };

        const handleEntityChange = (newValue: number) => {
            useTimelineEditorAPI
                .getState()
                .handlePropertyValueChange(vxkey, propertyPath, newValue);
        };

        const handleSplineNodeChange = (newValue: number) => {
            const axis = propertyPath.slice(-1); // propertyPath ends with 'x', 'y', or 'z'
            const nodeIndex = (firstObjectSelected as vxSplineNodeProps).index;
            const splineKey = (firstObjectSelected as vxSplineNodeProps).splineKey;

            useSplineManagerAPI
                .getState()
                .changeSplineNodeAxisValue(splineKey, nodeIndex, newValue, axis as "x" | "y" | "z");
        };

        return (
            <div className="relative">
                <Input
                    ref={inputRef}
                    // value={getDefaultValue()} // Removed to make input uncontrolled
                    onChange={handleChange}
                    type='number'
                    className="h-fit border-none text-[10px] bg-neutral-800 p-0.5 max-w-[40px]"
                    {...inputProps}
                    style={{ boxShadow: "1px 1px 5px 1px rgba(1,1,1,0.2)" }}
                />

                {/* <div className="absolute top-1/2 right-0 transform -translate-y-1/2 h-5 flex flex-col space-y-0.5 bg-neutral-950">
                    <button type="button" className="text-gray-400 bg-blue-500 h-2 hover:text-white"
                        style={{ fontSize: 8 }}
                    >

                    </button>
                    <button type="button" className="text-gray-400 bg-blue-500 hover:text-white"
                    >
                        <svg width="10" height="10" viewBox="0 0 12 13" fill="currentColor">
                            <path d="M4 6H11L7.5 10.5L4 6Z" />
                        </svg>
                    </button>
                </div> */}
            </div >
        );
    }
);

export default ValueRenderer
