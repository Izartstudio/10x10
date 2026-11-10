'use client'

import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/animations/gsap'

export function useLoopingRail() {
  const carousel = useRef<HTMLDivElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const paused = useRef(false)
  const move = useRef<(direction: number) => void>(null)
  const [isPaused, setIsPaused] = useState(false)

  useGSAP(() => {
    const controls = carousel.current
    const windowEl = viewport.current
    const track = rail.current
    const group = track?.firstElementChild
    if (!controls || !windowEl || !track || !group) return

    const playhead = { x: 0 }
    const setX = gsap.quickSetter(track, 'x', 'px')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let period = 0
    let visible = false
    let dragging: { id: number; x: number; start: number } | null = null

    const render = () => {
      if (period > 0) setX(gsap.utils.wrap(-period, 0, playhead.x))
    }
    const measure = new ResizeObserver(() => {
      period = group.getBoundingClientRect().width
      render()
    })
    measure.observe(group)
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting })
    visibility.observe(windowEl)

    move.current = (direction) => {
      const first = group.firstElementChild
      const second = first?.nextElementSibling
      if (!first || !second) return
      const step = second.getBoundingClientRect().left - first.getBoundingClientRect().left
      gsap.killTweensOf(playhead)
      if (reduced.matches) {
        playhead.x -= direction * step
        render()
      } else {
        gsap.to(playhead, {
          x: playhead.x - direction * step,
          duration: 0.4,
          ease: 'power2.out',
          onUpdate: render,
        })
      }
    }

    const tick = (_time: number, delta: number) => {
      if (!visible || paused.current || reduced.matches || dragging || gsap.isTweening(playhead)) return
      playhead.x -= Math.min(delta, 32) * 0.048
      render()
    }
    gsap.ticker.add(tick)

    const startDrag = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return
      gsap.killTweensOf(playhead)
      dragging = { id: event.pointerId, x: event.clientX, start: playhead.x }
      windowEl.setPointerCapture(event.pointerId)
    }
    const drag = (event: PointerEvent) => {
      if (dragging?.id !== event.pointerId) return
      playhead.x = dragging.start + event.clientX - dragging.x
      render()
    }
    const stopDrag = (event: PointerEvent) => {
      if (dragging?.id === event.pointerId) dragging = null
    }

    windowEl.addEventListener('pointerdown', startDrag)
    windowEl.addEventListener('pointermove', drag)
    windowEl.addEventListener('pointerup', stopDrag)
    windowEl.addEventListener('pointercancel', stopDrag)
    windowEl.addEventListener('lostpointercapture', stopDrag)

    return () => {
      gsap.ticker.remove(tick)
      gsap.killTweensOf(playhead)
      visibility.disconnect()
      measure.disconnect()
      windowEl.removeEventListener('pointerdown', startDrag)
      windowEl.removeEventListener('pointermove', drag)
      windowEl.removeEventListener('pointerup', stopDrag)
      windowEl.removeEventListener('pointercancel', stopDrag)
      windowEl.removeEventListener('lostpointercapture', stopDrag)
      move.current = null
      track.style.removeProperty('transform')
    }
  })

  function togglePause() {
    paused.current = !paused.current
    setIsPaused(paused.current)
  }

  return { carousel, viewport, rail, move, isPaused, togglePause }
}
