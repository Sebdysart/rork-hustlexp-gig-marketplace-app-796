export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export const applyColorBlindFilter = (color: string, mode: ColorBlindMode): string => {
  if (mode === 'none') return color;

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const [r, g, b] = hexToRgb(color);

  let newR = r, newG = g, newB = b;

  switch (mode) {
    case 'protanopia':
      newR = 0.567 * r + 0.433 * g;
      newG = 0.558 * r + 0.442 * g;
      newB = 0.242 * g + 0.758 * b;
      break;
    case 'deuteranopia':
      newR = 0.625 * r + 0.375 * g;
      newG = 0.7 * r + 0.3 * g;
      newB = 0.3 * g + 0.7 * b;
      break;
    case 'tritanopia':
      newR = 0.95 * r + 0.05 * g;
      newG = 0.433 * g + 0.567 * b;
      newB = 0.475 * g + 0.525 * b;
      break;
  }

  return rgbToHex(newR, newG, newB);
};

export const getAccessibleColors = (mode: ColorBlindMode) => {
  const baseColors = {
    primary: '#5271FF',
    accent: '#FFD700',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    neonCyan: '#00FFFF',
    neonMagenta: '#FF00A8',
    neonViolet: '#9B5EFF',
  };

  if (mode === 'none') return baseColors;

  return Object.fromEntries(
    Object.entries(baseColors).map(([key, color]) => [
      key,
      applyColorBlindFilter(color, mode),
    ])
  ) as typeof baseColors;
};
