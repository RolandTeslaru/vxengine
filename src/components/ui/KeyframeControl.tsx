import React from 'react'
import { Square, ChevronLeft, ChevronRight } from '@geist-ui/icons'

interface KeyframeControlProps {
  propertyPath: string
}

const KeyframeControl:React.FC<KeyframeControlProps> = ({propertyPath}) => {
  return (
    <div className='flex flex-row'>
      <button className='hover:*:stroke-[5] hover:*:stroke-white' >
        <ChevronLeft className=' w-3 h-3'/>
      </button>
      <button className='hover:*:stroke-[5] hover:*:stroke-white'  >
        <Square className='rotate-45 w-2 h-2' />
      </button>
      <button className='hover:*:stroke-[5] hover:*:stroke-white' >
        <ChevronRight className='w-3 h-3 ' />
      </button>
    </div>
  )
}

export default KeyframeControl
