# VXEngine

VXEngine is a powerful, proprietary animation engine designed exclusively for use with **React Three Fiber**. Built on **Zustand**, VXEngine offers advanced timeline and keyframe management features tailored for professional-grade 3D animations. This project is private and intended for commercial use only, with no public access or free versions.

## Features

- **React Three Fiber Integration**: Seamlessly animate 3D objects in your scenes using React Three Fiber.
- **Advanced Timeline Editor**: Provides an intuitive timeline for creating and editing keyframe animations.
- **Custom Tracks for Properties**: Animate position, rotation, scale, and material attributes with individual keyframes.
- **Bezier Curve Keyframes**: Fine-tune animations with customizable Bezier curve handles for smooth transitions.
- **Drag-and-Drop Keyframe Editing**: Easily adjust keyframe timings and values via the editor interface.
- **Zustand-Based State Management**: Uses Zustand to efficiently manage animation states, ensuring optimal performance.
- **Handle-Based Interpolation**: Supports linear and custom curve-based interpolations for precise control over animations.
- **Optimized for Real-Time Playback**: Designed to handle complex 3D animations with real-time playback and minimal performance overhead.

## Installation

As VXEngine is a private project, installation is restricted. If you are a licensed user, you will have access to the repository and installation instructions.

### Installation (For Licensed Users Only)

To install VXEngine, access the private repository and install the package via your preferred package manager:

```bash
npm install vxengine-private @react-three/fiber zustand
```

Or using Yarn:

```bash
yarn add vxengine-private @react-three/fiber zustand
```

## Getting Started

### Initialization

To start using VXEngine with React Three Fiber and Zustand in your 3D project:

```tsx
import { Canvas } from '@react-three/fiber';
import { VXEngineProvider, useVXEngine } from 'vxengine-private';

const App = () => {
  const { engine } = useVXEngine();

  useEffect(() => {
    // Load timeline and animation data
    engine.loadTimelineFromJSON(timelineData);
  }, [engine]);

  return (
    <VXEngineProvider>
      <Canvas>
        {/* Your 3D scene goes here */}
      </Canvas>
    </VXEngineProvider>
  );
};

export default App;
```

### Keyframe and Track Management

Use the VXEngine API to control tracks and keyframes:

```tsx
const { engine } = useVXEngine();

const addKeyframe = () => {
  engine.addKeyframe({
    trackKey: 'position.x',
    time: 1,
    value: 2,
    handles: {
      in: { x: 0, y: 0 },
      out: { x: 1, y: 1 },
    },
  });
};
```

## Key Concepts

- **Tracks**: A track represents a property (e.g., position, rotation, scale) of an object. Each track contains keyframes that define how the property changes over time.
- **Keyframes**: Define the value of a property at a specific time in the timeline. Keyframes can use Bezier handles for smooth transitions.
- **Handles**: Handles control the Bezier curve for interpolation between keyframes, offering precise control over motion and easing.
  
## Licensing and Access

VXEngine is a **private and proprietary** software package. Only licensed users are allowed access to the source code and usage rights. **Unauthorized distribution, duplication, or sharing is strictly prohibited**.

If you are interested in purchasing a license or accessing VXEngine, please contact us at [your-contact-email] to discuss licensing options and pricing.

## Contributing

Since VXEngine is a private project, contributions are limited to licensed users and authorized developers. If you encounter issues or would like to suggest features, please reach out to the development team directly.

## License

VXEngine is licensed under a proprietary license. Usage is restricted to licensed users only. Unauthorized access or use is prohibited.

---

This README makes it clear that VXEngine is a private, monetized project with limited access.
