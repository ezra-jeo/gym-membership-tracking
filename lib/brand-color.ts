/**
 * Returns true if value is exactly #RRGGBB format.
 * Used to prevent CSS injection from user-supplied brand colors.
 */
export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

/**
 * Darkens a hex color by the given ratio (default 0.15 = 15% darker).
 * Returns a hex string.
 */
export function hexDarken(hex: string, ratio = 0.15): string {
  const safe = isValidHex(hex) ? hex : '#D4956A';
  const clampedRatio = Math.max(0, Math.min(1, ratio));

  const r = parseInt(safe.slice(1, 3), 16);
  const g = parseInt(safe.slice(3, 5), 16);
  const b = parseInt(safe.slice(5, 7), 16);

  const factor = 1 - clampedRatio;
  const dr = Math.max(0, Math.min(255, Math.round(r * factor)));
  const dg = Math.max(0, Math.min(255, Math.round(g * factor)));
  const db = Math.max(0, Math.min(255, Math.round(b * factor)));

  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`.toUpperCase();
}

/**
 * Takes a brand color hex string and returns a CSS string containing
 * the three custom property declarations for that color.
 * Falls back to Stren default #D4956A if hex is invalid.
 *
 * Usage: <style>{`:root { ${brandColorVars(gym.brand_color)} }`}</style>
 */
export function brandColorVars(hex: string, secondaryHex?: string | null): string {
  const safeHex = isValidHex(hex) ? hex.toUpperCase() : '#D4956A';
  const dark = hexDarken(safeHex);
  const safeSecondary = isValidHex(secondaryHex ?? '')
    ? (secondaryHex as string).toUpperCase()
    : hexDarken(safeHex, 0.35);
  const secondaryDark = hexDarken(safeSecondary);

  return [
    `--color-primary: ${safeHex};`,
    `--color-primary-dark: ${dark};`,
    `--color-primary-glow: ${safeHex}26;`,
    `--color-secondary: ${safeSecondary};`,
    `--color-secondary-dark: ${secondaryDark};`,
    `--color-secondary-glow: ${safeSecondary}29;`,
  ].join('\n');
}
