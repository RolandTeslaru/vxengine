// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

'use client'

import { Emitter } from './emitter';
import { Events, EventTypes } from './events';
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';

import * as THREE from "three"
import { IKeyframe, ISpline, IStaticProps, ITimeline, ITrack, RawObjectProps, RawTrackProps, edObjectProps } from './types/track';
import { IAnimationEngine } from './types/engine';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/store';
import { useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/stores/managerStore';
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing';
import { useAnimationEngineAPI } from './store';
import { useSplineManagerAPI } from '@vxengine/managers/SplineManager/store';
import { useObjectSettingsAPI } from '@vxengine/managers/ObjectManager';
import { js_interpolateNumber } from './utils/interpolateNumber';

import wasmUrl from "../wasm/pkg/rust_bg.wasm"

import init, {
  Spline as wasm_Spline,
  Vector3 as wasm_Vector3,
  interpolate_number as wasm_interpolateNumber,
} from '../wasm/pkg';

import { useSourceManagerAPI } from '../managers/SourceManager/store'
import { useVXUiStore } from '@vxengine/components/ui/VXUIStore';
import { invalidate } from '@react-three/fiber';
import { getNodeEnv, IS_DEVELOPMENT, IS_PRODUCTION } from '@vxengine/constants';

const DEBUG_REFRESHER = false;
const DEBUG_RERENDER = false;
const DEBUG_OBJECT_INIT = false;

export class AnimationEngine extends Emitter<EventTypes> implements IAnimationEngine {
  /** requestAnimationFrame timerId */
  private _id: string
  private _timerId: number;
  private _prev: number;
  private _wasmReady: Promise<void>
  private _isWasmInitialized: boolean = false
  private _isReady: boolean = false

  private _splinesCache: Record<string, any> = {}
  private _propertySetterCache: Map<string, (target: any, newValue: any) => void> = new Map();
  private _object3DCache: Map<string, THREE.Object3D> = new Map();

  private _currentTimeline: ITimeline;
  private _currentTime: number = 0;
  private _interpolateNumberFunction: Function;

  private _cameraRequiresPerspectiveMatrixRecalculation;
  private readonly _propertiesRequiredToRecalculateCamera = ['fov', 'near', 'far', 'zoom'];

  private readonly _IS_DEVELOPMENT: boolean = false;
  private readonly _IS_PRODUCTION: boolean = false;

  static readonly ENGINE_PRECISION = 3

  constructor(nodeEnv: "production" | "development" | "test") {
    super(new Events());

    if(nodeEnv === "production"){
      this._IS_PRODUCTION = true;
    }
    else if (nodeEnv === "development"){
      this._IS_DEVELOPMENT = true;
    }

    this._id = Math.random().toString(36).substring(2, 9); // Generate a random unique ID
    console.log("VXEngine AnimationEngine: Created instance with ID:", this._id);

    this._interpolateNumberFunction = js_interpolateNumber;
    this._wasmReady = this._initializeWasm();
    this._currentTimeline = null
  }




  /**
   * Initializes the WebAssembly module and sets the interpolation function.
   */
  private async _initializeWasm() {
    console.log('AnimationEngine: Initializing WASM Driver with URL:', wasmUrl);
    try {
      await init(wasmUrl); // Wait for the WebAssembly module to initialize
      this._isWasmInitialized = true;
      this._interpolateNumberFunction = wasm_interpolateNumber;
      console.log('AnimationEngine: WASM Driver initialized successfully');
    } catch (error) {
      console.error('AnimationEngine: Failed to initialize WASM Driver:', error);
    }
  }






  get timelines() { return useAnimationEngineAPI.getState().timelines; }
  get isPlaying() { return useAnimationEngineAPI.getState().isPlaying; }
  get isPaused() { return !this.isPlaying; }
  get playRate() { return useAnimationEngineAPI.getState().playRate }
  get currentTimeline() { return this._currentTimeline }

  setIsPlaying(value: boolean) { useAnimationEngineAPI.setState({ isPlaying: value }) }






  /**
   * Sets the current timeline by updating the state, caching splines, and re-rendering.
   * @param timelineId - The identifier of the timeline to set as current.
   */
  setCurrentTimeline(timelineId: string) {
    // Update the current timeline ID in the state
    const selectedTimeline: ITimeline = this.timelines[timelineId];

    if (!selectedTimeline) {
      throw new Error(`AnimationEngine: Timeline with ID '${timelineId}' not found.`);
    }

    // Set the states in the store
    useAnimationEngineAPI.setState({ currentTimeline: selectedTimeline })
    useAnimationEngineAPI.setState({ currentTimelineID: timelineId });

    this._currentTimeline = selectedTimeline;

    const { objects, splines } = selectedTimeline;


    // Cache the splines asynchronously
    this.cacheSplines(splines).then(() => {
      // Re-render after splines are cached
      this.reRender({ time: this._currentTime, force: true });
    }).catch(error => {
      console.error('AnimationEngine: Error caching splines:', error);
    });

    // Set the editor data
    useTimelineEditorAPI.getState().setEditorData(objects);
    useTimelineEditorAPI.getState().setCurrentTimelineLength(selectedTimeline.length)
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
      this._applyAllKeyframes(time, true);
      this.trigger('timeUpdatedByEditor', { time, engine: this });

      invalidate();
    }

    // Always trigger a general time updated event
    this.trigger('timeUpdated', { time });
  }






  /**
  * Loads timelines into the animation engine, synchronizes local storage, and initializes the first timeline.
  * @param timelines - A record of timelines to load.
  */
  loadTimelines(timelines: Record<string, ITimeline>) {
    if(IS_DEVELOPMENT){  
      const syncResult: any = useSourceManagerAPI.getState().syncLocalStorage(timelines);
  
      if (syncResult?.status === 'out_of_sync') {
        this.setIsPlaying(false);
      }
    }
    else if(IS_PRODUCTION){
      useAnimationEngineAPI.setState({ timelines: timelines })
    } 

    // Load the first timeline
    const firstTimeline = Object.values(timelines)[0];
    const firstTimelineID = firstTimeline.id;

    this.setCurrentTimeline(firstTimelineID);

    console.log('AnimationEngine: Loading timelines', firstTimeline);

    // Initialize the core UI
    useVXUiStore.getState().setMountCoreUI(true);
    this._isReady = true;
  }






  /**
  * Re-renders the animation by applying static properties and keyframes.
  * @param params - An object containing optional parameters:
  *   - time: The specific time to apply keyframes.
  *   - force: Whether to force re-rendering even if the animation is playing.
  *   - cause: A string describing the cause of the re-render.
  */
  reRender(params: {
    time?: number;
    force?: boolean;
    cause?: string;
  } = {}) {
    const { time, force = false, cause } = params;

    if (this.isPlaying && !force) {
      return;
    }

    if (DEBUG_RERENDER) {
      console.log('AnimationEngine: Re-rendering. Cause:', cause);
    }

    this._applyAllStaticProps();

    const targetTime = time !== undefined ? time : this._currentTime;
    this._applyAllKeyframes(targetTime);
  }






  /**
   * Starts playing the animation, optionally up to a specific time with an auto-end feature.
   * @param param - An object containing optional parameters:
   *   - toTime: The time to play up to.
   *   - autoEnd: Whether to automatically end the animation when `toTime` is reached.
   * @returns True if the animation starts playing, false otherwise.
   */
  play(param: {
    toTime?: number;
    autoEnd?: boolean;
  } = {}) {
    let { toTime, autoEnd = true } = param;
    if (toTime === undefined) {
      toTime = this._currentTimeline.length;
    }

    // Check if is already playing or the current time has exceeded the toTime
    if (this.isPlaying
      || (toTime !== undefined && toTime <= this._currentTime)
    ) {
      return;
    }

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
    console.log("AnimationEngine: Pause triggered")
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

    if (!this._isReady) {
      return;
    }

    // Add object to editor data
    this._addToEditorData(vxObject);

    // Cache the THREE.Object3D reference
    const object3DRef = this._cacheObject3DRef(vxObject);

    if (DEBUG_OBJECT_INIT) {
      console.log('AnimationEngine: Initializing object', vxObject);
    }

    const rawObject = this.currentTimeline.objects.find(obj => obj.vxkey === vxkey);

    if (!rawObject) {
      return
    }

    this._applyInitialTracks(rawObject, vxkey);
    this._applyInitialStaticProps(rawObject, object3DRef);
  }






  /**
   * Adds the vxObject to the editor's data.
   * @param vxObject - The object to add.
   */
  private _addToEditorData(vxObject: vxObjectProps) {
    useTimelineEditorAPI.getState().addObjectToEditorData(vxObject);
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
   * Applies initial track properties to the object.
   * @param rawObject - The raw object containing tracks.
   * @param vxkey - The unique key of the object.
   */
  private _applyInitialTracks(rawObject: RawObjectProps, vxkey: string) {
    rawObject.tracks.forEach(track => {
      this._applyKeyframes(vxkey, track.propertyPath, track.keyframes, this._currentTime);
    });
  }






  /**
   * Applies initial static properties to the object.
   * @param rawObject - The raw object containing static properties.
   * @param object3DRef - Reference to the THREE.Object3D instance.
   */
  private _applyInitialStaticProps(
    rawObject: RawObjectProps,
    object3DRef: THREE.Object3D | null
  ) {
    if (!object3DRef) {
      console.warn(`AnimationEngine: Object3D reference not found for '${rawObject.vxkey}'.`);
      return;
    }
    rawObject.staticProps.forEach(staticProp => {
      this._updateObjectProperty(object3DRef, staticProp.propertyPath, staticProp.value);
    });
  }






  /**
   * Initializes a new RawObjectProps and adds it to the current timeline's objects.
   * Prevents duplicate entries by checking if an object with the same vxkey already exists.
   * @param vxkey - The unique identifier for the object.
   * @returns The newly created or existing RawObjectProps.
   */
  private _initRawObjectOnTimeline(vxkey: string): RawObjectProps {
    // Check if an object with the same vxkey already exists
    let rawObject = this.currentTimeline.objects.find(obj => obj.vxkey === vxkey);
    if (rawObject) {
      console.warn(`AnimationEngine: Raw Object with vxkey '${vxkey}' already exists in the current timeline.`);
      return rawObject;
    }

    rawObject = {
      vxkey,
      tracks: [],
      staticProps: []
    };

    this.currentTimeline.objects.push(rawObject);

    return rawObject;
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
    this._applyAllKeyframes(newCurrentTime);

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
   * Applies all keyframes for each object at the given time.
   * @param currentTime - The current time to apply keyframes for.
   * @param recalculateAll - Whether to recalculate all keyframes regardless of time bounds.
   */
  private _applyAllKeyframes(
    currentTime: number,
    recalculateAll: boolean = false
  ) {
    this.currentTimeline.objects.forEach(rawObject =>
      this._applyAllKeyframesForObject(rawObject, currentTime, recalculateAll)
    );
    this._updateCameraIfNeeded();
  }






  /**
   * Applies all keyframes for a specific object.
   * @param rawObject - The object to apply keyframes to.
   * @param currentTime - The current time to apply keyframes for.
   * @param recalculateAll - Whether to recalculate all keyframes regardless of time bounds.
   */
  private _applyAllKeyframesForObject(
    rawObject: RawObjectProps,
    currentTime: number,
    recalculateAll: boolean
  ) {
    rawObject.tracks.forEach(track => {
      this._applyKeyframes(
        rawObject.vxkey,
        track.propertyPath,
        track.keyframes,
        currentTime,
        recalculateAll
      );
    });
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
      console.warn('AnimationEngine: Perspective camera not found in object cache.');
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
  private _applyKeyframes(
    vxkey: string,
    propertyPath: string,
    keyframes: IKeyframe[],
    currentTime: number,
    recalculateAll: boolean = false
  ) {
    const object3DRef = this._object3DCache.get(vxkey);
    if (!object3DRef || keyframes.length === 0) return;

    const interpolatedValue = this._calculateInterpolatedValue(keyframes, currentTime, recalculateAll);

    if (interpolatedValue !== undefined) {
      this._updateObjectProperties(vxkey, propertyPath, object3DRef, interpolatedValue);
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
    keyframes: IKeyframe[],
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
   * Updates the object's property with the interpolated value and handles special cases.
   * @param vxkey - The unique identifier for the object.
   * @param propertyPath - The path to the property to be updated.
   * @param object3DRef - Reference to the THREE.Object3D instance.
   * @param interpolatedValue - The interpolated value to apply.
   */
  private _updateObjectProperties(
    vxkey: string,
    propertyPath: string,
    object3DRef: THREE.Object3D,
    interpolatedValue: number
  ) {
    if (DEBUG_OBJECT_INIT) console.log(`Updating property ${propertyPath} for ${vxkey} with value`, interpolatedValue);

    const wasPropertySpecial = this._handleSpecialProperties(vxkey, propertyPath, object3DRef, interpolatedValue);

    if (!wasPropertySpecial)
      this._updateObjectProperty(object3DRef, propertyPath, interpolatedValue);

    this._checkCameraUpdateRequirement(vxkey, propertyPath);
    
    if(this._IS_DEVELOPMENT)
      useObjectPropertyAPI.getState().updateProperty(vxkey, propertyPath, interpolatedValue);
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
   * Handles special properties that require custom logic.
   * @param vxkey - The unique identifier for the object.
   * @param propertyPath - The property path to check.
   * @param object3DRef - Reference to the THREE.Object3D instance.
   * @param value - The value to apply.
   * @returns True if a special property was handled, false otherwise.
   */
  private _handleSpecialProperties(
    vxkey: string,
    propertyPath: string,
    object3DRef: THREE.Object3D,
    value: number | THREE.Vector3
  ): boolean {
    switch (propertyPath) {
      case 'splineProgress':
        this._applySplinePosition(object3DRef, vxkey, (value as number) / 100);
        return true;
      // Add more special properties here if necessary
      default:
        return false;
    }
  }






  /**
   * Interpolates the value between keyframes based on the current time.
   * @param keyframes - Array of keyframes sorted by time.
   * @param currentTime - The current time in the animation timeline.
   * @returns The interpolated value at the current time.
   */
  private _interpolateKeyframes(keyframes: IKeyframe[], currentTime: number): number {
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
  private _findNextKeyframeIndex(keyframes: IKeyframe[], currentTime: number): number {
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
    startKeyframe: IKeyframe,
    endKeyframe: IKeyframe,
    progress: number
  ): number {
    const startValue = startKeyframe.value as number;
    const endValue = endKeyframe.value as number;

    // Default handle positions for Bezier curve if not specified
    const DEFAULT_IN_HANDLE = 0.3;
    const DEFAULT_OUT_HANDLE = 0.7;

    const startHandleX = startKeyframe.handles?.out?.x ?? DEFAULT_IN_HANDLE;
    const startHandleY = startKeyframe.handles?.out?.y ?? DEFAULT_IN_HANDLE;

    const endHandleX = endKeyframe.handles?.in?.x ?? DEFAULT_OUT_HANDLE;
    const endHandleY = endKeyframe.handles?.in?.y ?? DEFAULT_OUT_HANDLE;

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

      if (!object3DRef) {
        // console.warn(`AnimationEngine: Object with vxkey '${vxkey}' not found in cache.`);
        return;
      }

      obj.staticProps.forEach(staticProp => {
        this._updateObjectProperty(object3DRef, staticProp.propertyPath, staticProp.value);
      });
    });
  }






  /**
   * Applies the spline position to the object based on the spline progress.
   * @param object3DRef - Reference to the THREE.Object3D instance.
   * @param vxkey - The unique identifier for the object.
   * @param splineProgress - The progress along the spline (0 to 1).
   */
  private _applySplinePosition(object3DRef: THREE.Object3D, vxkey: string, splineProgress: number) {
    const splineKey = `${vxkey}.spline`;
    const spline = this._splinesCache[splineKey];

    const interpolatedPosition = spline.get_point(splineProgress);

    // Apply the interpolated position to the object
    object3DRef.position.set(
      interpolatedPosition.x,
      interpolatedPosition.y,
      interpolatedPosition.z
    );
  }






  /**
   * Retrieves a point on the spline at the specified progress.
   * @param splineKey - The key identifying the spline.
   * @param progress - The progress along the spline (0 to 1).
   * @returns The point on the spline at the given progress.
   */
  getSplinePointAt(splineKey: string, progress: number): { x: number; y: number; z: number } | null {
    const spline = this._splinesCache[splineKey];
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
    object3DRef: THREE.Object3D,
    propertyPath: string,
    newValue: number | THREE.Vector3
  ) {
    let setter = this._propertySetterCache.get(propertyPath);

    if (!setter) {
      // Generate and cache the setter function if its not in the cache
      setter = this._generatePropertySetter(propertyPath);
      this._propertySetterCache.set(propertyPath, setter);
    }

    // Use the cached setter function to update the property
    setter(object3DRef, newValue);
  }






  /**
   * Generates a setter function for a given property path.
   * The setter function updates the property on the target object.
   * @param propertyPath - Dot-separated path to the property.
   * @returns A setter function that updates the specified property on a target object.
   */
  private _generatePropertySetter(
    propertyPath: string
  ): (targetObject: any, newValue: any) => void {
    const propertyKeys = propertyPath.split('.');

    return (targetObject: any, newValue: any) => {
      let target = targetObject;

      // Traverse the property path
      for (let i = 0; i < propertyKeys.length - 1; i++) {
        target = target[propertyKeys[i]];
        if (target === undefined) {
          console.warn(
            `AnimationEngine: Property '${propertyKeys[i]}' is undefined in path '${propertyPath}'.`
          );
          return;
        }
      }

      const finalPropertyKey = propertyKeys[propertyKeys.length - 1];

      if (target instanceof Map) {
        // Handle Map-based properties (e.g., uniforms in post-processing effects)
        const mapValue = target.get(finalPropertyKey);
        if (mapValue) {
          mapValue.value = newValue;
        } else {
          console.warn(
            `AnimationEngine: Key '${finalPropertyKey}' not found in Map at path '${propertyPath}'.`
          );
        }
      } else if (target !== undefined) {
        // Regular object properties
        target[finalPropertyKey] = newValue;
      } else {
        console.warn(
          `AnimationEngine: Unable to set property '${finalPropertyKey}' on undefined target at path '${propertyPath}'.`
        );
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






  /**
   * Caches splines by initializing WebAssembly spline objects.
   * @param splines - A record of splines to cache.
   */
  async cacheSplines(splines: Record<string, ISpline>) {
    await this._wasmReady; // Ensure WASM is initialized

    if (!splines) {
      console.warn('AnimationEngine: No splines provided to cache.');
      return;
    }

    for (const [key, spline] of Object.entries(splines)) {
      const nodes = spline.nodes;
      const wasmNodes = nodes.map(node => wasm_Vector3.new(node[0], node[1], node[2]));

      // Example arguments, adjust as needed
      const wasmSpline = new wasm_Spline(wasmNodes, false, 0.5);

      // Cache the WebAssembly spline object
      this._splinesCache[key] = wasmSpline;
    }
  }






  //
  //  R E F R R E S H     F U N C T I O N S
  //
  // Used to synchronize the data strcture from the Timeline editor with animation engine data structure

  /**
   * Refreshes a track in the animation engine's data structure and optionally re-renders.
   * @param trackKey - The key identifying the track.
   * @param action - The action to perform: 'create' or 'remove'.
   * @param reRender - Whether to re-render after the refresh (default is true).
   */
  refreshTrack(
    trackKey: string,
    action: 'create' | 'remove',
    reRender: boolean = true,
  ) {
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
    let rawObject = this.currentTimeline.objects.find(rawObj => rawObj.vxkey === vxkey);

    if (!rawObject) {
      rawObject = this._initRawObjectOnTimeline(vxkey);
    }

    if (DEBUG_REFRESHER) {
      console.log(`AnimationEngine: Refreshing track on object '${vxkey}'.`);
    }

    switch (action) {
      case 'create': {
        const keyframesForTrack = useTimelineEditorAPI.getState().getKeyframesForTrack(trackKey) || [];
        const rawTrack: RawTrackProps = {
          propertyPath: propertyPath,
          keyframes: keyframesForTrack,
        };
        rawObject.tracks.push(rawTrack);

        if (DEBUG_REFRESHER) {
          console.log(`AnimationEngine: Track '${trackKey}' was added to '${vxkey}'.`);
        }
        break;
      }

      case 'remove': {
        rawObject.tracks = rawObject.tracks.filter(rawTrack => rawTrack.propertyPath !== propertyPath);

        if (DEBUG_REFRESHER) {
          console.log(`AnimationEngine: Track '${trackKey}' was removed from '${vxkey}'.`);
        }
        break;
      }

      default: {
        console.warn(`AnimationEngine: Unknown action '${action}' for refreshTrack.`);
        return;
      }
    }

    if (reRender) {
      this.reRender({ force: true, cause: `refresh action: ${action} track ${trackKey}` });
    }

    // Save data to local storage
    useSourceManagerAPI.getState().saveDataToLocalStorage();
  }






  /**
   * Refreshes a keyframe in the animation engine's data structure and optionally re-renders.
   * @param trackKey - The key identifying the track.
   * @param action - The action to perform: 'create', 'update', or 'remove'.
   * @param keyframeKey - The key identifying the keyframe.
   * @param reRender - Whether to re-render after the refresh (default is true).
   */
  refreshKeyframe(
    trackKey: string,
    action: 'create' | 'remove' | 'update',
    keyframeKey: string,
    reRender: boolean = true
  ) {
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);

    if (DEBUG_REFRESHER) {
      console.log(`AnimationEngine: Refreshing keyframe on track '${trackKey}'.`);
    }

    let rawObject = this.currentTimeline.objects.find(obj => obj.vxkey === vxkey);
    if (!rawObject) {
      rawObject = this._initRawObjectOnTimeline(vxkey);
    }

    const track = rawObject.tracks.find(t => t.propertyPath === propertyPath);
    if (!track) {
      console.warn(`AnimationEngine: Track with property path '${propertyPath}' not found on object '${vxkey}'.`);
      return;
    }

    const keyframes = track.keyframes;

    switch (action) {
      case 'create': {
        const edKeyframe = useTimelineEditorAPI.getState().keyframes[keyframeKey];
        keyframes.push(edKeyframe);
        keyframes.sort((a, b) => a.time - b.time);

        if (DEBUG_REFRESHER) {
          console.log(`AnimationEngine: Keyframe '${keyframeKey}' added to track '${trackKey}'.`);
        }
        break;
      }

      case 'update': {
        const edKeyframe = useTimelineEditorAPI.getState().keyframes[keyframeKey];
        keyframes.forEach((kf, index) => {
          if (kf.id === keyframeKey) {
            keyframes[index] = edKeyframe;
          }
        });
        keyframes.sort((a, b) => a.time - b.time);

        if (DEBUG_REFRESHER) {
          console.log(`AnimationEngine: Keyframe '${keyframeKey}' updated in track '${trackKey}'.`);
        }
        break;
      }

      case "remove": {
        track.keyframes = track.keyframes.filter(kf => kf.id !== keyframeKey);

        if (DEBUG_REFRESHER) console.log(`VXAnimationEngine KeyframeRefresher: Keyframe ${keyframeKey} removed from track ${trackKey}`);
        break;
      }

      default: {
        console.warn(`AnimationEngine: Unknown action '${action}' for refreshKeyframe.`);
        return;
      }
    }

    if (reRender) {
      this.reRender({ force: true, cause: `refresh action: ${action} keyframe ${keyframeKey}` });
    }

    // Save data to local storage
    useSourceManagerAPI.getState().saveDataToLocalStorage();
  }






  /**
   * Refreshes a static property in the animation engine's data structure and optionally re-renders.
   * @param action - The action to perform: 'create', 'update', or 'remove'.
   * @param staticPropKey - The key identifying the static property.
   * @param reRender - Whether to re-render after the refresh (default is true).
   */
  refreshStaticProp(
    action: 'create' | 'remove' | 'update',
    staticPropKey: string,
    reRender: boolean = true,
  ) {
    const { vxkey, propertyPath } = extractDataFromTrackKey(staticPropKey);

    if (DEBUG_REFRESHER) {
      console.log(`AnimationEngine: Refreshing static property '${staticPropKey}'.`);
    }

    let rawObject = this.currentTimeline.objects.find(obj => obj.vxkey === vxkey);
    if (!rawObject) {
      rawObject = this._initRawObjectOnTimeline(vxkey);
    }

    switch (action) {
      case 'create': {
        const staticProp = useTimelineEditorAPI.getState().staticProps[staticPropKey];
        const propExists = rawObject.staticProps.some(prop => prop.propertyPath === propertyPath);

        if (!propExists) {
          rawObject.staticProps.push(staticProp);
        } else {
          console.warn(`AnimationEngine: Static property '${propertyPath}' already exists on object '${vxkey}'.`);
        }
        break;
      }

      case 'update': {
        const staticProp = useTimelineEditorAPI.getState().staticProps[staticPropKey];
        rawObject.staticProps = rawObject.staticProps.map(prop =>
          prop.propertyPath === propertyPath ? staticProp : prop
        );
        break;
      }

      case 'remove': {
        rawObject.staticProps = rawObject.staticProps.filter(prop => prop.propertyPath !== propertyPath);
        break;
      }

      default: {
        console.warn(`AnimationEngine: Unknown action '${action}' for refreshStaticProp.`);
        return;
      }
    }

    if (reRender) {
      this.reRender({ force: true, cause: `refresh action: ${action} static prop ${staticPropKey}` });
    }

    // Save data to local storage
    useSourceManagerAPI.getState().saveDataToLocalStorage();
  }






  /**
   * Refreshes a spline in the animation engine's data structure and optionally re-renders.
   * @param action - The action to perform: 'create', 'update', or 'remove'.
   * @param splineKey - The key identifying the spline.
   * @param reRender - Whether to re-render after the refresh (default is true).
   */
  refreshSpline(
    action: 'create' | 'remove' | 'update',
    splineKey: string,
    reRender: boolean = true,
  ) {

    const splineState = useSplineManagerAPI.getState().splines

    switch (action) {
      case "update": {
        const spline = splineState[splineKey];

        if (!spline) {
          console.warn(`AnimationEngine: Spline '${splineKey}' not found in spline state.`);
          return;
        }

        // Update currentTimeline splines
        this.currentTimeline.splines = {
          ...this.currentTimeline.splines,
          [splineKey]: {
            ...this.currentTimeline.splines[splineKey],
            nodes: [...spline.nodes] // Clone the nodes array
          }
        };

        // Free the old WebAssembly spline object in the cache and update it
        if (this._splinesCache[splineKey]) {
          this._splinesCache[splineKey].free();
        }

        const newWasmSpline = new wasm_Spline(
          spline.nodes.map(n => wasm_Vector3.new(n[0], n[1], n[2])),
          false,
          0.5
        );
        this._splinesCache[splineKey] = newWasmSpline;
        break;
      }

      case "create": {
        const spline = splineState[splineKey];

        // set the currentTimeline spline
        if (!this.currentTimeline.splines) this.currentTimeline.splines = {};
        this.currentTimeline.splines[splineKey] = spline;

        // Create the WebAssembly spline object in the cache if not already created
        if (!this._splinesCache[splineKey]) {
          const wasmSpline = new wasm_Spline(spline.nodes.map(n => wasm_Vector3.new(n[0], n[1], n[2])), false, 0.5);
          this._splinesCache[splineKey] = wasmSpline;
        }
        break;
      }

      case "remove": {
        delete this.currentTimeline.splines[splineKey];

        // Free the WebAssembly object in the cache
        if (this._splinesCache[splineKey]) {
          this._splinesCache[splineKey].free();
          delete this._splinesCache[splineKey];
        }
        break;
      }

      default: {
        console.warn(`AnimationEngine: Unknown action '${action}' for refreshSpline.`);
        return;
      }
    }

    if (reRender)
      this.reRender({ force: true, cause: `refresh action: ${action} spline ${splineKey}` });

    // Save data to local storage
    useSourceManagerAPI.getState().saveDataToLocalStorage();
  }






  /**
   * Refreshes settings for an object in the animation engine's data structure.
   * @param action - The action to perform: 'set' or 'remove'.
   * @param settingKey - The key identifying the setting.
   * @param vxkey - The unique identifier for the object.
   */
  refreshSettings(
    action: 'set' | 'remove',
    settingKey: string,
    vxkey: string,
  ) {
    if (!this.currentTimeline.settings) {
      this.currentTimeline.settings = {};
    }

    if (!this.currentTimeline.settings[vxkey]) {
      this.currentTimeline.settings[vxkey] = {};
    }

    switch (action) {
      case 'set': {
        const value = useObjectSettingsAPI.getState().settings[vxkey]?.[settingKey];
        if (value === undefined) {
          console.warn(`AnimationEngine: Setting '${settingKey}' not found for object '${vxkey}'.`);
          return;
        }
        this.currentTimeline.settings[vxkey][settingKey] = value;
        break;
      }

      case 'remove': {
        delete this.currentTimeline.settings[vxkey][settingKey];
        break;
      }

      default: {
        console.warn(`AnimationEngine: Unknown action '${action}' for refreshSettings.`);
        return;
      }
    }

    // Save data to local storage
    useSourceManagerAPI.getState().saveDataToLocalStorage();
  }








  static truncateToDecimals(num: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.trunc(num * factor) / factor;
  }






  /**
   * Validates and corrects the precision of values in the given timelines.
   * @param timelines - A record of timelines to validate and fix.
   * @returns An array of validation error messages if any values needed correction.
   */
  static validateAndFixTimelines(timelines: Record<string, ITimeline>): string[] {
    console.log("Valding timelines ", timelines)
    const precision = AnimationEngine.ENGINE_PRECISION;
    const errors: string[] = [];

    const isValidPrecision = (value: number): boolean => {
      const factor = Math.pow(10, precision);
      return Math.round(value * factor) / factor === value;
    };

    Object.entries(timelines).forEach(([timelineId, timeline]) => {
      // Validate and fix timeline length precision
      if (!isValidPrecision(timeline.length)) {
        errors.push(`Timeline "${timelineId}" has invalid length precision: ${timeline.length}`);
        timeline.length = AnimationEngine.truncateToDecimals(timeline.length, precision);
      }

      // Validate and fix objects and their properties
      timeline.objects?.forEach((object) => {
        object.tracks.forEach(track => {
          track.keyframes.forEach(keyframe => {
            if (!isValidPrecision(keyframe.time)) {
              errors.push(`Keyframe time in "${object.vxkey}" has invalid precision: ${keyframe.time}`);
              keyframe.time = AnimationEngine.truncateToDecimals(keyframe.time, precision);
            }
            if (!isValidPrecision(keyframe.value)) {
              errors.push(`Keyframe value in "${object.vxkey}" has invalid precision: ${keyframe.value}`);
              keyframe.value = AnimationEngine.truncateToDecimals(keyframe.value, precision);
            }
          });
        });

        object.staticProps.forEach(staticProp => {
          if (!isValidPrecision(staticProp.value)) {
            errors.push(`Static prop "${staticProp.propertyPath}" in "${object.vxkey}" has invalid precision: ${staticProp.value}`);
            staticProp.value = AnimationEngine.truncateToDecimals(staticProp.value, precision);
          }
        });
      });

      // Validate and fix splines and nodes
      if(timeline.splines)
        Object.values(timeline.splines).forEach(spline => {
          spline.nodes.forEach((node, index) => {
            node.forEach((coord, coordIndex) => {
              if (!isValidPrecision(coord)) {
                errors.push(`Node ${index} in spline "${spline.splineKey}" has invalid precision for coordinate ${coordIndex}: ${coord}`);
                node[coordIndex] = AnimationEngine.truncateToDecimals(coord, precision);
              }
            });
          });
        });

    });

    return errors;
  }

}

