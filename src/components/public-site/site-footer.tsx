import Image from 'next/image'
import Link from 'next/link'
import { publicAsset } from './asset-path'
import type { PublicPageId } from './site-header'

export function SiteFooter({ current }: { current: PublicPageId }) {
  return (
    <footer className="footer" data-reveal-section>
      <div className="footer-content">
        <div className="logo">
          <a
            href="https://www.swinburne.edu.au/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Swinburne University of Technology homepage (opens in a new tab)"
          >
            <Image
              src={publicAsset('/svu/swin-logo.svg')}
              alt=""
              width={100}
              height={50}
            />
          </a>
        </div>
        <div className="copyright">
          <p>
            We acknowledge and pay respects to the Elders and Traditional Owners of the land,
            the Wurundjeri People of the Kulin Nation. We pay our respects to their Elders past,
            present and emerging.
          </p>
          <p>
            Copyright © Swinburne University of Technology 2026. All Rights Reserved. Swinburne
            University of Technology, Hawthorn Campus, Melbourne.
          </p>
        </div>
        <div className="links">
          <div className="navigation">
            <h2>Navigation</h2>
            <Link href="/" aria-current={current === 'home' ? 'page' : undefined}>Home</Link>
            <Link href="/#about">About</Link>
            <Link href="/#contact">Contact</Link>
          </div>
          <div className="footer-services">
            <h2>Services</h2>
            <Link href="/events" aria-current={current === 'events' ? 'page' : undefined}>Public Events</Link>
            <Link href="/school-groups" aria-current={current === 'schools' ? 'page' : undefined}>School Visits</Link>
            <Link href="/enquire" aria-current={current === 'hire' ? 'page' : undefined}>Private Event Hire</Link>
            <a href="mailto:svu@swin.edu.au">Email the SVU</a>
            <Link href="/login">Staff Login</Link>
          </div>
        </div>
      </div>
      <div className="acronym" role="img" aria-label="SVU">
        <span aria-hidden="true" data-reveal-line>S</span>
        <span aria-hidden="true" data-reveal-line>V</span>
        <span aria-hidden="true" data-reveal-line>U</span>
      </div>
    </footer>
  )
}
