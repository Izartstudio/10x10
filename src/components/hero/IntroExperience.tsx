'use client'

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { IronManLoader } from '@/components/loader/IronManLoader'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'
import { preloadIntroAssets } from '@/lib/preloadIntroAssets'
import { HeroSection } from './HeroSection'

const MAX_MEDIA_WAIT_MS = 2200

const subscribeToNavigation = () => () => {}
const getServerNavigation = () => null

function isReloadNavigation() {
  if (process.env.NODE_ENV === 'development') {
    const params = new URLSearchParams(window.location.search)
    if (['loader', 'controls', 'motion'].some((name) => params.has(name))) return false
  }

  const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
  return navigation?.type === 'reload'
}

function scrollPositionKey() {
  return `10x10:scroll:${window.location.pathname}${window.location.search}`
}

export function IntroExperience({ artwork, backHref, children, footer }: {
  artwork: ReactNode
  backHref: string
  children: ReactNode
  footer: ReactNode
}) {
  const [reducedMotion, setLoaderComplete] = useState<boolean | null>(null)
  const [introComplete, setIntroComplete] = useState(false)
  const isReload = useSyncExternalStore(subscribeToNavigation, isReloadNavigation, getServerNavigation)
  const revealed = introComplete || isReload === true
  const main = useRef<HTMLElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isReload === false) preloadIntroAssets()
  }, [isReload])

  useLayoutEffect(() => {
    if (!revealed) return

    const key = scrollPositionKey()
    function savePosition() {
      try {
        sessionStorage.setItem(key, String(window.scrollY))
      } catch {
        // Browser privacy settings can disable session storage.
      }
    }

    if (isReload) {
      let position: string | null = null
      try {
        position = sessionStorage.getItem(key)
      } catch {
        // Leave restoration to the browser when storage is unavailable.
      }
      if (position !== null && Number.isFinite(Number(position))) {
        ScrollTrigger.refresh()
        window.scrollTo({ top: Math.max(0, Number(position)), behavior: 'instant' })
        ScrollTrigger.update()
      }
    }

    window.addEventListener('pagehide', savePosition)
    return () => window.removeEventListener('pagehide', savePosition)
  }, [isReload, revealed])

  useEffect(() => {
    if (!isReload || !video.current) return
    const media = video.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      media.hidden = true
      return
    }

    void media.play().catch(() => {})
  }, [isReload])

  useEffect(() => {
    if (reducedMotion === null || revealed) return
    const hud = overlay.current?.querySelector<HTMLElement>('[data-loader-overlay]')
    const media = video.current
    const content = main.current
    if (!hud || !media || !content) return

    let active = true
    let starting = false
    let exiting = false
    let fade: gsap.core.Tween | undefined
    const hasFrame = () => !media.error && media.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA

    function reveal(showVideo: boolean) {
      if (!active || exiting || !hud || !media || !content) return
      exiting = true
      window.clearTimeout(deadline)
      if (!showVideo) media.hidden = true
      content.dataset.heroEntering = ''
      fade = gsap.to(hud, {
        autoAlpha: 0,
        duration: reducedMotion ? 0 : 0.42,
        ease: 'power1.out',
        onComplete: () => {
          window.scrollTo(0, 0)
          setIntroComplete(true)
        },
      })
    }

    function tryPlayback() {
      if (!active || !media || exiting) return
      if (media.error) {
        reveal(false)
        return
      }
      if (starting || !hasFrame()) return
      starting = true
      void media.play().then(
        () => reveal(true),
        () => reveal(hasFrame()),
      )
    }

    const deadline = window.setTimeout(() => {
      media.pause()
      reveal(hasFrame())
    }, reducedMotion ? 0 : MAX_MEDIA_WAIT_MS)

    if (reducedMotion) {
      reveal(false)
    } else {
      media.addEventListener('loadeddata', tryPlayback)
      media.addEventListener('canplay', tryPlayback)
      media.addEventListener('error', tryPlayback)
      tryPlayback()
    }

    return () => {
      active = false
      window.clearTimeout(deadline)
      media.removeEventListener('loadeddata', tryPlayback)
      media.removeEventListener('canplay', tryPlayback)
      media.removeEventListener('error', tryPlayback)
      fade?.kill()
      if (!exiting && starting) media.pause()
      delete content.dataset.heroEntering
    }
  }, [reducedMotion, revealed])

  return (
    <>
      <main ref={main}>
        <HeroSection videoRef={video} revealed={revealed} backHref={backHref} />
        {revealed && children}
      </main>
      {revealed && footer}
      {isReload === null && <div className="fixed inset-0 z-[2] bg-[#030101]" aria-hidden="true" />}
      {isReload === false && !revealed && <div ref={overlay}><IronManLoader onComplete={setLoaderComplete}>{artwork}</IronManLoader></div>}
    </>
  )
}
