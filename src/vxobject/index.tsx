import React, { useCallback, useEffect, useRef, isValidElement, useMemo, useState, forwardRef } from 'react';
import { Mesh, SpotLight, LineSegments, LineLoop, Points, Group, PerspectiveCamera, OrthographicCamera, PointLight, HemisphereLight, DirectionalLight, AmbientLight, Fog, Object3D } from 'three';
import { EditableMeshProps, EditableSpotLightProps, EditableLineSegmentsProps, EditableLineLoopProps, EditableAmbientLightProps, EditableDirectionalLightProps, EditableFogProps, EditableGroupProps, EditableHemisphereLightProps, EditableOrthographicCameraProps, EditablePerspectiveCameraProps, EditablePointLightProps, EditablePointsProps, } from "../types/editableObject";
import VXEditableWrapper, { VXEditableWrapperProps } from './wrapper';
import { useVXObjectStore } from "@vxengine/vxobject";
import { useObjectSettingsAPI } from './ObjectSettingsStore';
import { useVXAnimationStore } from '@vxengine/AnimationEngine';

const EditableMesh = forwardRef<Mesh, EditableMeshProps>((props, ref) => {
    const { children: meshChildren, ...rest } = props;
    const vxkey = rest.vxkey;
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);
    const currentTimelieId = useVXAnimationStore(state => state.currentTimeline.id)
    const currentSettingsForObject = useVXAnimationStore(state => state.currentTimeline.settings[vxkey])

    // INITIALIZE settigngs on object mount
    const defaultAdditionalSettings = {
        showPositionPath: false,
        specifcMeshProp1: false,
        specifcMeshProp2: true,
        specifcMeshProp3: false,
    }

    useEffect(() => {
        Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value)
        })
    }, [])

    const defaultSettingsForObject = {
        useSplinePath: false,
        setingMeshProp1: true,
    }

    // Refresh settings when the current timeline changes
    useEffect(() => {
        const mergedSettingsForObject = {
            ...defaultSettingsForObject,
            ...currentSettingsForObject
        }
        Object.entries(mergedSettingsForObject).forEach(([settingKey, value]) => {
            useObjectSettingsAPI.getState().setSetting(vxkey, settingKey, value)
        })
    }, [currentTimelieId])

    useEffect(() => {
        console.log("Rerendering because of currentTimeline Change ")
    }, [currentTimelieId])

    return (
        <VXEditableWrapper type="mesh" ref={ref} {...rest}>
            <mesh>
                {meshChildren}
            </mesh>
        </VXEditableWrapper>
    );
});

const EditableSpotLight = forwardRef<SpotLight, EditableSpotLightProps>((props, ref) => {
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);

    const { ...rest } = props;
    const vxkey = rest.vxkey;


    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }

    useEffect(() => {
        Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value)
        })
    }, [])

    return (
        <VXEditableWrapper type="spotlight" ref={ref} {...props}>
            <spotLight ref={ref} />
        </VXEditableWrapper>
    );
})

const EditableLineSegments = forwardRef<LineSegments, EditableLineSegmentsProps>((props, ref) => {
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);

    const { ...rest } = props;
    const vxkey = rest.vxkey;


    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }

    useEffect(() => {
        Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value)
        })
    }, [])

    return (
        <VXEditableWrapper type="linesegments" ref={ref} {...props}>
            <lineSegments ref={ref} />
        </VXEditableWrapper>
    );
})

const EditableLineLoop = forwardRef<LineLoop, EditableLineLoopProps>((props, ref) => {
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);

    const { ...rest } = props;
    const vxkey = rest.vxkey;


    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }

    useEffect(() => {
        Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value)
        })
    }, [])

    return (
        <VXEditableWrapper type="lineloop" ref={ref} {...props}>
            <lineLoop ref={ref} />
        </VXEditableWrapper>
    );
})

const EditablePoints = forwardRef<Points, EditablePointsProps>((props, ref) => {
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);

    const { ...rest } = props;
    const vxkey = rest.vxkey;


    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }

    useEffect(() => {
        Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value)
        })
    }, [])

    return (
        <VXEditableWrapper type="points" ref={ref} {...props}>
            <points ref={ref} />
        </VXEditableWrapper>
    );
})

const EditableGroup = forwardRef<Group, EditableGroupProps>((props, ref) => {
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);

    const { ...rest } = props;
    const vxkey = rest.vxkey;


    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }

    useEffect(() => {
        Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value)
        })
    }, [])

    return (
        <VXEditableWrapper type="group" ref={ref} {...props}>
            <group ref={ref} {...props} >
                {props.children}
            </group>
        </VXEditableWrapper>
    );
})

const EditablePerspectiveCamera = forwardRef<PerspectiveCamera, EditablePerspectiveCameraProps>((props, ref) => {
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);

    const { ...rest } = props;
    const vxkey = rest.vxkey;


    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }

    useEffect(() => {
        Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value)
        })
    }, [])

    return (
        <perspectiveCamera ref={ref} {...props} />
    )
}
)

const EditableOrthographicCamera = forwardRef<OrthographicCamera, EditableOrthographicCameraProps>((props, ref) => (
    <orthographicCamera ref={ref} {...props} />
))

const EditablePointLight = forwardRef<PointLight, EditablePointLightProps>((props, ref) => {
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);

    const { ...rest } = props;
    const vxkey = rest.vxkey;


    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }

    useEffect(() => {
        Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value)
        })
    }, [])

    return (
        <VXEditableWrapper type="pointlight" ref={ref} {...props}>
            <pointLight ref={ref} {...props} />
        </VXEditableWrapper>
    )
})

const EditableHemisphereLight = forwardRef<HemisphereLight, EditableHemisphereLightProps>((props, ref) => {
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);

    const { ...rest } = props;
    const vxkey = rest.vxkey;


    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }

    useEffect(() => {
        Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value)
        })
    }, [])

    return (
        <hemisphereLight ref={ref} {...props} />
    )
}
)

const EditableDirectionalLight = forwardRef<DirectionalLight, EditableDirectionalLightProps>((props, ref) => {
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);

    const { ...rest } = props;
    const vxkey = rest.vxkey;


    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }

    useEffect(() => {
        Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value)
        })
    }, [])

    return (
        <directionalLight ref={ref} {...props} />
    )
}
)

const EditableAmbientLight = forwardRef<AmbientLight, EditableAmbientLightProps>((props, ref) => {
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);
    
    const {...rest} = props;
    const vxkey = rest.vxkey;


    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
        showPositionPath: false,
    }

    useEffect(() => {
        Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
            setAdditionalSetting(vxkey, settingKey, value)
        })
    }, [])

    return (
        <ambientLight ref={ref} {...props} />
    )
})

const EditableFog = forwardRef<Fog, EditableFogProps>((props, ref) => (
    <fog ref={ref} {...props} />
))

export const vx = {
    mesh: EditableMesh,
    spotLight: EditableSpotLight,
    // lineSegments: EditableLineSegments,
    // lineLoop: EditableLineLoop,
    points: EditablePoints,
    group: EditableGroup,
    perspectiveCamera: EditablePerspectiveCamera,
    orthographicCamera: EditableOrthographicCamera,
    pointLight: EditablePointLight,
    hemisphereLight: EditableHemisphereLight,
    directionalLight: EditableDirectionalLight,
    ambientLight: EditableAmbientLight,
    fog: EditableFog,
};

export { useVXObjectStore } from "./ObjectStore"

// Same as vx namespace but an be used with theatrejs and also save to VXStore
const vxe = {

}
