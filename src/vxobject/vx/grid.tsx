/** Based on
      https://github.com/Fyrestar/THREE.InfiniteGridHelper by https://github.com/Fyrestar
      and https://github.com/threlte/threlte/blob/main/packages/extras/src/lib/components/Grid/Grid.svelte
        by https://github.com/grischaerbe and https://github.com/jerzakm
*/

import * as React from 'react'
import * as THREE from 'three'
import { extend, ThreeElements, useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import { ForwardRefComponent } from '@react-three/drei/helpers/ts-utils'
import { version } from '@react-three/drei/helpers/constants'
import { useMemo } from 'react'

export type GridMaterialType = {
  /** Cross size, default: 0.5 */
  crossSize?: number
  /** Cross thickness, default: 0.1 */
  crossThickness?: number
  /** Cross arm length as a factor of cross size, default: 0.1 */
  crossArmLength?: number
  /** Cross color, default: black */
  crossColor?: THREE.ColorRepresentation
  /** Section size, default: 1 */
  sectionSize?: number
  /** Section thickness, default: 0.75 */
  sectionThickness?: number
  /** Section color, default: #2080ff */
  sectionColor?: THREE.ColorRepresentation
  /** Follow camera, default: false */
  followCamera?: boolean
  /** Display the grid infinitely, default: false */
  infiniteGrid?: boolean
  /** Fade distance, default: 100 */
  fadeDistance?: number
  /** Fade strength, default: 1 */
  fadeStrength?: number
  /** Fade from camera (1) or origin (0), or somewhere in between, default: camera */
  fadeFrom?: number
  /** Material side, default: THREE.BackSide */
  side?: THREE.Side
  /** Controls grid visibility, default: true */
  visible?: boolean
}

export type GridProps = Omit<ThreeElements['mesh'], 'ref' | 'args'> &
  GridMaterialType & {
    /** Default plane-geometry arguments */
    args?: ConstructorParameters<typeof THREE.PlaneGeometry>
  }


const GridMaterial = /* @__PURE__ */ shaderMaterial(
  {
    crossSize: 0.5,
    crossThickness: 0.1,
    crossArmLength: 0.1,
    sectionSize: 1,
    sectionThickness: 0.75,
    fadeDistance: 100,
    fadeStrength: 1,
    fadeFrom: 1,
    crossColor: /* @__PURE__ */ new THREE.Color(),
    sectionColor: /* @__PURE__ */ new THREE.Color(),
    infiniteGrid: false,
    followCamera: false,
    worldCamProjPosition: /* @__PURE__ */ new THREE.Vector3(),
    worldPlanePosition: /* @__PURE__ */ new THREE.Vector3(),
    visible: true,
  },
  /* glsl */ `
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform vec3 worldPlanePosition;
    uniform float fadeDistance;
    uniform bool infiniteGrid;
    uniform bool followCamera;
    uniform bool visible;

    void main() {
      localPosition = position.xzy;
      if (infiniteGrid) localPosition *= 1.0 + fadeDistance;
      
      worldPosition = modelMatrix * vec4(localPosition, 1.0);
      if (followCamera) {
        worldPosition.xyz += (worldCamProjPosition - worldPlanePosition);
        localPosition = (inverse(modelMatrix) * worldPosition).xyz;
      }

      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  /* glsl */ `
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform float crossSize;
    uniform float crossThickness;
    uniform float crossArmLength;
    uniform float sectionSize;
    uniform float sectionThickness;
    uniform vec3 crossColor;
    uniform vec3 sectionColor;
    uniform float fadeDistance;
    uniform float fadeStrength;
    uniform float fadeFrom;
    uniform bool visible;

    // Function to calculate continuous grid line intensity
    float getGrid(float size, float thickness) {
      vec2 r = localPosition.xz / size;
      // Calculate distance to cell center lines, normalized by fwidth
      vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
      // Find the minimum distance to a horizontal or vertical line
      float lineDist = min(grid.x, grid.y);
      // Use smoothstep for anti-aliased lines
      // Intensity is 1 on the line, fading smoothly to 0
      return smoothstep(thickness, 0.0, lineDist);
    }

    void main() {
      if (!visible) discard;
      // --- Cross Calculation ---
      vec2 distFromCellCenterLines = abs(fract(localPosition.xz / crossSize) - 0.5) * crossSize;
      
      // Calculate the cross arms with proper thickness
      float armLength = crossSize * crossArmLength; // Arm length controlled by parameter
      float lineWidth = crossThickness * crossSize * 0.05; // Scale thickness relative to cross size
      float fw = length(fwidth(localPosition.xz));
      
      // Calculate thickness-adjusted intensity for vertical arm
      float vertLineThickness = lineWidth + fw;
      float intensityX = smoothstep(vertLineThickness, 0.0, distFromCellCenterLines.x);
      
      // Limit vertical line's length
      float maskZ = smoothstep(armLength + fw, armLength - fw, distFromCellCenterLines.y);
      float verticalArm = intensityX * maskZ;
      
      // Calculate thickness-adjusted intensity for horizontal arm
      float horizLineThickness = lineWidth + fw;
      float intensityZ = smoothstep(horizLineThickness, 0.0, distFromCellCenterLines.y);
      
      // Limit horizontal line's length
      float maskX = smoothstep(armLength + fw, armLength - fw, distFromCellCenterLines.x);
      float horizontalArm = intensityZ * maskX;
      
      float crossIntensity = clamp(verticalArm + horizontalArm, 0.0, 1.0);
      // --- End Cross Calculation ---

      // --- Line Calculation ---
      float g2 = getGrid(sectionSize, sectionThickness);
      // --- End Line Calculation ---

      // --- Calculate Final Color and Alpha ---
      // Start with cross color for all crosses
      vec3 color = crossColor;
      float alpha = crossIntensity;
      
      // If section grid is visible at this pixel, blend in the section color
      if (g2 > 0.0) {
        color = sectionColor;
        alpha = g2;
      }
      
      // If both are visible, use the stronger one
      if (crossIntensity > 0.0 && g2 > 0.0) {
        alpha = max(crossIntensity, g2);
      }
      // --- End Color Calculation ---

      // --- Fading Logic (unchanged) ---
      vec3 from = worldCamProjPosition * vec3(fadeFrom);
      float dist = distance(from, worldPosition.xyz);
      float d = 1.0 - min(dist / fadeDistance, 1.0);
      float fade = pow(d, fadeStrength);
      // --- End Fading Logic ---

      // Final fragment color: Use combined intensity for alpha
      gl_FragColor = vec4(color, alpha * fade);

      // Discard pixels with zero alpha
      if (gl_FragColor.a <= 0.0) discard;

      // Apply standard Three.js color space and tonemapping
      #include <tonemapping_fragment>
      #include <${version >= 154 ? 'colorspace_fragment' : 'encodings_fragment'}>
    }
  `
)

export const VXGrid = ({
      ref,  
      args,
      crossColor = '',
      sectionColor = '#2080ff',
      crossSize = 1.0,
      crossThickness = 0.1,
      crossArmLength = 0.1,
      sectionSize = 6,
      sectionThickness = 0.75,
      followCamera = false,
      infiniteGrid = false,
      fadeDistance = 40,
      fadeStrength = 2.1,
      fadeFrom = 1,
      side = THREE.BackSide,
      visible = true,
      ...props
  }) => {
    extend({ GridMaterial })

    const internalRef = React.useRef<THREE.Mesh>(null!)
    React.useImperativeHandle(ref, () => internalRef.current, [])
    
    const [plane, upVector, zeroVector] = useMemo(() => {
      return [new THREE.Plane(), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0)]
    }, [])

    useFrame((state) => {
      if (!visible) return;
      plane.setFromNormalAndCoplanarPoint(upVector, zeroVector).applyMatrix4(internalRef.current.matrixWorld)

      const gridMaterial = internalRef.current.material as THREE.ShaderMaterial
      const worldCamProjPosition = gridMaterial.uniforms.worldCamProjPosition as THREE.Uniform<THREE.Vector3>
      const worldPlanePosition = gridMaterial.uniforms.worldPlanePosition as THREE.Uniform<THREE.Vector3>

      plane.projectPoint(state.camera.position, worldCamProjPosition.value)
      worldPlanePosition.value.set(0, 0, 0).applyMatrix4(internalRef.current.matrixWorld)
    })

    const uniforms2 = { 
      fadeDistance, 
      fadeStrength, 
      fadeFrom, 
      infiniteGrid, 
      followCamera,
      crossSize,
      crossThickness,
      crossArmLength,
      sectionThickness,
      visible,
    }

    return (
      <mesh ref={internalRef} frustumCulled={false} {...props}>
        <gridMaterial
          transparent
          extensions-derivatives
          side={side}
          sectionSize={sectionSize}
          crossColor={crossColor}
          sectionColor={sectionColor}
          visible={visible}
          {...uniforms2}
          {...({} as any)}
        />
        <planeGeometry args={args} />
      </mesh>
    )
  }