'use client'

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { IronManLoader } from '@/components/loader/IronManLoader'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'
import { preloadIntroAssets } from '@/lib/preloadIntroAssets'
import { PageVideoContext, pageVideos, type PageVideoSources } from '@/lib/pageVideos'
import { HeroSection } from './HeroSection'

const MAX_MEDIA_WAIT_MS = 2200
const MAX_ASSET_WAIT_MS = 30_000

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
  const [preparedVideos, setPreparedVideos] = useState<PageVideoSources | null>(null)
  const isReload = useSyncExternalStore(subscribeToNavigation, isReloadNavigation, getServerNavigation)
  const revealed = introComplete || isReload === true
  const main = useRef<HTMLElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isReload !== false) return

    const controller = new AbortController()
    const sources: PageVideoSources = {}
    let active = true
    let finished = false

    function finish() {
      if (!active || finished) return
      finished = true
      window.clearTimeout(deadline)
      controller.abort()
      setPreparedVideos({ ...sources })
    }

    const deadline = window.setTimeout(finish, MAX_ASSET_WAIT_MS)
    void preloadIntroAssets(controller.signal, sources).then(finish, finish)

    return () => {
      active = false
      window.clearTimeout(deadline)
      controller.abort()
      Object.values(sources).forEach((source) => URL.revokeObjectURL(source))
    }
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
    if (reducedMotion === null || preparedVideos === null || revealed) return
    const hud = overlay.current?.querySelector<HTMLElement>('[data-loader-overlay]')
    const media = video.current
    const content = main.current
    if (!hud || !media || !content) return

    let active = true
    let exiting = false
    let fade: gsap.core.Tween | undefined
    const hasFrame = () => !media.error && media.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA

    function reveal() {
      if (!active || exiting || !hud || !media || !content) return
      exiting = true
      window.clearTimeout(deadline)
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

    const deadline = window.setTimeout(reveal, reducedMotion ? 0 : MAX_MEDIA_WAIT_MS)

    if (reducedMotion || media.error || hasFrame()) reveal()
    else {
      media.addEventListener('loadeddata', reveal)
      media.addEventListener('canplay', reveal)
      media.addEventListener('error', reveal)
    }

    return () => {
      active = false
      window.clearTimeout(deadline)
      media.removeEventListener('loadeddata', reveal)
      media.removeEventListener('canplay', reveal)
      media.removeEventListener('error', reveal)
      fade?.kill()
      delete content.dataset.heroEntering
    }
  }, [preparedVideos, reducedMotion, revealed])

  return (
    <>
      <PageVideoContext.Provider value={preparedVideos ?? {}}>
        <main ref={main}>
          <HeroSection
            videoRef={video}
            revealed={revealed}
            backHref={backHref}
            videoSource={preparedVideos?.hero ?? (isReload || preparedVideos ? pageVideos.hero : undefined)}
          />
          {revealed && children}
        </main>
        {revealed && footer}
      </PageVideoContext.Provider>
      {isReload === null && <div className="fixed inset-0 z-[2] bg-[#030101]" aria-hidden="true" />}
      {isReload === false && !revealed && (
        <div ref={overlay}>
          <IronManLoader onComplete={setLoaderComplete}>
            {artwork}
            {reducedMotion === false && preparedVideos === null && (
              <p role="status" className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-white">
                Loading site assets…
              </p>
            )}
          </IronManLoader>
        </div>
      )}
    </>
  )
}
