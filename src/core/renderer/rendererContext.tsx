import { EffectComposer } from 'postprocessing'
import React, { useRef, createContext, useMemo, useEffect } from 'react'
import * as THREE from "three"
import { useFrame, useThree } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'

interface VXRendererProviderProps {
    children: React.ReactNode
}

interface VXRendererContextType {
    composer: React.RefObject<EffectComposer | null>;
    gl: THREE.WebGLRenderer;
    nonTransparentFBO: THREE.WebGLRenderTarget
}

const VXRendererContext = createContext<VXRendererContextType>({
    composer: { current: null },
    gl: null as any,
    nonTransparentFBO: null
});


const OPAQUE_LAYER = 0;
const TRANSPARENT_LAYER = 1;

const VXRendererProvider: React.FC<VXRendererProviderProps> = (props) => {
    const { scene, size, gl, camera } = useThree();

    const composer = useRef<EffectComposer | null>(null);

    const nonTransparentFBO = useFBO(size.width, size.height, {
         depth: true,
         stencilBuffer: false,
    })
    
    const opaqueRenderTargetRef = useMemo(() => {
        const target = new THREE.WebGLRenderTarget(size.width, size.height);
        target.texture.name = "OpaqueRenderTarget";
        return target;
    }, [size.width, size.height]);
    const opaqueRenderTarget = useRef(opaqueRenderTargetRef);

    const contextValue = useMemo(() => ({
        gl: gl,
        composer: composer,
        nonTransparentFBO: nonTransparentFBO
    }), [gl, composer, opaqueRenderTarget]);

    return (
        <VXRendererContext.Provider value={contextValue}>
            {props.children}
        </VXRendererContext.Provider>
    )
}

export default VXRendererProvider;
export { VXRendererContext };