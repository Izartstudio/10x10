import { IntroExperience } from '@/components/hero/IntroExperience'
import { ExhibitionServices } from '@/components/sections/services/ExhibitionServices'
import { HowWeWork } from '@/components/sections/process/HowWeWork'
import { WhoWeAre } from '@/components/sections/about/WhoWeAre'
import { WhyClientsComeBack } from '@/components/sections/clients/WhyClientsComeBack'
import { SameStandards } from '@/components/sections/markets/SameStandards'
import { ShowsDelivered } from '@/components/sections/shows/ShowsDelivered'
import { Testimonials } from '@/components/sections/testimonials/Testimonials'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { OurWork } from '@/components/sections/work/OurWork'
import { LoaderArtwork } from '@/components/loader/LoaderArtwork'
import aboutStyles from '@/components/sections/about/about.module.css'

export default function Page() {
  return (
    <IntroExperience
      artwork={<LoaderArtwork />}
      footer={<SiteFooter />}
      backHref={process.env.BACK_TO_WEBSITE_URL || 'https://www.10x10booths.com/'}
    >
      <div className="section-frame section-frame--services">
        <ExhibitionServices />
        <HowWeWork />
      </div>
      <div className={aboutStyles.companyBackdrop}>
        <WhoWeAre />
        <div className="section-frame section-frame--clients">
          <WhyClientsComeBack />
        </div>
      </div>
      <div className="section-frame section-frame--continued">
        <SameStandards />
        <ShowsDelivered />
        <Testimonials />
        <OurWork />
      </div>
    </IntroExperience>
  )
}
