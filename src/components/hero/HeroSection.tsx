import Image from 'next/image'
import { useEffect, useState, type RefObject } from 'react'
import styles from './hero.module.css'

export function HeroSection({ videoRef, revealed, backHref }: {
  videoRef: RefObject<HTMLVideoElement | null>
  revealed: boolean
  backHref: string
}) {
  const [needsPlay, setNeedsPlay] = useState(false)

  useEffect(() => {
    const media = videoRef.current
    if (!revealed || !media) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let active = true

    function sync() {
      if (!media) return
      if (motion.matches) {
        media.pause()
        setNeedsPlay(false)
      } else {
        media.muted = true
        void media.play().catch((error: unknown) => {
          if (active && !motion.matches && error instanceof DOMException && error.name === 'NotAllowedError') {
            setNeedsPlay(true)
          }
        })
      }
    }

    sync()
    motion.addEventListener('change', sync)
    return () => {
      active = false
      motion.removeEventListener('change', sync)
      media.pause()
    }
  }, [revealed, videoRef])

  return (
    <section className={styles.hero} data-revealed={revealed} inert={!revealed}>
      <div className={styles.videoViewport} aria-hidden="true">
        <video
          ref={videoRef}
          className={styles.video}
          src="/assets/videos/hero-intro.mp4"
          poster="/assets/videos/hero-intro-poster.webp"
          preload="auto"
          muted
          loop
          playsInline
          onPlaying={() => setNeedsPlay(false)}
          onError={() => setNeedsPlay(false)}
        />
      </div>

      <h1 className={styles.heading}>
        <span>Exhibition Experiences</span>{' '}
        <span>Designed To Perform</span>
      </h1>

      {needsPlay && (
        <button
          type="button"
          className={styles.playVideo}
          onClick={() => { void videoRef.current?.play().catch(() => {}) }}
        >
          Play video
        </button>
      )}

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
