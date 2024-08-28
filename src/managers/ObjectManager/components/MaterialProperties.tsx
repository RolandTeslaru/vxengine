import React, { useEffect } from 'react'
import { useObjectManagerStore, useObjectPropertyStore } from '../store';
import { shallow } from 'zustand/shallow';
import * as THREE from "three"
import CollapsiblePanel from 'vxengine/components/ui/CollapsiblePanel';

interface Props {
    material: THREE.MeshBasicMaterial | THREE.MeshStandardMaterial
}

const MaterialProperties: React.FC<Props> = ({ material }) => {
    const firstObjectSelectedStored = useObjectManagerStore((state) => state.selectedObjects[0]);
    const firstObjectSelected = firstObjectSelectedStored?.ref.current;
    const updateProperty = useObjectPropertyStore((state) => state.updateProperty);
    const { properties } = useObjectPropertyStore(state => ({ properties: state.properties }), shallow);


    useEffect(() => {
        console.log("Material ", material)
    }, [])

    return (
        <CollapsiblePanel
            title="Material Properties"
            defaultOpen={false}
        >
        
        </CollapsiblePanel>
    )
}

export default MaterialProperties
