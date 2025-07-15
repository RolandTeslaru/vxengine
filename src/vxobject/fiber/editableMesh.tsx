import React, { useEffect, useLayoutEffect } from "react";
import { VXElementPropsWithoutRef, VXObjectSettings } from "../types"

import { Mesh } from "three";
import { ThreeElements, useThree } from "@react-three/fiber";
import { withVX } from "../withVX";
import * as THREE from "three"
import { LayerMaterial } from "../layerMaterials/vanilla";
import { ObjectManagerService } from "@vxengine/managers/ObjectManager/service";

export type VXElementMeshProps = VXElementPropsWithoutRef<ThreeElements["mesh"]> & {
    ref?: React.RefObject<Mesh>;
};

export const defaultSettings: VXObjectSettings = {
    showPositionPath: { title: "show position path", storage: "localStorage", value: false },
    useSplinePath: { title: "use spline path", storage: "disk", value: false },
    useRotationDegrees: { title: "use rotation degrees", storage: "disk", value: false },
}

const BaseMesh = (props: VXElementMeshProps) => {
    const { children, ...restProps } = props;
    useEffect(() => {
        if((restProps.material as THREE.Material) instanceof LayerMaterial){
            (restProps.material as LayerMaterial).vxobject.parentKeys.add(props.vxkey);
            (restProps.material as LayerMaterial).vxobject.parentMeshKeys.add(props.vxkey)
            // ObjectManagerService.objectManagerState.reattachTreeNode(
            //     (restProps.material as LayerMaterial).vxobject.vxkey
            // )
        }

    }, [props])
    return <mesh {...restProps}>{children}</mesh>;
}


export const EditableMesh = withVX<ThreeElements["mesh"]>(BaseMesh, {
    type: "entity",
    settings: defaultSettings,
    initialInterpolatedParams: [
        {
            paramName: "position",
            type: "vector3",
            partialPropertyPath: "position",
        },
        {
            paramName: "rotation",
            type: "vector3",
            partialPropertyPath: "rotation",
        },
        {
            paramName: "scale",
            type: "vector3",
            partialPropertyPath: "scale",
        },
    ]
});