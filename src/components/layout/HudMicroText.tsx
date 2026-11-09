'use client'

import { useEffect, useRef } from 'react'
import { createAlphabetReveal } from '@/lib/animations/alphabetReveal'

export function HudMicroText({ as: Tag = 'span', className, children }: {
  as?: 'span' | 'p' | 'pre'
  className?: string
  children: string
}) {
  const node = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = node.current
    if (!element) return
    const reveal = createAlphabetReveal([element], [children])
    function play(event: PointerEvent) {
      if (event.pointerType !== 'touch' &&
          window.matchMedia('(prefers-reduced-motion: no-preference)').matches) reveal.play()
    }
    element.addEventListener('pointerenter', play)
    return () => {
      element.removeEventListener('pointerenter', play)
      reveal.cancel()
    }
  }, [children, Tag])

  return <Tag ref={(element: HTMLElement | null) => { node.current = element }} className={className}>{children}</Tag>
}
