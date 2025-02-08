
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

export type HydrateSplineActions = "create" | "remove" | "clone" | "updateNode" | "removeNode"

export type HydrateSplineParams<A extends HydrateSplineActions> = {
  action: A,
  splineKey: string,
  reRender?: boolean
} & (
  A extends "updateNode" 
  ? { nodeIndex: number, newData: [number, number, number], initialTension?: undefined }
  : A extends "removeNode" 
  ? { nodeIndex: number, newData?: undefined, initialTension?: undefined }
  : A extends "create"
  ? { initialTension: number, nodeIndex?: undefined, newData?: undefined }
  : { nodeIndex?: undefined, newData?: undefined, initialTension?: undefined}
)