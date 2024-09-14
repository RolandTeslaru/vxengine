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

    return (
        <CollapsiblePanel
            title={material.type}
            defaultOpen={false}
        >
        
        </CollapsiblePanel>
    )
}

export default MaterialProperties
