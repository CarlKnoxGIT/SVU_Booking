'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

interface Props {
  eventId: string
  ticketPrice: number
  isFree: boolean
  ticketsLeft: number
}

export function TicketCheckout({ eventId, ticketPrice, isFree, ticketsLeft }: Props) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = ticketPrice * quantity
  const maxQty = Math.min(ticketsLeft, 6)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

    if (isFree) {
      const res = await fetch(`${base}/api/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, quantity, name, email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); setLoading(false); return }
      router.push(`/events/${eventId}/tickets/success${data.qrCode ? `?qr=${data.qrCode}` : ''}`)
    } else {
      const res = await fetch(`${base}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, quantity }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); setLoading(false); return }
      window.location.href = data.url
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Price */}
      <div className="flex items-baseline justify-between text-base">
        <span className="text-white/75">{isFree ? 'Free entry' : `$${ticketPrice.toFixed(2)} per ticket`}</span>
        {!isFree && quantity > 1 && (
          <span className="text-white/75">Total: <span className="text-white font-semibold">${total.toFixed(2)}</span></span>
        )}
      </div>

      {/* Name + Email */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm text-white/70 font-medium">Name</Label>
          <Input id="name" type="text" required value={name} onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="border-white/20 bg-white/8 text-white text-base h-11 placeholder:text-white/30 focus-visible:ring-swin-red rounded-none" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-white/70 font-medium">Email</Label>
          <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="border-white/20 bg-white/8 text-white text-base h-11 placeholder:text-white/30 focus-visible:ring-swin-red rounded-none" />
        </div>
      </div>

      {/* Quantity */}
      <div>
        <p className="text-sm font-medium text-white/70 mb-3">Number of tickets</p>
        <div className="flex items-center gap-5">
          <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}
            className="w-11 h-11 flex items-center justify-center border border-white/20 text-white text-xl hover:border-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            −
          </button>
          <span className="text-3xl font-light text-white w-8 text-center">{quantity}</span>
          <button type="button" onClick={() => setQuantity(q => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty}
            className="w-11 h-11 flex items-center justify-center border border-white/20 text-white text-xl hover:border-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            +
          </button>
          <span className="text-sm text-white/60">{ticketsLeft} left</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" disabled={loading || !name || !email}
        className="w-full bg-swin-red hover:bg-swin-red-hover text-white py-4 text-lg font-semibold rounded-none">
        {loading ? 'Reserving…' : isFree ? `Reserve ${quantity > 1 ? quantity + ' ' : ''}free ticket${quantity > 1 ? 's' : ''}` : `Pay $${total.toFixed(2)}`}
      </Button>

      {!isFree && (
        <p className="text-sm text-white/50 text-center">Powered by Stripe. Secure payment.</p>
      )}
    </form>
  )
}
