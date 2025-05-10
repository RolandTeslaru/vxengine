import React from 'react'
import { RoundedBox, RoundedBoxProps } from "@react-three/drei"
import { withVX } from '@vxengine/index'
import { MeshBasicMaterial } from 'three';
import { BufferGeometry } from 'three';
import { Mesh } from 'three';
import { VXElementParams, VXElementProps, VXObjectSettings } from '../types';

export type EditableRoundedBoxProps = VXElementProps<RoundedBoxProps> & {
    ref?: React.RefObject<Mesh<BufferGeometry, MeshBasicMaterial>>;
}

const BaseRoundedBox = (props) => <RoundedBox {...props} />

const params: VXElementParams = [
    { type: "number", title: "radius", propertyPath: "geometry.parameters.options.bevelThickness"},
    { type: "number", title: "smoothness", propertyPath: "geometry.parameters.options.curveSegments"},
    { type: "number", title: "bevelSegments", propertyPath: "geometry.parameters.options.bevelSegments"},
] 

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title:"show position path", storage: "localStorage", value: false},
    useSplinePath: { title:"use spline path", storage: "disk", value: false },
    useRotationDegrees: { title:"use rotation degrees", storage: "disk", value: false },
}



const EditableRoundedBox = withVX<EditableRoundedBoxProps>(BaseRoundedBox, {
    type: "entity",
    params,
    settings: defaultSettings,
})



export default EditableRoundedBox