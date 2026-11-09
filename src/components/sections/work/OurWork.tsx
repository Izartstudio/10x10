'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { useLoopingRail } from '@/hooks/useLoopingRail'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import styles from './work.module.css'

const PROJECTS = [1, 3, 4, 2, 5, 6, 7, 8, 9, 10, 11, 12]

export function OurWork() {
  const root = useRef<HTMLElement>(null)
  const { carousel, viewport, rail, move, isPaused, togglePause } = useLoopingRail()

  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('[data-work-copy]', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
      })
    })
    return () => media.revert()
  }, { scope: root })

  return (
    <section ref={root} className={styles.section} aria-labelledby="work-title">
      <div className={styles.diagnostics} aria-hidden="true">
        <span>{'926.78.3301\n676.47.4447\n955.96.7414\n795.27.1701\n---------------\n532.44.9533\n962.79.1011'}</span>
        <span>{'(ICVSM)-1011\nLDA--54685--L8\n---------------\nSTA-/A1+1\nA1-/3C\nA1-/3E\nA4--SC311\n---------------\n---------------'}</span>
      </div>
      <header className={styles.copy}>
        <h2 id="work-title" data-work-copy>Our Work</h2>
        <p data-work-copy>Discover the stands we have built in past projects</p>
      </header>
      <div ref={carousel} className={styles.carousel} role="group" aria-label="Exhibition stand projects">
        <div className={styles.frame} aria-hidden="true">
          {[0, 1].map((side) => (
            <svg key={side} viewBox="0 0 189 163" focusable="false">
              <path d="M.5 162V47L50.5.5H189" stroke="currentColor" fill="none" />
              <path d="M.5 47 50.5.5v7L7 47Z" fill="currentColor" />
            </svg>
          ))}
        </div>
        <button type="button" className={styles.arrow} aria-label="Previous project" onClick={() => move.current?.(-1)}>←</button>
        <div ref={viewport} className={styles.viewport}>
          <div ref={rail} className={styles.rail}>
            {[0, 1].map((copy) => (
              <ul key={copy} className={styles.group} aria-hidden={copy === 1 || undefined}>
                {PROJECTS.map((id, index) => (
                  <li key={id} className={styles.card}>
                    <Image src={`/assets/images/work/booth-${id}.avif`} alt={copy ? '' : `Exhibition stand project ${index + 1}`} fill unoptimized draggable={false} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <button type="button" className={styles.arrow} aria-label="Next project" onClick={() => move.current?.(1)}>→</button>
        <button type="button" className={styles.pause} aria-pressed={isPaused} onClick={togglePause}>Pause project motion</button>
      </div>
    </section>
  )
}
