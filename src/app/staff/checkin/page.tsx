import { QrScanner } from '@/app/admin/checkin/qr-scanner'

export default function StaffCheckInPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-5 max-w-lg mx-auto">
        <div className="mb-5">
          <h1 className="text-xl font-light text-white mb-0.5">Check-in</h1>
          <p className="text-white/30 text-[13px]">Scan a ticket QR code.</p>
        </div>
        <QrScanner />
      </div>
    </div>
  )
}
