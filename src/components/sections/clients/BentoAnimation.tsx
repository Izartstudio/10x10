'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import type { AnimationItem } from 'lottie-web'
import styles from './clients.module.css'

export function BentoAnimation({ name, className, children, loop = false, stretch = false }: {
  name: 'World-Map-Bento' | 'Line-Bento' | 'Bento-Logo'
  className: string
  children: ReactNode
  loop?: boolean
  stretch?: boolean
}) {
  const root = useRef<HTMLDivElement>(null)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrapper = root.current
    const player = container.current
    if (!wrapper || !player) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animation: AnimationItem | undefined
    let visible = false
    let ready = false
    let requested = false
    let disposed = false

    function sync() {
      if (ready) {
        if (visible && !motion.matches) animation?.play()
        else animation?.pause()
      } else if (visible && !motion.matches && !requested) {
        requested = true
        void load()
      }
    }

    async function load() {
      try {
        const { default: lottie } = await import('lottie-web/build/player/lottie_svg')
        if (disposed || !player || !wrapper) return
        const rendererSettings = {
          preserveAspectRatio: stretch ? 'none' : 'xMidYMid meet',
          focusable: false,
          runExpressions: false,
        }
        animation = lottie.loadAnimation({
          container: player,
          renderer: 'svg',
          path: `/assets/animations/${name}.json`,
          autoplay: false,
          loop,
          rendererSettings,
        })
        animation.addEventListener('DOMLoaded', () => {
          ready = true
          wrapper.dataset.lottieReady = ''
          sync()
        })
        const useFallback = () => {
          ready = false
          delete wrapper.dataset.lottieReady
          animation?.destroy()
          animation = undefined
        }
        animation.addEventListener('data_failed', useFallback)
        animation.addEventListener('error', useFallback)
      } catch {
        // Keep the static artwork when the player cannot load.
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    observer.observe(wrapper)
    motion.addEventListener('change', sync)

    return () => {
      disposed = true
      observer.disconnect()
      motion.removeEventListener('change', sync)
      animation?.destroy()
      delete wrapper.dataset.lottieReady
    }
  }, [loop, name, stretch])

  return (
    <div ref={root} className={className} aria-hidden="true">
      <div className={styles.bentoFallback}>{children}</div>
      <div ref={container} className={styles.bentoPlayer} />
    </div>
  )
}
