import React from 'react'
import VXThreeElementWrapper from '../VXThreeElementWrapper'
import { VXElementProps, VXElementPropsWithoutRef, VXPrimitiveProps } from '../types'
import { ThreeElements } from '@react-three/fiber'

export type VXElementPrimitiveProps = VXElementProps<ThreeElements["primitive"]> & {
    ref?: React.RefObject<any>
}

const editablePrimitive: React.FC<VXElementPrimitiveProps> = ({object, ...rest}) => {
  return (
    <VXThreeElementWrapper {...rest}>
        <primitive object={object}/>
    </VXThreeElementWrapper>
  )
}

export default editablePrimitive
