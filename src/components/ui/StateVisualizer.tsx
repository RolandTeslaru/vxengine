import { VXEngineWindow } from "../../core/components/VXEngineWindow";
import React, { useEffect, useMemo, useState } from "react";
import { useObjectSettingsAPI, useVXObjectStore } from "@vxengine/managers/ObjectManager";
import { useObjectManagerAPI, useObjectPropertyAPI } from "@vxengine/managers/ObjectManager/stores/managerStore";
import { useTimelineManagerAPI } from "@vxengine/managers/TimelineManager/store";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../shadcn/select";
import { useUIManagerAPI } from "../../managers/UIManager/store";
import JsonView from 'react18-json-view'
import 'react18-json-view/src/style.css'
import { useSourceManagerAPI } from "@vxengine/managers/SourceManager";
import { useEffectsManagerAPI } from "@vxengine/managers/EffectsManager";
import { useCameraManagerAPI } from "@vxengine/managers/CameraManager";
import AlertTriangle from '@geist-ui/icons/alertTriangle'
import Search from "./Search";
import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
import { useRefStore } from "@vxengine/utils";
import { refStoreProps, trackSegmentsRef } from "@vxengine/utils/useRefStore";
import { IS_PRODUCTION, useVXEngine } from "@vxengine/engine";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/TimelineEditor/store";


const filterOutFunctions = (state: any) => {
    if (!state || typeof state !== "object") return null;
    return Object.fromEntries(
        Object.entries(state).filter(([_, value]) => typeof value !== "function")
    );
};

const StateVisualizerComponent = ({
    useStateAPI,
    collapsedDepth = 1,
}: {
    useStateAPI: () => any;
    collapsedDepth?: number;
}) => {
    const state = useStateAPI();
    const filteredState = filterOutFunctions(state);

    return (
        <JsonView
            src={filteredState}
            collapsed={({ depth }) => depth > collapsedDepth}
            dark={true}
        />
    );
};

// Component for TimelineEditorAPI
const State_TimelineManagerAPI = () => {
    const state = useTimelineManagerAPI();

    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

    // Properties you want to keep expanded initially
    const propertiesToExpand = ["clipboard", "selectedKeyframeKeys", "collapsedGroups"];

    const collapsedLogic = (indexOrName: string | number, path: (string | number)[], depth: number) => {
        const fullPath = path?.join(".");
        if (expandedPaths.has(fullPath)) return false;
        if (typeof indexOrName === "string" && propertiesToExpand.includes(indexOrName)) return false;
        return depth > 1;
    };

    const filteredState = Object.fromEntries(
        Object.entries(state).filter(([_, value]) => typeof value !== "function")
    );

    return (
        <JsonView
            src={filteredState}
            // @ts-expect-error
            collapsed={({ indexOrName, path, depth }) => collapsedLogic(indexOrName, path, depth)}
            dark={true}
        />
    );
};



// Component for ObjectPropertyAPI
const State_ObjectPropertyAPI = () => {
    const state = useObjectPropertyAPI();
    const [searchQuery, setSearchQuery] = useState("");

    // Function to filter the state based on the search query
    const filterProperties = (properties, query) => {
        if (!properties || typeof properties !== "object") return {};
        if (!query) return properties;

        const lowerQuery = query.toLowerCase();

        return Object.keys(properties)
            .filter((key) => {
                const object = properties[key];
                // Check if the key or any nested property includes the query string
                return (
                    key.toLowerCase().includes(lowerQuery) ||
                    JSON.stringify(object).toLowerCase().includes(lowerQuery)
                );
            })
            .reduce((acc, key) => {
                acc[key] = properties[key];
                return acc;
            }, {});
    };

    // Ensure filterOutFunctions(state) produces a valid object
    const sanitizedState = filterOutFunctions(state) || {};
    const filteredState = {
        ...sanitizedState,
        properties: filterProperties(sanitizedState.properties, searchQuery),
    };
    return (
        <>
            <div className=" absolute right-2 top-9 gap-2 z-10">
                <div className="flex gap-2 text-yellow-400">
                    <AlertTriangle className="" size={30} />
                    <div className="text-xs font-sans-menlo">
                        <p>Highly volatile state!</p>
                        <p>Rendering this will cause lag!</p>
                    </div>
                </div>
                {IS_PRODUCTION &&
                    <div className="text-red-600 flex gap-2">
                        <AlertTriangle className="" size={30} />
                        <p className="text-xs my-auto font-sans-menlo">This store is not updated in Production Mode!</p>
                    </div>
                }
            </div>

            <Search className="absolute right-4 w-32" searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <JsonView
                src={filteredState}
                collapsed={({ depth }) => depth > 4}
                dark={true}
            />
        </>
    );
};


function extractDatasetFromMap(map: Map<string, any>) {
    const obj = {}
    for (let [key, value] of map) {
        obj[key] = (value as HTMLElement)?.dataset ? { dataset: { ...value.dataset } } : value;
    }

    return obj;
}

const State_RefStore = () => {
    const state = useRefStore();
    const convertedState = {
        ...state,
        keyframesRef: extractDatasetFromMap(state.keyframesRef),
        trackSegmentsRef: extractDatasetFromMap(state.trackSegmentsRef)
    }
    return (
        <>
            <JsonView
                src={convertedState}
                collapsed={({ depth }) => depth > 3}
                dark={true}
            />
        </>
    )
}

const stateComponents = {
    ObjectManagerAPI: {
        store: useObjectManagerAPI,
        depth: 1
    },
    TimelineManagerAPI: {
        store: useTimelineManagerAPI,
        component: State_TimelineManagerAPI, // Custom component
    },
    TimelineEditorAPI: {
        store: useTimelineEditorAPI,
    },
    SourceManagerAPI: {
        store: useSourceManagerAPI,
        depth: 2
    },
    EffectsManagerAPI: {
        store: useEffectsManagerAPI,

    },
    CameraManagerAPI: {
        store: useCameraManagerAPI,
    },
    ObjectPropertyAPI: {
        store: useObjectPropertyAPI,
        component: State_ObjectPropertyAPI, // Custom component
    },
    ObjectSettingsAPI: {
        store: useObjectSettingsAPI,
    },
    VXObjectStore: {
        store: useVXObjectStore,
        depth: 2
    },
    UIStore: {
        store: useUIManagerAPI,
        depth: 2
    },
    AnimationEngineAPI: {
        store: useAnimationEngineAPI,
    },
    RefStore: {
        store: useRefStore,
        component: State_RefStore
    }
};

const StateComponent = ({ activeData }: {activeData: string}) => {
    const useStateAPI = stateComponents[activeData].store;
    const CustomComponent = stateComponents[activeData].component
    const depth = stateComponents[activeData].depth;

    if (CustomComponent)
        return <CustomComponent />
    return <StateVisualizerComponent useStateAPI={useStateAPI} collapsedDepth={depth} />;
};
const StateVisualizer = () => {
    const vxWindowId = "stateVisualizerWindow"
    const [activeData, setActiveData] = useState("ObjectManagerAPI");
    const isAttached = useUIManagerAPI(state => state.getAttachmentState(vxWindowId))

    const [refresh, setRefresh] = useState(0);

    return (
        <VXEngineWindow
            vxWindowId={vxWindowId}
            title="VXEngine: State Visualizer"
            windowClasses='width=717,height=450,left=100,top=200,resizable=0'
            className="text-sm min-w-[500px] bottom-[24px] max-w-96 left-[300px] rounded-2xl"
            detachedClassName=" top-1 !left-1 !h-[100%] !min-w-[100%] "
        >
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
                        <SelectTrigger className="w-[180px] h-7 my-auto focus:outline-none !text-xs">
                            <SelectValue placeholder="Select a Timeline" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(stateComponents).map((key) => (
                                <SelectItem key={key} value={key} className="!text-xs">
                                    {key}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className={`${isAttached ? "max-h-[400px] " : "max-h-[auto]"} overflow-hidden overflow-y-scroll mb-auto`}>
                    <StateComponent activeData={activeData}/>
                </div>
            </>
        </VXEngineWindow>
    )

}


export default StateVisualizer