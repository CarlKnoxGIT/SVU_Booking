'use client'

import dynamic from 'next/dynamic'

const SaturnAnimation = dynamic(
  () => import('./saturn-animation').then(m => m.SaturnAnimation),
  { ssr: false }
)

export function SaturnAnimationLoader({ children }: { children?: React.ReactNode }) {
  return <SaturnAnimation>{children}</SaturnAnimation>
}
