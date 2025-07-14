import { useObjectManagerAPI } from "../stores/managerStore";
import React from "react";
import { useVXObjectStore } from "../stores/objectStore";
import { Globe, Move, RefreshCcw } from "@vxengine/ui/icons";
import { StandardWindowStyling } from "@vxengine/ui/components/VXEngineWindow";

export const ObjectTransformControls = () => {
    
    const [transformMode, setTransformMode, vxkey, transformSpace, setTransformSpace] = useObjectManagerAPI(state => [
        state.transformMode,
        state.setTransformMode,
        state.selectedObjectKeys[0],
        state.transformSpace,
        state.setTransformSpace
    ])
    
    const selectedObjectType = useVXObjectStore(state => state.objects[vxkey]?.type)
    
    const isEntity = selectedObjectType === "entity" || selectedObjectType === "virtualEntity"

    const handleSpaceChange = () => {
        if (transformSpace === "local")
            setTransformSpace("world")
        else if (transformSpace === "world")
            setTransformSpace("local")
    }

    return (
        <div
            className='absolute right-[-54px] z-[-1] top-0'
            style={{
                opacity: isEntity ? 1 : 0,
                transform: isEntity
                    ? 'translateX(0) translateZ(0)'
                    : 'translateX(-100%) translateZ(0)',
                transition: 'opacity 150ms ease-in-out, transform 150ms ease-in-out',
                willChange: 'opacity, transform'
            }}
        >
            <StandardWindowStyling className="shadow-2xs relative p-1!  rounded-xl  shadow-neutral-950">
                <div className=" gap-2   rounded-xl flex flex-col">
                    <button className={"bg-tertiary-opaque border hover:bg-secondary-opaque dark:border-neutral-600 border-neutral-400   p-1 rounded-lg cursor-pointer "
                        + (transformMode === "translate" && "border-blue-500! bg-blue-600!  ")}
                        onClick={() => setTransformMode("translate")}
                        style={{boxShadow: transformMode === "translate" ? "0px 0px 10px 1px oklch(0.623 0.214 259.815" : ""}}
                    >
                        <Move className='scale-[85%] !text-label-primary' size={24} />
                    </button>
                    <button className={"bg-tertiary-opaque border hover:bg-secondary-opaque border-neutral-600 p-1 rounded-lg cursor-pointer "
                        + (transformMode === "rotate" && "border-blue-500! bg-blue-600!   ")}
                        onClick={() => setTransformMode("rotate")}
                        style={{boxShadow: transformMode === "rotate" ? "0px 0px 10px 1px oklch(0.623 0.214 259.815" : ""}}
                    >
                        <RefreshCcw className='scale-75 !text-label-primary' />
                    </button>
                    <button className={"bg-tertiary-opaque border hover:bg-secondary-opaque border-neutral-600 p-1 rounded-lg cursor-pointer "
                        + (transformMode === "scale" && "border-blue-500! bg-blue-600!   ")}
                        onClick={() => setTransformMode("scale")}
                        style={{boxShadow: transformMode === "scale" ? "0px 0px 10px 1px oklch(0.623 0.214 259.815" : ""}}
                    >
                        <svg className="text-label-primary" width="24" height="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 3.04999C11.7485 3.04999 11.95 3.25146 11.95 3.49999V7.49999C11.95 7.74852 11.7485 7.94999 11.5 7.94999C11.2515 7.94999 11.05 7.74852 11.05 7.49999V4.58639L4.58638 11.05H7.49999C7.74852 11.05 7.94999 11.2515 7.94999 11.5C7.94999 11.7485 7.74852 11.95 7.49999 11.95L3.49999 11.95C3.38064 11.95 3.26618 11.9026 3.18179 11.8182C3.0974 11.7338 3.04999 11.6193 3.04999 11.5L3.04999 7.49999C3.04999 7.25146 3.25146 7.04999 3.49999 7.04999C3.74852 7.04999 3.94999 7.25146 3.94999 7.49999L3.94999 10.4136L10.4136 3.94999L7.49999 3.94999C7.25146 3.94999 7.04999 3.74852 7.04999 3.49999C7.04999 3.25146 7.25146 3.04999 7.49999 3.04999L11.5 3.04999Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </button>
                </div>
            </StandardWindowStyling>
            <StandardWindowStyling className="p-1! mt-2 rounded-xl shadow-2xs shadow-neutral-950">
                <div className=" gap-2 flex flex-col ">
                    <button
                        className={"bg-tertiary-opaque border hover:bg-secondary-opaque border-neutral-600 p-1 rounded-lg cursor-pointer"}
                        onClick={handleSpaceChange}
                    >
                        {transformSpace === "local" &&
                            <svg width="24" height="24" className="scale-75" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.28856 0.796908C7.42258 0.734364 7.57742 0.734364 7.71144 0.796908L13.7114 3.59691C13.8875 3.67906 14 3.85574 14 4.05V10.95C14 11.1443 13.8875 11.3209 13.7114 11.4031L7.71144 14.2031C7.57742 14.2656 7.42258 14.2656 7.28856 14.2031L1.28856 11.4031C1.11252 11.3209 1 11.1443 1 10.95V4.05C1 3.85574 1.11252 3.67906 1.28856 3.59691L7.28856 0.796908ZM2 4.80578L7 6.93078V12.9649L2 10.6316V4.80578ZM8 12.9649L13 10.6316V4.80578L8 6.93078V12.9649ZM7.5 6.05672L12.2719 4.02866L7.5 1.80176L2.72809 4.02866L7.5 6.05672Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        }
                        {transformSpace === "world" &&
                            <Globe className='scale-75 dark:!text-neutral-100 text-neutral-900' size={24} />
                        }
                    </button>
                </div>
            </StandardWindowStyling>
        </div>
    )
}

