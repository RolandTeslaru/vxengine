import { Emitter } from "../emitter";
import { EventTypes } from "../events";
import { edObjectProps, IKeyframe, IStaticProps, ITimeline, ITrack } from "./track";

export interface IAnimationEngine extends Emitter<EventTypes> {
    readonly isPlaying: boolean;     
    readonly isPaused: boolean;        
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
    refreshCurrentTimeline(): void
    refreshTrack(
      trackKey: string ,
      action: 'create' | 'remove'
    ): void;
    refreshKeyframe(
      trackKey: string, 
      action:  'create' | 'remove' | 'update',
      keyframeKey: string,
      reRender: boolean
    ): void
    refreshStaticProp: (
      action:  'create' | 'remove' | 'update',
      staticPropKey: string,
      reRender: boolean
    ) =>  void
  }