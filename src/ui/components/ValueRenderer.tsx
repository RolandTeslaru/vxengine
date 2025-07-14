import React, { useRef, FC, memo, useCallback, useLayoutEffect } from 'react'
import { useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/stores/managerStore'
import animationEngineInstance from '@vxengine/singleton'
import { Input } from '../foundations/input'
import { getDefaultParamValue } from './ParamInput/utils'

interface ValueRendererProps {
    vxkey: string
    vxRefObj: React.RefObject<any>
    param: { propertyPath: string }
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>
    onChange?: (newValue: number) => void;
}
const ValueRenderer: FC<ValueRendererProps> = memo(
    ({ vxkey, param: {propertyPath}, inputProps, onChange, vxRefObj }) => {
        // Always use the vxkey and NOT vxobject.vxkey because the vxkey prop can be overwritten (for good reasons)
        const trackKey = `${vxkey}.${propertyPath}`
        // const addItemToClipboard = useClipboardManagerAPI(state => state.addItem);

        const inputRef = useRef<HTMLInputElement>(null);

        const isSetterResolved = animationEngineInstance
                                .propertyControlService
                                .isSetterResolved(vxkey, propertyPath);

        useLayoutEffect(() => {    
            inputRef.current.value = getDefaultParamValue(vxkey, propertyPath, vxRefObj.current);

            const unsubscribe = useObjectPropertyAPI.subscribe((state, prevState) => {
                const newValue = state.properties[trackKey];

                if (inputRef.current && newValue)
                    if (newValue.toString() !== inputRef.current.value)
                        inputRef.current.value = newValue.toString()
            });

            return () => unsubscribe();
        }, [vxkey, propertyPath]);

        const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = parseFloat(e.target.value);

            if (onChange)
                onChange(newValue);
            else
                animationEngineInstance
                    .paramModifierService
                    .modifyParamValue(vxkey, propertyPath, newValue, true)
                    .flushTimelineStateUpdates()
        }, [vxkey, onChange, propertyPath]);

        // const handleOnCopy = useCallback(() => {
        //     addItemToClipboard('number', {
        //         data: parseFloat(inputRef.current.value)
        //     })
        // }, [vxkey])

        return (
            <Input
                ref={inputRef}
                onChange={handleChange}
                type='number'
                step={0.1}
                className={`h-fit text-[10px] bg-secondary-opaque p-0.5 max-w-[40px] border ${isSetterResolved ? "border-primary-thin" : "border-red-600"} `}
                {...inputProps}
            />
        );
    }
);

export default ValueRenderer