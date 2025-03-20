import React, { useRef, FC, memo, useCallback, useLayoutEffect } from 'react'
import { getProperty, useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/stores/managerStore'
import { getNestedProperty } from '@vxengine/utils/nestedProperty'
import { modifyPropertyValue } from '@vxengine/managers/TimelineManager/store'
import { Input } from '@vxengine/components/shadcn/input'
import { invalidate } from '@react-three/fiber'

interface ValueRendererProps {
    vxkey: string
    vxRefObj: React.RefObject<any>
    param: { propertyPath: string }
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>
    onChange?: (newValue: number) => void;
}

const getDefaultValue = (vxkey: string, propertyPath: string, obj: any) => getProperty(vxkey,propertyPath) || getNestedProperty(obj, propertyPath) || 0

const ValueRenderer: FC<ValueRendererProps> = memo(
    ({ vxkey, param, inputProps, onChange, vxRefObj}) => {
        const { propertyPath } = param;
        // Always use the vxkey and NOT vxobject.vxkey because the vxkey prop can be overwritten (for good reasons)
        const trackKey = `${vxkey}.${propertyPath}`
        
        const inputRef = useRef<HTMLInputElement>(null);
        
        useLayoutEffect(() => {
            inputRef.current.value = getDefaultValue(vxkey, propertyPath, vxRefObj.current);
            
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
        }, [vxkey]);

        return (
            <Input
                ref={inputRef}
                onChange={handleChange}
                type='number'
                step={0.1}
                className="h-fit text-[10px] bg-secondary-opaque p-0.5 max-w-[40px] border border-primary-thin"
                {...inputProps}
            />
        );
    }
);

export default ValueRenderer
