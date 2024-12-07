import React, { useEffect, useMemo, useState } from 'react'
import * as THREE from "three"
import CollapsiblePanel from '@vxengine/components/ui/CollapsiblePanel';
import PropInput from '@vxengine/components/ui/PropInput';
import Search from '@vxengine/components/ui/Search';

interface Props {
    material: THREE.MeshBasicMaterial | THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial
}

const MaterialProperties: React.FC<Props> = ({ material }) => {
    const properties = useMemo(() => {
        return Object.entries(material);
    }, [material])
    const [searchQuery, setSearchQuery] = useState("");

    const renderProperty = (_key, value) => {
        if (typeof value === "number") {
            return (
                <div className='flex flex-row py-1'>
                    <p className='text-xs font-light text-neutral-500'>{_key}</p>
                    <PropInput
                        type="number"
                        className="ml-auto w-fit"
                        propertyPath={`material.${_key}`}
                    />
                </div>
            )
        }
        else return null;
    }

    const filteredProperties = useMemo(() => {
        return properties.filter(([key, obj]) => typeof obj === "number" && key.toLocaleLowerCase().includes(searchQuery));
    }, [material, searchQuery])

    return (
        <CollapsiblePanel
            title={material.type}
            defaultOpen={true}
        >
            <div className='text-xs flex flex-row text-neutral-400'>
                <p className='mr-auto text-xs' style={{ fontSize: "10px" }}>
                    {filteredProperties.length} properties
                </p>
                {/* Search input */}
                <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
            <div className='flex flex-col mt-2 max-h-80 overflow-scroll rounded-lg'>
                {filteredProperties.map(([key, value]) => {
                    if (key.startsWith('_') || typeof value === 'function') {
                        // Skip private properties and methods
                        return null;
                    }
                    return renderProperty(key, value);
                })}
            </div>
        </CollapsiblePanel>
    )
}

export default MaterialProperties
