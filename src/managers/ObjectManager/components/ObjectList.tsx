import React, { useMemo, useState } from 'react'
import CollapsiblePanel from '@vxengine/components/ui/CollapsiblePanel'
import { useObjectManagerAPI } from '../stores/managerStore';
import { vxEntityProps, vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';
import { useVXObjectStore } from '@vxengine/managers/ObjectManager';
import { Virtuoso, VirtuosoGrid } from 'react-virtuoso';
import { useRefStore } from '@vxengine/utils';
import Search from '@vxengine/components/ui/Search';

const LIST_ITEM_HEIGHT = 34

const ObjectList = () => {
    const selectedObjectKeys = useObjectManagerAPI(state => state.selectedObjectKeys)
    const selectObjects = useObjectManagerAPI(state => state.selectObjects)
    const hoveredObject = useObjectManagerAPI(state => state.hoveredObject)

    const vxObjects = useVXObjectStore(state => state.objects)

    const [searchQuery, setSearchQuery] = useState("");
    const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

    const entityListRef = useRefStore(state => state.entityListRef);

    const vxEntities = useMemo(() => {
        const filteredRecord = Object.fromEntries(
            Object.entries(vxObjects)
                .filter(([key, vxObj]) => vxObj.type === "entity" && vxObj.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        return filteredRecord
    }, [vxObjects, searchQuery]);

    const handleObjectClick = (event, vxobject: vxObjectProps, index: number) => {
        event.preventDefault();

        // Convert objects to an array to get a slice
        const objectArray = Object.values(vxObjects);

        // Click + SHIFT key
        if (event.shiftKey && lastSelectedIndex !== null) {
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            const newSelectedObjectKeys = objectArray.slice(start, end + 1).map((obj: vxObjectProps) => obj.vxkey);
            selectObjects([...newSelectedObjectKeys, ...selectedObjectKeys]);
        }
        // Click + CTRL key ( command key on macOS )
        else if (event.metaKey || event.ctrlKey) {
            let newSelectedKeys: string[] = [];
            if (selectedObjectKeys.includes(vxobject.vxkey)) {
                newSelectedKeys = selectedObjectKeys.filter(key => key !== vxobject.vxkey);
            } else {
                newSelectedKeys = [...selectedObjectKeys, vxobject.vxkey];
            }
            selectObjects(newSelectedKeys);
        }
        // Click
        else {
            selectObjects([vxobject.vxkey]);
        }
        setLastSelectedIndex(index);
    };

    const itemRenderer = (index: number) => {
        const vxEntity = Object.values(vxEntities)[index];
        const vxkey = vxEntity.vxkey
        const isSelected = selectedObjectKeys?.includes(vxkey)
        const isHovered = hoveredObject?.vxkey === vxkey;

        return (
            <div
                className={`h-9 border mb-2 flex flex-row p-2 rounded-xl bg-neutral-800 border-neutral-700 cursor-pointer hover:bg-neutral-900
                            ${isSelected && `!bg-blue-600 !border-neutral-200 hover:!bg-blue-800`} 
                            ${isHovered && `bg-neutral-900`}
                            ${isHovered && isSelected && " !bg-blue-800 !border-blue-600"} 
                          `}
                onClick={(event) => handleObjectClick(event, vxEntity, index)}
                onMouseDown={(event) => event.preventDefault()}
                style={{ boxShadow: "1px 1px 5px 1px rgba(1,1,1,0.2)" }}
            >
                <p className={'h-auto my-auto text-xs mr-auto text-neutral-200'}>
                    {(vxEntity as vxEntityProps).name}
                </p>
                <p className={'h-auto my-auto text-xs ml-auto text-neutral-600 ' +
                    `${isSelected && "!text-neutral-400"}`}
                    style={{ fontSize: "11px" }}
                >
                    {vxEntity.ref?.current?.type}
                </p>
            </div>
        )
    }

    return (
        <CollapsiblePanel
            title="Entities"
        >
            <div className='text-xs flex flex-row text-neutral-400'>
                <p className='mr-auto text-xs' style={{ fontSize: "10px" }}>
                    {Object.entries(vxEntities).length} objects
                </p>
                {/* Search input */}
                <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
            </div>
            <div className='mt-2 max-h-96 rounded-lg overflow-hidden'>
                <Virtuoso
                    style={{
                        height: 384,
                    }}
                    ref={entityListRef}
                    totalCount={Object.values(vxEntities).length}
                    itemContent={index => itemRenderer(index)}
                />
            </div>
        </CollapsiblePanel>
    )
}

type ListItemProps = {
    index: number
    isSelected: boolean
    isHovered: boolean
    handleObjectClick: (event: any, vxobject: vxObjectProps, index: number) => void
    vxobject: vxObjectProps

}

export default ObjectList
