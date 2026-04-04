import { NewEventForm } from './new-event-form'

export default function NewEventPage() {
  return (
    <div className="p-10 max-w-2xl">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Create event</h1>
        <p className="mt-1 text-sm text-white/35">New public event with ticketing.</p>
      </div>
      <NewEventForm />
    </div>
  )
}
