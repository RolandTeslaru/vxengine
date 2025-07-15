import React, { useMemo, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Button } from '@vxengine/ui/foundations';
import { useObjectManagerAPI } from '../stores/managerStore';
import { Globe, Move, RefreshCcw } from '@vxengine/ui/icons';
import { useVXObjectStore } from '../stores/objectStore';
import Search from '@vxengine/ui/components/Search';
import { ObjectManagerService } from '../service';

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
                        <Move className='h-[22px]' />
                        Translate
                    </TabsTrigger>
                    <TabsTrigger
                        value="rotate"
                        onClick={() => setTransformMode("rotate")}
                        className='gap-2'
                    >
                        <RefreshCcw className='h-[22px] scale-75' />
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
                        <Globe className='h-[22px]' />
                        World
                    </TabsTrigger>
                    <TabsTrigger
                        value="local"
                        onClick={() => setTransformSpace("local")}
                        className='gap-2'
                    >
                        <svg width="22" height="22" className="scale-75" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.28856 0.796908C7.42258 0.734364 7.57742 0.734364 7.71144 0.796908L13.7114 3.59691C13.8875 3.67906 14 3.85574 14 4.05V10.95C14 11.1443 13.8875 11.3209 13.7114 11.4031L7.71144 14.2031C7.57742 14.2656 7.42258 14.2656 7.28856 14.2031L1.28856 11.4031C1.11252 11.3209 1 11.1443 1 10.95V4.05C1 3.85574 1.11252 3.67906 1.28856 3.59691L7.28856 0.796908ZM2 4.80578L7 6.93078V12.9649L2 10.6316V4.80578ZM8 12.9649L13 10.6316V4.80578L8 6.93078V12.9649ZM7.5 6.05672L12.2719 4.02866L7.5 1.80176L2.72809 4.02866L7.5 6.05672Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        Local
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </>
    )
}


export const DIALOG_addObjectToTree = () => {
    const objectsMap = useVXObjectStore(state => state.objects);

    const [searchQuery, setSearchQuery] = useState();

    // derive your array exactly when the map itself changes
    const vxobjectsFlatMap = useMemo(
        () => Object.values(objectsMap),
        [objectsMap]
    );

    const [selected, setSelected] = useState<Set<string>>(new Set());

    const filteredVxobjectsFlatMap = useMemo(() => {
        if (!searchQuery) return vxobjectsFlatMap;

        // @ts-expect-error
        const q = searchQuery.toLowerCase();
        return vxobjectsFlatMap.filter((obj) => {
            return obj.vxkey.toLowerCase().includes(q) || obj.name?.toLowerCase().includes(q);
        });
    }, [searchQuery, vxobjectsFlatMap]);

    return (
        <>
            <DialogHeader>
                <DialogTitle>Add Object To Tree</DialogTitle>
            </DialogHeader>
            <div className='font-roboto-mono text-xs font-medium flex flex-col gap-2 '>

                <div className='flex flex-row justify-between'>
                    <p className='font-roboto-mono'>{vxobjectsFlatMap.length} objects <span className='text-blue-500'>{selected.size} selected</span></p>
                    <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery}></Search>
                </div>
                <div className='max-h-[300px] min-h-[300px] min-w-[300px] overflow-y-scroll flex flex-col gap-1'>
                    {filteredVxobjectsFlatMap.map(vxobj =>
                        <div className={`cursor-pointer flex flex-row gap-2 justify-between w-full bg-tertiary-opaque hover:bg-blue-600/30 ${selected.has(vxobj.vxkey) && "!bg-blue-600"} p-1 rounded-md transition-all duration-75`}
                            onClick={() => {
                                setSelected((prevSet) => {
                                    if (prevSet.has(vxobj.vxkey)) {
                                        const newSet = new Set(prevSet);
                                        newSet.delete(vxobj.vxkey)
                                        return newSet
                                    }
                                    else
                                        return new Set([...prevSet, vxobj.vxkey])
                                }
                                )
                            }}
                        >
                            <p className=''>
                                {vxobj.name}
                            </p>
                            <p>{vxobj.vxkey}</p>
                        </div>
                    )}
                </div>
            </div>
            <Button
                onClick={() => {
                    selected.forEach(vxkey => {
                        ObjectManagerService.objectManagerState.addToTree(objectsMap[vxkey])
                    })
                }}
            >Add To Tree</Button>
        </>
    )
}

export const DIALOG_removeObjectFromTree = () => {

}

export const DIALOG_reattachTreeNode = () => {
    const objectsMap = useVXObjectStore(state => state.objects);

    const [searchQuery, setSearchQuery] = useState();

    // derive your array exactly when the map itself changes
    const vxobjectsFlatMap = useMemo(
        () => Object.values(objectsMap),
        [objectsMap]
    );

    const [selected, setSelected] = useState<Set<string>>(new Set());

    const filteredVxobjectsFlatMap = useMemo(() => {
        if (!searchQuery) return vxobjectsFlatMap;

        // @ts-expect-error
        const q = searchQuery.toLowerCase();
        return vxobjectsFlatMap.filter((obj) => {
            return obj.vxkey.toLowerCase().includes(q) || obj.name?.toLowerCase().includes(q);
        });
    }, [searchQuery, vxobjectsFlatMap]);

    return (
        <>
            <DialogHeader>
                <DialogTitle>Reattach Tree Node</DialogTitle>
            </DialogHeader>
            <div className='font-roboto-mono text-xs font-medium flex flex-col gap-2 '>

                <div className='flex flex-row justify-between'>
                    <p className='font-roboto-mono'>{vxobjectsFlatMap.length} objects <span className='text-blue-500'>{selected.size} selected</span></p>
                    <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery}></Search>
                </div>
                <div className='max-h-[300px] min-h-[300px] min-w-[300px] overflow-y-scroll flex flex-col gap-1'>
                    {filteredVxobjectsFlatMap.map(vxobj =>
                        <div className={`cursor-pointer flex flex-row gap-2 justify-between w-full bg-tertiary-opaque hover:bg-blue-600/30 ${selected.has(vxobj.vxkey) && "!bg-blue-600"} p-1 rounded-md transition-all duration-75`}
                            onClick={() => {
                                setSelected((prevSet) => {
                                    if (prevSet.has(vxobj.vxkey)) {
                                        const newSet = new Set(prevSet);
                                        newSet.delete(vxobj.vxkey)
                                        return newSet
                                    }
                                    else
                                        return new Set([...prevSet, vxobj.vxkey])
                                }
                                )
                            }}
                        >
                            <p className=''>
                                {vxobj.name}
                            </p>
                            <p>{vxobj.vxkey}</p>
                        </div>
                    )}
                </div>
            </div>
            <Button
                onClick={() => {
                    selected.forEach(vxkey => {
                        ObjectManagerService.objectManagerState.reattachTreeNode(vxkey)
                    })
                }}
            >Reattach To Tree</Button>
        </>
    )
}