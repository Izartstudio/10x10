import { createContext, useContext } from 'react'

export const pageVideos = {
  hero: '/assets/videos/hero-intro.mp4',
  process: '/assets/videos/booth-assembly-scrub.mp4',
  globe: '/assets/videos/markets-globe.mp4',
} as const

export type PageVideoSources = Partial<Record<keyof typeof pageVideos, string>>

export const PageVideoContext = createContext<PageVideoSources>({})

export function usePageVideo(name: keyof typeof pageVideos) {
  return useContext(PageVideoContext)[name] ?? pageVideos[name]
}
