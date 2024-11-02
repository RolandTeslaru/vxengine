// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { AnimationEngine } from "./engine";

export class Events {
  handlers = {};

  constructor(handlers = {}) {
    this.handlers = {
      beforeSetTime: [],
      timeUpdatedByEditor: [],
      timeUpdatedByEngine: [],
      timeUpdated: [],
      beforeSetPlayRate: [],
      afterSetPlayRate: [],
      setActiveActionIds: [],
      play: [],
      paused: [],
      ended: [],
      ...handlers,
    };
  }
}

export interface EventTypes {
  /**
   * Before setting time (manual)
   * @type {{ time: number, engine: AnimationEngine }}
   * @memberofEventTypes
   */
  beforeSetTime: { time: number; engine: AnimationEngine };
  /**
   * After setting time (manual)
   * @type {{ time: number, engine: AnimationEngine }}
   * @memberofEventTypes
   */
  timeUpdatedByEditor: { time: number; engine: AnimationEngine };
  /**
   * After tick setting time
   * @type {{ time: number, engine: AnimationEngine }}
   * @memberofEventTypes
   */
  timeUpdatedByEngine: { time: number; engine: AnimationEngine };
  timeUpdated: { time: number }
  /**
  * Before setting the running rate
  * return false will prevent setting rate
  * @type {{ speed: number, engine: AnimationEngine }}
  * @memberof EventTypes
  */
  beforeSetPlayRate: { rate: number; engine: AnimationEngine };
  /**
   * After setting the running rate
   * @type {{ speed: number, engine: AnimationEngine }}
   * @memberof EventTypes
   */
  afterSetPlayRate: { rate: number; engine: AnimationEngine };
  /**
   * run
   * @type {{engine: AnimationEngine}}
   * @memberof EventTypes
   */
  play: { engine: AnimationEngine };
  /**
   * stopop
   * @type {{ engine: AnimationEngine }}
   * @memberof EventTypes
   */
  paused: { engine: AnimationEngine };
  /**
   * End of operation
   *@type {{ engine: AnimationEngine }}
   *@memberof EventTypes
   */
  ended: { engine: AnimationEngine };

  environmentNeedsUpdate;
}