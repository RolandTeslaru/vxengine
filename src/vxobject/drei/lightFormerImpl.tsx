import { applyProps, ReactThreeFiber, ThreeElements } from '@react-three/fiber'
import React, { useImperativeHandle, useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'

export type LightFormerProps = Omit<ThreeElements['mesh'], 'ref'> & {
  ref?: React.RefObject<THREE.Mesh>
  args?: number[]
  map?: THREE.Texture
  toneMapped?: boolean
  color?: ReactThreeFiber.Color
  form?: 'circle' | 'ring' | 'rect' | 'plane' | 'box' | any
  scale?: number | [number, number, number] | [number, number]
  intensity?: number
  target?: boolean | [number, number, number] | THREE.Vector3
  light?: Partial<ThreeElements['pointLight']>
}

export const Lightformer: React.FC<LightFormerProps> = ({
      light,
      args,
      map,
      toneMapped = false,
      color = 'white',
      form: Form = 'rect',
      intensity = 1,
      scale = 1,
      target = [0, 0, 0],
      children,
      ref: forwardRef,
      ...props
    }) => {
    // Apply emissive power
    const ref = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>(null!)
    useImperativeHandle(forwardRef, () => ref.current, [])
    useLayoutEffect(() => {
      if (!children && !props.material) {
        applyProps(ref.current.material as any, { color })
        ref.current.material.color.multiplyScalar(intensity)
      }
    }, [color, intensity, children, props.material])


    // Fix 2-dimensional scale
    scale = Array.isArray(scale) && scale.length === 2 ? [scale[0], scale[1], 1] : scale
    return (
      <mesh ref={ref} scale={scale} {...props}>
        {Form === 'circle' ? (
          <ringGeometry args={args ? (args as any) : [0, 0.5, 64]} />
        ) : Form === 'ring' ? (
          <ringGeometry args={args ? (args as any) : [0.25, 0.5, 64]} />
        ) : Form === 'rect' || Form === 'plane' ? (
          <planeGeometry args={args ? (args as any) : [1, 1]} />
        ) : Form === 'box' ? (
          <boxGeometry args={args ? (args as any) : [1, 1, 1]} />
        ) : (
          <Form args={args} />
        )}
        {children ? children : <meshBasicMaterial wireframe={true} toneMapped={toneMapped} map={map} side={THREE.DoubleSide} />}
        {light && <pointLight castShadow {...light} />}
      </mesh>
    )
  }
