import { motion } from "framer-motion";
import React, { useState } from "react";
import { useEffect } from "react";
import { ChevronRight } from "@geist-ui/icons";
import CollapsiblePanel from "@vxengine/components/ui/CollapsiblePanel";
import { useObjectManagerAPI, useObjectPropertyAPI } from "../store";
import PropInput from "@vxengine/components/ui/PropInput";
import { shallow } from "zustand/shallow";

type SupportedGeometries = THREE.BoxGeometry | THREE.SphereGeometry | THREE.PlaneGeometry | THREE.CylinderGeometry | THREE.TorusGeometry;
// Add any other geometry types you want to support

interface GeometryPropertiesProps {
    geometry: SupportedGeometries;
}

export const GeometryProperties = ({ geometry }: GeometryPropertiesProps) => {

    return (
        <CollapsiblePanel
            title={geometry.type + " Params"}
        >
            <div className='flex flex-col'>
                {Object.entries(geometry.parameters).map(([key, value]) => {
                        return (
                            <div key={key} className='flex flex-row py-1'>
                                <p className=''>{key}</p>
                                <PropInput
                                    type="number"
                                    className="ml-auto w-fit"
                                    propertyPath={`geometry.parameters.${key}`}
                                />
                            </div>
                        )
                    })
                }
            </div>
        </CollapsiblePanel>
    )
}