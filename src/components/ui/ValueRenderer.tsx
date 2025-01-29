import React, { useEffect, useMemo, useRef, useState, FC, memo, useCallback, useLayoutEffect } from 'react'
import { getProperty, useObjectManagerAPI, useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/stores/managerStore'
import { getNestedProperty } from '@vxengine/utils/nestedProperty'
import { handlePropertyValueChange, useTimelineManagerAPI } from '@vxengine/managers/TimelineManager/store'
import { Input, InputProps } from '@vxengine/components/shadcn/input'
import { vxKeyframeNodeProps, vxObjectProps, vxSplineNodeProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { invalidate } from '@react-three/fiber'
import { ContextMenu } from '../shadcn/contextMenu'

interface ValueRendererProps {
    vxObject: vxObjectProps
    vxkey: string
    propertyPath: string
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

const getDefaultValue = (vxkey: string, propertyPath: string, ref: any) => getProperty(vxkey,propertyPath) || getNestedProperty(ref, propertyPath) || 0

const ValueRenderer: FC<ValueRendererProps> = memo(
    ({ vxObject, vxkey, propertyPath, inputProps}) => {
        // Always use the vxkey and NOT vxobject.vxkey because the vxkey prop can be overwritten (for good reasons)
        const trackKey = `${vxkey}.${propertyPath}`
        const ref = vxObject.ref.current;
        
        const inputRef = useRef<HTMLInputElement>(null);
        
        useLayoutEffect(() => {
            inputRef.current.value = getDefaultValue(vxkey, propertyPath, ref);
            
            const unsubscribe = useObjectPropertyAPI.subscribe((state, prevState) => {
                const newValue = state.properties[trackKey];

                if(inputRef.current && newValue){
                    if(newValue.toString() !== inputRef.current.value){
                        inputRef.current.value = newValue.toString()
                    }
                }
            });

            return () => unsubscribe();
        }, [vxkey, propertyPath]);

        const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = parseFloat(e.target.value);
            handlePropertyValueChange(vxkey, propertyPath, newValue);

            invalidate();
        }, [vxObject]);
 
        const handleSplineNodeChange = useCallback((newValue: number) => {
            const axis = propertyPath.slice(-1); // propertyPath ends with 'x', 'y', or 'z'
            const nodeIndex = (vxObject as vxSplineNodeProps).index;
            const splineKey = (vxObject as vxSplineNodeProps).splineKey;

            // useSplineManagerAPI
            //     .getState()
            //     .changeSplineNodeAxisValue(splineKey, nodeIndex, newValue, axis as "x" | "y" | "z");
        }, [vxObject]);

        return (
            <Input
                ref={inputRef}
                onChange={handleChange}
                type='number'
                className="h-fit text-[10px] bg-neutral-800 p-0.5 max-w-[40px] border border-neutral-700"
                {...inputProps}
                style={{ boxShadow: "1px 1px 5px 1px rgba(1,1,1,0.2)" }}
            />
        );
    }
);

export default ValueRenderer
