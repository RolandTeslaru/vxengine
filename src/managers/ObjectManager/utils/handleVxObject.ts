import { ThreeEvent } from "@react-three/fiber";
import { useObjectManagerAPI } from "../stores/managerStore";

export const handleOnVxObjectClick = (
    event: ThreeEvent<MouseEvent> | React.MouseEvent<HTMLElement, MouseEvent>, 
    vxkey: string
)  => {
    const objectManagerAPI = useObjectManagerAPI.getState();
    const { selectedObjectKeys, selectObject, unselectObject, clearSelectedObjects} = objectManagerAPI

    if(event.metaKey || event.ctrlKey){
        if(selectedObjectKeys.includes(vxkey))
            unselectObject(vxkey);
        else
            selectObject(vxkey)
    } else {
        clearSelectedObjects();
        selectObject(vxkey)
    }
}

export const handleOnVxObjectContextMenu = (
    event: ThreeEvent<MouseEvent> | React.MouseEvent<HTMLElement, MouseEvent>, 
    vxkey: string
) => {
    const objectManagerAPI = useObjectManagerAPI.getState();
    const { selectObject, clearSelectedObjects} = objectManagerAPI

    if(event.metaKey || event.ctrlKey){
        selectObject(vxkey)
    } else {
        clearSelectedObjects();
        selectObject(vxkey)
    }
}