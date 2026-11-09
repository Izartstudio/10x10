'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import { HelmetArtwork } from '@/components/loader/HelmetArtwork'
import styles from './clients.module.css'

export function WhyClientsComeBack() {
  const root = useRef<HTMLElement>(null)

  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: { trigger: '[data-client-grid]', start: 'top 86%', once: true },
      })
        .from('[data-client-bar]', { scaleY: 0, duration: 0.28, stagger: 0.035 }, 0)
        .from('[data-client-map]', { opacity: 0, duration: 0.75 }, 0.1)
        .from('[data-client-chart]', { clipPath: 'inset(0 100% 0 0)', duration: 0.85 }, 0.15)
        .from('[data-client-orbit]', { scale: 0.8, opacity: 0, duration: 0.6 }, 0.25)
    })

    return () => media.revert()
  }, { scope: root })

  return (
    <section ref={root} className={styles.section} aria-labelledby="why-clients-title">
      <svg className={styles.helmet} viewBox="566 222 309 468" aria-hidden="true" focusable="false">
        <HelmetArtwork />
      </svg>
      <header className={styles.intro}>
        <h2 id="why-clients-title">Why Clients Come Back</h2>
        <p>Over a decade of exhibitions across five continents. Consistent delivery is not something we promise, it is something we have proven.</p>
      </header>

      <div className={styles.grid} data-client-grid>
        <article className={`${styles.card} ${styles.years} ${styles.corners}`}>
          <h3 className={styles.number}>10+ Years</h3>
          <p>Years of Experience</p>
          <div className={styles.bars} aria-hidden="true">
            {Array.from({ length: 17 }, (_, index) => (
              <span key={index} data-client-bar style={{ opacity: 1 - index / 17 }} />
            ))}
          </div>
        </article>

        <article className={`${styles.card} ${styles.exhibitions}`}>
          <Image className={styles.map} data-client-map src="/assets/images/clients/world-map.png" alt="" width={487} height={325} unoptimized />
          <h3 className={styles.number}>200+</h3>
          <p>Exhibitions across US,<br />Europe, Africa, Asia,<br />UAE &amp; Saudi Arabia</p>
        </article>

        <article className={`${styles.card} ${styles.booth} ${styles.corners}`}>
          <h3>Booth, graphics,<br />AV, furniture, &amp;<br />Tech</h3>
          <p>Built By The Same Team</p>
          <Image className={styles.boothImage} src="/assets/images/clients/booth.avif" alt="" width={1248} height={832} unoptimized />
        </article>

        <article className={`${styles.card} ${styles.pavilions} ${styles.corners}`}>
          <h3>US Country Pavilions Managed</h3>
          <p className={styles.number}>75+</p>
          <svg className={styles.chart} data-client-chart viewBox="0 0 420 214" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="clients-growth" x2="0" y2="1">
                <stop stopColor="#fff5f1" />
                <stop offset=".42" stopColor="#ff2c00" />
                <stop offset="1" stopColor="#9e1600" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 188 56 162 81 176 198 123 272 103 312 55 374 34 420 0V214H0Z" fill="url(#clients-growth)" />
          </svg>
        </article>

        <article className={`${styles.card} ${styles.team}`}>
          <svg className={styles.teamFrame} viewBox="0 0 530 343" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path d="M2 15 31 2H138L146 7H183L205 15H329L352 7H376L385 2H498L528 12V72L508 85V245L521 257V330L509 341H438L425 331H101L92 341H21L8 331V258L22 248V85L2 72Z" fill="#450800" fillOpacity=".42" stroke="#930e07" strokeWidth="3" />
          </svg>
          <h3>One Team Across<br />All Markets</h3>
          <div className={styles.orbit} data-client-orbit aria-hidden="true">
            <svg viewBox="0 0 240 240" focusable="false">
              <circle cx="120" cy="120" r="116" opacity=".2" />
              <circle cx="120" cy="120" r="91" opacity=".42" />
              <circle cx="120" cy="120" r="69" opacity=".72" />
              <circle cx="120" cy="120" r="47" />
              <circle className={styles.node} cx="107" cy="29" r="3" />
              <circle className={styles.node} cx="137" cy="185" r="3" />
            </svg>
            <span />
          </div>
          <p>No Vendor Coordination Chaos</p>
        </article>
      </div>
    </section>
  )
}
