import React from 'react'
import { VXElementProps } from '../types'
import { ThreeElements } from '@react-three/fiber'
import { withVX } from '../withVX'

export type VXElementPrimitiveProps = VXElementProps<ThreeElements["primitive"]> & {
    ref?: React.RefObject<any>
}

const BasePrimitive = ({object, ...rest}) => <primitive object={object} {...rest} />

export const EditablePrimitive = withVX<ThreeElements["primitive"]>(BasePrimitive, {
    type: "entity",
})

export default EditablePrimitive
