import { useAnimationEngineAPI } from "./AnimationEngine";
import { AnimationEngine } from "./AnimationEngine/engine";
import { logReportingService } from "./AnimationEngine/services/LogReportingService";
import { useSourceManagerAPI } from "./managers/SourceManager";
import { pushProjectNameUnSyncDialog } from "./managers/SourceManager/ui";
import { pushDialogStatic, useUIManagerAPI } from "./managers/UIManager/store";
import { RawProject } from "./types/data/rawData";

declare global {
  var __animationEngineInstance: AnimationEngine | undefined;
}

let animationEngineInstance: AnimationEngine | undefined;

// Only create the instance if we're in a browser environment.

if (!globalThis.__animationEngineInstance) {
  globalThis.__animationEngineInstance = new AnimationEngine();
}
animationEngineInstance = globalThis.__animationEngineInstance;

export default animationEngineInstance;




export class VXEngine {

  private constructor() {} 

  private static _instance: VXEngine;
  private _IS_PRODUCTION: boolean = false;
  private _IS_DEVELOPMENT: boolean = false;
  private _IS_INTIAILIZED = false

  private _readyToMountObjects: boolean = false;
  public get readyToMountObjects(): boolean {
    return this._readyToMountObjects
  }


  public get isDevelopment(): boolean{
    return this._IS_DEVELOPMENT
  }

  public get isProduction(): boolean {
    return this._IS_PRODUCTION
  }

  public static getInstance(): VXEngine {
    if (!VXEngine._instance){
      VXEngine._instance = new VXEngine();
    }
  
    return VXEngine._instance;
  }

  public initialize(nodeEnv: "production" | "development" ){
    if (nodeEnv === "production")
      this._IS_PRODUCTION = true;
    else if (nodeEnv === "development")
      this._IS_DEVELOPMENT = true;

    this._IS_INTIAILIZED = true;
    animationEngineInstance.initialize(nodeEnv);

    console.log("VXEngine has been initialized")

    return this;
  }


  /**
  * Loads timelines into the animation engine, synchronizes local storage, and initializes the first timeline.
  * @param timelines - A record of timelines to load.
  */
  public loadProject(diskData: RawProject, projectName: string) {

    const LOG_CONTEXT = { module: "AnimationEngine", functionName: "loadProject", additionalData: { IS_PRODUCTION: this._IS_PRODUCTION, IS_DEVELOPMENT: this._IS_DEVELOPMENT } }

    logReportingService.logInfo(
      `Loading Project ${diskData.projectName} in ${(this._IS_PRODUCTION) && "production mode"} ${(this._IS_DEVELOPMENT) && "dev mode"}`, LOG_CONTEXT)

    const timelines = diskData.timelines
    useAnimationEngineAPI.setState({ projectName: diskData.projectName })

    if (this._IS_DEVELOPMENT) {
      const syncResult: any = useSourceManagerAPI.getState().syncLocalStorage(diskData);
      if (syncResult?.status === 'out_of_sync')
        useAnimationEngineAPI.setState({ isPlaying: false })
    }
    else
      useAnimationEngineAPI.setState({ timelines: timelines })

    logReportingService.logInfo(
      `Finished loading project: ${diskData.projectName} with ${Object.entries(diskData.timelines).length} timelines`, LOG_CONTEXT)

    // Initialize the core UI
    useUIManagerAPI.getState().setMountCoreUI(true);


    if(projectName !== diskData.projectName)
      pushProjectNameUnSyncDialog(diskData.projectName, projectName)

    return this;
  }

  public setCurrentTimeline(timelineId: string) {
    animationEngineInstance.setCurrentTimeline(timelineId);
    this._readyToMountObjects = true;
    return this;
  }
}


export const vxengine = VXEngine.getInstance();