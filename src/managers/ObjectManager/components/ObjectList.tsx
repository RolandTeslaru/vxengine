import React from 'react'
import CollapsiblePanel from '@vxengine/components/ui/CollapsiblePanel'
import { useObjectManagerAPI } from '../store';
import { vxObjectProps } from '@vxengine/types/objectStore';
import { useVXObjectStore } from '@vxengine/vxobject';
import { Virtuoso, VirtuosoGrid } from 'react-virtuoso';

const LIST_ITEM_HEIGHT = 34

const ObjectList = () => {
    const objects = useVXObjectStore(state => state.objects)

    const selectedObjectKeys = useObjectManagerAPI(state => state.selectedObjectKeys)
    const selectObjects = useObjectManagerAPI(state => state.selectObjects)
    const hoveredObject = useObjectManagerAPI(state => state.hoveredObject)

    const [lastSelectedIndex, setLastSelectedIndex] = React.useState(null);

    const handleObjectClick = (event, vxobject: vxObjectProps, index: number) => {
        event.preventDefault();

        // Convert objects to an array to get a slice
        const objectArray = Object.values(objects);

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
        const vxObject = Object.values(objects)[index];
        const vxkey = vxObject.vxkey
        const isSelected = selectedObjectKeys?.includes(vxkey)
        const isHovered = hoveredObject?.vxkey === vxkey;
        return (
            <div key={index} className={`h-9 border my-2 flex flex-row p-2 rounded-xl bg-neutral-800 border-neutral-700 cursor-pointer hover:bg-neutral-900
                ${isSelected && `!bg-blue-600 !border-neutral-200 hover:!bg-blue-800`} 
                ${isHovered && `bg-neutral-900`}
                ${isHovered && isSelected && " !bg-blue-800 !border-blue-600"} 
            `}
                onClick={(event) => handleObjectClick(event, vxObject, index)}
                onMouseDown={(event) => event.preventDefault()}
            >
                <p className={'h-auto my-auto text-xs mr-auto text-neutral-200'}>
                    {vxObject.type === "entity" ? vxObject.name : vxkey}
                </p>
                <p className={'h-auto my-auto text-xs ml-auto text-neutral-600 ' +
                    `${isSelected && "!text-neutral-400"}`}
                    style={{ fontSize: "11px" }}
                >
                    {vxObject.ref?.current?.type}
                </p>
            </div>
        )
    }

    return (
        <CollapsiblePanel
            title="Object List"
        >
            <div className='text-xs flex flex-row text-neutral-400'>
                {selectedObjectKeys.length === 1 && (
                    <p className=' text-neutral-400 font-light' style={{ fontSize: "12px" }} >{selectedObjectKeys.length} object selected</p>
                )}
                {selectedObjectKeys.length > 1 && (
                    <p className='text-neutral-400 font-light' style={{ fontSize: "12px" }}>{selectedObjectKeys.length} objects selected</p>
                )}
                <p className='ml-auto text-xs' style={{ fontSize: "10px" }}>{Object.entries(objects).length} objects</p>
            </div>
            <div className='mt-2 max-h-96 rounded-lg overflow-hidden'>
                <VirtuosoGrid
                    style={{
                        height: 384,
                    }}
                    totalCount={Object.values(objects).length}
                    itemContent={index => itemRenderer(index)}
                >

                </VirtuosoGrid>
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
