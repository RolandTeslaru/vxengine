import React, { useRef, FC, memo, useCallback, useLayoutEffect } from 'react'
import { getProperty, useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/stores/managerStore'
import { getNestedProperty } from '@vxengine/utils/nestedProperty'
import { Input } from '@vxengine/components/shadcn/input'
import { invalidate } from '@react-three/fiber'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../shadcn/contextMenu'
import { useClipboardManagerAPI } from '@vxengine/managers/ClipboardManager/store'
import animationEngineInstance from '@vxengine/singleton'

interface ValueRendererProps {
    vxkey: string
    vxRefObj: React.RefObject<any>
    param: { propertyPath: string }
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>
    onChange?: (newValue: number) => void;
}

const getDefaultValue = (vxkey: string, propertyPath: string, obj: any) => getProperty(vxkey, propertyPath) ?? getNestedProperty(obj, propertyPath) ?? 0

const ValueRenderer: FC<ValueRendererProps> = memo(
    ({ vxkey, param, inputProps, onChange, vxRefObj }) => {
        const { propertyPath } = param;
        // Always use the vxkey and NOT vxobject.vxkey because the vxkey prop can be overwritten (for good reasons)
        const trackKey = `${vxkey}.${propertyPath}`
        const addItemToClipboard = useClipboardManagerAPI(state => state.addItem);

        const inputRef = useRef<HTMLInputElement>(null);

        useLayoutEffect(() => {
            inputRef.current.value = getDefaultValue(vxkey, propertyPath, vxRefObj.current);

            const unsubscribe = useObjectPropertyAPI.subscribe((state, prevState) => {
                const newValue = state.properties[trackKey];

                if (inputRef.current && newValue) {
                    if (newValue.toString() !== inputRef.current.value) {
                        inputRef.current.value = newValue.toString()
                    }
                }
            });

            return () => unsubscribe();
        }, [vxkey, propertyPath]);

        const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = parseFloat(e.target.value);

            if (onChange) {
                onChange(newValue);
            } else
                animationEngineInstance.modifyParam("press", vxkey, propertyPath, newValue,true);
        }, [vxkey]);

        const handleOnCopy = useCallback(() => {
            addItemToClipboard('number', {
                data: parseFloat(inputRef.current.value)
            })
        }, [vxkey])

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


const ValureRendererContextMenu = ({ inputRef, vxkey, propertyPath }: { inputRef: React.RefObject<HTMLInputElement>, vxkey: string, propertyPath: string }) => {
    const isNumberInClipboard = useClipboardManagerAPI(state => state.items.has("number"))

    const handleOnCopy = () => {
        useClipboardManagerAPI.getState().addItem("number", parseFloat(inputRef.current.value))
    }

    const handleOnPaste = () => {
        const value = useClipboardManagerAPI.getState().getItemByType("number") as number
        animationEngineInstance.modifyParam("press", vxkey, propertyPath, value);

        inputRef.current.value = value.toString();
    }

    return (
        <ContextMenuContent>
            <ContextMenuItem onClick={handleOnCopy}>
                Copy Value
            </ContextMenuItem>
            {isNumberInClipboard &&
                <ContextMenuItem onClick={handleOnPaste}>
                    Paste Value
                </ContextMenuItem>
            }
        </ContextMenuContent>
    )
}
