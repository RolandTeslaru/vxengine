import { Emitter } from "../emitter";
import { EventTypes } from "../events";
import { RawProject, RawTimeline } from "../../types/data/rawData";
import { AnimationEngine } from "../engine";

export interface IAnimationEngine extends Emitter<EventTypes> {
  readonly isPlaying: boolean;
  readonly isPaused: boolean;
  readonly playRate: number;
  readonly timelines: Record<string, RawTimeline>;

  reRender(param?: {
    time?: number;
    force?: boolean
  }): void;
  play(param: {
    toTime?: number;
    autoEnd?: boolean;
  });
  pause(): void;

  setCurrentTimeline(timelineId: string): void;
  loadProject(diskData: RawProject, nodeEnv: "production" | "development"
  ): void;
  setCurrentTime(time: number, isTick?: boolean);
}


export type TrackSideEffectCallback = (
  animationEngine: AnimationEngine, 
  vxkey: string,
  propertyPath: string,
  object3DRef: any, 
  interpolatedValue: number
) => void

export interface ISettings{
  useSplinePath?: boolean;
  positionSplineKey?: string
}

export interface IAdditionalSettingsProps{
  showPositionPath?: boolean
  showHelper?: boolean
}