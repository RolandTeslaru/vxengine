// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { Emitter } from './emitter';
import { Events, EventTypes } from './events';
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';

import * as THREE from "three"
import { IAnimationEngine, TrackSideEffectCallback } from './types/engine';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager/store';
import { js_interpolateNumber } from './utils/interpolateNumber';
import { cloneDeep } from 'lodash';

import { useSourceManagerAPI } from '../managers/SourceManager/store'
import { useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import { invalidate } from '@react-three/fiber';
import { HydrationService } from './services/HydrationService';
import { logReportingService } from './services/LogReportingService';
import { WasmService } from './services/WasmService';
import { SplineService } from './services/SplineService';
import { RawKeyframe, RawObject, RawProject, RawTimeline } from '@vxengine/types/data/rawData';
import { PropertyControlService } from './services/PropertyControlService';
import { ParamModifierService } from './services/ParamModifierService';
import { create } from 'zustand';
import { TimelineStoreStateProps, useAnimationEngineAPI } from './store';

const DEBUG_RERENDER = false;
const DEBUG_OBJECT_INIT = false;

const LOG_MODULE = "AnimationEngine"

export class AnimationEngine extends Emitter<EventTypes> implements IAnimationEngine {

  public useAnimationEngine = useAnimationEngineAPI
  private get _state() { return useAnimationEngineAPI.getState() }

  // ====================================================
  // Public Static Members
  // ====================================================
  public static readonly ENGINE_PRECISION = 4
  public static readonly VALUE_CHANGE_THRESHOLD = 0.001;

  public cameraRequiresProjectionMatrixRecalculation: boolean = false;
  public environmentRequiresUpdate: boolean = false

  // ====================================================
  // Public Instance Getters (API)
  // ====================================================
  public get currentTimeline() { return this._currentTimeline }
  public get rawObjectCache() { return this._rawObjectCache }
  public get currentTime() { return this._currentTime }

  public get splineService(): SplineService { return this._splineService }
  public get hydrationService(): HydrationService { return this._hydrationService }
  public get propertyControlService(): PropertyControlService { return this._propertyControlService }
  public get paramModifierService(): ParamModifierService { return this._paramModifierService }

  // ====================================================
  // Private Instance Properties
  // ====================================================
  private _id: string
  private _timerId: number;
  private _isReady: boolean = false

  private _object3DCache: Map<string, THREE.Object3D> = new Map();
  private _rawObjectCache: Map<string, RawObject> = new Map();
  private _lastInterpolatedValues: Map<string, number> = new Map();

  private _currentTimeline: RawTimeline = null;
  private _currentTime: number = 0;
  private _prevTime: number;
  private _playPromiseResolve: ((value: void | PromiseLike<void>) => void) | null = null;
  private _playPromiseReject: ((reason?: any) => void) | null = null;
  /**
   * Interpolation function used for keyframe interpolation.
   * Defaults to a JS implementation, then replaced by the WASM version.
   */
  private _interpolateNumberFunction: (
    startValue: number,
    endValue: number,
    startHandleX: number,
    startHandleY: number,
    endHandleX: number,
    endHandleY: number,
    progress: number
  ) => number = js_interpolateNumber;

  // ====================================================
  // Services
  // ====================================================
  private _hydrationService: HydrationService;
  private _splineService: SplineService
  private _wasmService: WasmService;
  private _paramModifierService: ParamModifierService
  private _propertyControlService: PropertyControlService

  private _IS_DEVELOPMENT: boolean = false;
  private _IS_PRODUCTION: boolean = false;

  constructor() {
    super(new Events());
    if (this._isOnServer()) {
      console.warn("AnimationEngine instantiation skipped on server-side.");
      return;
    }

    this._id = Math.random().toString(36).substring(2, 9); // Generate a random unique ID
    logReportingService.logInfo(
      `Created instance with ID: ${this._id}`, { module: LOG_MODULE, functionName: "constructor" });

    // Initialize Services
    this._wasmService = new WasmService(
      "/assets/wasm/rust_bg.wasm",
      (wasm_interpolator) => {
        this._interpolateNumberFunction = wasm_interpolator;
      }
    );
    this._propertyControlService = new PropertyControlService(this, this._object3DCache)
    this._splineService = new SplineService(this._wasmService);
    this._hydrationService = new HydrationService(this._rawObjectCache, this._splineService, this._propertyControlService);
    this._paramModifierService = new ParamModifierService(this, this._hydrationService)
  }

  public initialize(nodeEnv: "production" | "development"){
    if (nodeEnv === "production")
      this._IS_PRODUCTION = true;
    else if (nodeEnv === "development")
      this._IS_DEVELOPMENT = true;

    this._hydrationService.setMode(nodeEnv);
    this._paramModifierService.setMode(nodeEnv)
    this._propertyControlService.setMode(nodeEnv)   
  }


  // ====================================================
  // Public API Methods
  // ====================================================

  /**
  * Loads timelines into the animation engine, synchronizes local storage, and initializes the first timeline.
  * @param timelines - A record of timelines to load.
  */
  public loadProject(diskData: RawProject, nodeEnv: "production" | "development", isMounting = false) {
    if (nodeEnv === "production")
      this._IS_PRODUCTION = true;
    else if (nodeEnv === "development")
      this._IS_DEVELOPMENT = true;

    this._hydrationService.setMode(nodeEnv);
    this._paramModifierService.setMode(nodeEnv)
    this._propertyControlService.setMode(nodeEnv)

    const LOG_CONTEXT = { module: "AnimationEngine", functionName: "loadProject", additionalData: { IS_PRODUCTION: this._IS_PRODUCTION, IS_DEVELOPMENT: this._IS_DEVELOPMENT } }

    logReportingService.logInfo(
      `Loading Project ${diskData.projectName} in ${(nodeEnv === "production") && "production mode"} ${(nodeEnv === "development") && "dev mode"}`, LOG_CONTEXT)

    const timelines = diskData.timelines
    useAnimationEngineAPI.setState({ projectName: diskData.projectName })

    if (this._IS_DEVELOPMENT) {
      const syncResult: any = useSourceManagerAPI.getState().syncLocalStorage(diskData);
      if (syncResult?.status === 'out_of_sync')
        useAnimationEngineAPI.setState({ isPlaying: false })
    }
    else
      useAnimationEngineAPI.setState({ timelines: timelines })

    // Load the first timeline
    const firstTimeline = Object.values(timelines)[0];
    const firstTimelineID = firstTimeline.id;

    this.setCurrentTimeline(firstTimelineID);

    logReportingService.logInfo(
      `Finished loading project: ${diskData.projectName} with ${Object.entries(diskData.timelines).length} timelines`, LOG_CONTEXT)

    // Initialize the core UI
    useUIManagerAPI.getState().setMountCoreUI(true);
    this._isReady = true;
  }





  /**
   * Sets the current timeline by updating the state, caching splines, and re-rendering.
   * @param timelineId - The identifier of the timeline to set as current.
   * @param isMounting - During the initial mount phase, the Canvas element isn't mounted.
   */
  public setCurrentTimeline(timelineId: string) {
    const LOG_CONTEXT = {
      module: "AnimationEngine",
      functionName: "setCurrentTimeline",
      additionalData: { timelines: this._state.timelines, IS_DEVELOPMENT: this._IS_DEVELOPMENT, IS_PRODUCTION: this._IS_PRODUCTION }
    }
    // Update the current timeline ID in the state

    logReportingService.logInfo(`Setting current timeline to ${timelineId}`, LOG_CONTEXT)

    const selectedTimeline: RawTimeline = this._state.timelines[timelineId];
    if (!selectedTimeline)
      logReportingService.logFatal(
        `Timeline with id ${timelineId} was not found`, LOG_CONTEXT)

    // Set the states in the store
    useAnimationEngineAPI
      .setState({ currentTimeline: selectedTimeline, currentTimelineID: timelineId })
 
    this._currentTimeline = selectedTimeline;

    this._propertyControlService
        .recomputeAllPropertySetters(this._currentTimeline, this._object3DCache)

    this._applyTracksOnTimeline(this.currentTime, true)

    this._currentTimeline.objects.forEach(rawObject => {
      this._rawObjectCache.set(rawObject.vxkey, rawObject);
    })



    const { objects: rawObjects, splines: rawSplines } = selectedTimeline;
    // Cache the splines asynchronously
    this._splineService.cacheSplines(rawSplines)
    // .catch(error => {
    //   logReportingService.logError(
    //     `Error caching splines, ${error}`, LOG_CONTEXT)
    // });


    if (this._IS_DEVELOPMENT) {
      this.hydrationService.setCurrentTimeline(selectedTimeline);
      // Set the editor data
      useTimelineManagerAPI.getState().setEditorData(rawObjects, cloneDeep(rawSplines), this._IS_DEVELOPMENT);
      useTimelineManagerAPI.getState().setCurrentTimelineLength(selectedTimeline.length)
    }
  }





  /**
   * Sets the current time of the animation engine and triggers relevant events.
   * @param time - The new current time.
   * @param isTick - Indicates if the time update is part of the engine's tick.
   */
  public setCurrentTime(time: number, isTick: boolean = false) {
    this._currentTime = time;

    if (isTick) {
      this.trigger('timeUpdatedByEngine', { time, engine: this });
    } else {
      this._applyTracksOnTimeline(time)
      this._updateCameraIfNeeded();
      this._propertyControlService.flushEngineUIUpdates()
      this.trigger('timeUpdatedByEditor', { time, engine: this });

      invalidate();
    }

    // Always trigger a general time updated event
    this.trigger('timeUpdated', { time });
  }





  /**
  * Re-renders the animation by applying static properties and keyframes.
  * @param params - An object containing optional parameters:
  *   - time: The specific time to apply keyframes.
  *   - force: Whether to force re-rendering even if the animation is playing.
  *   - cause: A string describing the cause of the re-render.
  */
  public reRender(params: { time?: number; force?: boolean; cause?: string; } = {}) {
    const { time, force = false, cause } = params;

    if (this._state.isPlaying && !force)
      return;

    if (DEBUG_RERENDER)
      logReportingService.logInfo(
        `Re-rendering because ${cause}`, { module: LOG_MODULE, functionName: "reRender" })

    const targetTime = time !== undefined ? time : this._currentTime;

    this._applyAllStaticProps();
    this._applyTracksOnTimeline(targetTime)
    this._updateCameraIfNeeded();
    this._propertyControlService.flushEngineUIUpdates();

    invalidate();
  }





  /**
   * Starts playing the animation, optionally up to a specific time with an auto-end feature.
   * @param param - An object containing optional parameters:
   *   - toTime: The time to play up to.
   *   - autoEnd: Whether to automatically end the animation when `toTime` is reached.
   * @returns True if the animation starts playing, false otherwise.
   */
  public play(param: { toTime?: number; autoEnd?: boolean; } = {}): Promise<void> {
    let { toTime, autoEnd = true } = param;
    if (toTime === undefined) {
      toTime = this._currentTimeline.length;
    }

    if (this._playPromiseReject) {
      this._playPromiseResolve = null;
    }

    return new Promise((resolve, reject) => {
      this._playPromiseResolve = resolve;

      useAnimationEngineAPI.setState({ isPlaying: true })

      logReportingService.logInfo(
        `Started Playing`, { module: "AnimationEngine", functionName: "play" })

      this._timerId = requestAnimationFrame((time: number) => {
        this._prevTime = time;
        this._tick(time, toTime, autoEnd);
      });

    })
  }





  /**
   * Pauses the animation playback and triggers a 'paused' event.
   * Rejects the pending play promise if one exists.
   */
  public pause() {
    logReportingService.logInfo("Pause triggered", { module: LOG_MODULE, functionName: "pause" })
    if (this._state.isPlaying) { // Only act if it was playing
      useAnimationEngineAPI.setState({ isPlaying: false })
      cancelAnimationFrame(this._timerId); // Stop the animation loop

      this.trigger('paused', { engine: this });
    }
    // If not playing, do nothing - don't cancelAnimationFrame again or reject a resolved/non-existent promise
  }


  // ====================================================
  // Public Object Lifecycle
  // ====================================================

  /**
   * Initializes object properties when the object mounts.
   * Applies initial tracks and static properties to the object.
   * @param vxObject - The object to initialize.
   */
  public handleObjectMount(vxObject: vxObjectProps) {
    const vxkey = vxObject.vxkey;

    // Initialize all Side Effects
    vxObject.params.forEach((param) => {
      const sideEffect = param.sideEffect;
      const trackKey = `${vxkey}.${param.propertyPath}`
      if (!!sideEffect) {
        this._propertyControlService.registerSideEffect(trackKey, sideEffect)
      }
    })

    // Cache the THREE.Object3D reference
    const object3DRef = this._cacheObject3DRef(vxObject);
    if (DEBUG_OBJECT_INIT)
      logReportingService.logInfo(`Initializing vxobject ${vxObject.name}`, { module: LOG_MODULE, functionName: "initObjectOnMount", additionalData: { vxObject } })

    const rawObject = this._state.currentTimeline.objects.find(obj => obj.vxkey === vxkey);

    if (!rawObject)
      return

    this._propertyControlService.generateObjectPropertySetters(vxObject, rawObject)

    this._applyTracksOnObject(this._currentTime, rawObject)
    this._applyStaticPropsOnObject(rawObject, object3DRef);

    this._propertyControlService.flushEngineUIUpdates();
  }




  /**
   * Handles cleanup when an object is unmounted.
   * Removes the object reference from internal caches.
   * @param vxkey - The unique key of the object to clean up.
   */
  public handleObjectUnMount(vxkey: string) {
    if (!this._isReady)
      return;

    this._object3DCache.delete(vxkey);
    this._propertyControlService.removePropertySettersForObject(vxkey);
  }






  // ====================================================
  // Private Helper Methods
  // ====================================================

  /**
   * Main ticker function that updates the animation state and schedules the next frame.
   * @param data - An object containing:
   *   - now: The current time from `requestAnimationFrame`.
   *   - autoEnd: Whether to automatically end the animation at a certain time.
   *   - to: The time to play up to.
   */
  private _tick(now: number, to: number, autoEnd: boolean = false) {
    if (this._state.isPlaying === false) {
      return;
    }

    const deltaTime = Math.min(1000, now - this._prevTime) / 1000;
    let newCurrentTime = this._currentTime + deltaTime * this._state.playRate;
    this._prevTime = now;

    let isFinished = false;
    if(newCurrentTime >= to){
      newCurrentTime = to;
      isFinished = true;
    }

    this.setCurrentTime(newCurrentTime, true);
    this._applyTracksOnTimeline(newCurrentTime);
    this._updateCameraIfNeeded();
    this._propertyControlService.flushEngineUIUpdates();
    invalidate();

    if(isFinished){
      // Resolve Promise
      if (this._playPromiseResolve){
        this._playPromiseResolve();
        this._playPromiseResolve = null;
      }

      this._end();
      return;
    }

    this._timerId = requestAnimationFrame((time) => {
      this._tick(time, to, autoEnd);
    });
  }





  /**
   * Caches the THREE.Object3D reference of the vxObject.
   * @param vxObject - The object whose reference is to be cached.
   * @returns The cached THREE.Object3D instance or null if not available.
   */
  private _cacheObject3DRef(vxObject: vxObjectProps): THREE.Object3D | null {
    const object3DRef = vxObject.ref.current;
    if (object3DRef) {
      this._object3DCache.set(vxObject.vxkey, object3DRef);
      return object3DRef;
    }
    return null;
  }





  /**
   * Applies initial static properties to the object.
   * @param rawObject - The raw object containing static properties.
   * @param object3DRef - Reference to the THREE.Object3D instance.
   */
  private _applyStaticPropsOnObject(rawObject: RawObject, object3DRef: THREE.Object3D | null) {
    if (!object3DRef) {
      logReportingService.logWarning(
        `Could not initialize staticProps for ${rawObject.vxkey} because no object3d references was passed`, { module: LOG_MODULE, functionName: "_applyStaticPropsOnObject" })
      return;
    }
    rawObject.staticProps.forEach(staticProp => {
      this._propertyControlService.updateProperty(
        rawObject.vxkey,
        staticProp.propertyPath,
        staticProp.value,
        object3DRef
      )
    });
  }





  /**
   * Applies all tracks in the timeline to their respective objects at the specified time.
   * This method iterates through all raw objects in the cache and applies their tracks.
   * @param currentTime - The current time in the timeline to apply tracks at
   * @param force - Optional flag to force the application of tracks regardless of other conditions
   */
  private _applyTracksOnTimeline(currentTime: number, force?: boolean) {
    this._rawObjectCache.forEach(rawObject => {
      this._applyTracksOnObject(currentTime, rawObject, force)
    });
  }





  /**
   * Applies all tracks from a raw object to its corresponding 3D object at the specified time.
   * This method processes each track in the raw object and applies its keyframes.
   * @param currentTime - The current time in the timeline to apply tracks at
   * @param rawObject - The raw object containing the tracks to apply
   * @param force - Optional flag to force the application of tracks regardless of other conditions
   */
  private _applyTracksOnObject(currentTime: number, rawObject: RawObject, force?: boolean
  ) {
    const objectRef = this._object3DCache.get(rawObject.vxkey)
    if (!objectRef) {
      return;
    }
    rawObject.tracks.forEach(rawTrack => {
      this._applyKeyframesOnTrack(
        rawObject.vxkey,
        rawTrack.propertyPath,
        rawTrack.keyframes,
        currentTime,
        objectRef,
        force
      )
    }
    )
  }





  /**
   * Applies interpolated keyframe values to the specified object's property.
   * @param vxkey - The unique identifier for the object.
   * @param propertyPath - The path to the property to be updated.
   * @param keyframes - An array of keyframes for interpolation.
   * @param currentTime - The current time in the animation timeline.
   * @param recalculateAll - Whether to recalculate outside keyframe bounds.
   */
  private _applyKeyframesOnTrack(
    vxkey: string,
    propertyPath: string,
    keyframes: RawKeyframe[],
    currentTime: number,
    objectRef: any,
    force: boolean = false
  ) {
    if (keyframes.length === 0) return;

    const newValue = this._calculateInterpolatedValue(keyframes, currentTime);

    const cacheKey = `${vxkey}.${propertyPath}`;
    const lastValue = this._lastInterpolatedValues.get(cacheKey);

    // Only update the property if its under the threshold
    // or its undefined ( in the initial state )
    if (lastValue === undefined || Math.abs(newValue - lastValue) > AnimationEngine.VALUE_CHANGE_THRESHOLD) {
      this._propertyControlService.updateProperty(vxkey, propertyPath, newValue, objectRef);
      // this._updateObjectProperty(vxkey, propertyPath, newValue);
      this._lastInterpolatedValues.set(cacheKey, newValue);
    }
  }




  /**
   * Updates the camera's projection matrix if required.
   */
  private _updateCameraIfNeeded() {
    if (!this.cameraRequiresProjectionMatrixRecalculation)
      return;

    const camera = this._object3DCache.get('perspectiveCamera') as THREE.PerspectiveCamera;
    if (camera) {
      camera.updateProjectionMatrix();
      this.cameraRequiresProjectionMatrixRecalculation = false;
    } else
      logReportingService.logWarning(
        "PerspectiveCamera was not found in object cache", { module: LOG_MODULE, functionName: "_updateCameraIfNeeded" })
  }







  /**
   * Calculates the interpolated value for the given keyframes at the specified time.
   * @param keyframes - An array of keyframes.
   * @param currentTime - The current time in the animation timeline.
   * @returns The interpolated value 
   */
  private _calculateInterpolatedValue(
    keyframes: RawKeyframe[],
    currentTime: number,
  ): number {
    if (currentTime < keyframes[0].time) {
      return keyframes[0].value;
    }
    if (currentTime > keyframes[keyframes.length - 1].time) {
      return keyframes[keyframes.length - 1].value;
    }

    return this._interpolateKeyframes(keyframes, currentTime);
  }






  /**
   * Interpolates the value between keyframes based on the current time.
   * @param keyframes - Array of keyframes sorted by time.
   * @param currentTime - The current time in the animation timeline.
   * @returns The interpolated value at the current time.
   */
  private _interpolateKeyframes(keyframes: RawKeyframe[], currentTime: number): number {
    // Handle edge cases where currentTime is outside the keyframe time range
    if (currentTime <= keyframes[0].time) {
      return keyframes[0].value;
    }
    if (currentTime >= keyframes[keyframes.length - 1].time) {
      return keyframes[keyframes.length - 1].value;
    }

    // Find the index of the next keyframe after the current time
    const rightIndex = this._findNextKeyframeIndex(keyframes, currentTime);
    const leftIndex = rightIndex - 1;

    const startKeyframe = keyframes[leftIndex];
    const endKeyframe = keyframes[rightIndex];
    const duration = endKeyframe.time - startKeyframe.time;

    // Avoid division by zero
    if (duration === 0) {
      return startKeyframe.value;
    }

    // Calculate the normalized progress between the two keyframes
    const progress = AnimationEngine.truncateToDecimals(
      (currentTime - startKeyframe.time) / duration,
      AnimationEngine.ENGINE_PRECISION + 1
    );

    // Interpolate the value using the progress
    const interpolatedValue = this._interpolateNumber(startKeyframe, endKeyframe, progress);

    // Truncate the result to ensure precision
    return AnimationEngine.truncateToDecimals(
      interpolatedValue,
      AnimationEngine.ENGINE_PRECISION
    );
  }






  /**
   * Finds the index of the next keyframe after the current time.
   * @param keyframes - Array of keyframes sorted by time.
   * @param currentTime - The current time in the animation timeline.
   * @returns The index of the next keyframe.
   */
  private _findNextKeyframeIndex(keyframes: RawKeyframe[], currentTime: number): number {
    let left = 0;
    let right = keyframes.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midTime = keyframes[mid].time;

      if (currentTime < midTime) {
        right = mid - 1;
      } else if (currentTime > midTime) {
        left = mid + 1;
      } else {
        // Exact match found
        return mid;
      }
    }

    // Left is the index of the next keyframe after currentTime
    return left;
  }






  /**
   * Interpolates between two numeric keyframes using Bezier curves.
   * @param startKeyframe - The starting keyframe.
   * @param endKeyframe - The ending keyframe.
   * @param progress - Normalized progress between the keyframes (0 to 1).
   * @returns The interpolated numeric value.
   */
  private _interpolateNumber(
    startKeyframe: RawKeyframe,
    endKeyframe: RawKeyframe,
    progress: number
  ): number {
    const startValue = startKeyframe.value as number;
    const endValue = endKeyframe.value as number;

    // Default handle positions for Bezier curve if not specified
    const DEFAULT_IN_HANDLE = 0.3;
    const DEFAULT_OUT_HANDLE = 0.7;

    const startHandleX = startKeyframe.handles[2] ?? DEFAULT_IN_HANDLE;
    const startHandleY = startKeyframe.handles[3] ?? DEFAULT_IN_HANDLE;

    const endHandleX = endKeyframe.handles[0] ?? DEFAULT_OUT_HANDLE;
    const endHandleY = endKeyframe.handles[1] ?? DEFAULT_OUT_HANDLE;

    return this._interpolateNumberFunction(
      startValue,
      endValue,
      startHandleX,
      startHandleY,
      endHandleX,
      endHandleY,
      progress
    );
  }






  /**
   * Applies all static properties to their respective objects.
   */
  private _applyAllStaticProps() {
    this._rawObjectCache.forEach(obj => {
      if (obj.staticProps.length === 0) {
        return
      }

      const vxkey = obj.vxkey;
      const object3DRef = this._object3DCache.get(vxkey);

      if (!object3DRef) {
        return
      }

      obj.staticProps.forEach(staticProp => {
        this._propertyControlService.updateProperty(
          vxkey,
          staticProp.propertyPath,
          staticProp.value,
          object3DRef
        );
      });
    });
  }





  private _isOnServer(): boolean {
    return typeof window === "undefined"
  }


  /**
   * Handles the end of the animation playback.
   * Pauses the animation and triggers the 'ended' event.
   */
  private _end() {
    this.pause();
    this.trigger('ended', { engine: this });
  }

  static truncateToDecimals(num: number, decimals?: number): number {
    if (!decimals)
      decimals = AnimationEngine.ENGINE_PRECISION;

    const factor = Math.pow(10, decimals);
    return Math.trunc(num * factor) / factor;
  }
}