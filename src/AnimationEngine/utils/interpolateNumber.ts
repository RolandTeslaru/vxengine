import { cubicBezier, solveCubicBezierT } from "./cubicBezier";

export const js_interpolateNumber = (
    startValue: number,
    endValue: number,
    startHandleX: number,
    startHandleY: number,
    endHandleX: number,
    endHandleY: number,
    progress: number
) => {
    const p0: { x: number, y: number } = { x: 0, y: startValue };
    const p1: { x: number, y: number } = {
      x: startHandleX,
      y: startValue + startHandleY * (endValue - startValue),
    };
    const p2: { x: number, y: number } = {
      x: endHandleX,
      y: startValue + endHandleY * (endValue - startValue),
    };
    const p3: { x: number, y: number } = { x: 1, y: endValue };

    if ( // Special case for linear interpolation
      startHandleX === 0.3 && startHandleY === 0.3 &&
      endHandleX === 0.7 && endHandleY === 0.7
    ) {
      return startValue + (endValue - startValue) * progress;
    }

    const t = solveCubicBezierT(p0.x, p1.x, p2.x, p3.x, progress);
    const JS_interpolatedValue = cubicBezier(p0.y, p1.y, p2.y, p3.y, t);

    return JS_interpolatedValue
}