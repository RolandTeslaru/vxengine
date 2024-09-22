// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { Emitter } from './emitter';
import { Events, EventTypes } from './events';
import { vxObjectProps } from 'vxengine/types/objectStore';

import * as THREE from "three"
import { IKeyframe, IStaticProps, ITimeline, ITrack, RawObjectProps, RawTrackProps, edObjectProps } from './types/track';
import { IAnimationEngine } from './types/engine';
import { useTimelineEditorAPI } from 'vxengine/managers/TimelineManager/store';
import { useObjectPropertyStore } from 'vxengine/managers/ObjectManager/store';
import { extractDataFromTrackKey } from 'vxengine/managers/TimelineManager/utils/trackDataProcessing';
import { useVXAnimationStore } from './AnimationStore';
import { useVXObjectStore } from 'vxengine/vxobject';

const IS_DEV = process.env.NODE_ENG === 'development'

const DEBUG_REFRESHER = false;
const DEBUG_RERENDER = true;

export const ENGINE_PRECISION = 3;

export class AnimationEngine extends Emitter<EventTypes> implements IAnimationEngine {
  /** requestAnimationFrame timerId */
  private _timerId: number;
  private _prev: number;

  private _currentTime: number = 0;

  constructor() {
    super(new Events());
  }

  get timelines() { return useVXAnimationStore.getState().timelines; }
  get isPlaying() { return useVXAnimationStore.getState().isPlaying; }
  get isPaused() { return !this.isPlaying; }
  get currentTimeline() { return useVXAnimationStore.getState().currentTimeline }
  get playRate() { return useVXAnimationStore.getState().playRate }


  // Refresh functions
  // Used to synchronize the data strcture from the Timeline editor with animation engine data structure

  refreshCurrentTimeline() {
    if (!this.currentTimeline && DEBUG_REFRESHER){
      console.log("VXAnimationEngine Refresher: No timeline is currently loaded.");
      return
    }
    const editorData = useTimelineEditorAPI.getState().editorData
    const tracks = useTimelineEditorAPI.getState().tracks
    const staticProps = useTimelineEditorAPI.getState().staticProps
    const keyframes = useTimelineEditorAPI.getState().keyframes

    // if (this.isPlaying) this.pause();

    if(DEBUG_REFRESHER) console.log("VXAnimationEngine: Refreshing Current Timeline");

    const currentObjectsMap = new Map(this.currentTimeline.objects.map(rawObject => [rawObject.vxkey, rawObject]));

    // Update / Add objects in the currentTimeline based on the editorData
    Object.keys(editorData).forEach(vxkey => {
      const edObject = editorData[vxkey];

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

    // Remove rawObjects that are no longer in editorData
    this.currentTimeline.objects = this.currentTimeline.objects.filter(rawObject => {
      return editorData.hasOwnProperty(rawObject.vxkey);
    });

    // Re-render the timeline
    this.reRender({ force: true, cause: "refresh currentTimeline" });
  }


  refreshKeyframe(
    trackKey: string,
    action: 'create' | 'remove' | 'update',
    keyframeKey: string,
    reRender = true
  ) {
    const edKeyframe = useTimelineEditorAPI.getState().keyframes[keyframeKey];
    const {vxkey, propertyPath } = extractDataFromTrackKey(trackKey);

    if(DEBUG_REFRESHER)
      console.log("VXAnimationEngine: Refreshing keyframe on trackKey:", trackKey)

    this.currentTimeline.objects.forEach((object) => {
      object.tracks.forEach((track) => {
        if (track.propertyPath === propertyPath) {
          switch (action) {
            case 'create':
              track.keyframes.push(edKeyframe);
              track.keyframes.sort((a, b) => a.time - b.time);
              if(DEBUG_REFRESHER)
                console.log(`VXAnimationEngine KeyframeRefresher: Keyframe ${keyframeKey} added to track ${trackKey}`);
              break;

            case 'remove':
              track.keyframes = track.keyframes.filter(kf => kf.id !== keyframeKey);
              if(DEBUG_REFRESHER)
                console.log(`VXAnimationEngine KeyframeRefresher: Keyframe ${keyframeKey} removed from track ${trackKey}`);
              break;

            case 'update':
              track.keyframes = track.keyframes.map(kf => kf.id === keyframeKey ? edKeyframe : kf);
              track.keyframes.sort((a, b) => a.time - b.time);
              if(DEBUG_REFRESHER)
                console.log(`VXAnimationEngine KeyframeRefresher: Keyframe ${keyframeKey} updated in track ${trackKey}`);
              break;

            default:
              console.error('Invalid action type');
          }
        }
      });
    });

    if (reRender)
      this.reRender({ force: true, cause: `refresh action: ${action} keyframe ${keyframeKey}` });
  }


  refreshStaticProp(
    action: 'create' | 'remove' | 'update',
    staticPropKey: string,
    reRender = true,
  ) {
    const staticProp = useTimelineEditorAPI.getState().staticProps[staticPropKey];

    if(DEBUG_REFRESHER)
      console.log("VXAnimationEngine: Refreshing static prop")

    this.currentTimeline.objects.forEach((rawObject) => {
      switch (action) {
        case 'create':
          const propExists = rawObject.staticProps.some(
            (prop) => prop.propertyPath === staticProp.propertyPath
          );

          if (!propExists) {
            rawObject.staticProps.push(staticProp);
          }
          break;
        case 'update':
          rawObject.staticProps = rawObject.staticProps.map((prop) => {
            if (prop.propertyPath === staticProp.propertyPath)
              return staticProp
            else
              return prop;
          })
          break;
        case 'remove':
          rawObject.staticProps = rawObject.staticProps
            .map((prop) => (prop.propertyPath === staticProp.propertyPath ? null : prop))
            .filter(Boolean); 
      }
    });

    if (reRender)
      this.reRender({ force: true, cause: `refresh action: ${action} static prop ${staticPropKey}` });
  }

  // Setter functions

  setIsPlaying(value: boolean) { useVXAnimationStore.setState({ isPlaying: value }) }


  setCurrentTimeline(timelineId: string) {
    console.log("VXAnimationEngine: Setting currentTimeline to ", timelineId)
    const selectedTimeline = this.timelines.find(timeline => timeline.id === timelineId);
    if (!selectedTimeline) {
      throw new Error(`VXAnimationEngine: Timeline with id ${timelineId} not found`);
    }

    useVXAnimationStore.setState({ currentTimeline: selectedTimeline })

    this.reRender({ time: this._currentTime, force: true });

    const rawObjects = selectedTimeline.objects

    //  Initialize the Editor Data
    useTimelineEditorAPI.getState().setEditorData(rawObjects)
  }


  setCurrentTime(time: number, isTick?: boolean): boolean {
    const result = isTick || this.trigger('beforeSetTime', { time, engine: this });
    if (!result) return false;

    this._currentTime = time

    this._applyAllKeyframes(time);

    if (isTick) this.trigger('timeUpdatedAutomatically', { time, engine: this });
    else this.trigger('timeSetManually', { time, engine: this });
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

    if(DEBUG_RERENDER)
      console.log("VXAnimationEngine: rerendering", " cause: ", cause)

    this._applyAllStaticProps();
    if (time !== undefined)
      this._applyAllKeyframes(time);
    else
      this._applyAllKeyframes(this._currentTime)
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


  // When called, it initializes the objects props 
  // During the animationEngine initialization, the engine loads the first timeline, 
  // but it cant apply all the keyframes and static props because the objects arent mounted at that point
  initObjectOnMount(object: vxObjectProps) {
    console.log("AnimationEngine: InitObjectOnMount", object)
    const objectInTimeline = this.currentTimeline.objects.find(obj => obj.vxkey === object.vxkey)
    if(!objectInTimeline) {
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
      if(!vxobject) return

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
      useObjectPropertyStore.getState().updateProperty(vxobject.vxkey, propertyPath, interpolatedValue)
    }
    this._updateObjectProperty(vxobject, propertyPath, interpolatedValue);
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
    const progress = (currentTime - startKeyframe.time) / duration;

    const interpolatedValue = this._interpolateNumber(startKeyframe, endKeyframe, progress);

    // Truncate the result to ensure precision
    return this.truncateToDecimals(interpolatedValue, ENGINE_PRECISION);
  }


  private _interpolateNumber(
    startKeyframe: IKeyframe,
    endKeyframe: IKeyframe,
    progress: number
  ): number {
    const startValue = startKeyframe.value as number;
    const endValue = endKeyframe.value as number;

    // Handles default to linear if not provided
    const startHandle = startKeyframe.handles?.out || { x: 1, y: 1 };
    const endHandle = endKeyframe.handles?.in || { x: 0, y: 0 };

    return this._cubicBezier(
      startValue,
      startValue + startHandle.y * (endValue - startValue), // Control point based on handle "out"
      endValue + endHandle.y * (startValue - endValue),     // Control point based on handle "in"
      endValue,
      progress
    );
  }

  
  private _cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const u = 1 - t;
    return (
      u ** 3 * p0 +
      3 * u ** 2 * t * p1 +
      3 * u * t ** 2 * p2 +
      t ** 3 * p3
    );
  }

  
  private truncateToDecimals(num: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.trunc(num * factor) / factor;
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
