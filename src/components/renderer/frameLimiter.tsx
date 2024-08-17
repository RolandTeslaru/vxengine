import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect } from "react";

export const VXFrameLimiter = ({ maxFps = 60}) => {
    const set = useThree((state) => state.set);
    const get = useThree((state) => state.get);
    const advance = useThree((state) => state.advance);
    const frameloop = useThree((state) => state.frameloop);

    useLayoutEffect(() => {
        const initFrameloop = get().frameloop;

        return () => {
            set({ frameloop: initFrameloop });
        };
    }, []);

    useFrame((state) => {
        if (state.get().blocked) return;
        state.set({ blocked: true });

        setTimeout(() => {
            state.set({ blocked: false });

            state.advance();
        }, Math.max(0, 1000 / maxFps - state.clock.getDelta()));
    });

    useEffect(() => {
        if (frameloop !== 'never') {
            set({ frameloop: 'never' });
            advance();
        }
    }, [frameloop]);

    return null;
}
