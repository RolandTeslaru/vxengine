import { useRefStore } from "@vxengine/utils";

export const computeScrollLeft = (delta: number) => {
    const scrollLeft = useRefStore.getState().scrollLeftRef.current
    const data = scrollLeft + delta;

    useRefStore.getState().scrollLeftRef.current = scrollLeft + delta
}