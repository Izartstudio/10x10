import { services } from '@/components/sections/services/servicesContent'

import { bentoCompositions, loadBentoPlayer } from './animations/bentoAssets'
import { pageVideos, type PageVideoSources } from './pageVideos'

const IMAGES = [
  '/assets/videos/hero-intro-poster.webp',
  '/assets/svg/10x10-booths-wordmark.svg',
  '/assets/svg/10x10-cube.svg',
  '/assets/images/services/background.webp',
  ...services.map(({ image }) => `/assets/images/services/${image}.webp`),
  '/assets/videos/booth-assembly-poster.jpg',
  '/assets/videos/markets-globe-poster.jpg',
  '/assets/images/arc-reactor-core.webp',
  '/assets/images/clients/world-map.webp',
  '/assets/images/clients/booth.avif',
  '/assets/images/footer-backdrop.webp',
  '/assets/svg/footer-hud.svg',
  ...Array.from({ length: 13 }, (_, index) =>
    `/assets/images/shows/${String(index + 1).padStart(2, '0')}.svg`,
  ),
  ...Array.from({ length: 12 }, (_, index) => `/assets/images/work/booth-${index + 1}.avif`),
]

const FONTS = ['400 16px "Plus Jakarta Sans"', '400 16px "Bai Jamjuree"', '600 16px "Bai Jamjuree"']

export async function preloadIntroAssets(signal: AbortSignal, videoSources: PageVideoSources) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const images = IMAGES.map(async (source) => {
    const image = new Image()
    image.src = source
    await image.decode()
  })
  const fonts = FONTS.map((font) => document.fonts.load(font))
  const motionAssets = reducedMotion ? [] : [
    loadBentoPlayer(),
    ...Object.values(bentoCompositions).map((load) => load()),
    ...Object.entries(pageVideos).map(async ([name, source]) => {
      const response = await fetch(source, { signal })
      if (!response.ok) throw new Error(`Could not load ${source}`)
      const blob = await response.blob()
      if (!signal.aborted) videoSources[name as keyof PageVideoSources] = URL.createObjectURL(blob)
    }),
  ]

  await Promise.allSettled([...images, ...fonts, ...motionAssets])
}
