// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { Emitter } from './emitter';
import { Events, EventTypes } from './events';
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';

import * as THREE from "three"
import { RawSpline, ITimeline, RawKeyframeProps, RawObjectProps, RawTrackProps, RawStaticPropProps, IStaticProps, TrackSideEffectCallback } from './types/track';
import { HydrateKeyframeAction, HydrateKeyframeParams, HydrateSplineActions, HydrateSplineParams, HydrateStaticPropAction, HydrateStaticPropParams, IAnimationEngine } from './types/engine';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager/store';
import { updateProperty } from '@vxengine/managers/ObjectManager/stores/managerStore';
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing';
import { useAnimationEngineAPI } from './store';
import { js_interpolateNumber } from './utils/interpolateNumber';
import { cloneDeep } from 'lodash';

import {
  Spline as wasm_Spline,
} from '../wasm/pkg';

import { useSourceManagerAPI } from '../managers/SourceManager/store'
import { useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import { invalidate } from '@react-three/fiber';
import { DiskProjectProps } from '@vxengine/types/engine';
import { defaultSideEffects } from './defaultSideEffects';
import { HydrationService } from './services/HydrationService';
import { logReportingService } from './services/LogReportingService';
import { WasmService } from './services/WasmService';
import { SplineService } from './services/SplineService';

const DEBUG_RERENDER = false;
const DEBUG_OBJECT_INIT = false;

const LOG_MODULE = "AnimationEngine"

export class AnimationEngine extends Emitter<EventTypes> implements IAnimationEngine {
  private _id: string
  private _timerId: number;
  private _prev: number;
  private _isReady: boolean = false

  private _splinesCache: Map<string, wasm_Spline> = new Map();
  private _propertySetterCache: Map<string, (target: any, newValue: any) => void> = new Map();
  private _object3DCache: Map<string, THREE.Object3D> = new Map();
  private _lastInterpolatedValues: Map<string, number> = new Map();
  private _sideEffectCallbacks: Map<string, TrackSideEffectCallback> = new Map();

  private _currentTimeline: ITimeline;
  private _currentTime: number = 0;
  private _interpolateNumberFunction: Function;

  private _cameraRequiresPerspectiveMatrixRecalculation;
  private readonly _propertiesRequiredToRecalculateCamera = ['fov', 'near', 'far', 'zoom'];

  private _IS_DEVELOPMENT: boolean = false;
  private _IS_PRODUCTION: boolean = false;

  private _hydrationService: HydrationService;
  private _wasmService: WasmService;
  private _splineService: SplineService

  static readonly ENGINE_PRECISION = 4
  static readonly VALUE_CHANGE_THRESHOLD = 0.001;

  static defaultSideEffects: Record<string, TrackSideEffectCallback> = defaultSideEffects;

  constructor() {
    super(new Events());

    this._id = Math.random().toString(36).substring(2, 9); // Generate a random unique ID
    logReportingService.logInfo(
      `Created instance with ID: ${this._id}`, { module: LOG_MODULE, functionName: "constructor" });

    this._interpolateNumberFunction = js_interpolateNumber;
    this._wasmService = new WasmService(
       "/assets/wasm/rust_bg.wasm",
       (wasm_interpolator) => {
        this._interpolateNumberFunction = wasm_interpolator;
       }
    );
    this._splineService = new SplineService(this._wasmService);
    this._currentTimeline = null
  }







  public get timelines() { return useAnimationEngineAPI.getState().timelines; }
  public get isPlaying() { return useAnimationEngineAPI.getState().isPlaying; }
  public get isPaused() { return !this.isPlaying; }
  public get playRate() { return useAnimationEngineAPI.getState().playRate }
  public get currentTimeline() { return this._currentTimeline }

  public get splineService(): SplineService {return this._splineService;}

  setIsPlaying(value: boolean) { useAnimationEngineAPI.setState({ isPlaying: value }) }






  /**
   * Sets the current timeline by updating the state, caching splines, and re-rendering.
   * @param timelineId - The identifier of the timeline to set as current.
   */
  setCurrentTimeline(timelineId: string) {
    const LOG_CONTEXT = { 
      module: "AnimationEngine", 
      functionName: "setCurrentTimeline", 
      additionalData: { timelines: this.timelines, IS_DEVELOPMENT: this._IS_DEVELOPMENT, IS_PRODUCTION: this._IS_PRODUCTION } 
    }
    // Update the current timeline ID in the state

    logReportingService.logInfo(`Setting current timeline to ${timelineId}`, LOG_CONTEXT)

    const selectedTimeline: ITimeline = this.timelines[timelineId];

    if (!selectedTimeline)
      logReportingService.logFatal(
        `Timeline with id ${timelineId} was not found`, LOG_CONTEXT)

    // Set the states in the store
    useAnimationEngineAPI.setState({ currentTimeline: selectedTimeline })
    useAnimationEngineAPI.setState({ currentTimelineID: timelineId });

    this._currentTimeline = selectedTimeline;

    const { objects: rawObjects, splines: rawSplines } = selectedTimeline;


    // Cache the splines asynchronously
    this._splineService.cacheSplines(rawSplines).then(() => {
      // Re-render after splines are cached
      this.reRender({ time: this._currentTime, force: true });
    }).catch(error => {
      logReportingService.logError(
        `Error caching splines, ${error}`, LOG_CONTEXT)
    });

    if (this._IS_DEVELOPMENT) {
      this._hydrationService = new HydrationService(this._IS_PRODUCTION, this._IS_DEVELOPMENT, this._currentTimeline, this._splinesCache);
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
  setCurrentTime(time: number, isTick: boolean = false) {
    this._currentTime = time;

    if (isTick) {
      this.trigger('timeUpdatedByEngine', { time, engine: this });
    } else {
      this._applyTracksOnTimeline(time)
      this.trigger('timeUpdatedByEditor', { time, engine: this });

      invalidate();
    }

    // Always trigger a general time updated event
    this.trigger('timeUpdated', { time });
  }






  getCurrentTime() {
    return this._currentTime;
  }





  /**
  * Loads timelines into the animation engine, synchronizes local storage, and initializes the first timeline.
  * @param timelines - A record of timelines to load.
  */
  loadProject(diskData: DiskProjectProps, nodeEnv: "production" | "development") {
    if (nodeEnv === "production")
      this._IS_PRODUCTION = true;
    else if (nodeEnv === "development")
      this._IS_DEVELOPMENT = true;

    const LOG_CONTEXT = { module: "AnimationEngine", functionName: "loadProject", additionalData: {IS_PRODUCTION: this._IS_PRODUCTION, IS_DEVELOPMENT:this._IS_DEVELOPMENT}}
    
    logReportingService.logInfo(
      `Loading Project ${diskData.projectName} in ${(nodeEnv === "production") && "production mode"} ${(nodeEnv === "development") && "dev mode"}`, LOG_CONTEXT)

    const timelines = diskData.timelines
    useAnimationEngineAPI.setState({ projectName: diskData.projectName })
    
    if (this._IS_DEVELOPMENT && typeof window !== 'undefined') {
      const syncResult: any = useSourceManagerAPI.getState().syncLocalStorage(diskData);
      if (syncResult?.status === 'out_of_sync')
        this.setIsPlaying(false);
    }
    else
      useAnimationEngineAPI.setState({ timelines: timelines })

    // Load the first timeline
    const firstTimeline = Object.values(timelines)[0];
    const firstTimelineID = firstTimeline.id;

    this.setCurrentTimeline(firstTimelineID);

    logReportingService.logInfo(
      `Finished loading project: ${diskData.projectName} with ${Object.entries(diskData.timelines).length} timelines`,LOG_CONTEXT)

    // Initialize the core UI
    useUIManagerAPI.getState().setMountCoreUI(true);
    this._isReady = true;
  }






  /**
  * Re-renders the animation by applying static properties and keyframes.
  * @param params - An object containing optional parameters:
  *   - time: The specific time to apply keyframes.
  *   - force: Whether to force re-rendering even if the animation is playing.
  *   - cause: A string describing the cause of the re-render.
  */
  reRender(params: { time?: number; force?: boolean; cause?: string; } = {}) {
    const { time, force = false, cause } = params;

    if (this.isPlaying && !force)
      return;

    if (DEBUG_RERENDER)
      logReportingService.logInfo(
        `Re-rendering because ${cause}`, { module: LOG_MODULE, functionName: "reRender" })

    this._applyAllStaticProps();

    const targetTime = time !== undefined ? time : this._currentTime;
    this._applyTracksOnTimeline(targetTime)
  }






  /**
   * Starts playing the animation, optionally up to a specific time with an auto-end feature.
   * @param param - An object containing optional parameters:
   *   - toTime: The time to play up to.
   *   - autoEnd: Whether to automatically end the animation when `toTime` is reached.
   * @returns True if the animation starts playing, false otherwise.
   */
  play(param: { toTime?: number; autoEnd?: boolean; } = {}) {
    let { toTime, autoEnd = true } = param;
    if (toTime === undefined) {
      toTime = this._currentTimeline.length;
    }

    // Check if is already playing or the current time has exceeded the toTime
    if (this.isPlaying
      || (toTime !== undefined && toTime <= this._currentTime)
    )
      return;

    this.setIsPlaying(true);

    this._timerId = requestAnimationFrame((time: number) => {
      this._prev = time;
      this._tick({ now: time, autoEnd, to: toTime });
    });

  }






  /**
   * Pauses the animation playback and triggers a 'paused' event.
   */
  pause() {
    logReportingService.logInfo("Pause triggered", { module: LOG_MODULE, functionName: "pause" })
    if (this.isPlaying) {
      this.setIsPlaying(false);
      this.trigger('paused', { engine: this });
    }
    cancelAnimationFrame(this._timerId);
  }






  /**
   * Initializes object properties when the object is mounted.
   * Applies initial tracks and static properties to the object.
   * @param vxObject - The object to initialize.
   */
  initObjectOnMount(vxObject: vxObjectProps) {
    const vxkey = vxObject.vxkey;

    if (!this._isReady)
      return;

    // Add object to editor data
    this._addToEditorData(vxObject);

    // Initialize all Side Effects
    Object.values(vxObject.params).forEach(param => {
      const sideEffect = param.sideEffect;
      const trackKey = `${vxkey}.${param.propertyPath}`
      if (sideEffect)
        this.registerSideEffect(trackKey, sideEffect)
    })

    // Cache the THREE.Object3D reference
    const object3DRef = this._cacheObject3DRef(vxObject);
    if (DEBUG_OBJECT_INIT)
      logReportingService.logInfo(`Initializing vxobject ${vxObject}`, { module: LOG_MODULE, functionName: "initObjectOnMount" })

    const rawObject = this.currentTimeline.objects.find(obj => obj.vxkey === vxkey);

    if (!rawObject)
      return

    this._applyTracksOnObject(this._currentTime, rawObject)
    this._applyStaticPropsOnObject(rawObject, object3DRef);
  }


  handleObjectUnMount(vxkey: string) {
    if (!this._isReady)
      return;

    this._object3DCache.delete(vxkey);
  }




  /**
   * Adds the vxObject to the editor's data.
   * @param vxObject - The object to add.
   */
  private _addToEditorData(vxObject: vxObjectProps) {
    useTimelineManagerAPI.getState().addObjectToEditorData(vxObject);
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



  public registerSideEffect(trackKey: string, callback: TrackSideEffectCallback): void {
    this._sideEffectCallbacks.set(trackKey, callback);
  }

  public getSideEffect(trackKey: string): TrackSideEffectCallback {
    return this._sideEffectCallbacks.get(trackKey);
  }





  /**
   * Main ticker function that updates the animation state and schedules the next frame.
   * @param data - An object containing:
   *   - now: The current time from `requestAnimationFrame`.
   *   - autoEnd: Whether to automatically end the animation at a certain time.
   *   - to: The time to play up to.
   */
  private _tick(data: { now: number; autoEnd?: boolean; to?: number }) {
    if (this.isPaused) {
      return;
    }

    invalidate();

    const { now, autoEnd = false, to } = data;

    const deltaTime = Math.min(1000, now - this._prev) / 1000;
    let newCurrentTime = this._currentTime + deltaTime * this.playRate;
    this._prev = now;

    if (to !== undefined && to <= newCurrentTime) {
      newCurrentTime = to;
    }

    this.setCurrentTime(newCurrentTime, true);
    this._applyTracksOnTimeline(newCurrentTime);
    this._updateCameraIfNeeded();

    // Determine whether to stop or continue the animation
    if (to !== undefined && to <= newCurrentTime) {
      this._end();
    }

    if (this.isPaused) {
      return;
    }

    this._timerId = requestAnimationFrame((time) => {
      this._tick({ now: time, autoEnd, to });
    });
  }






  /**
   * Applies initial static properties to the object.
   * @param rawObject - The raw object containing static properties.
   * @param object3DRef - Reference to the THREE.Object3D instance.
   */
  private _applyStaticPropsOnObject(rawObject: RawObjectProps,object3DRef: THREE.Object3D | null) {
    if (!object3DRef) {
      logReportingService.logWarning(
        `Could not initialize staticProps for ${rawObject.vxkey} because no object3d references was passed`,{ module: LOG_MODULE, functionName: "_applyStaticPropsOnObject" })
      return;
    }
    rawObject.staticProps.forEach(staticProp => {
      this._updateObjectProperty(
        rawObject.vxkey,
        staticProp.propertyPath,
        object3DRef,
        staticProp.value
      );
    });
  }







  private _applyTracksOnTimeline( currentTime: number) {
    this.currentTimeline.objects.forEach(rawObject =>
      this._applyTracksOnObject(currentTime, rawObject)
    )
  }


  private _applyTracksOnObject( currentTime: number,rawObject: RawObjectProps
  ) {
    rawObject.tracks.forEach(rawTrack =>
      this._applyKeyframesOnTrack(
        rawObject.vxkey,
        rawTrack.propertyPath,
        rawTrack.keyframes,
        currentTime
      )
    )
  }





  /**
   * Updates the camera's projection matrix if required.
   */
  private _updateCameraIfNeeded() {
    if (!this._cameraRequiresPerspectiveMatrixRecalculation) {
      return;
    }

    const camera = this._object3DCache.get('perspectiveCamera') as THREE.PerspectiveCamera;
    if (camera) {
      camera.updateProjectionMatrix();
      this._cameraRequiresPerspectiveMatrixRecalculation = false;
    } else {
      logReportingService.logWarning(
        "PerspectiveCamera was not found in object cache",{ module: LOG_MODULE, functionName: "_updateCameraIfNeeded" })
    }
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
    keyframes: RawKeyframeProps[],
    currentTime: number,
    recalculateAll: boolean = false
  ) {
    const object3DRef = this._object3DCache.get(vxkey);
    if (!object3DRef || keyframes.length === 0) return;

    const newValue = this._calculateInterpolatedValue(keyframes, currentTime, recalculateAll);

    const cacheKey = `${vxkey}.${propertyPath}`;
    const lastValue = this._lastInterpolatedValues.get(cacheKey);

    if (lastValue === undefined) {
      this._updateObjectProperty(vxkey, propertyPath, object3DRef, newValue);
      this._lastInterpolatedValues.set(cacheKey, newValue);
      return
    }

    if (Math.abs(newValue - lastValue) > AnimationEngine.VALUE_CHANGE_THRESHOLD) {
      this._updateObjectProperty(vxkey, propertyPath, object3DRef, newValue);
      this._lastInterpolatedValues.set(cacheKey, newValue);
    }
  }






  /**
   * Calculates the interpolated value for the given keyframes at the specified time.
   * @param keyframes - An array of keyframes.
   * @param currentTime - The current time in the animation timeline.
   * @param recalculateAll - Whether to recalculate outside keyframe bounds.
   * @returns The interpolated value 
   */
  private _calculateInterpolatedValue(
    keyframes: RawKeyframeProps[],
    currentTime: number,
    recalculateAll: boolean
  ): number {
    if (currentTime < keyframes[0].time && !recalculateAll) {
      return keyframes[0].value;
    }
    if (currentTime > keyframes[keyframes.length - 1].time && !recalculateAll) {
      return keyframes[keyframes.length - 1].value;
    }

    return this._interpolateKeyframes(keyframes, currentTime);
  }






  /**
   * Checks if the camera's projection matrix needs to be recalculated based on property updates.
   * @param vxkey - The unique identifier for the object.
   * @param propertyPath - The property that was updated.
   */
  private _checkCameraUpdateRequirement(vxkey: string, propertyPath: string) {
    if (
      vxkey === 'perspectiveCamera' &&
      this._propertiesRequiredToRecalculateCamera.includes(propertyPath)
    ) {
      this._cameraRequiresPerspectiveMatrixRecalculation = true;
    }
  }






  /**
   * Interpolates the value between keyframes based on the current time.
   * @param keyframes - Array of keyframes sorted by time.
   * @param currentTime - The current time in the animation timeline.
   * @returns The interpolated value at the current time.
   */
  private _interpolateKeyframes(keyframes: RawKeyframeProps[], currentTime: number): number {
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
  private _findNextKeyframeIndex(keyframes: RawKeyframeProps[], currentTime: number): number {
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
    startKeyframe: RawKeyframeProps,
    endKeyframe: RawKeyframeProps,
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
    this.currentTimeline.objects.forEach(obj => {
      if (obj.staticProps.length === 0) {
        return
      }

      const vxkey = obj.vxkey;
      const object3DRef = this._object3DCache.get(vxkey);

      if (!object3DRef)
        return;

      obj.staticProps.forEach(staticProp => {
        this._updateObjectProperty(
          vxkey,
          staticProp.propertyPath,
          object3DRef,
          staticProp.value
        );
      });
    });
  }







  /**
   * Retrieves a point on the spline at the specified progress.
   * @param splineKey - The key identifying the spline.
   * @param progress - The progress along the spline (0 to 1).
   * @returns The point on the spline at the given progress.
   */
  getSplinePointAt(splineKey: string, progress: number): { x: number; y: number; z: number } | null {
    const spline = this._splinesCache.get(splineKey);
    return spline.get_point(progress);
  }






  /**
   * Updates a property of a THREE.Object3D instance using a property path.
   * Utilizes a cached setter function for efficiency.
   * @param object3DRef - Reference to the THREE.Object3D instance.
   * @param propertyPath - Dot-separated path to the property to update.
   * @param newValue - The new value to set.
   */
  private _updateObjectProperty(
    vxkey: string,
    propertyPath: string,
    object3DRef: THREE.Object3D,
    newValue: number
  ) {
    const generalKey = `${vxkey}.${propertyPath}`
    let setter = this._propertySetterCache.get(propertyPath);

    if (!setter) {
      // Generate and cache the setter function if its not in the cache
      setter = this._generatePropertySetter(propertyPath);
      this._propertySetterCache.set(propertyPath, setter);
    }

    // Use the cached setter function to update the property
    setter(object3DRef, newValue);

    const sideEffect = this._sideEffectCallbacks.get(generalKey) || AnimationEngine.defaultSideEffects[propertyPath];
    if (sideEffect)
      sideEffect(
        this,
        vxkey,
        propertyPath,
        object3DRef,
        newValue
      );

    this._checkCameraUpdateRequirement(vxkey, propertyPath);
    if (this._IS_DEVELOPMENT)
      updateProperty(vxkey, propertyPath, newValue);
  }






  /**
   * Generates a setter function for a given property path.
   * The setter function updates the property on the target object.
   * @param propertyPath - Dot-separated path to the property.
   * @returns A setter function that updates the specified property on a target object.
   */
  private _generatePropertySetter( propertyPath: string): (targetObject: any, newValue: any) => void {
    const propertyKeys = propertyPath.split('.');
    const LOG_CONTEXT = { module: "AnimationEngine", functionName: "_generatePropertySetter" }

    return (targetObject: any, newValue: any) => {
      let target = targetObject;

      // Traverse the property path
      for (let i = 0; i < propertyKeys.length - 1; i++) {
        let key = propertyKeys[i];

        // Check if target is an array
        if (Array.isArray(target)) {
          // Try to parse the key as an integer index
          const index = parseInt(key, 10);
          if (Number.isNaN(index)) {
            logReportingService.logWarning(
              `Key ${key} is not a valid array index in ${propertyKeys}`, LOG_CONTEXT)
            return;
          }
          target = target[index];
        } else {
          // Regular object property access
          target = target[key];
        }

        if (target === undefined) {
          logReportingService.logWarning(
            `AnimationEngine: Property '${key}' is undefined in propertyPath '${propertyPath}'.`, LOG_CONTEXT)
          return;
        }
      }

      const finalPropertyKey = propertyKeys[propertyKeys.length - 1];

      // The final property might also be on an array, so handle that too
      if (Array.isArray(target)) {
        const index = parseInt(finalPropertyKey, 10);
        if (Number.isNaN(index)) {
          logReportingService.logWarning(
            `AnimationEngine: Final key '${finalPropertyKey}' is not a valid array index in '${propertyPath}'.`, LOG_CONTEXT)
          return;
        }
        target[index] = newValue;
      } else if (target instanceof Map) {
        const mapValue = target.get(finalPropertyKey);
        if (mapValue) {
          mapValue.value = newValue;
        } else {
          logReportingService.logWarning(
            `AnimationEngine: Key '${finalPropertyKey}' not found in Map at path '${propertyPath}'.`, LOG_CONTEXT)
        }
      } else {
        target[finalPropertyKey] = newValue;
      }
    };
  }




  /**
   * Handles the end of the animation playback.
   * Pauses the animation and triggers the 'ended' event.
   */
  private _end() {
    this.pause();
    this.trigger('ended', { engine: this });
  }






  //
  //  H Y D R A T E    F U N C T I O N S
  //
  // Used to synchronize the data structure from the Timeline editor with animation engine data structure

  /**
   * Refreshes a track in the animation engine's data structure and optionally re-renders.
   * @param trackKey - The key identifying the track.
   * @param action - The action to perform: 'create' or 'remove'.
   * @param reRender - Whether to re-render after the refresh (default is true).
   */
  hydrateTrack( trackKey: string, action: 'create' | 'remove', reRender: boolean = true ) {
    this._hydrationService.hydrateTrack(trackKey, action);

    if (reRender)
      this.reRender({ force: true, cause: `refresh action: ${action} track ${trackKey}` });

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
  hydrateKeyframe<A extends HydrateKeyframeAction>(params: HydrateKeyframeParams<A>) {
    const { trackKey, action, keyframeKey, reRender = true, newData } = params;
    // @ts-expect-error
    this._hydrationService.hydrateKeyframe({ trackKey, action, keyframeKey, newData })

    if (reRender)
      this.reRender({ force: true, cause: `refresh action: ${action} keyframe ${keyframeKey}` });

    invalidate();
    useSourceManagerAPI.getState().saveDataToLocalStorage();
  }






  /**
   * Refreshes a static property in the animation engine's data structure and optionally re-renders.
   * @param action - The action to perform: 'create', 'update', or 'remove'.
   * @param staticPropKey - The key identifying the static property.
   * @param reRender - Whether to re-render after the refresh (default is true).
   */
  hydrateStaticProp<A extends HydrateStaticPropAction>(params: HydrateStaticPropParams<A>) {
    const { action, staticPropKey, reRender = true, newValue } = params;

    // @ts-expect-error
    this._hydrationService.hydrateStaticProp({ staticPropKey, action, newValue })

    if (reRender)
      this.reRender({ force: true, cause: `refresh action: ${action} staticPropKey ${staticPropKey}` });

    invalidate();
    useSourceManagerAPI.getState().saveDataToLocalStorage();
  }






  /**
   * Refreshes a spline in the animation engine's data structure and optionally re-renders.
   * @param action - The action to perform: 'create', 'update', or 'remove'.
   * @param splineKey - The key identifying the spline.
   * @param reRender - Whether to re-render after the refresh (default is true).
   */
  hydrateSpline<A extends HydrateSplineActions>(params: HydrateSplineParams<A>) {
    const { action, splineKey, reRender, nodeIndex, newData, initialTension } = params
    // @ts-expect-error
    this._hydrationService.hydrateSpline({ splineKey, action, nodeIndex, newData, initialTension })

    if (reRender)
      this.reRender({ force: true, cause: `refresh action: ${action} spline ${splineKey}` });

    invalidate();
    useSourceManagerAPI.getState().saveDataToLocalStorage();
  }






  /**
   * Refreshes settings for an object in the animation engine's data structure.
   * @param action - The action to perform: 'set' or 'remove'.
   * @param settingKey - The key identifying the setting.
   * @param vxkey - The unique identifier for the object.
   */
  hydrateSetting( action: 'set' | 'remove', settingKey: string, vxkey: string ) {
    this._hydrationService.hydrateSetting(action, settingKey, vxkey)

    invalidate();
    useSourceManagerAPI.getState().saveDataToLocalStorage();
  }








  static truncateToDecimals(num: number, decimals?: number): number {
    if (!decimals)
      decimals = AnimationEngine.ENGINE_PRECISION;

    const factor = Math.pow(10, decimals);
    return Math.trunc(num * factor) / factor;
  }
}