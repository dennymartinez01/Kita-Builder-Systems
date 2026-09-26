import type { ThemeJson } from '@/types/database'

export const mechanicTemplate: ThemeJson = {
  business_type: 'mechanic',
  business_name: '{{BUSINESS_NAME}}',
  theme: {
    primary: '#1C1C1C',
    secondary: '#EF4444',
    font: 'Inter',
    bg: '#F8F8F8',
  },
  sections: [
    {
      type: 'hero',
      data: {
        headline: 'Fast. Honest. Reliable Auto Care.',
        sub: "Book your service online — tell us your car, pick a time, we'll handle the rest.",
        cta: 'Book a Service',
        image_url: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=1200&auto=format&fit=crop',
      },
    },
    {
      type: 'about',
      data: {
        title: 'About {{BUSINESS_NAME}}',
        body: 'We are a trusted local mechanic shop with years of experience servicing all makes and models. Honest pricing, quality parts, and fast turnaround — every time.',
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
        requires_field: 'car_model',
        deposit_percent: 0,
        title: 'Book Your Car Service',
        notes_label: 'Additional Notes',
        notes_placeholder: 'e.g. Strange noise from brakes, car has not been serviced in 2 years...',
        notes_required: false,
      },
    },
    {
      type: 'testimonials',
      data: {
        items: [
          { name: 'Craig B.', text: 'Fixed my brakes same day. Fair pricing and they showed me exactly what was wrong.', rating: 5 },
          { name: 'Natasha V.', text: "I finally found a mechanic I can trust. Won't go anywhere else.", rating: 5 },
          { name: 'Steve L.', text: 'Booked online, dropped car off, picked it up 3 hours later. Perfect.', rating: 5 },
        ],
      },
    },
  ],
}

export const mechanicDefaultServices = [
  { name: 'Oil & Filter Change', price: 95, duration_minutes: 45 },
  { name: 'Brake Inspection & Service', price: 150, duration_minutes: 60 },
  { name: 'Tyre Rotation', price: 60, duration_minutes: 30 },
  { name: 'Full Service', price: 280, duration_minutes: 180 },
  { name: 'Roadworthy Certificate', price: 170, duration_minutes: 90 },
]

export const mechanicDefaultStaff = [
  { name: 'Jim Reyes', role: 'Head Mechanic' },
  { name: 'Tony Walsh', role: 'Auto Electrician' },
  { name: 'Lisa Grant', role: 'Service Advisor' },
]
