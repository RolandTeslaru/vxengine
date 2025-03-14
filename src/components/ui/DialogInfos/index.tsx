import { DialogContent, DialogDescription, DialogTitle } from '@vxengine/components/shadcn/dialog'
import React, { useMemo, useState } from 'react'
import VXEngineLogo from '../VXEngineLogo'
// @ts-ignore
import packageJson from "../../../../package.json"
import classNames from 'classnames'
import { Brush, Display, Engine, Box, Video } from '../icons'
import { useUIManagerAPI } from '@vxengine/managers/UIManager/store'
import { Tabs, TabsList, TabsTrigger } from '@vxengine/components/shadcn/tabs'
import { AnimationEngine } from '@vxengine/AnimationEngine/engine'
import animationEngineInstance from '@vxengine/singleton'
import Search from '../Search'
import VexrLogo from '../VexrLogo'

export const INFO_About = () => {
  return (
    <div className='w-[500px] my-2 flex flex-col gap-4'>
      <div>
        <DialogTitle className='w-full flex'>
          <VXEngineLogo className='h-16 w-auto mx-auto' />
        </DialogTitle>
        <DialogDescription className='text-center'>
          VXEngine Version {packageJson.version}
        </DialogDescription>
        <DialogDescription className='text-center'>
          © 2025 VEXR Labs
        </DialogDescription>
      </div>
      <DialogDescription className='text-center'>
        VEXR Labs proprietary anmimation toolset for react-three-fiber.
      </DialogDescription>
    </div>
  )
}


const LISetting = ({ children }: { children: any }) => {
  return (
    <li className=' p-2 flex flex-row justify-between even:bg-secondary-thin'>{children}</li>
  )
}

const PSetting = ({ children }: { children: any }) => {
  return (
    <p className="font-roboto-mono font-medium text-label-primary text-xs h-auto my-auto">{children}</p>
  )
}

const BooleanSetting = ({ value }: { value: boolean }) => {
  return (
    <p className={`${value ? "text-green-400" : "text-red-500"} font-roboto-mono text-xs font-bold`}>{value ? "true" : "false"}</p>
  )
}

const SettingsTheme = () => {
  const theme = useUIManagerAPI(state => state.theme);
  const setTheme = useUIManagerAPI(state => state.setTheme)
  return (
    <>
      <div className='flex flex-row justify-between'>
        <PSetting>theme</PSetting>
        <Tabs defaultValue={theme}>
          <TabsList>
            <TabsTrigger value="light" onClick={() => setTheme("light")} className="text-white text-xs font-roboto-mono">
              Light
            </TabsTrigger>
            <TabsTrigger value="dark" onClick={() => setTheme("dark")} className="text-white text-xs font-roboto-mono">
              dark
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </>
  )
}

const SettingsRenderer = () => {
  return (
    <>

    </>
  )
}

const SettingsAnimationEngine = () => {
  return (
    <>
      <ul className='bg-tertiary-opaque border border-border-background rounded-xl overflow-hidden shadow-md shadow-black/20'>
        <LISetting>
          <PSetting>{`(static) ENGINE_PRECISION`}</PSetting>
          <PSetting>{AnimationEngine.ENGINE_PRECISION}</PSetting>
        </LISetting>
        <LISetting>
          <PSetting>{`(static) VALUE_CHANGE_THRESHOLD`}</PSetting>
          <PSetting>{AnimationEngine.VALUE_CHANGE_THRESHOLD}</PSetting>
        </LISetting>
        <LISetting>
          <PSetting>{`(instance) cameraRequiresProjectionMatrixRecalculation`}</PSetting>
          <BooleanSetting value={animationEngineInstance.cameraRequiresProjectionMatrixRecalculation} />
        </LISetting>
        <LISetting>
          <PSetting>{`(instance) environmentRequiresUpdate`}</PSetting>
          <BooleanSetting value={animationEngineInstance.environmentRequiresUpdate} />
        </LISetting>
      </ul>
    </>
  )
}

const SettingsObjectManager = () => {
  return (
    <div>

    </div>
  )
}

const SettingsTimelineManager = () => {
  return (
    <div>

    </div>
  )
}

const SETTINGS_CONTENT_MAP = {
  "theme": SettingsTheme,
  "renderer": SettingsRenderer,
  "animationEngine": SettingsAnimationEngine,
  "objectManager": SettingsObjectManager,
  "timelineManager": SettingsTimelineManager
}



const SIDEBAR_ELEMENT_MAP = {
  "theme": { title: "Theme", icon: <Brush className='w-4 !text-white fill-white !stroke-white' /> },
  "renderer": { title: "Renderer", icon: <Display className='w-4 !text-white fill-white !stroke-white' /> },
  "animationEngine": { title: "Animation Engine", icon: <Engine className='w-4 !text-white fill-white !stroke-white' /> },
  "objectManager": { title: "Object Manager", icon: <Box size={18} className=' !text-white  !stroke-white' /> },
  "timelineManager": { title: "Timeline Manager", icon: <Video size={18} className=' !text-white  !stroke-white' /> },
}

const SideberElement = ({ title, isSelected, icon }: { title: string, isSelected: boolean, icon?: React.ReactNode }) => {
  return (
    <div className={classNames(
      ' hover:bg-primary-thin flex h-8 rounded-md py-1 pl-3 pr-4 relative',
      { "bg-blue-600 shadow-md shadow-black/20 !hover:bg-blue-700": isSelected }
    )}>
      {icon && <div className='absolute top-1/2 -translate-y-1/2'>{icon}</div>}
      <p className={classNames({ "ml-8": icon }, 'antialiased text-xs font-sans text-label-primary h-auto my-auto font-semibold')}>{title}</p>
    </div>
  )
}


const SettingsSidebar = (
  { selectedElementKey, setSelectedElementKey }: { selectedElementKey: string, setSelectedElementKey: (key: string) => void }
) => {

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className='w-[220px] flex flex-col p-2 pb-0 gap-2 bg-tertiary-thin border-r border-neutral-950'>
      <div className='flex flex-col gap-1'>
        <VXEngineLogo className='h-16' />
        <DialogTitle className='text-center'>Settings</DialogTitle>
      </div>
      <div
        className={'flex flex-row gap-1 px-1 py-1 bg-secondary-opaque w-full border dark:border-neutral-700/40 border-neutral-400/40 rounded-lg' + " " }
      >
        <input
          className={`h-full py-[1px] w-full text-neutral-400 bg-transparent text-xs
                            placeholder-neutral-400 font-medium focus:outline-hidden`}
          type="text"
          placeholder='search'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
      </div>
      <div className='flex flex-col'>
        {Object.entries(SIDEBAR_ELEMENT_MAP).map(([key, element]) => {
          return (
            <span onClick={() => setSelectedElementKey(key)} key={key}>
              <SideberElement title={element.title} icon={element.icon} isSelected={key === selectedElementKey} />
            </span>
          )
        })}
      </div>
      <DialogDescription className='text-center mt-auto text-label-quaternary'>
        VXEngine version {packageJson.version}
      </DialogDescription>
    </div>
  )
}



const SettingsContent = ({ selectedElementKey }: { selectedElementKey: string }) => {
  const Component = SETTINGS_CONTENT_MAP[selectedElementKey]
  return (
    <div className=' w-[500px] bg-secondary-thick relative'>
      <div className='h-[50px] px-8  flex border-b border-black bg-primary-thin'>
        <h1 className='text-base h-auto my-auto antialiased font-bold font-roboto-mono text-label-primary'>{SIDEBAR_ELEMENT_MAP[selectedElementKey].title}</h1>
      </div>
      <div className='p-2 px-4 z-10 flex flex-col'>
        <Component />
      </div>
      <VexrLogo className='h-20 dark:text-black/10 text-white/20 absolute z-0 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2'/>
    </div>
  )
}

export const INFO_Settings = () => {
  const [selectedElementKey, setSelectedElementKey] = useState(Object.keys(SIDEBAR_ELEMENT_MAP)[0])

  return (
    <div className='flex flex-row h-[600px]'>
      <SettingsSidebar selectedElementKey={selectedElementKey} setSelectedElementKey={setSelectedElementKey} />
      <SettingsContent selectedElementKey={selectedElementKey} />
    </div>
  )
}

