// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { Emitter } from './emitter';
import { Events, EventTypes } from './events';
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore';

import * as THREE from "three"
import { IAnimationEngine, TrackSideEffectCallback } from './types/engine';
import { useTimelineManagerAPI } from '@vxengine/managers/TimelineManager/store';
import { updateProperty } from '@vxengine/managers/ObjectManager/stores/managerStore';
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing';
import { useAnimationEngineAPI } from './store';
import { js_interpolateNumber } from './utils/interpolateNumber';
import { cloneDeep } from 'lodash';

import { useSourceManagerAPI } from '../managers/SourceManager/store'
import { useUIManagerAPI } from '@vxengine/managers/UIManager/store';
import { invalidate } from '@react-three/fiber';
import { defaultSideEffects } from './defaultSideEffects';
import { HydrationService } from './services/HydrationService';
import { logReportingService } from './services/LogReportingService';
import { WasmService } from './services/WasmService';
import { SplineService } from './services/SplineService';
import { RawKeyframe, RawObject, RawProject, RawTimeline } from '@vxengine/types/data/rawData';
import { GpuComputeService } from './services/GpuComputeService';

const DEBUG_RERENDER = false;
const DEBUG_OBJECT_INIT = true;

const LOG_MODULE = "AnimationEngine"



export class AnimationEngine extends Emitter<EventTypes> implements IAnimationEngine {
  // ====================================================
  // Public Static Members
  // ====================================================
  public static readonly ENGINE_PRECISION = 4
  public static readonly VALUE_CHANGE_THRESHOLD = 0.001;
  public static defaultSideEffects: Record<string, TrackSideEffectCallback> = defaultSideEffects;

  public cameraRequiresProjectionMatrixRecalculation: boolean = false;
  public environmentRequiresUpdate: boolean = false

  // ====================================================
  // Public Instance Getters (API)
  // ====================================================
  public get timelines() { return useAnimationEngineAPI.getState().timelines; }
  public get isPlaying() { return useAnimationEngineAPI.getState().isPlaying; }
  public get isPaused() { return !this.isPlaying; }
  public get playRate() { return useAnimationEngineAPI.getState().playRate }
  public get currentTimeline() { return this._currentTimeline }
  public get currentTime() { return this._currentTime }

  public get splineService(): SplineService { return this._splineService }
  public get hydrationService(): HydrationService { return this._hydrationService }
  public get gpuComputeService(): GpuComputeService {
    if (!this._gpuComputeService) return undefined
    // logReportingService.logFatal(
    //   `GpuComputeService isn't initialized. Ensure you're using this after the VXRenderer element mounts.`, {module: LOG_MODULE, functionName: "get gpuComputeService()"})
    return this._gpuComputeService;
  }

  // ====================================================
  // Private Instance Properties
  // ====================================================
  private _id: string
  private _timerId: number;
  private _isReady: boolean = false

  private _objectPropertiesSetterCache: Map<string, Map<string, (newValue: number) => void>> = new Map()
  private _tracksArray: { vxkey: string, propertyPath: string, trackKey: string }[] = []
  private _object3DCache: Map<string, THREE.Object3D> = new Map();
  private _lastInterpolatedValues: Map<string, number> = new Map();
  private _sideEffectCallbacks: Map<string, TrackSideEffectCallback> = new Map();

  private _currentTimeline: RawTimeline = null;
  private _currentTime: number = 0;
  private _prevTime: number;

  // ====================================================
  // Services
  // ====================================================
  private _hydrationService: HydrationService;
  private _splineService: SplineService
  private _wasmService: WasmService;
  private _gpuComputeService: GpuComputeService;

  private _IS_DEVELOPMENT: boolean = false;
  private _IS_PRODUCTION: boolean = false;

  constructor() {
    super(new Events());

    this._id = Math.random().toString(36).substring(2, 9); // Generate a random unique ID
    logReportingService.logInfo(
      `Created instance with ID: ${this._id}`, { module: LOG_MODULE, functionName: "constructor" });

    // Initialize Services
    this._wasmService = new WasmService("/assets/wasm/rust_bg.wasm");
    this._splineService = new SplineService(this._wasmService);
    this._hydrationService = new HydrationService(this.splineService);
    this._gpuComputeService = new GpuComputeService();
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

    this.setCurrentTimeline(firstTimelineID, isMounting);

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
  public setCurrentTimeline(timelineId: string, isMounting: boolean = false) {
    const LOG_CONTEXT = {
      module: "AnimationEngine",
      functionName: "setCurrentTimeline",
      additionalData: { timelines: this.timelines, IS_DEVELOPMENT: this._IS_DEVELOPMENT, IS_PRODUCTION: this._IS_PRODUCTION }
    }
    // Update the current timeline ID in the state

    logReportingService.logInfo(`Setting current timeline to ${timelineId}`, LOG_CONTEXT)

    const selectedTimeline: RawTimeline = this.timelines[timelineId];
    if (!selectedTimeline)
      logReportingService.logFatal(
        `Timeline with id ${timelineId} was not found`, LOG_CONTEXT)

    // Set the states in the store
    useAnimationEngineAPI.setState({ currentTimeline: selectedTimeline })
    useAnimationEngineAPI.setState({ currentTimelineID: timelineId });
    this._currentTimeline = selectedTimeline;

    this._computeTracksArray(selectedTimeline);

    
    this._gpuComputeService.buildTextures(selectedTimeline);
    this._gpuComputeService.computeInterpolations(this._currentTime);

    if (isMounting === false) {
      // compute isn't present on Canvas mount because it needs the renderer
      this._applyTracksOnTimeline(this.currentTime, true)
    }

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

    if (this.isPlaying && !force)
      return;

    if (DEBUG_RERENDER)
      logReportingService.logInfo(
        `Re-rendering because ${cause}`, { module: LOG_MODULE, functionName: "reRender" })

    const targetTime = time !== undefined ? time : this._currentTime;

    this._applyAllStaticProps();
    this._applyTracksOnTimeline(targetTime)
    this._updateCameraIfNeeded();
  }





  /**
   * Starts playing the animation, optionally up to a specific time with an auto-end feature.
   * @param param - An object containing optional parameters:
   *   - toTime: The time to play up to.
   *   - autoEnd: Whether to automatically end the animation when `toTime` is reached.
   * @returns True if the animation starts playing, false otherwise.
   */
  public play(param: { toTime?: number; autoEnd?: boolean; } = {}) {
    let { toTime, autoEnd = true } = param;
    if (toTime === undefined) {
      toTime = this._currentTimeline.length;
    }

    // Check if is already playing or the current time has exceeded the toTime
    if (this.isPlaying
      || (toTime !== undefined && toTime <= this._currentTime)
    )
      return;

    useAnimationEngineAPI.setState({ isPlaying: true })

    logReportingService.logInfo(
      `Started Playing`, { module: "AnimationEngine", functionName: "play" })

    this._timerId = requestAnimationFrame((time: number) => {
      this._prevTime = time;
      this._tick(time, toTime, autoEnd);
    });

  }





  /**
   * Pauses the animation playback and triggers a 'paused' event.
   */
  public pause() {
    logReportingService.logInfo("Pause triggered", { module: LOG_MODULE, functionName: "pause" })
    if (this.isPlaying) {
      useAnimationEngineAPI.setState({ isPlaying: false })
      this.trigger('paused', { engine: this });
    }
    cancelAnimationFrame(this._timerId);
  }





  // ====================================================
  // Public Object Lifecycle
  // ====================================================

  /**
   * Initializes object properties when the object is mounted.
   * Applies initial tracks and static properties to the object.
   * @param vxObject - The object to initialize.
   */
  public initObjectOnMount(vxObject: vxObjectProps) {
    const vxkey = vxObject.vxkey;

    if (!this._isReady)
      return;

    // Initialize all Side Effects
    Object.entries(vxObject.params).forEach(([propertyPath, param]) => {
      const sideEffect = param.sideEffect;
      const trackKey = `${vxkey}.${propertyPath}`
      if (sideEffect) {
        this.registerSideEffect(trackKey, sideEffect)
      }
    })

    // Cache the THREE.Object3D reference
    const object3DRef = this._cacheObject3DRef(vxObject);
    if (DEBUG_OBJECT_INIT)
      logReportingService.logInfo(`Initializing vxobject ${vxObject.name}`, { module: LOG_MODULE, functionName: "initObjectOnMount", additionalData: { vxObject } })

    const rawObject = this.currentTimeline.objects.find(obj => obj.vxkey === vxkey);

    if (!rawObject)
      return

    this._computeObjectPropertySetterCache(vxObject.ref.current, rawObject);
    
    this._applyInitialTracksOnTimelineForObject(vxkey);

    this._applyStaticPropsOnObject(rawObject, object3DRef);
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
  }





  // ==================================================== 
  // Public SideEffect Management Methods
  // ====================================================

  public registerSideEffect(trackKey: string, callback: TrackSideEffectCallback): void {
    this._sideEffectCallbacks.set(trackKey, callback);
  }

  public getSideEffect(trackKey: string): TrackSideEffectCallback {
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey)
    return this._sideEffectCallbacks.get(trackKey) || AnimationEngine.defaultSideEffects[propertyPath];
  }

  public hasSideEffect(trackKey: string): boolean {
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);

    return this._sideEffectCallbacks.has(trackKey) || !!AnimationEngine.defaultSideEffects[propertyPath];
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
    if (this.isPaused) {
      return;
    }

    invalidate();

    const deltaTime = Math.min(1000, now - this._prevTime) / 1000;
    let newCurrentTime = this._currentTime + deltaTime * this.playRate;
    this._prevTime = now;

    if (to !== undefined && to <= newCurrentTime) {
      newCurrentTime = to;
    }

    this.setCurrentTime(newCurrentTime, true);
    this._applyTracksOnTimeline(newCurrentTime);
    this._updateCameraIfNeeded();

    invalidate();

    // Determine whether to stop or continue the animation
    if (to !== undefined && to <= newCurrentTime) {
      this._end();
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
      this._updateObjectProperty(
        rawObject.vxkey,
        staticProp.propertyPath,
        staticProp.value
      );
    });
  }





  private _applyTracksOnTimeline(currentTime: number, force?: boolean) {
    this._gpuComputeService.computeInterpolations(currentTime);
    const pixelBuffer = this._gpuComputeService.pixelBuffer;
    const numTracks = this._gpuComputeService.computeTextureHeight;

    for (let i = 0; i < numTracks; i++) {
      const valueIndex = i * 4; // the value is stored on the "r" index of (rgba)
      const newValue = pixelBuffer[valueIndex];
      const { vxkey, propertyPath, trackKey } = this._tracksArray[i]
 
      this._updateObjectProperty(vxkey, propertyPath, newValue);
    }
  }

  private _applyInitialTracksOnTimelineForObject(vxkey: string){
    const pixelBuffer = this._gpuComputeService.pixelBuffer;
    const numTracks = this._gpuComputeService.computeTextureHeight;
    
    const setterMap = this._objectPropertiesSetterCache.get(vxkey);
    if(!setterMap){
      console.error(`Setter map for ${vxkey} is undefined in applyInitialTracksOnTimelineForObject but it should exist`)
    }
    for(let i=0; i< numTracks; i++){
      const {vxkey: _vxkey, propertyPath, trackKey} = this._tracksArray[i];
      if(vxkey === _vxkey){
        const valueIndex = i * 4;
        const newValue = pixelBuffer[valueIndex];
        
        this._updateObjectProperty(vxkey, propertyPath, newValue);
      }
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
   * Applies all static properties to their respective objects.
   */
  private _applyAllStaticProps() {
    this.currentTimeline.objects.forEach(rawObj => {
      if (rawObj.staticProps.length === 0) {
        return
      }

      const vxkey = rawObj.vxkey;

      rawObj.staticProps.forEach(rawStaticProp => {
        this._updateObjectProperty(
          vxkey,
          rawStaticProp.propertyPath,
          rawStaticProp.value
        );
      });
    });
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
    newValue: number
  ) {
    const object3DRef = this._object3DCache.get(vxkey);
    if(!object3DRef)
      return
    const generalKey = `${vxkey}.${propertyPath}`

    const settersMap = this._objectPropertiesSetterCache.get(vxkey);
    if(!settersMap){
      console.warn(`No setters map for object ${vxkey} was found. Initializing one`);
      return 
    }

    const setter = settersMap.get(propertyPath);
    setter(newValue);

    console.log(`Setting new Value for ${generalKey} newValue: ${newValue}`)

    const sideEffect = this._sideEffectCallbacks.get(generalKey) || AnimationEngine.defaultSideEffects[propertyPath];
    if (sideEffect)
      sideEffect(
        this,
        vxkey,
        propertyPath,
        object3DRef,
        newValue
      );

    if (this._IS_DEVELOPMENT)
      updateProperty(vxkey, propertyPath, newValue);
  }



  private _computeObjectPropertySetterCache(object: any, rawObject: RawObject): void {
    const settersMap = new Map<string, (newValue: number) => void>()
    
    rawObject.tracks.forEach(rawTrack => {
      const setter = this._generateObjectPropertySetter(object, rawTrack.propertyPath);
      settersMap.set(rawTrack.propertyPath, setter);
    })

    rawObject.staticProps.forEach(rawStaticProp => {
      const setter = this._generateObjectPropertySetter(object, rawStaticProp.propertyPath);
      settersMap.set(rawStaticProp.propertyPath, setter);
    })

    this._objectPropertiesSetterCache.set(rawObject.vxkey, settersMap);
  }




  private _computeTracksArray(timeline: RawTimeline): void {
    let index = 0;
    timeline.objects.forEach(rawObj => {
      rawObj.tracks.forEach(rawTrack => {
        this._tracksArray[index] = {
          vxkey: rawObj.vxkey,
          propertyPath: rawTrack.propertyPath,
          trackKey: `${rawObj.vxkey}.${rawTrack.propertyPath}`
        }
        index++;
      })
    })
  }





  private _generateObjectPropertySetter(object: any, propertyPath: string): (newValue: any) => void {
    const propertyKeys = propertyPath.split('.');
    let target = object;

    for (let i = 0; i < propertyKeys.length - 1; i++) {
      const key = propertyKeys[i];

      if (Array.isArray(target)) {
        const index = parseInt(key, 10);
        if (Number.isNaN(index)) {
          throw new Error(`Invalid array index '${key}' in path '${propertyPath}'`);
        }
        target = target[index];
      } else {
        target = target[key];
      }

      if (target === undefined || target === null) {
        console.log("Issues on object ", object)
        debugger
        throw new Error(`Property '${key}' is undefined or null in path '${propertyPath}'`);
      }
    }

    const finalKey = propertyKeys[propertyKeys.length - 1];

    // Handle the final key based on the target type
    if (Array.isArray(target)) {
      const index = parseInt(finalKey, 10);
      if (Number.isNaN(index)) {
        throw new Error(`Final key '${finalKey}' is not a valid array index in '${propertyPath}'`);
      }
      return (newValue: any) => {
        target[index] = newValue;
      };
    } else if (target instanceof Map) {
      return (newValue: any) => {
        const mapValue = target.get(finalKey);
        if (mapValue) {
          mapValue.value = newValue;
        } else {
          throw new Error(`Key '${finalKey}' not found in Map at path '${propertyPath}'`);
        }
      };
    } else {
      return (newValue: any) => {
        target[finalKey] = newValue;
      };
    }
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