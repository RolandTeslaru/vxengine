import { useAnimationEngineAPI } from '@vxengine/AnimationEngine'
import { create } from 'zustand'

import debounce from "lodash/debounce"
import { useTimelineManagerAPI } from '../TimelineManager'
import { AnimationEngine } from '@vxengine/AnimationEngine/engine'
import { cloneDeep } from 'lodash'

interface NofiticationManagerProps {

}

export const useNotificationManagerAPI = create<NofiticationManagerProps>((set, get) => ({
    
}))