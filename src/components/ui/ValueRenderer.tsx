import React, { useEffect, useMemo, useRef, useState, FC, memo, useCallback, useLayoutEffect } from 'react'
import { getProperty, useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/stores/managerStore'
import { getNestedProperty } from '@vxengine/utils/nestedProperty'
import { modifyPropertyValue } from '@vxengine/managers/TimelineManager/store'
import { Input, InputProps } from '@vxengine/components/shadcn/input'
import { vxKeyframeNodeProps, vxObjectProps, vxSplineNodeProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { invalidate } from '@react-three/fiber'
import { VXObjectParam } from '@vxengine/vxobject/types'

interface ValueRendererProps {
    vxObject: vxObjectProps
    vxkey: string
    param: { propertyPath: string }
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>
    onChange?: (newValue: number) => void;
}

const getDefaultValue = (vxkey: string, propertyPath: string, ref: any) => getProperty(vxkey,propertyPath) || getNestedProperty(ref, propertyPath) || 0

const ValueRenderer: FC<ValueRendererProps> = memo(
    ({ vxObject, vxkey, param, inputProps, onChange}) => {
        const { propertyPath } = param;
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

            if(onChange){
                onChange(newValue);
            }else {
                modifyPropertyValue("press", vxkey, propertyPath, newValue);
                invalidate();
            }
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
