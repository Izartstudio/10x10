'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { IronManLoader } from '@/components/loader/IronManLoader'
import { gsap } from '@/lib/animations/gsap'
import { HeroSection } from './HeroSection'

const MAX_MEDIA_WAIT_MS = 2200

export function IntroExperience({ artwork, backHref, children, footer }: {
  artwork: ReactNode
  backHref: string
  children: ReactNode
  footer: ReactNode
}) {
  const [reducedMotion, setLoaderComplete] = useState<boolean | null>(null)
  const [revealed, setRevealed] = useState(false)
  const main = useRef<HTMLElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)

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
      hud.dataset.exiting = ''
      fade = gsap.to(hud, {
        autoAlpha: 0,
        duration: reducedMotion ? 0 : 0.42,
        ease: 'power1.out',
        onComplete: () => {
          window.scrollTo(0, 0)
          setRevealed(true)
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
      delete hud.dataset.exiting
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
      {!revealed && <div ref={overlay}><IronManLoader onComplete={setLoaderComplete}>{artwork}</IronManLoader></div>}
    </>
  )
}
