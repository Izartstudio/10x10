'use client'

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { SplitText } from 'gsap/SplitText'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animations/gsap'
import { HelmetArtwork } from '@/components/loader/HelmetArtwork'
import styles from './testimonials.module.css'

gsap.registerPlugin(SplitText)

const testimonials = [
  {
    quote: 'Jianna says coordinating exhibitions across the United States went from her most stressful responsibility to her easiest. She credits reliable builds, polished booths and predictable delivery.',
    name: 'Jianna Pellegrino, Events Coordinator',
    company: 'Farmer Law PC',
  },
  {
    quote: "10x10 Booths was the reason our Saudi market entry actually worked. They built our stand for Big 5 Construct Saudi in Riyadh and made the whole process feel simple, even from across the world. Couldn't recommend them more.",
    name: 'Edison J., Founder',
    company: 'On Flow Design LLC',
    verbatim: true,
  },
  {
    quote: "We received our pop up booth and we're very happy with it. Thank you 10x10 Booths for getting it to us within our tight deadline. We really appreciate it.",
    name: 'Michaela, Marketing Leader',
    company: 'Newsmatic',
    verbatim: true,
  },
  {
    quote: 'Zenni Optical attends marathons in different California cities almost monthly during the season. Its events manager credits the team with quick turnarounds, fresh-looking booth setups, and help with shipping and installation and dismantling.',
    name: 'Events Manager',
    company: 'Zenni Optical',
  },
  {
    quote: 'Tim says the booth met the design brief so well that Velous Footwear expanded its lightbox setup. He recommends the team for exhibitors who want a more visually engaging, interactive booth.',
    name: 'Tim Bartels, CEO',
    company: 'Velous Footwear',
  },
]

const helmetPulses = Array.from({ length: 35 }, (_, index) => {
  const seed = Math.imul(index + 1, 0x9e3779b1)
  const phase = ((seed ^ (seed >>> 16)) >>> 0) / 2 ** 32
  const duration = 6.9 + ((seed >>> 8) & 255) / 255 * 4.2

  return {
    '--helmet-duration': `${duration}s`,
    '--helmet-delay': `${-phase * duration}s`,
  } as CSSProperties
})

export function Testimonials() {
  const section = useRef<HTMLElement>(null)
  const symbol = useId()
  const slides = useRef<HTMLDivElement>(null)
  const previous = useRef<number>(0)
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  useGSAP(() => {
    if (!section.current) return
    ScrollTrigger.create({
      trigger: section.current,
      start: 'top bottom',
      end: 'bottom top',
      toggleClass: styles.visible,
      onToggle: ({ isActive }) => setVisible(isActive),
      onRefresh: ({ isActive }) => setVisible(isActive),
    })
  }, { scope: section })

  useEffect(() => {
    if (!visible) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer: number | undefined

    function schedule() {
      window.clearTimeout(timer)
      if (!motion.matches && !document.hidden) {
        timer = window.setTimeout(() => {
          setActive((index) => (index + 1) % testimonials.length)
        }, 5000)
      }
    }

    schedule()
    motion.addEventListener('change', schedule)
    document.addEventListener('visibilitychange', schedule)
    return () => {
      window.clearTimeout(timer)
      motion.removeEventListener('change', schedule)
      document.removeEventListener('visibilitychange', schedule)
    }
  }, [active, visible])

  useGSAP(() => {
    if (!visible || !slides.current) return
    const outgoing = previous.current
    previous.current = active
    const elements = slides.current
    const motion = gsap.matchMedia()

    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const incoming = SplitText.create(elements.querySelectorAll(`[data-slide="${active}"] [data-lines]`), {
        type: 'lines',
        mask: 'lines',
      })
      gsap.from(incoming.lines, { yPercent: 110, duration: 0.7, stagger: 0.1, ease: 'power3.out' })

      const leaving = outgoing === active ? undefined : SplitText.create(
        elements.querySelectorAll(`[data-slide="${outgoing}"] [data-lines]`),
        { type: 'lines', mask: 'lines' },
      )
      if (leaving) gsap.to(leaving.lines, { yPercent: -110, duration: 0.5, stagger: 0.05, ease: 'power3.in' })

      return () => {
        incoming.revert()
        leaving?.revert()
      }
    })

    return () => motion.revert()
  }, { dependencies: [active, visible], revertOnUpdate: true })

  function move(direction: number) {
    const next = (active + direction + testimonials.length) % testimonials.length
    const testimonial = testimonials[next]
    setActive(next)
    setAnnouncement(`Testimonial ${next + 1} of ${testimonials.length}. ${testimonial.quote} ${testimonial.name}, ${testimonial.company}.`)
  }

  return (
    <section ref={section} className={styles.section} aria-labelledby="testimonials-title">
      <svg className={styles.helmets} viewBox="0 0 710 815" aria-hidden="true" focusable="false">
        <defs>
          <symbol id={symbol} viewBox="566 222 309 468"><HelmetArtwork /></symbol>
        </defs>
        {helmetPulses.map((pulse, index) => (
          <use
            key={index}
            className={styles.helmet}
            href={`#${symbol}`}
            x={10 + (index % 7) * 101}
            y={8 + Math.floor(index / 7) * 164}
            width="89"
            height="133"
            style={pulse}
          />
        ))}
      </svg>

      <div className={styles.content}>
        <h2 id="testimonials-title">What Our Clients Say</h2>
        <div ref={slides} className={styles.panel}>
          <svg className={styles.frame} viewBox="0 0 596 446" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path d="M2 19 35 2H157L165 9H207L231 19H369L394 9H424L434 2H562L594 15V94L571 110V320L585 334V432L572 444H491L478 431H116L106 444H26L10 432V335L26 323V110L2 94Z" />
          </svg>
          {testimonials.map((testimonial, index) => (
            <figure
              key={testimonial.company}
              className={styles.slide}
              data-slide={index}
              data-active={active === index}
              aria-hidden={active !== index}
            >
              {testimonial.verbatim ? (
                <blockquote className={styles.quote} data-lines>“{testimonial.quote}”</blockquote>
              ) : (
                <p className={styles.quote} data-lines>{testimonial.quote}</p>
              )}
              <figcaption className={styles.attribution}>
                <span data-lines>{testimonial.name}</span>
                <span data-lines>{testimonial.company}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="sr-only" role="status" aria-atomic="true">{announcement}</div>
        <div className={styles.controls}>
          <button type="button" aria-label="Previous testimonial" onClick={() => move(-1)}>←</button>
          <button type="button" aria-label="Next testimonial" onClick={() => move(1)}>→</button>
        </div>
      </div>
    </section>
  )
}
