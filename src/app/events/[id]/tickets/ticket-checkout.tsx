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
  const maxQty = Math.min(ticketsLeft, 10)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isFree) {
      // Free reservation — no Stripe needed
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, quantity, name, email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); setLoading(false); return }
      router.push(`/events/${eventId}/tickets/success${data.qrCode ? `?qr=${data.qrCode}` : ''}`)
    } else {
      // Paid — redirect to Stripe
      const res = await fetch('/api/checkout', {
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Price */}
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="text-white/40">{isFree ? 'Free entry' : `$${ticketPrice.toFixed(2)} per ticket`}</span>
        {!isFree && quantity > 1 && (
          <span className="text-white/60">Total: <span className="text-white font-medium">${total.toFixed(2)}</span></span>
        )}
      </div>

      {/* Name + Email */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-[11px] text-white/40 uppercase tracking-wide">Name</Label>
          <Input id="name" type="text" required value={name} onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red rounded-none" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[11px] text-white/40 uppercase tracking-wide">Email</Label>
          <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:ring-swin-red rounded-none" />
        </div>
      </div>

      {/* Quantity */}
      <div>
        <p className="text-[11px] font-bold tracking-[0.16em] text-white/25 uppercase mb-3">Tickets</p>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}
            className="w-9 h-9 flex items-center justify-center border border-white/10 text-white/60 hover:text-white hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            −
          </button>
          <span className="text-xl font-light text-white w-6 text-center">{quantity}</span>
          <button type="button" onClick={() => setQuantity(q => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty}
            className="w-9 h-9 flex items-center justify-center border border-white/10 text-white/60 hover:text-white hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            +
          </button>
          <span className="text-[12px] text-white/25 ml-1">{ticketsLeft} left</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" disabled={loading || !name || !email}
        className="w-full bg-swin-red hover:bg-swin-red-hover text-white py-3 text-[15px] font-semibold rounded-none">
        {loading ? 'Reserving…' : isFree ? `Reserve ${quantity > 1 ? quantity + ' ' : ''}free ticket${quantity > 1 ? 's' : ''}` : `Pay $${total.toFixed(2)}`}
      </Button>

      {!isFree && (
        <p className="text-[11px] text-white/20 text-center">Powered by Stripe. Secure payment.</p>
      )}
    </form>
  )
}
