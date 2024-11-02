import { motion } from "framer-motion";
import React, { useState } from "react";
import { useEffect } from "react";
import { ChevronRight } from "@geist-ui/icons";
import CollapsiblePanel from "@vxengine/components/ui/CollapsiblePanel";
import { useObjectManagerAPI, useObjectPropertyAPI } from "../store";
import PropInput from "@vxengine/components/ui/PropInput";
import { shallow } from "zustand/shallow";

import * as THREE from "three"

type SupportedGeometries = THREE.BoxGeometry | THREE.SphereGeometry | THREE.PlaneGeometry | THREE.CylinderGeometry | THREE.TorusGeometry;
// Add any other geometry types you want to support

interface GeometryPropertiesProps {
    geometry: SupportedGeometries;
}

export const GeometryProperties = ({ geometry }: GeometryPropertiesProps) => {

    const params = geometry.parameters
    if (!params) return null;

    const GeomPropRender = ({ _key, value}) => {
        return (
            <div className='flex flex-row py-1'>
                <p className='text-xs font-light text-neutral-500'>{_key}</p>
                <PropInput
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