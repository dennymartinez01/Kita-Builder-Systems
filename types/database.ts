// KITA Builder Systems - Database Type Definitions
// Mirrors the Supabase schema exactly

export type BusinessType = 'salon' | 'clinic' | 'pet' | 'cafe' | 'mechanic'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Site {
  id: string
  slug: string
  business_name: string
  business_type: BusinessType
  owner_email: string | null
  owner_pin: string
  theme_json: ThemeJson
  published: boolean
  currency: string
  auto_confirm: boolean
  payment_status: 'unpaid' | 'paid' | 'free'
  stripe_customer_id: string | null
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  paid_at: string | null
  created_at: string
}

export interface ThemeJson {
  business_type: BusinessType
  business_name: string
  theme: {
    primary: string
    secondary: string
    font: string
    bg: string
  }
  sections: Section[]
}

export type Section =
  | HeroSection
  | ServicesSection
  | StaffSection
  | AboutSection
  | BookingSection
  | TestimonialsSection
  | GallerySection

export interface HeroSection {
  type: 'hero'
  data: {
    headline: string
    sub: string
    cta: string
    image_url?: string
  }
}

export interface ServicesSection {
  type: 'services'
  data: { source: 'services_table' }
}

export interface StaffSection {
  type: 'staff'
  data: { source: 'staff_table' }
}

export interface AboutSection {
  type: 'about'
  data: {
    title: string
    body: string
  }
}

export interface BookingSection {
  type: 'booking_widget'
  data: {
    requires_field: 'car_model' | 'pet_name' | 'none'
    deposit_percent: number
    title?: string
    notes_label?: string      // custom label for the notes field e.g. "Your Concern"
    notes_placeholder?: string // custom placeholder e.g. "What brings you in today?"
    notes_required?: boolean   // make notes required for this template
  }
}

export interface TestimonialsSection {
  type: 'testimonials'
  data: {
    items: { name: string; text: string; rating: number }[]
  }
}

export interface GallerySection {
  type: 'gallery'
  data: { images: string[] }
}

export interface Service {
  id: string
  site_id: string
  name: string
  price: number
  duration_minutes: number
  created_at: string
}

export interface Staff {
  id: string
  site_id: string
  name: string
  role: string
  avatar_url?: string
  created_at: string
}

export interface Booking {
  id: string
  site_id: string
  service_id: string | null
  customer_name: string
  customer_phone: string
  customer_email: string | null
  service_name: string
  booking_date: string
  booking_time: string
  car_model: string | null
  pet_name: string | null
  notes: string | null
  staff_id: string | null
  staff_name: string | null
  cancel_token: string | null
  rescheduled_from: string | null
  status: BookingStatus
  created_at: string
}

export interface BlockedDate {
  id: string
  site_id: string
  date: string
  start_time: string | null
  end_time: string | null
  reason: string | null
  created_at: string
}

// Supabase Database interface for createClient<Database>()
export interface Database {
  public: {
    Tables: {
      sites: {
        Row: Site
        Insert: Omit<Site, 'id' | 'created_at' | 'payment_status' | 'stripe_customer_id' | 'stripe_session_id' | 'stripe_payment_intent' | 'paid_at'>
        Update: Partial<Omit<Site, 'id' | 'created_at'>>
      }
      services: {
        Row: Service
        Insert: Omit<Service, 'id' | 'created_at'>
        Update: Partial<Omit<Service, 'id' | 'created_at'>>
      }
      staff: {
        Row: Staff
        Insert: Omit<Staff, 'id' | 'created_at'>
        Update: Partial<Omit<Staff, 'id' | 'created_at'>>
      }
      bookings: {
        Row: Booking
        Insert: Omit<Booking, 'id' | 'created_at'>
        Update: Partial<Omit<Booking, 'id' | 'created_at'>>
      }
    }
  }
}
