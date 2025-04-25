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
  /** Cell size, default: 0.5 */
  cellSize?: number
  /** Cell color, default: black */
  cellColor?: THREE.ColorRepresentation
  /** Section size, default: 1 */
  sectionSize?: number
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
}

export type GridProps = Omit<ThreeElements['mesh'], 'ref' | 'args'> &
  GridMaterialType & {
    /** Default plane-geometry arguments */
    args?: ConstructorParameters<typeof THREE.PlaneGeometry>
  }

declare module '@react-three/fiber' {
  interface ThreeElements {
    gridMaterial: ThreeElements['shaderMaterial'] & GridMaterialType
  }
}

const GridMaterial = /* @__PURE__ */ shaderMaterial(
  {
    cellSize: 0.5,
    sectionSize: 1,
    fadeDistance: 100,
    fadeStrength: 1,
    fadeFrom: 1,
    cellColor: /* @__PURE__ */ new THREE.Color(),
    sectionColor: /* @__PURE__ */ new THREE.Color(),
    infiniteGrid: false,
    followCamera: false,
    worldCamProjPosition: /* @__PURE__ */ new THREE.Vector3(),
    worldPlanePosition: /* @__PURE__ */ new THREE.Vector3(),
  },
  /* glsl */ `
    varying vec3 localPosition;
    varying vec4 worldPosition;

    uniform vec3 worldCamProjPosition;
    uniform vec3 worldPlanePosition;
    uniform float fadeDistance;
    uniform bool infiniteGrid;
    uniform bool followCamera;

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
    uniform float cellSize;
    uniform float sectionSize;
    uniform vec3 cellColor;
    uniform vec3 sectionColor;
    uniform float fadeDistance;
    uniform float fadeStrength;
    uniform float fadeFrom;

    // Function to calculate continuous grid line intensity
    float getGrid(float size) {
      // Use a slightly smaller thickness for the lines compared to the crosses
      float lineThicknessFactor = 0.75; // Adjust as needed
      vec2 r = localPosition.xz / size;
      // Calculate distance to cell center lines, normalized by fwidth
      vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
      // Find the minimum distance to a horizontal or vertical line
      float lineDist = min(grid.x, grid.y);
      // Use smoothstep for anti-aliased lines
      // Intensity is 1 on the line, fading smoothly to 0
      return smoothstep(lineThicknessFactor, 0.0, lineDist);
    }

    void main() {
      // --- Cross Calculation (from previous step) ---
      vec2 distFromCellCenterLines = abs(fract(localPosition.xz / cellSize) - 0.5) * cellSize;
      float crossArmHalfLength = cellSize * 0.1;
      float fw = length(fwidth(localPosition.xz));
      float intensityX = smoothstep(fw, 0.0, distFromCellCenterLines.x);
      float maskZ = smoothstep(crossArmHalfLength + fw, crossArmHalfLength - fw, distFromCellCenterLines.y);
      float verticalArm = intensityX * maskZ;
      float intensityZ = smoothstep(fw, 0.0, distFromCellCenterLines.y);
      float maskX = smoothstep(crossArmHalfLength + fw, crossArmHalfLength - fw, distFromCellCenterLines.x);
      float horizontalArm = intensityZ * maskX;
      float crossIntensity = clamp(verticalArm + horizontalArm, 0.0, 1.0);
      // --- End Cross Calculation ---

      // --- Line Calculation ---
      float g2 = getGrid(sectionSize);
      // --- End Line Calculation ---

      // --- Combined Intensity ---
      // Take the maximum intensity of the cross or the lines
      float combinedIntensity = max(crossIntensity, g2);
      // --- End Combined Intensity ---

      // --- Section Color Logic (Applied to crosses) ---
      vec2 distFromSectionCenterLines = abs(fract(localPosition.xz / sectionSize) - 0.5) * sectionSize;
      float sectionIntensityX = smoothstep(fw, 0.0, distFromSectionCenterLines.x);
      float sectionMaskZ = smoothstep(crossArmHalfLength + fw, crossArmHalfLength - fw, distFromSectionCenterLines.y);
      float sectionVerticalArm = sectionIntensityX * sectionMaskZ;
      float sectionIntensityZ = smoothstep(fw, 0.0, distFromSectionCenterLines.y);
      float sectionMaskX = smoothstep(crossArmHalfLength + fw, crossArmHalfLength - fw, distFromSectionCenterLines.x);
      float sectionHorizontalArm = sectionIntensityZ * sectionMaskX;
      float sectionCrossIntensity = clamp(sectionVerticalArm + sectionHorizontalArm, 0.0, 1.0);
      // Blend color based on whether the *cross* is on a section intersection
      vec3 color = mix(cellColor, sectionColor, sectionCrossIntensity);
      // --- End Section Color Logic ---

      // --- Fading Logic (unchanged) ---
      vec3 from = worldCamProjPosition * vec3(fadeFrom);
      float dist = distance(from, worldPosition.xyz);
      float d = 1.0 - min(dist / fadeDistance, 1.0);
      float fade = pow(d, fadeStrength);
      // --- End Fading Logic ---

      // Final fragment color: Use combined intensity for alpha
      gl_FragColor = vec4(color, combinedIntensity * fade);

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
      cellColor = '#000000',
      sectionColor = '#2080ff',
      cellSize = 0.5,
      sectionSize = 1,
      followCamera = false,
      infiniteGrid = false,
      fadeDistance = 100,
      fadeStrength = 1,
      fadeFrom = 1,
      side = THREE.BackSide,
      ...props
  }) => {
    extend({ GridMaterial })

    const internalRef = React.useRef<THREE.Mesh>(null!)
    React.useImperativeHandle(ref, () => internalRef.current, [])
    
    const [plane, upVector, zeroVector] = useMemo(() => {
      return [new THREE.Plane(), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0)]
    }, [])

    useFrame((state) => {
      plane.setFromNormalAndCoplanarPoint(upVector, zeroVector).applyMatrix4(internalRef.current.matrixWorld)

      const gridMaterial = internalRef.current.material as THREE.ShaderMaterial
      const worldCamProjPosition = gridMaterial.uniforms.worldCamProjPosition as THREE.Uniform<THREE.Vector3>
      const worldPlanePosition = gridMaterial.uniforms.worldPlanePosition as THREE.Uniform<THREE.Vector3>

      plane.projectPoint(state.camera.position, worldCamProjPosition.value)
      worldPlanePosition.value.set(0, 0, 0).applyMatrix4(internalRef.current.matrixWorld)
    })

    const uniforms2 = { fadeDistance, fadeStrength, fadeFrom, infiniteGrid, followCamera }

    return (
      <mesh ref={internalRef} frustumCulled={false} {...props}>
        <gridMaterial
          transparent
          extensions-derivatives
          side={side}
          cellSize={cellSize}
          sectionSize={sectionSize}
          cellColor={cellColor}
          sectionColor={sectionColor}
          {...uniforms2}
        />
        <planeGeometry args={args} />
      </mesh>
    )
  }