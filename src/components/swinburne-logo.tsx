import Image from 'next/image'

export default function SwinburneLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/images/swinburne-logo.svg"
      alt="Swinburne University of Technology"
      width={176}
      height={89}
      className={className}
      priority
    />
  )
}
