'use client'
// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { Emitter } from './emitter';
import { Events, EventTypes } from './events';
import { vxObjectProps } from '@vxengine/types/objectStore';

import * as THREE from "three"
import { IKeyframe, ISpline, IStaticProps, ITimeline, ITrack, RawObjectProps, RawTrackProps, edObjectProps } from './types/track';
import { IAnimationEngine } from './types/engine';
import { useTimelineEditorAPI } from '@vxengine/managers/TimelineManager/store';
import { useObjectPropertyAPI } from '@vxengine/managers/ObjectManager/store';
import { extractDataFromTrackKey } from '@vxengine/managers/TimelineManager/utils/trackDataProcessing';
import { useVXAnimationStore } from './AnimationStore';
import { useVXObjectStore } from '@vxengine/vxobject';
import { cubicBezier, solveCubicBezierT } from './utils/cubicBezier';
import { useSplineManagerAPI } from '@vxengine/managers/SplineManager/store';
// import { cubicBezier as wasmCubicBezier, solveCubicBezierT as wasmSolveCubicBezierT } from "../../build/release"

import init, {
  Spline as wasm_Spline,
  Vector3 as wasm_Vector3,
  interpolate_number as wasm_interpolateNumber,
} from '../wasm/pkg';
import { useObjectSettingsAPI } from '@vxengine/vxobject/ObjectSettingsStore';

const IS_DEV = process.env.NODE_ENG === 'development'

const DEBUG_REFRESHER = true;
const DEBUG_RERENDER = true;

export const ENGINE_PRECISION = 3;

export class AnimationEngine extends Emitter<EventTypes> implements IAnimationEngine {
  /** requestAnimationFrame timerId */
  private _timerId: number;
  private _prev: number;
  private _wasmReady: Promise<void>
  private _isWasmInitialized: boolean = false

  private _splinesCache: Record<string, any> = {}

  private _currentTime: number = 0;

  constructor() {
    super(new Events());
    this._wasmReady = this._initializeWasm();
  }

  get timelines() { return useVXAnimationStore.getState().timelines; }
  get isPlaying() { return useVXAnimationStore.getState().isPlaying; }
  get isPaused() { return !this.isPlaying; }
  get currentTimeline() { return useVXAnimationStore.getState().currentTimeline }
  get playRate() { return useVXAnimationStore.getState().playRate }


  // Refresh functions
  // Used to synchronize the data strcture from the Timeline editor with animation engine data structure

  /*   ------------------------   */
  /*                              */
  /*   Refresh Current Timeline   */
  /*                              */
  /*   ------------------------   */
  refreshCurrentTimeline() {
    if (!this.currentTimeline && DEBUG_REFRESHER) {
      console.log("VXAnimationEngine Refresher: No timeline is currently loaded.");
      return
    }
    const editorObjects = useTimelineEditorAPI.getState().editorObjects
    const tracks = useTimelineEditorAPI.getState().tracks
    const staticProps = useTimelineEditorAPI.getState().staticProps
    const keyframes = useTimelineEditorAPI.getState().keyframes

    // if (this.isPlaying) this.pause();

    if (DEBUG_REFRESHER) console.log("VXAnimationEngine: Refreshing Current Timeline");

    const currentObjectsMap = new Map(this.currentTimeline.objects.map(rawObject => [rawObject.vxkey, rawObject]));

    // Update / Add objects in the currentTimeline based on the editorObjects
    Object.keys(editorObjects).forEach(vxkey => {
      const edObject = editorObjects[vxkey];

      if (currentObjectsMap.has(vxkey)) {
        // Refresh existing raw object
        const rawObject = currentObjectsMap.get(vxkey);

        // Assign tracks to Object by converting from ITrack to RawTrackProps
        rawObject.tracks = edObject.trackKeys.map(trackKey => {
          const track = tracks[trackKey];

          const sortedKeyframes = track.keyframes
            .map(keyframeId => keyframes[keyframeId])
            .sort((a, b) => a.time - b.time);

          return {
            propertyPath: track.propertyPath,
            keyframes: sortedKeyframes // Sorted keyframes by time
          } as RawTrackProps;
        });

        // Assign staticProps
        rawObject.staticProps = edObject.staticPropKeys.map(staticPropKey => staticProps[staticPropKey]);

      } else {
        // Add new raw object to currentTimeline
        const newRawObject: RawObjectProps = {
          vxkey,
          tracks: edObject.trackKeys.map(trackKey => {
            const track = tracks[trackKey];
            return {
              propertyPath: track.propertyPath,
              keyframes: track.keyframes.map(keyframeId => keyframes[keyframeId]) // Resolved keyframes
            } as RawTrackProps;
          }),
          staticProps: edObject.staticPropKeys.map(staticPropKey => staticProps[staticPropKey]),
        };

        this.currentTimeline.objects.push(newRawObject);
      }
    });

    // Remove rawObjects that are no longer in editorObjects
    this.currentTimeline.objects = this.currentTimeline.objects.filter(rawObject => {
      return editorObjects.hasOwnProperty(rawObject.vxkey);
    });

    // Re-render the timeline
    this.reRender({ force: true, cause: "refresh currentTimeline" });
  }



  /*   -------------   */
  /*                   */
  /*   Refresh Track   */
  /*                   */
  /*   -------------   */
  refreshTrack(
    trackKey: string,
    action: 'create' | 'remove',
    reRender = true,
  ) {
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);
    const rawObject = this.currentTimeline.objects.find(rawObj => rawObj.vxkey === vxkey);

    if (DEBUG_REFRESHER)
      console.log("VXAnimationEngine: Refreshing track on edObject:", vxkey)

    if (action === "create") {
      const keyframesForTrack = useTimelineEditorAPI.getState().getKeyframesForTrack(trackKey);
      const rawTrack: RawTrackProps = {
        propertyPath: propertyPath,
        keyframes: keyframesForTrack || []
      }
      rawObject.tracks.push(rawTrack);
      if (DEBUG_REFRESHER)
        console.log(`VXAnimationEngine TrackRefresher: Track ${trackKey} was added to ${vxkey}`);
    }

    else if (action === "remove") {
      rawObject.tracks = rawObject.tracks.filter(rawTrack => rawTrack.propertyPath !== propertyPath)
      if (DEBUG_REFRESHER)
        console.log(`VXAnimationEngine TrackRefresher: Track ${trackKey} was removed from ${vxkey}`);
    }

    if (reRender)
      this.reRender({ force: true, cause: `refresh action: ${action} track ${trackKey}` });
  }



  /*   ----------------   */
  /*                      */
  /*   Refresh keyframe   */
  /*                      */
  /*   ----------------   */
  refreshKeyframe(
    trackKey: string,
    action: 'create' | 'remove' | 'update',
    keyframeKey: string,
    reRender = true
  ) {
    const { vxkey, propertyPath } = extractDataFromTrackKey(trackKey);

    if (DEBUG_REFRESHER) console.log("VXAnimationEngine: Refreshing keyframe on trackKey:", trackKey)

    this.currentTimeline.objects.forEach((object) => {
      object.tracks.forEach((track) => {
        if (track.propertyPath === propertyPath && object.vxkey === vxkey) {

          if (action === "create") {
            const edKeyframe = useTimelineEditorAPI.getState().keyframes[keyframeKey];
            track.keyframes.push(edKeyframe);
            track.keyframes.sort((a, b) => a.time - b.time);

            if (DEBUG_REFRESHER) console.log(`VXAnimationEngine KeyframeRefresher: Keyframe ${keyframeKey} added to track ${trackKey}`);
          }

          else if (action === "update") {
            const edKeyframe = useTimelineEditorAPI.getState().keyframes[keyframeKey];
            track.keyframes = track.keyframes.map(kf => kf.id === keyframeKey ? edKeyframe : kf);
            track.keyframes.sort((a, b) => a.time - b.time);

            if (DEBUG_REFRESHER) console.log(`VXAnimationEngine KeyframeRefresher: Keyframe ${keyframeKey} updated in track ${trackKey}`);
          }

          else if (action === "remove") {
            track.keyframes = track.keyframes.filter(kf => kf.id !== keyframeKey);
            
            if (DEBUG_REFRESHER) console.log(`VXAnimationEngine KeyframeRefresher: Keyframe ${keyframeKey} removed from track ${trackKey}`);
          }

        }
      });
    });


    if (reRender)
      this.reRender({ force: true, cause: `refresh action: ${action} keyframe ${keyframeKey}` });
  }



  /*   -------------------   */
  /*                         */
  /*   Refresh Static Prop   */
  /*                         */
  /*   -------------------   */
  refreshStaticProp(
    action: 'create' | 'remove' | 'update',
    staticPropKey: string,
    reRender = true,
  ) {
    const { vxkey, propertyPath } = extractDataFromTrackKey(staticPropKey)

    if (DEBUG_REFRESHER)
      console.log("VXAnimationEngine: Refreshing static prop")

    // ONLY refresh the object that has the static prop
    this.currentTimeline.objects.forEach((rawObject) => {
      if (rawObject.vxkey === vxkey) {

        if (action === "create") {
          const staticProp = useTimelineEditorAPI.getState().staticProps[staticPropKey];
          const propExists = rawObject.staticProps.some(
            (prop) => prop.propertyPath === propertyPath
          );

          if (!propExists) {
            rawObject.staticProps.push(staticProp);
          }
        }

        else if (action === "update") {
          const staticProp = useTimelineEditorAPI.getState().staticProps[staticPropKey];
          rawObject.staticProps = rawObject.staticProps.map((prop) => {
            if (prop.propertyPath === propertyPath)
              return staticProp
            else
              return prop;
          })
        }

        else if (action === "remove") {
          rawObject.staticProps = rawObject.staticProps
            .map((prop) => (prop.propertyPath === propertyPath ? null : prop))
            .filter(Boolean);
        }

        return
      }
    });

    if (reRender)
      this.reRender({ force: true, cause: `refresh action: ${action} static prop ${staticPropKey}` });
  }



  /*   --------------   */
  /*                    */
  /*   Refresh Spline   */
  /*                    */
  /*   --------------   */
  refreshSpline(
    action: 'create' | 'remove' | 'update',
    splineKey: string,
    reRender = true,
  ) {

    if (action === "create") {
      const spline = useSplineManagerAPI.getState().splines[splineKey];
      if (!this.currentTimeline.splines)
        this.currentTimeline.splines = {};
      this.currentTimeline.splines[splineKey] = spline

      // Create the WebAssembly spline object in the cache if not already created
      if (!this._splinesCache[splineKey]) {
        const wasmSpline = new wasm_Spline(spline.nodes.map(n => wasm_Vector3.new(n[0], n[1], n[2])), false, 0.5);
        this._splinesCache[splineKey] = wasmSpline;
      }
    }
    else if (action === "remove") {
      delete this.currentTimeline.splines[splineKey];

      // Free the WebAssembly object in the cache
      if (this._splinesCache[splineKey]) {
        this._splinesCache[splineKey].free();
        delete this._splinesCache[splineKey];
      }
    }
    else if (action === "update") {
      const spline = useSplineManagerAPI.getState().splines[splineKey];
      this.currentTimeline.splines = {
        ...this.currentTimeline.splines,
        [splineKey]: {
          ...this.currentTimeline.splines[splineKey],
          nodes: [...spline.nodes]  // Clone the nodes array
        }
      };

      // Free the old WebAssembly spline object in the cache and update it
      if (this._splinesCache[splineKey]) {
        this._splinesCache[splineKey].free();
      }

      const newWasmSpline = new wasm_Spline(spline.nodes.map(n => wasm_Vector3.new(n[0], n[1], n[2])), false, 0.5);
      this._splinesCache[splineKey] = newWasmSpline;
    }

    if (reRender)
      this.reRender({ force: true, cause: `refresh action: ${action} spline ${splineKey}` });
  }

  refreshSettings(
    action: 'set' | 'remove',
    settingKey: string,
    vxkey: string,
  ){
    if(action === "set"){
      const value = useObjectSettingsAPI.getState().settings[vxkey]?.[settingKey]
      if(!this.currentTimeline.settings)
        this.currentTimeline.settings = {}

      if(!this.currentTimeline.settings[vxkey])
        this.currentTimeline.settings[vxkey] = {}

      this.currentTimeline.settings[vxkey][settingKey] = value;    
    }
    else if(action === "remove"){
      delete this.currentTimeline.settings?.[vxkey]?.[settingKey];
    }
  }


  /*   -------------   */
  /*                   */
  /*   Cache Splines   */
  /*                   */
  /*   -------------   */
  async cacheSplines(splines: Record<string, ISpline>) {
    await this._wasmReady; // Ensure WASM is initialized

    Object.entries(splines).forEach(([key, spline]) => {
      const nodes = spline.nodes;
      let wasmNodes = [];
      nodes.forEach(node => {
        const wasmNode = wasm_Vector3.new(node[0], node[1], node[2]);
        wasmNodes.push(wasmNode);
      });
      const wasmSpline = new wasm_Spline(wasmNodes, false, 0.5); // Example args
      this._splinesCache[key] = wasmSpline;
    });
  }



  /*   --------------   */
  /*                    */
  /*   Set is playing   */
  /*                    */
  /*   --------------   */
  setIsPlaying(value: boolean) { useVXAnimationStore.setState({ isPlaying: value }) }



  /*   --------------------   */
  /*                          */
  /*   Set current Timeline   */
  /*                          */
  /*   --------------------   */
  setCurrentTimeline(timelineId: string) {
    console.log("VXAnimationEngine: Setting currentTimeline to ", timelineId)
    const selectedTimeline: ITimeline = this.timelines.find(timeline => timeline.id === timelineId);
    if (!selectedTimeline) {
      throw new Error(`VXAnimationEngine: Timeline with id ${timelineId} not found`);
    }

    useVXAnimationStore.setState({ currentTimeline: selectedTimeline })

    const { objects: rawObjects, splines: rawSplines } = selectedTimeline


    // set the Timeline Editor Data
    useTimelineEditorAPI.getState().setEditorData(rawObjects)

    this.cacheSplines(rawSplines);

    this.reRender({ time: this._currentTime, force: true });
  }


  setCurrentTime(time: number, isTick?: boolean): boolean {
    this._currentTime = time

    if (isTick) {
      this.trigger('timeUpdatedAutomatically', { time, engine: this });
      return;
    }
    else {
      this._applyAllKeyframes(time);
      this.trigger('timeSetManually', { time, engine: this });
    }

    return true;
  }


  loadTimelines(timelines: ITimeline[]) {
    useVXAnimationStore.setState({ timelines: timelines });

    console.log("VXAnimationEngine: Loading timelines ", timelines[0])
    if (timelines.length > 0) {
      this.setCurrentTimeline(timelines[0].id); // Automatically load the first timeline if available
    }
  }


  reRender(params: {
    time?: number,
    force?: boolean,
    cause?: string
  } = {}) {
    const { time, force, cause } = params
    if (this.isPlaying && force === false)
      return;

    if (DEBUG_RERENDER)
      console.log("VXAnimationEngine: rerendering", " cause: ", cause)

    this._applyAllStaticProps();
    if (time !== undefined) {
      this._applyAllKeyframes(time);
    }
    else {
      this._applyAllKeyframes(this._currentTime)
      console.log("Rerendering with current time ", this._currentTime)
    }
  }


  play(param: {
    toTime?: number;
    autoEnd?: boolean;
  }): boolean {
    const { toTime, autoEnd } = param;

    if (this.isPlaying || (toTime && toTime <= this._currentTime)) return false;

    this.setIsPlaying(true);

    this._timerId = requestAnimationFrame((time: number) => {
      this._prev = time;
      this._tick({ now: time, autoEnd, to: toTime });
    });
  }


  pause() {
    if (this.isPlaying) {
      this.setIsPlaying(false)
      this.trigger('paused', { engine: this });
    }
    cancelAnimationFrame(this._timerId);
  }


  // When called, it initializes objects props
  // During the animationEngine initialization, the engine loads the first timeline, 
  // but it cant apply all keyframes and static props because the objects arent mounted at that point
  initObjectOnMount(object: vxObjectProps) {
    console.log("VXAnimationEngine: Initializing vxobject", object)
    const objectInTimeline = this.currentTimeline.objects.find(obj => obj.vxkey === object.vxkey)
    if (!objectInTimeline) {
      const newRawObject = {
        vxkey: object.vxkey,
        tracks: [],
        staticProps: []
      }
      this.currentTimeline.objects.push(newRawObject)
      return
    }

    if (objectInTimeline.tracks) {
      objectInTimeline.tracks.forEach(track => {
        const vxkey = object.vxkey;
        const propertyPath = track.propertyPath
        const keyframes = track.keyframes

        this._applyKeyframes(object, propertyPath, keyframes, this._currentTime);
      })
    }
    if (objectInTimeline.staticProps) {
      objectInTimeline.staticProps.map(staticProp => {
        this._updateObjectProperty(object, staticProp.propertyPath, staticProp.value)
      })
    }
  }

  // private _initializeWasm() {
  //   try {
  //     this._wasmInstance = await loadWasmModule();
  //     this._isWasmInitialized = true;
  //   } catch (error) {
  //     console.log('VXAnimationEngine Error: Failed to initialize WebAssembly module:', error)
  //     console.log('VXAnimationEngine: Using fallback interpolater');
  //   }
  // }
  private async _initializeWasm() {
    try {
      await init();  // Wait for the WebAssembly module to initialize
      this._isWasmInitialized = true;
      console.log("AnimationEngine: WASM initialized successfully");
    } catch (error) {
      console.error("AnimationEngine Error: Failed to initialize WASM", error);
    }
  }


  private _tick(data: { now: number; autoEnd?: boolean; to?: number }) {
    if (this.isPaused) return;
    const { now, autoEnd, to } = data;

    let newCurrentTime = this._currentTime + (Math.min(1000, now - this._prev) / 1000) * this.playRate;
    this._prev = now;

    if (to && to <= newCurrentTime) newCurrentTime = to;
    this.setCurrentTime(newCurrentTime, true);

    this._applyAllKeyframes(newCurrentTime);

    // Determine whether to stop or continue the animation
    if (to && to <= newCurrentTime)
      this._end();

    if (this.isPaused) return;

    this._timerId = requestAnimationFrame((time) => {
      this._tick({ now: time, autoEnd, to });
    });
  }


  private _applyAllKeyframes(currentTime: number) {
    const objectsStoreState = useVXObjectStore.getState();
    this.currentTimeline.objects.forEach(object => {
      const vxkey = object.vxkey;
      const vxobject = objectsStoreState.objects[vxkey];
      if (!vxobject) return

      object.tracks.forEach(track => {
        const propertyPath = track.propertyPath
        const keyframes = track.keyframes

        this._applyKeyframes(vxobject, propertyPath, keyframes, currentTime);
      })
    })
  }


  private _applyKeyframes(
    vxobject: vxObjectProps,
    propertyPath: string,
    keyframes: IKeyframe[],
    currentTime: number
  ) {
    if (!vxobject) return;

    let interpolatedValue: number | THREE.Vector3;

    if (keyframes.length === 0) return

    if (currentTime < keyframes[0].time) {
      interpolatedValue = keyframes[0].value;
    } else if (currentTime > keyframes[keyframes.length - 1].time) {
      interpolatedValue = keyframes[keyframes.length - 1].value;
    } else {
      interpolatedValue = this._interpolateKeyframes(keyframes, currentTime);
      // This is used by the Object properties ui panel
      // since its only used in the development server, we dont need it in production because it can slow down
      // TODO: make this optional when in production
      useObjectPropertyAPI.getState().updateProperty(vxobject.vxkey, propertyPath, interpolatedValue)
    }
    this._updateObjectProperty(vxobject, propertyPath, interpolatedValue);

    if(propertyPath === "splineProgress"){
      this._applySplinePosition(vxobject, interpolatedValue as number / 100)
    }
  }


  private _interpolateKeyframes(keyframes: IKeyframe[], currentTime: number): number | THREE.Vector3 {
    let startKeyframe: IKeyframe | undefined;
    let endKeyframe: IKeyframe | undefined;

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (currentTime >= keyframes[i].time && currentTime <= keyframes[i + 1].time) {
        startKeyframe = keyframes[i];
        endKeyframe = keyframes[i + 1];
        break;
      }
    }

    // If currentTime < first keyframe or currentTime > last keyframe, return closest keyframe value
    if (!startKeyframe || !endKeyframe) {
      return keyframes.length > 0 ? keyframes[0].value as number : 0;
    }

    const duration = endKeyframe.time - startKeyframe.time;
    const progress = truncateToDecimals((currentTime - startKeyframe.time) / duration, ENGINE_PRECISION + 1)

    const interpolatedValue = this._interpolateNumber(startKeyframe, endKeyframe, progress);

    // Truncate the result to ensure precision
    return truncateToDecimals(interpolatedValue, ENGINE_PRECISION);
  }

  private _interpolateNumber(
    startKeyframe: IKeyframe,
    endKeyframe: IKeyframe,
    progress: number
  ): number {
    const startValue = startKeyframe.value as number;
    const endValue = endKeyframe.value as number;

    const startHandleX = startKeyframe.handles.out.x || 0.3
    const startHandleY = startKeyframe.handles.out.y || 0.3

    const endHandleX = endKeyframe.handles.in.x || 0.7
    const endHandleY = endKeyframe.handles.in.y || 0.7

    // WebAssembly Number Interpolator
    if (this._isWasmInitialized) {
      const WASM_interpolatedValue = wasm_interpolateNumber(
        startValue,
        endValue,
        startHandleX,
        startHandleY,
        endHandleX,
        endHandleY,
        progress
      )

      return WASM_interpolatedValue;
    }

    // Fallback JS Number Interpolator
    const p0: { x: number, y: number } = { x: 0, y: startValue };
    const p1: { x: number, y: number } = {
      x: startHandleX,
      y: startValue + startHandleY * (endValue - startValue),
    };
    const p2: { x: number, y: number } = {
      x: endHandleX,
      y: startValue + endHandleY * (endValue - startValue),
    };
    const p3: { x: number, y: number } = { x: 1, y: endValue };

    if ( // Special case for linear interpolation
      startHandleX === 0.3 && startHandleY === 0.3 &&
      endHandleX === 0.7 && endHandleY === 0.7
    ) {
      return startValue + (endValue - startValue) * progress;
    }

    const t = solveCubicBezierT(p0.x, p1.x, p2.x, p3.x, progress);
    const JS_interpolatedValue = cubicBezier(p0.y, p1.y, p2.y, p3.y, t);

    return JS_interpolatedValue;
  }


  private _applyAllStaticProps() {
    this, this.currentTimeline.objects.map(obj => {
      const vxkey = obj.vxkey
      const vxobject = useVXObjectStore.getState().objects[vxkey]

      if (!vxobject) return

      obj.staticProps.map(staticProp => {
        this._updateObjectProperty(vxobject, staticProp.propertyPath, staticProp.value)
      })
    })
  }

  private _applySplinePosition(vxobject: vxObjectProps, splineProgress: number) {
    const vxkey = vxobject.vxkey;
    const splineKey = useObjectSettingsAPI.getState().settings[vxkey]?.positionSplineKey;
  
    if (!splineKey || !this._splinesCache[splineKey]) {
      console.warn(`Spline ${splineKey} not found for ${vxkey}`);
      return;
    }
  
    // Get the spline from the cache
    const spline = this._splinesCache[splineKey];
  
    // Get the interpolated position from the spline
    const interpolatedPosition = spline.get_point(splineProgress);
  
    // Apply the interpolated position to the object
    vxobject.ref.current.position.set(interpolatedPosition.x, interpolatedPosition.y, interpolatedPosition.z);
  }


  private _updateObjectProperty(
    vxobject: vxObjectProps,
    propertyPath: string,
    newValue: number | THREE.Vector3
  ) {
    const propertyKeys = propertyPath.split('.');
    let target = vxobject.ref.current;

    if (target === undefined) return;

    // Navigate through the property path
    for (let i = 0; i < propertyKeys.length - 1; i++) {
      if (target[propertyKeys[i]] === undefined) {
        return;
      }
      target = target[propertyKeys[i]];
    }

    // Update the final property if target is still defined
    const finalPropertyKey = propertyKeys[propertyKeys.length - 1];
    if (target !== undefined) {
      target[finalPropertyKey] = newValue;
    }
  }

  /** Playback completed */
  private _end() {
    this.pause();
    this.trigger('ended', { engine: this });
  }
}


function truncateToDecimals(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.trunc(num * factor) / factor;
}