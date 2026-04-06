import QRCode from 'qrcode'
import { NextRequest } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  const png = await QRCode.toBuffer(code, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  })

  return new Response(png as unknown as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
