const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const GLYPH_STEP_MS = 21

export function createAlphabetReveal(rows: readonly (HTMLElement | SVGElement)[], lines: readonly string[]) {
  const lastStep = Math.max(0, ...lines.flatMap((line) => Array.from(line, (glyph) =>
    /[0-9]/.test(glyph) ? Number(glyph) : ALPHABET.indexOf(glyph.toUpperCase()),
  )))
  let frame = 0

  function cancel() {
    cancelAnimationFrame(frame)
  }

  function play() {
    cancel()
    const started = performance.now()
    let previousStep = -1

    function update(now: number) {
      const step = Math.min(lastStep, Math.floor(Math.max(0, now - started) / GLYPH_STEP_MS))
      if (step !== previousStep) {
        previousStep = step
        rows.forEach((row, index) => {
          const target = lines[index]
          row.textContent = step === lastStep ? target : target.replace(/[A-Za-z0-9]/g, (glyph) => {
            if (/[0-9]/.test(glyph)) return String(Math.min(step, Number(glyph)))
            const upper = glyph.toUpperCase()
            const letter = ALPHABET[Math.min(step, ALPHABET.indexOf(upper))]
            return glyph === upper ? letter : letter.toLowerCase()
          })
        })
      }
      if (step < lastStep) frame = requestAnimationFrame(update)
    }

    update(started)
  }

  return { play, cancel }
}
