import React, { useCallback, useEffect } from 'react'
import { useTimelineManagerAPI } from '../..'
import { useTimelineEditorAPI } from '../store'
import { useUIManagerAPI } from '@vxengine/managers/UIManager/store'
import { Slider } from '@vxengine/components/shadcn/slider'
import { Input } from '@vxengine/components/shadcn/input'
import { Switch } from '@vxengine/components/shadcn/switch'


const TimelineEditorFooter = () => {
  const setCurrentTimelineLength = useTimelineManagerAPI(state => state.setCurrentTimelineLength)
  const currentTimelineLength = useTimelineManagerAPI(state => state.currentTimelineLength)
  const setSnap = useTimelineEditorAPI(state => state.setSnap)
  const snap = useTimelineEditorAPI(state => state.snap);

  const handleTimelineLengthChange = (e: any) => {
      const value = e.target.value;
      setCurrentTimelineLength(value);
  }

  useEffect(() => {
      const handleCopy = (event: KeyboardEvent) => {
          if (shouldIgnoreKeyEvent(event))
              return

          const timelineEditorAPI = useTimelineEditorAPI.getState()

          if ((event.ctrlKey || event.metaKey) && event.key === "c") {
              const selectedKeyframeKeys = timelineEditorAPI.selectedKeyframeKeys
              const setClipboard = timelineEditorAPI.setClipboard;
              setClipboard(selectedKeyframeKeys);
          }
      }

      window.addEventListener('keydown', handleCopy);
      return () => window.removeEventListener("keydown", handleCopy);
  }, [])

  useEffect(() => {
      const handlePaste = (event: KeyboardEvent) => {
          if (shouldIgnoreKeyEvent(event))
              return

          const timelineManagerAPI = useTimelineManagerAPI.getState();

          if ((event.ctrlKey || event.metaKey) && event.key === "v") {
              const clipboard = useTimelineEditorAPI.getState().clipboard;
              Object.entries(clipboard).forEach(([trackKey, keyframesObj]) => {
                  const keyframeKeys = Object.keys(keyframesObj);
                  keyframeKeys.forEach((keyframeKey) => {
                      const selectedKeyframe = timelineManagerAPI.tracks[trackKey]?.keyframes[keyframeKey]

                      timelineManagerAPI.createKeyframe({
                          trackKey,
                          value: selectedKeyframe.value
                      })
                  })
              })
          }
      }

      window.addEventListener("keydown", handlePaste);
      return () => window.removeEventListener("keydown", handlePaste);
  }, [])

  return (
      <div className='mt-auto relative pl-2 flex flex-row gap-4 font-roboto-mono'>
          <ScaleSlider />
          <div className='flex flex-row gap-2'>
              <p className='font-light h-auto my-auto' style={{ fontSize: "10px" }}>Snap</p>
              <Switch
                  className='my-auto '
                  onClick={() => setSnap(!snap)}
                  checked={snap}
              />
          </div>
          <div className='flex flex-row h-fit text-xs gap-2'>
              <p className='h-auto my-auto font-light' style={{ fontSize: "10px" }}>length</p>
              <Input className='px-1 py-0 font-light my-auto h-fit w-10' style={{ fontSize: "10px" }}
                  value={currentTimelineLength}
                  onChange={handleTimelineLengthChange}
                  type='number'
              ></Input>
          </div>
      </div>
  )
}

export default TimelineEditorFooter


const shouldIgnoreKeyEvent = (event: KeyboardEvent): boolean => {
  const selectedWindow = useUIManagerAPI.getState().selectedWindow;

  if (selectedWindow !== "VXEngineTimelinePanel") {
      return true;
  }

  const target = event.target as HTMLElement;
  if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
      return true;
  }

  return false;
}



const ScaleSlider = () => {
  const scale = useTimelineEditorAPI(state => state.scale);
  const setScale = useTimelineEditorAPI(state => state.setScale);
  // const timelineAreaRef = useRefStore(state => state.timelineAreaRef);
  // const scrollLeftRef = useRefStore(state => state.scrollLeftRef)

  // const animationEngine = useVXEngine(state => state.animationEngine)

  const handleScaleChange = useCallback((value: number[]) => {
      setScale(value[0])
      // const clientWidth = timelineAreaRef.current.offsetWidth
      // const autoScrollFrom = clientWidth * 70 / 100;
      // const time = animationEngine.getCurrentTime()
      // const left = time * (ONE_SECOND_UNIT_WIDTH / scale) + 0 - autoScrollFrom;
      // timelineAreaRef.current.scrollLeft = left;
      // scrollLeftRef.current = left
  }, [])

  return (
      <div className='flex flex-row gap-2'>
          <p className='font-light h-auto my-auto whitespace-nowrap' style={{ fontSize: "10px" }}>Scale {scale}</p>
          <Slider
              defaultValue={[scale]}
              max={20}
              step={0.1}
              min={0.1}
              className='w-24 my-auto'
              onValueChange={handleScaleChange}
          />
      </div>
  )
}