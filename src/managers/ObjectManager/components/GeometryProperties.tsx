import React, { useState, FC } from "react";
import CollapsiblePanel from "@vxengine/core/components/CollapsiblePanel";
import PropInput from "@vxengine/components/ui/PropInput";

import * as THREE from "three"
import { vxEntityProps, vxObjectProps } from "../types/objectStore";

export type ValidGeometries = THREE.BoxGeometry | THREE.SphereGeometry | THREE.PlaneGeometry | THREE.CylinderGeometry | THREE.TorusGeometry;
// Add any other geometry types you want to support

interface VXGeometryProps {
    vxobject: vxEntityProps
}

export const GeometryProperties:FC<VXGeometryProps> = ({ vxobject }) => {
    const refObject = (vxobject.ref.current as THREE.Mesh);
    if(!refObject)
        return null;

    const geometry = refObject.geometry as ValidGeometries;
    if(!geometry) 
        return null;

    const params = geometry.parameters
    if (!params) 
        return null;

    const GeomPropRender = ({ _key, value}) => {
        return (
            <div className='flex flex-row py-1'>
                <p className='text-xs font-light text-neutral-500'>{_key}</p>
                <PropInput
                    vxkey={vxobject.vxkey}
                    type="number"
                    className="ml-auto w-fit"
                    propertyPath={`geometry.parameters.${_key}`}
                />
            </div>
        )
    }

    return (
        <CollapsiblePanel
            title={geometry.type + " Params"}
        >
            <div className='flex flex-col'>
                {Object.entries(params).map(
                    ([key, value]) => <GeomPropRender key={key} _key={key} value={value} />
                )}
            </div>
        </CollapsiblePanel>
    )
}