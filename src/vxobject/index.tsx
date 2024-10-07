import React, { useCallback, useEffect, useRef, isValidElement, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import { Mesh, SpotLight, LineSegments, LineLoop, Points, Group, OrthographicCamera, PointLight, HemisphereLight, DirectionalLight, AmbientLight, Fog, Object3D, CameraHelper } from 'three';
import { EditableMeshProps, EditableSpotLightProps, EditableLineSegmentsProps, EditableLineLoopProps, EditableAmbientLightProps, EditableDirectionalLightProps, EditableFogProps, EditableGroupProps, EditableHemisphereLightProps, EditableOrthographicCameraProps, EditablePerspectiveCameraProps, EditablePointLightProps, EditablePointsProps, } from "../types/editableObject";
import VXEditableWrapper, { VXEditableWrapperProps } from './wrapper';
import { useVXObjectStore } from "@vxengine/vxobject";
import { useObjectSettingsAPI } from './ObjectSettingsStore';
import { useVXAnimationStore } from '@vxengine/AnimationEngine';
import { PerspectiveCamera, useHelper } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useCameraManagerAPI } from '@vxengine/managers/CameraManager/store';

const EditableMesh = forwardRef<Mesh, EditableMeshProps>((props, ref) => {
    const { children: meshChildren, ...rest } = props;
    const vxkey = rest.vxkey;
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);
    const currentTimelieId = useVXAnimationStore(state => state.currentTimeline?.id)
    const currentSettingsForObject = useVXAnimationStore(state => state.currentTimeline?.settings[vxkey])

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
        if(currentTimelieId === undefined) return 
        const mergedSettingsForObject = {
            ...defaultSettingsForObject,
            ...currentSettingsForObject
        }
        Object.entries(mergedSettingsForObject).forEach(([settingKey, value]) => {
            useObjectSettingsAPI.getState().setSetting(vxkey, settingKey, value)
        })
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
            <spotLight/>
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

const EditablePerspectiveCamera = forwardRef<typeof PerspectiveCamera, EditablePerspectiveCameraProps>((props, ref) => {
    const { ...rest } = props;
    const vxkey = rest.vxkey;
    
    const setAdditionalSetting = useObjectSettingsAPI(state => state.setAdditionalSetting);
    const cameraTarget = useVXObjectStore(state => state.objects["cameraTarget"]?.ref.current)
    const currentTimelieId = useVXAnimationStore(state => state.currentTimeline?.id)
    const currentSettingsForObject = useVXAnimationStore(state => state.currentTimeline?.settings[vxkey])
    
  
    // INITIALIZE Additional Settings
    const defaultAdditionalSettings = {
      showPositionPath: false,
    };
  
    useEffect(() => {
      Object.entries(defaultAdditionalSettings).forEach(([settingKey, value]) => {
        setAdditionalSetting(vxkey, settingKey, value);
      });
    }, []);
  
    const cameraRef = useRef(null)

    useFrame(() => {
        if(cameraRef.current && cameraTarget){
            const camera: THREE.PerspectiveCamera = cameraRef.current
            const targetPosition: THREE.Vector3 = cameraTarget.position

            camera.lookAt(targetPosition)
        }
    })
    // Show the camera helper only in free mode
    const mode = useCameraManagerAPI(state => state.mode)
    useHelper(cameraRef, mode === "free" && CameraHelper)

    const defaultSettingsForObject = {
        useSplinePath: false,
        setingMeshProp1: true,
    }

    // Refresh settings when the current timeline changes
    useEffect(() => {
        if(currentTimelieId === undefined) return 
        const mergedSettingsForObject = {
            ...defaultSettingsForObject,
            ...currentSettingsForObject
        }
        Object.entries(mergedSettingsForObject).forEach(([settingKey, value]) => {
            useObjectSettingsAPI.getState().setSetting(vxkey, settingKey, value)
        })
    }, [currentTimelieId])

    const params = [
        "far",
        "near",
        "fov",
        "zoom",
        "focus",
        "filmGauge",
        "filmOffset"
    ]
  
    return (
      <VXEditableWrapper vxkey={vxkey} ref={cameraRef} type="perspectiveCamera" {...props}>
        <PerspectiveCamera name="VXPerspectiveCamera"/>
      </VXEditableWrapper>
    );
  });

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
