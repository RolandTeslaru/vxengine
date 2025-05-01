import { Emitter } from "../emitter";
import { EventTypes } from "../events";
import { RawProject, RawTimeline, RawObject } from "../../types/data/rawData";
import { AnimationEngine } from "../engine";

export interface IAnimationEngine extends Emitter<EventTypes> {

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

export type OnBeforeToggleType = (vxkey: string, settingKey: string, setting: ISetting) => Promise<boolean>;

export interface ISetting{
  value: boolean
  storage: "disk" | "localStorage"
  title: string
  onBeforeToggle?: OnBeforeToggleType
}