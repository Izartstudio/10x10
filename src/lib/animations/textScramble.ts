type ScrambleOptions = {
  target: string
  characters?: string
  typeIn?: boolean
  reverse?: boolean
}

const CHARACTERS = '0123456789ABCDEF#%/+-<>'
const STEPS = 24

/**
 * Return a seekable renderer. A given progress always produces the same text,
 * including when a timeline is paused, replayed or scrubbed backwards.
 */
export function createTextScramble(
  node: SVGTextElement,
  { target, characters = CHARACTERS, typeIn = false, reverse = false }: ScrambleOptions,
) {
  const glyphs = Array.from(target)
  const alphabet = Array.from(characters || CHARACTERS)
  let lastStep = -1

  return (progress: number, force = false) => {
    const step = Math.min(STEPS, Math.max(0, Math.floor(progress * STEPS + 1e-7)))
    if (!force && step === lastStep) return
    lastStep = step

    const fraction = step / STEPS
    const amount = reverse ? 1 - fraction : fraction
    const visible = typeIn
      ? Math.ceil(glyphs.length * Math.min(1, fraction * 2.7))
      : glyphs.length
    const resolved = Math.floor(glyphs.length * amount)

    const result = glyphs.slice(0, visible).map((glyph, index) => {
      if (index < resolved || /\s/.test(glyph)) return glyph

      // Keep a small moving decode window before resolving each character.
      if (typeIn && fraction < 0.28 && index < visible - 2) return glyph

      const seed = Math.imul(step + 1, 374761393) ^ Math.imul(index + 1, 668265263)
      const mixed = Math.imul(seed ^ (seed >>> 13), 1274126177) >>> 0
      return alphabet[mixed % alphabet.length]
    }).join('')

    node.textContent = result
  }
}
