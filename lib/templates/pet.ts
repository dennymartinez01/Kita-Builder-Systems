import type { ThemeJson } from '@/types/database'

export const petTemplate: ThemeJson = {
  business_type: 'pet',
  business_name: '{{BUSINESS_NAME}}',
  theme: {
    primary: '#15803D',
    secondary: '#4ADE80',
    font: 'Inter',
    bg: '#F0FDF4',
  },
  sections: [
    {
      type: 'hero',
      data: {
        headline: 'Your Pet Deserves the Best Care.',
        sub: 'Experienced vets and groomers who treat your fur baby like family. Book online today.',
        cta: 'Book a Visit',
        image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&auto=format&fit=crop',
      },
    },
    {
      type: 'about',
      data: {
        title: 'About {{BUSINESS_NAME}}',
        body: 'We are passionate about animal health and happiness. Our certified vets and groomers provide gentle, expert care for dogs, cats, and all kinds of pets.',
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
        requires_field: 'pet_name',
        deposit_percent: 0,
        title: 'Book for Your Pet',
      },
    },
    {
      type: 'testimonials',
      data: {
        items: [
          { name: 'Tom & Biscuit 🐶', text: 'My dog loves coming here! The vet is so patient and kind.', rating: 5 },
          { name: 'Anna & Whiskers 🐱', text: 'Grooming was perfect. My cat looked beautiful and was calm after.', rating: 5 },
          { name: 'Leo H.', text: 'Vaccination and checkup done in 20 minutes. Very efficient team.', rating: 5 },
        ],
      },
    },
  ],
}

export const petDefaultServices = [
  { name: 'Vet Consultation', price: 75, duration_minutes: 30 },
  { name: 'Vaccination', price: 55, duration_minutes: 20 },
  { name: 'Full Grooming (Small Dog)', price: 65, duration_minutes: 60 },
  { name: 'Full Grooming (Large Dog)', price: 95, duration_minutes: 90 },
  { name: 'Dental Scaling', price: 120, duration_minutes: 45 },
]

export const petDefaultStaff = [
  { name: 'Dr. Sandra Lee', role: 'Veterinarian' },
  { name: 'Marcus Tan', role: 'Pet Groomer' },
  { name: 'Nina Cruz', role: 'Vet Nurse' },
]
