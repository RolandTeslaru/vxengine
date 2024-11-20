import { useSplineManagerAPI } from "@vxengine/managers/SplineManager/store";
import VXEngineWindow from "./VXEngineWindow";
import React, { useEffect, useMemo, useState } from "react";
import { useObjectSettingsAPI, useVXObjectStore } from "@vxengine/managers/ObjectManager";
import { useObjectManagerAPI, useObjectPropertyAPI } from "@vxengine/managers/ObjectManager/stores/managerStore";
import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/store";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../shadcn/select";
import { useVXUiStore } from "./VXUIStore";
import { WindowControlDots } from "./WindowControlDots";
import { useRefStore } from "@vxengine/utils";
import { Switch } from "../shadcn/switch";
import JsonView from 'react18-json-view'
import 'react18-json-view/src/style.css'
import { useSourceManagerAPI } from "@vxengine/managers/SourceManager";
import { useEffectsManagerAPI } from "@vxengine/managers/EffectsManager";
import { useCameraManagerAPI } from "@vxengine/managers/CameraManager";

const StateVisualizer = () => {
    const [activeData, setActiveData] = useState("ObjectManagerAPI");
    const [attachedState, setAttachedState] = useState(true);

    const showStateVisualizer = useVXUiStore(state => state.showStateVisualizer)
    const setShowStateVisualzier = useVXUiStore(state => state.setShowStateVisualizer)

    const data = useMemo(() => {
        const state = (() => {
            switch (activeData) {
                case "ObjectManagerAPI": {
                    return useObjectManagerAPI.getState();
                }
                case "TimelineEditorAPI": {
                    return useTimelineEditorAPI.getState()
                }
                case "SplineManagerAPI": {
                    return useSplineManagerAPI.getState();
                }
                case "SourceManagerAPI": {
                    return useSourceManagerAPI.getState();
                }
                case "EffectsManagerAPI": {
                    return useEffectsManagerAPI.getState();
                }
                case "CameraManagerAPI": {
                    return useCameraManagerAPI.getState();
                }
                case "ObjectPropertyAPI": {
                    return useObjectPropertyAPI.getState()
                }
                case "ObjectSettingsAPI": {
                    return useObjectSettingsAPI.getState();
                }
                default:
                    return null;
            }
        })();
    
        if (!state || typeof state !== "object") return null;
    
        // Filter out functions
        return Object.fromEntries(
            Object.entries(state).filter(([key, value]) => typeof value !== "function")
        );
    }, [activeData]);

    const [refresh, setRefresh] = useState(0);

    const memoizedChildren = React.useMemo(() => {
        return (
            <>
                <div className="w-full flex flex-row pb-1"
                >
                    <h1 className="text-left ml-2 font-sans-menlo">
                        State Visualizer
                    </h1>
                    <button className={" border right-2 absolute ml-auto text-xs p-[2px] h-fit w-fit flex hover:bg-neutral-800 border-neutral-600 border-opacity-20 rounded-2xl cursor-pointer "}
                        onClick={() => setRefresh(refresh + 1)}
                    >
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.84998 7.49998C1.84998 4.66458 4.05979 1.84998 7.49998 1.84998C10.2783 1.84998 11.6515 3.9064 12.2367 5H10.5C10.2239 5 10 5.22386 10 5.5C10 5.77614 10.2239 6 10.5 6H13.5C13.7761 6 14 5.77614 14 5.5V2.5C14 2.22386 13.7761 2 13.5 2C13.2239 2 13 2.22386 13 2.5V4.31318C12.2955 3.07126 10.6659 0.849976 7.49998 0.849976C3.43716 0.849976 0.849976 4.18537 0.849976 7.49998C0.849976 10.8146 3.43716 14.15 7.49998 14.15C9.44382 14.15 11.0622 13.3808 12.2145 12.2084C12.8315 11.5806 13.3133 10.839 13.6418 10.0407C13.7469 9.78536 13.6251 9.49315 13.3698 9.38806C13.1144 9.28296 12.8222 9.40478 12.7171 9.66014C12.4363 10.3425 12.0251 10.9745 11.5013 11.5074C10.5295 12.4963 9.16504 13.15 7.49998 13.15C4.05979 13.15 1.84998 10.3354 1.84998 7.49998Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </button>
                </div>
                <div className="mx-0 h-auto mt-1 ">
                    <Select
                        defaultValue={activeData}
                        onValueChange={(value) => {
                            setActiveData(value)
                        }}>
                        <SelectTrigger className="w-[180px] h-7 my-auto focus:outline-none">
                            <SelectValue placeholder="Select a Timeline" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value={"ObjectManagerAPI"} >ObjectManagerAPI</SelectItem>
                                <SelectItem value={"TimelineEditorAPI"} >TimelineEditorAPI</SelectItem>
                                <SelectItem value={"SplineManagerAPI"} >SplineManagerAPI</SelectItem>
                                <SelectItem value={"SourceManagerAPI"} >SourceManagerAPI</SelectItem>
                                <SelectItem value={"EffectsManagerAPI"} >EffectsManagerAPI</SelectItem>
                                <SelectItem value={"CameraManagerAPI"} >CameraManagerAPI</SelectItem>
                                <SelectItem value={"ObjectPropertyAPI"} >ObjectPropertyAPI</SelectItem>
                                <SelectItem value={"ObjectSettingsAPI"} >ObjectSettingsAPI</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className={`${attachedState ? "max-h-[400px] " : "max-h-[auto]"} overflow-hidden overflow-y-scroll	 mb-auto `}>
                    <JsonView
                        src={data}
                        collapsed={({ depth }) => depth > 1}
                        dark={true}
                    />
                </div>
            </>
        )
    }, [attachedState, activeData, refresh])

    return (
        <VXEngineWindow
            title="VXEngine: Object Visualizer"
            windowClasses='width=717,height=450,left=100,top=200,resizable=0'
            attachedState={attachedState}
            setAttachedState={setAttachedState}
        >
            {showStateVisualizer && (
                <div className={`fixed backdrop-blur-sm ${attachedState ? "bottom-[24px] left-[300px]" : "top-1 left-1 h-[100%] w-[100%]"} 
                                text-sm bg-neutral-900 p-2 gap-2 bg-opacity-70 border-neutral-800 border-[1px] rounded-2xl flex flex-col`}
                    style={{ minWidth: "500px" }}
                >

                    <WindowControlDots
                        isAttached={attachedState}
                        setAttach={setAttachedState}
                        setMount={setShowStateVisualzier}
                    />

                    {memoizedChildren}
                </div>
            )}
        </VXEngineWindow>
    )

}


export default StateVisualizer