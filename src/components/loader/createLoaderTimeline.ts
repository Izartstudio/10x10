import { gsap } from '@/lib/animations/gsap'
import { createTextScramble } from '@/lib/animations/textScramble'
import { CUES, MESSAGE, TERMINAL_LINES } from './loaderConfig'

const pathLengths = new WeakMap<SVGPathElement, number>()
const PERSPECTIVE = 1000
const CAMERA_TRAVEL = 500
const MAX_FRAME_SCALE = 1.035

export function createLoaderTimeline(root: HTMLElement, onTick?: (time: number) => void) {
  const select = gsap.utils.selector(root)
  const terminal = select<SVGTextElement>('[data-terminal-line]')
  const message = select<SVGTextElement>('[data-message]')[0]
  const lineProgress = terminal.map(() => ({ value: 0 }))
  const messageIn = { value: 0 }
  const messageOut = { value: 0 }
  const renderLines = terminal.map((node, index) => createTextScramble(node, {
    target: TERMINAL_LINES[index],
    typeIn: true,
  }))
  const renderMessageIn = createTextScramble(message, { target: MESSAGE })
  const renderMessageOut = createTextScramble(message, { target: MESSAGE, reverse: true })

  let wasDecrypting = false
  const timeline = gsap.timeline({
    paused: true,
    defaults: { ease: 'none' },
    onUpdate() {
      const time = timeline.time()
      const terminalReady = time >= CUES.state1
      const wasTerminalReady = root.hasAttribute('data-terminal-ready')
      if (!terminalReady || !wasTerminalReady) {
        renderLines.forEach((render, index) => render(lineProgress[index].value, wasTerminalReady))
      }
      const decrypting = messageOut.value > 0
      const switched = decrypting !== wasDecrypting
      wasDecrypting = decrypting
      if (decrypting) renderMessageOut(messageOut.value, switched)
      else renderMessageIn(messageIn.value, switched)
      if (wasTerminalReady !== terminalReady) {
        root.toggleAttribute('data-terminal-ready', terminalReady)
      }
      if (time >= CUES.complete) root.dataset.loaderComplete = 'true'
      else if (root.dataset.loaderComplete) delete root.dataset.loaderComplete
      onTick?.(time)
    },
  })

  Object.entries(CUES).forEach(([label, time]) => timeline.addLabel(label, time))

  function drawPaths(selector: string, position: gsap.Position, duration: number, stagger = 0) {
    const paths = select<SVGPathElement>(selector)
    const lengths = paths.map((path) => {
      const cached = pathLengths.get(path)
      if (cached !== undefined) return cached
      const length = path.getTotalLength()
      pathLengths.set(path, length)
      return length
    })

    gsap.set(paths, {
      strokeDasharray: (index) => lengths[index],
      strokeDashoffset: (index) => lengths[index],
    })
    timeline.to(paths, { strokeDashoffset: 0, duration, stagger }, position)
  }

  const background = select('[data-background]')
  const camera = select('[data-camera]')
  const cameraFit = select('[data-camera-fit]')
  const grid = select('[data-grid]')
  const frameFills = select('[data-frame-fills]')
  const topClip = select('[data-top-clip]')
  const scanner = select('[data-scanner]')
  const helmet = select('[data-helmet]')
  const helmetFinish = select('[data-helmet-finish]')
  const rulerEdge = select('[data-ruler-edge]')
  const brand = select('[data-brand]')
  const brandFills = select('[data-brand-fill]')
  const bars = select('[data-brand-bar]')
  const marker = select('[data-brand-marker]')
  const logo = select('[data-logo]')
  const logoClip = select('[data-logo-clip]')

  gsap.set([background, grid, frameFills, message, scanner, helmet, helmetFinish, brand, brandFills, marker, logo].flat(), { opacity: 0 })
  gsap.set(select('[data-helmet-guide]'), { opacity: 0 })
  gsap.set([topClip[0], logoClip[0]], { attr: { width: 0 } })
  gsap.set(rulerEdge, { attr: { x1: 133, x2: 134 } })
  gsap.set(bars, { scaleX: 0, transformOrigin: 'left center' })
  gsap.set(camera, { transformPerspective: PERSPECTIVE })
  const setPlaneDepth = (selector: string, z: number) => {
    // Compensate for each plane's starting depth so S1 retains its framing.
    gsap.set(select(selector), { z, scale: 1 - z / PERSPECTIVE })
  }
  setPlaneDepth('[data-depth-grid]', -510)
  setPlaneDepth('[data-depth-scanner]', -270)
  setPlaneDepth('[data-depth-brand]', -115)
  renderLines.forEach((render) => render(0))
  renderMessageIn(0)

  drawPaths('[data-frame-path]', 'hudInitialize+=0.08', 0.68, 0.055)
  drawPaths('[data-arc]', 'scannerActivate', 0.71, 0.13)
  drawPaths('[data-helmet-guide]', 'helmetDraw', 0.49, 0.106)
  drawPaths('[data-brand-path]', 'brandReveal+=0.04', 0.37)
  select('[data-helmet-guide]').forEach((guide, index) => {
    timeline.set(guide, { opacity: 1 }, CUES.helmetDraw + index * 0.106)
  })

  timeline
    .to(background, { opacity: 1, duration: 0.74, ease: 'power1.inOut' }, 'boot')
    .to(grid, { opacity: 1, duration: 0.83, ease: 'power1.out' }, 'boot+=0.16')
    .to(topClip, { attr: { width: 1440 }, duration: 0.69 }, 'hudInitialize')
    .to(frameFills, { opacity: 1, duration: 0.26 }, 'hudInitialize+=0.44')
    .to(lineProgress, { value: 1, duration: 0.58, stagger: 0.014 }, 'terminalInitialize')
    .to(message, { opacity: 1, duration: 0.10 }, 'messageReveal')
    .to(messageIn, { value: 1, duration: 0.46 }, 'messageReveal')
    .to(messageOut, { value: 1, duration: 0.17 }, 'messageClear')
    .to(message, { opacity: 0.45, duration: 0.07, ease: 'steps(2)' }, 'messageClear+=0.07')
    .to(message, { opacity: 0, duration: 0.04 }, 'messageClear+=0.17')
    .set(scanner, { opacity: 1 }, 'scannerActivate')
    .set(helmet, { opacity: 1 }, 'helmetDraw')
    .to(helmetFinish, { opacity: 1, duration: 0.14 }, 'helmetDraw+=0.98')
    .set(brand, { opacity: 1 }, 'brandReveal')
    .to(brandFills, { opacity: 1, duration: 0.22, ease: 'power1.out' }, 'brandReveal+=0.18')
    .to(bars, { scaleX: 1, duration: 0.13, stagger: 0.059, ease: 'power1.out' }, 'brandReveal')
    .to(marker, { opacity: 1, duration: 0.09 }, 'brandReveal+=0.54')
    .to(logoClip, { attr: { width: 76 }, duration: 0.24 }, 'brandReveal+=0.46')
    .to(logo, { opacity: 0.82, duration: 0.07, ease: 'steps(2)' }, 'brandReveal+=0.46')
    .to(logo, { opacity: 1, duration: 0.14 }, 'brandReveal+=0.57')
    .to(rulerEdge, { attr: { x1: 134, x2: 680 }, duration: 1.22 }, 'hudInitialize')
    .to(rulerEdge, { attr: { x1: 135, x2: 1150 }, duration: 1.20 }, 'helmetInitialize')
    .to(rulerEdge, { attr: { x1: 1308, x2: 1309 }, duration: 0.99, ease: 'power1.inOut' }, 'brandReveal')
    .to(camera, {
      z: CAMERA_TRAVEL, duration: CUES.state3 - CUES.state1,
      ease: 'sine.inOut',
    }, 'state1')
    .to(cameraFit, {
      // Widen the framing as the camera advances so the near frame stays in view.
      scale: MAX_FRAME_SCALE * (1 - CAMERA_TRAVEL / PERSPECTIVE),
      duration: CUES.state3 - CUES.state1, ease: 'sine.inOut',
    }, 'state1')
    .to(camera, {
      xPercent: 1, duration: CUES.state3 - CUES.state2,
      ease: 'sine.inOut',
    }, 'state2')
    // Hold the fully assembled composition before marking playback complete.
    .to({}, { duration: CUES.complete - CUES.state3 }, 'state3')

  return timeline
}
