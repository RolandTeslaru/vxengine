 import { extend, useThree } from "@react-three/fiber"
import { EffectConstructor, EffectProps } from "@react-three/postprocessing"
import React from "react"

let i = 0
const components = new WeakMap<EffectConstructor, React.ExoticComponent<any> | string>()

 export const wrapEffectWithoutRef = <T extends EffectConstructor>(effect: T, defaults?: EffectProps<T>) =>
    /* @__PURE__ */ function Effect({ blendFunction = defaults?.blendFunction, opacity = defaults?.opacity,...props }) {
      let Component = components.get(effect)
      if (!Component) {
        const key = `@react-three/postprocessing/${effect.name}-${i++}`
        extend({ [key]: effect })
        components.set(effect, (Component = key))
      }
  
      const camera = useThree((state) => state.camera)
      const args = React.useMemo(
        () => [...(defaults?.args ?? []), ...(props.args ?? [{ ...defaults, ...props }])],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props]
      )
  
      return (
        <Component
          camera={camera}
          blendMode-blendFunction={blendFunction}
          blendMode-opacity-value={opacity}
          {...props}
          args={args}
        />
      )
    }
  