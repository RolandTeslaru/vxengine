import { SelectGroup } from '@radix-ui/react-select';
import { Canvas, useFrame } from '@react-three/fiber';
import { Popover, PopoverContent, PopoverTrigger } from '@vxengine/components/shadcn/popover';
import { Select, SelectContent, SelectTrigger, SelectItem, SelectValue } from '@vxengine/components/shadcn/select';
import animationEngineInstance from '@vxengine/singleton';
import React, { useRef, useEffect, useState, useMemo } from 'react';
import JsonView from 'react18-json-view';
import * as THREE from 'three';

interface TextureDebugViewProps {
    texture: THREE.Texture;
    width?: number;
    height?: number;
}

export const TextureDebugView: React.FC<TextureDebugViewProps> = () => {
    const gpuComputeService = animationEngineInstance.gpuComputeService;
    const [selectedTexture, setSelectedTexture] = useState("keyframeTexture")

    const texture = useMemo(() => {
        if (!gpuComputeService) return
        if (selectedTexture === "keyframeTexture")
            return gpuComputeService.keyframeTexture
        else if (selectedTexture === "handlesTexture")
            return gpuComputeService.handleTexture
        else if (selectedTexture === "computationTexture")
            return gpuComputeService.computeRenderTargetTexture
    }, [selectedTexture])

    console.log("Texture ", texture)

    return (
        <div className='p-1 w-full h-full flex flex-col gap-2'>
            <h1 className='font-roboto-mono'>GPU Compute Render Target Texture</h1>
            <Select
                defaultValue={selectedTexture}
                onValueChange={(value) => setSelectedTexture(value)}
            >
                <SelectTrigger className='w-fit'>
                    <SelectValue placeholder="Select a Render Target"></SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value='keyframeTexture'>Keyframe Texture</SelectItem>
                        <SelectItem value='handlesTexture'>Handles Texture</SelectItem>
                        <SelectItem value='computationTexture'>Compute Texture</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <div>

            </div>
            {gpuComputeService ?
                <div className='flex flex-row gap-2'>
                    <div style={{
                        width: 300,
                        height: 300,
                    }}
                        className='border border-neutral-700 rounded-md bg-neutral-800'
                    >
                        <Canvas
                            orthographic
                            camera={{ zoom: 1, position: [0, 0, 1] }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <TexturePlane texture={texture} />
                        </Canvas>
                    </div>
                    <div className='text-xs font-roboto-mono text-white'>
                        <p>Gpu Compute Service <span className='text-green-400'>ready</span></p>
                        <p>{`Texture Width ${gpuComputeService.computeTextureWidth}`}</p>
                        <p>{`Texture Height ${gpuComputeService.computeTextureHeight}`}</p>
                        <Popover>
                            <PopoverTrigger>
                                Show Data
                            </PopoverTrigger>
                            <TexturePopoverContent texture={texture}/>
                        </Popover>
                    </div>
                </div>
                : <p className='text-xs font-roboto-mono text-red-500'>
                    GpuComputeService isn't present on this render. Reopen the window!
                </p>}
        </div>
    )
};

const TexturePopoverContent = ({ texture }: { texture: any }) => {
    return (
        <PopoverContent side='right'>
            <div className='max-h-[400px] overflow-y-scroll flex flex-col w-full text-xs bg-neutral-900 p-1 rounded-md shadow-lg'>
                <JsonView src={texture} collapsed={({ depth }) => depth > 1} />
            </div>
        </PopoverContent>
    )
}

function TexturePlane({ texture }: { texture: THREE.Texture | THREE.DataTexture }) {
    if (texture instanceof THREE.DataTexture) {
        texture.needsUpdate = true;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
    }

    useFrame((state) => {
        state.gl.clear()
        state.gl.autoClear = true
    })

    return (
        <mesh>
            <planeGeometry args={[290, 290]} />
            <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
        </mesh>
    );
}