import { useObjectPropertyAPI } from "@vxengine/managers/ObjectManager/stores/managerStore";
import { defaultSideEffectsMap } from "../defaultSideEffects";
import { AnimationEngine } from "../engine";
import { PropertySetterType, PropertySideEffectType, PropertyUpdateType } from "../types/PropertyControlService";
import { ObjectPropertyStoreProps } from "@vxengine/types/objectPropertyStore";
import { produce } from "immer";
import { logReportingService } from "./LogReportingService";
import { RawObject, RawTimeline } from "@vxengine/types/data/rawData";
import { extractDataFromTrackKey } from "@vxengine/managers/TimelineManager/utils/trackDataProcessing";
import { TimelineManagerAPIProps } from "@vxengine/managers/TimelineManager/types/store";
import { HydrationService } from "./HydrationService";
import { EditorKeyframe } from "@vxengine/types/data/editorData";
import { truncateToDecimals, useTimelineManagerAPI } from "@vxengine/managers/TimelineManager/store";
import { vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";

/**
 * Service responsible for managing property updates and side effects in the animation engine.
 * Handles property setters, side effects, and property store updates in both development and production modes.
 */
export class PropertyControlService {
    private _IS_PRODUCTION: boolean = true;
    private _IS_DEVELOPMENT: boolean = false;

    private _propertySetterCache: Map<string, PropertySetterType> = new Map()
    private _sideEffects: Map<string, PropertySideEffectType> = new Map()

    private _pendingUiUpdates: Map<string, number> = new Map()

    public static defaultSideEffects: Map<string, PropertySideEffectType> = defaultSideEffectsMap;

    /**
     * Creates a new PropertyControlService instance.
     * @param _animationEngine - Reference to the animation engine instance
     * @param _hydrationService - Service for hydrating properties and keyframes
     */
    constructor(
        private _animationEngine: AnimationEngine,
        private _hydrationService: HydrationService
    ) { }




    /**
     * Sets the mode of the service (production or development).
     * @param nodeEnv - The environment mode to set
     */
    public setMode(nodeEnv: "production" | "development") {
        if (nodeEnv === "production") {
            this._IS_PRODUCTION = true;
            this._IS_DEVELOPMENT = false
        }
        else if (nodeEnv === "development") {
            this._IS_DEVELOPMENT = true;
            this._IS_PRODUCTION = false;
        }
    }




    /**
     * Queues a property update to be processed in development mode.
     * @param vxkey - The unique identifier for the object
     * @param propertyPath - The path to the property being updated
     * @param value - The new value to set
     */
    public queueUiUpdate(vxkey: string, propertyPath: string, value: number) {
        if (this._IS_DEVELOPMENT) {
            const trackKey = `${vxkey}.${propertyPath}`
            this._pendingUiUpdates.set(trackKey, value)
        }
    }




    /**
     * Flushes all pending property updates to the property store.
     * Only works in development mode and when there are pending updates.
     */
    public flushUiUpdates() {
        if (this._IS_DEVELOPMENT && this._pendingUiUpdates.size > 0) {
            useObjectPropertyAPI.setState(produce((state: ObjectPropertyStoreProps) => {
                this._pendingUiUpdates.forEach((_newValue, _trackKey) => {
                    state.properties[_trackKey] = _newValue
                })
            }))
            this._pendingUiUpdates.clear();
        }
    }




    /**
     * Updates a property value and triggers any associated side effects.
     * @param vxkey - The unique identifier for the object
     * @param propertyPath - The path to the property being updated
     * @param newValue - The new value to set
     * @param objectRef - Reference to the object being updated
     */
    public updateProperty(
        vxkey: string,
        propertyPath: string,
        newValue: number,
        objectRef: any
    ) {
        const trackKey = `${vxkey}.${propertyPath}`

        let setter = this._propertySetterCache.get(trackKey);
        if (!setter) {
            setter = this._generatePropertySetter(
                objectRef,
                vxkey,
                propertyPath
            )
            this._propertySetterCache.set(trackKey, setter);
        }
        setter(newValue);

        const sideEffect = this._sideEffects.get(trackKey) || PropertyControlService.defaultSideEffects.get(propertyPath)
        if (!!sideEffect)
            sideEffect(this._animationEngine, vxkey, propertyPath, objectRef, newValue)

        this.queueUiUpdate(vxkey, propertyPath, newValue)
    }




    /**
     * Generates property setters for all tracks and static properties of a vxObject.
     * @param vxobject - The vxObject containing the properties
     * @param rawObject - The raw object data containing tracks and static properties
     */
    public generateObjectPropertySetters(vxobject: vxObjectProps, rawObject: RawObject) {
        rawObject.tracks.forEach(_track => {
            const trackKey = `${vxobject.vxkey}.${_track.propertyPath}`
            if (!this._propertySetterCache.has(trackKey)) {
                const setter = this._generatePropertySetter(
                    vxobject.ref.current,
                    vxobject.vxkey,
                    _track.propertyPath
                )
                this._propertySetterCache.set(trackKey, setter);
            }
        })
        rawObject.staticProps.forEach(_staticProp => {
            const staticPropKey = `${vxobject.vxkey}.${_staticProp.propertyPath}`
            if (!this._propertySetterCache.has(staticPropKey)) {
                const setter = this._generatePropertySetter(
                    vxobject.ref.current,
                    vxobject.vxkey,
                    _staticProp.propertyPath
                )
                this._propertySetterCache.set(staticPropKey, setter);
            }
        })

    }



    public rebuildObjectPropertySetters(vxobject: vxObjectProps, rawObject: RawObject) {
        this.removePropertySettersForObject(vxobject.vxkey)
        this.generateObjectPropertySetters(vxobject, rawObject)
    }


    /**
     * Removes all property setters associated with a specific object.
     * @param vxkey - The unique identifier of the object whose setters should be removed
     */
    public removePropertySettersForObject(vxkey: string) {
        const prefix = `${vxkey}.`;
        for (const key of this._propertySetterCache.keys()) {
            if (key.startsWith(prefix)) {
                this._propertySetterCache.delete(key);
            }
        }
    }




    /**
     * Recomputes all property setters for objects in the timeline.
     * @param rawTimeline - The raw timeline data
     * @param object3DCache - Cache of 3D objects
     */
    public recomputeAllPropertySetters(rawTimeline: RawTimeline, object3DCache: Map<string, any>) {
        rawTimeline.objects.forEach(_rawObject => {
            const vxkey = _rawObject.vxkey
            const objectRef = object3DCache.get(vxkey)
            if (!objectRef)
                return

            this.generateObjectPropertySetters(objectRef, _rawObject);
        })
    }




    /**
     * Generates a setter function for a given property path.
     * @param object3DRef - Reference to the 3D object
     * @param vxkey - The unique identifier for the object
     * @param propertyPath - Dot-separated path to the property
     * @returns A setter function that updates the specified property
     */
    private _generatePropertySetter(object3DRef: any, vxkey: string, propertyPath: string): (newValue: any) => void {
        const propertyKeys = propertyPath.split('.');
        let target = object3DRef;

        // Traverse the object
        for (let i = 0; i < propertyKeys.length - 1; i++) {
            target = target[propertyKeys[i]];
            if (target === undefined) {
                console.warn(`Property '${propertyKeys[i]}' undefined in '${propertyPath}' for '${vxkey}'`);
                return (newValue) => { };
            }
        }

        const finalKey = propertyKeys[propertyKeys.length - 1]
        if(target instanceof Map){
            const entry = target.get(finalKey);
            if(entry && typeof entry === 'object' && 'value' in entry){
                console.log("Found entry in map for vxkey", vxkey, "propertyPath", propertyPath, "entry", entry, "target", target)
                return (newValue: number) => {
                    entry.value = newValue;
                }
            }
        }else {
            return (newValue: number) => {
                target[finalKey] = newValue;
            }
        }
    }




    /**
     * Registers a side effect callback for a specific track.
     * @param trackKey - The unique identifier for the track
     * @param callback - The side effect callback function
     */
    public registerSideEffect(trackKey: string, callback: PropertySideEffectType): void {
        this._sideEffects.set(trackKey, callback);
    }




    /**
     * Retrieves the side effect for a specific track.
     * @param trackKey - The unique identifier for the track
     * @returns The side effect callback function or undefined if none exists
     */
    public getSideEffect(trackKey: string): PropertySideEffectType {
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey)
        return this._sideEffects.get(trackKey) ?? PropertyControlService.defaultSideEffects.get(propertyPath)
    }




    /**
     * Checks if a track has an associated side effect.
     * @param trackKey - The unique identifier for the track
     * @returns True if the track has a side effect, false otherwise
     */
    public hasSideEffect(trackKey: string): boolean {
        const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);

        return this._sideEffects.has(trackKey) ?? !!PropertyControlService.defaultSideEffects.get(propertyPath)
    }




    /**
     * Modifies a parameter value and handles the update based on the specified mode.
     * @param mode - The modification mode (start, changing, end, or press)
     * @param vxkey - The unique identifier for the object
     * @param propertPath - The path to the property being modified
     * @param newValue - The new value to set
     * @param reRender - Whether to trigger a re-render after the update
     */
    public modifyParam(
        mode: "start" | "changing" | "end" | "press",
        vxkey: string,
        propertPath: string,
        newValue: number,
        reRender: boolean = true
    ) {
        newValue = truncateToDecimals(newValue);
        const state = useTimelineManagerAPI.getState();
        const time = this._animationEngine.currentTime;

        // Hydrates or creates the staticProp or keyframe
        this._processParamModification(mode, vxkey, propertPath, state, time, newValue);

        this.queueUiUpdate(vxkey, propertPath, newValue);

        if (reRender)
            this._animationEngine.reRender({ force: true })
    }



    
    /**
     * Processes a parameter modification based on the specified mode.
     * @param mode - The modification mode
     * @param vxkey - The unique identifier for the object
     * @param propertyPath - The path to the property being modified
     * @param state - The current timeline manager state
     * @param time - The current time in the timeline
     * @param newValue - The new value to set
     */
    private _processParamModification(
        mode: "start" | "changing" | "end" | "press",
        vxkey: string,
        propertyPath: string,
        state: TimelineManagerAPIProps,
        time: number,
        newValue: number
    ) {
        const trackKey = `${vxkey}.${propertyPath}`
        const track = state.tracks[trackKey];
        const isPropertyTracked = !!track;

        if (isPropertyTracked) {
            const keyframesOnTrack = Object.values(track.keyframes)
            let targetKeyframe: EditorKeyframe | undefined;

            keyframesOnTrack.some(_kf => {
                if (_kf.time === time) {
                    targetKeyframe = _kf;
                    return true;
                }
                return false;
            })

            if (!targetKeyframe) {
                state.createKeyframe({
                    trackKey,
                    value: newValue,
                    reRender: false
                })
            } else {
                const targetKeyframeKey = targetKeyframe.id;
                if (mode === "start" || mode === "changing")
                    this._hydrationService.hydrateKeyframe({
                        action: "updateValue",
                        vxkey,
                        propertyPath,
                        keyframeKey: targetKeyframeKey,
                        newValue
                    })
                else
                    state.setKeyframeValue(targetKeyframeKey, trackKey, newValue)
            }
        }
        else {
            const staticPropKey = trackKey;
            const staticProp = state.staticProps[staticPropKey]

            if (!staticProp)
                state.createStaticProp({
                    vxkey,
                    propertyPath,
                    value: newValue,
                    reRender: false
                })
            else {
                if (mode === "start" || mode === "changing")
                    this._hydrationService.hydrateStaticProp({
                        action: "update",
                        vxkey,
                        propertyPath,
                        newValue
                    })
                else
                    state.setStaticPropValue(staticPropKey, newValue, false)
            }
        }
    }
}
