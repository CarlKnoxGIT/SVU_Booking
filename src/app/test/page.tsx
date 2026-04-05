import Link from 'next/link'

const FLOWS = [
  {
    section: 'Public',
    items: [
      { label: 'Browse events', href: '/events', desc: 'View upcoming events and sessions.' },
      { label: 'Book a ticket', href: '/events', desc: 'Pick an event → select tickets → checkout (use Stripe test card 4242 4242 4242 4242, any future expiry, any CVC).' },
      { label: 'School groups', href: '/school-groups', desc: 'View school group information and enquiry form.' },
      { label: 'Hire enquiry', href: '/enquire', desc: 'Submit a hire enquiry — Carl gets an email notification.' },
    ],
  },
  {
    section: 'Staff',
    items: [
      { label: 'Request staff access', href: '/staff/register', desc: 'Submit a staff access request using a @swin.edu.au email.' },
      { label: 'Staff login', href: '/login', desc: 'Log in as an existing staff member.' },
      { label: 'Book the SVU', href: '/staff/book', desc: 'Pick a time slot on the calendar to submit a booking request. Requires staff account.' },
    ],
  },
  {
    section: 'Admin',
    items: [
      { label: 'Admin dashboard', href: '/admin', desc: 'Unified admin page — bookings calendar, events, enquiries, staff requests, users.' },
      { label: 'Approve a booking', href: '/admin#bookings', desc: 'Click any booking block in the calendar to approve or decline.' },
      { label: 'Approve staff request', href: '/admin#staff-requests', desc: 'Approve a staff access request to send the invite email.' },
      { label: 'Check in', href: '/admin#checkin', desc: 'Scan a ticket QR code to mark attendance.' },
    ],
  },
  {
    section: 'Ticket flow',
    items: [
      { label: 'Stripe test card', href: 'https://stripe.com/docs/testing', desc: '4242 4242 4242 4242 · Any future date · Any 3-digit CVC · Any postcode.' },
      { label: 'Check confirmation email', href: '#', desc: 'After booking, check your inbox for the QR code confirmation email.' },
      { label: 'Scan QR at check-in', href: '/admin#checkin', desc: 'Use the admin check-in scanner to scan the QR from the email.' },
    ],
  },
]

export default function TestPage() {
  return (
    <main className="min-h-screen bg-black text-white px-8 py-14">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <p className="text-[10px] font-bold tracking-[0.2em] text-swin-red-light uppercase mb-3">Tester guide</p>
          <h1 className="text-3xl font-light tracking-tight text-white mb-2">SVU Booking — Beta</h1>
          <p className="text-[14px] text-white/40 leading-relaxed">
            Thanks for testing. Work through the flows below and note anything that feels broken, confusing, or missing.
            Send feedback to <a href="mailto:cknox@swin.edu.au" className="text-swin-red-light hover:text-swin-red-lighter transition-colors">cknox@swin.edu.au</a>.
          </p>
        </div>

        <div className="space-y-10">
          {FLOWS.map(group => (
            <div key={group.section}>
              <p className="text-[11px] font-bold tracking-[0.16em] text-white/25 uppercase mb-4">{group.section}</p>
              <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
                {group.items.map((item, i) => (
                  <div
                    key={item.href + i}
                    className={`flex items-start gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors ${i < group.items.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-white mb-0.5">{item.label}</p>
                      <p className="text-[12px] text-white/35 leading-relaxed">{item.desc}</p>
                    </div>
                    {!item.href.startsWith('http') && item.href !== '#' && (
                      <Link
                        href={item.href}
                        className="flex-shrink-0 mt-0.5 text-[12px] text-white/25 hover:text-swin-red-light transition-colors"
                      >
                        Open →
                      </Link>
                    )}
                    {item.href.startsWith('http') && (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 mt-0.5 text-[12px] text-white/25 hover:text-swin-red-light transition-colors"
                      >
                        Docs →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-5">
          <p className="text-[11px] font-bold tracking-[0.16em] text-white/25 uppercase mb-3">Stripe test cards</p>
          <div className="space-y-2 text-[13px]">
            {[
              { label: 'Success', value: '4242 4242 4242 4242' },
              { label: 'Declined', value: '4000 0000 0000 0002' },
              { label: 'Requires auth', value: '4000 0025 0000 3155' },
            ].map(c => (
              <div key={c.label} className="flex gap-4">
                <span className="w-28 text-white/30 flex-shrink-0">{c.label}</span>
                <span className="font-mono text-white/60">{c.value}</span>
              </div>
            ))}
            <p className="text-[12px] text-white/25 mt-3">Use any future expiry date, any 3-digit CVC, any postcode.</p>
          </div>
        </div>

        <p className="mt-10 text-[12px] text-white/15 text-center">
          SVU Booking · Swinburne, Hawthorn Campus · ATC Building, Room 103
        </p>
      </div>
    </main>
  )
}
