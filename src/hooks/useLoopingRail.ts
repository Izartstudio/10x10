'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/animations/gsap'

export function useLoopingRail() {
  const viewport = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const windowEl = viewport.current
    const track = rail.current
    const group = track?.firstElementChild
    if (!windowEl || !track || !group) return

    let position = 0
    const setX = gsap.quickSetter(track, 'x', 'px')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let period = 0
    let visible = false
    let hovered = false

    const render = () => {
      if (period > 0) setX(gsap.utils.wrap(-period, 0, position))
    }
    const measure = new ResizeObserver(() => {
      period = group.getBoundingClientRect().width
      render()
    })
    measure.observe(group)
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting })
    visibility.observe(windowEl)

    const tick = (_time: number, delta: number) => {
      if (!visible || hovered || reduced.matches) return
      position -= Math.min(delta, 32) * 0.048
      render()
    }
    gsap.ticker.add(tick)

    const enter = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') hovered = true
    }
    const leave = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') hovered = false
    }

    windowEl.addEventListener('pointerenter', enter)
    windowEl.addEventListener('pointerleave', leave)

    return () => {
      gsap.ticker.remove(tick)
      visibility.disconnect()
      measure.disconnect()
      windowEl.removeEventListener('pointerenter', enter)
      windowEl.removeEventListener('pointerleave', leave)
      track.style.removeProperty('transform')
    }
  })

  return { viewport, rail }
}
