import Image from 'next/image'
import { FooterHudText } from './FooterHudText'
import styles from './site-footer.module.css'

export function SiteFooter() {
  return (
    <footer className={styles.footer} aria-labelledby="footer-title">
      <div className={styles.copy}>
        <h2 id="footer-title">Ready to Build an Exhibition That Performs?</h2>
        <p>
          Whether it&apos;s a fully custom build, or a multi show programme, we&apos;re here to help you plan it.
          <span className={styles.closing}>Let&apos;s start the conversation.</span>
        </p>
      </div>
      <div className={styles.artwork} aria-hidden="true">
        <Image src="/assets/svg/footer-hud.svg" alt="" width={1440} height={763} unoptimized />
        <FooterHudText />
        <span className={styles.reactorGlow} />
      </div>
    </footer>
  )
}
