import { TimelineAction, TimelineRow } from './interface/action';
import { TimelineEffect } from './interface/effect';
import { Emitter } from './emitter';
import { Events, EventTypes } from './events';
import { StoredObjectProps } from 'vxengine/types/objectStore';

import * as THREE from "three"
import { IKeyframe, ITimeline, ITrack } from './types/track';
import { useVXTimelineStore } from 'vxengine/store/TimelineStore';
import { useVXObjectStore } from 'vxengine/store/ObjectStore';
import { IAnimationEngine } from './types/engine';
import { useTimelineEditorStore } from 'vxengine/managers/TimelineManager/store';

// Propery of VEXR Labs
// Under VXEngine

// Actions and Effects:
// 	•	Actions (TimelineAction): These represent individual events or changes that occur at specific times within the timeline (e.g., moving an object, changing a color).
// 	•	Effects (TimelineEffect): These are the actual visual or data changes that occur when actions are triggered. Effects are mapped to actions via an effectId.

export class AnimationEngine extends Emitter<EventTypes> implements IAnimationEngine {
  /** requestAnimationFrame timerId */
  private _timerId: number;
  private _prev: number;
  private _next: number = 0;
  private _tracks: ITrack[] = [];

  constructor() {
    super(new Events());
  }

  get timelines() { return useVXTimelineStore.getState().timelines; }
  get isPlaying() { return useVXTimelineStore.getState().isPlaying; }
  get isPaused() { return !this.isPlaying; }
  get currentTime() { return useVXTimelineStore.getState().currentTime; }
  get currentTimeline() { return useVXTimelineStore.getState().currentTimeline }
  get playRate() { return useVXTimelineStore.getState().playRate }

  // Setter functions for the states

  setEditorData(newEditorData: ITrack[]) {
    useTimelineEditorStore.setState({ editorData: newEditorData });
    if (!this.currentTimeline)
      throw new Error("VXAnimationEngine: No timeline is currently loaded.");

    if (this.isPlaying) this.pause();

    this.currentTimeline.tracks = newEditorData;

    this._dealData(this.currentTimeline);
    this.reRender();
  }

  setIsPlaying(value: boolean) {
    useVXTimelineStore.setState({ isPlaying: value })
  }

  setCurrentTimeline(timelineId: string) {
    const selectedTimeline = this.timelines.find(timeline => timeline.id === timelineId);
    if (!selectedTimeline) {
      throw new Error(`Timeline with id ${timelineId} not found`);
    }

    useVXTimelineStore.setState({ currentTimeline: selectedTimeline }) // update Zustand state
    this.setEditorData(selectedTimeline.tracks);
  }

  setCurrentTime(time: number, isTick?: boolean): boolean {
    const result = isTick || this.trigger('beforeSetTime', { time, engine: this });
    if (!result) return false;

    useVXTimelineStore.setState({ currentTime: time })

    this._applyAllKeyframes(time);

    if (isTick) this.trigger('timeUpdatedAutomatically', { time, engine: this });
    else this.trigger('timeSetManually', { time, engine: this });
    return true;
  }

  loadTimelines(timelines: ITimeline[]) {
    useVXTimelineStore.setState({ timelines: timelines }) // update Zustand state

    console.log("AnimationEngine: Loading timeline ", timelines[0])
    if (timelines.length > 0) {
      this.setCurrentTimeline(timelines[0].id); // Automatically load the first timeline if available
    }
  }

  reRender() {
    if (this.isPlaying) return;
    this._applyAllKeyframes(this.currentTime);
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

    this.trigger('play', { engine: this });

    this._timerId = requestAnimationFrame((time: number) => {
      this._prev = time;
      this._tick({ now: time, autoEnd, to: toTime });
    });
    return true;
  }

  pause() {
    if (this.isPlaying) {
      this.setIsPlaying(false)
      this.trigger('paused', { engine: this });
    }
    cancelAnimationFrame(this._timerId);
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
    this.currentTimeline.tracks.forEach(track => {
      this._applyKeyframes(track.vxkey, track.propertyPath, track.keyframes, currentTime);
    });
  }

  private _applyKeyframes(vxkey: string, propertyPath: string, keyframes: IKeyframe[], currentTime: number) {
    const object = useVXObjectStore.getState().objects[vxkey]
    if (!object) return;

    const interpolatedValue = this._interpolateKeyframes(keyframes, currentTime);
    this._updateObjectProperty(object, propertyPath, interpolatedValue);
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

  private _updateObjectProperty(object: StoredObjectProps, propertyPath: string, newValue: number | THREE.Vector3) {
    const propertyKeys = propertyPath.split('.');
    let target = object.ref.current;

    // Navigate through the property path
    for (let i = 0; i < propertyKeys.length - 1; i++) {
      target = target[propertyKeys[i]];
    }

    // Update the final property
    const finalPropertyKey = propertyKeys[propertyKeys.length - 1];
    target[finalPropertyKey] = newValue;
  }

  /** Playback completed */
  private _end() {
    this.pause();
    this.trigger('ended', { engine: this });
  }


  /** Process data */
  private _dealData(timeline: ITimeline) {
    this._tracks = [];

    timeline.tracks.forEach(track => {
      track.keyframes.sort((a, b) => a.time - b.time);
      this._tracks.push(track);
    });
  }
}
