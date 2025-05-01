import React, { FC } from 'react'
import { VXElementParams, VXElementProps, VXObjectSettings } from '../types'
import { Mesh, BufferGeometry, MeshBasicMaterial } from 'three'
import { useObjectSetting } from '@vxengine/managers/ObjectManager/stores/settingsStore'
import { withVX } from '../withVX'
import { ThreeElements } from '@react-three/fiber'
import { VXGrid, GridProps } from '../vx/grid'

export type EditableGridProps = VXElementProps<Omit<GridProps, "infiniteGrid" | "followCamera">> & {
    ref?: React.RefObject<Mesh<BufferGeometry, MeshBasicMaterial>>;
}

const defaultSettings: VXObjectSettings = {
    show: { title: "show", storage: "localStorage", value: true },
}

const gridParams: VXElementParams = [
    { type: "number", title: "cross size", propertyPath: "material.uniforms.crossSize.value" },
    { type: "number", title: "cross thickness", propertyPath: "material.uniforms.crossThickness.value" },
    { type: "slider", title: "cross arm length", propertyPath: "material.uniforms.crossArmLength.value", min: 0, max: 0.5, step: 0.01 },
    { type: "color", title: "cross color", propertyPath: "material.uniforms.crossColor.value" },
    { type: "number", title: "section size", propertyPath: "material.uniforms.sectionSize.value" },
    { type: "number", title: "section thickness", propertyPath: "material.uniforms.sectionThickness.value" },
    { type: "color", title: "section color", propertyPath: "material.uniforms.sectionColor.value" },
    { type: "slider", title: "fade distance", propertyPath: "material.uniforms.fadeDistance.value", min: 0, max: 100, step: 1 },
    { type: "slider", title: "fade strength", propertyPath: "material.uniforms.fadeStrength.value", min: 0.01, max: 2, step: 0.01 },
]

const gridConfig = {
    crossSize: 2,
    crossThickness: 0.1,
    crossArmLength: 0.12,
    crossColor: "rgb(64, 64, 64)",
    sectionSize: 12,
    sectionThickness: 1.5,
    sectionColor: 'rgb(78, 78, 78)',
    fadeDistance: 75,
    fadeStrength: 0.95,
    followCamera: false,
    infiniteGrid: true
}


const BaseGrid = (props) => {
    const vxkey = props.vxkey;
    const isShown = useObjectSetting(vxkey, "show");
    
    return <VXGrid {...props} visible={isShown} position={[0, -0.01, 0]} args={[10.5, 10.5]} {...gridConfig} />
}

const EditableGrid = withVX<EditableGridProps>(BaseGrid, {
    type: "entity",
    icon: "Grid",
    params: gridParams,
    settings: defaultSettings,
})

export default EditableGrid;