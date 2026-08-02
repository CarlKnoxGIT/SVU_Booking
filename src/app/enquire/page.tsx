import Image from 'next/image'
import { PublicShell } from '@/components/public-site/public-shell'
import { publicAsset } from '@/components/public-site/asset-path'
import { SplitLink } from '@/components/public-site/split-control'
import { EnquiryForm } from './enquiry-form'

export const metadata = {
  title: 'Enquire — Swinburne Virtual Universe',
  description: 'Enquire about hiring the SVU for corporate events, product launches, or private experiences.',
}

export default function EnquirePage() {
  return (
    <PublicShell current="hire" pageClassName="service-page private-hire-page">
      <main id="main-content" className="scroll-container" tabIndex={-1}>
        <section className="service-hero page-section" data-reveal-section>
          <div className="service-hero__copy">
            <div>
              <h1 data-reveal-line>Private event hire</h1>
              <p className="service-hero__description" data-reveal-line>
                Plan a tailored private experience for an organisation, industry partner, research
                team, or creative collaborator.
              </p>
            </div>
            <div className="service-hero__intro" data-reveal-block>
              <SplitLink href="/enquire#event-support" label="Explore support" direction="down" />
            </div>
          </div>
          <figure className="service-hero__media" data-reveal-media>
            <Image
              src={publicAsset('/images/SVU20B.jpg')}
              alt="Guests gathered for a presentation inside the Swinburne Virtual Universe"
              fill
              priority
              sizes="100vw"
            />
            <figcaption>
              Private events can combine presentation, visualisation, and performance in one shared environment.
            </figcaption>
          </figure>
        </section>

        <section className="page-section editorial-split" id="event-support" data-reveal-section>
          <div className="section-heading">
            <p className="eyebrow" data-reveal-line>Event support</p>
            <h2 data-reveal-line>Supported from setup to pack-down.</h2>
          </div>
          <div className="editorial-split__content">
            <p className="large-copy" data-reveal-line>Bring the brief. The SVU team will help deliver it.</p>
            <p data-reveal-line>
              The team works with you to shape the format, prepare custom content, configure and test
              the space, operate the run of show, and manage pack-down.
            </p>
            <ol className="support-list">
              {[
                {
                  number: '01',
                  title: 'Scope and prepare',
                  copy: 'Confirm the audience, format, timing, and visual or audio content needed for the event.',
                },
                {
                  number: '02',
                  title: 'Set up and test',
                  copy: 'Configure the room, prepare the LED wall and spatial audio, and test content before guests arrive.',
                },
                {
                  number: '03',
                  title: 'Run the event',
                  copy: 'A dedicated technical operator supports the run of show and pack-down.',
                },
              ].map((step) => (
                <li key={step.number} data-reveal-block>
                  <span>{step.number}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
            <dl className="detail-list" data-reveal-block>
              <div>
                <dt>Content</dt>
                <dd>Bring your own visuals or develop something bespoke with the team</dd>
              </div>
              <div>
                <dt>Technical support</dt>
                <dd>Dedicated operator for setup, run of show, and pack-down</dd>
              </div>
              <div>
                <dt>Capacity</dt>
                <dd>Up to 60 guests in seated or standing configurations</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>Advanced Technologies Centre, Hawthorn Campus</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="page-section location-section" id="location" data-reveal-section>
          <div className="location-section__intro">
            <p className="eyebrow" data-reveal-line>Find the SVU</p>
            <h2 data-reveal-line>Inside the ATC at Hawthorn.</h2>
            <p data-reveal-line>
              The Swinburne Virtual Universe is located in the Advanced Technologies Centre at
              427–451 Burwood Road, Hawthorn.
            </p>
            <div data-reveal-block>
              <SplitLink
                href="https://www.google.com/maps/dir/?api=1&destination=-37.82267,145.0384"
                label="Open directions"
                external
                target="_blank"
                rel="noopener noreferrer"
              />
            </div>
          </div>
          <div className="campus-map" data-reveal-block role="region" aria-label="Map showing the Advanced Technologies Centre at Swinburne's Hawthorn campus">
            <iframe
              className="campus-map__iframe"
              title="Advanced Technologies Centre at Swinburne Hawthorn"
              src="https://www.openstreetmap.org/export/embed.html?bbox=145.029%2C-37.828%2C145.048%2C-37.817&layer=mapnik&marker=-37.82267%2C145.0384"
              loading="lazy"
            />
            <div className="campus-map__label">
              <span>Destination</span>
              <strong>ATC / SVU</strong>
              <span>427–451 Burwood Road, Hawthorn</span>
            </div>
          </div>
        </section>

        <section className="page-section enquiry-section" id="enquire" data-reveal-section>
          <div className="enquiry-section__intro">
            <p className="eyebrow" data-reveal-line>Register your interest</p>
            <h2 data-reveal-line>Tell us what you want to create.</h2>
            <p data-reveal-line>
              Share the shape of your event and the SVU team will get back to you within two business days.
            </p>
          </div>
          <div data-reveal-block>
            <EnquiryForm />
          </div>
        </section>
      </main>
    </PublicShell>
  )
}
