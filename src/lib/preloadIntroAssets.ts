import { preload } from 'react-dom'
import { services } from '@/components/sections/services/servicesContent'

const LATER_IMAGES = [
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

export function preloadIntroAssets() {
  preload('/assets/images/services/background.webp', { as: 'image' })
  services.forEach(({ image }, index) => {
    preload(`/assets/images/services/${image}.webp`, {
      as: 'image',
      fetchPriority: index === 0 ? 'auto' : 'low',
    })
  })

  for (const image of LATER_IMAGES) preload(image, { as: 'image', fetchPriority: 'low' })
}
