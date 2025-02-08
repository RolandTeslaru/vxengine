import { extractDataFromTrackKey } from "@vxengine/managers/TimelineManager/utils/trackDataProcessing";
import { IStaticProps, ITimeline, RawKeyframeProps, RawObjectProps, RawSpline, RawTrackProps } from "../types/track";
import { useTimelineManagerAPI } from "@vxengine/managers/TimelineManager";
import { HydrateKeyframeAction, HydrateKeyframeParams, HydrateSplineActions, HydrateSplineParams, HydrateStaticPropAction, HydrateStaticPropParams } from "../types/HydrationService";
import { IS_PRODUCTION, IS_DEVELOPMENT } from "@vxengine/engine";
import { invalidate } from "@react-three/fiber";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { useSourceManagerAPI } from "@vxengine/managers/SourceManager";
import {
    Spline as wasm_Spline,
    Vector3 as wasm_Vector3,
} from "../../wasm/pkg";
import { logReportingService } from "./LogReportingService";


const LOG_MODULE = "HydrationService"

const DEBUG_TRACK_HYDRATION = false;
const DEBUG_KEYFRAME_HYDRATION = false;
const DEBUG_STATICPROP_HYDRATION = false;
const DEBUG_SPLINE_HYDRATION = false;
const DEBUG_SETTING_HYDRATION = false;

export class HydrationService {
    constructor(
        private timeline: ITimeline, 
        private _splinesCache: Map<string,wasm_Spline>
    ) { }

    /**
       * Initializes a new RawObjectProps and adds it to the current timeline's objects.
       * Prevents duplicate entries by checking if an object with the same vxkey already exists.
       * @param vxkey - The unique identifier for the object.
       * @returns The newly created or existing RawObjectProps.
       */
    private _initRawObjectOnTimeline(vxkey: string): RawObjectProps {
        // Check if an object with the same vxkey already exists
        let rawObject = this.timeline.objects.find(obj => obj.vxkey === vxkey);
        if (rawObject) {
            logReportingService.logWarning(
                `Raw Object with vxkey ${vxkey} already exists in the current timeline.`,
                {module:LOG_MODULE, functionName:"_initRawObjectOnTimeline"}
            )
                
            return rawObject;
        }

        rawObject = {
            vxkey,
            tracks: [],
            staticProps: []
        };

        this.timeline.objects.push(rawObject);

        return rawObject;
    }

    /**
   * Refreshes a track in the animation engine's data structure and optionally re-renders.
   * @param trackKey - The key identifying the track.
   * @param action - The action to perform: 'create' or 'remove'.
   * @param reRender - Whether to re-render after the refresh (default is true).
   */
    hydrateTrack(
        trackKey: string,
        action: 'create' | 'remove',
    ) {
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
        let rawObject = this.timeline.objects.find(rawObj => rawObj.vxkey === vxkey);

        const LOG_CONTEXT = {module:LOG_MODULE, functionName:"hydrateTrack", additionalData:{action}}

        if (!rawObject)
            rawObject = this._initRawObjectOnTimeline(vxkey);


        if (DEBUG_TRACK_HYDRATION)
            logReportingService.logInfo(`Hydrating track ${trackKey}`,LOG_CONTEXT)


        switch (action) {
            case 'create': {
                const keyframesForTrack = useTimelineManagerAPI.getState().tracks[trackKey].keyframes;
                const sortedKeyframes = Object.values(keyframesForTrack).sort((a, b) => a.time - b.time)

                const rawKeyframes: RawKeyframeProps[] = sortedKeyframes.map(edKeyframe => {
                    return {
                        keyframeKey: edKeyframe.id,
                        value: edKeyframe.value,
                        time: edKeyframe.time,
                        handles: [
                            edKeyframe.handles.in.x,
                            edKeyframe.handles.in.y,
                            edKeyframe.handles.out.x,
                            edKeyframe.handles.out.y,
                        ] as [number, number, number, number]
                    }
                })
                const rawTrack: RawTrackProps = {
                    propertyPath: propertyPath,
                    keyframes: rawKeyframes,
                };
                rawObject.tracks.push(rawTrack);

                if (DEBUG_TRACK_HYDRATION)
                    logReportingService.logInfo(`Track ${trackKey} has been created`,LOG_CONTEXT)
                
                break;
            }

            case 'remove': {
                rawObject.tracks = rawObject.tracks.filter(rawTrack => rawTrack.propertyPath !== propertyPath);

                if (DEBUG_TRACK_HYDRATION)
                    logReportingService.logInfo(`Track ${trackKey} has been removed`,LOG_CONTEXT)
                
                break;
            }

            default: {
                logReportingService.logWarning(`Unknown action ${action}`,LOG_CONTEXT)
                return;
            }
        }
    }






    /**
     * Refreshes a keyframe in the animation engine's data structure and optionally re-renders.
     * @param trackKey - The key identifying the track.
     * @param action - The action to perform: 'create', 'update', or 'remove'.
     * @param keyframeKey - The key identifying the keyframe.
     * @param reRender - Whether to re-render after the refresh (default is true).
     */
    hydrateKeyframe<A extends HydrateKeyframeAction>(params: HydrateKeyframeParams<A>) {
        const { trackKey, action, keyframeKey, newData } = params;
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);

        const LOG_CONTEXT = {module:LOG_MODULE, functionName:"hydrateKeyframe", additionalData:{action}}

        if (DEBUG_KEYFRAME_HYDRATION)
            logReportingService.logInfo(`Hydrating keyframe ${keyframeKey}`,LOG_CONTEXT)

        let rawObject = this.timeline.objects.find(obj => obj.vxkey === vxkey);
        if (!rawObject) {
            rawObject = this._initRawObjectOnTimeline(vxkey);
        }

        const track = rawObject.tracks.find(t => t.propertyPath === propertyPath);
        if (!track) {
            logReportingService.logWarning(
                `Track with propertyPath ${propertyPath} was not found on object ${vxkey}`,LOG_CONTEXT)
            return;
        }

        const keyframes = track.keyframes;

        switch (action) {
            case 'create': {
                const track = useTimelineManagerAPI.getState().tracks[trackKey];
                const edKeyframe = track.keyframes[keyframeKey]
                const rawKeyframe: RawKeyframeProps = {
                    keyframeKey: edKeyframe.id,
                    value: edKeyframe.value,
                    time: edKeyframe.time,
                    handles: [
                        edKeyframe.handles.in.x,
                        edKeyframe.handles.in.y,
                        edKeyframe.handles.out.x,
                        edKeyframe.handles.out.y,
                    ]
                }
                keyframes.push(rawKeyframe);
                keyframes.sort((a, b) => a.time - b.time);

                if (DEBUG_KEYFRAME_HYDRATION)
                    logReportingService.logInfo(
                        `Keyframe ${keyframeKey} has been added to track${trackKey}`,LOG_CONTEXT)    
                
                break;
            }

            case 'update': {
                const track = useTimelineManagerAPI.getState().tracks[trackKey];
                const edKeyframe = track.keyframes[keyframeKey];
                keyframes.forEach((kf, index) => {
                    if (kf.keyframeKey === keyframeKey) {
                        const keyframe = keyframes[index]
                        keyframe.value = edKeyframe.value;
                        keyframe.time = edKeyframe.time;
                        keyframe.handles = [
                            edKeyframe.handles.in.x,
                            edKeyframe.handles.in.y,
                            edKeyframe.handles.out.x,
                            edKeyframe.handles.out.y,
                        ]
                    }
                });
                keyframes.sort((a, b) => a.time - b.time);

                if (DEBUG_KEYFRAME_HYDRATION) {
                    logReportingService.logInfo(
                        `Keyframe ${keyframeKey} updated in track ${trackKey}`,LOG_CONTEXT)
                }
                break;
            }

            case 'updateTime': {
                if (typeof newData === 'number') {
                    const targetedKeyframe = keyframes.find(kf => kf.keyframeKey === keyframeKey)
                    targetedKeyframe.time = newData;
                    keyframes.sort((a, b) => a.time - b.time);

                    if (DEBUG_KEYFRAME_HYDRATION)
                        logReportingService.logInfo(
                            `Keyframe ${keyframeKey} in track ${trackKey} has had its time updated`,LOG_CONTEXT)
                } else {
                    logReportingService.logError(
                        `Invalid newData param for action: ${action}. Expected a number but received ${newData}`, LOG_CONTEXT)
                }
                break;
            }

            case 'updateValue': {
                if (typeof newData === 'number') {
                    const targetedKeyframe = keyframes.find(kf => kf.keyframeKey === keyframeKey)
                    targetedKeyframe.value = newData;

                    if (DEBUG_KEYFRAME_HYDRATION)
                        logReportingService.logInfo(
                            `Keyframe ${keyframeKey} in track ${trackKey} has had its value updated`,LOG_CONTEXT)
                } else {
                    logReportingService.logError(
                        `Invalid newData param for action ${action}. Expected a number but received ${newData}`, LOG_CONTEXT)
                }
                break;
            }

            case 'updateHandles': {
                if (Array.isArray(newData) && newData.length === 4 && newData.every(v => typeof v === 'number')) {
                    const targetedKeyframe = keyframes.find(kf => kf.keyframeKey === keyframeKey)
                    targetedKeyframe.handles = newData as [number, number, number, number];

                    if (DEBUG_KEYFRAME_HYDRATION)
                        logReportingService.logInfo(
                            `Keyframe ${keyframeKey} in track ${track} has had its handles updated`, LOG_CONTEXT)
                } else 
                    logReportingService.logError(
                        `Invalid newData param for action ${action}. Expected [number, number, number, number] but received ${newData}`, LOG_CONTEXT)
                break;
            }


            case "remove": {
                track.keyframes = track.keyframes.filter(kf => kf.keyframeKey !== keyframeKey);

                if (DEBUG_KEYFRAME_HYDRATION)
                    logReportingService.logInfo(`Keyframe ${keyframeKey} from track ${trackKey} has been removed`, LOG_CONTEXT)
                break;
            }

            default: {
                logReportingService.logWarning(
                    `Unknown action ${action}`,LOG_CONTEXT)
                return;
            }
        }
    }






    /**
     * Refreshes a static property in the animation engine's data structure and optionally re-renders.
     * @param action - The action to perform: 'create', 'update', or 'remove'.
     * @param staticPropKey - The key identifying the static property.
     * @param reRender - Whether to re-render after the refresh (default is true).
     */
    hydrateStaticProp<A extends HydrateStaticPropAction>(params: HydrateStaticPropParams<A>) {
        const { action, staticPropKey, reRender = true, newValue } = params;
        const { vxkey, propertyPath } = extractDataFromTrackKey(staticPropKey);

        const LOG_CONTEXT = {module:LOG_MODULE, functionName:"hydrateStaticProp", additionalData:{action}}

        if (DEBUG_STATICPROP_HYDRATION)
            logReportingService.logInfo(
                `Hydrating StaticProp ${staticPropKey}`,LOG_CONTEXT)

        let rawObject = this.timeline.objects.find(obj => obj.vxkey === vxkey);
        if (!rawObject) {
            rawObject = this._initRawObjectOnTimeline(vxkey);
        }


        switch (action) {
            case 'create': {
                const propExists = rawObject.staticProps.some(prop => prop.propertyPath === propertyPath);

                if (!propExists) {
                    const edStaticProp = useTimelineManagerAPI.getState().staticProps[staticPropKey];
                    const staticProp: IStaticProps = {
                        value: edStaticProp.value,
                        vxkey: edStaticProp.vxkey,
                        propertyPath: edStaticProp.propertyPath
                    }
                    rawObject.staticProps.push(staticProp);
                } else {
                    logReportingService.logWarning(
                        `StaticProp ${staticPropKey} already exists`,LOG_CONTEXT)
                }
                break;
            }

            case 'update': {
                const targetStaticProp = rawObject.staticProps.find(sp =>
                    `${vxkey}.${sp.propertyPath}` === staticPropKey)

                if (targetStaticProp)
                    targetStaticProp.value = newValue;
                else
                    logReportingService.logWarning(
                        `Could not find staticProp ${staticPropKey}`,LOG_CONTEXT)

                break;
            }

            case 'remove': {
                rawObject.staticProps = rawObject.staticProps.filter(prop => prop.propertyPath !== propertyPath);
                break;
            }

            default: {
                logReportingService.logWarning(
                    `Unknown action ${action}`,LOG_CONTEXT)
                return;
            }
        }
    }






    /**
     * Refreshes a spline in the animation engine's data structure and optionally re-renders.
     * @param action - The action to perform: 'create', 'update', or 'remove'.
     * @param splineKey - The key identifying the spline.
     * @param reRender - Whether to re-render after the refresh (default is true).
     */
    hydrateSpline<A extends HydrateSplineActions>(params: HydrateSplineParams<A>) {
        const { action, splineKey, nodeIndex, newData, initialTension } = params
        const LOG_CONTEXT = {module:"HydrationService", functionName:"hydrateSpline", additionalData:{action}}

        const timelineManagerAPI = useTimelineManagerAPI.getState();

        const hydrateWasmSpline = () => {
            const rawSpline = this.timeline.splines[splineKey]
            const spline = this._splinesCache.get(splineKey)
            if (spline)
                spline.free();

            const newWasmSpline = new wasm_Spline(
                rawSpline.nodes.map(n => wasm_Vector3.new(n[0], n[1], n[2])),
                false,
                0.5
            );
            this._splinesCache.set(splineKey, newWasmSpline);
        }

        switch (action) {
            case "create": {
                const edSpline = timelineManagerAPI.splines[splineKey];

                const newRawSpline: RawSpline = {
                    splineKey: edSpline.splineKey,
                    vxkey: edSpline.vxkey,
                    nodes: [...edSpline.nodes]
                }

                // set the currentTimeline spline
                if (!this.timeline.splines)
                    this.timeline.splines = {};

                this.timeline.splines[splineKey] = newRawSpline;

                // Create the WebAssembly spline object in the cache if not already created
                if (!this._splinesCache.get(splineKey)) {
                    const wasmSpline = new wasm_Spline(
                        newRawSpline.nodes.map(n => wasm_Vector3.new(n[0], n[1], n[2])),
                        false,
                        initialTension
                    );
                    this._splinesCache.set(splineKey, wasmSpline);
                }
                break;
            }
            case "remove": {
                delete this.timeline.splines[splineKey];

                const spline = this._splinesCache.get(splineKey)
                // Free the WebAssembly object in the cache
                if (spline) {
                    spline.free();
                    this._splinesCache.delete(splineKey)
                }
                break;
            }
            case "clone": {
                const spline = timelineManagerAPI.splines[splineKey];
                if (!spline) {
                    logReportingService.logWarning(
                        `Spline ${splineKey} was not found timelineManagerAPI spline state`,LOG_CONTEXT)
                    return;
                }

                // Update currentTimeline splines
                this.timeline.splines = {
                    ...this.timeline.splines,
                    [splineKey]: {
                        ...this.timeline.splines[splineKey],
                        nodes: [...spline.nodes] // Clone the nodes array
                    }
                };

                hydrateWasmSpline();

                break;
            }
            case "updateNode": {
                // Clone the entire splines object to make it mutable
                const rawSpline = this.timeline.splines[splineKey];
                const newNodes = [...rawSpline.nodes];
                newNodes[nodeIndex] = newData

                rawSpline.nodes = newNodes;

                // Reassign the modified spline back to the splines object
                this.timeline.splines[splineKey] = rawSpline;

                hydrateWasmSpline();
                break;
            }
            case "removeNode": {
                const rawSpline = this.timeline.splines[splineKey];
                const newNodes = [...rawSpline.nodes]; // Creates a shallow copy
                newNodes.splice(nodeIndex, 1);

                rawSpline.nodes = newNodes

                hydrateWasmSpline();
                break;
            }
            default: {
                logReportingService.logWarning(
                    `Unknown action ${action}`,LOG_CONTEXT)
                return;
            }
        }
    }






    /**
     * Refreshes settings for an object in the animation engine's data structure.
     * @param action - The action to perform: 'set' or 'remove'.
     * @param settingKey - The key identifying the setting.
     * @param vxkey - The unique identifier for the object.
     */
    hydrateSetting(
        action: 'set' | 'remove',
        settingKey: string,
        vxkey: string,
    ) {
        if (!this.timeline.settings) {
            this.timeline.settings = {};
        }

        if (!this.timeline.settings[vxkey]) {
            this.timeline.settings[vxkey] = {};
        }

        const LOG_CONTEXT = {module:"HydrationService", functionName:"hydrateSetting", additionalData:{action}}

        if (DEBUG_SETTING_HYDRATION)
            logReportingService.logInfo(
                `Hydrating setting ${settingKey}`,LOG_CONTEXT)

        switch (action) {
            case 'set': {
                const value = useObjectSettingsAPI.getState().settings[vxkey]?.[settingKey];
                if (value === undefined) {
                    logReportingService.logWarning(
                        `Setting ${settingKey} was not found for object ${vxkey}`,LOG_CONTEXT)
                    return;
                }
                this.timeline.settings[vxkey][settingKey] = value;
                break;
            }

            case 'remove': {
                delete this.timeline.settings[vxkey][settingKey];
                // Remove the object if no settings remain;
                if (Object.keys(this.timeline.settings[vxkey]).length === 0) {
                    delete this.timeline.settings[vxkey];
                }
                break;
            }

            default: {
                logReportingService.logWarning(
                    `Unknown action ${action}`,LOG_CONTEXT)
                return;
            }
        }
    }
}