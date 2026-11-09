import Image from 'next/image'
import type { RefObject } from 'react'
import styles from './hero.module.css'

export function HeroSection({ videoRef, revealed, backHref }: {
  videoRef: RefObject<HTMLVideoElement | null>
  revealed: boolean
  backHref: string
}) {
  return (
    <section className={styles.hero} data-revealed={revealed} inert={!revealed}>
      <div className={styles.videoViewport} aria-hidden="true">
        <video
          ref={videoRef}
          className={styles.video}
          src="/assets/videos/hero-intro.mp4"
          preload="auto"
          muted
          loop
          playsInline
          onError={(event) => { event.currentTarget.hidden = true }}
        />
      </div>

      <h1 className={styles.heading}>
        <span>Exhibition Experiences</span>{' '}
        <span>Designed To Perform</span>
      </h1>

      <header className={styles.header}>
        <Image
          className={styles.logo}
          src="/assets/svg/10x10-booths-wordmark.svg"
          alt="10x10 Booths"
          width={145}
          height={51}
          unoptimized
        />
        <nav aria-label="Website">
          <a className={styles.backLink} href={backHref}>
            <svg viewBox="0 0 15 15" width="15" height="15" fill="none" aria-hidden="true">
              <path d="m9.5 2-5 5.5 5 5.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Website
            <span className={styles.corner} aria-hidden="true" />
            <span className={styles.corner} aria-hidden="true" />
            <span className={styles.corner} aria-hidden="true" />
            <span className={styles.corner} aria-hidden="true" />
          </a>
        </nav>
      </header>
    </section>
  )
}
