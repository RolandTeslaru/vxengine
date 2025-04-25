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
    { type: "number", title: "cell size", propertyPath: "material.uniforms.cellSize.value" },
    { type: "number", title: "cell thickness", propertyPath: "material.uniforms.cellThickness.value" },
    { type: "color", title: "cell color", propertyPath: "material.uniforms.cellColor.value" },
    { type: "number", title: "section size", propertyPath: "material.uniforms.sectionSize.value" },
    { type: "color", title: "section color", propertyPath: "material.uniforms.sectionColor.value" },
    { type: "number", title: "fade distance", propertyPath: "material.uniforms.fadeDistance.value" },
    { type: "number", title: "fade strength", propertyPath: "material.uniforms.fadeStrength.value" },
]

const gridConfig = {
    cellSize: 0.6,
    cellThickness: 1.0,
    cellColor: '#525252',
    sectionSize: 3.3,
    sectionThickness: 1.5,
    sectionColor: '#d6d6d6',
    fadeDistance: 25,
    fadeStrength: 1,
    followCamera: false,
    infiniteGrid: true
}


const BaseGrid = (props) => {
    const vxkey = props.vxkey;
    const isShown = useObjectSetting(vxkey, "show");

    return <VXGrid {...props} position={[0, -0.01, 0]} args={[10.5, 10.5]} {...gridConfig} />

}

const EditableGrid = withVX<EditableGridProps>(BaseGrid, {
    type: "entity",
    icon: "Grid",
    params: gridParams,
    settings: defaultSettings,
})

export default EditableGrid;