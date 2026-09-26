import type { ThemeJson } from '@/types/database'

export const clinicTemplate: ThemeJson = {
  business_type: 'clinic',
  business_name: '{{BUSINESS_NAME}}',
  theme: {
    primary: '#0369A1',
    secondary: '#0EA5E9',
    font: 'Inter',
    bg: '#F0F9FF',
  },
  sections: [
    {
      type: 'hero',
      data: {
        headline: 'Trusted Care When You Need It Most.',
        sub: 'Book a consultation online — fast, easy, and available 24/7.',
        cta: 'Book Appointment',
        image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop',
      },
    },
    {
      type: 'about',
      data: {
        title: 'About {{BUSINESS_NAME}}',
        body: 'We provide compassionate, high-quality healthcare for patients of all ages. Our experienced team is committed to your health and well-being.',
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
        title: 'Book a Consultation',
        notes_label: 'Your Concern',
        notes_placeholder: 'e.g. Tooth pain, general checkup, skin concern, vaccination...',
        notes_required: true,
      },
    },
    {
      type: 'testimonials',
      data: {
        items: [
          { name: 'Maria L.', text: 'The doctor was thorough and took time to explain everything clearly.', rating: 5 },
          { name: 'David K.', text: 'Booked online and was seen within the hour. Very professional.', rating: 5 },
          { name: 'Priya S.', text: 'Clean, efficient, and caring staff. Highly recommend.', rating: 5 },
        ],
      },
    },
  ],
}

export const clinicDefaultServices = [
  { name: 'General Consultation', price: 95, duration_minutes: 30 },
  { name: 'Dental Checkup & Clean', price: 150, duration_minutes: 60 },
  { name: 'Tooth Filling', price: 200, duration_minutes: 45 },
  { name: 'Blood Test', price: 80, duration_minutes: 20 },
  { name: 'Annual Health Check', price: 250, duration_minutes: 90 },
]

export const clinicDefaultStaff = [
  { name: 'Dr. Emily Watson', role: 'General Practitioner' },
  { name: 'Dr. Michael Torres', role: 'Dentist' },
  { name: 'Nurse Rachel Kim', role: 'Head Nurse' },
]
