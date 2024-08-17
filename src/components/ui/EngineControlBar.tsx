import React from 'react'

const EngineControlBar = () => {
    return (
        <div className='absolute top-6 left-6 h-10 w-fit border-neutral-800 border-[1px] text-white backdrop-blur-sm bg-neutral-900 bg-opacity-85 rounded-3xl flex flex-row px-6'>
            <button>
                Play
            </button>
        </div>
    )
}

export default EngineControlBar
