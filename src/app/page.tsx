import Image from 'next/image'
import { PublicShell } from '@/components/public-site/public-shell'
import { publicAsset } from '@/components/public-site/asset-path'
import { SplitLink } from '@/components/public-site/split-control'
import { CountUp } from '@/components/visitor-stats/count-up'
import { createClient } from '@/lib/supabase/server'
import { AboutExperience, HeroVideo, ServicesExperience } from './home-experience'

export const metadata = {
  title: 'Swinburne Virtual Universe',
  description:
    'Explore immersive public events, school visits, and private experiences at the Swinburne Virtual Universe.',
}

export const revalidate = 60

async function getVisitorStats() {
  const supabase = await createClient()
  const [{ data: cats }, { data: entries }] = await Promise.all([
    supabase
      .from('visitor_categories')
      .select('id, slug, label, sort_order, is_active, is_activity')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase.from('visitor_entries').select('category_id, count'),
  ])

  const totals = new Map<string, number>()
  for (const entry of entries ?? []) {
    totals.set(entry.category_id, (totals.get(entry.category_id) ?? 0) + (entry.count ?? 0))
  }

  const rawBreakdown = (cats ?? []).map((category) => ({
    id: category.id,
    slug: category.slug as string,
    label: category.label,
    is_activity: !!category.is_activity,
    total: totals.get(category.id) ?? 0,
  }))

  const heroTotal = rawBreakdown
    .filter((category) => !category.is_activity)
    .reduce((sum, category) => sum + category.total, 0)

  // Display-only merges/relabels for the public tiles. The entry form on
  // /staff/visitors keeps the underlying categories distinct.
  const vipTotal = rawBreakdown.find((category) => category.slug === 'vip')?.total ?? 0
  const breakdown = rawBreakdown.flatMap((category) => {
    if (category.slug === 'vip') return []
    if (category.slug === 'industry') {
      return [{ ...category, label: 'Industry and VIP', total: category.total + vipTotal }]
    }
    if (category.slug === 'academics') {
      return [{ ...category, label: 'Academics and staff' }]
    }
    return [category]
  })

  return { heroTotal, breakdown }
}

export default async function Home() {
  const { heroTotal, breakdown } = await getVisitorStats()
  const showVisitorSection = breakdown.length > 0

  return (
    <PublicShell current="home" pageClassName="home-page">
      <main id="main-content" className="scroll-container" tabIndex={-1}>
        <section className="hero page-section" data-reveal-section>
          <div className="text">
            <div className="left-column">
              <h1 data-reveal-line>Welcome to the Swinburne Virtual Universe</h1>
            </div>
            <div className="right-column">
              <p data-reveal-line>
                The Swinburne Virtual Universe combines immersive visualisation, real scientific data,
                and cutting-edge technology to transform how we explore, communicate, and experience space.
              </p>
              <div className="hero-buttons" data-reveal-block>
                <SplitLink href="/#about" label="Learn More" />
                <SplitLink href="/#about" label="Scroll Down" direction="down" />
              </div>
            </div>
          </div>
          <HeroVideo />
        </section>

        <AboutExperience />

        <section className="stats page-section" aria-labelledby="technology-heading" data-reveal-section>
          <div className="left-column" data-reveal-media>
            <Image
              src={publicAsset('/images/SVU11C.jpg')}
              alt="A presenter and audience surrounded by a panoramic view of Saturn and the Milky Way"
              fill
              sizes="(max-width: 900px) 100vw, 45vw"
            />
            <div className="stats__media-content">
              <Image src={publicAsset('/svu/icon-wide.svg')} alt="" width={463} height={53} />
              <p>Immersive science, rendered at room scale.</p>
            </div>
          </div>
          <div className="right-column">
            <div className="top-row">
              <div className="resolution" data-reveal-block>
                <h2 id="technology-heading">100m<sup>2</sup>, 45 megapixel LED wall</h2>
                <p>A vast curved canvas built for stereoscopic scientific visualisation.</p>
              </div>
              <div className="audio" data-reveal-block>
                <h2>360-degree spatial audio system</h2>
                <p>Twelve-channel sound places audiences inside the story.</p>
              </div>
            </div>
            <div className="bottom-row">
              <div className="data" data-reveal-block>
                <h2>Real scientific data</h2>
                <p>Research datasets become explorable worlds, not distant abstractions.</p>
              </div>
              <figure className="square-img" data-reveal-media>
                <Image
                  src={publicAsset('/images/SVU01D.jpg')}
                  alt="Students wearing 3D glasses inside the Virtual Universe"
                  fill
                  sizes="(max-width: 900px) 100vw, 30vw"
                />
                <figcaption>Students explore astronomical imagery together in three dimensions.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {showVisitorSection && (
          <section className="visitor-live page-section" aria-labelledby="visitor-heading" data-reveal-section>
            <div className="visitor-live__intro">
              <p className="eyebrow" data-reveal-line>Since opening the SVU</p>
              <h2 id="visitor-heading" data-reveal-line>Lives touched. Universes shared.</h2>
              <p data-reveal-line>
                A live record of the students, researchers, partners, and community members who have
                stepped inside the Swinburne Virtual Universe.
              </p>
            </div>
            <div className="visitor-live__data" data-reveal-block>
              {heroTotal > 0 && (
                <div className="visitor-live__total">
                  <span>Total visitors</span>
                  <strong><CountUp value={heroTotal} /></strong>
                </div>
              )}
              <div className={`visitor-grid${breakdown.length === 4 ? ' visitor-grid--four' : ''}`}>
                {breakdown.map((category) => (
                  <div key={category.id}>
                    <span>{category.label}</span>
                    <strong><CountUp value={category.total} /></strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <ServicesExperience />

        <section
          className="contact page-section"
          id="contact"
          style={{ backgroundImage: `url("${publicAsset('/svu/svu-reversed.jpg')}")` }}
          data-reveal-section
        >
          <div className="overlay" />
          <div className="text">
            <h2 data-reveal-line>The universe is just getting started.</h2>
            <div data-reveal-block>
              <SplitLink href="/enquire#enquire" label="Get in Touch" variant="white" />
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  )
}
