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
const NUMERIC_LINES = [
  '926.78.3301',
  '676.47.4447',
  '955.96.7414',
  '795.27.1701',
  '---------------',
  '532.44.9533',
  '962.79.1011',
]
const STATUS = 'ACTIVE STATUS'

export function FooterHudText() {
  const root = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const groups = root.current?.querySelectorAll('g[data-footer-diagnostics]')
    if (!groups) return
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)')
    const cleanups = Array.from(groups, (group) => {
      const rows = Array.from(group.querySelectorAll<SVGTSpanElement>('tspan'))
      const hitArea = group.querySelector('rect')
      const reveal = createAlphabetReveal(rows, rows.map((row) => row.textContent ?? ''))
      const play = (event: PointerEvent) => {
        if (event.pointerType !== 'touch' && motion.matches) reveal.play()
      }
      hitArea?.addEventListener('pointerenter', play)
      return () => {
        hitArea?.removeEventListener('pointerenter', play)
        reveal.cancel()
      }
    })
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [])

  return (
    <svg ref={root} className={styles.hudText} viewBox="0 0 1440 763" aria-hidden="true">
      <g data-footer-diagnostics>
        <text x="496" y="98">
          {LINES.map((line, index) => (
            <tspan key={index} x="496" dy={index === 0 ? 0 : 12}>{line}</tspan>
          ))}
        </text>
        <text x="499" y="218">
          {NUMERIC_LINES.map((line, index) => (
            <tspan key={index} x="499" dy={index === 0 ? 0 : 12}>{line}</tspan>
          ))}
        </text>
        <rect className={styles.hudHitArea} x="491" y="86" width="83" height="208" />
      </g>
      <g data-footer-diagnostics>
        <path d="M1284 424H1328" stroke="white" strokeWidth=".65" strokeDasharray="2.3 .8" />
        <text x="1390" y="426" textAnchor="end" fill="white" fontSize="8">
          <tspan>{STATUS}</tspan>
        </text>
        <rect className={styles.hudHitArea} x="1282" y="416" width="110" height="14" />
      </g>
    </svg>
  )
}
