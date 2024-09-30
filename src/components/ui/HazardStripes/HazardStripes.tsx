import React from 'react'

const HazardStripes = ({className, opacity = 1}: { className?: string, opacity?: number}) => {
  return (
    <div className={` w-full h-4 content-[" "]  animate-moveBackground ${className}`}
    style={{
      background: `repeating-linear-gradient(
        45deg,                  
        rgba(250, 204, 21, ${opacity}), /* Yellow with opacity */
        rgba(250, 204, 21, ${opacity}) 10px,  /* Yellow stripe */
        rgba(0, 0, 0, ${opacity}) 10px,      /* Black with opacity */
        rgba(0, 0, 0, ${opacity}) 20px       /* Black stripe */
      )`,
    }}
    >
      
    </div>
  )
}

export default HazardStripes
