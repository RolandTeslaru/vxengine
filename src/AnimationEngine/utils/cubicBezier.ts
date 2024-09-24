// bezier.ts

export interface Point {
    x: number;
    y: number;
  }
  
  /**
   * Computes the cubic Bézier value for a given t.
   * @param p0 - The start point coordinate (x or y).
   * @param p1 - The first control point coordinate (x or y).
   * @param p2 - The second control point coordinate (x or y).
   * @param p3 - The end point coordinate (x or y).
   * @param t - The parameter t, where 0 <= t <= 1.
   * @returns The computed coordinate value at t.
   */
  export function cubicBezier(
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    t: number
  ): number {
    const u = 1 - t;
    return (
      u ** 3 * p0 +
      3 * u ** 2 * t * p1 +
      3 * u * t ** 2 * p2 +
      t ** 3 * p3
    );
  }
  
  /**
   * Computes the derivative of the cubic Bézier function at t.
   * @param p0 - The start point coordinate (x or y).
   * @param p1 - The first control point coordinate (x or y).
   * @param p2 - The second control point coordinate (x or y).
   * @param p3 - The end point coordinate (x or y).
   * @param t - The parameter t, where 0 <= t <= 1.
   * @returns The derivative value at t.
   */
  export function cubicBezierDerivative(
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    t: number
  ): number {
    const u = 1 - t;
    return (
      3 * u ** 2 * (p1 - p0) +
      6 * u * t * (p2 - p1) +
      3 * t ** 2 * (p3 - p2)
    );
  }
  
  /**
   * Solves for t in the cubic Bézier function given x.
   * @param p0 - The x-coordinate of the start point.
   * @param p1 - The x-coordinate of the first control point.
   * @param p2 - The x-coordinate of the second control point.
   * @param p3 - The x-coordinate of the end point.
   * @param x - The target x value (progress).
   * @param epsilon - The acceptable error margin.
   * @param maxIterations - The maximum number of iterations.
   * @returns The parameter t corresponding to the given x.
   */
  export function solveCubicBezierT(
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    x: number,
    epsilon = 1e-6,
    maxIterations = 10
  ): number {
    let t = x; // Initial guess
    for (let i = 0; i < maxIterations; i++) {
      const x_t = cubicBezier(p0, p1, p2, p3, t);
      const dx_dt = cubicBezierDerivative(p0, p1, p2, p3, t);
  
      const error = x_t - x;
      if (Math.abs(error) < epsilon) {
        return t;
      }
      if (dx_dt === 0) {
        break; // Prevent division by zero
      }
      t -= error / dx_dt;
    }
    return t;
  }