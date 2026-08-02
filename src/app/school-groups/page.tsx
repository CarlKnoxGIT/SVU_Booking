import Image from 'next/image'
import { publicAsset } from '@/components/public-site/asset-path'
import { PublicShell } from '@/components/public-site/public-shell'
import { SplitLink } from '@/components/public-site/split-control'
import { SchoolInterestForm } from './school-interest-form'

export const metadata = {
  title: 'School Visits — Swinburne Virtual Universe',
  description:
    'Bring your class inside a 100m² curved LED wall. Curriculum-aligned immersive experiences for primary and secondary students — coming soon.',
}

export default function SchoolGroupsPage() {
  return (
    <PublicShell current="schools" pageClassName="service-page school-visits-page">
      <main id="main-content" className="scroll-container" tabIndex={-1}>
        <section className="service-hero page-section" data-reveal-section>
          <div className="service-hero__copy">
            <div>
              <h1>School visits</h1>
              <p className="service-hero__description">
                Curriculum-aligned sessions are being developed for students in Years 3–12. Register
                your interest to hear when school visits open.
              </p>
            </div>
            <div className="service-hero__intro">
              <SplitLink href="#programs" label="Explore programs" direction="down" />
            </div>
          </div>

          <figure className="service-hero__media" data-reveal-media>
            <Image
              src={publicAsset('/images/SVU01D.jpg')}
              alt="Students immersed in a large-scale scientific visualisation"
              fill
              priority
              sizes="100vw"
            />
            <figcaption>
              Students can explore astronomical scale, motion and evidence together with an expert
              presenter.
            </figcaption>
          </figure>
        </section>

        <section className="page-section" id="programs" data-reveal-section>
          <div className="programs-statement">
            <h2>
              Each presenter-led session connects curriculum concepts with real scientific data,
              large-scale visualisation and shared exploration.
            </h2>
          </div>

          <dl className="fact-grid fact-grid--four">
            <div>
              <dt>Display</dt>
              <dd>100m² curved LED wall</dd>
            </div>
            <div>
              <dt>Sound</dt>
              <dd>360° immersive audio</dd>
            </div>
            <div>
              <dt>Session length</dt>
              <dd>45–60 minutes</dd>
            </div>
            <div>
              <dt>Year levels</dt>
              <dd>Years 3–12</dd>
            </div>
          </dl>

          <div className="feature-grid feature-grid--three">
            <article className="feature-card" data-reveal-block>
              <span className="feature-card__number">Primary · Years 3–6</span>
              <h3>Our Solar System</h3>
              <p>
                Explore the planets, moons and the Sun through real NASA data and imagery, aligned
                with Earth and Space sciences.
              </p>
            </article>
            <article className="feature-card" data-reveal-block>
              <span className="feature-card__number">Lower secondary · Years 7–9</span>
              <h3>Scale of the Universe</h3>
              <p>
                Journey from Earth to the cosmic web while exploring distance, light-years and the
                structure of galaxies.
              </p>
            </article>
            <article className="feature-card" data-reveal-block>
              <span className="feature-card__number">VCE · Years 10–12</span>
              <h3>Stars &amp; Stellar Evolution</h3>
              <p>
                Use H-R diagrams and real astrophysical data to examine stellar lifecycles and
                supernovae, aligned with Unit 3/4 Physics.
              </p>
            </article>
          </div>
        </section>

        <section className="page-section journey-section" data-reveal-section>
          <div className="section-heading">
            <p className="eyebrow">What happens next</p>
            <h2>From interest to immersion.</h2>
          </div>

          <ol className="journey-list">
            <li data-reveal-block>
              <span>01</span>
              <div>
                <h3>Register your interest</h3>
                <p>
                  Tell us about your school, year levels and approximate student numbers. There is
                  no commitment at this stage.
                </p>
              </div>
            </li>
            <li data-reveal-block>
              <span>02</span>
              <div>
                <h3>We&apos;ll be in touch</h3>
                <p>
                  When sessions are ready, registered schools will hear first about availability
                  and pricing.
                </p>
              </div>
            </li>
            <li data-reveal-block>
              <span>03</span>
              <div>
                <h3>Visit the SVU</h3>
                <p>
                  Arrive at Swinburne&apos;s Hawthorn Campus and let an SVU facilitator run the full
                  immersive session. No preparation is required.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section
          className="page-section enquiry-section"
          id="register-interest"
          data-reveal-section
        >
          <div className="enquiry-section__intro">
            <p className="eyebrow">Register your interest</p>
            <h2>Tell us about your school.</h2>
            <p>
              There is no commitment. Register now and we&apos;ll contact you when school visits open.
            </p>
          </div>
          <SchoolInterestForm />
        </section>
      </main>
    </PublicShell>
  )
}
