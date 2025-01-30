import { DiskProjectProps } from "@vxengine/types/engine";
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
  loadProject(diskData: DiskProjectProps): void;
  setCurrentTime(time: number, isTick?: boolean);
  getCurrentTime(): number

  hydrateTrack(
    trackKey: string,
    action: 'create' | 'remove'
  ): void;

  getSplinePointAt: (splineKey: string, progress: number) => any
}

export type HydrateKeyframeAction = 'create' | 'remove' | 'update' | 'updateTime' | 'updateValue' | 'updateHandles';

export type HydrateKeyframeParams<A extends HydrateKeyframeAction> = {
  trackKey: string;
  action: A;
  keyframeKey: string;
  reRender?: boolean;
} & (A extends 'updateTime' | 'updateValue'
  ? { newData: number }
  : A extends 'updateHandles'
  ? { newData: [number, number, number, number] }
  : { newData?: undefined });

export type HydrateStaticPropAction = 'create' | 'remove' | 'update';

export type HydrateStaticPropParams<A extends HydrateKeyframeAction> = {
  action: A;
  staticPropKey: string;
  reRender?: boolean;
} & (A extends 'update' ? { newValue: number } : { newValue?: undefined });
