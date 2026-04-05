import { QrScanner } from './qr-scanner'

export default function CheckInPage() {
  return (
    <div className="p-8 max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-white mb-1">Check-in</h1>
        <p className="text-white/30 text-[13px]">Scan a ticket QR code or enter the code manually.</p>
      </div>

      <QrScanner />
    </div>
  )
}
