import { Emitter } from "../emitter";
import { EventTypes } from "../events";
import { IStaticProps, ITimeline, ITrack } from "./track";

export interface IAnimationEngine extends Emitter<EventTypes> {
    readonly isPlaying: boolean;     
    readonly isPaused: boolean;        
    readonly currentTime: number;      
    readonly currentTimeline: ITimeline | null; 
    readonly playRate: number;         
    readonly timelines: ITimeline[];  
  
    reRender(param?: {
      time?: number;
      force?: boolean
    }): void;
    play(param: {
      toTime?: number;
      autoEnd?: boolean;
    }): boolean;
    pause(): void;
  
    setIsPlaying(value: boolean): void;  
    setCurrentTimeline(timelineId: string): void;
    loadTimelines(timelines: ITimeline[]): void;
    setCurrentTime(time: number, isTick?: boolean): boolean;
    setEditorData(newEditorData: [ 
      {vxkey: string, tracks: ITrack[], staticProps: IStaticProps[]}]): void;
  }