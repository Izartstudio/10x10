'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animations/gsap'
import { HudMicroText } from '@/components/layout/HudMicroText'
import { usePageVideo } from '@/lib/pageVideos'
import styles from './process.module.css'

const STEPS = [
  ['Understand', 'What are your prime objectives?'],
  ['Design', "We design around your objectives, not around what we've built before."],
  ['Build', 'Precision fabrication aligned to strategy.'],
  ['Deliver', 'What was agreed is what shows up.'],
] as const

const FRAME_COUNT = 241
const FRAMES_PER_STEP = 60
const FPS = 30

export function HowWeWork() {
  const videoSource = usePageVideo('process')
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)

  useGSAP(() => {
    const section = root.current
    const film = video.current
    const scrollTrack = track.current
    if (!section || !film || !scrollTrack) return

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      section.dataset.motion = ''
      const playhead = { frame: 0 }
      let desiredFrame = 0
      let requestedFrame = -1
      let activeStep = 0
      let frameCallback: number | undefined
      section.dataset.step = '0'

      function syncCard(mediaTime: number) {
        if (!section) return
        const frame = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(mediaTime * FPS)))
        const step = Math.min(STEPS.length - 1, Math.floor(frame / FRAMES_PER_STEP))
        if (step !== activeStep) {
          activeStep = step
          section.dataset.step = String(step)
        }
      }

      function renderFrame() {
        if (!film || film.error || film.readyState < HTMLMediaElement.HAVE_METADATA || film.seeking) return
        if (desiredFrame === requestedFrame) return
        requestedFrame = desiredFrame
        film.currentTime = (desiredFrame + 0.25) / FPS
      }

      function update() {
        desiredFrame = Math.round(playhead.frame)
        renderFrame()
      }

      const supportsFrameCallback = typeof film.requestVideoFrameCallback === 'function'
      function onPresentedFrame(_: number, metadata: VideoFrameCallbackMetadata) {
        if (!film) return
        syncCard(metadata.mediaTime)
        frameCallback = film.requestVideoFrameCallback(onPresentedFrame)
      }

      function onSeeked() {
        if (!film) return
        if (!supportsFrameCallback) syncCard(film.currentTime)
        renderFrame()
      }

      if (supportsFrameCallback) frameCallback = film.requestVideoFrameCallback(onPresentedFrame)

      // A paused video has one seek in flight. Apply the latest target when it finishes.
      film.addEventListener('loadedmetadata', renderFrame)
      film.addEventListener('loadeddata', renderFrame)
      film.addEventListener('seeked', onSeeked)
      const preload = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return
        film.preload = 'auto'
        if (film.readyState === HTMLMediaElement.HAVE_NOTHING && !film.error) film.load()
        preload.disconnect()
      }, { rootMargin: '100% 0px' })
      preload.observe(section)

      const animation = gsap.to(playhead, {
        frame: FRAME_COUNT - 1,
        ease: 'none',
        paused: true,
        onUpdate: update,
      })
      ScrollTrigger.create({
        trigger: scrollTrack,
        animation,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.15,
        onRefresh: update,
      })
      update()

      return () => {
        preload.disconnect()
        film.removeEventListener('loadedmetadata', renderFrame)
        film.removeEventListener('loadeddata', renderFrame)
        film.removeEventListener('seeked', onSeeked)
        if (frameCallback !== undefined) film.cancelVideoFrameCallback(frameCallback)
        film.preload = 'none'
        delete section.dataset.motion
        delete section.dataset.step
      }
    })

    return () => media.revert()
  }, { scope: root })

  return (
    <section ref={root} className={styles.section} aria-labelledby="how-we-work-title">
      <div className={styles.intro}>
        <div className={styles.heading}>
          <p>Partner from strategy to flawless execution</p>
          <h2 id="how-we-work-title">How We Work</h2>
        </div>
        <div className={styles.status} aria-hidden="true">
          <svg viewBox="0 0 470 37" focusable="false">
            <path d="M0 20H441V1H470V36H410L392 20H372L386 36H149L126 20Z" fill="currentColor" />
            <path d="M142 4H411M0 20H442" stroke="currentColor" strokeWidth="2" />
          </svg>
          <HudMicroText as="p">Active Status</HudMicroText>
          <HudMicroText as="pre">{'[ICVSM]-1011\nLDA--54685--L8\n----------------\nSTA-/A1+1\nA1-/3C\nA1-/3E\nA4--SC311'}</HudMicroText>
        </div>
      </div>
      <div ref={track} className={styles.track}>
        <div className={styles.stage}>
          <ol className={styles.steps}>
            {STEPS.map(([title, description], index) => (
              <li key={title} className={styles.step} data-step-card={index}>
                <svg className={styles.card} viewBox="0 0 322 220" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                  <path d="M1 9 20 1H85L89 4H111L125 9H198L212 4H228L234 1H304L321 7V46L308 53V155L316 162V209L309 216H265L258 210H62L55 218H14L5 210V164L13 157V53L1 46Z" fill="#9c190d" fillOpacity=".23" stroke="#a71d0e" strokeWidth="2" />
                  <path d="M5 205H249V213H61L55 219H14L5 212Z" fill="#ef0b00" />
                </svg>
                <div className={styles.stepCopy}>
                  <HudMicroText as="p" className={styles.number}>{`// 0${index + 1}`}</HudMicroText>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className={styles.scenery} aria-hidden="true">
            <video
              ref={video}
              className={styles.film}
              src={videoSource}
              poster="/assets/videos/booth-assembly-poster.jpg"
              preload="none"
              muted
              playsInline
              onError={(event) => { event.currentTarget.hidden = true }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
