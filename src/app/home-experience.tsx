'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { publicAsset } from '@/components/public-site/asset-path'
import { SplitButton, SplitLink } from '@/components/public-site/split-control'

const aboutFeatures = [
  {
    key: 'environment',
    label: 'immersive visualisation environment',
    image: '/images/SVU07BCropped5.jpg',
    alt: 'A presenter guides an audience through a planetary visualisation',
    caption: 'A presenter uses the panoramic display to guide an audience through a planetary visualisation.',
  },
  {
    key: 'visitors',
    label: 'visitors',
    image: '/images/SVU01D.jpg',
    alt: 'Visitors wearing 3D glasses watch an astronomical visualisation',
    caption: 'Visitors experience astronomical imagery in three dimensions.',
  },
  {
    key: 'space',
    label: 'explore space',
    image: '/images/SVU20B.jpg',
    alt: 'Visitors point towards a close-up visualisation of Saturn',
    caption: 'Visitors explore Saturn at room scale on the curved display.',
  },
  {
    key: 'screens',
    label: 'traditional screens cannot.',
    image: '/images/SVU11C.jpg',
    alt: 'A presenter and audience surrounded by Saturn and the Milky Way',
    caption: 'The panoramic environment surrounds an audience with Saturn and the Milky Way.',
  },
] as const

const defaultAboutFeature = {
  image: '/images/SVU19BC.jpg',
  alt: 'Visitors standing before a panoramic astronomical visualisation',
  caption: 'The 100m² curved display turns scientific data into a shared, room-scale experience.',
}

const services = [
  {
    title: 'Public Events',
    description:
      'Curated shows blending real scientific data with cinematic visuals — from the birth of stars to the collision of black holes. Open to everyone.',
    cta: 'Browse Events',
    href: '/events',
    image: '/images/SVU07BCropped5.jpg',
    alt: 'Visitors experiencing an immersive space visualisation',
  },
  {
    title: 'School Visits',
    description:
      'Curriculum-aligned immersive sessions that bring space science to life for primary and secondary students, led by expert presenters.',
    cta: 'Register Interest',
    href: '/school-groups',
    image: '/images/SVU01D.jpg',
    alt: 'Students exploring scientific imagery in the Virtual Universe',
  },
  {
    title: 'Private Event Hire',
    description:
      'A customisable visualisation space for researchers, industry partners, and organisations to present data, host briefings, or stage private events.',
    cta: 'Enquire Now',
    href: '/enquire',
    image: '/images/SVU20B.jpg',
    alt: 'Guests gathered inside the Virtual Universe',
  },
] as const

export function HeroVideo() {
  const previewRef = useRef<HTMLVideoElement>(null)
  const fullVideoRef = useRef<HTMLVideoElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const launchRef = useRef<HTMLButtonElement>(null)
  const launchTimeRef = useRef(0)
  const [fullVideoActive, setFullVideoActive] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePlayback = () => {
      if (media.matches) previewRef.current?.pause()
      else previewRef.current?.play().catch(() => undefined)
    }

    updatePlayback()
    media.addEventListener('change', updatePlayback)
    return () => media.removeEventListener('change', updatePlayback)
  }, [])

  useEffect(() => {
    if (!fullVideoActive) return

    const fullVideo = fullVideoRef.current
    if (!fullVideo) return
    const playFromPreview = () => {
      if (!dialogRef.current?.open) return
      fullVideo.currentTime = launchTimeRef.current
      fullVideo.play().catch(() => undefined)
    }

    if (fullVideo.readyState >= HTMLMediaElement.HAVE_METADATA) playFromPreview()
    else fullVideo.addEventListener('loadedmetadata', playFromPreview, { once: true })

    return () => fullVideo.removeEventListener('loadedmetadata', playFromPreview)
  }, [fullVideoActive])

  const openVideo = () => {
    const dialog = dialogRef.current
    const preview = previewRef.current
    const fullVideo = fullVideoRef.current
    if (!dialog || !fullVideo) return

    if (preview) {
      launchTimeRef.current = preview.currentTime + 2
      preview.pause()
    }
    dialog.showModal()
    preview?.closest('.svu-public')?.classList.add('video-modal-open')
    if (fullVideoActive && fullVideo.readyState >= HTMLMediaElement.HAVE_METADATA) {
      fullVideo.currentTime = launchTimeRef.current
      fullVideo.play().catch(() => undefined)
    } else {
      setFullVideoActive(true)
    }
  }

  const closeVideo = () => {
    const dialog = dialogRef.current
    const preview = previewRef.current
    const fullVideo = fullVideoRef.current
    if (!dialog || !fullVideo) return

    fullVideo.pause()
    if (preview) {
      preview.currentTime = Math.max(0, (fullVideo.currentTime - 2) % 8)
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        preview.play().catch(() => undefined)
      }
    }
    dialog.close()
    preview?.closest('.svu-public')?.classList.remove('video-modal-open')
    launchRef.current?.focus()
  }

  return (
    <>
      <div
        className="video video-player"
        style={{ backgroundImage: `url("${publicAsset('/images/SVU19BC.jpg')}")` }}
        data-reveal-media
      >
        <video
          ref={previewRef}
          src={publicAsset('/svu/svu-preview.mp4')}
          poster={publicAsset('/images/SVU19BC.jpg')}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <button
          ref={launchRef}
          className="video-player__launch"
          type="button"
          aria-label="Open the Swinburne Virtual Universe video"
          aria-haspopup="dialog"
          aria-controls="hero-video-modal"
          onClick={openVideo}
        >
          <span className="video-player__hint">Watch the film</span>
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="video-modal"
        id="hero-video-modal"
        aria-label="Swinburne Virtual Universe video player"
        onCancel={(event) => {
          event.preventDefault()
          closeVideo()
        }}
      >
        <div className="video-modal__frame">
          <button className="video-modal__close" type="button" aria-label="Close video" onClick={closeVideo}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m4 4 16 16M20 4 4 20" />
            </svg>
          </button>
          <div className="video-modal__stage">
            <video
              ref={fullVideoRef}
              src={fullVideoActive ? publicAsset('/svu/svu-video.mp4') : undefined}
              poster={publicAsset('/images/SVU19BC.jpg')}
              controls
              playsInline
              preload="metadata"
            >
              Your browser does not support the video element.
            </video>
          </div>
        </div>
      </dialog>
    </>
  )
}

export function AboutExperience() {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const activeFeature = aboutFeatures.find((feature) => feature.key === activeKey) ?? defaultAboutFeature

  return (
    <section className="about page-section" id="about" data-reveal-section>
      <div
        className={`about-copy${activeKey ? ' is-interacting' : ''}`}
        onPointerLeave={(event) => {
          if (!event.currentTarget.contains(document.activeElement)) setActiveKey(null)
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActiveKey(null)
        }}
      >
        <div className="top-text">
          <h2 className="heading" data-reveal-line>About</h2>
          <p className="about-copy__sentence" data-reveal-line>The Swinburne Virtual Universe is an</p>
        </div>
        <div className="bottom-text" data-reveal-line>
          <p className="about-copy__sentence">
            <button
              type="button"
              className={`about-copy__trigger${activeKey === 'environment' ? ' is-active' : ''}`}
              aria-pressed={activeKey === 'environment'}
              onPointerEnter={() => setActiveKey('environment')}
              onFocus={() => setActiveKey('environment')}
              onClick={() => setActiveKey('environment')}
              onKeyDown={(event) => event.key === 'Escape' && setActiveKey(null)}
            >
              immersive visualisation environment
            </button>{' '}
            <span className="about-copy__part">that allows </span>
            <button
              type="button"
              className={`about-copy__trigger${activeKey === 'visitors' ? ' is-active' : ''}`}
              aria-pressed={activeKey === 'visitors'}
              onPointerEnter={() => setActiveKey('visitors')}
              onFocus={() => setActiveKey('visitors')}
              onClick={() => setActiveKey('visitors')}
              onKeyDown={(event) => event.key === 'Escape' && setActiveKey(null)}
            >
              visitors
            </button>{' '}
            <span className="about-copy__part">to </span>
            <button
              type="button"
              className={`about-copy__trigger${activeKey === 'space' ? ' is-active' : ''}`}
              aria-pressed={activeKey === 'space'}
              onPointerEnter={() => setActiveKey('space')}
              onFocus={() => setActiveKey('space')}
              onClick={() => setActiveKey('space')}
              onKeyDown={(event) => event.key === 'Escape' && setActiveKey(null)}
            >
              explore space
            </button>{' '}
            <span className="about-copy__part">in ways that </span>
            <button
              type="button"
              className={`about-copy__trigger${activeKey === 'screens' ? ' is-active' : ''}`}
              aria-pressed={activeKey === 'screens'}
              onPointerEnter={() => setActiveKey('screens')}
              onFocus={() => setActiveKey('screens')}
              onClick={() => setActiveKey('screens')}
              onKeyDown={(event) => event.key === 'Escape' && setActiveKey(null)}
            >
              traditional screens cannot.
            </button>
          </p>
        </div>
      </div>

      <div
        className="about-image-content"
        onPointerLeave={(event) => {
          if (!event.currentTarget.contains(document.activeElement)) setActiveKey(null)
        }}
      >
        <figure className="left-column" data-reveal-media>
          <Image
            key={activeFeature.image}
            src={publicAsset(activeFeature.image)}
            alt={activeFeature.alt}
            fill
            sizes="(max-width: 900px) 100vw, 66vw"
          />
        </figure>
        <div className="right-column" data-reveal-block>
          <div className="caption" aria-live="polite">
            <h3>Inside the SVU</h3>
            <p>{activeFeature.caption}</p>
          </div>
          <div className="wide-icons" aria-hidden="true">
            {[0, 1, 2].map((item) => (
              <Image
                key={item}
                src={publicAsset('/svu/icon-wide.svg')}
                alt=""
                width={463}
                height={53}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function ServicesExperience() {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = services[activeIndex]

  const step = (direction: number) => {
    setActiveIndex((index) => (index + direction + services.length) % services.length)
  }

  return (
    <section className="services page-section" id="services" data-reveal-section>
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        Showing {active.title}
      </p>
      <div className="left-column">
        <div className="image-container" data-reveal-media>
          <Image
            key={active.image}
            src={publicAsset(active.image)}
            alt={active.alt}
            fill
            sizes="(max-width: 900px) 100vw, 80vw"
          />
        </div>
        <div className="services-info" data-reveal-block>
          <div className="title">
            <h2>{active.title}</h2>
            <SplitLink href={active.href} label={active.cta} />
          </div>
          <div className="description">
            <p>{active.description}</p>
          </div>
          <div className="controls" role="group" aria-label="Browse services">
            <SplitButton label="Previous" direction="left" onClick={() => step(-1)} />
            <SplitButton label="Next" onClick={() => step(1)} />
          </div>
        </div>
      </div>
      <div className="right-column" role="group" aria-label="Choose a service">
        {services.map((service, index) => (
          <button
            key={service.title}
            type="button"
            className={`interactive-imgs${index === activeIndex ? ' active' : ''}`}
            aria-pressed={index === activeIndex}
            aria-label={`Show ${service.title}`}
            onClick={() => setActiveIndex(index)}
          >
            <Image
              src={publicAsset(service.image)}
              alt=""
              fill
              sizes="(max-width: 900px) 33vw, 20vw"
            />
            <span className="service-thumb__label">{service.title}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
