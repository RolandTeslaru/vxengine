import { Emitter } from "../emitter";
import { EventTypes } from "../events";
import { edObjectProps, IKeyframe, IStaticProps, ITimeline, ITrack } from "./track";

export interface IAnimationEngine extends Emitter<EventTypes> {
    readonly isPlaying: boolean;     
    readonly isPaused: boolean;        
    readonly playRate: number;         
    readonly timelines: Record<string, ITimeline>;  
        
    reRender(param?: {
      time?: number;
      force?: boolean
    }): void;
    play(param: {
      toTime?: number;
      autoEnd?: boolean;
    });
    pause(): void;
  
    setIsPlaying(value: boolean): void;  
    setCurrentTimeline(timelineId: string): void;
    loadTimelines(timelines: Record<string, ITimeline>): void;
    setCurrentTime(time: number, isTick?: boolean);
    getCurrentTime(): number

    hydrateTrack(
      trackKey: string ,
      action: 'create' | 'remove'
    ): void;

    hydrateKeyframe(
      trackKey: string, 
      action:  'create' | 'remove' | 'update',
      keyframeKey: string,
      reRender: boolean
    ): void

    hydrateStaticProp: (
      action:  'create' | 'remove' | 'update',
      staticPropKey: string,
      reRender: boolean
    ) =>  void

    getSplinePointAt: (splineKey: string, progress: number) => any
  }