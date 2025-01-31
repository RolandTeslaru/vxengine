import { hsl, hex } from "./types";

export function hslToHex({ h, s, l }: hsl) {
    s /= 100;
    l /= 100;
  
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1);
    let r = Math.round(255 * f(0));
    let g = Math.round(255 * f(8));
    let b = Math.round(255 * f(4));
  
    const toHex = (x: number) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
  
    return `${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }
  
  function hexToHsl({ hex }: hex): hsl {
    // Ensure the hex string is formatted properly
    hex = hex.replace(/^#/, "");
  
    // Handle 3-digit hex
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }
  
    // Pad with zeros if incomplete
    while (hex.length < 6) {
      hex += "0";
    }
  
    // Convert hex to RGB
    let r = parseInt(hex.slice(0, 2), 16) || 0;
    let g = parseInt(hex.slice(2, 4), 16) || 0;
    let b = parseInt(hex.slice(4, 6), 16) || 0;
  
    // Then convert RGB to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s: number;
    let l = (max + min) / 2;
  
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
      h *= 360;
    }
  
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }