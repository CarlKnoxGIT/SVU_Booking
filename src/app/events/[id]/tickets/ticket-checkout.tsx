'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  eventId: string
  ticketPrice: number
  isFree: boolean
  ticketsLeft: number
}

export function TicketCheckout({ eventId, ticketPrice, isFree, ticketsLeft }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = ticketPrice * quantity
  const maxQty = Math.min(ticketsLeft, 10)

  async function handleCheckout() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, quantity }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Price */}
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] text-white/40">
          {isFree ? 'Free entry' : `$${ticketPrice.toFixed(2)} per ticket`}
        </span>
        {!isFree && quantity > 1 && (
          <span className="text-[13px] text-white/60">
            Total: <span className="text-white font-medium">${total.toFixed(2)}</span>
          </span>
        )}
      </div>

      {/* Quantity */}
      <div>
        <p className="text-[11px] font-bold tracking-[0.16em] text-white/25 uppercase mb-3">
          Quantity
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="w-9 h-9 flex items-center justify-center border border-white/10 text-white/60 hover:text-white hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            −
          </button>
          <span className="text-xl font-light text-white w-6 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
            disabled={quantity >= maxQty}
            className="w-9 h-9 flex items-center justify-center border border-white/10 text-white/60 hover:text-white hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            +
          </button>
          <span className="text-[12px] text-white/25 ml-1">{ticketsLeft} left</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-swin-red hover:bg-swin-red-hover text-white py-3 text-[15px] font-semibold rounded-none"
      >
        {loading
          ? 'Redirecting…'
          : isFree
          ? 'Reserve free tickets'
          : `Pay $${total.toFixed(2)}`}
      </Button>

      <p className="text-[11px] text-white/20 text-center leading-relaxed">
        Powered by Stripe. Your payment is secure.
      </p>
    </div>
  )
}
