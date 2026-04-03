import { BookingForm } from './booking-form'

export default function NewBookingPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">New booking request</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Fill in your session details. Staff bookings are auto-approved if no conflict exists.
        </p>
      </div>

      <div className="max-w-2xl">
        <BookingForm />
      </div>
    </div>
  )
}
