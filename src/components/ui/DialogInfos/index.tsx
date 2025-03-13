import { DialogContent, DialogDescription, DialogTitle } from '@vxengine/components/shadcn/dialog'
import React from 'react'
import VXEngineLogo from '../VXEngineLogo'
// @ts-ignore
import packageJson from "../../../../package.json"

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

export const INFO_Settings = () => {
    return (
        <div>
          <DialogTitle>
            Settings
          </DialogTitle>
        </div>  
    )
}