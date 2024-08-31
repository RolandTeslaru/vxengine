// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { TimelineAction, TimelineRow } from './interface/action';
import { TimelineEffect } from './interface/effect';
import { Emitter } from './emitter';
import { Events, EventTypes } from './events';
import { vxObjectProps } from 'vxengine/types/objectStore';

import * as THREE from "three"
import { IObjectEditorData, IKeyframe, IStaticProps, ITimeline, ITrack } from './types/track';
import { useVXObjectStore } from 'vxengine/store/ObjectStore';
import { IAnimationEngine } from './types/engine';
import { useTimelineEditorStore } from 'vxengine/managers/TimelineManager/store';
import { useObjectPropertyStore } from 'vxengine/managers/ObjectManager/store';
import { useVXAnimationStore } from 'vxengine/store/AnimationStore';

const IS_DEV = process.env.NODE_ENG === 'development'

export class AnimationEngine extends Emitter<EventTypes> implements IAnimationEngine {
  /** requestAnimationFrame timerId */
  private _timerId: number;
  private _prev: number;
  private _next: number = 0;
  private _tracks: ITrack[] = [];

  constructor() {
    super(new Events());
  }

  get timelines() { return useVXAnimationStore.getState().timelines; }
  get isPlaying() { return useVXAnimationStore.getState().isPlaying; }
  get isPaused() { return !this.isPlaying; }
  get currentTime() { return useVXAnimationStore.getState().currentTime; }
  get currentTimeline() { return useVXAnimationStore.getState().currentTimeline }
  get playRate() { return useVXAnimationStore.getState().playRate }

  // Setter functions for the states

  setEditorData(newEditorData: IObjectEditorData[]) {
    useTimelineEditorStore.setState({ editorData: newEditorData });
    if (!this.currentTimeline)
      throw new Error("VXAnimationEngine: No timeline is currently loaded.");

    if (this.isPlaying) this.pause();

    console.log("VXAnimationEngine: Setting new EditorData")
    this.currentTimeline.objects.forEach(object => {
      const updatedObject = newEditorData.find(ed => ed.vxkey === object.vxkey);
      if (updatedObject) {
        // Update tracks based on the editor data
        object.tracks = updatedObject.tracks;
      }
    })

    this.reRender(({ force: true }));
  }


  setIsPlaying(value: boolean) {
    useVXAnimationStore.setState({ isPlaying: value })
  }


  setCurrentTimeline(timelineId: string) {
    console.log("VXAnimationEngine: Setting currentTimeline to ", timelineId)
    const selectedTimeline = this.timelines.find(timeline => timeline.id === timelineId);
    if (!selectedTimeline) {
      throw new Error(`VXAnimationEngine: Timeline with id ${timelineId} not found`);
    }

    useVXAnimationStore.setState({ currentTimeline: selectedTimeline })
    this._applyAllKeyframes(this.currentTime);
    this._applyAllStaticProps();
    this.reRender();
    this.setEditorData(selectedTimeline.objects);
  }


  setCurrentTime(time: number, isTick?: boolean): boolean {
    const result = isTick || this.trigger('beforeSetTime', { time, engine: this });
    if (!result) return false;

    useVXAnimationStore.setState({ currentTime: time })

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
    force?: boolean
  } = {}) {
    const { time, force } = params
    if (this.isPlaying && force === false) 
      return;
    console.log("VXAnimationEngine: reRendering with params", params)

    this._applyAllStaticProps();
    if (time !== undefined)
      this._applyAllKeyframes(time);
    else
      this._applyAllKeyframes(this.currentTime)
  }
  

  play(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd. */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
  }): boolean {
    const { toTime, autoEnd } = param;

    const currentTime = this.currentTime;
    if (this.isPlaying || (toTime && toTime <= currentTime)) return false;

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
  initObjectOnMount(object: vxObjectProps){
    const objectInTimeline =  this.currentTimeline.objects.find(obj => obj.vxkey === object.vxkey)
    if(objectInTimeline.tracks){
      objectInTimeline.tracks.forEach(track => {
        const vxkey = object.vxkey;
        const propertyPath = track.propertyPath
        const keyframes = track.keyframes
        
        this._applyKeyframes(vxkey, propertyPath, keyframes, this.currentTime);
      })
    }
    if(objectInTimeline.staticProps){
      objectInTimeline.staticProps.map(staticProp => {
        this._updateObjectProperty(object, staticProp.propertyPath, staticProp.value)
      })
    }
  }


  private _tick(data: { now: number; autoEnd?: boolean; to?: number }) {
    if (this.isPaused) return;
    const { now, autoEnd, to } = data;

    let newCurrentTime = this.currentTime + (Math.min(1000, now - this._prev) / 1000) * this.playRate;
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
    this.currentTimeline.objects.forEach(object => {
      object.tracks.forEach(track => {
        const vxkey = object.vxkey;
        const propertyPath = track.propertyPath
        const keyframes = track.keyframes
        
        this._applyKeyframes(vxkey, propertyPath, keyframes, currentTime);
      })
    })
  }


  private _applyKeyframes(vxkey: string, propertyPath: string, keyframes: IKeyframe[], currentTime: number) {
    const vxobject = useVXObjectStore.getState().objects[vxkey];
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
        useObjectPropertyStore.getState().updateProperty(vxkey, propertyPath, interpolatedValue)
    }
    this._updateObjectProperty(vxobject, propertyPath, interpolatedValue);
  }


  private _interpolateKeyframes(keyframes: IKeyframe[], currentTime: number): number | THREE.Vector3 {
    // Find the two keyframes between which the current time falls
    let startKeyframe: IKeyframe | undefined;
    let endKeyframe: IKeyframe | undefined;

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (currentTime >= keyframes[i].time && currentTime <= keyframes[i + 1].time) {
        startKeyframe = keyframes[i];
        endKeyframe = keyframes[i + 1];
        break;
      }
    }

    // If currentTime < first keyframe or  currentTime > last keyframe
    //  ==> return the closest keyframe value 
    if (!startKeyframe || !endKeyframe) {
      return keyframes.length > 0 ? keyframes[0].value : 0;
    }

    const duration = endKeyframe.time - startKeyframe.time;
    const progress = (currentTime - startKeyframe.time) / duration;

    // Interpolate the value based on the progress
    if (typeof startKeyframe.value === 'number' && typeof endKeyframe.value === 'number') {
      return this._interpolateNumber(startKeyframe.value, endKeyframe.value, progress);
    } else if (startKeyframe.value instanceof THREE.Vector3 && endKeyframe.value instanceof THREE.Vector3) {
      return this._interpolateVector3(startKeyframe.value, endKeyframe.value, progress);
    }

    return startKeyframe.value; // Fallback if types don't match
  }


  private _interpolateNumber(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
  }


  private _interpolateVector3(start: THREE.Vector3, end: THREE.Vector3, progress: number): THREE.Vector3 {
    return new THREE.Vector3(
      start.x + (end.x - start.x) * progress,
      start.y + (end.y - start.y) * progress,
      start.z + (end.z - start.z) * progress
    );
  }


  private _applyAllStaticProps(){
    this,this.currentTimeline.objects.map(obj => {
      const vxkey = obj.vxkey
      const vxobject = useVXObjectStore.getState().objects[vxkey]

      if(!vxobject) return

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
