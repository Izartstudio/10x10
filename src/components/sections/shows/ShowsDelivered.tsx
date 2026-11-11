'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import { useLoopingRail } from '@/hooks/useLoopingRail'
import styles from './shows.module.css'

const LOGOS = ['09', '10', '11', '12', '13', '01', '02', '03', '04', '05', '06', '07', '08']
const TICKS = Array.from({ length: 91 }, (_, index) => `M${index * 13 + 1} 0v${index % 5 === 1 ? 36 : 16}`).join(' ')

export function ShowsDelivered() {
  const root = useRef<HTMLElement>(null)
  const { viewport, rail } = useLoopingRail()

  useGSAP(() => {
    const section = root.current
    if (!section) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      })
        .from('[data-shows-ruler]', { clipPath: 'inset(0 100% 0 0)', duration: 0.9, ease: 'power2.out' }, 0)
        .from('[data-shows-copy]', { yPercent: 30, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, 0.12)
    })

    return () => media.revert()
  }, { scope: root })

  return (
    <section ref={root} className={styles.section} aria-labelledby="shows-title">
      <svg className={styles.ruler} data-shows-ruler viewBox="0 0 1174 37" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d={TICKS} stroke="currentColor" strokeWidth="2.5" />
      </svg>
      <div className={styles.copy}>
        <h2 id="shows-title" data-shows-copy>Shows We&apos;ve Delivered Across the World</h2>
        <p data-shows-copy>CES, Con Expo, NRF, IMTS, Big 5 Global, METS Trade, SIAL, Gulfood, GITEX, Milipol, Dubai Boat Show and dozens of others around the world.</p>
      </div>
      <div className={styles.carousel} role="group" aria-label="Exhibition show logos">
        <div ref={viewport} className={styles.viewport}>
          <div ref={rail} className={styles.rail}>
            {[0, 1].map((copy) => (
              <div key={copy} className={styles.logoGroup} aria-hidden="true">
                {LOGOS.map((id) => (
                  <div key={id} className={styles.logo} data-logo-id={id}>
                    <Image src={`/assets/images/shows/${id}.svg`} alt="" fill draggable={false} unoptimized />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <svg className={styles.frame} viewBox="0 0 1328 196" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M1 148 400 99 467 0M1327 148 928 99 861 0M1 187 664 104 1327 193" stroke="currentColor" strokeWidth="5" fill="none" />
        <path d="M135 132 147 116 325 94 340 105ZM1193 132 1181 116 1003 94 988 105ZM338 145 664 102 942 140 890 168 765 151 664 142 554 151 389 172Z" fill="currentColor" />
      </svg>
    </section>
  )
}
