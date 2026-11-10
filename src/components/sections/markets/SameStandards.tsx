'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import styles from './markets.module.css'

export function SameStandards() {
  const root = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)

  useGSAP(() => {
    const globe = video.current
    if (!globe) return

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('[data-markets-intro]', {
        yPercent: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
      })

      const visibility = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          void globe.play().catch(() => {})
        } else {
          globe.pause()
        }
      }, { threshold: 0.15 })
      visibility.observe(globe)

      return () => {
        visibility.disconnect()
        globe.pause()
      }
    })

    return () => media.revert()
  }, { scope: root })

  return (
    <section ref={root} className={styles.section} aria-labelledby="same-standards-title">
      <div className={styles.layout}>
        <header className={styles.header}>
          <svg className={styles.frame} viewBox="0 0 1340 92" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path d="M0 91 94 1H388m564 0h294l94 90" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M30 62 94 1h115l-7 7h-98L45 62Zm1280 0-64-61h-115l7 7h98l59 54Z" fill="currentColor" />
          </svg>
          <h2 id="same-standards-title" data-markets-intro>Same Standards. Every Market.</h2>
          <p data-markets-intro>
            Las Vegas, Orlando, Paris, Berlin, London, Dubai, Singapore, Tokyo, Riyadh, Amsterdam, Frankfurt, Cologne, Milan and beyond.
            <br />{' '}One team manages the whole programme. The standard never changes.
          </p>
        </header>

        <div className={styles.globe} aria-hidden="true">
          <video
            ref={video}
            src="/assets/videos/markets-globe-dark.mp4"
            poster="/assets/videos/markets-globe-dark-poster.jpg"
            preload="none"
            muted
            loop
            playsInline
            onError={(event) => { event.currentTarget.hidden = true }}
          />
        </div>
      </div>
    </section>
  )
}
