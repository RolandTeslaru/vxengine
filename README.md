## VXEngine (Monorepo)

VXEngine is a React Three Fiber powered 3D animation engine and editor. It combines a runtime renderer, a timeline/keyframe animation system, and a desktop‑like editor UI ("VXStudio") to author, preview, and ship production‑grade 3D motion inside React applications.

🚀 **[Live Demo](https://vxengine-demo.vercel.app/)**

![ZeruelNet UI Demo](assets/demo.gif)

### Purpose

- **Single toolchain for 3D motion in React**: Author animations visually, manage objects/camera/effects, and render in the same runtime you deploy.
- **Timeline‑driven workflow**: Keyframes with Bezier handles, layered tracks, snapping and scrubbing for precise control.
- **Declarative JSX scene building**: Use `<vx.mesh>`, `<vx.light>`, `<vx.camera>` components to build 3D scenes with familiar declarative React patterns instead of imperative Three.js code.

### What it does

- **Editor UI (VXStudio)**: Timeline editor, object tree, transform controls, material panels, state visualizer, detachable windows.
- **Runtime Renderer (VXRenderer)**: High‑level R3F canvas with effects composer, camera/object drivers, and a small JSX DSL for scene nodes.
- **Animation Engine**: Loads timelines from JSON, plays back with real‑time interpolation, integrates with engine managers (objects, camera, effects, UI).

### Examples

![BMW M4 Experience](assets/m4_experience.webp)

**[BMW M4 Experience](https://m4-experience.vercel.app/)**

![Vision Pro Experience](assets/m4_experience.webp)

**[Vision Pro Experience](https://vxengine-vision-pro-experience.vercel.app/)**

### Quick start (dev website)

1) Install deps (monorepo workspaces):

```bash
npm i
```

2) Run the demo site:

```bash
cd packages/dev-website
npm run dev
```

3) Minimal usage example (from the dev website layout):

```tsx
import { VXEngineProvider, VXStudio, VXRenderer, vxengine } from 'vxengine'
import animations from './vxengine_animations.json'

vxengine
  .initialize('development')
  .loadProject(animations as any, 'DemoWebsite')
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