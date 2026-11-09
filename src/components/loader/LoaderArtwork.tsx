import { HelmetArtwork } from './HelmetArtwork'
import { MESSAGE, TERMINAL_LINES } from './loaderConfig'
import styles from './loader.module.css'

const RED = '#e50400'
const DIM_RED = '#800301'
const TERMINAL_RED = '#800300'
const GRID = Array.from({ length: 10 }, (_, index) => 294.9 + index * 92.43)
const RULER = Array.from({ length: 91 }, (_, index) => {
  const x = 135.5 + index * 13
  return `M${x} ${index % 5 === 1 ? 745 : 765}V781`
}).join(' ')

function LoaderBackground() {
  return (
    <svg className={styles.backdrop} viewBox="0 0 1440 832" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hud-vertical" x2="0" y2="1">
          <stop stopColor="#5c0201" />
          <stop offset=".12" stopColor="#290101" />
          <stop offset=".24" stopColor="#0c0101" />
          <stop offset=".36" stopColor="#000" />
          <stop offset=".65" stopColor="#010101" />
          <stop offset=".72" stopColor="#050101" />
          <stop offset=".84" stopColor="#1a0100" />
          <stop offset=".90" stopColor="#2c0100" />
          <stop offset="1" stopColor="#560100" />
        </linearGradient>
        <linearGradient id="hud-edge-attenuation" x2="0" y2="1">
          <stop stopColor="white" stopOpacity=".64" />
          <stop offset=".34" stopColor="white" />
          <stop offset=".62" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity=".66" />
        </linearGradient>
        <mask id="hud-edge-mask">
          <rect width="1440" height="832" fill="url(#hud-edge-attenuation)" />
        </mask>
        <linearGradient id="hud-edges">
          <stop stopColor="#600100" />
          <stop offset=".07" stopColor="#460100" />
          <stop offset=".14" stopColor="#100000" />
          <stop offset=".21" stopColor="#010000" />
          <stop offset=".76" stopColor="#000" />
          <stop offset=".86" stopColor="#170000" />
          <stop offset=".94" stopColor="#430100" />
          <stop offset="1" stopColor="#700200" />
        </linearGradient>
      </defs>
      <g data-background>
        <rect width="1440" height="832" fill="url(#hud-vertical)" />
        <rect width="1440" height="832" fill="url(#hud-edges)" mask="url(#hud-edge-mask)" style={{ mixBlendMode: 'screen' }} />
      </g>
    </svg>
  )
}

function LoaderGrid() {
  return (
    <>
      <defs>
        <radialGradient id="hud-grid-mask" gradientUnits="userSpaceOnUse" cx="711" cy="420" r="465">
          <stop stopColor="white" />
          <stop offset=".27" stopColor="white" stopOpacity=".92" />
          <stop offset=".58" stopColor="white" stopOpacity=".42" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="hud-grid-falloff">
          <rect width="1440" height="832" fill="url(#hud-grid-mask)" />
        </mask>
      </defs>
      <g data-grid mask="url(#hud-grid-falloff)" stroke="#470300" strokeWidth="1.7">
        {GRID.map((x) => <path key={x} d={`M${x} 0V832`} />)}
        {Array.from({ length: 10 }, (_, index) => index * 92.43).map((y) => (
          <path key={y} d={`M294.9 ${y}H1127`} />
        ))}
      </g>
    </>
  )
}

function LoaderFrame() {
  return (
    <>
      <defs>
        <clipPath id="hud-top-clip"><rect data-top-clip width="1440" height="160" /></clipPath>
      </defs>
      <path
        clipPath="url(#hud-top-clip)" fill={RED}
        d="M58.7 65.6 397.5 108 448.5 83 611 104.5 706.5 113.7 822 104.5 948.5 86.8 997.5 112.5 1385 59 1386 64.9 706.5 155 58.2 71.3Z"
      />
      <g stroke={DIM_RED} strokeWidth="4.8" fill="none">
        <path data-frame-path d="M59 107 458.5 156 525.5 254" />
        <path data-frame-path d="M1386 107 986.5 156 920 254" />
        <path data-frame-path stroke="#8b0301" strokeWidth="4" d="M156 205H73L61 218 59 432H63V464H59V678L74 692H157" />
      </g>
      <g data-frame-fills fill={DIM_RED}>
        <path d="M192 123 398 149 383 161 205 139Z M1252 123 1047 149 1063 161 1239 139Z" />
        <path d="M135 203H159L153 211H136Z M136 693H160L154 686H141Z" />
      </g>
    </>
  )
}

function LoaderTerminal() {
  return (
    <g className={styles.terminal} fill={TERMINAL_RED} xmlSpace="preserve">
      {TERMINAL_LINES.map((line, index) => (
        <text
          key={index}
          x="77" y={243 + index * 15}
          data-terminal-line
          fontWeight={line.startsWith('[') ? 600 : undefined}
          letterSpacing={line.startsWith('---') ? '-0.35' : undefined}
        >
          {line}
        </text>
      ))}
      <rect data-terminal-hover x="73" y="230" width="112" height="442" fill="transparent" />
    </g>
  )
}

function LoaderScanner() {
  return (
    <>
      <defs>
        <mask id="hud-helmet-reveal" maskUnits="userSpaceOnUse" x="560" y="220" width="320" height="470">
          <g fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round">
            {/* Broad guide strokes expose filled compound paths without changing their outlines. */}
            <path data-helmet-guide strokeWidth="34" d="M584 447 587 385 601 296Q637 233 720 233T842 296L856 385 856 447" />
            <path data-helmet-guide strokeWidth="63" d="M621 301Q718 245 820 301L820 346H621V394H820" />
            <path data-helmet-guide strokeWidth="47" d="M585 421 590 493 608 578 673 663M857 421 850 493 835 578 772 663" />
            <path data-helmet-guide strokeWidth="65" d="M604 427Q667 453 721 438T838 427" />
            <path data-helmet-guide strokeWidth="68" d="M615 474 658 531 694 595H752L785 531 827 474" />
            <path data-helmet-guide strokeWidth="48" d="M633 586 660 616 695 613H748L784 616 811 586M676 649H774" />
          </g>
          <rect data-helmet-finish x="560" y="220" width="320" height="470" fill="white" />
        </mask>
      </defs>
      <g data-scanner fill="none" stroke={RED} strokeWidth="4.9">
        <path data-arc d="M541 258C637 150 806 150 903 261" />
        <path data-arc d="M541 647C641 756 802 753 903 644" />
      </g>
      <g data-helmet mask="url(#hud-helmet-reveal)"><HelmetArtwork /></g>
    </>
  )
}

function LoaderRuler() {
  return (
    <>
      <defs>
        <linearGradient id="hud-ruler-edge" data-ruler-edge gradientUnits="userSpaceOnUse" x1="1308" x2="1309" y1="0" y2="0">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="hud-ruler-mask">
          <rect x="133" y="744" width="1175" height="39" fill="url(#hud-ruler-edge)" />
        </mask>
      </defs>
      <g mask="url(#hud-ruler-mask)" stroke={RED} fill="none" shapeRendering="crispEdges">
        <path d="M134 781H1307" strokeWidth="2" />
        <path d={RULER} strokeWidth="2.5" />
      </g>
    </>
  )
}

function LoaderBrandReveal() {
  return (
    <g data-brand fill={RED}>
      <rect data-brand-fill x="371" y="333" width="96" height="96" fill="#220100" />
      <path data-brand-path d="M371 341 376 333H395L398 337H440L444 333H461L467 343M371 421 376 429H395L398 425H440L444 429H461L467 420" stroke={RED} strokeWidth="1.65" fill="none" />
      <path data-brand-fill d="M395 335H443L440 342H398Z M398 420H440L443 427H395Z" />
      {Array.from({ length: 9 }, (_, index) => {
        const y = 333 + index * 25
        return (
          <g key={y} data-brand-bar>
            <rect x="487" y={y} width="20" height="10" />
            <path d={`M516 ${y + 4.5}H529`} stroke={RED} />
          </g>
        )
      })}
      <path data-brand-marker d="M459 528 478 537.5 459 547Z" />
      <defs>
        <clipPath id="hud-logo-clip">
          <rect data-logo-clip x="381.5" y="337.5" width="76" height="88" />
        </clipPath>
      </defs>
      <image data-logo href="/assets/svg/10x10-cube.svg" x="381.5" y="337.5" width="76" height="88" clipPath="url(#hud-logo-clip)" />
    </g>
  )
}

export function LoaderArtwork() {
  return (
    <>
      <LoaderBackground />
      <div className={styles.stage} data-camera-fit aria-hidden="true">
        <div className={styles.camera} data-camera>
          <div className={styles.plane} data-depth-grid>
            <svg className={styles.artwork} viewBox="0 0 1440 832" focusable="false">
              <LoaderGrid />
            </svg>
          </div>
          <div className={styles.plane}>
            <svg className={styles.artwork} viewBox="0 0 1440 832" focusable="false">
              <LoaderFrame />
              <LoaderTerminal />
              <text
                data-message className={styles.message} fill="#f50502"
                x="720" y="445" textAnchor="middle" textLength="386" lengthAdjust="spacingAndGlyphs"
              >
                {MESSAGE}
              </text>
              <LoaderRuler />
            </svg>
          </div>
          <div className={styles.plane} data-depth-scanner>
            <svg className={styles.artwork} viewBox="0 0 1440 832" focusable="false">
              <LoaderScanner />
            </svg>
          </div>
          <div className={styles.plane} data-depth-brand>
            <svg className={styles.artwork} viewBox="0 0 1440 832" focusable="false">
              <LoaderBrandReveal />
            </svg>
          </div>
        </div>
      </div>
    </>
  )
}
