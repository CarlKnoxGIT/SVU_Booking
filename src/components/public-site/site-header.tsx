'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { publicAsset } from './asset-path'

export type PublicPageId = 'home' | 'events' | 'schools' | 'hire'

const serviceLinks: Array<{ id: Exclude<PublicPageId, 'home'>; href: string; label: string }> = [
  { id: 'events', href: '/events', label: 'Browse Events' },
  { id: 'schools', href: '/school-groups', label: 'School Visits' },
  { id: 'hire', href: '/enquire', label: 'Private Hires' },
]

export function SiteHeader({ current }: { current: PublicPageId }) {
  const headerRef = useRef<HTMLElement>(null)
  const servicesRef = useRef<HTMLLIElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [pointerInRevealZone, setPointerInRevealZone] = useState(false)
  const [pointerOverHeader, setPointerOverHeader] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)

  const headerVisible = scrolled || pointerInRevealZone || pointerOverHeader || hasFocus
  const currentService = current !== 'home'

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')

    const updateScroll = () => setScrolled(window.scrollY > 8)
    const updatePointerZone = (event: PointerEvent) => {
      setPointerInRevealZone(finePointer.matches && event.clientY <= window.innerHeight * 0.15)
    }
    const clearPointerZone = () => setPointerInRevealZone(false)

    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('pointermove', updatePointerZone, { passive: true })
    document.documentElement.addEventListener('pointerleave', clearPointerZone)

    return () => {
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('pointermove', updatePointerZone)
      document.documentElement.removeEventListener('pointerleave', clearPointerZone)
    }
  }, [])

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('click', closeOnOutsideClick)
    return () => document.removeEventListener('click', closeOnOutsideClick)
  }, [])

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
  }, [])

  const scheduleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => setMenuOpen(false), 140)
  }

  const schedulePointerClose = () => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) scheduleClose()
  }

  const openForFinePointer = () => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      setMenuOpen(true)
    }
  }

  const moveMenuFocus = (step: number) => {
    const links = Array.from(dropdownRef.current?.querySelectorAll('a') ?? [])
    if (!links.length) return
    const activeIndex = links.indexOf(document.activeElement as HTMLAnchorElement)
    const nextIndex = (activeIndex + step + links.length) % links.length
    links[nextIndex].focus()
  }

  return (
    <header
      ref={headerRef}
      className={`site-header${headerVisible ? ' is-visible' : ''}`}
      onPointerEnter={() => setPointerOverHeader(true)}
      onPointerLeave={() => setPointerOverHeader(false)}
      onFocus={() => setHasFocus(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHasFocus(false)
        }
      }}
    >
      <div className="site-header__inner">
        <Link
          className="site-nav__brand"
          href="/"
          aria-label="Swinburne Virtual Universe home"
          aria-current={current === 'home' ? 'page' : undefined}
        >
          <span className="site-nav__brand-art" aria-hidden="true">
            <Image
              src={publicAsset('/svu/swin-logo.svg')}
              alt=""
              width={100}
              height={50}
              priority
            />
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          <ul className="site-nav__list">
            <li className="site-nav__item">
              <Link className="site-nav__link" href="/#about">
                <span className="site-nav__label">About</span>
              </Link>
            </li>
            <li
              ref={servicesRef}
              className={`site-nav__item site-nav__services${menuOpen ? ' is-open' : ''}${currentService ? ' is-current-section' : ''}`}
              onPointerEnter={openForFinePointer}
              onPointerLeave={schedulePointerClose}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) scheduleClose()
              }}
            >
              <button
                className="site-nav__trigger"
                type="button"
                aria-expanded={menuOpen}
                aria-controls="site-services-menu"
                onClick={() => {
                  if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
                  setMenuOpen((open) => !open)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    setMenuOpen(true)
                    requestAnimationFrame(() => dropdownRef.current?.querySelector('a')?.focus())
                  }
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    setMenuOpen(false)
                  }
                }}
              >
                <span className="site-nav__label">Services</span>
                <svg viewBox="0 0 19 26" aria-hidden="true">
                  <path d="M9.5 0v24M1 15.5 9.5 24l8.5-8.5" />
                </svg>
              </button>
              <ul
                ref={dropdownRef}
                className="site-nav__dropdown"
                id="site-services-menu"
                hidden={!menuOpen}
                inert={!menuOpen}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    setMenuOpen(false)
                    servicesRef.current?.querySelector('button')?.focus()
                  } else if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    moveMenuFocus(1)
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    moveMenuFocus(-1)
                  }
                }}
              >
                {serviceLinks.map((link) => (
                  <li key={link.id}>
                    <Link
                      className="site-nav__dropdown-link"
                      href={link.href}
                      aria-current={current === link.id ? 'page' : undefined}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="site-nav__label">{link.label}</span>
                      <svg className="site-nav__selection-icon" viewBox="0 0 36 24" aria-hidden="true">
                        <path d="M1 12h32M23 2l10 10-10 10" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className="site-nav__item">
              <Link className="site-nav__link" href="/#contact">
                <span className="site-nav__label">Contact</span>
              </Link>
            </li>
          </ul>
        </nav>

        <Link className="site-nav__staff" href="/login">
          Staff Login
        </Link>
      </div>
    </header>
  )
}
