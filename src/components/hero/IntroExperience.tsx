'use client'

import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { IronManLoader } from '@/components/loader/IronManLoader'
import { gsap } from '@/lib/animations/gsap'
import { preloadIntroAssets } from '@/lib/preloadIntroAssets'
import { PageVideoContext, pageVideos, type PageVideoSources } from '@/lib/pageVideos'
import { ReactorSoundContext } from '@/lib/reactorSound'
import styles from './hero.module.css'
import { HeroSection } from './HeroSection'

const MAX_MEDIA_WAIT_MS = 2200
const MAX_ASSET_WAIT_MS = 30_000

export function IntroExperience({ artwork, backHref, children, footer }: {
  artwork: ReactNode
  backHref: string
  children: ReactNode
  footer: ReactNode
}) {
  const [reducedMotion, setLoaderComplete] = useState<boolean | null>(null)
  const [introComplete, setIntroComplete] = useState(false)
  const [preparedVideos, setPreparedVideos] = useState<PageVideoSources | null>(null)
  const revealed = introComplete
  const main = useRef<HTMLElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const preloaderAudio = useRef<HTMLAudioElement>(null)
  const preloaderSoundStarted = useRef(false)
  const muted = useRef(false)
  const loaderFinished = useRef(false)
  const soundRequest = useRef(0)
  const activeCue = useRef<AudioBufferSourceNode | null>(null)
  const soundButton = useRef<HTMLButtonElement>(null)

  const audioContext = useRef<AudioContext | null>(null)
  const soundBuffer = useRef<AudioBuffer | null>(null)
  const [soundStatus, setSoundStatus] = useState<'off' | 'loading' | 'on' | 'error'>('off')

  useEffect(() => () => {
    void audioContext.current?.close().catch(() => {})
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    void preloaderAudio.current?.play().catch(() => {})
  }, [])

  async function decodeSound(context: AudioContext, source: string) {
    const response = await fetch(source)
    if (!response.ok) throw new Error('Could not load sound')
    return context.decodeAudioData(await response.arrayBuffer())
  }

  function stopSound() {
    preloaderAudio.current?.pause()
    activeCue.current?.stop()
    activeCue.current = null
  }

  function startCue(context: AudioContext, buffer: AudioBuffer) {
    const cue = context.createBufferSource()
    cue.buffer = buffer
    cue.connect(context.destination)
    activeCue.current = cue
    cue.onended = () => {
      cue.disconnect()
      if (activeCue.current === cue) activeCue.current = null
    }
    cue.start()
  }

  async function enableSound() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    muted.current = false
    const request = ++soundRequest.current
    const introSound = preloaderAudio.current
    const playIntro = !loaderFinished.current && introSound && !introSound.ended
      ? introSound.play().then(() => true, () => false)
      : Promise.resolve(true)

    setSoundStatus('loading')
    try {
      const context = audioContext.current ?? new AudioContext()
      audioContext.current = context
      const resumed = context.resume()
      const prepareReactor = decodeSound(context, '/assets/audio/reactor-opening.mp3')
      const prepareIntro = playIntro.then(async (played) => {
        if (played || loaderFinished.current || request !== soundRequest.current) return
        const buffer = await decodeSound(context, '/assets/audio/preloader.mp3')
        await resumed
        if (!loaderFinished.current && request === soundRequest.current) startCue(context, buffer)
      })
      const [, reactor] = await Promise.all([resumed, prepareReactor, prepareIntro])
      if (request !== soundRequest.current) return
      soundBuffer.current = reactor
      setSoundStatus('on')
    } catch {
      if (request === soundRequest.current) setSoundStatus('error')
    }
  }

  function toggleSound() {
    if (soundStatus === 'on' || soundStatus === 'loading') {
      muted.current = true
      soundRequest.current++
      stopSound()
      setSoundStatus('off')
    } else {
      void enableSound()
    }
  }

  const enableSoundFromClick = useEffectEvent((event: MouseEvent) => {
    if (soundStatus !== 'off' || muted.current || !event.isTrusted) return
    if (event.target instanceof Node && soundButton.current?.contains(event.target)) return
    void enableSound()
  })

  useEffect(() => {
    const onClick = (event: MouseEvent) => enableSoundFromClick(event)
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  function playReactorSound() {
    if (muted.current) return
    const context = audioContext.current
    if (context?.state !== 'running' || !soundBuffer.current) {
      if (preloaderSoundStarted.current) void preloaderAudio.current?.play().catch(() => {})
      return
    }
    startCue(context, soundBuffer.current)
  }

  useEffect(() => {
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
  }, [])

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    window.scrollTo({ top: 0, behavior: 'instant' })
    return () => { window.history.scrollRestoration = previous }
  }, [])

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
          loaderFinished.current = true
          stopSound()
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
            videoSource={preparedVideos?.hero ?? (preparedVideos ? pageVideos.hero : undefined)}
          />
          {revealed && (
            <ReactorSoundContext.Provider value={playReactorSound}>
              {children}
            </ReactorSoundContext.Provider>
          )}
        </main>
        {revealed && footer}
      </PageVideoContext.Provider>
      <audio
        ref={preloaderAudio}
        src={revealed ? '/assets/audio/reactor-opening.mp3' : '/assets/audio/preloader.m4a'}
        preload="auto"
        onPlaying={() => {
          if (revealed || muted.current) return
          preloaderSoundStarted.current = true
          setSoundStatus((status) => status === 'off' ? 'on' : status)
        }}
      />
      <div className={styles.soundControl}>
        <button
          type="button"
          ref={soundButton}
          onClick={toggleSound}
          aria-label="Sound"
          aria-pressed={soundStatus === 'on' || soundStatus === 'loading'}
        >
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" />
            {soundStatus === 'on' || soundStatus === 'loading' ? (
              <path d="M15 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12" />
            ) : (
              <path d="m16 10 4 4m0-4-4 4" />
            )}
          </svg>
        </button>
        {soundStatus === 'error' && <span role="status">Couldn’t enable sound. Try again.</span>}
      </div>
      {!revealed && (
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
