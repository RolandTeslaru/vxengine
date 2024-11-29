import React from 'react'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@vxengine/components/shadcn/dialog';
import { Button } from '@vxengine/components/shadcn/button';
import { Input } from '@vxengine/components/shadcn/input';
import { Label } from '@vxengine/components/shadcn/Label';
import { Tabs, TabsList, TabsTrigger } from '@vxengine/components/shadcn/tabs';
import { useObjectManagerAPI } from '../stores/managerStore';
import Move from '@geist-ui/icons/move';
import RefreshCcw from '@geist-ui/icons/refreshCcw';
import Globe from '@geist-ui/icons/globe';

export const DIALOG_setTransformMode = () => {
    const transformMode = useObjectManagerAPI(state => state.transformMode);
    const setTransformMode = useObjectManagerAPI(state => state.setTransformMode);
    return (
        <>
            <DialogHeader>
                <DialogTitle>Set Transfrom Mode</DialogTitle>
                <DialogDescription>
                    {`useObjectManagerAPI.setTransformMode()`}
                </DialogDescription>
            </DialogHeader>
            <Tabs
                defaultValue={transformMode}
                className='mx-auto'
            >
                <TabsList>
                    <TabsTrigger
                        value="translate"
                        onClick={() => setTransformMode("translate")}
                        className='gap-2'
                    >
                        <Move className='scale-75' />
                        Translate
                    </TabsTrigger>
                    <TabsTrigger
                        value="rotate"
                        onClick={() => setTransformMode("rotate")}
                        className='gap-2'
                    >
                        <RefreshCcw className='scale-75' />
                        Rotate
                    </TabsTrigger>
                    <TabsTrigger
                        value="scale"
                        onClick={() => setTransformMode("scale")}
                        className='gap-2'
                    >
                        <svg width="22" height="22" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 3.04999C11.7485 3.04999 11.95 3.25146 11.95 3.49999V7.49999C11.95 7.74852 11.7485 7.94999 11.5 7.94999C11.2515 7.94999 11.05 7.74852 11.05 7.49999V4.58639L4.58638 11.05H7.49999C7.74852 11.05 7.94999 11.2515 7.94999 11.5C7.94999 11.7485 7.74852 11.95 7.49999 11.95L3.49999 11.95C3.38064 11.95 3.26618 11.9026 3.18179 11.8182C3.0974 11.7338 3.04999 11.6193 3.04999 11.5L3.04999 7.49999C3.04999 7.25146 3.25146 7.04999 3.49999 7.04999C3.74852 7.04999 3.94999 7.25146 3.94999 7.49999L3.94999 10.4136L10.4136 3.94999L7.49999 3.94999C7.25146 3.94999 7.04999 3.74852 7.04999 3.49999C7.04999 3.25146 7.25146 3.04999 7.49999 3.04999L11.5 3.04999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        Scale
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </>
    )
}
export const DIALOG_setTransformSpace = () => {
    const transformSpace = useObjectManagerAPI(state => state.transformSpace);
    const setTransformSpace = useObjectManagerAPI(state => state.setTransformSpace);
    return (
        <>
            <DialogHeader>
                <DialogTitle>Set Transfrom Space</DialogTitle>
                <DialogDescription>
                    {`useObjectManagerAPI.setTransformSpace()`}
                </DialogDescription>
            </DialogHeader>
            <Tabs
                defaultValue={transformSpace}
                className='mx-auto'
            >
                <TabsList>
                    <TabsTrigger
                        value="world"
                        onClick={() => setTransformSpace("world")}
                        className='gap-2'
                    >
                        <Globe className='scale-75' />
                        World
                    </TabsTrigger>
                    <TabsTrigger
                        value="local"
                        onClick={() => setTransformSpace("local")}
                        className='gap-2'
                    >
                        <svg width="24" height="24" className="scale-75" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.28856 0.796908C7.42258 0.734364 7.57742 0.734364 7.71144 0.796908L13.7114 3.59691C13.8875 3.67906 14 3.85574 14 4.05V10.95C14 11.1443 13.8875 11.3209 13.7114 11.4031L7.71144 14.2031C7.57742 14.2656 7.42258 14.2656 7.28856 14.2031L1.28856 11.4031C1.11252 11.3209 1 11.1443 1 10.95V4.05C1 3.85574 1.11252 3.67906 1.28856 3.59691L7.28856 0.796908ZM2 4.80578L7 6.93078V12.9649L2 10.6316V4.80578ZM8 12.9649L13 10.6316V4.80578L8 6.93078V12.9649ZM7.5 6.05672L12.2719 4.02866L7.5 1.80176L2.72809 4.02866L7.5 6.05672Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                        Local
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </>
    )
}