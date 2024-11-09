import CollapsiblePanel from '@vxengine/components/ui/CollapsiblePanel'
import { useVXObjectStore } from '@vxengine/managers/ObjectManager'
import React from 'react'
import { useObjectManagerAPI } from '../ObjectManager'
import { vxObjectProps } from '@vxengine/managers/ObjectManager/types/objectStore'

export const EffectsManagerUI = React.memo(() => {
  const vxobjects = useVXObjectStore(state => state.objects)
  const vxEffects = Object.entries(vxobjects).filter(([effectKey, obj]) => obj.type === "effect")

  return (
    <CollapsiblePanel
      title='Effects Manager'
    >
      <div className='flex flex-col'>
        {vxEffects.map(([vxkey, vxEffect]) => {
          return <ListItem key={vxkey} vxEffect={vxEffect} />
        })}
      </div>
    </CollapsiblePanel>
  )
})

const ListItem = React.memo(({ vxEffect }: { vxEffect: vxObjectProps }) => {
  const isSelected = useObjectManagerAPI(state => state.selectedObjectKeys.includes(vxEffect.vxkey))
  const selectObjects = useObjectManagerAPI(state => state.selectObjects)

  const handleOnClick = () => {
    selectObjects([vxEffect.vxkey])
  }

  return (
    <div className={'h-6 px-2 border flex flex-row rounded-xl bg-neutral-800 hover:bg-neutral-900 border-neutral-700 cursor-pointer ' +
      ` ${isSelected && " !bg-blue-600 hover:!bg-blue-700 !border-neutral-300"} `}
      onClick={handleOnClick}
      key={vxEffect.vxkey}
    >
      <p className={'h-auto my-auto text-xs mr-auto text-neutral-200 ' +
        `${isSelected && "!text-neutral-400"}`}
      >
        {vxEffect.vxkey}
      </p>
      <p className={'h-auto my-auto text-sm font-bold text-neutral-200 text-opacity-80'}>
        1
      </p>
    </div>
  )
})