'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import { ArcReactor } from './ArcReactor'
import styles from './about.module.css'

export function WhoWeAre() {
  const root = useRef<HTMLElement>(null)

  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const opening = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
      })

      opening
        .from('[data-reactor-left]', { x: 135, opacity: 0, duration: 0.85 }, 0)
        .from('[data-reactor-right]', { x: -135, opacity: 0, duration: 0.85 }, 0)
        .from('[data-reactor-ring]', {
          scale: 0.72, svgOrigin: '498 202', opacity: 0, duration: 0.65,
        }, 0.12)
        .from('[data-reactor-core]', { opacity: 0, duration: 0.42 }, 0.85)
        .fromTo('[data-reactor-glow]', { opacity: 0 }, { opacity: 1, duration: 0.34 }, 0.95)
        .to('[data-reactor-glow]', { opacity: 0.52, duration: 0.52, ease: 'sine.out' })
    })

    return () => media.revert()
  }, { scope: root })

  return (
    <section ref={root} className={styles.section} aria-labelledby="who-we-are-title">
      <h2 id="who-we-are-title" className={styles.title}>Who We Are</h2>
      <div className={styles.reactor}><ArcReactor /></div>
      <p className={styles.copy}>
        10x10 Booths is a global exhibition partner. We design, build, and deliver exhibition environments for brands exhibiting across international markets. Built to perform, not just impress.
      </p>
    </section>
  )
}
