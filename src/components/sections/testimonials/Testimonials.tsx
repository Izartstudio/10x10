'use client'

import { useId, useRef, useState, type CSSProperties } from 'react'
import { ScrollTrigger, useGSAP } from '@/lib/animations/gsap'
import { HelmetArtwork } from '@/components/loader/HelmetArtwork'
import styles from './testimonials.module.css'

const testimonials = [
  { quote: 'Reliable builds, sharp booths, no surprises.', name: 'Jianna Pellegrino, Events Coordinator', company: 'Farmer Law PC' },
  { quote: '…made the whole process feel simple.', name: 'Edison J., Founder', company: 'On Flow Design LLC' },
  {
    quote: "We received our pop up booth and we're very happy with it. Thank you 10x10 Booths for getting it to us within our tight deadline. We really appreciate it.",
    name: 'Michaela, Marketing Leader',
    company: 'Newsmatic',
  },
  { quote: 'Fast turnarounds, sharp setups…', name: 'Events Manager', company: 'Zenni Optical' },
  { quote: '…the team delivered on our brief…', name: 'Tim Bartels, CEO', company: 'Velous Footwear' },
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
  const [active, setActive] = useState(2)
  const testimonial = testimonials[active]

  useGSAP(() => {
    if (!section.current) return
    ScrollTrigger.create({
      trigger: section.current,
      start: 'top bottom',
      end: 'bottom top',
      toggleClass: styles.visible,
    })
  }, { scope: section })

  const move = (direction: number) => {
    setActive((index) => (index + direction + testimonials.length) % testimonials.length)
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
        <figure className={styles.panel} key={active}>
          <svg className={styles.frame} viewBox="0 0 596 446" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path d="M2 19 35 2H157L165 9H207L231 19H369L394 9H424L434 2H562L594 15V94L571 110V320L585 334V432L572 444H491L478 431H116L106 444H26L10 432V335L26 323V110L2 94Z" />
          </svg>
          <blockquote className={styles.quote}>“{testimonial.quote}”</blockquote>
          <figcaption className={styles.attribution}>
            <span>{testimonial.name}</span>
            <span>{testimonial.company}</span>
          </figcaption>
        </figure>
        <div className="sr-only" role="status" aria-atomic="true">
          Testimonial {active + 1} of {testimonials.length}. {testimonial.quote} {testimonial.name}, {testimonial.company}.
        </div>
        <div className={styles.controls}>
          <button type="button" aria-label="Previous testimonial" onClick={() => move(-1)}>←</button>
          <button type="button" aria-label="Next testimonial" onClick={() => move(1)}>→</button>
        </div>
      </div>
    </section>
  )
}
