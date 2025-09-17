## VXEngine

VXEngine is a React Three Fiber powered 3D animation engine and editor. It combines a runtime renderer, a timeline/keyframe animation system, and a desktop‑like editor UI ("VXStudio") to author, preview, and ship production‑grade 3D motion inside React applications.

🚀 **[Live Demo](https://vxengine-demo.vercel.app/)**

![ZeruelNet UI Demo](assets/demo.gif)

### Key Features

#### Visual Editor ( VXStudio )
- Professional-grade timeline with Bezier keyframes and layered tracks
- Object tree, transform controls, material panels
- Detachable windows and state visualizer for your workflow

#### React Integration ( VXObjects )
- Rich component library: `<vx.mesh>`, `<vx.light>`, `<vx.scene>`, `<vx.environment>`
- Extend any component with `withVX` HOC for timeline/animation support
- Optimized Three.js renderer with post-processing pipeline
- Built on React Three Fiber with automatic state synchronization

#### Renderer ( VXRenderer )
- High-performance Three.js canvas with optimized settings
- Built-in post-processing pipeline and effects composer
- Automatic scene, camera, and object management
- Development utilities (grid, object drivers) in dev mode

#### Animation Engine
- Real-time Bezier keyframe interpolation with WASM acceleration
- Property control system with side effects and caching
- Automatic object lifecycle and state synchronization

### Examples

![BMW M4 Experience](assets/m4_experience.webp)

**[BMW M4 Experience](https://m4-experience.vercel.app/)**

![Vision Pro Experience](assets/vision_pro_experience.webp)

**[Vision Pro Experience](https://vxengine-vision-pro-experience.vercel.app/)**

### Quick start

1) Install package

```bash
npm install @vexr-labs/vxengine
```

2) Install peer dependencies

```bash
npm install react@19.0.0 react-dom@19.0.0 @react-three/fiber @react-three/drei three zustand
```

3) Create a vxengine_animations.json file in your root
This file defines your project's timelines, keyframes, and animation data.

```json
{
  "projectName": "MyProject",
  "timelines": {
    "demoTimeline":{}
  }
}
```

4) Minimal usage example:

```tsx
import { VXEngineProvider, VXStudio, VXRenderer, vxengine } from '@vexr-labs/vxengine'
import animations from './vxengine_animations.json'

vxengine
  .initialize('development')
  .loadProject(animations as any, 'MyProject')
  .setCurrentTimeline('demoTimeline')

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <VXEngineProvider animations_json={animations as any}>
      <VXStudio />
      <VXRenderer
        canvasProps={{ dpr: [1.0, 1.0], frameloop: 'always', shadows: true }}
      >
        {children}
      </VXRenderer>
    </VXEngineProvider>
  )
}
```

### Tech stack

- React 19, React Three Fiber, Three.js, Drei, Zustand
- Post‑processing, GLSL pipeline, meshline
- Vite/webpack build, TypeScript, Tailwind/Radix UI components

### Notes

- This repository includes private/proprietary engine code intended for licensed/internal use.