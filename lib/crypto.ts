function secureRandomSuffix(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''

  while (result.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2))
    for (const byte of bytes) {
      // Avoid modulo bias
      if (byte < 256 - (256 % chars.length)) {
        result += chars[byte % chars.length]
        if (result.length === length) break
      }
    }
  }

  return result
}

/**
 * Cryptographically secure gym code generator.
 * Format: "IRON-X7K2" — no Math.random().
 */
export function generateGymCode(gymName: string): string {
  const prefix = gymName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase()
  const suffix = secureRandomSuffix(4)
  return `${prefix}-${suffix}`
}
