import type { ReactNode } from 'react'
import { PublicPageEffects } from './public-page-effects'
import { SiteFooter } from './site-footer'
import { SiteHeader, type PublicPageId } from './site-header'

export function PublicShell({
  current,
  pageClassName,
  children,
}: {
  current: PublicPageId
  pageClassName?: string
  children: ReactNode
}) {
  return (
    <div className={`svu-public ${pageClassName ?? ''}`.trim()}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteHeader current={current} />
      <PublicPageEffects />
      {children}
      <SiteFooter current={current} />
    </div>
  )
}
