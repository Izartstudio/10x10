'use client'

import { useRef, type ReactNode } from 'react'
import { createAlphabetReveal } from '@/lib/animations/alphabetReveal'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import { createLoaderTimeline } from './createLoaderTimeline'
import { CUES, MESSAGE, TERMINAL_LINES } from './loaderConfig'
import styles from './loader.module.css'

const DEBUG = process.env.NODE_ENV === 'development'
const INSPECT_TIMES = { '1': CUES.state1, '2': CUES.state2, '3': CUES.state3 }

export function IronManLoader({ children, onComplete }: {
  children: ReactNode
  onComplete: (reducedMotion: boolean) => void
}) {
  const sequence = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLElement>(null)
  const inspector = useRef<HTMLDivElement>(null)
  const slider = useRef<HTMLInputElement>(null)
  const clock = useRef<HTMLOutputElement>(null)
  const animation = useRef<ReturnType<typeof createLoaderTimeline> | null>(null)

  useGSAP(() => {
    const track = sequence.current!
    const loader = root.current!
    const params = DEBUG ? new URLSearchParams(window.location.search) : null
    const state = params?.get('loader')
    const still = state === '1' || state === '2' || state === '3' ? INSPECT_TIMES[state] : null
    const controls = params?.get('controls') === '1'
    const forceReduced = params?.get('motion') === 'reduce'
    const media = gsap.matchMedia()

    media.add({ all: 'all', reduced: '(prefers-reduced-motion: reduce)' }, (context) => {
      const reduced = context.conditions?.reduced || forceReduced

      if (reduced && still === null && !controls) {
        loader.dataset.loaderComplete = 'true'
        delete loader.dataset.booting
        onComplete(true)
        return () => { delete loader.dataset.loaderComplete }
      }

      function updateInspector(time: number) {
        if (slider.current) slider.current.value = String(time)
        if (clock.current) clock.current.textContent = `${time.toFixed(2)} s`
      }

      const terminalLines = Array.from(loader.querySelectorAll<SVGTextElement>('[data-terminal-line]'))
      const hitArea = loader.querySelector<SVGRectElement>('[data-terminal-hover]')
      const alphabetReveal = createAlphabetReveal(terminalLines, TERMINAL_LINES)
      const onTerminalHover = (event: PointerEvent) => {
        if (!reduced && event.pointerType !== 'touch' && loader.hasAttribute('data-terminal-ready')) {
          alphabetReveal.play()
        }
      }
      hitArea?.addEventListener('pointerenter', onTerminalHover)

      const timeline = createLoaderTimeline(loader, (time) => {
        if (time < CUES.state1) alphabetReveal.cancel()
        if (controls) updateInspector(time)
      })
      animation.current = timeline
      if (inspector.current) inspector.current.hidden = !controls
      delete loader.dataset.static
      delete loader.dataset.booting

      if (still !== null) timeline.pause(still, false)
      else if (reduced) timeline.pause(CUES.complete, false)
      else if (controls) timeline.play(0)
      else {
        const startScroll = context.add('startScroll', () => {
          track.dataset.scrollLed = ''
          const scrollDuration = CUES.complete - CUES.state1
          const playhead = { time: CUES.state1 }
          let targetProgress = 0
          let completed = false

          const seek = gsap.quickTo(playhead, 'time', {
            duration: 0.65,
            ease: 'expo.out',
            onUpdate: () => timeline.time(playhead.time, false),
            onComplete: () => {
              if (completed || targetProgress !== 1) return
              completed = true
              timeline.pause(CUES.complete, false)
              onComplete(false)
            },
          })

          const syncScroll = () => {
            if (completed) return
            const bounds = track.getBoundingClientRect()
            const range = bounds.height - loader.clientHeight
            if (range <= 0) return

            const distance = -bounds.top
            // The native scroll limit can round fractional viewport units.
            const progress = distance >= range - 2 ? 1 : gsap.utils.clamp(0, 1, distance / range)
            if (progress === targetProgress) return
            targetProgress = progress
            seek(CUES.state1 + progress * scrollDuration)
          }

          window.addEventListener('scroll', syncScroll, { passive: true })
          window.addEventListener('resize', syncScroll)
          syncScroll()
          return () => {
            window.removeEventListener('scroll', syncScroll)
            window.removeEventListener('resize', syncScroll)
          }
        })
        timeline.tweenTo('state1', { ease: 'none', onComplete: () => startScroll() })
      }

      return () => {
        hitArea?.removeEventListener('pointerenter', onTerminalHover)
        alphabetReveal.cancel()
        delete track.dataset.scrollLed
        animation.current = null
        delete loader.dataset.loaderComplete
        delete loader.dataset.terminalReady
        loader.dataset.static = '3'
        loader.querySelectorAll('[data-terminal-line]').forEach((line, index) => {
          line.textContent = TERMINAL_LINES[index]
        })
        const message = loader.querySelector('[data-message]')
        if (message) message.textContent = MESSAGE
      }
    })

    return () => media.revert()
  }, { scope: root, dependencies: [onComplete], revertOnUpdate: true })

  return (
    <div ref={sequence} className={styles.sequence}>
      <section ref={root} className={styles.loader} data-loader-overlay data-static="3" data-booting="" aria-label="Iron Man HUD introduction">
        {children}
        {DEBUG && (
          <div ref={inspector} className={styles.inspector} role="group" aria-label="Loader timeline inspector" hidden>
            {(['1', '2', '3'] as const).map((state) => (
              <button type="button" key={state} onClick={() => animation.current?.pause(INSPECT_TIMES[state], false)}>
                S{state}
              </button>
            ))}
            <button type="button" onClick={() => {
              const timeline = animation.current
              if (timeline?.progress() === 1) timeline.restart()
              else timeline?.play()
            }}>Play</button>
            <button type="button" onClick={() => animation.current?.pause()}>Pause</button>
            <button type="button" onClick={() => animation.current?.restart()}>Restart</button>
            <input
              ref={slider}
              type="range" min="0" max={CUES.complete} step="0.01" defaultValue="0"
              aria-label="Seek loader timeline"
              onChange={(event) => animation.current?.pause(event.currentTarget.valueAsNumber, false)}
            />
            <output ref={clock} aria-hidden="true">0.00 s</output>
          </div>
        )}
      </section>
    </div>
  )
}
