// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'super_admin' | 'staff' | 'school' | 'hirer' | 'public'

export interface User {
  id: string
  auth_id: string
  email: string
  full_name: string | null
  role: UserRole
  organisation: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export type BookingType =
  | 'academic'
  | 'school'
  | 'public_event'
  | 'external_hire'
  | 'maintenance'
  | 'recurring'
  | 'vip'

export type BookingStatus =
  | 'pending'
  | 'proposed'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'blocked'
  | 'waitlisted'

export interface Booking {
  id: string
  user_id: string
  facility_id: string
  slot_id: string | null
  booking_type: BookingType
  status: BookingStatus
  title: string | null
  description: string | null
  attendee_count: number | null
  requirements: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  approved_by: string | null
  approved_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  series_id: string | null
  created_at: string
  updated_at: string
}

// ─── Slots ────────────────────────────────────────────────────────────────────

export type SlotStatus = 'available' | 'blocked' | 'booked' | 'maintenance'

export interface Slot {
  id: string
  facility_id: string
  date: string
  start_time: string
  end_time: string
  status: SlotStatus
  booking_id: string | null
  notes: string | null
  created_at: string
}

// ─── Events & Tickets ─────────────────────────────────────────────────────────

export interface Event {
  id: string
  booking_id: string | null
  title: string
  description: string | null
  event_date: string
  start_time: string
  end_time: string
  ticket_price: number
  max_capacity: number
  tickets_sold: number
  is_published: boolean
  is_free: boolean
  image_url: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export type TicketStatus = 'active' | 'used' | 'cancelled' | 'refunded'

export interface Ticket {
  id: string
  event_id: string
  user_id: string
  payment_id: string | null
  qr_code: string
  status: TicketStatus
  quantity: number
  checked_in_at: string | null
  created_at: string
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'

export interface Payment {
  id: string
  booking_id: string | null
  event_id: string | null
  user_id: string
  stripe_payment_id: string | null
  stripe_customer_id: string | null
  amount: number
  currency: string
  status: PaymentStatus
  payment_method: string | null
  refund_amount: number | null
  stripe_refund_id: string | null
  invoice_url: string | null
  receipt_url: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

// ─── Maintenance ──────────────────────────────────────────────────────────────

export type MaintenanceType =
  | 'routine'
  | 'emergency'
  | 'calibration'
  | 'installation'
  | 'inspection'

export type MaintenanceStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export interface MaintenanceWindow {
  id: string
  facility_id: string
  scheduled_by: string
  title: string
  maintenance_type: MaintenanceType
  start_datetime: string
  end_datetime: string
  notes: string | null
  status: MaintenanceStatus
  created_at: string
}

// ─── Facilities ───────────────────────────────────────────────────────────────

export interface Facility {
  id: string
  name: string
  description: string | null
  capacity: number | null
  is_active: boolean
  created_at: string
}

// ─── Agent types ──────────────────────────────────────────────────────────────

export interface AgentResult {
  success: boolean
  action_taken: string
  requires_human_review: boolean
  data?: Record<string, unknown>
  error?: string
  next_agent?: string
  communications_queued?: string[]
}
