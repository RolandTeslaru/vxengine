import { motion } from "framer-motion";
import React, { useState } from "react";
import { useEffect } from "react";
import { ChevronRight } from "@geist-ui/icons";
import CollapsiblePanel from "vxengine/components/ui/CollapsiblePanel";
import { useObjectManagerStore, useObjectPropertyStore } from "../store";
import KeyframeControl from "vxengine/components/ui/KeyframeControl";
import PropInput from "vxengine/components/ui/PropInput";

type SupportedGeometries = THREE.BoxGeometry | THREE.SphereGeometry | THREE.PlaneGeometry | THREE.CylinderGeometry | THREE.TorusGeometry;
// Add any other geometry types you want to support

interface GeometryPropertiesProps {
    geometry: SupportedGeometries;
}

export const GeometryProperties = ({ geometry }: GeometryPropertiesProps) => {

    useEffect(() => {
        console.log("Geometry ", geometry);
    }, [])
    const properties = useObjectPropertyStore(state => ({ properties: state.properties }))
    const firstObjectSelectedStored = useObjectManagerStore((state) => state.selectedObjects[0]);
    const firstObjectSelected = firstObjectSelectedStored?.ref.current;

    return (
        <CollapsiblePanel
            title={geometry.type + " Params"}
        >
            <div className='flex flex-col'>
                {
                    Object.entries(geometry.parameters).map(([key, value]) => {
                        return (
                            <div key={key} className='flex flex-row py-1'>
                                <p className=''>{key}</p>
                                <PropInput
                                    type="number"
                                    className="ml-auto w-fit"
                                    value={properties[firstObjectSelectedStored.vxkey]?.["geometry"]?.["parameters"]?.[key] || 
                                            firstObjectSelected["geometry"]["parameters"][key]}
                                    onChange={(e) =>{

                                    }}
                                />
                            </div>
                        )
                    })
                }
            </div>
        </CollapsiblePanel>
    )
}