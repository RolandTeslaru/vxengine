import React, { FC } from 'react'
import VXThreeElementWrapper from '../VXThreeElementWrapper'
import { VXElementParams, VXElementProps, VXObjectSettings } from '../types'
import { Mesh, BufferGeometry, MeshBasicMaterial } from 'three'
import { Grid, GridProps } from '@react-three/drei'
import { useObjectSetting } from '@vxengine/managers/ObjectManager/stores/settingsStore'

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
    cellSize: 0.5,
    cellThickness: 0.5,
    cellColor: '#6f6f6f',
    sectionSize: 3,
    sectionThickness: 1,
    sectionColor: '#ffffff',
    fadeDistance: 30,
    fadeStrength: 1,
    followCamera: false,
    infiniteGrid: true
}

const EditableGrid: FC<EditableGridProps> = (props) => {
    const { settings = {}, ref, vxkey, ...rest } = props;

    const mergedSettings = {
        ...defaultSettings,
        ...settings,
    }

    

    return (
        <VXThreeElementWrapper vxkey={vxkey} icon='Grid' params={gridParams} settings={mergedSettings} {...rest}>
            <GridImpl vxkey={vxkey}/>
        </VXThreeElementWrapper>
    )
}

export default EditableGrid

const GridImpl = ({vxkey}) => {
    const isShown = useObjectSetting(vxkey, "show");

    return (
        <>
            {isShown && 
                <Grid position={[0, -0.01, 0]} args={[10.5, 10.5]} {...gridConfig} />
            }
        </>
    )
}