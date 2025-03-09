import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import animationEngineInstance from "@vxengine/singleton";
import { VXObjectSettings } from "../types";
import { useTimelineEditorAPI } from "@vxengine/managers/TimelineManager/TimelineEditor/store";
import { EditorKeyframe, EditorObject, EditorStaticProp, EditorTrack } from "@vxengine/types/data/editorData";
import { cloneDeep } from "lodash";
import { v4 as uuidv4 } from 'uuid';
import { useTimelineManagerAPI } from "@vxengine/managers/TimelineManager";
import { produce } from "immer";
import { TimelineMangerAPIProps } from "@vxengine/managers/TimelineManager/types/store";


export const initTimelineEditorObject = (vxkey: string, initialSettings: VXObjectSettings) => {
    const rawObject = animationEngineInstance.rawObjectCache.get(vxkey)
    const objectSettingsAPI = useObjectSettingsAPI.getState();
    const timelineEditorAPI = useTimelineEditorAPI.getState();
    // Create editor Tracks for object
    const tracks: Record<string, EditorTrack> = {}
    const trackKeys: string[] = []

    const staticProps: Record<string, EditorStaticProp> = {}
    const staticPropKeys: string[] = []

    if (rawObject) {
        // Handle settings
        const mergedSettingsForObject = cloneDeep(initialSettings);

        const rawSettings = rawObject.settings;
        if (rawSettings) {
            Object.entries(rawSettings).forEach(([settingKey, rawSetting]) => {
                mergedSettingsForObject[settingKey].value = rawSetting;
            })
        }

        objectSettingsAPI.initSettingsForObject(vxkey, mergedSettingsForObject, initialSettings)

        // Handle Track
        rawObject.tracks.forEach(rawTrack => {
            const trackKey = `${vxkey}.${rawTrack.propertyPath}`
            trackKeys.push(trackKey)

            const editorTrack: EditorTrack = {
                keyframes: {} as Record<string, EditorKeyframe>,
                propertyPath: rawTrack.propertyPath,
                vxkey,
                orderedKeyframeKeys: []
            }

            rawTrack.keyframes.forEach(rawKeyframe => {
                const keyframeKey = rawKeyframe.keyframeKey || `keyframe-${uuidv4()}`;
                if (!rawKeyframe.keyframeKey)
                    rawKeyframe.keyframeKey = keyframeKey;

                const editorKeyframe: EditorKeyframe = {
                    id: keyframeKey,
                    vxkey,
                    propertyPath: rawTrack.propertyPath,
                    time: rawKeyframe.time,
                    value: rawKeyframe.value,
                    handles: {
                        in: {
                            x: rawKeyframe.handles[0],
                            y: rawKeyframe.handles[1]
                        },
                        out: {
                            x: rawKeyframe.handles[2],
                            y: rawKeyframe.handles[3]
                        }
                    }
                }
                editorTrack.keyframes[keyframeKey] = editorKeyframe;
                editorTrack.orderedKeyframeKeys.push(keyframeKey);

                tracks[trackKey] = editorTrack
            })
        })

        // Handle Static prop
        rawObject.staticProps.forEach(staticProp => {
            const staticPropKey = `${vxkey}.${staticProp.propertyPath}`;
            staticPropKeys.push(staticPropKey);

            const newStaticProp: EditorStaticProp = {
                vxkey,
                value: staticProp.value,
                propertyPath: staticProp.propertyPath
            };
            staticProps[staticPropKey] = newStaticProp;
        })

    }

    const editorObject: EditorObject = {
        vxkey,
        trackKeys,
        staticPropKeys
    }

    useTimelineManagerAPI.setState(produce((state: TimelineMangerAPIProps) => {
        state.tracks = { ...state.tracks, ...tracks }
        state.staticProps = { ...state.staticProps, ...staticProps }
        state.editorObjects[vxkey] = editorObject;
    }))

    timelineEditorAPI.addObjectToTrackTree(vxkey, tracks);
}

export const cleanupEditorObject = (vxkey: string) => {
    useTimelineManagerAPI.setState(produce((state: TimelineMangerAPIProps) => {
        Object.entries(state.tracks).forEach(([trackKey, _track]) => {
            if (_track.vxkey === vxkey)
                delete state.tracks[trackKey]
        })

        Object.entries(state.staticProps).forEach(([staticPropKey, _staticProp]) => {
            if (_staticProp.vxkey === vxkey)
                delete state.staticProps[staticPropKey];
        })

        delete state.editorObjects[vxkey]
    }))

    useTimelineEditorAPI.getState().removeObjectFromTrackTree(vxkey)
}