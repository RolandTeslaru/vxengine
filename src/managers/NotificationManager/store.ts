import { useAnimationEngineAPI } from '@vxengine/AnimationEngine'
import { create } from 'zustand'
import { ITimeline } from '@vxengine/AnimationEngine/types/track'

import debounce from "lodash/debounce"
import { useTimelineEditorAPI } from '../TimelineManager'
import { AnimationEngine } from '@vxengine/AnimationEngine/engine'
import { cloneDeep } from 'lodash'

interface NofiticationManagerProps {

}

export const useNotificationManager = create<NofiticationManagerProps>((set, get) => ({
    
}))