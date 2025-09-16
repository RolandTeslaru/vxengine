import { useObjectPropertyAPI } from "@vxengine/managers/ObjectManager/stores/managerStore";
import { defaultSideEffectsMap } from "../defaultSideEffects";
import { AnimationEngine } from "../engine";
import { ParamSetterType, ParamSideEffectType, PropertyUpdateType } from "../types/ParamControlService";
import { ObjectPropertyStoreProps } from "@vxengine/types/objectPropertyStore";
import { produce } from "immer";
import { RawObject, RawTimeline } from "@vxengine/types/data/rawData";
import { extractDataFromTrackKey } from "@vxengine/managers/TimelineManager/utils/trackDataProcessing";
import { vxObjectProps } from "@vxengine/managers/ObjectManager/types/objectStore";
import * as THREE from "three"

/**
 * Service responsible for managing property updates and side effects in the animation engine.
 * Handles property setters, side effects, and property store updates in both development and production modes.
 */
export class PropertyControlService {
    private _IS_PRODUCTION: boolean = true;
    private _IS_DEVELOPMENT: boolean = false;

    private _pendingEngineUiUpdates: Map<string, number> = new Map()

    private _propertySetterCache: Map<string, ParamSetterType> = new Map()
    private _sideEffects: Map<string, ParamSideEffectType> = new Map()

    public static defaultSideEffects: Map<string, ParamSideEffectType> = defaultSideEffectsMap;
    public resolvedPropertyPaths: Map<string, boolean> = new Map()
    /**
     * Creates a new ParamControlService instance.
     * @param _animationEngine - Reference to the animation engine instance
     * @param _hydrationService - Service for hydrating properties and keyframes
     */
    constructor(
        private _animationEngine: AnimationEngine,
        private _object3DCache: Map<string, any>
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
    private _queueEngineUIUpdate(vxkey, propertyPath, value) {
        if (this._IS_DEVELOPMENT) {
            const trackKey = `${vxkey}.${propertyPath}`
            this._pendingEngineUiUpdates.set(trackKey, value)
        }
    }

    public flushEngineUIUpdates() {
        if (this._IS_DEVELOPMENT && this._pendingEngineUiUpdates.size > 0) {
            useObjectPropertyAPI.setState(produce((state: ObjectPropertyStoreProps) => {
                this._pendingEngineUiUpdates.forEach((_newValue, _trackKey) => {
                    state.properties[_trackKey] = _newValue
                })
            }))
            this._pendingEngineUiUpdates.clear();
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
            setter = this.generatePropertySetter(
                objectRef,
                vxkey,
                propertyPath
            )
            console.warn("Setter nof found in cahce for trackKey:", trackKey, ", generating one", setter)
        }
        setter(newValue);

        const sideEffect = this._sideEffects.get(trackKey) || PropertyControlService.defaultSideEffects.get(propertyPath)
        if (!!sideEffect)
            sideEffect(this._animationEngine, vxkey, propertyPath, objectRef, newValue)

        this._queueEngineUIUpdate(vxkey, propertyPath, newValue)
    }




    /**
     * Generates property setters for all tracks and static properties of a vxObject.
     * @param vxobject - The vxObject containing the properties
     * @param rawObject - The raw object data containing tracks and static properties
     */
    public generateObjectPropertySetters(vxkey: string, refObject: any, rawObject: RawObject) {
        rawObject.tracks.forEach(_track => {
            const trackKey = `${vxkey}.${_track.propertyPath}`
            if (!this._propertySetterCache.has(trackKey))
                this.generatePropertySetter(
                    refObject,
                    vxkey,
                    _track.propertyPath
                )
        })
        rawObject.staticProps.forEach(_staticProp => {
            const staticPropKey = `${vxkey}.${_staticProp.propertyPath}`
            if (!this._propertySetterCache.has(staticPropKey))
                this.generatePropertySetter(
                    refObject,
                    vxkey,
                    _staticProp.propertyPath
                )
        })

    }



    public rebuildObjectPropertySetters(vxobject: vxObjectProps, rawObject: RawObject) {
        this.removePropertySettersForObject(vxobject.vxkey)
        this.generateObjectPropertySetters(vxobject.vxkey, vxobject.ref.current, rawObject)
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



    public deletePropertySetter(vxkey: string, propertyPath: string) {
        const generalKey = `${vxkey}.${propertyPath}`
        this._propertySetterCache.delete(generalKey);
    }




    /**
     * Recomputes all property setters for objects in the timeline.
     * @param rawTimeline - The raw timeline data
     * @param object3DCache - Cache of 3D objects
     */
    public recomputeAllPropertySetters(rawTimeline: RawTimeline, object3DCache: Map<string, any>) {
        rawTimeline.objects.forEach(_rawObject => {
            const vxkey = _rawObject.vxkey
            const objectRef = object3DCache.get(vxkey) as THREE.Object3D
            if (!objectRef)
                return

            this.generateObjectPropertySetters(vxkey, objectRef, _rawObject);
        })
    }




    /**
     * Generates a setter function for a given property path.
     * @param object3DRef - Reference to the 3D object
     * @param vxkey - The unique identifier for the object
     * @param propertyPath - Dot-separated path to the property
     * @returns A setter function that updates the specified property
     */
    public generatePropertySetter(
        object3DRef: Record<string, any> | null, 
        vxkey: string, 
        propertyPath: string
    ): (newValue: number) => void {
        const propertyKeys = propertyPath.split('.');
        const trackKey = `${vxkey}.${propertyPath}`;
        let target;
        let setter: (newValue: number) => void;

        if(object3DRef){
            target = object3DRef;
        } else {
            target = this._object3DCache.get(vxkey);
            if(!target){
                console.warn(`Object '${vxkey}' not found in object3DCache`)
                setter = (newValue: number) => { }
                this._propertySetterCache.set(trackKey, setter)
            }
        }

        // Traverse the object
        for (let i = 0; i < propertyKeys.length - 1; i++) {
            target = target[propertyKeys[i]];
            if (target === undefined) {
                console.warn(`Property '${propertyKeys[i]}' undefined in '${propertyPath}' for '${vxkey}'`);
                setter = (newValue) => { };
                this._propertySetterCache.set(trackKey, setter)
                this.resolvedPropertyPaths.set(trackKey, false);
                return setter
            }
        }

        const finalKey = propertyKeys[propertyKeys.length - 1]
        if (target instanceof Map) {
            const entry = target.get(finalKey);
            if (entry && typeof entry === 'object' && 'value' in entry) {
                setter = (newValue: number) => {
                    entry.value = newValue;
                }
                this._propertySetterCache.set(trackKey, setter)
                this.resolvedPropertyPaths.set(trackKey, true);
                return setter
            }
        } else {
            setter = (newValue: number) => {
                target[finalKey] = newValue;
            }
            this._propertySetterCache.set(trackKey, setter)
            this.resolvedPropertyPaths.set(trackKey, true);
            return setter
        }
    }




    /**
     * Registers a side effect callback for a specific track.
     * @param trackKey - The unique identifier for the track
     * @param callback - The side effect callback function
     */
    public registerSideEffect(trackKey: string, callback: ParamSideEffectType): void {
        this._sideEffects.set(trackKey, callback);
    }




    /**
     * Retrieves the side effect for a specific track.
     * @param trackKey - The unique identifier for the track
     * @returns The side effect callback function or undefined if none exists
     */
    public getSideEffect(trackKey: string): ParamSideEffectType {
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
    

    public hasSetter(vxkey: string, propertyPath: string): boolean {
        return this._propertySetterCache.has(`${vxkey}.${propertyPath}`)
    }


    public isSetterResolved(vxkey: string, propertyPath){
        const trackKey = `${vxkey}.${propertyPath}`
        if(this.resolvedPropertyPaths.has(trackKey)){
            if(this.resolvedPropertyPaths.get(trackKey))
                return true;
            else
                return false;
        } else {
            return true;
        }
    }
}
