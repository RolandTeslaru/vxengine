export const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;

    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => l - a * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1);

    return {
        r: f(0),
        g: f(8),
        b: f(4),
    };
};