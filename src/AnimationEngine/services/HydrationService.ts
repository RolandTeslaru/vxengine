import { extractDataFromTrackKey } from "@vxengine/managers/TimelineManager/utils/trackDataProcessing";
import { useTimelineManagerAPI } from "@vxengine/managers/TimelineManager";
import { HydrateKeyframeAction, HydrateKeyframeParams, HydrateSettingParams, HydrateSplineActions, HydrateSplineParams, HydrateStaticPropAction, HydrateStaticPropParams, HydrateTrackParams } from "../types/HydrationService";
import { invalidate } from "@react-three/fiber";
import { useObjectSettingsAPI } from "@vxengine/managers/ObjectManager";
import { useSourceManagerAPI } from "@vxengine/managers/SourceManager";
import { logReportingService } from "./LogReportingService";
import { RawKeyframe, RawObject, RawSpline, RawTimeline, RawTrack } from "@vxengine/types/data/rawData";
import { EditorStaticProp } from "@vxengine/types/data/editorData";
import { SplineService } from "./SplineService";
import { AnimationEngine } from "../engine";
import { PropertyControlService } from "./PropertyControlService";


const LOG_MODULE = "HydrationService"

const DEBUG_TRACK_HYDRATION = false;
const DEBUG_KEYFRAME_HYDRATION = false;
const DEBUG_STATICPROP_HYDRATION = false;
const DEBUG_SPLINE_HYDRATION = false;
const DEBUG_SETTING_HYDRATION = false;

export class HydrationService {
    private _IS_PRODUCTION: boolean = false;
    private _IS_DEVELOPMENT: boolean = false;
    private _currentTimeline: RawTimeline = null;

    constructor(
        private _rawObjectCache: Map<string, RawObject>,
        private _splineService: SplineService,
        private _propertyControlService: PropertyControlService
    ) { }

    public setMode(nodeEnv: "production" | "development") {
        if (nodeEnv === "production")
            this._IS_PRODUCTION = true;
        else if (nodeEnv === "development")
            this._IS_DEVELOPMENT = true;
    }

    public setCurrentTimeline(newTimeline: RawTimeline) {
        this._currentTimeline = newTimeline;
    }

    /**
       * Initializes a new RawObject and adds it to the current timeline's objects.
       * Prevents duplicate entries by checking if an object with the same vxkey already exists.
       * @param vxkey - The unique identifier for the object.
       * @returns The newly created or existing RawObject.
       */
    private _initRawObjectOnTimeline(vxkey: string): RawObject {
        // Check if an object with the same vxkey already exists
        let rawObject = this._currentTimeline.objects.find(obj => obj.vxkey === vxkey);
        if (rawObject) {
            logReportingService.logWarning(
                `Raw Object with vxkey ${vxkey} already exists in the current timeline.`, { module: LOG_MODULE, functionName: "_initRawObjectOnTimeline" })

            return rawObject;
        }

        rawObject = {
            vxkey,
            tracks: [],
            staticProps: [],
            settings: {}
        }

        this._rawObjectCache.set(vxkey, rawObject);
        this._currentTimeline.objects.push(rawObject);

        return rawObject;
    }

    /**
   * Refreshes a track in the animation engine's data structure and optionally re-renders.
   * @param trackKey - The key identifying the track.
   * @param action - The action to perform: 'create' or 'remove'.
   * @param reRender - Whether to re-render after the refresh (default is true).
   */
    public hydrateTrack(params: HydrateTrackParams) {
        if (this._IS_PRODUCTION) {
            logReportingService.logError("Timeline Hydration is NOT allowed in Production Mode", {
                module: LOG_MODULE, functionName: "hydrateTrack"
            })
            return;
        }

        const { action, vxkey, propertyPath } = params
        const trackKey = `${vxkey}.${propertyPath}`

        let rawObject = this._currentTimeline.objects.find(rawObj => rawObj.vxkey === vxkey);

        const LOG_CONTEXT = { module: LOG_MODULE, functionName: "hydrateTrack", additionalData: { action } }

        if (!rawObject)
            rawObject = this._initRawObjectOnTimeline(vxkey);


        if (DEBUG_TRACK_HYDRATION)
            logReportingService.logInfo(`Hydrating track ${trackKey}`, LOG_CONTEXT)


        switch (action) {
            case 'create': {
                // Check if setter is present
                const propertyHasSetter = this._propertyControlService
                    .hasSetter(vxkey, propertyPath)

                if (!propertyHasSetter) {
                    this._propertyControlService
                        .generatePropertySetter(null, vxkey, propertyPath)
                }

                const rawTrack: RawTrack = {
                    propertyPath: propertyPath,
                    keyframes: [],
                };
                rawObject.tracks.push(rawTrack);

                if (DEBUG_TRACK_HYDRATION)
                    logReportingService.logInfo(`Track ${trackKey} has been created`, LOG_CONTEXT)

                break;
            }

            case 'remove': {
                rawObject.tracks = rawObject.tracks.filter(rawTrack => rawTrack.propertyPath !== propertyPath);

                if (DEBUG_TRACK_HYDRATION)
                    logReportingService.logInfo(`Track ${trackKey} has been removed`, LOG_CONTEXT)

                break;
            }

            default: {
                logReportingService.logWarning(`Unknown action ${action}`, LOG_CONTEXT)
                return;
            }
        }

        invalidate();
        useSourceManagerAPI.getState().saveDataToLocalStorage();
    }






    /**
     * Refreshes a keyframe in the animation engine's data structure and optionally re-renders.
     * @param trackKey - The key identifying the track.
     * @param action - The action to perform: 'create', 'update', or 'remove'.
     * @param keyframeKey - The key identifying the keyframe.
     * @param reRender - Whether to re-render after the refresh (default is true).
     */
    public hydrateKeyframe(params: HydrateKeyframeParams) {
        if (this._IS_PRODUCTION) {
            logReportingService.logError("Keyframe Hydration is NOT allowed in Production Mode", {
                module: LOG_MODULE, functionName: "hydrateKeyframe"
            })
            return;
        }

        const { vxkey, propertyPath, action, keyframeKey } = params;
        const trackKey = `${vxkey}.${propertyPath}`

        const LOG_CONTEXT = { module: LOG_MODULE, functionName: "hydrateKeyframe", additionalData: { action } }

        if (DEBUG_KEYFRAME_HYDRATION)
            logReportingService.logInfo(`Hydrating keyframe ${keyframeKey}`, LOG_CONTEXT)

        let rawObject = this._currentTimeline.objects.find(obj => obj.vxkey === vxkey);
        if (!rawObject)
            rawObject = this._initRawObjectOnTimeline(vxkey);

        const track = rawObject.tracks.find(t => t.propertyPath === propertyPath);
        if (!track) {
            logReportingService.logWarning(
                `Track with propertyPath ${propertyPath} was not found on object ${vxkey}`, LOG_CONTEXT)
            return;
        }

        const keyframes = track.keyframes;

        switch (action) {
            case 'create': {
                const { value, time, handles } = params
                const rawKeyframe: RawKeyframe = {
                    keyframeKey: keyframeKey,
                    value: value,
                    time: time,
                    handles: [...handles]
                }
                keyframes.push(rawKeyframe);
                keyframes.sort((a, b) => a.time - b.time);

                if (DEBUG_KEYFRAME_HYDRATION)
                    logReportingService.logInfo(
                        `Keyframe ${keyframeKey} has been added to track${trackKey}`, LOG_CONTEXT)

                break;
            }

            case 'updateTime': {
                const { newTime } = params
                const targetedKeyframe = keyframes.find(kf => kf.keyframeKey === keyframeKey)
                targetedKeyframe.time = newTime;
                keyframes.sort((a, b) => a.time - b.time);

                if (DEBUG_KEYFRAME_HYDRATION)
                    logReportingService.logInfo(
                        `Keyframe ${keyframeKey} in track ${trackKey} has had its time updated`, LOG_CONTEXT)

                break;
            }

            case 'updateValue': {
                const { newValue } = params;
                const targetedKeyframe = keyframes.find(kf => kf.keyframeKey === keyframeKey)
                targetedKeyframe.value = newValue;

                if (DEBUG_KEYFRAME_HYDRATION)
                    logReportingService.logInfo(
                        `Keyframe ${keyframeKey} in track ${trackKey} has had its value updated`, LOG_CONTEXT)

                break;
            }

            case 'updateHandles': {
                const { newHandles } = params
                const targetedKeyframe = keyframes.find(kf => kf.keyframeKey === keyframeKey)
                targetedKeyframe.handles = newHandles;

                if (DEBUG_KEYFRAME_HYDRATION)
                    logReportingService.logInfo(
                        `Keyframe ${keyframeKey} in track ${track} has had its handles updated`, LOG_CONTEXT)
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
                    `Unknown action ${action}`, LOG_CONTEXT)
                return;
            }
        }

        invalidate();
        useSourceManagerAPI.getState().saveDataToLocalStorage();
    }






    /**
     * Refreshes a static property in the animation engine's data structure and optionally re-renders.
     * @param action - The action to perform: 'create', 'update', or 'remove'.
     * @param staticPropKey - The key identifying the static property.
     * @param reRender - Whether to re-render after the refresh (default is true).
     */
    public hydrateStaticProp(params: HydrateStaticPropParams) {
        if (this._IS_PRODUCTION) {
            logReportingService.logError(
                "StaticProp Hydration is NOT allowed in Production Mode",
                { module: LOG_MODULE, functionName: "hydrateStaticProp" })
            return;
        }

        const { action, vxkey, propertyPath } = params;
        const staticPropKey = `${vxkey}.${propertyPath}`

        const LOG_CONTEXT = { module: LOG_MODULE, functionName: "hydrateStaticProp", additionalData: { action } }

        if (DEBUG_STATICPROP_HYDRATION)
            logReportingService.logInfo(
                `Hydrating StaticProp ${staticPropKey}`, LOG_CONTEXT)

        let rawObject = this._currentTimeline.objects.find(obj => obj.vxkey === vxkey);
        if (!rawObject)
            rawObject = this._initRawObjectOnTimeline(vxkey);


        switch (action) {
            case 'create': {
                const propertyHasSetter = this._propertyControlService
                    .hasSetter(vxkey, propertyPath)

                if (!propertyHasSetter) {
                    this._propertyControlService
                        .generatePropertySetter(null, vxkey, propertyPath)
                }

                const propExists = rawObject.staticProps.some(prop => prop.propertyPath === propertyPath);
                if (propExists) {
                    console.warn(`VXEngine Hydration Service: Could not find staticProp ${staticPropKey}`)

                    return;
                }

                const { value } = params

                const staticProp: EditorStaticProp = {
                    value,
                    vxkey,
                    propertyPath
                }
                rawObject.staticProps.push(staticProp);

                break;
            }

            case 'update': {
                const targetStaticProp = rawObject.staticProps.find(sp =>
                    `${vxkey}.${sp.propertyPath}` === staticPropKey)

                if (!targetStaticProp) {
                    console.warn(`VXEngine Hydration Service: Could not find staticProp ${staticPropKey}`)
                    return;
                }

                const { newValue } = params;

                targetStaticProp.value = newValue;

                break;
            }

            case 'remove': {
                rawObject.staticProps = rawObject.staticProps.filter(prop => prop.propertyPath !== propertyPath);
                break;
            }

            default: {
                logReportingService.logWarning(
                    `Unknown action ${action}`, LOG_CONTEXT)
                return;
            }
        }

        invalidate();
        useSourceManagerAPI.getState().saveDataToLocalStorage();
    }






    /**
     * Refreshes a spline in the animation engine's data structure and optionally re-renders.
     * @param action - The action to perform: 'create', 'update', or 'remove'.
     * @param splineKey - The key identifying the spline.
     * @param reRender - Whether to re-render after the refresh (default is true).
     */
    public hydrateSpline(params: HydrateSplineParams) {
        const { action, splineKey } = params
        if (this._IS_PRODUCTION) {
            logReportingService.logError(
                "Spline Hydration is NOT allowed in Production Mode", { module: LOG_MODULE, functionName: "hydrateSpline" })
            return;
        }

        const LOG_CONTEXT = { module: "HydrationService", functionName: "hydrateSpline", additionalData: { action } }

        const timelineManagerAPI = useTimelineManagerAPI.getState();

        switch (action) {
            case "create": {
                const { nodes, initialTension, objVxKey } = params

                const newRawSpline: RawSpline = {
                    splineKey: splineKey,
                    vxkey: objVxKey,
                    nodes: [...nodes]
                }

                // set the currentTimeline spline
                if (!this._currentTimeline.splines)
                    this._currentTimeline.splines = {};

                this._currentTimeline.splines[splineKey] = newRawSpline;

                if (this._splineService
                    .hasSpline(splineKey)
                )
                    logReportingService.logError(`Spline ${splineKey} already exists in spline cache. This should not be the case`, { module: "HydrationService", functionName: "hydrateSpline create", additionalData: this })
                else
                    this._splineService
                        .createSpline(newRawSpline, initialTension);

                break;
            }
            case "remove": {
                delete this._currentTimeline.splines[splineKey];

                this._splineService
                    .removeSpline(splineKey);
                break;
            }
            case "clone": {
                const spline = timelineManagerAPI.splines[splineKey];
                if (!spline) {
                    logReportingService.logWarning(
                        `Spline ${splineKey} was not found timelineManagerAPI spline state`, LOG_CONTEXT)
                    return;
                }

                // Update currentTimeline splines
                this._currentTimeline.splines = {
                    ...this._currentTimeline.splines,
                    [splineKey]: {
                        ...this._currentTimeline.splines[splineKey],
                        nodes: [...spline.nodes] // Clone the nodes array
                    }
                };

                this._hydrateWasmSpline(splineKey);

                break;
            }
            case "updateNode": {
                const { newData, nodeIndex } = params;
                // Clone the entire splines object to make it mutable
                const rawSpline = this._currentTimeline.splines[splineKey];
                const newNodes = [...rawSpline.nodes];
                newNodes[nodeIndex] = newData

                rawSpline.nodes = newNodes;

                // Reassign the modified spline back to the splines object
                this._currentTimeline.splines[splineKey] = rawSpline;

                this._hydrateWasmSpline(splineKey);
                break;
            }
            case "removeNode": {
                const { nodeIndex } = params;
                const rawSpline = this._currentTimeline.splines[splineKey];
                const newNodes = [...rawSpline.nodes]; // Creates a shallow copy
                newNodes.splice(nodeIndex, 1);

                rawSpline.nodes = newNodes

                this._hydrateWasmSpline(splineKey);
                break;
            }
            default: {
                logReportingService.logWarning(
                    `Unknown action ${action}`, LOG_CONTEXT)
                return;
            }
        }

        invalidate();
        useSourceManagerAPI.getState().saveDataToLocalStorage();
    }

    

    private _hydrateWasmSpline(splineKey: string){
        const rawSpline = this._currentTimeline.splines[splineKey]
        this._splineService
            .removeSpline(splineKey)
            .createSpline(rawSpline, 0.5)
    }





    /**
     * Refreshes settings for an object in the animation engine's data structure.
     * @param action - The action to perform: 'set' or 'remove'.
     * @param settingKey - The key identifying the setting.
     * @param vxkey - The unique identifier for the object.
     */
    public hydrateSetting(params: HydrateSettingParams) {
        const { vxkey, action, settingKey } = params
        const LOG_CONTEXT = { module: "HydrationService", functionName: "hydrateSetting", additionalData: { action, settingKey, vxkey } }
        if (this._IS_PRODUCTION) {
            logReportingService.logError("Setting Hydration is NOT allowed in Production Mode", LOG_CONTEXT);
            return;
        }

        const rawObject = this._currentTimeline.objects.find(obj => obj.vxkey === vxkey);
        if (!rawObject) {
            logReportingService.logWarning(`Could not hydrate setting because the rawObject doesn't exist.`, LOG_CONTEXT)
            return;
        }

        if (DEBUG_SETTING_HYDRATION)
            logReportingService.logInfo(
                `Hydrating setting ${settingKey}`, LOG_CONTEXT)

        switch (action) {
            case 'set': {
                const { value } = params;
                if (value === undefined) {
                    logReportingService.logWarning(
                        `Setting ${settingKey} was not found for object ${vxkey}`, LOG_CONTEXT)
                    return;
                }
                const rawSettings = rawObject.settings;
                if (!rawSettings)
                    rawObject.settings = {};

                rawObject.settings[settingKey] = value;

                break;
            }

            case 'remove': {
                const rawSettings = rawObject.settings;
                if (!rawSettings)
                    return

                delete rawSettings[settingKey];
                if (Object.entries(rawSettings).length === 0)
                    delete rawObject.settings;

                break;
            }

            default: {
                logReportingService.logWarning(
                    `Unknown action ${action}`, LOG_CONTEXT)
                return;
            }
        }
        invalidate();
        useSourceManagerAPI.getState().saveDataToLocalStorage();
    }

}