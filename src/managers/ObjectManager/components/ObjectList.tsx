import React from 'react'
import CollapsiblePanel from '@vxengine/components/ui/CollapsiblePanel'
import { useObjectManagerAPI } from '../store';
import { vxObjectProps } from '@vxengine/types/objectStore';
import { useVXObjectStore } from '@vxengine/vxobject';


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
    return (
        <CollapsiblePanel
            title="Object List"
        >
            <div className='text-xs flex flex-row text-neutral-400'>
                {selectedObjectKeys.length === 1 && (
                    <p className=' text-neutral-400 font-light' style={{ fontSize: "11px" }} >{selectedObjectKeys.length} object selected</p>
                )}
                {selectedObjectKeys.length > 1 && (
                    <p className='text-neutral-400 font-light' style={{ fontSize: "11px" }}>{selectedObjectKeys.length} objects selected</p>
                )}
                <p className='ml-auto text-xs' style={{ fontSize: "10px" }}>{Object.entries(objects).length} objects</p>
            </div>
            <div className='flex flex-col pt-2 gap-2 max-h-96 rounded-lg overflow-y-scroll '>
                
                {Object.values(objects).map((vxobject: vxObjectProps, index: number) => {
                    const isSelected = selectedObjectKeys.includes(vxobject.vxkey);
                    const isHovered = hoveredObject?.vxkey === vxobject.vxkey

                    if (vxobject.type === "entity")
                        return (
                            <ListItem 
                                index={index} 
                                isSelected={isSelected} 
                                isHovered={isHovered} 
                                handleObjectClick={handleObjectClick}
                                vxobject={vxobject}
                            />
                        )
                })}

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

const ListItem: React.FC<ListItemProps> = ({ isSelected, isHovered, index, handleObjectClick, vxobject }) => {
    return (
        <div key={index} className={`h-9 border flex flex-row p-2 rounded-xl bg-neutral-800 border-neutral-700 cursor-pointer hover:bg-neutral-900
            ${isSelected && `!bg-blue-600 !border-neutral-200 hover:!bg-blue-800`} 
            ${isHovered && `bg-neutral-900`}
            ${isHovered && isSelected && " !bg-blue-800 !border-blue-600"} 
        `}
            onClick={(event) => handleObjectClick(event, vxobject, index)}
            onMouseDown={(event) => event.preventDefault()}
        >
            <p className={'h-auto my-auto text-xs mr-auto text-neutral-200'}>
                {vxobject.type === "entity" ? vxobject.name : vxobject.vxkey}
            </p>
            <p className={'h-auto my-auto text-xs ml-auto text-neutral-600 ' +
                `${isSelected && "!text-neutral-400"}`}
                style={{ fontSize: "11px" }}
            >
                {vxobject.ref?.current?.type}
            </p>
        </div>
    )
}
// bg-gradient-to-r from-emerald-500 to-emerald-900

export default ObjectList
