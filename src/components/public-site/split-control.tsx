import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'

type Direction = 'right' | 'down' | 'left'
type Variant = 'dark' | 'white'

function Arrow({ direction }: { direction: Direction }) {
  if (direction === 'down') {
    return (
      <svg viewBox="0 0 19 26" aria-hidden="true">
        <path d="M9.5 0v24M1 15.5 9.5 24l8.5-8.5" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 26 19"
      aria-hidden="true"
      className={direction === 'left' ? 'split-control__arrow--left' : undefined}
    >
      <path d="M0 9.5h24M15.5 1 24 9.5 15.5 18" />
    </svg>
  )
}

function SplitControlContent({ label, direction }: { label: string; direction: Direction }) {
  return (
    <span className="split-control__inner">
      <span className="split-control__text">
        <span className="split-control__label">
          <span>{label}</span>
          <span aria-hidden="true">{label}</span>
        </span>
      </span>
      <span className="split-control__icon">
        <span className="split-control__arrow">
          <Arrow direction={direction} />
          <Arrow direction={direction} />
        </span>
      </span>
    </span>
  )
}

type SplitLinkProps = {
  href: string
  label: string
  direction?: Direction
  variant?: Variant
  className?: string
  external?: boolean
} & Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel' | 'aria-label'>

export function SplitLink({
  href,
  label,
  direction = 'right',
  variant = 'dark',
  className = '',
  external,
  target,
  rel,
  'aria-label': ariaLabel,
}: SplitLinkProps) {
  const classes = `split-control split-control--${direction} split-control--${variant} ${className}`.trim()
  const content = <SplitControlContent label={label} direction={direction} />
  const isExternal = external ?? /^(https?:|mailto:|tel:)/.test(href)
  const accessibleLabel = ariaLabel ?? (target === '_blank' ? `${label} (opens in a new tab)` : undefined)

  if (isExternal) {
    return (
      <a href={href} className={classes} target={target} rel={rel} aria-label={accessibleLabel}>
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className={classes} aria-label={accessibleLabel}>
      {content}
    </Link>
  )
}

type SplitButtonProps = {
  label: string
  direction?: Direction
  variant?: Variant
  className?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export function SplitButton({
  label,
  direction = 'right',
  variant = 'dark',
  className = '',
  type = 'button',
  ...props
}: SplitButtonProps) {
  const classes = `split-control split-control--${direction} split-control--${variant} ${className}`.trim()

  return (
    <button type={type} className={classes} {...props}>
      <SplitControlContent label={label} direction={direction} />
    </button>
  )
}
