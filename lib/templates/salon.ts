import type { ThemeJson } from '@/types/database'

export const salonTemplate: ThemeJson = {
  business_type: 'salon',
  business_name: '{{BUSINESS_NAME}}',
  theme: {
    primary: '#1A1A2E',
    secondary: '#E94560',
    font: 'Inter',
    bg: '#FAFAFA',
  },
  sections: [
    {
      type: 'hero',
      data: {
        headline: 'Look Good. Feel Amazing.',
        sub: 'Book your appointment online — no calls needed. Same-day slots available.',
        cta: 'Book Now',
        image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop',
      },
    },
    {
      type: 'about',
      data: {
        title: 'About {{BUSINESS_NAME}}',
        body: 'We are a professional salon dedicated to making you look and feel your best. With experienced stylists and premium products, your transformation starts here.',
      },
    },
    {
      type: 'services',
      data: { source: 'services_table' },
    },
    {
      type: 'staff',
      data: { source: 'staff_table' },
    },
    {
      type: 'booking_widget',
      data: {
        requires_field: 'none',
        deposit_percent: 0,
        title: 'Book Your Appointment',
        notes_label: 'Preferred Style / Service Type',
        notes_placeholder: 'e.g. Balayage, keratin treatment, specific style reference...',
        notes_required: false,
      },
    },
    {
      type: 'testimonials',
      data: {
        items: [
          { name: 'Sarah M.', text: "Best salon I've been to! My hair has never looked this good.", rating: 5 },
          { name: 'James T.', text: 'Quick, clean, and professional. Will definitely be back.', rating: 5 },
          { name: 'Chloe R.', text: 'The team is so talented. They listened to exactly what I wanted.', rating: 5 },
        ],
      },
    },
  ],
}

export const salonDefaultServices = [
  { name: 'Haircut & Style', price: 65, duration_minutes: 45 },
  { name: 'Hair Color', price: 120, duration_minutes: 90 },
  { name: 'Blowout', price: 45, duration_minutes: 30 },
  { name: 'Beard Trim', price: 25, duration_minutes: 20 },
  { name: 'Full Color + Cut', price: 165, duration_minutes: 120 },
]

export const salonDefaultStaff = [
  { name: 'Alex Rivera', role: 'Senior Stylist' },
  { name: 'Jamie Chen', role: 'Color Specialist' },
  { name: 'Sam Park', role: 'Barber' },
]
