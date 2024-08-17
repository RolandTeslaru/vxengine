import { prefixNames } from "framework-utils";
import { PREFIX } from "vxengine/AnimationEngine/interface/const";

export function prefix(...classNames: string[]) {
  return prefixNames(`${PREFIX}-`, ...classNames);
}