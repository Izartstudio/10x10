'use client'

import { useEffect, useRef } from 'react'
import { createAlphabetReveal } from '@/lib/animations/alphabetReveal'
import styles from './site-footer.module.css'

const LINES = [
  '[ICVSM]-1011',
  'LDA--54685--L8',
  '----------------',
  'STA-/A1+1',
  'A1-/3C',
  'A1-/3E',
  'A4--SC311',
  '----------------',
  '----------------',
]
export function FooterHudText() {
  const text = useRef<SVGTextElement>(null)
  const reveal = useRef<ReturnType<typeof createAlphabetReveal> | null>(null)

  useEffect(() => {
    const rows = Array.from(text.current!.querySelectorAll('tspan'))
    const animation = createAlphabetReveal(rows, LINES)
    reveal.current = animation
    return () => {
      animation.cancel()
      reveal.current = null
    }
  }, [])

  function play(event: React.PointerEvent<SVGRectElement>) {
    if (event.pointerType !== 'touch' &&
        window.matchMedia('(prefers-reduced-motion: no-preference)').matches) reveal.current?.play()
  }

  return (
    <svg className={styles.hudText} viewBox="0 0 1440 763" aria-hidden="true">
      <text ref={text} x="496" y="98">
        {LINES.map((line, index) => (
          <tspan key={index} x="496" dy={index === 0 ? 0 : 12}>{line}</tspan>
        ))}
      </text>
      <rect className={styles.hudHitArea} x="491" y="86" width="83" height="208" onPointerEnter={play} />
    </svg>
  )
}
