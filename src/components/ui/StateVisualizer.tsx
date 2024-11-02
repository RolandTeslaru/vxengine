import { useSplineManagerAPI } from "@vxengine/managers/SplineManager/store";
import VXEngineWindow from "./VXEngineWindow";
import React, { useState } from "react";
import { useVXObjectStore } from "@vxengine/vxobject";
import { useObjectSettingsAPI } from "@vxengine/vxobject/ObjectSettingsStore";
import { useObjectManagerAPI } from "@vxengine/managers/ObjectManager";
import { useObjectPropertyAPI } from "@vxengine/managers/ObjectManager/store";
import { useAnimationEngineAPI } from "@vxengine/AnimationEngine";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/store";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../shadcn/select";
import { useVXUiStore } from "./VXUIStore";
import { WindowControlDots } from "./WindowControlDots";

const EditorDataComponent = () => {
    const editorObjects = useTimelineEditorAPI(state => state.editorObjects);
    return (
        <pre
            style={{
                whiteSpace: 'pre-wrap',
            }}
            className="text-xs"
        >
            {JSON.stringify(editorObjects, null, 2)}
        </pre>
    );
};

const KeyframesComponent = () => {
    const keyframes = useTimelineEditorAPI(state => state.keyframes);
    return (
        <pre
            style={{
                whiteSpace: 'pre-wrap',
            }}
            className="text-xs"
        >
            {JSON.stringify(keyframes, null, 2)}
        </pre>
    );
};

const TracksComponent = () => {
    const tracks = useTimelineEditorAPI(state => state.tracks);
    return (
        <pre
            style={{
                overflowY: 'scroll',
                whiteSpace: 'pre-wrap',
            }}
            className="text-xs"
        >
            {JSON.stringify(tracks, null, 2)}
        </pre>
    );
};

const StaticPropsComponent = () => {
    const staticProps = useTimelineEditorAPI(state => state.staticProps);
    return (
        <pre
            style={{
                whiteSpace: 'pre-wrap',
            }}
            className="text-xs"
        >
            {JSON.stringify(staticProps, null, 2)}
        </pre>
    );
};

const CurrentTimelineComponent = () => {
    const currentTimelineID = useAnimationEngineAPI(state => state.currentTimelineID)
    const currentTimeline = useAnimationEngineAPI(state => state.timelines[currentTimelineID]);
    return (
        <pre
            style={{
                whiteSpace: 'pre-wrap',
            }}
            className="text-xs"
        >
            {"currentTimelineID: " + currentTimelineID}
            {JSON.stringify(currentTimeline, null, 2)}
        </pre>
    );
};

const PropertiesStoreComponent = () => {
    const propertiesStore = useObjectPropertyAPI(state => state.properties);
    return (
        <pre
            style={{
                overflowY: 'scroll',
                whiteSpace: 'pre-wrap',
            }}
            className="text-xs"
        >
            {JSON.stringify(propertiesStore, null, 2)}
        </pre>
    );
};


const replacer = (key, value) => {
    if (key === 'ref') {
        return '[ref omitted]';
    }
    return value;
};

const SettingsComponent = () => {
    const settings = useObjectSettingsAPI(state => state.settings);
    return (
        <pre
            style={{
                overflowY: 'scroll',
                whiteSpace: 'pre-wrap',
            }}
            className="text-xs"
        >
            {JSON.stringify(settings, null, 2)}
        </pre>
    )
}
const AdditionalSettingsComponent = () => {
    const additionalSettings = useObjectSettingsAPI(state => state.additionalSettings);
    return (
        <pre
            style={{
                overflowY: 'scroll',
                whiteSpace: 'pre-wrap',
            }}
            className="text-xs"
        >
            {JSON.stringify(additionalSettings, null, 2)}
        </pre>
    )
}

const SplinesComponent = () => {
    const splines = useSplineManagerAPI(state => state.splines);
    return (
        <pre
            style={{
                overflowY: 'scroll',
                whiteSpace: 'pre-wrap',
            }}
            className="text-xs"
        >
            {JSON.stringify(splines, null, 2)}
        </pre>
    )
}

const VxobjectsComponent = () => {
    const vxobjects = useVXObjectStore(state => state.objects);

    if (!vxobjects) {
        return <div>No data available</div>;
    }

    return (
        <pre
            style={{
                overflowY: 'scroll',
                whiteSpace: 'pre-wrap',
            }}
            className="text-xs"
        >
            {JSON.stringify(vxobjects, replacer, 2)}
        </pre>
    );
};

const TimelinesComponent = () => {
    const timelines = useAnimationEngineAPI(state => state.timelines)

    return (
        <pre
            style={{
                overflowY: 'scroll',
                whiteSpace: 'pre-wrap',
            }}
            className="text-xs"
        >
            {JSON.stringify(timelines, null, 2)}
        </pre>
    )
}

const GroupedPathsComponent = () => {
    const groupedPaths = useTimelineEditorAPI(state => state.groupedPaths)
    return (
        <pre
            style={{
                overflowY: 'scroll',
                whiteSpace: 'pre-wrap',
            }}
            className="text-xs"
        >
            {JSON.stringify(groupedPaths, null, 2)}
        </pre>
    )
}

const StateVisualizer = () => {
    const [activeData, setActiveData] = useState("editorObjects");
    const [attachedState, setAttachedState] = useState(true);

    const showStateVisualizer = useVXUiStore(state => state.showStateVisualizer)
    const setShowStateVisualzier = useVXUiStore(state => state.setShowStateVisualizer)

    // Conditionally render the correct mini component
    const renderActiveComponent = () => {
        switch (activeData) {
            case "editorObjects":
                return <EditorDataComponent />;
            case "keyframes":
                return <KeyframesComponent />;
            case "tracks":
                return <TracksComponent />;
            case "staticProps":
                return <StaticPropsComponent />;
            case "currentTimeline":
                return <CurrentTimelineComponent />;
            case "propertiesStore":
                return <PropertiesStoreComponent />;
            case "vxobjects":
                return <VxobjectsComponent />;
            case "settings":
                return <SettingsComponent />
            case "additionalSettings":
                return <AdditionalSettingsComponent />
            case "splines":
                return <SplinesComponent />;
            case "timelines":
                return <TimelinesComponent />;
            case "groupedPats":
                return <GroupedPathsComponent />;
            default:
                return null;
        }
    };

    const [refresh, setRefresh] = useState(0);

    const memoizedChildren = React.useMemo(() => {
        return (
            <>
                <div className="w-full flex flex-row pb-1"
                >
                    <h1 className="text-left ml-2 font-sans-menlo">State Visualizer</h1>
                    <button className={" border right-2 absolute ml-auto text-xs p-[2px] h-fit w-fit flex hover:bg-neutral-800 border-neutral-600 border-opacity-20 rounded-2xl cursor-pointer "}
                        onClick={() => setRefresh(refresh + 1)}
                    >
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.84998 7.49998C1.84998 4.66458 4.05979 1.84998 7.49998 1.84998C10.2783 1.84998 11.6515 3.9064 12.2367 5H10.5C10.2239 5 10 5.22386 10 5.5C10 5.77614 10.2239 6 10.5 6H13.5C13.7761 6 14 5.77614 14 5.5V2.5C14 2.22386 13.7761 2 13.5 2C13.2239 2 13 2.22386 13 2.5V4.31318C12.2955 3.07126 10.6659 0.849976 7.49998 0.849976C3.43716 0.849976 0.849976 4.18537 0.849976 7.49998C0.849976 10.8146 3.43716 14.15 7.49998 14.15C9.44382 14.15 11.0622 13.3808 12.2145 12.2084C12.8315 11.5806 13.3133 10.839 13.6418 10.0407C13.7469 9.78536 13.6251 9.49315 13.3698 9.38806C13.1144 9.28296 12.8222 9.40478 12.7171 9.66014C12.4363 10.3425 12.0251 10.9745 11.5013 11.5074C10.5295 12.4963 9.16504 13.15 7.49998 13.15C4.05979 13.15 1.84998 10.3354 1.84998 7.49998Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </button>
                </div>
                <div className="mx-0 h-auto mt-1">
                    <Select
                        defaultValue={activeData}
                        onValueChange={(value) => {
                            setActiveData(value)
                        }}>
                        <SelectTrigger className="w-[180px] h-7 my-auto">
                            <SelectValue placeholder="Select a Timeline" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value={"editorObjects"} >editorObjects</SelectItem>
                                <SelectItem value={"keyframes"} >keyframes</SelectItem>
                                <SelectItem value={"tracks"} >tracks</SelectItem>
                                <SelectItem value={"staticProps"} >staticProps</SelectItem>
                                <SelectItem value={"currentTimeline"} >currentTimeline</SelectItem>
                                <SelectItem value={"propertiesStore"} >propertiesStore</SelectItem>
                                <SelectItem value={"vxobjects"} >vxobjects</SelectItem>
                                <SelectItem value={"settings"} >settings</SelectItem>
                                <SelectItem value={"additionalSettings"} >additionalSettings</SelectItem>
                                <SelectItem value={"splines"} >splines</SelectItem>
                                <SelectItem value={"timelines"} >timelines</SelectItem>
                                <SelectItem value={"groupedPats"} >groupedPats</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className={`${attachedState ? "max-h-[400px] " : "max-h-[auto]"} overflow-hidden overflow-y-scroll	 mb-auto `}>
                    <div>{renderActiveComponent()}</div>
                </div>
            </>
        )
    }, [attachedState, activeData, refresh])

    return (
        <VXEngineWindow
            title="VXEngine: TimelineEditorDebug"
            windowClasses='width=717,height=450,left=100,top=200,resizable=0'
            attachedState={attachedState}
            setAttachedState={setAttachedState}
        >
            {showStateVisualizer && (
                <div className={`fixed backdrop-blur-sm ${attachedState ? "bottom-6 left-[300px]" : "top-1 left-1 h-[100%] w-[100%]"} text-sm bg-neutral-900 p-2 gap-2
                bg-opacity-70 border-neutral-800 border-[1px] rounded-3xl flex flex-col`}
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