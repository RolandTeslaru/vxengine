'use client'

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect } from "react";

// TODO: Fix this 
export const VXFrameLimiter = ({ maxFps = 30}) => {
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

    useFrame((state: any) => {
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
            // @ts-expect-error
            advance();
        }
    }, [frameloop]);

    return null;
}
