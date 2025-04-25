import { shallow } from 'zustand/shallow'
import { useTimelineManagerAPI } from '.'

const EMPTY_KEYFRAME_KEYS: readonly string[] = []

export const useTrack = (
    vxkey: string,
    propertyPath: string
  ) => {
    return useTimelineManagerAPI(
        state => {
          const track = state.tracks[`${vxkey}.${propertyPath}`]
          return {
            track,
            orderedKeyframeKeys:
                track?.orderedKeyframeKeys ?? EMPTY_KEYFRAME_KEYS as string[],
            isPropertyTracked: track !== undefined,
          }
        },
        shallow
      )

  }