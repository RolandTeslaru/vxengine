

//  T R A C K
//////////////////////////

export type HydrateTrackAction = 'create' | 'remove'

type CreateTrack = {
  action: "create",
  vxkey: string,
  propertyPath: string
}

type RemoveTrack = {
  action: "remove",
  vxkey: string,
  propertyPath: string
}

export type HydrateTrackParams = 
| CreateTrack
| RemoveTrack


//  K E Y F R A M E
//////////////////////////

export type HydrateKeyframeAction = 'create' | 'remove' | 'update' | 'updateTime' | 'updateValue' | 'updateHandles';

type BaseKeyframeAction = {
  vxkey: string;
  propertyPath: string;
  keyframeKey: string;
};

type KeyframeCreate = BaseKeyframeAction & {
  action: "create"
  value: number,
  time: number,
  handles: [number, number, number, number]
}
type KeyframeRemove = BaseKeyframeAction & {
  action: "remove"
}
type KeyframeUpdateTime = BaseKeyframeAction & {
  action: "updateTime"
  newTime: number
}
type KeyframeUpdateValue = BaseKeyframeAction & {
  action: "updateValue"
  newValue: number
}
type KeyframeUpdateHandles = BaseKeyframeAction & {
  action: "updateHandles"
  newHandles: [number, number, number, number]
}

export type HydrateKeyframeParams = 
| KeyframeCreate
| KeyframeRemove
| KeyframeUpdateTime
| KeyframeUpdateValue
| KeyframeUpdateHandles

  
//  S T A T I C   P R O P 
//////////////////////////


export type HydrateStaticPropAction = 'create' | 'remove' | 'update';

type BaseStaticPropAction = {
  vxkey: string
  propertyPath: string,
}

type StaticPropCreate = BaseStaticPropAction & {
  action: "create",
  value: number
}

type StaticPropRemove = BaseStaticPropAction & {
  action: "remove",
}

type StaticPropUpdate = BaseStaticPropAction & {
  action: "update",
  newValue: number
}

export type HydrateStaticPropParams = 
| StaticPropCreate
| StaticPropRemove
| StaticPropUpdate



//  S P L I N E
//////////////////////////


export type HydrateSplineActions = "create" | "remove" | "clone" | "updateNode" | "removeNode"

type BaseSplineAction = {
  splineKey: string
}

type SplineCloneParams = BaseSplineAction & {
  action: "clone"
}

type SplineRemoveParams = BaseSplineAction & {
  action: "remove"
}

type SplineUpdateNodeParams = BaseSplineAction & {
  action: "updateNode";
  nodeIndex: number;
  newData: [number, number, number];
};

type SplineRemoveNodeParams = BaseSplineAction & {
  action: "removeNode";
  nodeIndex: number;
};

type SplineCreateParams = BaseSplineAction & {
  action: "create";
  nodes: [number, number, number][];
  objVxKey: string;
  initialTension: number;
};

export type HydrateSplineParams = 
| SplineCloneParams
| SplineRemoveParams
| SplineUpdateNodeParams
| SplineRemoveNodeParams
| SplineCreateParams;




// S E T T I N G S
//////////////////////////

export type HydrateSettingAction = "set" | "remove";

type BaseSettingAction = { vxkey: string, settingKey: string }

type SettingSetParams = BaseSettingAction & {
  action: "set",
  value: boolean
}

type SettingRemoveParams = BaseSettingAction & {
  action: "remove",
}

export type HydrateSettingParams = 
| SettingSetParams 
| SettingRemoveParams