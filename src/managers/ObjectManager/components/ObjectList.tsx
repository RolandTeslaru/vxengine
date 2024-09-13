import React from 'react'
import CollapsiblePanel from 'vxengine/components/ui/CollapsiblePanel'
import { useVXObjectStore } from 'vxengine/store';
import { useObjectManagerStore } from '../store';
import { vxObjectProps } from 'vxengine/types/objectStore';
import { shallow } from 'zustand/shallow';

const ObjectList = () => {
    const { objects } = useVXObjectStore();
    const { selectedObjectKeys, selectObjects, hoveredObject } = useObjectManagerStore(state => ({
        selectedObjectKeys: state.selectedObjectKeys,
        selectObjects: state.selectObjects,
        hoveredObject: state.hoveredObject
    }), shallow);

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
    return (
        <CollapsiblePanel
            title="Object List"
        >
            <div className='text-xs flex flex-row text-neutral-400'>
                {selectedObjectKeys.length === 1 && (
                    <p className='text-xs text-neutral-400' >{selectedObjectKeys.length} object selected</p>
                )}
                {selectedObjectKeys.length > 1 && (
                    <p className='text-xs  text-neutral-400' >{selectedObjectKeys.length} objects selected</p>
                )}
                <p className='ml-auto text-xs'> objects</p>
            </div>
            <div className='flex flex-col pt-2 gap-2'>
                {Object.values(objects).map((vxobject: vxObjectProps, index: number) => {
                    const isSelected = selectedObjectKeys.includes(vxobject.vxkey);
                    const isHovered = hoveredObject?.vxkey === vxobject.vxkey
                    return (
                        <div key={index} className={'h-9 border flex flex-row p-2 rounded-xl bg-neutral-800 border-neutral-700 cursor-pointer ' +
                            `${isHovered && " !bg-blue-800 !border-blue-600"} ${isSelected && " !bg-blue-600 !border-neutral-200"} `}
                            onClick={(event) => handleObjectClick(event, vxobject, index)}
                            onMouseDown={(event) => event.preventDefault()}
                        >
                            <p className={'h-auto my-auto text-xs mr-auto text-neutral-200'}>
                                {vxobject.name}
                            </p>
                            <p className={'h-auto my-auto text-xs ml-auto text-neutral-600 ' +
                                `${isSelected && "!text-neutral-400"}`}>
                                {vxobject.type}
                            </p>
                        </div>
                    )
                })}

            </div>
        </CollapsiblePanel>
    )
}

export default ObjectList
