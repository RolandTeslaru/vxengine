import { useObjectPropertyAPI } from "@vxengine/managers/ObjectManager/stores/managerStore";
import { defaultSideEffectsMap } from "../defaultSideEffects";
import { AnimationEngine } from "../engine";
import { ParamSideEffectType } from "../types/ParamControlService";
import { ObjectPropertyStoreProps } from "@vxengine/types/objectPropertyStore";
import { produce } from "immer";
import { TimelineManagerAPIProps } from "@vxengine/managers/TimelineManager/types/store";
import { HydrationService } from "./HydrationService";
import { EditorKeyframe } from "@vxengine/types/data/editorData";
import { truncateToDecimals, useTimelineManagerAPI } from "@vxengine/managers/TimelineManager/store";

/**
 * Service responsible for managing property updates and side effects in the animation engine.
 * Handles property setters, side effects, and property store updates in both development and production modes.
 */
export class ParamModifierService {
    private _IS_PRODUCTION: boolean = true;
    private _IS_DEVELOPMENT: boolean = false;

    private _pendingUiUpdates: Map<string, number> = new Map()
    private _pendingTrackStateUpdates: Map<string, { keyframeKey: string, lastValue: number }> = new Map()
    private _pendingStaticPropStateUpdates: Map<string, { lastValue: number }> = new Map()

    public static defaultSideEffects: Map<string, ParamSideEffectType> = defaultSideEffectsMap;

    /**
     * Creates a new ParamControlService instance.
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


    public modifyParamValue(
        vxkey: string,
        propertPath: string,
        newValue: number,
        reRender: boolean = true
    ) {
        newValue = truncateToDecimals(newValue);
        const state = useTimelineManagerAPI.getState();
        const time = this._animationEngine.currentTime;

        // Hydrates or creates the staticProp or keyframe
        this._processParamModification(vxkey, propertPath, state, time, newValue);

        this.queueUiUpdate(vxkey, propertPath, newValue);

        if (reRender)
            this._animationEngine.reRender({ force: true })

        return this
    }


    private _processParamModification(
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
            const keyframesOnTracks = Object.values(track.keyframes);
            let targetKeyframe: EditorKeyframe | undefined;

            keyframesOnTracks.some(_kf => {
                if (_kf.time === time) {
                    targetKeyframe = _kf;
                    return true;
                }
                return false;
            })

            if (!targetKeyframe)
                state.createKeyframe({
                    vxkey,
                    propertyPath,
                    value: newValue,
                    reRender: false,
                    overlapKeyframeCheck: false
                })
            else {
                const targetKeyframeKey = targetKeyframe.id;
                this._hydrationService.hydrateKeyframe({
                    action: "updateValue",
                    vxkey,
                    propertyPath,
                    keyframeKey: targetKeyframeKey,
                    newValue
                })
                this._queueTrackStateUpdate(trackKey, targetKeyframeKey, newValue)
            }
        }
        else {
            const staticPropKey = trackKey
            const staticProp = state.staticProps[staticPropKey]

            if (!staticProp)
                state.createStaticProp({
                    vxkey,
                    propertyPath,
                    value: newValue,
                    reRender: false
                })
            else {
                this._hydrationService.hydrateStaticProp({
                    action: "update",
                    vxkey,
                    propertyPath,
                    newValue
                })
                this._queueStaticPropStateUpdate(staticPropKey, newValue)
            }
        }
    }

    private _queueTrackStateUpdate(trackKey: string, keyframeKey: string, lastValue: number) {
        this._pendingTrackStateUpdates.set(trackKey, { keyframeKey, lastValue })
    }

    private _queueStaticPropStateUpdate(staticPropKey: string, lastValue: number) {
        this._pendingStaticPropStateUpdates.set(staticPropKey, { lastValue })
    }

    public flushTimelineStateUpdates() {
        if (this._IS_DEVELOPMENT) {
            useTimelineManagerAPI.setState(produce((state: TimelineManagerAPIProps) => {
                this._pendingStaticPropStateUpdates.forEach(({ lastValue: _newValue }, _staticPropKey) => {
                    state.staticProps[_staticPropKey].value = _newValue;
                })

                this._pendingTrackStateUpdates.forEach(({
                    keyframeKey: _keyframeKey,
                    lastValue: _newValue
                }, _trackKey) => {
                    if (state.tracks[_trackKey])
                        state.tracks[_trackKey].keyframes[_keyframeKey].value = _newValue
                    else
                        console.error(`Error while trying to flush timeline updates. trach with trackKey: ${_trackKey} is undefined`, state.tracks)
                })
                state.changes += 1
            }))

            this._pendingTrackStateUpdates.clear();
            this._pendingStaticPropStateUpdates.clear();
        }
    }
}
