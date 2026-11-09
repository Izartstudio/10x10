'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/animations/gsap'
import { services } from './servicesContent'
import styles from './services.module.css'

function PanelFrame() {
  return (
    <svg className={styles.frame} viewBox="0 0 1340 54" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M0 22 69 2H320L361 10H983L1023 2H1252L1340 27" fill="none" stroke="#ef0b00" strokeWidth="2" />
      <path d="M361 9H985L967 23H380Z" fill="#ef0b00" />
      <path d="M6 45 73 25H293L361 45M979 51 1035 25H1257L1333 51" fill="none" stroke="#832600" strokeWidth="4" />
    </svg>
  )
}

export function ExhibitionServices() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const section = root.current
    const scrollTrack = track.current
    const stage = viewport.current
    const list = rail.current
    if (!section || !scrollTrack || !stage || !list) return

    const media = gsap.matchMedia()
    media.add({
      motion: '(prefers-reduced-motion: no-preference)',
      desktop: '(min-width: 992px)',
    }, ({ conditions }) => {
      if (!conditions?.motion) return

      section.querySelectorAll<HTMLElement>('[data-service-entrance]').forEach((target) => {
        const entrance = gsap.timeline({
          scrollTrigger: { trigger: target, start: 'top 85%', once: true },
        })
        entrance
          .from(target, { yPercent: 30, duration: 0.5, ease: 'power2.out' }, 0)
          .from(target, { opacity: 0, duration: 0.5, ease: 'power1.inOut' }, 0)
      })

      if (!conditions.desktop) return
      scrollTrack.dataset.horizontal = ''
      const slide = gsap.timeline({ defaults: { ease: 'none' }, paused: true })
      slide.to({}, { duration: 0.1 })
      slide.to(list, { x: () => -Math.max(0, list.scrollWidth - stage.clientWidth), duration: 0.9 })
      const trigger = ScrollTrigger.create({
        trigger: scrollTrack,
        start: 'top top',
        end: 'bottom bottom',
        animation: slide,
        scrub: 0.56,
        invalidateOnRefresh: true,
      })

      return () => {
        trigger.kill()
        delete scrollTrack.dataset.horizontal
      }
    })

    return () => media.revert()
  }, { scope: root })

  return (
    <section ref={root} className={styles.services} aria-labelledby="exhibition-services-title">
      <div className={styles.intro}>
        <div>
          <div data-service-entrance>
            <h2 id="exhibition-services-title">From Custom Exhibition<br />Builds to Agile Pop-Up Booths</h2>
          </div>
          <div data-service-entrance>
            <p className={styles.introLead}>Built To Perform At Every Show, Worldwide.</p>
            <p className={styles.introCopy}>From fully bespoke exhibition environments to ready to deploy modular pop-ups, we create trade show spaces that attract attention and convert opportunity.</p>
          </div>
        </div>
        <svg className={styles.meter} viewBox="0 0 198 66" aria-hidden="true" focusable="false">
          {Array.from({ length: 9 }, (_, index) => (
            <path key={index} d={`M${index * 23 + 4} 0v11m-4 9h9v18h-9z`} stroke="currentColor" fill="currentColor" />
          ))}
          <path d="m187 47 9 18h-18Z" fill="currentColor" />
        </svg>
      </div>

      <div ref={track} className={styles.track}>
        <div ref={viewport} className={styles.viewport}>
          <div ref={rail} className={styles.rail}>
            {services.map((service, index) => (
              <article key={service.image} className={styles.slide} aria-labelledby={`service-${service.image}`}>
                <div className={styles.panel}>
                  <PanelFrame />
                  <div className={styles.panelBody}>
                    <div className={styles.copy}>
                      <h3 id={`service-${service.image}`}>{`${String(index + 1).padStart(2, '0')} // ${service.title}`}</h3>
                      <p className={styles.lead}>{service.lead}</p>
                      <p className={styles.description}>{service.description}</p>
                    </div>
                    <div className={styles.visual}>
                      <Image
                        className={styles.booth}
                        src={`/assets/images/services/${service.image}.png`}
                        width={service.imageWidth}
                        height={527}
                        alt={`${service.title} exhibition stand`}
                        unoptimized
                      />
                      <ul className="sr-only">
                        {service.callouts.map((label) => <li key={label}>{label}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
