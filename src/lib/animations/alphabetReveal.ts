const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LETTER_STEP_MS = 21

export function createAlphabetReveal(rows: readonly SVGElement[], lines: readonly string[]) {
  let frame = 0

  function cancel() {
    cancelAnimationFrame(frame)
  }

  function play() {
    cancel()
    const started = performance.now()

    function update(now: number) {
      const step = Math.floor(Math.max(0, now - started) / LETTER_STEP_MS)
      const complete = step >= ALPHABET.length - 1
      rows.forEach((row, index) => {
        const target = lines[index]
        row.textContent = complete ? target : target.replace(/[A-Z]/g, (letter) =>
          ALPHABET[Math.min(step, ALPHABET.indexOf(letter))],
        )
      })
      if (!complete) frame = requestAnimationFrame(update)
    }

    update(started)
  }

  return { play, cancel }
}
