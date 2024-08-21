import { Emitter } from "../emitter";
import { EventTypes } from "../events";
import { ITimeline, ITrack } from "./track";

export interface IAnimationEngine extends Emitter<EventTypes> {
    readonly isPlaying: boolean;     
    readonly isPaused: boolean;        
    readonly currentTime: number;      
    readonly currentTimeline: ITimeline | null; 
    readonly playRate: number;         
    readonly timelines: ITimeline[];  
  
    reRender(): void;
    play(param: {
      toTime?: number;
      autoEnd?: boolean;
    }): boolean;
    pause(): void;
  
    setIsPlaying(value: boolean): void;  
    setCurrentTimeline(timelineId: string): void;
    loadTimelines(timelines: ITimeline[]): void;
    setCurrentTime(time: number, isTick?: boolean): boolean;
    setEditorData(newEditorData: ITrack[]): void;
  }