import React, { useEffect, useMemo, useState } from 'react'
import * as THREE from "three"
import CollapsiblePanel from '@vxengine/core/components/CollapsiblePanel';
import PropInput from '@vxengine/components/ui/PropInput';
import Search from '@vxengine/components/ui/Search';
import { vxEntityProps, vxObjectProps } from '../types/objectStore';

const MaterialProperties = ({ vxobject }: { vxobject: vxObjectProps }) => {
    const refObject = (vxobject.ref.current as THREE.Mesh)
    if (!refObject)
        return null;

    const material = refObject.material;
    if (!material)
        return null;

    const properties = useMemo(() => {
        return Object.entries(material).filter(
            ([key, value]) => typeof value === "number" && !key.startsWith("_")
        );
    }, [material]);

    const [searchQuery, setSearchQuery] = useState("");

    const filteredProperties = useMemo(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        return properties.filter(([key]) => key.toLowerCase().includes(lowerCaseQuery));
    }, [properties, searchQuery]);


    const renderProperty = (_key, value) => {
        if (typeof value === "number") {
            return (
                <div className='flex flex-row py-1' key={_key}>
                    <p className='text-xs font-light text-neutral-500'>{_key}</p>
                    <PropInput
                        vxkey={vxobject.vxkey}
                        type="number"
                        className="ml-auto w-fit"
                        propertyPath={`material.${_key}`}
                    />
                </div>
            )
        }
        else return null;
    }


    return (
        <CollapsiblePanel
            title={(material as any).type}
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
