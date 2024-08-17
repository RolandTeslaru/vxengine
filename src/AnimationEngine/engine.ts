import { IAnimationTimeline, TimelineAction, TimelineRow } from './interface/action';
import { TimelineEffect } from './interface/effect';
import { Emitter } from './emitter';
import { Events, EventTypes } from './events';

const PLAYING = 'playing';
const PAUSED = 'paused';
type PlayState = 'playing' | 'paused';

// Actions and Effects:
// 	•	Actions (TimelineAction): These represent individual events or changes that occur at specific times within the timeline (e.g., moving an object, changing a color).
// 	•	Effects (TimelineEffect): These are the actual visual or data changes that occur when actions are triggered. Effects are mapped to actions via an effectId.
// 	3.	Data Structures:

export interface IAnimationEngine extends Emitter<EventTypes> {
  readonly isPlaying: boolean;
  readonly isPaused: boolean;
  effects: Record<string, TimelineEffect>;
  data: TimelineRow[];
  /** Set playback rate */
  setPlayRate(rate: number): boolean;
  /** Get playback rate */
  getPlayRate(): number;
  /** Re-render the current time */
  reRender(): void;
  /** Set playback time */
  setTime(time: number, isTick?: boolean): boolean;
  /** Get play time */
  getTime(): number;
  /** 播放 */
  play(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd. */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
  }): boolean;
  /** pause */
  pause(): void;
}

/**
 * timeline player
 * Can be run independently of the editor
 * @export
 * @class AnimationEngine
 * @extends {Emitter<EventTypes>}
 */
export class AnimationEngine extends Emitter<EventTypes> implements IAnimationEngine {
  constructor() {
    super(new Events());
  }
  private _timelines: IAnimationTimeline[] = [];
  currentTimeline: IAnimationTimeline | null = null;
  /** requestAnimationFrame timerId */
  private _timerId: number;

  /** Play rate */
  private _playRate = 1;
  /** current time */
  private _currentTime: number = 0;
  /** Playing status */
  private _playState: PlayState = 'paused';
  /** Time frame pre data */
  private _prev: number;

  /** Action effect map */
  private _effectMap: Record<string, TimelineEffect> = {};
  /** Action map that needs to be run */
  private _actionMap: Record<string, TimelineAction> = {};
  /** Action ID array sorted in positive order by action start time */
  private _actionSortIds: string[] = [];

  /** The currently traversed action index */
  private _next: number = 0;
  /** The action time range contains a list of action ids at the current time */
  private _activeActionIds: string[] = [];

  /** is playing */
  get isPlaying() {
    return this._playState === 'playing';
  }
  /** Is it paused? */
  get isPaused() {
    return this._playState === 'paused';
  }

  set effects(effects: Record<string, TimelineEffect>) {
    this._effectMap = effects;
  }

  // FIXME: change this stupid naming scheme
  // data represents the current timeline, this having multiple rows
  // This generates the rows in the timleine editor for example
  set data(data: TimelineRow[]) {
    if (!this.currentTimeline) {
      throw new Error("VXAnimationEngine: No timeline is currently loaded.");
    }

    if (this.isPlaying) this.pause();

    // Update the rows of the current timeline
    this.currentTimeline.rows = data;

    this._dealData(this.currentTimeline);
    this._dealClear();
    this._dealEnter(this._currentTime);
  }


  // Set the current timeline by ID
  setCurrentTimeline(timelineId: string) {
    const selectedTimeline = this._timelines.find(timeline => timeline.id === timelineId);

    if (!selectedTimeline) {
      throw new Error(`Timeline with id ${timelineId} not found`);
    }

    this.currentTimeline = selectedTimeline;
    this.data = selectedTimeline.rows; // Initialize with the rows of the selected timeline
  }

  // Load all timelines
  loadTimelines(timelines: IAnimationTimeline[]) {
    this._timelines = timelines;
    console.log("AnimationEngine: Loading timeline ", timelines[0])
    if (timelines.length > 0) {
      this.setCurrentTimeline(timelines[0].id); // Automatically load the first timeline if available
    }
  }


  /**
   * Set playback rate
   * @memberof TimelineEngine
   */
  setPlayRate(rate: number): boolean {
    if (rate <= 0) {
      console.error('Error: rate cannot be less than 0!');
      return;
    }
    const result = this.trigger('beforeSetPlayRate', { rate, engine: this });
    if (!result) return false;
    this._playRate = rate;
    this.trigger('afterSetPlayRate', { rate, engine: this });

    return true;
  }
  /**
   * Get playback rate
   * @memberof TimelineEngine
   */
  getPlayRate() {
    return this._playRate;
  }

  /**
   * Re-render the current time
   * @return {*}
   * @memberof TimelineEngine
   */
  reRender() {
    if (this.isPlaying) return;
    this._tickAction(this._currentTime);
  }

  /**
   * Set playback time
   * @param {number} time
   * @param {boolean} [isTick] Whether it is triggered by a tick
   * @memberof TimelineEngine
   */
  setTime(time: number, isTick?: boolean): boolean {
    const result = isTick || this.trigger('beforeSetTime', { time, engine: this });
    if (!result) return false;

    this._currentTime = time;

    this._next = 0;
    this._dealLeave(time);
    this._dealEnter(time);

    if (isTick) this.trigger('setTimeByTick', { time, engine: this });
    else this.trigger('afterSetTime', { time, engine: this });
    return true;
  }
  /**
   * Get current time
   * @return {*}  {number}
   * @memberof TimelineEngine
   */
  getTime(): number {
    return this._currentTime;
  }

  /**
   * Run: start time is current time
   * @param param
   * @return {boolean} {boolean}
   */
  play(param: {
    /** By default, it runs from beginning to end, with a priority greater than autoEnd. */
    toTime?: number;
    /** Whether to automatically end after playing */
    autoEnd?: boolean;
  }): boolean {
    const { toTime, autoEnd } = param;

    const currentTime = this.getTime();
    /** The current state is being played or the running end time is less than the start time. Return directly*/
    if (this.isPlaying || (toTime && toTime <= currentTime)) return false;

    // Set running status
    this._playState = PLAYING;

    // activeIds run start
    this._startOrStop('start');

    // trigger event
    this.trigger('play', { engine: this });

    this._timerId = requestAnimationFrame((time: number) => {
      this._prev = time;
      this._tick({ now: time, autoEnd, to: toTime });
    });
    return true;
  }

  /**
   * Pause playback
   * @memberof TimelineEngine
   */
  pause() {
    if (this.isPlaying) {
      this._playState = PAUSED;
      // activeIds run stop
      this._startOrStop('stop');

      this.trigger('paused', { engine: this });
    }
    cancelAnimationFrame(this._timerId);
  }

  /** Playback completed */
  private _end() {
    this.pause();
    this.trigger('ended', { engine: this });
  }

  private _startOrStop(type?: 'start' | 'stop') {
    for (let i = 0; i < this._activeActionIds.length; i++) {
      const actionId = this._activeActionIds[i];
      const action = this._actionMap[actionId];
      const effect = this._effectMap[action?.effectId];

      if (type === 'start') {
        effect?.source?.start && effect.source.start({ action, effect, engine: this, isPlaying: this.isPlaying, time: this.getTime() });
      } else if (type === 'stop') {
        effect?.source?.stop && effect.source.stop({ action, effect, engine: this, isPlaying: this.isPlaying, time: this.getTime() });
      }
    }
  }

  /** Execute every frame */
  private _tick(data: { now: number; autoEnd?: boolean; to?: number }) {
    if (this.isPaused) return;
    const { now, autoEnd, to } = data;

    // Calculate current time
    let currentTime = this.getTime() + (Math.min(1000, now - this._prev) / 1000) * this._playRate;
    this._prev = now;

    // Set current time
    if (to && to <= currentTime) currentTime = to;
    this.setTime(currentTime, true);

    // perform action
    this._tickAction(currentTime);
    // In the case of automatic stop, determine whether all actions have been completed
    if (!to && autoEnd && this._next >= this._actionSortIds.length && this._activeActionIds.length === 0) {
      this._end();
      return;
    }

    // Determine whether to terminate
    if (to && to <= currentTime) {
      this._end();
    }

    if (this.isPaused) return;
    this._timerId = requestAnimationFrame((time) => {
      this._tick({ now: time, autoEnd, to });
    });
  }

  /** Tick ​​to run actions */
  private _tickAction(time: number) {
    this._dealEnter(time);
    this._dealLeave(time);

    // render
    const length = this._activeActionIds.length;
    for (let i = 0; i < length; i++) {
      const actionId = this._activeActionIds[i];
      const action = this._actionMap[actionId];
      const effect = this._effectMap[action.effectId];
      if (effect && effect.source?.update) {
        effect.source.update({ time, action, isPlaying: this.isPlaying, effect, engine: this });
      }
    }
  }

  /** Reset active data */
  private _dealClear() {
    while (this._activeActionIds.length) {
      const actionId = this._activeActionIds.shift();
      const action = this._actionMap[actionId];

      const effect = this._effectMap[action?.effectId];
      if (effect?.source?.leave) {
        effect.source.leave({ action, effect, engine: this, isPlaying: this.isPlaying, time: this.getTime() });
      }
    }
    this._next = 0;
  }

  /** Process action time enter*/
  private _dealEnter(time: number) {
    // add to active
    while (this._actionSortIds[this._next]) {
      const actionId = this._actionSortIds[this._next];
      const action = this._actionMap[actionId];

      if (!action.disable) {
        // Determine whether the action start time has arrived

        if (action.start > time) break;
        // The action can be executed starting
        if (action.end > time && !this._activeActionIds.includes(actionId)) {
          const effect = this._effectMap[action.effectId];
          if (effect && effect.source?.enter) {
            effect.source.enter({ action, effect, isPlaying: this.isPlaying, time, engine: this });
          }

          this._activeActionIds.push(actionId);
        }
      }
      this._next++;
    }
  }

  /** Handle action time leave */
  private _dealLeave(time: number) {
    let i = 0;
    while (this._activeActionIds[i]) {
      const actionId = this._activeActionIds[i];
      const action = this._actionMap[actionId];

      // Not within the playback area
      if (action.start > time || action.end < time) {
        const effect = this._effectMap[action.effectId];

        if (effect && effect.source?.leave) {
          effect.source.leave({ action, effect, isPlaying: this.isPlaying, time, engine: this });
        }

        this._activeActionIds.splice(i, 1);
        continue;
      }
      i++;
    }
  }

  /** Process data */
  private _dealData(timeline: IAnimationTimeline) {
    const actions: TimelineAction[] = [];

    // Iterate over each row in the timeline
    timeline.rows.forEach((row) => {
      // Add all actions from this row to the actions array
      actions.push(...row.actions);
    });

    // Sort actions by their start time
    const sortActions = actions.sort((a, b) => a.start - b.start);

    const actionMap: Record<string, TimelineAction> = {};
    const actionSortIds: string[] = [];

    // Map actions by their IDs and collect their sorted IDs
    sortActions.forEach((action) => {
      actionSortIds.push(action.id);
      actionMap[action.id] = { ...action };
    });

    this._actionMap = actionMap;
    this._actionSortIds = actionSortIds;
  }
}
